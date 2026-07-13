require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");
const {
    downloadImage,
    isNotionFileUrl,
    isVideoUrl,
    hashUrlPath,
    ImageDownloadError
} = require("./lib/download-image");

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const databaseId = process.env.NOTION_DATABASE_ID;
const manualDataSourceId = process.env.NOTION_DATA_SOURCE_ID;

const ROOT_DIR = process.cwd();
const MODULES_JSON_PATH = path.join(ROOT_DIR, "webapp", "model", "modules.json");
const POSTS_ROOT_PATH = path.join(ROOT_DIR, "webapp", "model", "posts");

/* 이미지 로컬화 저장 위치: webapp/media/notion/{module}/{postId}/ */
const MEDIA_ROOT_ABS = path.join(ROOT_DIR, "webapp", "media", "notion");
const MEDIA_ROOT_REL = "media/notion";
const MANIFEST_PATH = path.join(MEDIA_ROOT_ABS, "manifest.json");

/*
 * 이미지 실패 정책:
 * - Published 게시글의 Notion 이미지 다운로드 실패 → build fail (기본)
 * - ALLOW_IMAGE_DOWNLOAD_FAILURE=true 이면 warning으로 완화
 * - 팀원이 직접 입력한 외부 고정 URL은 기본적으로 다운로드하지 않고 원본 유지
 *   (FORCE_LOCALIZE_EXTERNAL_IMAGES=true 이면 외부 URL도 로컬화 시도,
 *    실패 시 원본 URL 유지 + warning)
 */
const ALLOW_IMAGE_DOWNLOAD_FAILURE =
    String(process.env.ALLOW_IMAGE_DOWNLOAD_FAILURE || "").toLowerCase() === "true";
const FORCE_LOCALIZE_EXTERNAL_IMAGES =
    String(process.env.FORCE_LOCALIZE_EXTERNAL_IMAGES || "").toLowerCase() === "true";

/* 게시글 하나의 이미지 총량 권장 제한: 50MB */
const POST_TOTAL_IMAGE_WARN_BYTES = 50 * 1024 * 1024;

/* ============================================================
 * Notion Property Helpers
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

    if (!prop || prop.type !== "rich_text") {
        return "";
    }

    return getPlainText(prop.rich_text).trim();
}

function getSelect(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "select" || !prop.select) {
        return "";
    }

    return (prop.select.name || "").trim();
}

function getMultiSelect(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "multi_select") {
        return [];
    }

    return prop.multi_select.map((item) => item.name).filter(Boolean);
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

function normalizeModuleId(value) {
    return String(value || "").trim().toUpperCase();
}

function normalizePostId(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
}

/* ============================================================
 * Notion Query
 * ============================================================ */

async function getDataSourceIdFromDatabase() {
    if (manualDataSourceId) {
        console.log("[Notion Sync] .env의 NOTION_DATA_SOURCE_ID 사용:", manualDataSourceId);
        return manualDataSourceId;
    }

    if (!notion.databases || !notion.databases.retrieve) {
        throw new Error(
            "Data Source ID 자동 조회가 불가능합니다. .env에 NOTION_DATA_SOURCE_ID를 추가하세요."
        );
    }

    const database = await notion.databases.retrieve({
        database_id: databaseId
    });

    const dataSources = database.data_sources || database.dataSources || [];

    if (!Array.isArray(dataSources) || dataSources.length === 0) {
        throw new Error(
            "Database에서 data_sources를 찾지 못했습니다. .env에 NOTION_DATA_SOURCE_ID를 추가하세요."
        );
    }

    return dataSources[0].id;
}

async function queryPublishedPages() {
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
                database_id: databaseId,
                filter,
                sorts,
                start_cursor: startCursor
            });
        } else if (notion.dataSources && typeof notion.dataSources.query === "function") {
            const dataSourceId = await getDataSourceIdFromDatabase();

            response = await notion.dataSources.query({
                data_source_id: dataSourceId,
                filter,
                sorts,
                start_cursor: startCursor
            });
        } else {
            throw new Error(
                "현재 @notionhq/client에서 databases.query 또는 dataSources.query를 찾지 못했습니다."
            );
        }

        allResults.push(...response.results);

        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
    }

    return allResults;
}

/* ============================================================
 * Notion Body Blocks
 * ============================================================ */

function getBlockText(block) {
    const type = block.type;

    if (!type || !block[type]) {
        return "";
    }

    const data = block[type];

    if (Array.isArray(data.rich_text)) {
        return getPlainText(data.rich_text).trim();
    }

    return "";
}

