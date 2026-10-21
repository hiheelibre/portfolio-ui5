/**
 * content 폴더 공통 읽기 도구 (build-content.js, validate-content.js 가 함께 사용)
 *
 * md 파일 구조
 *   ---            ← 머리말(YAML): 짧은 값
 *   ---
 *   ## 섹션 제목   ← 본문: 긴 글. "- " 줄은 목록, ``` 블록은 코드
 */
const fs = require("fs");
const path = require("path");

function loadYaml() {
    try {
        return require("js-yaml");
    } catch (e) {
        // npm install 전 로컬 실행 대비: @ui5/cli 가 함께 설치한 js-yaml 사용
        const base = path.dirname(require.resolve("@ui5/cli/package.json"));
        return require(require.resolve("js-yaml", { paths: [base] }));
    }
}
const yaml = loadYaml();

const ROOT = path.resolve(__dirname, "..");
const CONTENT = process.env.CONTENT_DIR ? path.resolve(process.env.CONTENT_DIR) : path.join(ROOT, "content");
const IGNORE_DIRS = new Set(["_old", "img"]);

/** content 아래 md 파일 목록 (README, _old 제외) */
function listMd(dir = CONTENT) {
    const out = [];
    for (const name of fs.readdirSync(dir).sort()) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.has(name)) out.push(...listMd(full));
        } else if (name.endsWith(".md") && name !== "README.md") {
            out.push(full);
        }
    }
    return out;
}

const rel = (p) => path.relative(CONTENT, p).split(path.sep).join("/");

/** 머리말과 본문 분리 */
function splitFile(file) {
    const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) throw new Error("머리말(--- 로 감싼 부분)이 없습니다");
    const meta = yaml.load(m[1]) || {};
    return { text, meta, body: m[2] };
}

/** 표 한 줄 "| a | b |" → ["a", "b"] */
function tableCells(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

/**
 * 섹션 본문을 순서대로 블록으로 (v0.7 사례형 상세 화면용)
 *   ### 소제목 → h / 문단 → p / "- " → list / "> " → quote / | 표 | → table / ``` → code
 * 기존 카드는 paras, items, code 를 그대로 쓰고, layout: case 카드만 blocks 를 씀
 */
function parseBlocks(lines) {
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const t = line.trim();
        if (!t) { i++; continue; }
        if (t.startsWith("```")) {
            const lang = t.slice(3).trim().toUpperCase();
            const src = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) { src.push(lines[i]); i++; }
            i++;
            blocks.push({ t: "code", lang, src: src.join("\n").replace(/\n+$/, "") });
            continue;
        }
        if (t.startsWith("### ")) { blocks.push({ t: "h", text: t.slice(4).trim() }); i++; continue; }
        if (t.startsWith("|")) {
            const rows = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(tableCells(lines[i])); i++; }
            const head = rows.shift() || [];
            const body = rows.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
            blocks.push({
                t: "table",
                cols: head.length,
                head,
                rows: body.map((r) => ({ cells: head.map((h, k) => ({ h, v: r[k] || "" })) }))
            });
            continue;
        }
        if (t.startsWith("- ")) {
            const items = [];
            while (i < lines.length && lines[i].trim().startsWith("- ")) { items.push(lines[i].trim().slice(2).trim()); i++; }
            blocks.push({ t: "list", items });
            continue;
        }
        if (t.startsWith("> ")) {
            const q = [];
            while (i < lines.length && lines[i].trim().startsWith(">")) { q.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
            blocks.push({ t: "quote", text: q.join(" ").trim() });
            continue;
        }
        blocks.push({ t: "p", text: t });
        i++;
    }
    return blocks;
}

/** 본문을 "## 제목" 단위로 나눔 */
function parseSections(body) {
    const out = {};
    let cur = null;
    let buf = [];
    const flush = () => {
        if (cur === null) return;
        const blocks = parseBlocks(buf);
        let text = buf.join("\n").replace(/^\n+|\n+$/g, "");
        let code = null;
        const cm = text.match(/```(\w+)?\n([\s\S]*?)```/);
        if (cm) {
            code = { lang: (cm[1] || "").toUpperCase(), src: cm[2].replace(/\n+$/, "") };
            text = (text.slice(0, cm.index) + text.slice(cm.index + cm[0].length)).trim();
        }
        const lines = text.split("\n").filter((l) => l.trim());
        out[cur] = {
            paras: lines.filter((l) => !l.startsWith("- ")).map((l) => l.trim()),
            items: lines.filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim()),
            code,
            blocks
        };
    };
    for (const line of body.split("\n")) {
        if (line.startsWith("## ")) {
            flush();
            cur = line.slice(3).trim();
            buf = [];
        } else {
            buf.push(line);
        }
    }
    flush();
    return out;
}

function readPage(relPath) {
    return splitFile(path.join(CONTENT, relPath)).meta;
}

function readCards(relDir) {
    const dir = path.join(CONTENT, relDir);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((n) => n.endsWith(".md")).sort().map((n) => {
        const file = path.join(dir, n);
        const { meta, body } = splitFile(file);
        const sec = parseSections(body);
        return { ...meta, file: rel(file), sec, secOrder: Object.keys(sec) };
    });
}

/** 전체 콘텐츠를 하나의 객체로 */
function readAll() {
    const sap = readPage("sap/project.md");
    sap.programs = readCards("sap/programs");
    sap.modules = readCards("sap/modules");
    const pub = readPage("public/project.md");
    pub.cards = readCards("public/cards");
    return { site: readPage("site.md"), home: readPage("home.md"), sap, public: pub };
}

module.exports = { ROOT, CONTENT, yaml, listMd, rel, splitFile, parseSections, parseBlocks, readAll };
