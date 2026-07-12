const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const MODULES_JSON_PATH = path.join(ROOT_DIR, "webapp", "model", "modules.json");
const POSTS_ROOT_PATH = path.join(ROOT_DIR, "webapp", "model", "posts");

const VALID_MODULES = ["OV", "FI", "CO", "MM", "SD", "PP", "HR", "RP"];

/*
 * Notion 임시 파일 URL 패턴.
 * 이 URL이 JSON에 남아 있으면 배포 후 약 1시간 뒤 이미지가 깨진다.
 * 반드시 sync 단계에서 로컬화(media/notion/...)되어 있어야 한다.
 */
const NOTION_TEMP_URL_PATTERNS = [
    "secure.notion-static.com",
    "prod-files-secure",
    "amazonaws.com",
    "file.notion.so",
    "notionusercontent.com"
];

let errorCount = 0;
let warningCount = 0;

function isNotionTempUrl(value) {
    const lower = String(value || "").toLowerCase();
    return NOTION_TEMP_URL_PATTERNS.some((pattern) => lower.includes(pattern));
}

function isLocalMediaPath(value) {
    return String(value || "").startsWith("media/");
}

/*
 * 이미지 경로 1건 검증.
 * - Notion 임시 URL 잔존 → error (재sync 필요)
 * - Windows 역슬래시 → error
 * - media/ 로컬 경로 → 실제 파일 존재 확인, 없으면 error
 * - 그 외 http(s) 외부 고정 URL → 허용
 */
function validateImagePath(label, fieldLabel, value) {
    if (!isNonEmptyString(value)) {
        return;
    }

    if (value.includes("\\")) {
        logError(`${label}: ${fieldLabel} contains Windows path separator "\\". Use "/" only: ${value}`);
        return;
    }

    if (isNotionTempUrl(value)) {
        logError(
            `${label}: Notion temporary image URL remained in JSON (${fieldLabel}). ` +
            `Run "npm run notion:sync" again to localize images.`
        );
        return;
    }

    if (isLocalMediaPath(value)) {
        const fileAbs = path.join(ROOT_DIR, "webapp", value);

        if (!fs.existsSync(fileAbs)) {
            logError(`${label}: ${fieldLabel} points to missing local file: ${value}`);
        }

        return;
    }

    if (!/^https?:\/\//i.test(value)) {
        logWarning(`${label}: ${fieldLabel} is neither a local media path nor an absolute URL: ${value}`);
    }
}

function logError(message) {
    errorCount++;
    console.error("[Content Validate][ERROR] " + message);
}

function logWarning(message) {
    warningCount++;
    console.warn("[Content Validate][WARN] " + message);
}

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        logError("JSON 파싱 실패: " + filePath + " / " + error.message);
        return null;
    }
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function validatePostFile(filePath) {
    const post = readJson(filePath);

    if (!post) {
        return;
    }

    const label = `${post.moduleId || "NO_MODULE"}/${post.postId || path.basename(filePath)}`;

    if (!isNonEmptyString(post.moduleId)) {
        logError(`${filePath}: moduleId가 없습니다.`);
    } else if (!VALID_MODULES.includes(post.moduleId)) {
        logError(`${label}: moduleId가 유효하지 않습니다. 현재값=${post.moduleId}`);
    }

    if (!isNonEmptyString(post.postId)) {
        logError(`${label}: postId가 없습니다.`);
    }

    if (!isNonEmptyString(post.title)) {
        logError(`${label}: title이 없습니다.`);
    }

    if (!isNonEmptyString(post.subtitle)) {
        logWarning(`${label}: subtitle이 없습니다.`);
    }

    if (!isNonEmptyString(post.summary)) {
        logError(`${label}: summary가 없습니다.`);
    }

    if (!isNonEmptyString(post.owner)) {
        logWarning(`${label}: owner가 없습니다.`);
    }

    if (!Array.isArray(post.sections) || post.sections.length === 0) {
        logError(`${label}: sections 본문이 없습니다. Notion 본문에 제목/내용을 작성해야 합니다.`);
    } else {
        post.sections.forEach((section, index) => {
            if (!isNonEmptyString(section.heading)) {
                logWarning(`${label}: sections[${index}].heading이 비어 있습니다.`);
            }

            if (!isNonEmptyString(section.body)) {
                logWarning(`${label}: sections[${index}].body가 비어 있습니다.`);
            }
        });
    }

    if (!Array.isArray(post.process) || post.process.length === 0) {
        logWarning(`${label}: process가 없습니다.`);
    }

    if (!Array.isArray(post.tables) || post.tables.length === 0) {
        logWarning(`${label}: tables가 없습니다.`);
    }

    if (!Array.isArray(post.implementation) || post.implementation.length === 0) {
        logWarning(`${label}: implementation이 없습니다.`);
    }

    if (!isNonEmptyString(post.videoUrl)) {
        logWarning(`${label}: videoUrl이 없습니다. 나중에 시연 영상 링크를 넣는 것을 권장합니다.`);
    }

    /* 이미지 경로 검증: Notion 임시 URL 잔존, 로컬 파일 누락, 역슬래시 */
    if (Array.isArray(post.screenshots)) {
        post.screenshots.forEach((shot, index) => {
            validateImagePath(label, `screenUrls[${index}]`, shot && shot.url);
        });
    }

    validateImagePath(label, "thumbnailUrl", post.thumbnailUrl);

    if (Array.isArray(post.bodyImages)) {
        post.bodyImages.forEach((image, index) => {
            validateImagePath(label, `bodyImages[${index}]`, image && image.url);
        });
    }
}

