require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const modulesDatabaseId = process.env.NOTION_MODULES_DATABASE_ID;

const ROOT_DIR = process.cwd();
const MODULES_JSON_PATH = path.join(ROOT_DIR, "webapp", "model", "modules.json");

const VALID_MODULES = ["OV", "FI", "CO", "MM", "SD", "PP", "HR", "RP"];

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

        subtitle: getRichText(page, "Subtitle"),
        eyebrow: getRichText(page, "Eyebrow") || "ERP MODULE",
        owner: getRichText(page, "Owner"),
        process: getRichText(page, "Process"),
        description: getRichText(page, "Description"),
        videoLabel: getRichText(page, "VideoLabel") || `${code} 시연 영상`,
        videoUrl: getUrl(page, "VideoUrl"),
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

    pages.forEach((page) => {
        const code = normalizeModuleId(getSelectOrText(page, "Code"));

        if (!code) {
            console.warn("[Notion Modules Sync] Code가 없어 건너뜀:", page.id);
            return;
        }

        if (!VALID_MODULES.includes(code)) {
            console.warn("[Notion Modules Sync] 알 수 없는 모듈 코드:", code);
        }

        const existingModule = existingData.modules[code];

        nextModules[code] = createModuleJson(page, existingModule);

        console.log("[Notion Modules Sync] 모듈 반영:", code, nextModules[code].title);
    });

    /*
     * Notion Modules DB에 아직 없는 모듈은 기존 modules.json에서 보존한다.
     * 즉, 한 번에 다 안 옮겨도 안전하다.
     */
    Object.keys(existingData.modules).forEach((code) => {
        if (!nextModules[code]) {
            nextModules[code] = existingData.modules[code];
            console.log("[Notion Modules Sync] 기존 모듈 보존:", code);
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