async function getPageBlocks(pageId) {
    const blocks = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.blocks.children.list({
            block_id: pageId,
            start_cursor: startCursor
        });

        blocks.push(...response.results);

        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
    }

    return blocks;
}

function convertBlocksToSections(blocks) {
    const sections = [];

    let currentSection = null;

    function ensureSection() {
        if (!currentSection) {
            currentSection = {
                heading: "본문",
                body: ""
            };
            sections.push(currentSection);
        }
    }

    blocks.forEach((block) => {
        const type = block.type;
        const text = getBlockText(block);

        if (!text) {
            return;
        }

        if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
            currentSection = {
                heading: text,
                body: ""
            };
            sections.push(currentSection);
            return;
        }

        ensureSection();

        if (type === "bulleted_list_item") {
            currentSection.body += (currentSection.body ? "\n" : "") + "- " + text;
            return;
        }

        if (type === "numbered_list_item") {
            currentSection.body += (currentSection.body ? "\n" : "") + text;
            return;
        }

        currentSection.body += (currentSection.body ? "\n\n" : "") + text;
    });

    return sections.filter((section) => section.heading || section.body);
}

function extractImplementation(sections, fallbackText) {
    const fromProperty = splitToTextArray(fallbackText);

    if (fromProperty.length > 0) {
        return fromProperty;
    }

    const section = sections.find((item) =>
        item.heading &&
        (item.heading.includes("구현") || item.heading.toLowerCase().includes("implementation"))
    );

    if (!section || !section.body) {
        return [];
    }

    return section.body
        .split(/\n/)
        .map((line) => line.replace(/^-\s*/, "").trim())
        .filter(Boolean)
        .map((line) => ({ text: line }));
}

function extractTroubleShooting(sections) {
    const section = sections.find((item) =>
        item.heading &&
        (item.heading.includes("트러블") || item.heading.toLowerCase().includes("trouble"))
    );

    if (!section || !section.body) {
        return [];
    }

    return [
        {
            title: "트러블슈팅",
            problem: section.body,
            solution: ""
        }
    ];
}

/*
 * 본문 블록 중 image block과 이미지 확장자를 가진 file block을 추출한다.
 * 현재 UI는 본문 이미지를 렌더링하지 않지만(별도 작업),
 * 로컬화 가능한 구조를 미리 준비해 postJson.bodyImages에 담아둔다.
 */
function extractBodyImageBlocks(blocks) {
    const images = [];

    blocks.forEach((block) => {
        if (block.type === "image" && block.image) {
            const data = block.image;
            const url =
                (data.type === "file" && data.file && data.file.url) ||
                (data.type === "external" && data.external && data.external.url) ||
                "";

            if (url) {
                images.push({
                    url,
                    caption: getPlainText(data.caption || []).trim(),
                    isNotionHosted: data.type === "file"
                });
            }

            return;
        }

        if (block.type === "file" && block.file) {
            const data = block.file;
            const url =
                (data.type === "file" && data.file && data.file.url) ||
                (data.type === "external" && data.external && data.external.url) ||
                "";

            /* file block은 확장자가 이미지일 때만 이미지로 취급 */
            if (url && /\.(png|jpe?g|gif|webp|avif|bmp)(\?|$)/i.test(url)) {
                images.push({
                    url,
                    caption: getPlainText(data.caption || []).trim(),
                    isNotionHosted: data.type === "file"
                });
            }
        }
    });

    return images;
}

/* ============================================================
 * Image Localization
 * ============================================================ */

function toWebPath() {
    /* JSON에는 항상 forward slash 경로만 저장 (Windows \\ 금지) */
    return Array.prototype.slice.call(arguments).join("/");
}

function cleanPostMediaDir(moduleId, postId) {
    const dirAbs = path.join(MEDIA_ROOT_ABS, moduleId, postId);

    fs.rmSync(dirAbs, { recursive: true, force: true });
    fs.mkdirSync(dirAbs, { recursive: true });

    return dirAbs;
}

/*
 * URL 1건을 로컬화한다.
 *
 * 반환:
 * - { localPath, entry }  : 로컬화 성공 (JSON에는 localPath 사용)
 * - { keepOriginal: true }: 로컬화 대상 아님 → 원본 URL 유지
 * - { skip: true }        : 항목 제거 (SVG 등)
 * - 실패 시 failures 배열에 기록하고, Notion URL이면 fatal로 표시
 */
