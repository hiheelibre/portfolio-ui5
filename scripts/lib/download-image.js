/*
 * download-image.js
 *
 * Notion 이미지 로컬화용 다운로드 유틸.
 * - Node 22 기본 fetch 사용 (외부 의존성 없음)
 * - timeout / 재시도(429, 5xx) / Content-Type 검증 / 크기 경고
 * - SVG는 보안상 다운로드하지 않고 skip 처리
 * - 같은 원본(host + pathname)은 한 번만 다운로드하고 재사용
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DOWNLOAD_TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 600;

/* 단일 이미지 권장 제한: 10MB */
const SINGLE_IMAGE_WARN_BYTES = 10 * 1024 * 1024;

/* Content-Type → 확장자 매핑 */
const CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico"
};

const URL_IMAGE_EXTENSIONS = [
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp", ".tiff", ".ico"
];

/*
 * Notion이 발급하는 "만료되는 파일 URL" 판별.
 * 이 URL들은 약 1시간 뒤 서명이 만료되어 깨진다.
 */
const NOTION_FILE_HOST_PATTERNS = [
    "secure.notion-static.com",
    "prod-files-secure",
    "file.notion.so",
    "notionusercontent.com",
    "notion.site"
];

/* 영상 URL은 이미지 다운로드 대상이 아님 */
const VIDEO_HOST_PATTERNS = [
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "drive.google.com"
];

/* 다운로드 결과 dedupe 캐시 (host+pathname 기준, 1회 sync 실행 범위) */
const downloadCache = new Map();

class ImageDownloadError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "ImageDownloadError";
        this.code = code || "DOWNLOAD_FAILED";
    }
}

function parseUrlSafe(value) {
    try {
        return new URL(String(value || "").trim());
    } catch (e) {
        return null;
    }
}

function isNotionFileUrl(value) {
    const oUrl = parseUrlSafe(value);

    if (!oUrl) {
        return false;
    }

    const host = oUrl.hostname.toLowerCase();

    if (NOTION_FILE_HOST_PATTERNS.some((pattern) => host.includes(pattern))) {
        return true;
    }

    /* Notion 파일은 S3 서명 URL(X-Amz-*)로도 제공된다 */
    if (host.endsWith("amazonaws.com")) {
        return true;
    }

    return false;
}

function isVideoUrl(value) {
    const oUrl = parseUrlSafe(value);

    if (!oUrl) {
        return false;
    }

    const host = oUrl.hostname.toLowerCase().replace(/^www\./, "");

    return VIDEO_HOST_PATTERNS.some((pattern) => host.includes(pattern));
}

function isSvgUrl(value) {
    const oUrl = parseUrlSafe(value);

    if (!oUrl) {
        return false;
    }

    return oUrl.pathname.toLowerCase().endsWith(".svg");
}

function getCacheKey(value) {
    const oUrl = parseUrlSafe(value);

    if (!oUrl) {
        return String(value);
    }

    /* 서명 쿼리는 매번 달라지므로 host + pathname으로 동일 원본 판별 */
    return oUrl.hostname.toLowerCase() + oUrl.pathname;
}

function hashUrlPath(value) {
    return crypto.createHash("sha1").update(getCacheKey(value)).digest("hex").slice(0, 12);
}

function getExtensionFromContentType(contentType) {
    if (!contentType) {
        return "";
    }

    const normalized = String(contentType).split(";")[0].trim().toLowerCase();

    return CONTENT_TYPE_EXTENSIONS[normalized] || "";
}

function getExtensionFromUrl(value) {
    const oUrl = parseUrlSafe(value);

    if (!oUrl) {
        return "";
    }

    const ext = path.posix.extname(oUrl.pathname).toLowerCase();

    if (ext === ".jpeg") {
        return ".jpg";
    }

    return URL_IMAGE_EXTENSIONS.includes(ext) ? ext : "";
}

function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(1) + "MB";
    }

    return Math.round(bytes / 1024) + "KB";
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            signal: controller.signal,
            redirect: "follow"
        });
    } finally {
        clearTimeout(timer);
    }
}

/*
 * 이미지 1건 다운로드.
 *
 * options:
 * - url: 원본 URL (필수)
 * - destDirAbs: 저장할 절대 경로 디렉터리 (필수)
 * - baseName: 확장자를 뺀 파일명. 예: "screen-001" (필수)
 * - context: 로그용 문자열. 예: "MM/pr-management screenUrls[0]"
 *
 * 반환: { fileName, size, contentType, host, reused }
 * 실패: ImageDownloadError (code: SVG_SKIPPED / NOT_IMAGE / UNKNOWN_TYPE /
 *        GONE(403,404) / HTTP_ERROR / TIMEOUT / NETWORK)
 */