function validateModulesJson() {
    if (!fs.existsSync(MODULES_JSON_PATH)) {
        logError("modules.json 파일이 없습니다: " + MODULES_JSON_PATH);
        return;
    }

    const modulesData = readJson(MODULES_JSON_PATH);

    if (!modulesData || !modulesData.modules) {
        logError("modules.json에 modules 객체가 없습니다.");
        return;
    }

    Object.keys(modulesData.modules).forEach((moduleId) => {
        const module = modulesData.modules[moduleId];

        if (!VALID_MODULES.includes(moduleId)) {
            logWarning(`modules.json에 정의되지 않은 moduleId가 있습니다: ${moduleId}`);
        }

        if (!isNonEmptyString(module.title)) {
            logWarning(`${moduleId}: module title이 없습니다.`);
        }

        if (!Array.isArray(module.posts)) {
            return;
        }

        module.posts.forEach((post) => {
            if (!isNonEmptyString(post.id)) {
                logError(`${moduleId}: posts 항목에 id가 없습니다.`);
                return;
            }

            if (!isNonEmptyString(post.title)) {
                logError(`${moduleId}/${post.id}: posts 항목에 title이 없습니다.`);
            }

            if (!isNonEmptyString(post.summary)) {
                logWarning(`${moduleId}/${post.id}: posts 항목에 summary가 없습니다.`);
            }

            const postJsonPath = path.join(POSTS_ROOT_PATH, moduleId, `${post.id}.json`);

            if (!fs.existsSync(postJsonPath)) {
                logError(`${moduleId}/${post.id}: 상세 JSON 파일이 없습니다. ${postJsonPath}`);
            }

            validateImagePath(`${moduleId}/${post.id}`, "thumbnail", post.thumbnail);
        });
    });
}

function walkPostFiles() {
    if (!fs.existsSync(POSTS_ROOT_PATH)) {
        logWarning("posts 폴더가 없습니다: " + POSTS_ROOT_PATH);
        return [];
    }

    const result = [];

    fs.readdirSync(POSTS_ROOT_PATH).forEach((moduleDirName) => {
        const moduleDirPath = path.join(POSTS_ROOT_PATH, moduleDirName);

        if (!fs.statSync(moduleDirPath).isDirectory()) {
            return;
        }

        fs.readdirSync(moduleDirPath).forEach((fileName) => {
            if (!fileName.endsWith(".json")) {
                return;
            }

            result.push(path.join(moduleDirPath, fileName));
        });
    });

    return result;
}

function main() {
    console.log("[Content Validate] 포트폴리오 컨텐츠 검증 시작");

    validateModulesJson();

    const postFiles = walkPostFiles();

    postFiles.forEach(validatePostFile);

    console.log("[Content Validate] 검사한 게시글 JSON 수:", postFiles.length);
    console.log("[Content Validate] Warning:", warningCount);
    console.log("[Content Validate] Error:", errorCount);

    if (errorCount > 0) {
        console.error("[Content Validate] 실패: 필수 컨텐츠 오류가 있습니다.");
        process.exit(1);
    }

    console.log("[Content Validate] 완료: 배포 가능한 상태입니다.");
}

main();
