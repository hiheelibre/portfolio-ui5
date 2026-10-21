/**
 * content 폴더 검사 (배포 전 게이트)
 *
 * Error (빌드 중단)
 *   - 머리말 YAML 을 읽을 수 없음
 *   - 가운뎃점 사용
 *   - 쉼표 때문에 값이 잘린 것으로 보이는 곳 (값이 비어 있는 이상한 키)
 *   - 카드 필수 값, 필수 섹션 누락 / 카드 key 중복
 *   - md 에 적은 이미지 파일이 content/img 에 없음
 *   - 연결(to, go, cards)이 없는 카드를 가리킴
 * Warning (빌드 계속)
 *   - [확인 필요] 항목 목록
 *
 * 실행: npm run content:check
 */
const fs = require("fs");
const path = require("path");
const { CONTENT, listMd, rel, splitFile, readAll } = require("./content-lib");

const MIDDOT = String.fromCharCode(0xB7);
const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// 비어 있어도 되는 키 (그 외 키가 비어 있으면 쉼표 잘림을 의심)
const NULLABLE = new Set(["highlight", "lines", "image", "file", "fact", "tag", "note", "noshot", "check"]);
const REQUIRED_META = ["key", "title", "role"];
const REQUIRED_SEC = ["문제", "설계 내용", "결과", "내가 한 일과 팀이 한 일"];
// v0.7 사례형 상세(layout: case): 개요, 업무 흐름, 핵심 구현, 문제 해결, 검증 및 기여 순서
const CASE_SEC = ["개요", "업무 흐름", "핵심 구현", "문제 해결", "검증 및 기여"];

function findNulls(node, where, file) {
    if (Array.isArray(node)) return node.forEach((v, i) => findNulls(v, `${where}[${i}]`, file));
    if (!node || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node)) {
        if ((v === null || v === undefined) && !NULLABLE.has(k)) {
            err(file, `"${where}.${k}" 값이 비어 있습니다. 앞쪽 값에 쉼표가 있으면 큰따옴표로 감싸세요`);
        }
        findNulls(v, `${where}.${k}`, file);
    }
}

function findChecks(node, file) {
    if (Array.isArray(node)) return node.forEach((v) => findChecks(v, file));
    if (typeof node === "string") {
        if (node.includes("[확인 필요")) warn(file, node.replace(/^\[확인 필요: ?/, "").replace(/\]$/, ""));
        return;
    }
    if (node && typeof node === "object") Object.values(node).forEach((v) => findChecks(v, file));
}

function findImages(node, file) {
    if (Array.isArray(node)) return node.forEach((v) => findImages(v, file));
    if (!node || typeof node !== "object") return;
    for (const [k, v] of Object.entries(node)) {
        if ((k === "file" || k === "image") && typeof v === "string" && v.trim()) {
            if (!fs.existsSync(path.join(CONTENT, "img", v))) err(file, `이미지 파일이 없습니다: img/${v}`);
        } else {
            findImages(v, file);
        }
    }
}

// 1) 파일 단위 검사
for (const full of listMd()) {
    const file = rel(full);
    let parsed;
    try {
        parsed = splitFile(full);
    } catch (e) {
        err(file, `읽을 수 없습니다 (${e.message.split("\n")[0]})`);
        continue;
    }
    if (parsed.text.includes(MIDDOT)) {
        const line = parsed.text.split("\n").findIndex((l) => l.includes(MIDDOT)) + 1;
        err(file, `가운뎃점이 있습니다 (${line}번째 줄 등). 쉼표나 "와/과"로 바꾸세요`);
    }
    if (/\t/.test(parsed.text.split("\n---")[0])) err(file, "머리말에 탭 문자가 있습니다. 스페이스로 바꾸세요");
    findNulls(parsed.meta, "", file);
    findChecks(parsed.meta, file);
    findImages(parsed.meta, file);
}

// 2) 전체 구조 검사
let data = null;
try {
    data = readAll();
} catch (e) {
    err("(전체)", `콘텐츠를 읽지 못했습니다: ${e.message}`);
}