async function localizeSingleUrl(options) {
    const { url, moduleId, postId, fieldName, index, destDirAbs, baseName, failures } = options;
    const context = `${moduleId}/${postId} ${fieldName}[${index}]`;

    if (isVideoUrl(url)) {
        console.warn(`[Notion Sync][WARN] ${context}: 영상 URL은 이미지로 처리하지 않습니다. 원본 유지: ${url}`);
        return { keepOriginal: true };
    }

    const notionHosted = isNotionFileUrl(url);

    if (!notionHosted && !FORCE_LOCALIZE_EXTERNAL_IMAGES) {
        /* 외부 고정 URL은 기본적으로 그대로 사용 */
        return { keepOriginal: true };
    }

    try {
        const result = await downloadImage({
            url,
            destDirAbs,
            baseName,
            context
        });

        const localPath = toWebPath(MEDIA_ROOT_REL, moduleId, postId, result.fileName);

        return {
            localPath,
            entry: {
                module: moduleId,
                postId,
                fieldName,
                originalHost: result.host,
                originalPathHash: hashUrlPath(url),
                localPath,
                size: result.size,
                contentType: result.contentType,
                downloadedAt: new Date().toISOString()
            }
        };
    } catch (error) {
        if (error instanceof ImageDownloadError && error.code === "SVG_SKIPPED") {
            console.warn(`[Notion Sync][WARN] ${error.message}`);
            return { skip: true };
        }

        if (!notionHosted) {
            /* 외부 URL 로컬화 실패는 원본 유지로 완화 */
            console.warn(`[Notion Sync][WARN] 외부 이미지 로컬화 실패, 원본 URL 유지: ${context} / ${error.message}`);
            return { keepOriginal: true };
        }

        failures.push({
            context,
            message: error.message,
            code: error instanceof ImageDownloadError ? error.code : "UNKNOWN"
        });

        return { skip: true };
    }
}

/*
 * 게시글 하나의 이미지 전체(screenshots / thumbnailUrl / 본문 이미지)를 로컬화한다.
 * postJson을 직접 수정하며, manifest entry 배열을 반환한다.
 */
async function localizePostImages(postJson, bodyImageBlocks, failures) {
    const moduleId = postJson.moduleId;
    const postId = postJson.postId;
    const destDirAbs = cleanPostMediaDir(moduleId, postId);
    const entries = [];

    let totalBytes = 0;

    function track(result) {
        if (result.entry) {
            entries.push(result.entry);
            totalBytes += result.entry.size || 0;
        }
    }

    /* 1. ScreenUrls → screenshots */
    const localizedScreenshots = [];

    for (let i = 0; i < postJson.screenshots.length; i++) {
        const item = postJson.screenshots[i];
        const result = await localizeSingleUrl({
            url: item.url,
            moduleId,
            postId,
            fieldName: "screenUrls",
            index: i,
            destDirAbs,
            baseName: "screen-" + String(i + 1).padStart(3, "0"),
            failures
        });

        track(result);

        if (result.localPath) {
            localizedScreenshots.push({ url: result.localPath, title: item.title });
        } else if (result.keepOriginal) {
            localizedScreenshots.push(item);
        }
        /* result.skip → 항목 제거 */
    }

    postJson.screenshots = localizedScreenshots;

    /* 2. ThumbnailUrl */
    if (postJson.thumbnailUrl) {
        const result = await localizeSingleUrl({
            url: postJson.thumbnailUrl,
            moduleId,
            postId,
            fieldName: "thumbnailUrl",
            index: 0,
            destDirAbs,
            baseName: "thumb-001",
            failures
        });

        track(result);

        if (result.localPath) {
            postJson.thumbnailUrl = result.localPath;
        } else if (result.skip) {
            postJson.thumbnailUrl = "";
        }
        /* keepOriginal → 기존 외부 URL 유지 */
    }

    /* 3. 본문 image/file block (현재 UI 미렌더링, 데이터만 준비) */
    const localizedBodyImages = [];

    for (let i = 0; i < bodyImageBlocks.length; i++) {
        const item = bodyImageBlocks[i];
        const result = await localizeSingleUrl({
            url: item.url,
            moduleId,
            postId,
            fieldName: "bodyImages",
            index: i,
            destDirAbs,
            baseName: "body-" + String(i + 1).padStart(3, "0"),
            failures
        });

        track(result);

        if (result.localPath) {
            localizedBodyImages.push({ url: result.localPath, caption: item.caption });
        } else if (result.keepOriginal) {
            localizedBodyImages.push({ url: item.url, caption: item.caption });
        }
    }

    postJson.bodyImages = localizedBodyImages;

    if (totalBytes > POST_TOTAL_IMAGE_WARN_BYTES) {
        console.warn(
            `[Notion Sync][WARN] ${moduleId}/${postId}: 게시글 이미지 총량이 ${Math.round(totalBytes / 1024 / 1024)}MB로 ` +
            "권장 한도(50MB)를 초과했습니다. Notion 이미지 축소를 권장합니다."
        );
    }

    return entries;
}

