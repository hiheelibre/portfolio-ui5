/**
 * Main.controller.js — 한지희 포트폴리오 (개편판)
 * ---------------------------------------------------------------
 * 데이터
 *  - "c"  모델: model/content/{site,home,sap,public}.json
 *         content 폴더의 md를 빌드할 때 변환한 결과 (scripts/build-content.js)
 *  - "vm" 모델: 화면에서 바로 쓰기 좋게 가공한 값 (메뉴 이름, 번호, 썸네일 문구 등)
 *
 * 라우팅 (hash)
 *  #home | #주요-구현-사례 | #이력 | #기술과-자격   홈 안의 섹션으로 스크롤 (0.2. 옛 #highlights, #career, #skills 도 같은 섹션으로, 옛 #contact 는 홈 맨 위)
 *  #sap | #sap/{섹션} | #sap/{카드key}      SAP 프로젝트 (프로그램 ID 로 들어와도 같은 카드 주소로 바꿈. 예: #sap/ZRC1CO0007 → #sap/pred)
 *     섹션(v0.8): overview, process, e2e, co, programs, shared, outcomes
 *     옛 섹션 주소: flow → co (CO 업무 흐름), catalog → programs (담당 프로그램, 상세의 목록 복귀 링크가 씀)
 *  #public | #public/{섹션} | #public/{카드key}   공공 웹시스템 운영 및 개선
 *     0.2: #public/{카드key} 는 별도 상세 페이지가 아니라 공공 페이지 위 레이어 팝업으로 엶 (PubRecord.fragment.xml)
 *          다른 화면이나 직접 주소로 들어오면 03의 기록 목록으로 옮긴 뒤 팝업을 엶. 페이지 안에서 연 팝업은 뒤로 가기로 닫힘
 *     섹션(v0.8): overview, process, cases, plsql(대표 사례), catalog, operations, outcomes, award(표창), result(옛 주소, 05로)
 *  옛 주소: #dashboard, #module/{Code}, #post/{Module}/{PostId}, #skills → 새 주소로 바꿈
 *
 * 원칙
 *  - 브라우저에서 외부 API를 부르지 않는다. 빌드된 정적 JSON과 이미지만 읽는다
 *  - 데이터를 못 읽어도 앱 전체가 멈추지 않게 빈 골격으로 시작한다
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/LightBox",
    "sap/m/LightBoxItem",
    "sap/ui/core/Fragment",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/HTML",
    "sap/m/ActionSheet"
], function (Controller, JSONModel, MessageToast, mobileLibrary, Filter, FilterOperator, LightBox, LightBoxItem, Fragment, Dialog, Button, HTML, ActionSheet) {
    "use strict";

    var APP_BASE = sap.ui.require.toUrl("portfolio/dashboard");
    var CONTENT_PARTS = ["site", "home", "sap", "public"];
    var DOC_TITLE = "한지희 포트폴리오";

    /** 카드 상세: 위쪽에 펼쳐 두는 섹션, 접는 섹션 순서 */
    var TOP_SECS = ["문제", "설계 내용"];
    var PANEL_SECS = ["핵심 로직", "결과", "다시 한다면", "내가 한 일과 팀이 한 일", "연결", "코드"];

    /** SAP 프로젝트 페이지 섹션 주소 → 화면 id (v0.8). flow, catalog 는 옛 주소 */
    var SAP_ANCHORS = {
        overview: "secSapOverview", process: "secSapProcess", e2e: "secSapE2e", co: "secSapCo",
        programs: "secSapPrograms", shared: "secSapShared", outcomes: "secSapOutcomes",
        flow: "secSapCo", catalog: "secSapPrograms"
    };
    /** 공공 프로젝트 페이지 섹션 주소 → 화면 id (v0.8). 사이드바 하위 메뉴는 결정 P-I 로 추가 */
    var PUB_ANCHORS = {
        overview: "secPubOverview", process: "secPubProcess", cases: "secPubCases", plsql: "secPubFeatured",
        catalog: "secPubCatalog", operations: "secPubOperations", outcomes: "secPubOutcomes",
        award: "secPubAward", result: "secPubOutcomes"
    };

    /** 섹션 주소 → 사이드바 하위 메뉴 */
    var SAP_NAV = {
        overview: "overview", process: "process", e2e: "process", co: "process", flow: "process",
        programs: "programs", catalog: "programs", shared: "programs", outcomes: "outcomes"
    };
    var SAP_SUB_IDS = { overview: "navSapOverview", process: "navSapProcess", programs: "navSapPrograms", outcomes: "navSapOutcomes" };
    /** 스크롤 위치로 현재 섹션을 고를 때 쓰는 순서 */
    var SAP_SPY = [["overview", "secSapOverview"], ["process", "secSapProcess"], ["programs", "secSapPrograms"], ["outcomes", "secSapOutcomes"]];

    /** 결정 P-I: 공공 섹션 주소 → 사이드바 하위 메뉴 */
    var PUB_NAV = {
        overview: "overview", process: "process", cases: "cases", plsql: "cases", catalog: "cases",
        operations: "operations", outcomes: "outcomes", award: "outcomes", result: "outcomes"
    };
    var PUB_SUB_IDS = { overview: "navPubOverview", process: "navPubProcess", cases: "navPubCases", operations: "navPubOperations", outcomes: "navPubOutcomes" };
    var PUB_SPY = [["overview", "secPubOverview"], ["process", "secPubProcess"], ["cases", "secPubCases"], ["operations", "secPubOperations"], ["outcomes", "secPubOutcomes"]];

    /** 0.2: 홈 섹션 주소 (사이드바 하위 메뉴 3개). 옛 영문 주소는 한글 주소로 바꿈 */
    var HOME_ALIAS = { "주요-구현-사례": "highlights", "highlights": "highlights", "이력": "career", "career": "career", "기술과-자격": "skills" };
    var HOME_HASH = { highlights: "주요-구현-사례", career: "이력", skills: "기술과-자격" };
    var HOME_ANCHORS = { highlights: "secHighlights", career: "secCareer", skills: "secSkills" };
    var HOME_SUB_IDS = { highlights: "navHighlights", career: "navCareer", skills: "navSkills" };
    var HOME_SPY = [["highlights", "secHighlights"], ["career", "secCareer"], ["skills", "secSkills"]];

    /** 옛 주소 → 새 주소 */
    var LEGACY = {
        "dashboard": "home",
        "skills": "기술과-자격",
        "module/CO": "sap",
        "module/WATER": "public",
        "module/ECO": "public",
        "post/CO/wip-settlement": "sap/wip"
    };

    return Controller.extend("portfolio.dashboard.controller.Main", {

        /* ============================== lifecycle ============================== */

        onInit: function () {
            this._hashHandler = this._applyHash.bind(this);
            this._bReady = false;

            this._oC = new JSONModel(this._emptyContent());
            this._oC.setSizeLimit(500);
            this.getView().setModel(this._oC, "c");

            this._oVm = new JSONModel({
                nav: { home: "홈", highlights: "주요 구현 사례", career: "이력", skills: "기술과 자격", contact: "연락처", group: "PROJECTS",
                       sap: "SAP 프로그램", sapSub: "", public: "공공 시스템 기능 설계", publicSub: "",
                       overview: "", process: "", programs: "", shared: "", outcomes: "", sapOpen: false },
                highlights: [],
                hero: { label: "", html: "" },
                sapHeroTab: "programs",
                sapOverviewTab: "summary", sapOverviewSections: [], sapProcessTab: "e2e", sapProgramTab: "all",
                sapHeroActive: { photo: {}, count: 0 },
                sapFlow: [],
                sapKinds: [{ label: "전체", value: "all" }, { label: "ABAP", value: "ABAP" }, { label: "Fiori", value: "Fiori" }],
                sapKind: "all",
                sapPrograms: [],
                sapModules: [],
                sapModulesAux: [],
                /* v0.8 개선 2: 05의 결정의 순간, 남긴 산출물은 처음에 접어 둠 */
                sapFold: { dec: false, out: false },
                /* 공공 목업: 기록 목록은 펼치고, 선택한 섹션 하나를 표시 */
                pubCatOpen: true,
                pubTab: "overview", pubShowAll: false, pubSummary: [],
                sapOverviewMetrics: [],
                sapGoals: [],
                sapE2e: [],
                sapCoSteps: [],
                sapChain: [],
                sapDeliverables: [],
                sapTables: { team: this._emptyTable(), interfaces: this._emptyTable(), assess: this._emptyTable(), movements: this._emptyTable(), outputs: this._emptyTable() },
                pubAreas: [{ label: "전체", value: "all" }],
                pubRoles: [], pubFeatPoints: [], pubFeatRecords: [], pubPanels: [], pubOps: [], pubChain: [],
                pubApproach: [], pubContrib: [], pubRetroCards: [],
                pubTables: { scope: this._emptyTable(), data: this._emptyTable(), outputs: this._emptyTable(), bridge: this._emptyTable() },
                pubArea: "all",
                pubDirect: false,
                pubGroups: [],
                pubRevive: [],
                /* 0.2: 공공 기록 레이어 팝업 */
                pop: { secs: [] },
                /* 2026-10-21 UX 개선 29: 모바일 섹션 칩, UX 개선 3: SAP 맨 위 발표 영상 썸네일 */
                mobileChips: [],
                sapHeroVideo: { thumb: "", url: "", caption: "" },
                card: this._emptyCard()
            });
            this.getView().setModel(this._oVm, "vm");

            this._loadContent();
            window.addEventListener("hashchange", this._hashHandler);
        },

        onExit: function () {
            window.removeEventListener("hashchange", this._hashHandler);
            this._heroToken = (this._heroToken || 0) + 1;   /* 헤드라인 순환 멈춤 */
            if (this._fnHeroResize) { window.removeEventListener("resize", this._fnHeroResize); }
        },

        onAfterRendering: function () {
            var oOverlay = this.byId("drawerOverlay");
            if (oOverlay && !this._bOverlayBound) {
                this._bOverlayBound = true;
                oOverlay.attachBrowserEvent("click", this._closeDrawer.bind(this));
            }
            // 두 줄 메뉴: 아래 설명 줄을 눌러도 같은 화면으로 이동
            var that = this;
            [["navSapSub", "sap"], ["navPublicSub", "public"]].forEach(function (a) {
                var oSub = that.byId(a[0]);
                if (oSub && !oSub.data("bound")) {
                    oSub.data("bound", true);
                    oSub.attachBrowserEvent("click", function () { that._setHash(a[1]); });
                }
            });
        },

        /* ============================== loading ================================ */

        _loadContent: function () {
            var that = this;
            var aJobs = CONTENT_PARTS.map(function (sPart) {
                return fetch(APP_BASE + "/model/content/" + sPart + ".json")
                    .then(function (oRes) {
                        if (!oRes.ok) { throw new Error(sPart + ".json HTTP " + oRes.status); }
                        return oRes.json();
                    });
            });

            Promise.all(aJobs)
                .then(function (aData) {
                    var oAll = {};
                    CONTENT_PARTS.forEach(function (sPart, i) { oAll[sPart] = aData[i]; });
                    that._oC.setData(oAll);
                    that._buildVm(oAll);
                    that._bReady = true;
                    that._applyHash();
                })
                .catch(function (oError) {
                    /* 가짜 데이터로 채우지 않는다. 빈 화면과 안내만 */
                    console.error("[content]", oError);
                    MessageToast.show("콘텐츠를 불러오지 못했습니다. npm run content:build 를 먼저 실행했는지 확인하세요.");
                    that._bReady = true;
                    that._applyHash();
                });
        },

        /** 화면용 가공 값 */
        _buildVm: function (oAll) {
            var oVm = this._oVm;

            /* 메뉴 이름: site.md 의 nav 를 화면 자리로 옮김 */
            (oAll.site.nav || []).forEach(function (n) {
                if (n.group) { oVm.setProperty("/nav/group", n.group); return; }
                if (n.key === "home") {
                    oVm.setProperty("/nav/home", n.label);
                    (n.children || []).forEach(function (c) { oVm.setProperty("/nav/" + c.key, c.label); });
                }
                if (n.key === "sap") {
                    oVm.setProperty("/nav/sap", n.label);
                    oVm.setProperty("/nav/sapSub", n.sub || "");
                    (n.children || []).forEach(function (c) { oVm.setProperty("/nav/" + c.key, c.label); });
                }
                if (n.key === "public") {
                    oVm.setProperty("/nav/public", n.label); oVm.setProperty("/nav/publicSub", n.sub || "");
                    /* 결정 P-I: 공공 하위 메뉴 이름은 /nav/pub_<key> (SAP 와 key 가 겹쳐서 나눔) */
                    (n.children || []).forEach(function (c) { oVm.setProperty("/nav/pub_" + c.key, c.label); });
                }
            });

            /* 하이라이트: 번호 문구, 축 이름, 이미지가 없는 카드의 개념도 단계 (home.md flow) */
            var aHl = ((oAll.home.highlights || {}).items || []).map(function (h) {
                return {
                    no: h.no,
                    noText: (h.no < 10 ? "0" : "") + h.no,
                    axis: h.axis,
                    axisLabel: h.axis === "sap" ? "SAP" : "공공 웹시스템",
                    title: h.title,
                    one: h.one || "",
                    points: h.points || [],
                    imageSrc: h.imageSrc || "",
                    flow: h.flow || [],
                    to: h.to
                };
            });
            oVm.setProperty("/highlights", aHl);

            /* 홈 헤드라인 5종 (순서 고정) */
            this._heroSlides = (((oAll.home || {}).hero || {}).slides || []).map(function (sl, i) {
                return { label: (i < 9 ? "0" : "") + (i + 1) + " / " + sl.label, text: sl.text || "" };
            });
            this._startHero();

            /* SAP 화면 */
            var oSap = oAll.sap || {};
            var that = this;
            oVm.setProperty("/sapPrograms", (oSap.programs || []).map(function (c) { return that._toCatItem(c, "sap"); }));
            /* v0.8 결정 C: shared.mainModules 에 적힌 모듈만 핵심 공통 기능, 나머지는 보조 도구 */
            var aMainMod = ((oSap.shared || {}).mainModules) || null;
            var fnIsMain = function (c) { return !aMainMod || aMainMod.indexOf(c.key) !== -1; };
            oVm.setProperty("/sapModules", (oSap.modules || []).filter(fnIsMain).map(function (c) { return that._toCatItem(c, "sap"); }));
            oVm.setProperty("/sapModulesAux", (oSap.modules || []).filter(function (c) { return !fnIsMain(c); }).map(function (c) { return that._toCatItem(c, "sap"); }));
            /* 0.2: CO 흐름도. lane = 줄, tracks = 줄 안의 나란한 경로, target = 경로가 모이는 곳,
               nodes 안의 branch = 상태별 분기(세로로 쌓임), independent = 화살표 없는 독립 기능 */
            var fnFlowNode = function (n) {
                return {
                    title: n.title || "", sub: n.sub || "", go: n.go || "", role: n.role || "",
                    tag: n.tag || "", label: n.label || "", wide: (n.sub || "").length > 40
                };
            };
            oVm.setProperty("/sapFlow", ((oSap.flow || {}).lanes || []).map(function (lane) {
                return {
                    name: lane.name,
                    ind: lane.independent ? "y" : "n",
                    merge: lane.target ? "y" : "n",
                    target: lane.target ? fnFlowNode(lane.target) : { title: "", sub: "", role: "", label: "" },
                    tracks: (lane.tracks || []).filter(function (t) { return t.visible !== false; }).map(function (t) {
                        return {
                            label: t.label || "",
                            groups: (t.nodes || []).map(function (n) {
                                return n.branch
                                    ? { branch: "y", nodes: n.branch.map(fnFlowNode) }
                                    : { branch: "n", nodes: [fnFlowNode(n)] };
                            })
                        };
                    })
                };
            }));

            this._buildSapProjectVm(oSap);

            /* 공공 화면 */
            this._buildPubVm(oAll["public"] || {});
        },

        /** v0.8 SAP 프로젝트 페이지: 목표 번호, E2E 단계 링크, CO 3단계, 공통 기능 흐름, 요약 패널 9개, 표 */
        _buildSapProjectVm: function (oSap) {
            var oVm = this._oVm;
            var that = this;
            var aCards = (oSap.programs || []).concat(oSap.modules || []);
            var fnCard = function (k) { return aCards.filter(function (c) { return c.key === k; })[0]; };
            var fnNum = function (i) { return (i < 9 ? "0" : "") + (i + 1); };

            oVm.setProperty("/sapGoals", ((oSap.overview || {}).goals || []).map(function (g, i) {
                return { num: fnNum(i), title: g.title, text: g.text || "", asis: g.asis || [], tobe: g.tobe || [] };
            }));

            /* 개요 카드: 확인된 기존 정보표를 재배치 */
            var aOverviewRows = ((oSap.overview || {}).table || []);
            var fnOverviewRow = function (key) { return aOverviewRows.filter(function (row) { return row.key === key; })[0] || {}; };
            oVm.setProperty("/sapOverviewMetrics", [["성과", "구분"], ["역할", "구현 범위"], ["기간", "인원"], ["기술", ""]].map(function (keys) {
                var row = fnOverviewRow(keys[0]);
                return { label: row.key || "", value: row.value || "", detail: keys[1] ? (fnOverviewRow(keys[1]).value || "") : "" };
            }));

            var oHero = oSap.hero || {};
            /* 2026-10-21 UX 개선 3: 발표 영상 썸네일 (YouTube 주소에서 영상 id 를 꺼내 썸네일 주소를 만듦) */
            var oVid = oHero.video || {};
            var mVid = /(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/.exec(oVid.url || "");
            oVm.setProperty("/sapHeroVideo", mVid
                ? { thumb: "https://i.ytimg.com/vi/" + mVid[1] + "/hqdefault.jpg", url: "https://www.youtube.com/watch?v=" + mVid[1], caption: oVid.caption || "" }
                : { thumb: "", url: "", caption: "" });
            this._sapHeroTabs = (oHero.previewTabs || []).map(function (tab) {
                return Object.assign({}, tab, { images: tab.key === "programs" ? (oHero.shots || []) : (tab.images || []) });
            });
            this._selectSapHeroTab(oVm.getProperty("/sapHeroTab"));
            this._selectSapOverviewTab(oVm.getProperty("/sapOverviewTab"));

            var oProc = oSap.process || {};
            oVm.setProperty("/sapE2e", (((oProc.e2e || {}).steps) || []).map(function (st) {
                return {
                    no: st.no, title: st.title, items: st.items, challenge: st.challenge, modules: st.modules,
                    toCo: !!st.toCo,
                    team: st.team || "",
                    /* 상세가 있는 카드만 링크 (없는 key 는 빼서 깨진 링크를 만들지 않음) */
                    links: (st.programs || []).map(fnCard).filter(Boolean).map(function (c) { return { title: c.title, to: "sap/" + c.key }; })
                };
            }));
            oVm.setProperty("/sapCoSteps", (((oProc.co || {}).steps) || []).map(function (st, i) {
                return { num: fnNum(i), title: st.title, text: st.text, to: fnCard(st.go) ? "sap/" + st.go : "sap/co" };
            }));

            var mWho = { "팀원 개발": "팀", "호출한 공통 기능": "공동" };
            oVm.setProperty("/sapChain", ((oSap.shared || {}).chain || []).map(function (st, i) {
                return {
                    num: fnNum(i), title: st.title, sub: st.sub || "", who: st.who || "",
                    role: mWho[st.who] || "직접",
                    to: st.go && fnCard(st.go) ? "sap/" + st.go : ""
                };
            }));

            /* 03 카드 전용 데이터: 기술 ID를 가져오지 않고 기존 상세 key만 연결 */
            var aDeliverables = [];
            (((oSap.panels || {}).groups) || []).forEach(function (group) {
                (group.items || []).forEach(function (item) {
                    if (!fnCard(item.key)) { return; }
                    aDeliverables.push({
                        url: "#sap/" + item.key, code: item.code, type: item.type,
                        phase: item.phase, title: item.title, desc: item.one,
                        points: item.points || [], tags: item.tags || []
                    });
                });
            });
            oVm.setProperty("/sapDeliverables", aDeliverables);

            oVm.setProperty("/sapTables", {
                team: that._toTable((oSap.team || {}).head, (oSap.team || {}).rows, function (r) { return r[r.length - 1] === "본인" ? "y" : "n"; }),
                interfaces: that._toTable(((oProc.e2e || {}).interfaces || {}).head, ((oProc.e2e || {}).interfaces || {}).rows),
                assess: that._toTable(((oSap.outcomes || {}).assess || {}).head, ((oSap.outcomes || {}).assess || {}).rows),
                /* 0.2: 04 이동유형별 회계처리 기준, 05 산출물과 활용 목적 */
                movements: that._toTable(((oSap.shared || {}).movements || {}).head, ((oSap.shared || {}).movements || {}).rows),
                outputs: that._toTable((oSap.outputs || {}).head, ((oSap.outputs || {}).items || []).map(function (o) { return [o.title, o.purpose || o.sub || "", o.role || ""]; }))
            });
        },

        /** 머리말 표(head, rows 배열) → 상세 화면과 같은 표 모양 (첫 칸 글이 7자 이상이면 첫 열을 넓게) */
        _toTable: function (aHead, aRows, fnMine) {
            aHead = aHead || [];
            aRows = aRows || [];
            return {
                cols: String(aHead.length),
                first: aRows.some(function (r) { return String(r[0] || "").length > 6; }) ? "wide" : "narrow",
                head: aHead,
                rows: aRows.map(function (r) {
                    return { mine: fnMine ? fnMine(r) : "n", cells: aHead.map(function (h, k) { return { h: h, v: r[k] || "" }; }) };
                })
            };
        },

        _emptyTable: function () {
            return { cols: "0", first: "narrow", head: [], rows: [] };
        },

        /** 공공 화면용 값 (영역 필터 알약, 되살린 기능의 카드 링크) */
        _buildPubVm: function (oPub) {
            var aCards = oPub.cards || [];
            this._oVm.setProperty("/pubAreas", [{ label: "전체", value: "all" }].concat(
                ((oPub.catalog || {}).areas || []).map(function (a) { return { label: a.key + " " + a.name, value: a.key }; })));
            this._oVm.setProperty("/pubRevive", ((oPub.revive || {}).items || []).map(function (r) {
                return {
                    title: r.title, before: r.before, did: r.did, after: r.after,
                    links: (r.cards || []).map(function (k) {
                        var c = aCards.filter(function (x) { return x.key === k; })[0];
                        return c ? { title: c.title, to: "public/" + k } : null;
                    }).filter(Boolean)
                };
            }));
            this._filterPub();
            this._buildPubProjectVm(oPub);
        },

        /** v0.8 공공 프로젝트 페이지: 번호 카드, 대표 사례와 관련 기록, 개선, 운영 사례, 연계 흐름, 표 */
        _buildPubProjectVm: function (oPub) {
            var oVm = this._oVm;
            var aCards = oPub.cards || [];
            var fnNum = function (i) { return (i < 9 ? "0" : "") + (i + 1); };
            var fnNumbered = function (a) { return (a || []).map(function (x, i) { return { num: fnNum(i), title: x.title, text: x.text }; }); };
            /* 기록 링크: 카드가 실제로 있을 때만 (없는 key 는 빼서 깨진 링크를 만들지 않음) */
            /* 0.2: 기록은 key 문자열 또는 { key, type, sub } (type = 이 사례 안에서의 수행 유형, sub = 작은 기술 부제) */
            var fnRecords = function (aKeys) {
                return (aKeys || []).map(function (r) {
                    var oR = typeof r === "string" ? { key: r } : (r || {});
                    var c = aCards.filter(function (x) { return x.key === oR.key; })[0];
                    if (!c) { return null; }
                    var sRole = oR.type || c.role || "";
                    return { title: c.title, to: "public/" + c.key, role: sRole, badge: sRole === "직접 개발" ? "직접" : "공동", year: c.year || "", sub: oR.sub || "" };
                }).filter(Boolean);
            };
            var meta = (oPub.hero || {}).meta || [];
            oVm.setProperty("/pubSummary", [
                { key: "기간", value: meta[0] || "" },
                { key: "직접 한 일", value: meta[2] || "" },
                { key: "사업", value: meta[1] || "" },
                { key: "사용 대상", value: meta[3] || "" }
            ]);
            var oOv = oPub.overview || {};
            var oCases = oPub.cases || {};
            var oFeat = oCases.featured || {};
            var oOps = oPub.operations || {};
            var oOut = oPub.outcomes || {};
            var oProc = oPub.process || {};

            oVm.setProperty("/pubRoles", fnNumbered(oOv.roles));
            oVm.setProperty("/pubFeatPoints", fnNumbered(oFeat.points));
            oVm.setProperty("/pubFeatRecords", fnRecords(oFeat.records));
            oVm.setProperty("/pubPanels", (oCases.panels || []).map(function (p) {
                return { code: p.code, title: p.title, tags: p.tags || [], one: p.one || "", purpose: p.purpose || p.meaning || "", role: p.role || "", direction: p.direction || "", records: fnRecords(p.records) };
            }));
            oVm.setProperty("/pubOps", (oOps.items || []).map(function (p) {
                return { code: p.code, title: p.title, situation: p.situation || "", analysis: p.analysis || p.view || "", action: p.action || "", result: p.result || "", tags: p.tags || [], records: fnRecords(p.records) };
            }));
            var mWho = { "직접 개발": "직접", "외부 원천": "팀", "사용자 활용": "팀" };
            oVm.setProperty("/pubChain", (oProc.chain || []).map(function (st, i) {
                return { num: fnNum(i), title: st.title, sub: st.sub || "", who: st.who || "", role: mWho[st.who] || "공동" };
            }));
            oVm.setProperty("/pubApproach", (oOps.approachSteps || []).map(function (t, i) { return { num: fnNum(i), text: t }; }));
            oVm.setProperty("/pubContrib", (oOut.contrib || []).map(function (x, i) { return { num: fnNum(i), title: x.title, text: x.text, role: x.role || "" }; }));
            oVm.setProperty("/pubRetroCards", fnNumbered(oOut.retroCards));
            oVm.setProperty("/pubTables", {
                scope: this._toTable((oOv.scope || {}).head, (oOv.scope || {}).rows),
                data: this._toTable((oProc.data || {}).head, (oProc.data || {}).rows),
                /* 0.2: 05 산출물과 업무 목적, 결론의 역할 연결 표 */
                outputs: this._toTable((oPub.outputs || {}).head, ((oPub.outputs || {}).items || []).map(function (o) { return [o.title, o.purpose || o.sub || ""]; })),
                bridge: this._toTable((oOut.bridge || {}).head, (oOut.bridge || {}).rows)
            });
        },

        /** 공공 카탈로그: 영역 필터와 "직접 개발만 보기" 를 반영해 영역 묶음을 다시 만듦 */
        _filterPub: function () {
            var oPub = this._oC.getProperty("/public") || {};
            var sArea = this._oVm.getProperty("/pubArea");
            var bDirect = this._oVm.getProperty("/pubDirect");
            var that = this;
            var aGroups = ((oPub.catalog || {}).areas || []).map(function (a) {
                var aCards = (oPub.cards || []).filter(function (c) {
                    return c.area === a.key && (sArea === "all" || sArea === a.key) && (!bDirect || c.role === "직접 개발");
                }).map(function (c) { return that._toCatItem(c, "public"); });
                return { key: a.key, name: a.name, desc: a.desc, cards: aCards };
            }).filter(function (g) { return g.cards.length > 0; });
            this._oVm.setProperty("/pubGroups", aGroups);
        },

        /* ============================ 홈 헤드라인 ============================ */
        /*
         * 01은 타이핑 없이 바로 4.5초, 02~05는 글자당 65ms 타이핑 뒤 2.8초 유지,
         * 넘어갈 때 0.2초 페이드아웃, 05 다음은 다시 01.
         * prefers-reduced-motion 이면 01만 고정 표시.
         */
        HERO: { firstHold: 4500, fullHold: 2800, typing: 65, fade: 200 },

        _heroHtml: function (sText, bCursor) {
            var sSafe = String(sText || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
                .replace(/\|/g, '<span class="pfSpD"> </span><br class="pfBrM">');
            return sSafe + (bCursor ? '<span class="pfCursor"></span>' : "");
        },

        _startHero: function () {
            var aSlides = this._heroSlides || [];
            var oVm = this._oVm;
            var that = this;
            var oHead = this.byId("heroHead");
            var iToken = this._heroToken = (this._heroToken || 0) + 1;
            if (!aSlides.length) { return; }

            var bReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            oVm.setProperty("/hero/label", aSlides[0].label);
            oVm.setProperty("/hero/html", this._heroHtml(aSlides[0].text, !bReduced));
            this._fitHeroLater();
            if (bReduced) { return; }

            /* 다른 탭에 가 있는 동안은 멈춰 있다가 돌아오면 이어서 */
            var fnWait = function (iMs) {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        if (iToken !== that._heroToken) { reject(new Error("stop")); return; }
                        if (!document.hidden) { resolve(); return; }
                        var fnBack = function () {
                            if (document.hidden) { return; }
                            document.removeEventListener("visibilitychange", fnBack);
                            if (iToken !== that._heroToken) { reject(new Error("stop")); } else { resolve(); }
                        };
                        document.addEventListener("visibilitychange", fnBack);
                    }, iMs);
                });
            };

            var H = this.HERO;
            var fnShow = function (i) {
                var oSlide = aSlides[i];
                oVm.setProperty("/hero/label", oSlide.label);
                if (oHead) { oHead.removeStyleClass("pfFade"); }
                if (i === 0) {
                    oVm.setProperty("/hero/html", that._heroHtml(oSlide.text, true));
                    return fnWait(H.firstHold);
                }
                var aChars = Array.from(oSlide.text);
                var p = Promise.resolve();
                aChars.forEach(function (c, n) {
                    p = p.then(function () {
                        oVm.setProperty("/hero/html", that._heroHtml(aChars.slice(0, n + 1).join(""), true));
                        return fnWait(H.typing);
                    });
                });
                return p.then(function () { return fnWait(H.fullHold); });
            };

            var fnLoop = function (i) {
                return fnShow(i)
                    .then(function () {
                        if (oHead) { oHead.addStyleClass("pfFade"); }
                        return fnWait(H.fade);
                    })
                    .then(function () { return fnLoop((i + 1) % aSlides.length); });
            };
            fnLoop(0).catch(function () { /* 순환을 멈춘 경우 */ });
        },

        /** 가장 긴 헤드라인 높이만큼 자리를 잡아 두어 문장이 바뀔 때 아래 내용이 들썩이지 않게 */
        _fitHero: function () {
            var oWrap = this.byId("heroHeadWrap");
            var oHead = this.byId("heroHead");
            var oDom = oHead && oHead.getDomRef();
            if (!oDom || !oDom.offsetWidth) { return; }
            var oProbe = oDom.cloneNode(false);
            oProbe.removeAttribute("id");
            oProbe.style.cssText = "position:absolute;visibility:hidden;left:0;top:0;width:" + oDom.offsetWidth + "px;";
            oDom.parentNode.appendChild(oProbe);
            var iMax = 0;
            var that = this;
            (this._heroSlides || []).forEach(function (sl) {
                oProbe.innerHTML = that._heroHtml(sl.text, true);
                iMax = Math.max(iMax, oProbe.offsetHeight);
            });
            oProbe.parentNode.removeChild(oProbe);
            this._iHeroMin = iMax;
            if (oWrap.getDomRef()) { oWrap.getDomRef().style.minHeight = iMax + "px"; }
        },

        _fitHeroLater: function () {
            var that = this;
            var oWrap = this.byId("heroHeadWrap");
            if (!this._bHeroDelegate && oWrap) {
                this._bHeroDelegate = true;
                oWrap.addEventDelegate({
                    onAfterRendering: function () {
                        if (that._iHeroMin && oWrap.getDomRef()) { oWrap.getDomRef().style.minHeight = that._iHeroMin + "px"; }
                    }
                });
                this._fnHeroResize = function () {
                    clearTimeout(that._iHeroResize);
                    that._iHeroResize = setTimeout(that._fitHero.bind(that), 150);
                };
                window.addEventListener("resize", this._fnHeroResize);
            }
            setTimeout(this._fitHero.bind(this), 300);
            if (document.fonts && document.fonts.ready) { document.fonts.ready.then(this._fitHero.bind(this)); }
        },

        /** 카탈로그 카드 한 장 */
        _toCatItem: function (c, sAxis) {
            var aShots = c.shots || [];
            var bPub = sAxis === "public";
            var sCode = bPub ? c.area + (c.no < 10 ? "0" : "") + c.no : "";
            return {
                key: c.key,
                axis: sAxis,
                to: sAxis + "/" + c.key,
                kind: bPub ? sCode : (c.kind || ""),
                tag: c.tag || "",
                title: c.title,
                /* 공공 카드는 한 줄 소개가 따로 없어 "문제" 첫 문단을 씀 */
                one: c.one || ((((c.sec || {})["문제"] || {}).paras || [])[0] || ""),
                role: c.role || "",
                principles: c.principles || [],
                thumbSrc: aShots.length ? aShots[0].src : "",
                emptyText: bPub ? "화면정의서 이미지 자리" : "이미지 자리",
                hlText: c.highlight ? "\u2605 홈 " + c.highlight : "",
                metaText: bPub ? [c.areaName, c.year].filter(Boolean).join("  |  ") : [c.kind, c.id].filter(Boolean).join("  |  "),
                year: c.year || ""
            };
        },

        _emptyCard: function () {
            return {
                axis: "sap", axisLabel: "", listTo: "sap", title: "", key: "",
                shots: [], shot: {}, shotIndex: 0, topSecs: [], panels: [],
                isCase: false, isProgramDetail: false, caseData: { points: [], facts: [], links: [] }, caseSecs: [], projectLabel: "",
                principles: [], sources: [], movements: [], prev: null, next: null
            };
        },

        /** 카드 상세 화면용 값 */
        _buildCard: function (sAxis, oCard) {
            var oData = this._oC.getData();
            var bProgramDetail = sAxis === "sap" && (oData.sap.programs || []).some(function (p) { return p.key === oCard.key; });
            var aList = sAxis === "sap"
                ? (bProgramDetail ? (oData.sap.programs || []) : (oData.sap.programs || []).concat(oData.sap.modules || []))
                : (oData["public"].cards || []);
            var iIdx = aList.indexOf(oCard);
            var fnLink = function (c) { return c ? { title: c.title, to: sAxis + "/" + c.key } : null; };
            var mSec = oCard.sec || {};

            var aShots = (oCard.shots || []).map(function (sh, i) {
                return { i: i, src: sh.src, caption: sh.caption || "" };
            });

            var aTop = TOP_SECS.filter(function (t) { return mSec[t]; }).map(function (t) {
                return {
                    title: t,
                    paras: mSec[t].paras || [],
                    items: (mSec[t].items || []).map(function (x, i) { return { n: String(i + 1), text: x }; })
                };
            });

            var aPanelNames = PANEL_SECS.concat(Object.keys(mSec).filter(function (t) {
                return TOP_SECS.indexOf(t) < 0 && PANEL_SECS.indexOf(t) < 0;
            }));
            var aPanels = aPanelNames.filter(function (t) { return mSec[t]; }).map(function (t) {
                return {
                    title: t,
                    paras: mSec[t].paras || [],
                    items: (mSec[t].items || []).map(function (x) { return { text: x }; }),
                    code: mSec[t].code || null,
                    /* SAP: 깊게 카드만 핵심 로직을 펼쳐 둠. 공공: 짧은 결과와 역할은 펼치고 핵심 로직만 접음 (목업 v3) */
                    expanded: sAxis === "public" ? t !== "핵심 로직" : (t === "핵심 로직" && oCard.depth === "깊게")
                };
            });

            /* v0.7 사례형 상세 (layout: case): 섹션을 md 순서대로, 블록 단위로 */
            var bCase = oCard.layout === "case";
            var oCase = oCard["case"] || {};
            var aCaseSecs = bCase ? ((oCase.sections && oCase.sections.length) ? oCase.sections : (oCard.secOrder || Object.keys(mSec))).map(function (t, i) {
                return {
                    num: (i < 9 ? "0" : "") + (i + 1),
                    title: t,
                    blocks: ((mSec[t] || {}).blocks || []).map(function (b) {
                        return {
                            t: b.t, text: b.text || "", items: b.items || [], lang: b.lang || "", src: b.src || "",
                            cols: String(b.cols || 0), head: b.head || [], rows: b.rows || [],
                            /* 표 첫 칸 글이 길면(7자 이상) 첫 열을 넓게 */
                            first: (b.rows || []).some(function (r) { return String(((r.cells || [])[0] || {}).v || "").length > 6; }) ? "wide" : "narrow"
                        };
                    })
                };
            }) : [];
            /* 자료 버튼: 실제 http(s) 주소가 있는 것만 */
            var aLinks = (oCase.links || []).filter(function (l) { return l && /^https?:\/\//.test(String(l.url || "")); });
            var sNavLabel = this._oVm.getProperty("/nav/" + sAxis) || "";

            /* v0.8 결정 E: SAP 상세 위쪽 경로 (SAP 프로젝트 > 03 담당 프로그램 또는 04 공통 기능 개발 > 이름) */
            var oSapCrumb = null;
            if (sAxis === "sap") {
                var bSapModule = ((this._oC.getData().sap || {}).modules || []).some(function (c) { return c.key === oCard.key; });
                oSapCrumb = bSapModule
                    ? { midText: "03 담당 프로그램 / 공통 기능 개발", midTo: "sap/shared" }
                    : { midText: "03 담당 프로그램", midTo: "sap/programs" };
            }

            this._oVm.setProperty("/card", {
                sapCrumb: oSapCrumb,
                isCase: bCase,
                isProgramDetail: bProgramDetail,
                caseData: {
                    summary: oCase.summary || "",
                    points: (oCase.points || []).map(function (p, i) {
                        return { num: (i < 9 ? "0" : "") + (i + 1), title: p.title || "", text: p.text || "" };
                    }),
                    facts: oCase.facts || [],
                    links: aLinks,
                    listTo: oCase.listTo || "",
                    listLabel: oCase.listLabel || ""
                },
                caseSecs: aCaseSecs,
                projectLabel: oCase.project || sNavLabel,
                projectTo: oCase.projectTo || sAxis,
                axis: sAxis,
                axisLabel: sNavLabel || (sAxis === "sap" ? "SAP 프로그램" : "공공 시스템 기능 설계"),
                /* v0.8 결정 F: 공통 모듈 상세의 "목록으로"는 04 공통 기능 개발로 */
                listTo: (oSapCrumb && oSapCrumb.midTo === "sap/shared") ? "sap/shared" : sAxis,
                key: oCard.key,
                title: oCard.title,
                step: oCard.step || oCard.areaName || "",
                hlText: oCard.highlight ? "\u2605 홈 주요 구현 사례 " + oCard.highlight : "",
                role: oCard.role || "",
                kind: sAxis === "public" ? (oCard.area + " " + (oCard.areaName || "")) : (oCard.kind || ""),
                tag: oCard.tag || "",
                std: oCard.std || "",
                id: oCard.id || (sAxis === "public" ? oCard.area + (oCard.no < 10 ? "0" : "") + oCard.no : ""),
                metaText: oCard.lines ? "코드 " + Number(oCard.lines).toLocaleString("ko-KR") + "줄" : (oCard.year || ""),
                one: oCard.one || "",
                shots: aShots,
                shotIndex: 0,
                shot: aShots[0] || {},
                noshot: aShots.length ? "" : (typeof oCard.noshot === "string" ? oCard.noshot
                    : ""),   /* 0.2: 증빙 이미지가 없을 때 빈 이미지 자리를 보이지 않음 (공공 기록 포함) */
                topSecs: aTop,
                movements: oCard.movements || [],
                principles: oCard.principles || [],
                note: oCard.note || "",
                panels: aPanels,
                sources: oCard.sources || [],
                prev: fnLink(aList[iIdx - 1]),
                next: fnLink(aList[iIdx + 1])
            });
        },

        _emptyContent: function () {
            return {
                site: { brand: {}, nav: [], profile: { lines: [], chips: [] }, contact: {} },
                home: {
                    hero: { primary: {}, secondary: {}, slides: [], points: [] }, photo: {}, idcard: { tags: [] },
                    glance: { items: [] }, highlights: { items: [] }, axes: { sap: {}, "public": {} },
                    career: { items: [] }, skills: { groups: [], certs: [] }
                },
                sap: { programs: [], modules: [] },
                "public": { cards: [] }
            };
        },

        /* ============================== routing ================================ */

        _parseHash: function () {
            var sHash = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));

            /* 옛 주소는 새 주소로 바꾸고 다시 해석 */
            var sLegacy = LEGACY[sHash] || (/^module\//.test(sHash) ? "sap" : (/^post\//.test(sHash) ? "sap" : null));
            if (sLegacy) {
                window.history.replaceState(null, "", "#" + sLegacy);
                sHash = sLegacy;
            }

            var aParts = sHash.split("/").filter(Boolean);
            var sBase = aParts[0] || "home";
            var sSub = aParts[1] || "";

            if (sBase === "home") { return { page: "home" }; }
            if (HOME_ALIAS[sBase]) {
                var sHomeAnchor = HOME_ALIAS[sBase];
                /* 0.2: 옛 영문 주소(#highlights, #career)는 한글 주소로 바꿔 둠 */
                if (sBase !== HOME_HASH[sHomeAnchor]) { window.history.replaceState(null, "", "#" + HOME_HASH[sHomeAnchor]); }
                return { page: "home", anchor: sHomeAnchor };
            }
            if (sBase === "contact") { return { page: "home" }; }   /* v0.6: 연락처 섹션 삭제, 옛 주소는 홈 맨 위로 */
            if (sBase === "sap") {
                if (!sSub) { return { page: "sap" }; }
                if (SAP_ANCHORS[sSub]) { return { page: "sap", anchor: sSub }; }
                return { page: "card", axis: "sap", key: sSub };
            }
            if (sBase === "public") {
                if (!sSub) { return { page: "public" }; }
                if (PUB_ANCHORS[sSub]) { return { page: "public", anchor: sSub }; }
                /* 0.2: 공공 기록은 상세 페이지 대신 03 기록 목록 위 레이어 팝업 */
                return { page: "public", anchor: "catalog", popup: sSub };
            }
            return { page: "invalid" };
        },

        _applyHash: function () {
            if (!this._bReady) { return; }
            var oRoute = this._parseHash();

            if (oRoute.page === "invalid") {
                MessageToast.show("없는 주소입니다. 홈으로 이동합니다.");
                this._setHash("home");
                return;
            }

            /* 성과 인라인 영상: 다른 페이지나 섹션으로 이동하면 재생 종료 */
            var outcomeReport = this.byId("sapOutcomeReport");
            if (outcomeReport && (oRoute.page !== "sap" || oRoute.anchor !== "outcomes")) {
                outcomeReport.stopVideo();
            }

            /* 0.2: 공공 기록 팝업 열기와 닫기 (스크롤 위치와 필터는 건드리지 않음) */
            if (this._handlePubPop(oRoute)) { return; }

            /* 브라우저 뒤로 가기로 카드에서 목록에 돌아오면 원래 스크롤 위치를 되살림 (앱 안 버튼, 메뉴는 맨 위 또는 지정 섹션) */
            var bRestore = !this._bAppNav && this._sPrevPage === "card" && oRoute.page !== "card" && !oRoute.anchor;
            this._bAppNav = false;

            if (oRoute.page === "card") {
                var oCard = this._findCard(oRoute.axis, oRoute.key);
                if (oCard && oCard.key !== oRoute.key) {
                    /* 프로그램 ID 로 들어온 주소는 카드 주소로 바꿔 한 상세만 쓰게 함 */
                    window.history.replaceState(null, "", "#" + oRoute.axis + "/" + oCard.key);
                }
                if (!oCard) {
                    MessageToast.show("카드를 찾을 수 없습니다: " + oRoute.key);
                    this._setHash(oRoute.axis);
                    return;
                }
                this._buildCard(oRoute.axis, oCard);
            }

            var mPage = { home: "pageHome", sap: "pageSap", "public": "pagePublic", card: "pageCard" };
            if (oRoute.page === "home") { setTimeout(this._fitHero.bind(this), 350); }
            /* 개선 1 (공공): #public/catalog 로 들어오면 목록을 펼친 채로 보여 줌 */
            if (oRoute.page === "public" && oRoute.anchor === "catalog") { this._oVm.setProperty("/pubCatOpen", true); }
            if (oRoute.page === "sap") {
                if (["co", "flow", "e2e"].indexOf(oRoute.anchor) >= 0) {
                    this._oVm.setProperty("/sapProcessTab", oRoute.anchor === "e2e" ? "e2e" : "co");
                }
                if (oRoute.anchor === "shared") { this._oVm.setProperty("/sapProgramTab", "shared"); }
                else if (["programs", "catalog"].indexOf(oRoute.anchor) >= 0) { this._oVm.setProperty("/sapProgramTab", "all"); }
                sap.ui.getCore().applyChanges();
            }
            if (oRoute.page === "public") {
                this._selectPubSection(oRoute.anchor || "overview");
            }
            this._showPage(mPage[oRoute.page], oRoute.anchor, bRestore);
            this._syncActiveNav(oRoute);
            this._closeDrawer();
            this._sPrevPage = oRoute.page;

            /* 브라우저 탭 제목 */
            var sTitle = DOC_TITLE;
            if (oRoute.page === "card") { sTitle = this._oVm.getProperty("/card/title") + " | " + DOC_TITLE; }
            else if (oRoute.page === "sap" || oRoute.page === "public") { sTitle = this._oVm.getProperty("/nav/" + oRoute.page) + " | " + DOC_TITLE; }
            document.title = sTitle;
        },

        /* ======================= 0.2 공공 기록 레이어 팝업 ====================== */

        /**
         * 주소에 따라 팝업을 열거나 닫음. 처리했으면 true (나머지 화면 전환은 하지 않음)
         *  - #public/{카드key}: 공공 페이지에 있으면 그 자리에서 팝업만 엶. 다른 화면이나 직접 주소면 03 기록 목록으로 옮긴 뒤 엶
         *  - 팝업이 열린 채 공공 페이지 주소로 바뀌면(뒤로 가기) 팝업만 닫고 스크롤은 그대로
         */
        _handlePubPop: function (oRoute) {
            var bPubNow = this.byId("navCon").getCurrentPage() === this.byId("pagePublic");
            var bOpen = !!(this._oPop && this._oPop.isOpen());

            if (oRoute.page === "public" && oRoute.popup) {
                var oRec = this._findCard("public", oRoute.popup);
                if (!oRec) {
                    this._bAppNav = false;
                    MessageToast.show("기록을 찾을 수 없습니다: " + oRoute.popup);
                    this._setHash("public/catalog");
                    return true;
                }
                if (oRec.key !== oRoute.popup) { window.history.replaceState(null, "", "#public/" + oRec.key); }
                /* 공공 페이지 안에서 눌러 연 팝업만 뒤로 가기로 닫음. 다른 곳에서 왔으면 닫을 때 03 목록 주소로 바꿈 */
                var bPushed = !!this._bAppNav && bPubNow;
                this._bAppNav = false;
                if (!bPubNow) {
                    this._revealPubRec(oRec);
                    this._showPage("pagePublic", "catalog", false);
                }
                this._syncActiveNav(oRoute);
                this._closeDrawer();
                this._sPrevPage = "public";
                document.title = oRec.title + " | " + DOC_TITLE;
                this._openPubPop(oRec, bPushed, bPubNow ? 0 : 360);
                return true;
            }

            if (bOpen) {
                this._bPopPushed = false;
                this._oPop.close();
            }
            if (oRoute.page === "public" && bPubNow && (bOpen || this._bPopBack)) {
                this._bPopBack = false;
                this._bAppNav = false;
                this._syncActiveNav(oRoute);
                document.title = this._oVm.getProperty("/nav/public") + " | " + DOC_TITLE;
                return true;
            }
            this._bPopBack = false;
            return false;
        },

        /** 다른 화면에서 들어올 때: 목록을 펼치고, 지금 필터에 가려진 기록이면 필터를 풀어 보이게 함 */
        _revealPubRec: function (oRec) {
            this._selectPubSection("cases");
            this._oVm.setProperty("/pubCatOpen", true);
            var sArea = this._oVm.getProperty("/pubArea");
            var bChanged = false;
            if (sArea !== "all" && sArea !== oRec.area) { this._oVm.setProperty("/pubArea", "all"); bChanged = true; }
            if (this._oVm.getProperty("/pubDirect") && oRec.role !== "직접 개발") { this._oVm.setProperty("/pubDirect", false); bChanged = true; }
            if (bChanged) { this._filterPub(); }
        },

        /** 팝업 내용: 상세 페이지와 같은 public.json cards 의 한 항목에서 만듦 (내용을 따로 두지 않음) */
        _buildPubPop: function (oRec) {
            var mSec = oRec.sec || {};
            var LABEL = { "문제": "문제 상황", "설계 내용": "설계 및 개발 내용" };
            var ORDER = ["문제", "설계 내용", "핵심 로직", "@principles", "결과", "다시 한다면"];
            var LAST = "내가 한 일과 팀이 한 일";
            var aNames = ORDER.concat(Object.keys(mSec).filter(function (t) {
                return ORDER.indexOf(t) < 0 && t !== LAST;
            })).concat([LAST]);
            var aSecs = aNames.map(function (t) {
                if (t === "@principles") {
                    var aPr = oRec.principles || [];
                    return aPr.length ? { title: "설계 판단", paras: [], steps: [], bullets: [], tags: aPr, code: null } : null;
                }
                var o = mSec[t];
                if (!o) { return null; }
                var aItems = o.items || [];
                var bSteps = t === "설계 내용";
                return {
                    title: LABEL[t] || t,
                    paras: o.paras || [],
                    steps: bSteps ? aItems.map(function (x, i) { return { n: String(i + 1), text: x }; }) : [],
                    bullets: bSteps ? [] : aItems,
                    tags: [],
                    code: o.code || null
                };
            }).filter(function (x) {
                return x && (x.paras.length || x.steps.length || x.bullets.length || x.tags.length || x.code);
            });
            this._oVm.setProperty("/pop", {
                key: oRec.key,
                code: oRec.area + (oRec.no < 10 ? "0" : "") + oRec.no,
                area: oRec.area + " " + (oRec.areaName || ""),
                role: oRec.role || "",
                roleKey: oRec.role === "직접 개발" ? "직접" : "공동",
                year: oRec.year || "",
                title: oRec.title,
                note: oRec.note || "",
                secs: aSecs
            });
        },

        _getPubPop: function () {
            var that = this;
            if (!this._pPop) {
                this._pPop = Fragment.load({
                    id: this.getView().getId(),
                    name: "portfolio.dashboard.view.PubRecord",
                    controller: this
                }).then(function (oDlg) {
                    that.getView().addDependent(oDlg);
                    /* ESC: 직접 닫아 주소와 함께 처리 */
                    oDlg.setEscapeHandler(function (oPromise) { oPromise.reject(); that.onPubPopClose(); });
                    oDlg.attachAfterOpen(that._bindBlockLayer.bind(that));
                    that._oPop = oDlg;
                    return oDlg;
                });
            }
            return this._pPop;
        },

        _openPubPop: function (oRec, bPushed, iDelay) {
            var that = this;
            this._bPopPushed = bPushed;
            this._buildPubPop(oRec);
            this._getPubPop().then(function (oDlg) {
                var fnTop = function () { var oC = oDlg.getDomRef("cont"); if (oC) { oC.scrollTop = 0; } };
                if (oDlg.isOpen()) { fnTop(); return; }
                setTimeout(function () {
                    /* 휴대폰 폭에서는 전체 화면 */
                    oDlg.setStretch(window.matchMedia("(max-width: 600px)").matches);
                    document.documentElement.classList.add("pfPopOn");
                    oDlg.open();
                    fnTop();
                }, iDelay || 0);
            });
        },

        /** X, 닫기, ESC, 바깥 배경: 페이지 안에서 연 팝업은 뒤로 가기, 아니면 03 목록 주소로 바꿈 */
        onPubPopClose: function () {
            if (!this._oPop || !this._oPop.isOpen()) { return; }
            this._oPop.close();
            if (this._bPopPushed) {
                this._bPopPushed = false;
                this._bPopBack = true;
                window.history.back();
            } else {
                window.history.replaceState(null, "", "#public/catalog");
                document.title = this._oVm.getProperty("/nav/public") + " | " + DOC_TITLE;
                this._syncActiveNav({ page: "public", anchor: "catalog" });
            }
        },

        /** 바깥 반투명 배경을 누르면 열린 팝업(공공 기록 또는 구현 정보)을 닫음 (한 번만 연결) */
        _bindBlockLayer: function () {
            var that = this;
            var oBl = document.getElementById("sap-ui-blocklayer-popup");
            if (oBl && !oBl.getAttribute("data-pf-pop")) {
                oBl.setAttribute("data-pf-pop", "y");
                oBl.addEventListener("click", function () {
                    if (that._oPop && that._oPop.isOpen()) { that.onPubPopClose(); }
                    else if (that._oDev && that._oDev.isOpen()) { that.onDevInfoClose(); }
                });
            }
        },

        /* ============ 0.2 홈 "구현 정보 보기" 팝업 (주소는 바꾸지 않음) ============ */

        onDevInfoOpen: function () {
            var that = this;
            if (!this._pDev) {
                this._pDev = Fragment.load({
                    id: this.getView().getId(),
                    name: "portfolio.dashboard.view.DevInfo",
                    controller: this
                }).then(function (oDlg) {
                    that.getView().addDependent(oDlg);
                    oDlg.attachAfterOpen(that._bindBlockLayer.bind(that));
                    that._oDev = oDlg;
                    return oDlg;
                });
            }
            this._pDev.then(function (oDlg) {
                if (oDlg.isOpen()) { return; }
                oDlg.setStretch(window.matchMedia("(max-width: 600px)").matches);
                document.documentElement.classList.add("pfPopOn");
                oDlg.open();
                var oC = oDlg.getDomRef("cont");
                if (oC) { oC.scrollTop = 0; }
            });
        },

        onDevInfoClose: function () {
            if (this._oDev && this._oDev.isOpen()) { this._oDev.close(); }
        },

        /** 포커스는 sap.m.Dialog 가 "구현 정보 보기" 링크로 되돌림 */
        onDevInfoAfterClose: function () {
            document.documentElement.classList.remove("pfPopOn");
        },

        onPubPopAfterClose: function () {
            /* 포커스는 sap.m.Dialog 가 연 직전의 요소(누른 기록 제목)로 되돌림. 배경 어둡게 한 것만 해제 */
            document.documentElement.classList.remove("pfPopOn");
        },

        _findCard: function (sAxis, sKey) {
            var oData = this._oC.getData();
            var aList = sAxis === "sap"
                ? (oData.sap.programs || []).concat(oData.sap.modules || [])
                : (oData["public"].cards || []);
            var sId = String(sKey || "").toUpperCase();
            return aList.filter(function (c) { return c.key === sKey; })[0]
                || aList.filter(function (c) { return c.id && String(c.id).toUpperCase() === sId; })[0];
        },

        _setHash: function (sHash) {
            this._bAppNav = true;
            /* 0.2: 한글 주소(#이력 등)는 브라우저가 인코딩해 두므로 풀어서 비교 */
            var sNow = window.location.hash;
            try { sNow = decodeURIComponent(sNow); } catch (e) { /* 그대로 비교 */ }
            if (sNow === "#" + sHash) {
                this._applyHash();
            } else {
                window.location.hash = sHash;
            }
        },

        _showPage: function (sPageId, sAnchor, bRestore) {
            var oNavCon = this.byId("navCon");
            var oPage = this.byId(sPageId);
            var oCur = oNavCon.getCurrentPage();
            this._mScroll = this._mScroll || {};
            if (oCur && oCur !== oPage && oCur.getScrollDelegate && oCur.getScrollDelegate()) {
                this._mScroll[oCur.getId()] = oCur.getScrollDelegate().getScrollTop();
            }
            var iRestore = bRestore ? this._mScroll[oPage.getId()] : null;
            var bChanged = oNavCon.getCurrentPage() !== oPage;
            if (bChanged) {
                oNavCon.to(oPage.getId(), "show");
            }

            /* 같은 이름의 섹션 주소(overview 등)가 SAP 와 공공에 함께 있어 화면별로 고름 */
            var mAnchor = sPageId === "pagePublic" ? PUB_ANCHORS
                : (sPageId === "pageSap" ? SAP_ANCHORS : HOME_ANCHORS);
            var oTarget = sAnchor && mAnchor[sAnchor] ? this.byId(mAnchor[sAnchor]) : null;

            /* 페이지가 그려진 다음 스크롤 */
            setTimeout(function () {
                if (oTarget && oTarget.getDomRef()) {
                    /* 다른 화면에서 넘어온 직후에는 부드러운 스크롤이 끊길 수 있어 바로 이동.
                       0.2: scrollIntoView 는 바깥 틀까지 밀어 모바일 상단 바 아래로 제목이 숨어서, 페이지 스크롤 영역만 움직임 */
                    var oEl = oTarget.getDomRef();
                    var oSc = oPage.getDomRef();
                    if (oSc && oSc.scrollTo) {
                        var iMargin = parseFloat(window.getComputedStyle(oEl).scrollMarginTop) || 0;
                        if (sPageId === "pagePublic") {
                            var nav = this.byId("pubSectionNav");
                            var navDom = nav && nav.getDomRef();
                            if (navDom) { iMargin = Math.max(iMargin, navDom.getBoundingClientRect().height + 18); }
                        }
                        var iY = oSc.scrollTop + oEl.getBoundingClientRect().top - oSc.getBoundingClientRect().top - iMargin;
                        oSc.scrollTo({ top: Math.max(0, iY), behavior: bChanged ? "auto" : "smooth" });
                    } else {
                        oEl.scrollIntoView({ behavior: bChanged ? "auto" : "smooth", block: "start" });
                    }
                } else if (typeof iRestore === "number" && oPage.scrollTo) {
                    oPage.scrollTo(0, iRestore);
                } else if (oPage.scrollTo) {
                    oPage.scrollTo(0, 0);
                }
            }.bind(this), bChanged ? 150 : 60);
        },

        _syncActiveNav: function (oRoute) {
            var that = this;
            var mActive = {
                navHome: oRoute.page === "home" && !oRoute.anchor,
                navSap: oRoute.page === "sap" || (oRoute.page === "card" && oRoute.axis === "sap"),
                navPublic: oRoute.page === "public" || (oRoute.page === "card" && oRoute.axis === "public")
            };
            Object.keys(mActive).forEach(function (sId) {
                var oBtn = that.byId(sId);
                if (oBtn) { oBtn.toggleStyleClass("pfActive", mActive[sId]); }
                var oBlock = that.byId(sId + "Block");
                if (oBlock) { oBlock.toggleStyleClass("pfActive", mActive[sId]); }
            });

            /* 2026-10-21 UX 개선 29: 모바일 섹션 칩 (홈, SAP, 공공 메인에서만) */
            this._setMobileChips(oRoute.page === "home" || oRoute.page === "sap" || oRoute.page === "public" ? oRoute.page : "");

            /* 0.2 홈 하위 메뉴: 지정 섹션 하나만 강조, 스크롤 위치로도 바뀜 */
            this._setHomeSub(oRoute.page === "home" ? (oRoute.anchor || "") : "");
            this._bindHomeSpy();

            /* SAP 하위 메뉴: 프로그램과 공통 기능 상세는 모두 03 담당 프로그램 */
            var bSap = mActive.navSap;
            this._oVm.setProperty("/nav/sapOpen", bSap);
            var sSub = "";
            if (oRoute.page === "sap" && oRoute.anchor) { sSub = SAP_NAV[oRoute.anchor] || ""; }
            if (oRoute.page === "card" && oRoute.axis === "sap") {
                sSub = "programs";
            }
            this._setSapSub(sSub);
            this._bindSapSpy();

            /* 결정 P-I: 공공 하위 메뉴. 공공 화면과 공공 상세에서 펼침. 상세(카드 30개)는 03 */
            this._oVm.setProperty("/nav/pubOpen", mActive.navPublic);
            var sPubSub = "";
            if (oRoute.page === "public" && oRoute.anchor) { sPubSub = PUB_NAV[oRoute.anchor] || ""; }
            if (oRoute.page === "card" && oRoute.axis === "public") { sPubSub = "cases"; }
            this._setPubSub(sPubSub);
            this._bindPubSpy();
        },

        /** 0.2: 홈 하위 메뉴 하나만 강조. 빈 값이면 홈 자체를 강조 (홈 화면일 때) */
        _setHomeSub: function (sSub) {
            var that = this;
            this._sHomeSub = sSub;
            var bHome = this.byId("navCon").getCurrentPage() === this.byId("pageHome");
            Object.keys(HOME_SUB_IDS).forEach(function (k) {
                var oBtn = that.byId(HOME_SUB_IDS[k]);
                if (oBtn) { oBtn.toggleStyleClass("pfActive", bHome && k === sSub); }
            });
            var oHome = this.byId("navHome");
            if (oHome) { oHome.toggleStyleClass("pfActive", bHome && !sSub); }
            this._markChip("home", sSub);
        },

        /** 0.2: 홈 스크롤 위치로 하위 메뉴 강조 (한 번만 연결) */
        _bindHomeSpy: function () {
            var oPage = this.byId("pageHome");
            var oDom = oPage && oPage.getDomRef();
            if (!oDom || this._bHomeSpy) { return; }
            this._bHomeSpy = true;
            var that = this;
            var iTimer = null;
            oDom.addEventListener("scroll", function () {
                if (iTimer) { return; }
                iTimer = setTimeout(function () {
                    iTimer = null;
                    if (that.byId("navCon").getCurrentPage() !== oPage) { return; }
                    var iTop = oDom.getBoundingClientRect().top + 140;
                    var sCur = "";
                    HOME_SPY.forEach(function (a) {
                        var oSec = that.byId(a[1]);
                        var oRef = oSec && oSec.getDomRef();
                        if (oRef && oRef.getBoundingClientRect().top <= iTop) { sCur = a[0]; }
                    });
                    /* 맨 아래까지 내려 마지막 섹션 제목이 기준선에 닿지 않아도 마지막 메뉴를 강조 */
                    if (oDom.scrollTop + oDom.clientHeight >= oDom.scrollHeight - 4) { sCur = HOME_SPY[HOME_SPY.length - 1][0]; }
                    if (sCur !== that._sHomeSub) { that._setHomeSub(sCur); }
                }, 120);
            }, { passive: true });
        },

        /** 결정 P-I: 공공 하위 메뉴 하나만 강조 */
        _setPubSub: function (sSub) {
            var that = this;
            this._sPubSub = sSub;
            Object.keys(PUB_SUB_IDS).forEach(function (k) {
                var oBtn = that.byId(PUB_SUB_IDS[k]);
                if (oBtn) { oBtn.toggleStyleClass("pfActive", k === sSub); }
            });
            this._markChip("public", sSub);
        },

        /** 결정 P-I: 공공 페이지 스크롤 위치로 하위 메뉴 강조 (한 번만 연결) */
        _bindPubSpy: function () {
            var oPage = this.byId("pagePublic");
            var oDom = oPage && oPage.getDomRef();
            if (!oDom || this._bPubSpy) { return; }
            this._bPubSpy = true;
            var that = this;
            var iTimer = null;
            oDom.addEventListener("scroll", function () {
                if (iTimer) { return; }
                iTimer = setTimeout(function () {
                    iTimer = null;
                    if (that.byId("navCon").getCurrentPage() !== oPage || !that._oVm.getProperty("/pubShowAll")) { return; }
                    var iTop = oDom.getBoundingClientRect().top + 140;
                    var sCur = "";
                    PUB_SPY.forEach(function (a) {
                        var oSec = that.byId(a[1]);
                        var oRef = oSec && oSec.getDomRef();
                        if (oRef && oRef.getBoundingClientRect().top <= iTop) { sCur = a[0]; }
                    });
                    if (sCur !== that._sPubSub) { that._setPubSub(sCur); }
                    // Update only the tab header while scrolling; do not rerender the sections.
                    var tabs = that.byId("pubSectionTabs");
                    if (tabs && sCur && tabs.getSelectedKey() !== sCur) { tabs.setSelectedKey(sCur); }
                }, 120);
            }, { passive: true });
        },

        /** SAP 하위 메뉴 하나만 강조 (빈 값이면 모두 해제) */
        _setSapSub: function (sSub) {
            var that = this;
            this._sSapSub = sSub;
            Object.keys(SAP_SUB_IDS).forEach(function (k) {
                var oBtn = that.byId(SAP_SUB_IDS[k]);
                if (oBtn) { oBtn.toggleStyleClass("pfActive", k === sSub); }
            });
            this._markChip("sap", sSub);
        },

        /** SAP 페이지를 스크롤하면 지금 보이는 섹션의 하위 메뉴를 강조 (한 번만 연결) */
        _bindSapSpy: function () {
            var oPage = this.byId("pageSap");
            var oDom = oPage && oPage.getDomRef();
            if (!oDom || this._bSapSpy) { return; }
            this._bSapSpy = true;
            var that = this;
            var iTimer = null;
            oDom.addEventListener("scroll", function () {
                if (iTimer) { return; }
                iTimer = setTimeout(function () {
                    iTimer = null;
                    if (that.byId("navCon").getCurrentPage() !== oPage) { return; }
                    var iTop = oDom.getBoundingClientRect().top + 140;
                    var sCur = "";
                    SAP_SPY.forEach(function (a) {
                        var oSec = that.byId(a[1]);
                        var oRef = oSec && oSec.getDomRef();
                        if (oRef && oRef.getBoundingClientRect().top <= iTop) { sCur = a[0]; }
                    });
                    if (sCur !== that._sSapSub) { that._setSapSub(sCur); }
                }, 120);
            }, { passive: true });
        },

        /* ============================ event handlers =========================== */

        /** 사이드바와 버튼: customData "to" 로 이동 */
        onNav: function (oEvent) {
            this._setHash(oEvent.getSource().data("to"));
        },

        /** 개선 1 (공공): 03 전체 기록 목록 접기와 펼치기 */
        onPubCatFold: function () {
            this._oVm.setProperty("/pubCatOpen", !this._oVm.getProperty("/pubCatOpen"));
        },

        /** v0.8 개선 2: 05 접기와 펼치기 */
        onSapFold: function (oEvent) {
            var sKey = oEvent.getSource().data("fold");
            var sPath = "/sapFold/" + sKey;
            this._oVm.setProperty(sPath, !this._oVm.getProperty(sPath));
        },

        _selectSapHeroTab: function (key) {
            var tabs = this._sapHeroTabs || [];
            var tab = tabs.filter(function (item) { return item.key === key; })[0] || tabs[0];
            if (!tab) { return; }
            this._oVm.setProperty("/sapHeroTab", tab.key);
            this._oVm.setProperty("/sapHeroActive", { images: (tab.images || []).map(function (m) {
                return Object.assign({}, m, { src: m.src ? this.fmtMedia(m.src) : "" });
            }, this), points: tab.points || [], to: tab.to });
        },

        onSapHeroTabSelect: function (event) { this._selectSapHeroTab(event.getParameter("key")); },

        _selectSapOverviewTab: function (key) {
            var tabs = this._oC.getProperty("/sap/overview/tabs") || [];
            var tab = tabs.filter(function (t) { return t.key === key; })[0] || tabs[0];
            if (!tab) { return; }
            this._oVm.setProperty("/sapOverviewTab", tab.key);
            this._oVm.setProperty("/sapOverviewSections", tab.sections || []);
        },

        onSapOverviewTabSelect: function (event) { this._selectSapOverviewTab(event.getParameter("key")); },
        onSapProcessTabSelect: function (event) { this._oVm.setProperty("/sapProcessTab", event.getParameter("key")); },
        onSapProgramTabSelect: function (event) { this._oVm.setProperty("/sapProgramTab", event.getParameter("key")); },

        onSapMediaPress: function (event) {
            var media = event.getParameter("media"), that = this;
            if (!media) { return; }
            if (!this._oSapMedia) {
                this._sapMediaHtml = new HTML({ sanitizeContent: false });
                this._oSapMedia = new Dialog({ contentWidth: "1100px", contentHeight: "76vh", resizable: true,
                    horizontalScrolling: false, verticalScrolling: true,
                    content: [this._sapMediaHtml], endButton: new Button({text:"닫기",press:function () { that._oSapMedia.close(); }}),
                    afterClose: function () { that._sapMediaHtml.setContent(""); }
                }).addStyleClass("pfSapMediaDialog");
                this.getView().addDependent(this._oSapMedia);
            }
            this._oSapMedia.setTitle(media.caption || "프로젝트 시각 자료");
            if (media.videoUrl === "https://www.youtube.com/watch?v=LRzabWyFz90") {
                this._sapMediaHtml.setContent('<div class="pfSapVideoFrame"><iframe title="최종 프로젝트 발표 영상" src="https://www.youtube.com/embed/LRzabWyFz90?rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="pfSapVideoFallback">영상이 재생되지 않으면 <a href="https://www.youtube.com/watch?v=LRzabWyFz90" target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a></p>');
            } else if (media.src) {
                var safe = function (s) { return String(s || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); };
                this._sapMediaHtml.setContent('<div class="pfSapPhotoFrame"><img src="'+safe(media.src)+'" alt="'+safe(media.caption)+'"></div>');
            } else { return; }
            this._oSapMedia.open();
        },

        onGoPath: function (oEvent) {
            this._setHash(oEvent.getSource().data("to"));
        },

        /** 2026-10-21 UX 개선 3: SAP 맨 위 발표 영상 썸네일 → 기존 영상 팝업 */
        onSapHeroVideo: function () {
            var oVid = this._oVm.getProperty("/sapHeroVideo") || {};
            if (!oVid.url) { return; }
            this.onSapMediaPress({ getParameter: function () { return { videoUrl: oVid.url, caption: oVid.caption }; } });
        },

        /** 한눈에 보기 문장: 바인딩된 항목의 to */
        onGoItem: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("c");
            if (oCtx) { this._setHash(oCtx.getProperty("to")); }
        },

        /** 흐름도 노드 → 카드 상세 */
        onFlowNode: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("vm");
            if (oCtx && oCtx.getProperty("go")) { this._setHash("sap/" + oCtx.getProperty("go")); }
        },

        /** 카탈로그 종류 필터 (전체, ABAP, Fiori) */
        onSapKind: function (oEvent) {
            var sKind = oEvent.getSource().data("kind");
            this._oVm.setProperty("/sapKind", sKind);
            /* v0.8: 카탈로그 목록은 요약 패널로 바뀌어 화면에 없을 수 있음 */
            var oList = this.byId("sapCatalog");
            var oBinding = oList && oList.getBinding("items");
            if (oBinding) { oBinding.filter(sKind === "all" ? [] : [new Filter("kind", FilterOperator.EQ, sKind)]); }
        },

        /** Public tabs share the existing hash routes, including old aliases. */
        _selectPubSection: function (anchor) {
            this._oVm.setProperty("/pubTab", PUB_NAV[anchor] || "overview");
            sap.ui.getCore().applyChanges();
        },

        onPubTabSelect: function (event) {
            var key = event.getParameter("key");
            this._selectPubSection(key);
            this._setHash("public/" + key);
        },

        onPubShowAll: function (event) {
            var showAll = event.getParameter("selected");
            var tabs = this.byId("pubSectionTabs");
            var key = (tabs && tabs.getSelectedKey()) || this._oVm.getProperty("/pubTab") || "overview";
            this._oVm.setProperty("/pubShowAll", showAll);
            this._selectPubSection(key);
            this._showPage("pagePublic", key, false);
        },

        onPubAreaTabSelect: function (event) {
            this._oVm.setProperty("/pubArea", event.getParameter("key"));
            this._filterPub();
        },

        /** 공공 카탈로그 영역 필터 */
        onPubArea: function (oEvent) {
            this._oVm.setProperty("/pubArea", oEvent.getSource().data("area"));
            this._filterPub();
        },

        /** 공공 카탈로그 "직접 개발만 보기" */
        onPubDirect: function () {
            this._filterPub();
        },

        /** 카탈로그 카드 → 카드 상세 */
        onCardPress: function (oEvent) {
            var oCtx = oEvent.getParameter("listItem").getBindingContext("vm");
            if (oCtx) { this._setHash(oCtx.getProperty("to")); }
        },

        /** 상세 화면 썸네일 → 큰 화면 바꾸기 */
        onShotPick: function (oEvent) {
            var oShot = oEvent.getSource().getBindingContext("vm").getObject();
            this._oVm.setProperty("/card/shotIndex", oShot.i);
            this._oVm.setProperty("/card/shot", oShot);
        },

        onProgramDetailZoom: function (event) {
            var shot = event.getParameter("shot");
            if (!shot || !shot.src) { return; }
            this._oVm.setProperty("/card/shot", shot);
            this._oVm.setProperty("/card/shotIndex", shot.i);
            this.onShotZoom();
        },

        onProgramDetailCopy: function (event) {
            var code = event.getParameter("code");
            if (!code) { return; }
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                MessageToast.show("코드를 선택해 직접 복사해 주세요.");
                return;
            }
            navigator.clipboard.writeText(code)
                .then(function () { MessageToast.show("코드를 복사했습니다."); })
                .catch(function () { MessageToast.show("복사하지 못했습니다. 코드를 선택해 직접 복사해 주세요."); });
        },

        /** 큰 화면 → LightBox 로 확대 */
        onShotZoom: function () {
            var oShot = this._oVm.getProperty("/card/shot") || {};
            if (!oShot.src) { return; }
            if (!this._oLightBox) {
                this._oLightBoxItem = new LightBoxItem();
                this._oLightBox = new LightBox({ imageContent: [this._oLightBoxItem] });
                this.getView().addDependent(this._oLightBox);
            }
            this._oLightBoxItem.setImageSrc(this.fmtMedia(oShot.src));
            this._oLightBoxItem.setTitle(oShot.caption || "");
            this._oLightBoxItem.setAlt(oShot.caption || "");
            this._oLightBox.open();
        },

        onHighlightPress: function (oEvent) {
            var oCtx = oEvent.getParameter("listItem").getBindingContext("vm");
            if (oCtx) { this._setHash(oCtx.getProperty("to")); }
        },

        onCopyEmail: function () {
            var sMail = this._oC.getProperty("/site/contact/email") || "";
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(sMail)
                    .then(function () { MessageToast.show("이메일 주소를 복사했습니다."); })
                    .catch(function () { MessageToast.show(sMail); });
            } else {
                MessageToast.show(sMail);
            }
        },

        /** 2026-10-21 UX 개선 4: 이메일 보내기 (메일 앱) */
        onMailTo: function () {
            var sMail = this._oC.getProperty("/site/contact/email") || "";
            if (!sMail) { return; }
            mobileLibrary.URLHelper.triggerEmail(sMail, this._oC.getProperty("/site/closing/mailSubject") || "");
        },

        /** 2026-10-21 UX 개선 29: 모바일 상단 "연락" 버튼 → 이메일 보내기, 주소 복사, Credly */
        onContactMenu: function (oEvent) {
            var that = this;
            var oSrc = oEvent.getSource();
            if (!this._oContactSheet) {
                var fnLabel = function (sKey, sDefault) { return that._oC.getProperty("/site/closing/" + sKey) || sDefault; };
                this._oContactSheet = new ActionSheet({
                    placement: "Bottom",
                    cancelButtonText: "닫기",
                    buttons: [
                        new Button({ text: fnLabel("mailLabel", "이메일 보내기"), icon: "sap-icon://email", press: this.onMailTo.bind(this) }),
                        new Button({ text: fnLabel("copyLabel", "이메일 주소 복사"), icon: "sap-icon://copy", press: this.onCopyEmail.bind(this) }),
                        new Button({ text: fnLabel("credlyLabel", "Credly 배지 확인") + " ↗", icon: "sap-icon://badge", press: this.onOpenCredly.bind(this) })
                    ]
                }).addStyleClass("pfContactSheet");
                this.getView().addDependent(this._oContactSheet);
            }
            this._oContactSheet.openBy(oSrc);
        },

        /** 2026-10-21 UX 개선 29: 모바일 섹션 칩 목록 (페이지마다 다름) */
        _setMobileChips: function (sPage) {
            var oVm = this._oVm;
            var fnShort = function (s) { return String(s || "").replace(/^\d+\.\s*/, ""); };
            var aChips = [];
            if (sPage === "home") {
                aChips = ["highlights", "career", "skills"].map(function (k) {
                    return { key: k, label: oVm.getProperty("/nav/" + k), to: HOME_HASH[k], active: false };
                });
            } else if (sPage === "sap") {
                aChips = Object.keys(SAP_SUB_IDS).map(function (k) {
                    return { key: k, label: fnShort(oVm.getProperty("/nav/" + k)), to: "sap/" + k, active: false };
                });
            } else if (sPage === "public") {
                aChips = Object.keys(PUB_SUB_IDS).map(function (k) {
                    return { key: k, label: fnShort(oVm.getProperty("/nav/pub_" + k)), to: "public/" + k, active: false };
                });
            }
            this._sChipPage = sPage;
            oVm.setProperty("/mobileChips", aChips);
        },

        /** 2026-10-21 UX 개선 29: 지금 보는 섹션의 칩 강조 (하위 메뉴 강조와 같은 값) */
        _markChip: function (sPage, sKey) {
            if (this._sChipPage !== sPage) { return; }
            var aChips = this._oVm.getProperty("/mobileChips") || [];
            var bChanged = false;
            aChips.forEach(function (c) {
                var b = c.key === sKey;
                if (c.active !== b) { c.active = b; bChanged = true; }
            });
            if (!bChanged) { return; }
            this._oVm.setProperty("/mobileChips", aChips.slice());
            /* 강조된 칩이 가로 목록 밖에 있으면 보이게 */
            var oBar = this.byId("mobileChips");
            var oDom = oBar && oBar.getDomRef();
            setTimeout(function () {
                var oOn = oDom && oDom.querySelector('[data-on="y"]');
                if (oOn && oDom.scrollWidth > oDom.clientWidth) {
                    oDom.scrollTo({ left: Math.max(0, oOn.offsetLeft - 16), behavior: "smooth" });
                }
            }, 0);
        },

        onOpenCredly: function () {
            var sUrl = this._oC.getProperty("/site/contact/credly") || "";
            if (/^https?:\/\//.test(sUrl)) {
                mobileLibrary.URLHelper.redirect(sUrl, true);
            } else {
                MessageToast.show("Credly 주소를 아직 넣지 않았습니다 (content/site.md).");
            }
        },

        onToggleDrawer: function () {
            var oSidebar = this.byId("sidebar");
            var bOpen = !oSidebar.hasStyleClass("pfOpen");
            oSidebar.toggleStyleClass("pfOpen", bOpen);
            this.byId("drawerOverlay").toggleStyleClass("pfOpen", bOpen);
        },

        _closeDrawer: function () {
            this.byId("sidebar").removeStyleClass("pfOpen");
            this.byId("drawerOverlay").removeStyleClass("pfOpen");
        },

        /* ============================== formatters ============================= */

        /** 0.2: 홈 핵심 요약의 **굵게** 표시 (글은 먼저 이스케이프, ** 사이만 strong) */
        fmtBold: function (sText) {
            return String(sText || "")
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        },

        fmtBr: function (sText) {
            return String(sText || "")
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>");
        },

        /** build-content.js 가 붙인 상대 경로(media/content/...) → 앱 기준 경로 */
        fmtMedia: function (sPath) {
            if (!sPath) { return ""; }
            if (/^https?:\/\//i.test(sPath)) { return sPath; }
            return APP_BASE + "/" + String(sPath).replace(/^\//, "");
        },

        /** 괄호 밖의 " / " 마다 줄바꿈 (괄호 안 슬래시는 그대로). 예: "자격 4종 (ABAP / CO) / SQLD" */
        fmtSlashLinesOut: function (sText) {
            var aOut = [], sCur = "", iDepth = 0;
            Array.from(String(sText || "")).forEach(function (c) {
                if (c === "(") { iDepth++; }
                if (c === ")") { iDepth = Math.max(0, iDepth - 1); }
                if (c === "/" && iDepth === 0) { aOut.push(sCur.trim()); sCur = ""; return; }
                sCur += c;
            });
            aOut.push(sCur.trim());
            return aOut.filter(Boolean).join("\n");
        },

        /** "A / B / C" → 줄마다 하나씩 (슬래시는 빼고) */
        /** 0.2 이력: 기간(2020.02~2025.02)이 좁은 칸에서 ~ 뒤로만 줄바꿈되게 (표시만, 값은 그대로) */
        /**
         * 0.2 이력 타임라인 HTML. 시점(점)은 같은 폭의 칸에 놓고 선 위에 글, 기간(type: period)은 선 아래 음영 사각형.
         * 기간의 위치는 앞뒤 시점 사이를 날짜 비율로 나눠 정함 (칸 간격이 고르지 않은 시간 축). "|" 는 줄바꿈
         */
        fmtCareerHtml: function (oCareer) {
            var aItems = (oCareer && oCareer.items) || [];
            var aGroups = (oCareer && oCareer.groups) || [];
            var esc = function (x) {
                return String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
            };
            /* "|" 로 직접 나눈 줄은 그 줄 안에서 다시 꺾지 않음 */
            var lines = function (x) {
                var a = String(x || "").split("|").map(function (t) { return esc(t.trim()); }).filter(Boolean);
                return a.length > 1 ? a.map(function (t) { return '<span class="pfCtlLn">' + t + "</span>"; }).join("") : (a[0] || "");
            };
            var num = function (x) {
                var m = String(x || "").match(/^(\d{4})(?:\.(\d{1,2}))?/);
                return m ? (+m[1] + (m[2] ? (+m[2] - 1) / 12 : 0.5)) : NaN;
            };
            var aPts = aItems.filter(function (o) { return o.type !== "period"; });
            var aPer = aItems.filter(function (o) { return o.type === "period"; });
            var n = Math.max(aPts.length, 1), w = 100 / n;
            var aT = aPts.map(function (o) { return num(o.date); });
            var aX = aPts.map(function (o, i) { return (i + 0.5) * w; });
            var pos = function (d) {
                if (!aT.length) { return 0; }
                if (d <= aT[0]) { return Math.max(0, aX[0] - (aT[0] - d) * w / 2); }
                for (var i = 0; i < aT.length - 1; i++) {
                    if (d <= aT[i + 1]) { return aX[i] + (d - aT[i]) / ((aT[i + 1] - aT[i]) || 1) * w; }
                }
                return Math.min(100, aX[aX.length - 1] + (d - aT[aT.length - 1]) * w / 2);
            };
            var text = function (o) {
                return (o.cat ? '<span class="pfCtlCat">' + esc(o.cat) + "</span>" : "") +
                    '<span class="pfCtlDate">' + esc(o.date) + "</span>" +
                    '<span class="pfCtlTitle">' + lines(o.title) + "</span>" +
                    (o.detail ? '<span class="pfCtlDetail">' + lines(o.detail) + "</span>" : "");
            };
            var sTop = "", sDots = "", sBars = "", sBottom = "", fUsed = 0;
            aPts.forEach(function (o, i) {
                var k = o.key ? "y" : "n";
                sTop += '<div class="pfCtlPt" data-key="' + k + '">' + text(o) + "</div>";
                sDots += '<span class="pfCtlDot" data-key="' + k + '" style="left:' + aX[i].toFixed(2) + '%"></span>';
            });
            /* 묶음 상자 왼쪽 끝: 그 앞에서 끝난 기간 막대가 상자 안으로 들어가지 않게 함 */
            var aGrpLeft = aGroups.map(function (g) {
                var i = aPts.findIndex(function (o) { return String(o.date) === String(g.from); });
                return i < 0 ? 101 : i * w;
            });
            aPer.forEach(function (o) {
                var a = pos(num(o.from)), b = pos(num(o.to) + 1 / 12);
                /* 끝 달과 같은 시점 점이 있으면 그 점에서 끝냄 (예: 프로젝트는 대상 수상 시점에 끝남) */
                var iEnd = aPts.findIndex(function (p) { return String(p.date) === String(o.to); });
                if (iEnd >= 0) { b = aX[iEnd]; }
                aGrpLeft.forEach(function (gl) { if (a < gl && b > gl - 0.8) { b = gl - 0.8; } });
                var fW = Math.max(b - a, 0.5);
                sBars += '<span class="pfCtlBar" style="left:' + a.toFixed(2) + "%;width:" + fW.toFixed(2) + '%"></span>';
                var fTw = Math.max(fW, w * 1.75), fLeft = Math.max(a, fUsed);
                if (fLeft + fTw > 100) { fLeft = Math.max(fUsed, 100 - fTw); }
                sBottom += '<div class="pfCtlGap" style="flex-basis:' + Math.max(fLeft - fUsed, 0).toFixed(2) + '%"></div>' +
                    '<div class="pfCtlPer" style="flex-basis:' + fTw.toFixed(2) + '%">' + text(o) + "</div>";
                fUsed = fLeft + fTw;
            });
            /* 묶음 상자: 시간선 위에서만 from 시점 점부터 to 시점 점까지 감쌈 */
            var sGrp = "", aGrpRange = [];
            aGroups.forEach(function (g) {
                var i = aPts.findIndex(function (o) { return String(o.date) === String(g.from); });
                var j = aPts.findIndex(function (o) { return String(o.date) === String(g.to); });
                if (i < 0 || j < i) { return; }
                aGrpRange.push([num(g.from), num(g.to)]);
                sGrp += '<span class="pfCtlGrp" title="' + esc(g.label || "") + '" style="left:calc(' + aX[i].toFixed(2) + "% - 12px);width:calc(" + (aX[j] - aX[i]).toFixed(2) + '% + 24px)"></span>';
            });
            var inGrp = function (o) {
                var d = num(o.type === "period" ? o.from : o.date);
                return aGrpRange.some(function (r) { return d >= r[0] && d <= r[1]; });
            };
            var x0 = aX.length ? aX[0] : 0, x1 = aX.length ? aX[aX.length - 1] : 100;
            var sMob = aItems.map(function (o) {
                return '<li class="pfCtlMobItem" data-kind="' + (o.type === "period" ? "period" : "point") + '" data-key="' + (o.key ? "y" : "n") + '" data-grp="' + (inGrp(o) ? "y" : "n") + '">' + text(o) + "</li>";
            }).join("");
            return '<div class="pfCtl">' +
                '<div class="pfCtlWide">' +
                '<div class="pfCtlTop" style="grid-template-columns:repeat(' + n + ',minmax(0,1fr))">' + sTop + "</div>" +
                '<div class="pfCtlAxis"><span class="pfCtlLine" style="left:' + x0.toFixed(2) + "%;right:" + (100 - x1).toFixed(2) + '%"></span>' + sGrp + sBars + sDots + "</div>" +
                '<div class="pfCtlBottom">' + sBottom + "</div>" +
                "</div>" +
                '<ol class="pfCtlMob">' + sMob + "</ol>" +
                "</div>";
        },

        /** 0.2: SAP 01 핵심 요약 번호 (01, 02, 03) */
        fmtSumNo: function (s) {
            var a = ((this.getView().getModel("c") || { getProperty: function () { return []; } }).getProperty("/sap/overview/summary")) || [];
            var i = a.indexOf(s);
            return i < 0 ? "" : (i < 9 ? "0" : "") + (i + 1);
        },

        fmtTlDate: function (s) {
            return s ? String(s).replace(/~/g, "~\u200B") : "";
        },

        fmtSlashLines: function (sText) {
            return String(sText || "").split(/\s*\/\s*/).join("\n");
        },

        /** home.md photo.file (img/ 아래 경로) → media/content 경로 */
        fmtPhoto: function (sFile) {
            return sFile ? APP_BASE + "/media/content/" + sFile : "";
        }
    });
});
