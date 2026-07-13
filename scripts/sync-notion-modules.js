require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");
const {
    downloadImage,
    isNotionFileUrl,
    isVideoUrl,
    ImageDownloadError
} = require("./lib/download-image");

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const modulesDatabaseId = process.env.NOTION_MODULES_DATABASE_ID;

const ROOT_DIR = process.cwd();
const MODULES_JSON_PATH = path.join(ROOT_DIR, "webapp", "model", "modules.json");

/* 모듈 이미지 로컬화 저장 위치: webapp/media/notion/{CODE}/_module/ */
const MEDIA_ROOT_ABS = path.join(ROOT_DIR, "webapp", "media", "notion");
const MEDIA_ROOT_REL = "media/notion";
const MODULE_MEDIA_SEGMENT = "_module";

/* 게시글 sync와 동일한 이미지 실패 정책 */
const ALLOW_IMAGE_DOWNLOAD_FAILURE =
    String(process.env.ALLOW_IMAGE_DOWNLOAD_FAILURE || "").toLowerCase() === "true";
const FORCE_LOCALIZE_EXTERNAL_IMAGES =
    String(process.env.FORCE_LOCALIZE_EXTERNAL_IMAGES || "").toLowerCase() === "true";

/* ============================================================
 * Property Helpers
 * ============================================================ */

function getPlainText(richTextArray) {
    if (!Array.isArray(richTextArray)) {
        return "";
    }

    return richTextArray.map((item) => item.plain_text || "").join("");
}

function getTitle(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "title") {
        return "";
    }

    return getPlainText(prop.title).trim();
}

function getRichText(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop) {
        return "";
    }

    if (prop.type === "rich_text") {
        return getPlainText(prop.rich_text).trim();
    }

    if (prop.type === "title") {
        return getPlainText(prop.title).trim();
    }

    return "";
}

function getSelectOrText(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop) {
        return "";
    }

    if (prop.type === "select" && prop.select) {
        return (prop.select.name || "").trim();
    }

    if (prop.type === "rich_text") {
        return getPlainText(prop.rich_text).trim();
    }

    if (prop.type === "title") {
        return getPlainText(prop.title).trim();
    }

    return "";
}

function getUrl(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "url") {
        return "";
    }

    return prop.url || "";
}

function getNumber(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "number") {
        return 0;
    }

    return prop.number || 0;
}

function normalizeModuleId(value) {
    return String(value || "").trim().toUpperCase();
}

function splitToTextArray(value) {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/\n|,|→|>/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ text: item }));
}

function splitToUrlArray(value) {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((url, index) => ({
            url: url,
            title: "화면 " + (index + 1)
        }));
}

/* ============================================================
 * Module Image Localization
 * ============================================================ */

function toWebPath() {
    /* JSON에는 항상 forward slash 경로만 저장 */
    return Array.prototype.slice.call(arguments).join("/");
}

function cleanModuleMediaDir(code) {
    const dirAbs = path.join(MEDIA_ROOT_ABS, code, MODULE_MEDIA_SEGMENT);

    fs.rmSync(dirAbs, { recursive: true, force: true });
    fs.mkdirSync(dirAbs, { recursive: true });

    return dirAbs;
}

/*
 * 모듈 ScreenUrls 이미지를 로컬화한다 (게시글 sync와 동일 정책):
 * - Notion 임시 URL → 다운로드 후 media/notion/{CODE}/_module/에 저장
 * - 외부 고정 URL → 기본적으로 원본 유지 (FORCE_LOCALIZE_EXTERNAL_IMAGES=true면 로컬화 시도)
 * - 영상 URL/SVG → 항목 제외 또는 원본 유지
 * - Notion 이미지 실패 → failures 기록 (기본 build fail)
 */