/*
 * manifest.json 갱신.
 * 이번 sync에서 처리한 게시글의 entry만 교체하고, 나머지는 보존한다.
 * 원본 URL 전체(서명 쿼리 포함)는 저장하지 않는다 — host와 pathname hash만 기록.
 */
function updateManifest(allEntries, syncedPostKeys) {
    let manifest = { generatedAt: "", images: [] };

    if (fs.existsSync(MANIFEST_PATH)) {
        try {
            manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
        } catch (e) {
            console.warn("[Notion Sync][WARN] manifest.json 파싱 실패, 새로 생성합니다.");
            manifest = { generatedAt: "", images: [] };
        }
    }

    const preserved = (manifest.images || []).filter(
        (entry) => !syncedPostKeys.has(`${entry.module}/${entry.postId}`)
    );

    manifest.generatedAt = new Date().toISOString();
    manifest.images = preserved.concat(allEntries);

    fs.mkdirSync(MEDIA_ROOT_ABS, { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

    console.log("[Notion Sync] media manifest 갱신:", MANIFEST_PATH, `(이미지 ${manifest.images.length}건)`);
}

/* ============================================================
 * JSON Generation
 * ============================================================ */

function createPostJson(page, sections) {
    const moduleId = normalizeModuleId(getSelect(page, "Module"));
    const postId = normalizePostId(getRichText(page, "PostId"));

    const processText = getRichText(page, "Process");
    const tablesText = getRichText(page, "Tables");
    const implementationText = getRichText(page, "Implementation");

    return {
        moduleId,
        postId,
        title: getTitle(page, "Title"),
        subtitle: getRichText(page, "Subtitle"),
        owner: getRichText(page, "Owner"),
        status: getSelect(page, "Status"),
        order: getNumber(page, "Order"),
        videoUrl: getUrl(page, "VideoUrl"),
        thumbnailUrl: getUrl(page, "ThumbnailUrl"),
        summary: getRichText(page, "Summary"),
        tags: getMultiSelect(page, "Tags"),
        process: splitToTextArray(processText),
        implementation: extractImplementation(sections, implementationText),
        tables: splitToTextArray(tablesText),
        sections,
        troubleShooting: extractTroubleShooting(sections),
        screenshots: splitToUrlArray(getRichText(page, "ScreenUrls")),
        bodyImages: []
    };
}

function createPostListItem(postJson) {
    return {
        id: postJson.postId,
        title: postJson.title,
        summary: postJson.summary,
        owner: postJson.owner,
        thumbnail: postJson.thumbnailUrl || "",
        tags: postJson.tags || [],
        order: postJson.order || 0
    };
}

function writePostJson(postJson) {
    const moduleDir = path.join(POSTS_ROOT_PATH, postJson.moduleId);
    const filePath = path.join(moduleDir, `${postJson.postId}.json`);

    fs.mkdirSync(moduleDir, { recursive: true });

    fs.writeFileSync(
        filePath,
        JSON.stringify(postJson, null, 2),
        "utf8"
    );

    console.log("[Notion Sync] 게시글 JSON 생성:", filePath);
}

function loadModulesData() {
    if (!fs.existsSync(MODULES_JSON_PATH)) {
        return { modules: {} };
    }

    try {
        return JSON.parse(fs.readFileSync(MODULES_JSON_PATH, "utf8"));
    } catch (e) {
        console.warn("[Notion Sync][WARN] modules.json 파싱 실패:", e.message);
        return { modules: {} };
    }
}

function updateModulesJson(postListByModule) {
    if (!fs.existsSync(MODULES_JSON_PATH)) {
        throw new Error("modules.json을 찾지 못했습니다: " + MODULES_JSON_PATH);
    }

    const modulesData = JSON.parse(fs.readFileSync(MODULES_JSON_PATH, "utf8"));

    if (!modulesData.modules) {
        modulesData.modules = {};
    }

    /* 모든 모듈의 posts를 이번 sync 결과로 재설정 (잔여 목록 제거) */
    Object.keys(modulesData.modules).forEach((moduleId) => {
        modulesData.modules[moduleId].posts = [];
    });

    Object.keys(postListByModule).forEach((moduleId) => {
        if (!modulesData.modules[moduleId]) {
            /* main에서 이미 건너뛰므로 도달하지 않지만 방어적으로 무시 */
            return;
        }

        modulesData.modules[moduleId].posts = postListByModule[moduleId]
            .sort((a, b) => {
                if (a.order !== b.order) {
                    return a.order - b.order;
                }

                return a.title.localeCompare(b.title);
            });
    });

    fs.writeFileSync(
        MODULES_JSON_PATH,
        JSON.stringify(modulesData, null, 2),
        "utf8"
    );

    console.log("[Notion Sync] modules.json posts 목록 갱신 완료");
}

/* ============================================================
 * Main
 * ============================================================ */

async function main() {
    if (!process.env.NOTION_API_KEY) {
        throw new Error("NOTION_API_KEY가 없습니다. .env 파일을 확인하세요.");
    }

    if (!databaseId) {
        throw new Error("NOTION_DATABASE_ID가 없습니다. .env 파일을 확인하세요.");
    }

    console.log("[Notion Sync] Published 게시글 조회 시작");

    /*
     * 단일 소스 원칙: Modules DB(→ modules.json)에 등록된 모듈의 게시글만 생성.
     * notion:modules가 먼저 실행되므로 modules.json은 Notion 기준 최신 상태다.
     */
    const registeredModules = new Set(
        Object.keys((loadModulesData() || {}).modules || {})
    );

    /* 이전 sync의 잔여 게시글 JSON 제거 (미등록 모듈 잔재가 검증을 깨지 않도록) */
    fs.rmSync(POSTS_ROOT_PATH, { recursive: true, force: true });
    fs.mkdirSync(POSTS_ROOT_PATH, { recursive: true });

    const pages = await queryPublishedPages();

    console.log("[Notion Sync] Published 게시글 수:", pages.length);

    const postListByModule = {};
    const imageFailures = [];
    const manifestEntries = [];
    const syncedPostKeys = new Set();

    for (const page of pages) {
        const moduleId = normalizeModuleId(getSelect(page, "Module"));
        const postId = normalizePostId(getRichText(page, "PostId"));

        if (!moduleId || !postId) {
            console.warn("[Notion Sync] Module 또는 PostId가 없어 건너뜀:", page.id);
            continue;
        }

        if (!registeredModules.has(moduleId)) {
            console.warn(
                `[Notion Sync][WARN] ${moduleId}/${postId}: Modules DB에 등록되지 않은 모듈이라 건너뜁니다. ` +
                "표출하려면 Notion Modules DB에 해당 모듈을 Published로 등록하세요."
            );
            continue;
        }

        const blocks = await getPageBlocks(page.id);
        const sections = convertBlocksToSections(blocks);
        const bodyImageBlocks = extractBodyImageBlocks(blocks);
        const postJson = createPostJson(page, sections);

        /*
         * 이미지 로컬화:
         * Notion 임시 URL을 다운로드해 webapp/media/notion/{module}/{postId}/에 저장하고
         * JSON에는 로컬 정적 경로(media/notion/...)를 넣는다.
         */
        const entries = await localizePostImages(postJson, bodyImageBlocks, imageFailures);

        manifestEntries.push(...entries);
        syncedPostKeys.add(`${moduleId}/${postId}`);

        writePostJson(postJson);

        if (!postListByModule[moduleId]) {
            postListByModule[moduleId] = [];
        }

        postListByModule[moduleId].push(createPostListItem(postJson));
    }

    updateManifest(manifestEntries, syncedPostKeys);

    /*
     * 실패 정책:
     * Published 게시글의 Notion 이미지 다운로드 실패는 기본적으로 build fail.
     * ALLOW_IMAGE_DOWNLOAD_FAILURE=true 로만 완화 가능.
     */
    if (imageFailures.length > 0) {
        imageFailures.forEach((failure) => {
            console.error(`[Notion Sync][IMAGE ERROR] ${failure.context}: ${failure.message}`);
        });

        if (!ALLOW_IMAGE_DOWNLOAD_FAILURE) {
            throw new Error(
                `Published 게시글의 Notion 이미지 ${imageFailures.length}건 다운로드에 실패했습니다. ` +
                "Notion에서 이미지 상태를 확인한 뒤 sync를 다시 실행하세요. " +
                "(일시적으로 무시하려면 ALLOW_IMAGE_DOWNLOAD_FAILURE=true)"
            );
        }

        console.warn(
            `[Notion Sync][WARN] ALLOW_IMAGE_DOWNLOAD_FAILURE=true 설정으로 이미지 실패 ${imageFailures.length}건을 무시하고 진행합니다. ` +
            "해당 이미지는 화면에 표시되지 않습니다."
        );
    }

    updateModulesJson(postListByModule);

    console.log("[Notion Sync] 완료");
}

main().catch((error) => {
    console.error("[Notion Sync] 실패:", error.body || error.message || error);
    process.exit(1);
});

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
            title: "화면 캡처 " + (index + 1)
        }));
}