const checkToLater = [];
if (data) {
    const cards = [...data.sap.programs, ...data.sap.modules, ...data.public.cards];
    const seen = new Map();
    for (const c of cards) {
        for (const k of REQUIRED_META) if (!c[k]) err(c.file, `머리말에 ${k} 가 없습니다`);
        if (c.layout === "case") {
            const cs = c["case"] || {};
            // 섹션 이름과 순서: case.sections 가 있으면 그것, 없으면 기본 5개
            const want = Array.isArray(cs.sections) && cs.sections.length ? cs.sections : CASE_SEC;
            for (const s of want) if (!c.sec[s]) err(c.file, `"## ${s}" 섹션이 없습니다 (사례형 상세)`);
            const order = (c.secOrder || []).filter((s) => want.includes(s));
            if (order.join("/") !== want.filter((s) => c.sec[s]).join("/")) err(c.file, `사례형 상세 섹션 순서는 ${want.join(", ")} 입니다`);
            const extra = (c.secOrder || []).filter((s) => !want.includes(s));
            if (extra.length) err(c.file, `case.sections 에 없는 섹션이 있습니다: ${extra.join(", ")}`);
            if (cs.listTo) checkToLater.push([cs.listTo, c.file]);
            if (!cs.summary) err(c.file, "case.summary 가 없습니다");
            for (const l of cs.links || []) if (!/^https?:\/\//.test(String(l.url || ""))) err(c.file, `case.links 의 "${l.label}" 주소가 http(s) 가 아닙니다. 확인한 자료만 넣으세요`);
        } else {
            for (const s of REQUIRED_SEC) if (!c.sec[s]) err(c.file, `"## ${s}" 섹션이 없습니다`);
        }
        const id = `${c.axis}/${c.key}`;
        if (seen.has(id)) err(c.file, `key "${c.key}" 가 ${seen.get(id)} 와 겹칩니다`);
        seen.set(id, c.file);
        if (c.sec["코드"] && !c.sec["코드"].code) warn(c.file, '"## 코드" 섹션에 ``` 코드 블록이 없습니다');
    }

    const sapKeys = new Set([...data.sap.programs, ...data.sap.modules].map((c) => c.key));
    const pubKeys = new Set(data.public.cards.map((c) => c.key));
    const pages = new Set(["home", "highlights", "career", "contact", "skills", "주요-구현-사례", "이력", "기술과-자격", "sap", "public", "sap/flow", "sap/catalog", "public/award", "public/result",
        // v0.8 SAP 프로젝트 페이지 섹션
        "sap/overview", "sap/process", "sap/e2e", "sap/co", "sap/programs", "sap/shared", "sap/outcomes",
        // v0.8 공공 프로젝트 페이지 섹션
        "public/overview", "public/process", "public/cases", "public/plsql", "public/catalog", "public/operations", "public/outcomes"]);
    const checkTo = (to, file) => {
        if (pages.has(to)) return;
        const [axis, key] = String(to).split("/");
        if ((axis === "sap" && sapKeys.has(key)) || (axis === "public" && pubKeys.has(key))) return;
        err(file, `연결 대상 "${to}" 를 찾을 수 없습니다`);
    };
    for (const [to, file] of checkToLater) checkTo(to, file);
    for (const g of data.home.glance.items) checkTo(g.to, "home.md");
    for (const h of data.home.highlights.items) checkTo(h.to, "home.md");
    // 0.2: 흐름도는 lane.tracks[].nodes[] (branch 는 nodes[].branch[]), lane.target. 예전 lane.nodes 도 함께 확인
    const flowNodes = (lane) => [...(lane.nodes || []), ...((lane.tracks || []).flatMap((t) => (t.nodes || []).flatMap((n) => n.branch ? n.branch : [n]))), ...(lane.target ? [lane.target] : [])];
    for (const lane of data.sap.flow.lanes) for (const n of flowNodes(lane)) if (n.go && !sapKeys.has(n.go)) err("sap/project.md", `흐름도 노드 "${n.title}" 의 go "${n.go}" 카드가 없습니다`);
    for (const r of data.public.revive.items) for (const k of r.cards || []) if (!pubKeys.has(k)) err("public/project.md", `되살린 기능 "${r.title}" 의 카드 "${k}" 가 없습니다`);
    // v0.8 SAP 프로젝트 페이지: 요약 패널, E2E 단계, CO 3단계, 공통 기능 흐름, 바로가기의 연결 대상
    const sp = data.sap;
    for (const g of (sp.panels || {}).groups || []) for (const it of g.items || []) if (!sapKeys.has(it.key)) err("sap/project.md", `담당 프로그램 패널 "${it.code}" 의 key "${it.key}" 카드가 없습니다`);
    for (const st of ((sp.process || {}).e2e || {}).steps || []) for (const k of st.programs || []) if (!sapKeys.has(k)) err("sap/project.md", `E2E 단계 ${st.no} 의 프로그램 "${k}" 카드가 없습니다`);
    for (const st of ((sp.process || {}).co || {}).steps || []) if (st.go && !sapKeys.has(st.go)) err("sap/project.md", `CO 단계 "${st.title}" 의 go "${st.go}" 카드가 없습니다`);
    for (const st of (sp.shared || {}).chain || []) if (st.go && !sapKeys.has(st.go)) err("sap/project.md", `공통 기능 흐름 "${st.title}" 의 go "${st.go}" 카드가 없습니다`);
    for (const l of (sp.hero || {}).links || []) checkTo(l.to, "sap/project.md");
    for (const pn of (sp.outcomes || {}).panels || []) checkTo(pn.to, "sap/project.md");
    // v0.8 공공 프로젝트 페이지: 바로가기, 목차, 사례와 운영 카드의 관련 기록
    const pp = data.public;
    for (const l of [...((pp.hero || {}).links || []), ...((pp.hero || {}).toc || [])]) checkTo(l.to, "public/project.md");
    const pubRecs = [...(((pp.cases || {}).featured || {}).records || []),
        ...((pp.cases || {}).panels || []).flatMap((x) => x.records || []),
        ...((pp.operations || {}).items || []).flatMap((x) => x.records || [])];
    // 0.2: 기록은 key 문자열 또는 { key, type, sub }
    for (const r of pubRecs) { const k = typeof r === "string" ? r : (r || {}).key; if (!pubKeys.has(k)) err("public/project.md", `관련 기록 "${k}" 카드가 없습니다`); }
}

// 3) 결과
console.log(`[Content Check] 검사한 md 파일: ${listMd().length}개`);
if (warnings.length) {
    // 같은 내용은 묶어서 한 줄로
    const groups = new Map();
    for (const w of warnings) {
        const i = w.indexOf(": ");
        const file = w.slice(0, i), msg = w.slice(i + 2);
        if (!groups.has(msg)) groups.set(msg, []);
        groups.get(msg).push(file);
    }
    console.log(`[Content Check] 확인 필요 ${warnings.length}건`);
    for (const [msg, files] of groups) {
        const where = files.length > 3 ? `${files.length}개 파일 (${files[0]} 외)` : files.join(", ");
        console.log(`  - ${msg}  <- ${where}`);
    }
}
if (errors.length) {
    console.error(`[Content Check] Error ${errors.length}건`);
    for (const e of errors) console.error("  ✕ " + e);
    process.exit(1);
}
console.log("[Content Check] Error 0. 배포 가능한 상태입니다.");