async function localizeModuleScreenshots(moduleJson, failures) {
    const code = moduleJson.code;
    const screenshots = moduleJson.screenshots || [];

    if (screenshots.length === 0) {
        return;
    }

    const destDirAbs = cleanModuleMediaDir(code);
    const localized = [];

    for (let i = 0; i < screenshots.length; i++) {
        const item = screenshots[i];
        const context = `${code}/${MODULE_MEDIA_SEGMENT} screenUrls[${i}]`;

        if (isVideoUrl(item.url)) {
            console.warn(`[Notion Modules Sync][WARN] ${context}: 영상 URL은 이미지로 처리하지 않습니다. 원본 유지`);
            localized.push(item);
            continue;
        }

        const notionHosted = isNotionFileUrl(item.url);

        if (!notionHosted && !FORCE_LOCALIZE_EXTERNAL_IMAGES) {
            localized.push(item);
            continue;
        }

        try {
            const result = await downloadImage({
                url: item.url,
                destDirAbs,
                baseName: "screen-" + String(i + 1).padStart(3, "0"),
                context
            });

            localized.push({
                url: toWebPath(MEDIA_ROOT_REL, code, MODULE_MEDIA_SEGMENT, result.fileName),
                title: item.title
            });
        } catch (error) {
            if (error instanceof ImageDownloadError && error.code === "SVG_SKIPPED") {
                console.warn(`[Notion Modules Sync][WARN] ${error.message}`);
                continue;
            }

            if (!notionHosted) {
                console.warn(`[Notion Modules Sync][WARN] 외부 이미지 로컬화 실패, 원본 URL 유지: ${context} / ${error.message}`);
                localized.push(item);
                continue;
            }

            failures.push({ context, message: error.message });
        }
    }

    moduleJson.screenshots = localized;
}

/* ============================================================
 * Query Helpers
 * ============================================================ */

async function getDataSourceIdFromDatabase(databaseId) {
    if (!notion.databases || !notion.databases.retrieve) {
        throw new Error("Data Source ID 자동 조회가 불가능합니다.");
    }

    const database = await notion.databases.retrieve({
        database_id: databaseId
    });

    const dataSources = database.data_sources || database.dataSources || [];

    if (!Array.isArray(dataSources) || dataSources.length === 0) {
        throw new Error("Modules DB에서 data_sources를 찾지 못했습니다.");
    }

    return dataSources[0].id;
}

async function queryPublishedModules() {
    const filter = {
        property: "Status",
        select: {
            equals: "Published"
        }
    };

    const sorts = [
        {
            property: "Order",
            direction: "ascending"
        }
    ];

    const allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        let response;

        if (notion.databases && typeof notion.databases.query === "function") {
            response = await notion.databases.query({
                database_id: modulesDatabaseId,
                filter,
                sorts,
                start_cursor: startCursor
            });
        } else if (notion.dataSources && typeof notion.dataSources.query === "function") {
            const dataSourceId = await getDataSourceIdFromDatabase(modulesDatabaseId);

            response = await notion.dataSources.query({
                data_source_id: dataSourceId,
                filter,
                sorts,
                start_cursor: startCursor
            });
        } else {
            throw new Error("Notion query 함수를 찾지 못했습니다.");
        }

        allResults.push(...response.results);

        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
    }

    return allResults;
}

/* ============================================================
 * modules.json Generation
 * ============================================================ */

function createModuleJson(page, existingModule) {
    const code = normalizeModuleId(getSelectOrText(page, "Code"));

    const title =
        getTitle(page, "Title") ||
        getTitle(page, "Name") ||
        getRichText(page, "Title") ||
        getRichText(page, "Name") ||
        code;

    return {
        code,
        title,

        /*
         * 분류 메타데이터 (Modules DB 선택 속성):
         * - Domain[select]      : "SAP"(기본) 또는 "LEGACY" → 사이드바 그룹 분리
         * - DisplayName[rich_text]: 사이드바 표기명 (없으면 code+subtitle 조합)
         * - Order[number]       : 표시 순서 (없으면 Notion 정렬 순서 유지)
         */
        domain: normalizeModuleId(getSelectOrText(page, "Domain")) || "SAP",
        displayName: getRichText(page, "DisplayName"),
        order: getNumber(page, "Order"),

        /*
         * 대분류 그룹 (Modules DB 선택 속성):
         * - Group[select]     : "SAP S/4HANA" / "NON-SAP SYSTEM" 등 사이드바 대분류.
         *                       없으면 UI에서 "SAP S/4HANA"로 폴백 (기존 데이터 호환)
         * - GroupOrder[number]: 대분류 정렬 (SAP=10, NON-SAP=20 권장)
         * 새 Group 값을 Notion에 추가하면 소스 수정 없이 사이드바에 자동 반영된다.
         */
        group: getSelectOrText(page, "Group").trim(),
        groupOrder: getNumber(page, "GroupOrder"),

        subtitle: getRichText(page, "Subtitle"),
        eyebrow: getRichText(page, "Eyebrow") || "ERP MODULE",
        owner: getRichText(page, "Owner"),
        process: getRichText(page, "Process"),
        description: getRichText(page, "Description"),
        videoLabel: getRichText(page, "VideoLabel") || `${code} 시연 영상`,
        videoUrl: getUrl(page, "VideoUrl"),
        /* ScreenUrls[rich_text]: 줄바꿈/쉼표 구분 이미지 URL → 빌드 시 로컬화 */
        screenshots: splitToUrlArray(getRichText(page, "ScreenUrls")),

        features: splitToTextArray(getRichText(page, "Features")),
        techPoints: splitToTextArray(getRichText(page, "TechPoints")),
        tables: splitToTextArray(getRichText(page, "Tables")),

        /*
         * 중요:
         * Posts DB 동기화가 넣어둔 posts 목록은 보존한다.
         */
        posts: existingModule && Array.isArray(existingModule.posts)
            ? existingModule.posts
            : []
    };
}