async function downloadImage(options) {
    const { url, destDirAbs, baseName } = options;
    const context = options.context || "";
    const host = (parseUrlSafe(url) || { hostname: "unknown" }).hostname;

    if (isSvgUrl(url)) {
        throw new ImageDownloadError(
            `SVG는 보안상 다운로드하지 않습니다: ${context} (host=${host})`,
            "SVG_SKIPPED"
        );
    }

    /* 동일 원본 재사용 */
    const cacheKey = getCacheKey(url);

    if (downloadCache.has(cacheKey)) {
        const cached = downloadCache.get(cacheKey);
        return Object.assign({}, cached, { reused: true });
    }

    let response = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            response = await fetchWithTimeout(url, DOWNLOAD_TIMEOUT_MS);
        } catch (error) {
            lastError = error;

            const isAbort = error && error.name === "AbortError";

            if (attempt < MAX_RETRIES) {
                console.warn(
                    `[Image Download] ${isAbort ? "timeout" : "network 오류"}, 재시도 ${attempt}/${MAX_RETRIES - 1}: ${context} (host=${host})`
                );
                await sleep(RETRY_BASE_DELAY_MS * attempt);
                continue;
            }

            throw new ImageDownloadError(
                `다운로드 ${isAbort ? "timeout" : "network 오류"}: ${context} (host=${host}) / ${error.message}`,
                isAbort ? "TIMEOUT" : "NETWORK"
            );
        }

        if (response.ok) {
            break;
        }

        /* 403/404는 재시도 무의미: Notion 서명 만료 또는 삭제된 파일 */
        if (response.status === 403 || response.status === 404) {
            throw new ImageDownloadError(
                `이미지에 접근할 수 없습니다(HTTP ${response.status}). ` +
                `Notion 임시 URL이 만료되었을 수 있습니다. sync를 다시 실행하세요: ${context} (host=${host})`,
                "GONE"
            );
        }

        if ([429, 500, 502, 503, 504].includes(response.status) && attempt < MAX_RETRIES) {
            console.warn(
                `[Image Download] HTTP ${response.status}, 재시도 ${attempt}/${MAX_RETRIES - 1}: ${context} (host=${host})`
            );
            await sleep(RETRY_BASE_DELAY_MS * attempt);
            response = null;
            continue;
        }

        throw new ImageDownloadError(
            `다운로드 실패(HTTP ${response.status}): ${context} (host=${host})`,
            "HTTP_ERROR"
        );
    }

    if (!response || !response.ok) {
        throw new ImageDownloadError(
            `다운로드 실패: ${context} (host=${host}) / ${lastError ? lastError.message : "unknown"}`,
            "HTTP_ERROR"
        );
    }

    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();

    if (contentType === "image/svg+xml") {
        throw new ImageDownloadError(
            `SVG는 보안상 다운로드하지 않습니다: ${context} (host=${host})`,
            "SVG_SKIPPED"
        );
    }

    if (contentType && !contentType.startsWith("image/")) {
        throw new ImageDownloadError(
            `이미지가 아닌 응답(Content-Type=${contentType})은 저장하지 않습니다: ${context} (host=${host})`,
            "NOT_IMAGE"
        );
    }

    /* 확장자 결정: Content-Type 우선 → URL 추정 → 실패 시 명시적 에러 */
    let extension = getExtensionFromContentType(contentType) || getExtensionFromUrl(url);

    if (!extension) {
        throw new ImageDownloadError(
            `확장자를 판별할 수 없어 저장하지 않습니다(Content-Type=${contentType || "없음"}): ${context} (host=${host})`,
            "UNKNOWN_TYPE"
        );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const size = buffer.length;

    if (size === 0) {
        throw new ImageDownloadError(
            `빈 응답(0 byte)이라 저장하지 않습니다: ${context} (host=${host})`,
            "NOT_IMAGE"
        );
    }

    if (size > SINGLE_IMAGE_WARN_BYTES) {
        console.warn(
            `[Image Download][WARN] 이미지가 너무 큽니다(${formatBytes(size)} > 10MB). ` +
            `Notion에 올리기 전에 축소를 권장합니다: ${context}`
        );
    }

    fs.mkdirSync(destDirAbs, { recursive: true });

    const fileName = baseName + extension;
    const filePath = path.join(destDirAbs, fileName);

    fs.writeFileSync(filePath, buffer);

    console.log(
        `[Image Download] 저장 완료: ${fileName} (${formatBytes(size)}, host=${host})`
    );

    const result = {
        fileName,
        size,
        contentType: contentType || "unknown",
        host,
        reused: false
    };

    downloadCache.set(cacheKey, result);

    return result;
}

function clearDownloadCache() {
    downloadCache.clear();
}

module.exports = {
    downloadImage,
    isNotionFileUrl,
    isVideoUrl,
    isSvgUrl,
    hashUrlPath,
    clearDownloadCache,
    ImageDownloadError,
    SINGLE_IMAGE_WARN_BYTES
};
