require("dotenv").config();

const { Client } = require("@notionhq/client");

const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

const databaseId = process.env.NOTION_DATABASE_ID;
const manualDataSourceId = process.env.NOTION_DATA_SOURCE_ID;

/* ============================================================
 * Notion Property Helper
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

    return getPlainText(prop.title);
}

function getRichText(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "rich_text") {
        return "";
    }

    return getPlainText(prop.rich_text);
}

function getSelect(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "select" || !prop.select) {
        return "";
    }

    return prop.select.name || "";
}

function getMultiSelect(page, propertyName) {
    const prop = page.properties[propertyName];

    if (!prop || prop.type !== "multi_select") {
        return [];
    }

    return prop.multi_select.map((item) => item.name);
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

/* ============================================================
 * Query Helper
 * - 구버전: notion.databases.query
 * - 신버전: notion.dataSources.query
 * ============================================================ */

async function getDataSourceIdFromDatabase(databaseId) {
    if (manualDataSourceId) {
        console.log("[Notion Test] .env의 NOTION_DATA_SOURCE_ID 사용:", manualDataSourceId);
        return manualDataSourceId;
    }

    if (!notion.databases || !notion.databases.retrieve) {
        throw new Error(
            "현재 SDK에서 notion.databases.retrieve를 사용할 수 없습니다. .env에 NOTION_DATA_SOURCE_ID를 직접 추가해야 합니다."
        );
    }

    console.log("[Notion Test] Database에서 Data Source ID 조회 중...");

    const database = await notion.databases.retrieve({
        database_id: databaseId
    });

    const dataSources =
        database.data_sources ||
        database.dataSources ||
        [];

    if (!Array.isArray(dataSources) || dataSources.length === 0) {
        console.log("[Notion Test] database retrieve 결과:", JSON.stringify(database, null, 2));

        throw new Error(
            "Database 안에서 data_sources를 찾지 못했습니다. .env에 NOTION_DATA_SOURCE_ID를 직접 추가해야 합니다."
        );
    }

    const dataSourceId = dataSources[0].id;

    console.log("[Notion Test] Data Source ID 자동 감지:", dataSourceId);

    return dataSourceId;
}

async function queryPublishedRows() {
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

    /*
     * 구버전 SDK 대응
     */
    if (notion.databases && typeof notion.databases.query === "function") {
        console.log("[Notion Test] 구버전 방식 사용: notion.databases.query");

        return notion.databases.query({
            database_id: databaseId,
            filter: filter,
            sorts: sorts
        });
    }

    /*
     * 신버전 SDK 대응
     */
    if (notion.dataSources && typeof notion.dataSources.query === "function") {
        console.log("[Notion Test] 신버전 방식 사용: notion.dataSources.query");

        const dataSourceId = await getDataSourceIdFromDatabase(databaseId);

        return notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: filter,
            sorts: sorts
        });
    }

    console.log("[Notion Test] 현재 notion client keys:", Object.keys(notion));

    throw new Error(
        "현재 설치된 @notionhq/client에서 databases.query 또는 dataSources.query를 찾지 못했습니다."
    );
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

    console.log("[Notion Test] Database ID:", databaseId);

    const response = await queryPublishedRows();

    console.log("[Notion Test] Published 게시글 수:", response.results.length);

    response.results.forEach((page, index) => {
        const row = {
            no: index + 1,
            module: getSelect(page, "Module"),
            postId: getRichText(page, "PostId"),
            title: getTitle(page, "Title"),
            subtitle: getRichText(page, "Subtitle"),
            summary: getRichText(page, "Summary"),
            owner: getRichText(page, "Owner"),
            status: getSelect(page, "Status"),
            order: getNumber(page, "Order"),
            videoUrl: getUrl(page, "VideoUrl"),
            thumbnailUrl: getUrl(page, "ThumbnailUrl"),
            tags: getMultiSelect(page, "Tags")
        };

        console.log(row);
    });
}

main().catch((error) => {
    console.error("[Notion Test] 실패:", error.body || error.message || error);
    process.exit(1);
});