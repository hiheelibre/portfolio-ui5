/**
 * Dashboard.controller.js — Enterprise Developer Portfolio
 * ---------------------------------------------------------------
 * 데이터 원칙 (빌드 타임 정적 콘텐츠):
 *  - 프로젝트: model/modules.json → 사이드바 / Selected Projects / 순서 / 분류
 *              model/posts/{Module}/{PostId}.json (Controller 캐시)
 *  - 자기소개: model/profile.json (Hero/About/Story/Strengths/How I Work/Closing)
 *              로딩 실패 시 빈 골격으로 폴백 — 앱 전체가 깨지지 않음
 *  - 이미지: JSON에 기록된 로컬 상대경로(media/notion/...)만 사용
 *  - 브라우저에서 Notion API / API Key / Build Hook 절대 사용 금지
 *
 * 라우팅 (hash):
 *  #dashboard | #module/{Code} | #post/{Module}/{PostId} | #skills | #career
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/library"
], function (Controller, JSONModel, MessageToast, mobileLibrary) {
    "use strict";

    var APP_BASE = sap.ui.require.toUrl("portfolio/dashboard");

    return Controller.extend("portfolio.dashboard.controller.Dashboard", {

        /* ============================== lifecycle ============================== */

        onInit: function () {
            this._postCache = {};
            this._modules = {};
            this._hashHandler = this._applyHash.bind(this);

            /* 뷰 모델: 빈 골격만 유지 (프로젝트 데이터 하드코딩 금지) */
            this._oVm = new JSONModel({
                nav: { groups: [] },
                cards: [],
                module: this._emptyModule(),
                post: this._emptyPost(),
                postError: "",
                route: "dashboard"
            });
            this.getView().setModel(this._oVm, "vm");

            /* 사이트 공통 콘텐츠 (브랜드/Skills/Career 페이지) */
            var oSiteModel = new JSONModel();
            oSiteModel.loadData(APP_BASE + "/config/site.json");
            this.getView().setModel(oSiteModel, "site");

            /* 자기소개 콘텐츠 (Dashboard 전용) — 실패해도 앱은 정상 동작 */
            this._loadProfile();

            this._loadModules();

            window.addEventListener("hashchange", this._hashHandler);
        },

        onExit: function () {
            window.removeEventListener("hashchange", this._hashHandler);
        },

        onAfterRendering: function () {
            var oOverlay = this.byId("drawerOverlay");
            if (oOverlay && !this._bOverlayBound) {
                this._bOverlayBound = true;
                oOverlay.attachBrowserEvent("click", this._closeDrawer.bind(this));
            }
        },

        /* ============================ initial loading =========================== */

        /** profile.json — 자기소개/철학/스토리/강점/작업방식 (하드코딩 금지) */
        _loadProfile: function () {
            var oProfileModel = new JSONModel(this._emptyProfile());
            this.getView().setModel(oProfileModel, "profile");

            fetch(APP_BASE + "/model/profile.json")
                .then(function (oRes) {
                    if (!oRes.ok) { throw new Error("HTTP " + oRes.status); }
                    return oRes.json();
                })
                .then(function (oData) {
                    oProfileModel.setData(oData);
                })
                .catch(function (oError) {
                    /* 빈 골격 유지 → Dashboard 고정 문구만 비고 앱은 정상 */
                    console.warn("[profile] profile.json 로딩 실패:", oError.message);
                });
        },

        /** modules.json — 앱 시작 시 1회 로딩 */
        _loadModules: function () {
            var that = this;

            fetch(APP_BASE + "/model/modules.json")
                .then(function (oRes) {
                    if (!oRes.ok) { throw new Error("HTTP " + oRes.status); }
                    return oRes.json();
                })
                .then(function (oData) {
                    that._modules = (oData && oData.modules) || {};
                    that._buildNav();
                    that._buildCards();
                    that._applyHash();          /* 새로고침 시 현재 hash 복원 */
                    that._playStaggeredEntrance();
                })
                .catch(function (oError) {
                    /* 가짜 데이터 폴백 금지 — 빈 상태 + 안내만 표시 */
                    MessageToast.show("modules.json을 불러오지 못했습니다: " + oError.message);
                    that._applyHash();
                });
        },

        /**
         * 사이드바: modules.json의 Group/GroupOrder 기준 동적 그룹화.
         * - Published 모듈만 modules.json에 존재하므로 그대로 표시
         * - 대분류: GroupOrder 오름차순 / 그룹 내부: Order 오름차순
         * - Group 없는 과거 데이터는 "SAP S/4HANA"로 폴백 (하위 호환)
         */
        _buildNav: function () {
            var that = this;
            var oGroupMap = {};

            this._sortedModuleCodes().forEach(function (sCode) {
                var oModule = that._modules[sCode];
                var sGroup = that._groupOf(oModule);
                var nGroupOrder = that._groupOrderOf(oModule);

                /* 병합 키: 공백/대소문자 차이("SAP S/4 HANA" vs "SAP S/4HANA")를 흡수 */
                var sKey = sGroup.replace(/\s+/g, "").toUpperCase();

                if (!oGroupMap[sKey]) {
                    oGroupMap[sKey] = { title: sGroup, order: nGroupOrder, items: [] };
                }
                oGroupMap[sKey].order = Math.min(oGroupMap[sKey].order, nGroupOrder);

                oGroupMap[sKey].items.push({
                    code: sCode,
                    label: oModule.displayName ||
                        (oModule.subtitle ? sCode + " " + oModule.subtitle : oModule.title || sCode),
                    domain: that._domainOf(oModule)
                });
            });

            var aGroups = Object.keys(oGroupMap)
                .map(function (sKey) { return oGroupMap[sKey]; })
                .sort(function (a, b) { return a.order - b.order; });

            this._oVm.setProperty("/nav/groups", aGroups);
        },

        /**
         * Selected Projects 카드: modules.json의 모듈(시스템) 단위로 구성.
         * - SAP 그룹 먼저(GroupOrder), 그룹 내부는 Order 순
         * - 카드 클릭 → #module/{Code} 상세 페이지
         */
        _buildCards: function () {
            var that = this;
            var aCards = [];

            var aModules = this._sortedModuleCodes().map(function (sCode) {
                return { code: sCode, module: that._modules[sCode] };
            });

            aModules.sort(function (a, b) {
                var nGroup = that._groupOrderOf(a.module) - that._groupOrderOf(b.module);
                if (nGroup !== 0) { return nGroup; }
                return (a.module.order || 0) - (b.module.order || 0);
            });

            aModules.forEach(function (oEntry, i) {
                var oModule = oEntry.module;
                aCards.push({
                    code: oEntry.code,
                    domain: that._domainOf(oModule),
                    groupLabel: that._groupOf(oModule),
                    title: oModule.displayName || oModule.title || oEntry.code,
                    summary: oModule.description || oModule.subtitle || "",
                    metaLabel: oModule.subtitle || oModule.process || "",
                    index: (i + 1 < 10 ? "0" : "") + (i + 1)
                });
            });

            this._oVm.setProperty("/cards", aCards);
        },

        _sortedModuleCodes: function () {
            var that = this;
            return Object.keys(this._modules).sort(function (a, b) {
                var nA = that._modules[a].order || 0;
                var nB = that._modules[b].order || 0;
                return nA - nB;
            });
        },

        /** Group 폴백: Group → (구)Domain=LEGACY → 기본 "SAP S/4HANA" */
        _groupOf: function (oModule) {
            if (oModule.group) { return oModule.group; }
            if (String(oModule.domain || "").toUpperCase() === "LEGACY") {
                return "NON-SAP SYSTEM";
            }
            return "SAP S/4HANA";
        },

        /** GroupOrder 폴백: 명시값 → 알려진 그룹 기본값(SAP=10/NON-SAP=20) → 999 */
        _groupOrderOf: function (oModule) {
            if (oModule.groupOrder) { return Number(oModule.groupOrder); }
            var sGroup = this._groupOf(oModule);
            if (sGroup === "SAP S/4HANA") { return 10; }
            if (sGroup === "NON-SAP SYSTEM") { return 20; }
            return 999;
        },

        /**
         * 배지/비주얼 색상용 도메인: 그룹 기준으로 일관 파생.
         * (sync가 Domain 미입력 시 "SAP"을 기본 저장하므로 저장값 대신
         *  그룹을 신뢰해야 NON-SAP 모듈이 올바른 스타일을 받는다)
         */
        _domainOf: function (oModule) {
            var sKey = this._groupOf(oModule).replace(/\s+/g, "").toUpperCase();
            return sKey === "SAPS/4HANA" ? "SAP" : "LEGACY";
        },

        /* ============================= hash routing ============================ */

        _parseHash: function () {
            var sHash = window.location.hash.replace(/^#\/?/, "");
            var aParts = sHash.split("/").filter(Boolean);

            if (aParts.length === 0 || aParts[0] === "dashboard") {
                return { route: "dashboard" };
            }
            if (aParts[0] === "skills") { return { route: "skills" }; }
            if (aParts[0] === "career") { return { route: "career" }; }
            if (aParts[0] === "module" && aParts[1]) {
                return { route: "module", module: aParts[1].toUpperCase() };
            }
            if (aParts[0] === "post" && aParts[1] && aParts[2]) {
                return { route: "post", module: aParts[1].toUpperCase(), postId: aParts[2] };
            }
            return { route: "invalid" };
        },

        _applyHash: function () {
            var oRoute = this._parseHash();
            var that = this;

            switch (oRoute.route) {
                case "dashboard":
                    this._showPage("pageDashboard");
                    break;

                case "skills":
                    this._showPage("pageSkills");
                    break;

                case "career":
                    this._showPage("pageCareer");
                    break;

                case "module": {
                    var oModule = this._modules[oRoute.module];
                    if (!oModule) {
                        MessageToast.show("존재하지 않는 모듈입니다: " + oRoute.module);
                        this._setHash("dashboard");
                        return;
                    }
                    this._oVm.setProperty("/module", this._normalizeModule(oRoute.module, oModule));
                    this._showPage("pageModule");
                    break;
                }

                case "post":
                    this._loadPost(oRoute.module, oRoute.postId)
                        .then(function (oPost) {
                            that._oVm.setProperty("/postError", "");
                            that._oVm.setProperty("/post", oPost);
                            that._showPage("pagePost", oRoute);
                        })
                        .catch(function (oError) {
                            /* 실패 시 가짜 데이터 대신 명확한 오류 상태 */
                            that._oVm.setProperty("/postError",
                                oRoute.module + "/" + oRoute.postId +
                                " 게시글 데이터를 찾을 수 없습니다. (" + oError.message + ")");
                            that._oVm.setProperty("/post", that._emptyPost());
                            that._showPage("pagePost", oRoute);
                        });
                    break;

                default:
                    MessageToast.show("잘못된 주소입니다. Dashboard로 이동합니다.");
                    this._setHash("dashboard");
                    return;
            }

            this._oVm.setProperty("/route", oRoute.route);
            this._syncActiveNav(oRoute);
            this._closeDrawer();
        },

        _setHash: function (sHash) {
            if (window.location.hash === "#" + sHash) {
                this._applyHash();      /* 동일 hash 재클릭 → 직접 반영 */
            } else {
                window.location.hash = sHash;
            }
        },

        _showPage: function (sPageId) {
            var oNavCon = this.byId("navCon");
            var oPage = this.byId(sPageId);

            if (oNavCon.getCurrentPage() !== oPage) {
                oNavCon.to(oPage.getId());
            }
            if (oPage.scrollTo) {
                oPage.scrollTo(0, 0);
            }
        },

        /* ============================= data loading ============================ */

        /** 게시글 상세: 정적 JSON + Controller 캐시 (중복 요청 방지) */
        _loadPost: function (sModule, sPostId) {
            var that = this;
            var sKey = sModule + "/" + sPostId;

            if (this._postCache[sKey]) {
                return Promise.resolve(this._postCache[sKey]);
            }

            var sUrl = APP_BASE + "/model/posts/" + encodeURIComponent(sModule) +
                "/" + encodeURIComponent(sPostId) + ".json";

            return fetch(sUrl)
                .then(function (oRes) {
                    if (!oRes.ok) { throw new Error("HTTP " + oRes.status); }
                    return oRes.json();
                })
                .then(function (oData) {
                    var oPost = that._normalizePost(oData);
                    that._postCache[sKey] = oPost;
                    return oPost;
                });
        },

        /* ============================ normalization ============================ */
        /* 실제 생성 JSON 필드명 기준 (sync 스크립트 결과 구조 그대로) */

        _normalizeModule: function (sCode, oModule) {
            var aPosts = (Array.isArray(oModule.posts) ? oModule.posts.slice() : [])
                .sort(function (a, b) { return (a.order || 0) - (b.order || 0); })
                .map(this._normalizePostListItem.bind(this, sCode));

            return {
                code: sCode,
                domain: this._domainOf(oModule),
                eyebrow: oModule.eyebrow || "ERP MODULE",
                title: oModule.title || sCode,
                subtitle: oModule.subtitle || "",
                description: oModule.description || "",
                owner: oModule.owner || "",
                process: oModule.process || "",
                processSteps: this._splitProcess(oModule.process),
                videoLabel: oModule.videoLabel || (sCode + " 시연 영상"),
                videoUrl: oModule.videoUrl || "",
                gallery: (oModule.screenshots || []).map(function (o) {
                    return { url: o.url, title: o.title || "" };
                }),
                features: oModule.features || [],
                techPoints: oModule.techPoints || [],
                tables: oModule.tables || [],
                posts: aPosts
            };
        },

        _normalizePostListItem: function (sModuleCode, oPost) {
            return {
                moduleCode: sModuleCode,
                id: oPost.id,
                title: oPost.title,
                summary: oPost.summary || "",
                owner: oPost.owner || "",
                thumbnail: oPost.thumbnail || "",
                tags: this._toNameObjects(oPost.tags)
            };
        },

        _normalizePost: function (oData) {
            var oModule = this._modules[oData.moduleId] || {};
            var aGallery = (oData.screenshots || [])
                .map(function (o) { return { url: o.url, title: o.title || "" }; })
                .concat((oData.bodyImages || []).map(function (o) {
                    return { url: o.url, title: o.caption || "" };
                }));

            var aSections = (oData.sections || [])
                .filter(function (o) { return o.body && o.body.trim(); })
                .map(function (o) {
                    return { heading: o.heading || "본문", bodyHtml: this._toHtml(o.body) };
                }, this);

            var aTrouble = (oData.troubleShooting || []).filter(function (o) {
                return (o.problem && o.problem.trim()) || (o.solution && o.solution.trim());
            });

            return {
                moduleId: oData.moduleId,
                postId: oData.postId,
                domain: this._domainOf(oModule),
                category: (oModule.eyebrow || "ERP MODULE") + " · " + oData.moduleId,
                title: oData.title || "",
                subtitle: oData.subtitle || "",
                summary: oData.summary || "",
                owner: oData.owner || "",
                videoUrl: oData.videoUrl || "",
                thumbnailUrl: oData.thumbnailUrl || "",
                tags: this._toNameObjects(oData.tags),
                process: oData.process || [],
                processText: (oData.process || []).map(function (o) { return o.text; }).join(" → "),
                implementation: oData.implementation || [],
                tables: oData.tables || [],
                sections: aSections,
                troubleShooting: aTrouble,
                gallery: aGallery
            };
        },

        _emptyModule: function () {
            return {
                code: "", domain: "SAP", eyebrow: "", title: "", subtitle: "",
                description: "", owner: "", process: "", processSteps: [],
                videoLabel: "", videoUrl: "", gallery: [], features: [],
                techPoints: [], tables: [], posts: []
            };
        },

        _emptyPost: function () {
            return {
                moduleId: "", postId: "", domain: "SAP", category: "", title: "",
                subtitle: "", summary: "", owner: "", videoUrl: "", thumbnailUrl: "",
                tags: [], process: [], processText: "", implementation: [],
                tables: [], sections: [], troubleShooting: [], gallery: []
            };
        },

        /** profile.json 로딩 실패 시에도 바인딩이 깨지지 않는 빈 골격 */
        _emptyProfile: function () {
            return {
                hero: { eyebrow: "", title: "", description: "", philosophy: "",
                        primaryAction: "프로젝트 보기", secondaryAction: "경력 확인" },
                identity: { label: "", role: "", rows: [], tags: [] },
                about: { sectionTitle: "About Me", sectionDesc: "", heading: "",
                         paragraphs: [], quote: "", directionTitle: "", directions: [] },
                journey: [],
                strengths: [],
                work: { sectionTitle: "How I Work", sectionDesc: "", title: "", desc: "" },
                workProcess: [],
                sections: {
                    story: { title: "Career Story", desc: "" },
                    strengths: { title: "Core Strengths", desc: "" },
                    projects: { title: "Selected Projects", desc: "" }
                },
                closing: { title: "", desc: "", skillsLabel: "Technical Skills",
                           careerLabel: "Career & Contact" }
            };
        },

        _toNameObjects: function (aValues) {
            return (aValues || []).map(function (vValue) {
                return typeof vValue === "string" ? { name: vValue } : { name: vValue.name || vValue.text || "" };
            });
        },

        _splitProcess: function (sProcess) {
            if (!sProcess) { return []; }
            return String(sProcess)
                .split(/→|>/)
                .map(function (s) { return s.trim(); })
                .filter(Boolean)
                .map(function (s) { return { text: s }; });
        },

        _toHtml: function (sText) {
            return String(sText || "")
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>");
        },

        /* ============================== formatters ============================= */

        /** \n → <br> (FormattedText용) */
        fmtBr: function (sText) {
            return this._toHtml(sText);
        },

        /** JSON의 로컬 상대경로(media/notion/...) → 앱 베이스 기준 절대경로 */
        fmtMedia: function (sPath) {
            if (!sPath) { return ""; }
            if (/^https?:\/\//i.test(sPath)) { return sPath; }
            return APP_BASE + "/" + sPath.replace(/^\//, "");
        },

        /* ============================ event handlers =========================== */

        onNavDashboard: function () { this._setHash("dashboard"); },
        onNavSkills: function () { this._setHash("skills"); },
        onNavCareer: function () { this._setHash("career"); },

        onNavModule: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("vm");
            if (oCtx) { this._setHash("module/" + oCtx.getProperty("code")); }
        },

        /** Selected Projects 카드 → 모듈 상세 (#module/{Code}) */
        onCardPress: function (oEvent) {
            var oCtx = oEvent.getParameter("listItem").getBindingContext("vm");
            if (oCtx) { this._setHash("module/" + oCtx.getProperty("code")); }
        },

        onModulePostPress: function (oEvent) {
            var oCtx = oEvent.getParameter("listItem").getBindingContext("vm");
            if (oCtx) {
                this._setHash("post/" + oCtx.getProperty("moduleCode") + "/" + oCtx.getProperty("id"));
            }
        },

        /** Hero CTA: 프로젝트 보기 → Selected Projects 영역으로 스크롤 */
        onHeroProjects: function () {
            var oSection = this.byId("projectSection");
            if (oSection && oSection.getDomRef()) {
                oSection.getDomRef().scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },

        /** Hero CTA: 경력 확인 → Career & Contact 페이지 */
        onHeroCareer: function () { this._setHash("career"); },

        onBackToDashboard: function () { this._setHash("dashboard"); },

        onBack: function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                this._setHash("dashboard");
            }
        },

        onOpenModuleVideo: function () {
            this._openUrl(this._oVm.getProperty("/module/videoUrl"));
        },

        onOpenPostVideo: function () {
            this._openUrl(this._oVm.getProperty("/post/videoUrl"));
        },

        onOpenLink: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("site");
            if (oCtx) { this._openUrl(oCtx.getProperty("url")); }
        },

        _openUrl: function (sUrl) {
            if (sUrl) {
                mobileLibrary.URLHelper.redirect(sUrl, true);
            } else {
                MessageToast.show("등록된 링크가 없습니다.");
            }
        },

        /* ======================== sidebar active / drawer ====================== */

        _syncActiveNav: function (oRoute) {
            var aStatic = [this.byId("navDashboard"), this.byId("navSkills"), this.byId("navCareer")];
            var aModuleButtons = this._getModuleNavButtons();

            aStatic.concat(aModuleButtons).forEach(function (oBtn) {
                if (oBtn) { oBtn.removeStyleClass("pfActive"); }
            });

            if (oRoute.route === "dashboard") {
                this.byId("navDashboard").addStyleClass("pfActive");
            } else if (oRoute.route === "skills") {
                this.byId("navSkills").addStyleClass("pfActive");
            } else if (oRoute.route === "career") {
                this.byId("navCareer").addStyleClass("pfActive");
            } else if (oRoute.module) {
                /* module 상세 + 해당 모듈의 post 상세 모두 사이드바 동기화 */
                var oMatch = aModuleButtons.filter(function (oBtn) {
                    var oCtx = oBtn.getBindingContext("vm");
                    return oCtx && oCtx.getProperty("code") === oRoute.module;
                })[0];
                if (oMatch) { oMatch.addStyleClass("pfActive"); }
            }
        },

        /** 동적 그룹 트리에서 모듈 nav 버튼 전체 수집 */
        _getModuleNavButtons: function () {
            var oNavGroups = this.byId("navGroups");
            if (!oNavGroups) { return []; }
            return oNavGroups.findAggregatedObjects(true, function (oObj) {
                return oObj.isA && oObj.isA("sap.m.Button");
            });
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

        /* ============================= motion system =========================== */

        /** 페이지 전환 시 fadeInUp 재생 */
        onAfterNavigate: function (oEvent) {
            var oToPage = oEvent.getParameter("to");
            var oInner = oToPage.getContent && oToPage.getContent()[0];
            if (!oInner) { return; }
            oInner.removeStyleClass("pfPageAnim");
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(function () {
                    oInner.addStyleClass("pfPageAnim");
                });
            });
        },

        /** 첫 진입: Hero → About → Story 스태거 */
        _playStaggeredEntrance: function () {
            var that = this;
            window.requestAnimationFrame(function () {
                ["heroBox", "aboutSection", "storySection"].forEach(function (sId) {
                    var oSection = that.byId(sId);
                    if (oSection) { oSection.addStyleClass("pfEnterPlay"); }
                });
            });
        }
    });
});
