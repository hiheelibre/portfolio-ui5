sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";
    function el(r, name, cls, value) {
        r.openStart(name);
        if (cls) { r.class(cls); }
        r.openEnd().text(value || "").close(name);
    }
    function link(r, to, label, cls) {
        if (!to) { return; }
        r.openStart("a").attr("href", "#" + to).class(cls || "pfOutcomeLink").openEnd().text(label + " →").close("a");
    }
    function sectionBar(r, title, note) {
        r.openStart("header").class("pfOutcomeSectionBar").openEnd();
        el(r, "h3", "", title);
        if (note) { el(r, "p", "", note); }
        r.close("header");
    }
    function foldBar(r, id, action, title, note, open) {
        r.openStart("div").class("pfOutcomeSubBar").openEnd();
        r.openStart("div").openEnd();
        el(r, "h4", "", title); el(r, "span", "", note);
        r.close("div");
        r.openStart("button").attr("type", "button").attr("data-outcome-action", action)
            .attr("aria-expanded", String(open)).attr("aria-controls", id).class("pfOutcomeToggle").openEnd()
            .text(open ? "접기" : "펼쳐 보기").close("button").close("div");
    }
    function bulletList(r, items) {
        r.openStart("ul").class("pfOutcomeBullets").openEnd();
        (items || []).forEach(function (item) { el(r, "li", "", item); });
        r.close("ul");
    }
    function videoId(value) {
        try {
            var url = new URL(value), id = "";
            if (url.protocol !== "https:") { return ""; }
            if (url.hostname === "youtu.be") { id = url.pathname.slice(1); }
            if (["www.youtube.com", "youtube.com"].indexOf(url.hostname) >= 0) { id = url.searchParams.get("v") || ""; }
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
        } catch (e) { return ""; }
    }
    return Control.extend("portfolio.dashboard.control.Outcomes", {
        metadata: {
            properties: {
                outcomes: { type: "object", defaultValue: null },
                decisions: { type: "object", defaultValue: null },
                outputs: { type: "object", defaultValue: null },
                retro: { type: "object", defaultValue: null },
                decisionsOpen: { type: "boolean", defaultValue: true },
                /* 2026-10-21 UX 개선 15: 산출물 표는 처음에 접어 둠 */
                outputsOpen: { type: "boolean", defaultValue: false },
                videoPlaying: { type: "boolean", defaultValue: false }
            }
        },
        stopVideo: function () {
            if (this.getVideoPlaying()) { this.setVideoPlaying(false); }
        },
        onclick: function (event) {
            var root = this.getDomRef(), button = event.target.closest("button[data-outcome-action]");
            if (!button || !root.contains(button)) { return; }
            var action = button.getAttribute("data-outcome-action");
            this._focusAction = action;
            if (action === "decisions") { this.setDecisionsOpen(!this.getDecisionsOpen()); }
            if (action === "outputs") { this.setOutputsOpen(!this.getOutputsOpen()); }
            /* 2026-10-21 UX 개선 15: 결정 사례는 하나씩 펼침 (처음에는 첫 사례만) */
            if (action === "decision") {
                var index = Number(button.getAttribute("data-index"));
                var open = this._openDecisions();
                if (open[index]) { delete open[index]; } else { open[index] = true; }
                this._focusAction = "decision-" + index;
                this.invalidate();
            }
            if (action === "video" && videoId((this.getOutcomes() || {}).demoVideo)) { this.setVideoPlaying(true); }
        },
        _openDecisions: function () {
            if (!this._mOpenDecisions) { this._mOpenDecisions = { 0: true }; }
            return this._mOpenDecisions;
        },
        onAfterRendering: function () {
            if (!this._focusAction) { return; }
            var root = this.getDomRef();
            var dec = /^decision-(\d+)$/.exec(this._focusAction);
            var target = this._focusAction === "video" ? root.querySelector("iframe") :
                dec ? root.querySelector('[data-outcome-action="decision"][data-index="' + dec[1] + '"]') :
                root.querySelector('[data-outcome-action="' + this._focusAction + '"]');
            if (target) { target.focus({ preventScroll: true }); }
            this._focusAction = null;
        },
        renderer: {
            apiVersion: 2,
            render: function (r, c) {
                var o = c.getOutcomes() || {}, d = c.getDecisions() || {}, outputs = c.getOutputs() || {};
                var retro = c.getRetro() || {}, labels = o.reportLabels || {}, id = c.getId(), movie = videoId(o.demoVideo);
                r.openStart("div", c).class("pfOutcomeReport").openEnd();

                r.openStart("dl").class("pfOutcomeSummary").openEnd();
                [0, 2, 1, 3].forEach(function (index) {
                    var stat = (o.stats || [])[index]; if (!stat) { return; }
                    r.openStart("div").openEnd();
                    el(r, "dt", "", stat.key);
                    el(r, "dd", stat.strong ? "pfOutcomeSummaryStrong" : "", stat.value);
                    r.close("div");
                });
                r.close("dl");
                r.openStart("section").class("pfOutcomeHeadline").openEnd();
                el(r, "h3", "", o.subtitle); el(r, "p", "", o.lead);
                r.close("section");

                r.openStart("section").class("pfOutcomeSection").openEnd();
                sectionBar(r, o.pmTitle, labels.pmNote);
                r.openStart("div").class("pfOutcomePillars").openEnd();
                (o.panels || []).forEach(function (panel, index) {
                    r.openStart("article").class("pfOutcomePillar").openEnd();
                    r.openStart("header").openEnd();
                    el(r, "h4", "", panel.area); el(r, "span", "", "0" + (index + 1)); r.close("header");
                    r.openStart("div").class("pfOutcomePillarBody").openEnd();
                    el(r, "p", "", panel.text); link(r, panel.to, panel.toLabel);
                    r.close("div").close("article");
                });
                r.close("div").close("section");

                r.openStart("section").class("pfOutcomeSection").openEnd();
                sectionBar(r, o.decisionTitle, labels.decisionNote);
                el(r, "p", "pfOutcomeLead", o.decisionsLead);
                foldBar(r, id + "-decisions", "decisions", d.title, d.note, c.getDecisionsOpen());
                r.openStart("div").attr("id", id + "-decisions").openEnd();
                if (c.getDecisionsOpen()) {
                    var openMap = c._openDecisions();
                    (d.items || []).forEach(function (decision, dIndex) {
                        var isOpen = !!openMap[dIndex];
                        /* 접힌 사례: 제목, 직접/공동, 핵심 숫자, 실제 결정 한 줄, 펼치기 버튼 */
                        r.openStart("div").class("pfOutcomeDecHead");
                        if (isOpen) { r.class("pfOutcomeDecHeadOpen"); }
                        r.openEnd();
                        r.openStart("div").class("pfOutcomeDecHeadMain").openEnd();
                        r.openStart("div").class("pfOutcomeDecHeadTitle").openEnd();
                        el(r, "span", "pfOutcomeDecNo", (dIndex < 9 ? "0" : "") + (dIndex + 1));
                        el(r, "h5", "", decision.title);
                        r.openStart("span").class("pfOutcomeRole").attr("data-role", decision.role || "").openEnd().text(decision.role).close("span");
                        r.close("div");
                        if (!isOpen) { el(r, "p", "pfOutcomeDecHeadLine", decision.decision); }
                        r.close("div");
                        if (decision.stat && decision.stat.value) {
                            r.openStart("div").class("pfOutcomeStat").openEnd();
                            el(r, "strong", "", decision.stat.value); el(r, "span", "", decision.stat.label);
                            r.close("div");
                        }
                        r.openStart("button").attr("type", "button").attr("data-outcome-action", "decision").attr("data-index", String(dIndex))
                            .attr("aria-expanded", String(isOpen)).attr("aria-controls", id + "-dec-" + dIndex).class("pfOutcomeToggle").openEnd()
                            .text(isOpen ? "접기" : "자세히").close("button");
                        r.close("div");
                        if (!isOpen) { return; }
                        r.openStart("article", id + "-dec-" + dIndex).class("pfOutcomeMatrix").class("pfOutcomeMatrixInFold").openEnd();
                        r.openStart("div").class("pfOutcomeMatrixIssue").openEnd();
                        el(r, "span", "pfOutcomeLabel", "문제 상황");
                        el(r, "h5", "", decision.title); el(r, "p", "", decision.situation);
                        r.openStart("div").class("pfOutcomeRoles").openEnd();
                        if (decision.roleNote) { el(r, "span", "pfOutcomeRoleNote", decision.roleNote); }
                        r.openStart("span").class("pfOutcomeRole").attr("data-role", decision.role || "").openEnd().text(decision.role).close("span");
                        r.close("div").close("div");
                        r.openStart("div").class("pfOutcomeMatrixOptions").openEnd();
                        el(r, "span", "pfOutcomeLabel", labels.alternativeLabel);
                        ["a", "b"].forEach(function (key) {
                            var option = decision[key] || {};
                            r.openStart("div").class("pfOutcomeOption");
                            if (decision.pick === key) { r.class("pfOutcomeOptionSelected"); }
                            r.openEnd();
                            el(r, "span", "pfOutcomeOptionTag", key.toUpperCase() + "안" + (decision.pick === key ? " 선택" : ""));
                            el(r, "strong", "", option.text); el(r, "p", "", option.note);
                            r.close("div");
                        });
                        r.close("div");
                        r.openStart("div").class("pfOutcomeMatrixDecision").openEnd();
                        el(r, "span", "pfOutcomeLabel", labels.decisionColumn);
                        r.openStart("dl").class("pfOutcomeDecisionFacts").openEnd();
                        [["검토 기준", "why"], ["실제 결정", "decision"], ["영향", "impact"]].forEach(function (row) {
                            el(r, "dt", "", row[0]);
                            el(r, "dd", row[1] === "decision" ? "pfOutcomeDecisionValue" : "", decision[row[1]]);
                        });
                        r.close("dl").close("div").close("article");
                    });
                } else { bulletList(r, (d.items || []).map(function (item) { return item.title; })); }
                r.close("div");

                foldBar(r, id + "-outputs", "outputs", outputs.title, outputs.note, c.getOutputsOpen());
                r.openStart("div").attr("id", id + "-outputs").openEnd();
                if (c.getOutputsOpen()) {
                    r.openStart("table").class("pfOutcomeTable").openEnd();
                    r.openStart("thead").openEnd().openStart("tr").openEnd();
                    (outputs.head || []).forEach(function (heading) { r.openStart("th").attr("scope", "col").openEnd().text(heading).close("th"); });
                    r.close("tr").close("thead").openStart("tbody").openEnd();
                    (outputs.items || []).forEach(function (item) {
                        r.openStart("tr").openEnd();
                        [item.title, item.purpose, item.role].forEach(function (value, index) {
                            r.openStart("td").attr("data-label", (outputs.head || [])[index] || "").openEnd();
                            if (index === 2) {
                                r.openStart("span").class("pfOutcomeRole").attr("data-role", value).openEnd().text(value).close("span");
                            } else { el(r, index === 0 ? "strong" : "span", "", value); }
                            r.close("td");
                        });
                        r.close("tr");
                    });
                    r.close("tbody").close("table");
                } else { bulletList(r, (outputs.items || []).map(function (item) { return item.title; })); }
                r.close("div").close("section");

                r.openStart("section").class("pfOutcomeSection").openEnd();
                sectionBar(r, o.resultTitle, labels.resultNote);
                r.openStart("div").class("pfOutcomeResult").openEnd();
                r.openStart("article").class("pfOutcomeResultText").openEnd();
                el(r, "h4", "", o.resultSubtitle); el(r, "p", "", o.resultText);
                r.openStart("div").class("pfOutcomeDemo").openEnd();
                el(r, "strong", "", o.demoTitle); el(r, "p", "", o.demoText);
                r.openStart("div").class("pfOutcomeDemoActions").openEnd();
                link(r, "sap/e2e", o.demoLink);
                if (movie && labels.videoAction) {
                    r.openStart("button").attr("type", "button").attr("data-outcome-action", "video").class("pfOutcomeLink").openEnd()
                        .text(labels.videoAction + " →").close("button");
                }
                r.close("div").close("div").close("article");
                if (movie) {
                    r.openStart("div").class("pfOutcomeVideoCard").openEnd();
                    r.openStart("div").class("pfOutcomeVideoBar").openEnd();
                    el(r, "strong", "", labels.videoTitle);
                    r.openStart("a").attr("href", "https://www.youtube.com/watch?v=" + movie).attr("target", "_blank").attr("rel", "noopener noreferrer").openEnd()
                        .text(labels.videoExternal + " ↗").close("a");
                    r.close("div");
                    r.openStart("div").class("pfOutcomeVideoStage").openEnd();
                    if (c.getVideoPlaying()) {
                        r.openStart("iframe", id + "-video").attr("src", "https://www.youtube.com/embed/" + movie + "?autoplay=1&rel=0")
                            .attr("title", labels.videoTitle).attr("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share")
                            .attr("allowfullscreen", "allowfullscreen").attr("referrerpolicy", "strict-origin-when-cross-origin").openEnd().close("iframe");
                    } else {
                        /* 2026-10-21 UX 개선 14: YouTube 썸네일 위에 재생 버튼 (누르기 전에 어떤 영상인지 보이게) */
                        r.openStart("div").class("pfOutcomeVideoCover").class("pfOutcomeVideoPoster").openEnd();
                        r.voidStart("img").attr("src", "https://i.ytimg.com/vi/" + movie + "/hqdefault.jpg").attr("alt", "").attr("loading", "lazy").class("pfOutcomeVideoThumb").voidEnd();
                        r.openStart("button").attr("type", "button").attr("data-outcome-action", "video").class("pfOutcomePlay")
                            .attr("aria-label", labels.videoTitle + " 재생").openEnd()
                            .text("▶ " + labels.videoPlay).close("button");
                        if (labels.videoCaption) { el(r, "p", "", labels.videoCaption); }
                        r.close("div");
                    }
                    r.close("div").close("div");
                }
                r.close("div").close("section");

                r.openStart("section").class("pfOutcomeSection").openEnd();
                sectionBar(r, o.retroTitle, o.retroSubtitle);
                (o.retroParagraphs || []).forEach(function (p) { el(r, "p", "pfOutcomeLead", p); });
                r.openStart("div").class("pfOutcomeRetro").openEnd();
                [[retro.goodTitle, retro.good], [retro.regretTitle, retro.regret]].forEach(function (column) {
                    r.openStart("article").openEnd(); el(r, "h4", "", column[0]); bulletList(r, column[1]); r.close("article");
                });
                r.close("div");
                el(r, "p", "pfOutcomeClosing", o.closing);
                r.close("section").close("div");
            }
        }
    });
});
