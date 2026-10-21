/**
 * content/**.md → webapp/model/content/*.json, content/img/** → webapp/media/content/**
 *
 * 실행: npm run content:build
 * 결과물은 빌드 생성물이다. 직접 고치지 말고 content 폴더의 md를 고친다.
 */
const fs = require("fs");
const path = require("path");
const { ROOT, CONTENT, readAll } = require("./content-lib");

const OUT_MODEL = path.join(ROOT, "webapp", "model", "content");
const OUT_MEDIA = path.join(ROOT, "webapp", "media", "content");
const MEDIA_URL = "media/content/";

// 기존 생성물은 영구 삭제하지 않고 프로젝트 안의 _old에 보관한다.
const ARCHIVE_RUN = new Date().toISOString().replace(/[:.]/g, "-") + "_" + process.pid;
function resetDir(dir) {
    const target = path.resolve(dir);
    const allowed = [path.resolve(OUT_MODEL), path.resolve(OUT_MEDIA)];
    if (!allowed.includes(target)) throw new Error("허용하지 않은 빌드 경로: " + target);
    if (fs.existsSync(target)) {
        const archive = path.resolve(ROOT, "_old", "content-build", ARCHIVE_RUN, path.relative(ROOT, target));
        const oldRoot = path.resolve(ROOT, "_old") + path.sep;
        if (!archive.startsWith(oldRoot)) throw new Error("보관 경로가 프로젝트 밖입니다");
        fs.mkdirSync(path.dirname(archive), { recursive: true });
        try {
            fs.renameSync(target, archive);
        } catch (error) {
            if (!["EPERM", "EACCES", "EBUSY"].includes(error.code)) throw error;
            fs.cpSync(target, archive, { recursive: true, errorOnExist: true, force: false });
            console.log("[Content Build] 사용 중인 기존 폴더는 복사 보관 후 덮어씁니다: " + path.relative(ROOT, target));
        }
    }
    fs.mkdirSync(target, { recursive: true });
}

function copyDir(src, dst) {
    if (!fs.existsSync(src)) return 0;
    let n = 0;
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) {
        const s = path.join(src, name);
        const d = path.join(dst, name);
        if (fs.statSync(s).isDirectory()) n += copyDir(s, d);
        else { fs.copyFileSync(s, d); n += 1; }
    }
    return n;
}

/** 이미지 경로(file, image)에 화면에서 바로 쓸 src 를 붙임 */
function addSrc(node) {
    if (Array.isArray(node)) return node.forEach(addSrc);
    if (!node || typeof node !== "object") return;
    for (const key of Object.keys(node)) {
        const v = node[key];
        if ((key === "file" || key === "image") && typeof v === "string" && /\.(jpe?g|png|gif|webp|svg)$/i.test(v)) {
            node[key === "file" ? "src" : "imageSrc"] = MEDIA_URL + v;
        } else {
            addSrc(v);
        }
    }
}

/** 화면에서 바로 찾을 수 있게 key 목록을 만듦 */
function buildIndex(data) {
    const index = {};
    for (const c of [...data.sap.programs, ...data.sap.modules]) index["sap/" + c.key] = c.file;
    for (const c of data.public.cards) index["public/" + c.key] = c.file;
    return index;
}

function main() {
    const data = readAll();
    addSrc(data);
    data.index = buildIndex(data);
    data.builtAt = new Date().toISOString();

    resetDir(OUT_MODEL);
    for (const name of ["site", "home", "sap", "public"]) {
        fs.writeFileSync(path.join(OUT_MODEL, `${name}.json`), JSON.stringify(data[name], null, 2), "utf8");
    }
    fs.writeFileSync(path.join(OUT_MODEL, "index.json"), JSON.stringify({ index: data.index, builtAt: data.builtAt }, null, 2), "utf8");

    resetDir(OUT_MEDIA);
    const images = copyDir(path.join(CONTENT, "img"), OUT_MEDIA);

    console.log(`[Content Build] SAP 프로그램 ${data.sap.programs.length}, 공통 모듈 ${data.sap.modules.length}, 공공 카드 ${data.public.cards.length}`);
    console.log(`[Content Build] JSON → webapp/model/content, 이미지 ${images}개 → webapp/media/content`);
}

try {
    main();
} catch (e) {
    console.error("[Content Build][ERROR]", e.message);
    process.exit(1);
}