function loadExistingModulesData() {
    if (!fs.existsSync(MODULES_JSON_PATH)) {
        return {
            modules: {}
        };
    }

    return JSON.parse(fs.readFileSync(MODULES_JSON_PATH, "utf8"));
}

function writeModulesJson(modulesData) {
    fs.writeFileSync(
        MODULES_JSON_PATH,
        JSON.stringify(modulesData, null, 2),
        "utf8"
    );

    console.log("[Notion Modules Sync] modules.json 갱신 완료:", MODULES_JSON_PATH);
}

/* ============================================================
 * Main
 * ============================================================ */

async function main() {
    if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY가 없습니다.");
    }

    if (!modulesDatabaseId) {
        throw new Error("NOTION_MODULES_DATABASE_ID가 없습니다. .env를 확인하세요.");
    }

    console.log("[Notion Modules Sync] Published 모듈 조회 시작");

    const pages = await queryPublishedModules();

    console.log("[Notion Modules Sync] Published 모듈 수:", pages.length);

    const existingData = loadExistingModulesData();

    if (!existingData.modules) {
        existingData.modules = {};
    }

    const nextModules = {};
    const imageFailures = [];

    for (const page of pages) {
        const code = normalizeModuleId(getSelectOrText(page, "Code"));

        if (!code) {
            console.warn("[Notion Modules Sync] Code가 없어 건너뜀:", page.id);
            continue;
        }

        const existingModule = existingData.modules[code];
        const moduleJson = createModuleJson(page, existingModule);

        /* ScreenUrls 이미지 로컬화 (Notion 임시 URL → media/notion/{CODE}/_module/) */
        await localizeModuleScreenshots(moduleJson, imageFailures);

        nextModules[code] = moduleJson;

        console.log("[Notion Modules Sync] 모듈 반영:", code, moduleJson.title,
            moduleJson.screenshots.length ? `(이미지 ${moduleJson.screenshots.length}건)` : "");
    }

    if (imageFailures.length > 0) {
        imageFailures.forEach((failure) => {
            console.error(`[Notion Modules Sync][IMAGE ERROR] ${failure.context}: ${failure.message}`);
        });

        if (!ALLOW_IMAGE_DOWNLOAD_FAILURE) {
            throw new Error(
                `모듈 ScreenUrls 이미지 ${imageFailures.length}건 다운로드에 실패했습니다. ` +
                "Notion에서 이미지 상태를 확인한 뒤 sync를 다시 실행하세요. " +
                "(일시적으로 무시하려면 ALLOW_IMAGE_DOWNLOAD_FAILURE=true)"
            );
        }

        console.warn(
            `[Notion Modules Sync][WARN] ALLOW_IMAGE_DOWNLOAD_FAILURE=true 설정으로 이미지 실패 ${imageFailures.length}건을 무시합니다.`
        );
    }

    /*
     * 단일 소스 원칙: Notion Modules DB에서 Published인 모듈만 사이트에 표출한다.
     * (과거 씨드/이관용 modules.json 항목은 더 이상 보존하지 않음)
     */
    Object.keys(existingData.modules).forEach((code) => {
        if (!nextModules[code]) {
            console.log("[Notion Modules Sync] Notion에 없는 모듈 제거:", code);
        }
    });

    existingData.modules = nextModules;

    writeModulesJson(existingData);

    console.log("[Notion Modules Sync] 완료");
}

main().catch((error) => {
    console.error("[Notion Modules Sync] 실패:", error.body || error.message || error);
    process.exit(1);
});