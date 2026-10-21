sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";
    var APP_BASE = sap.ui.require.toUrl("portfolio/dashboard");
    function text(r, tag, cls, value) {
        r.openStart(tag); if (cls) { r.class(cls); }
        r.openEnd().text(value || "").close(tag);
    }
    function media(path) {
        return /^https?:\/\//i.test(path || "") ? path : APP_BASE + "/" + String(path || "").replace(/^\//, "");
    }
    function link(r, path, label, cls) {
        if (!path) { return; }
        r.openStart("a").attr("href", "#" + path).class(cls || "pfProgramLink").openEnd().text(label).close("a");
    }
    function blocks(r, items, id) {
        (items || []).forEach(function (b, index) {
            if (b.t === "p") { text(r, "p", "pfProgramParagraph", b.text); }
            if (b.t === "h") { text(r, "h3", "pfProgramSubheading", b.text); }
            if (b.t === "quote") { text(r, "blockquote", "pfProgramLesson", b.text); }
            if (b.t === "list") {
                r.openStart("ul").class("pfProgramBullets").openEnd();
                (b.items || []).forEach(function (item) { text(r, "li", "", item); });
                r.close("ul");
            }
            if (b.t === "code") {
                var codeId = id + "-code-" + index;
                r.openStart("div").class("pfProgramCode").openEnd();
                r.openStart("header").openEnd(); text(r, "span", "", b.lang);
                r.openStart("button").attr("type", "button").attr("data-program-copy", codeId)
                    .attr("aria-label", (b.lang || "") + " 코드 복사").openEnd().text("코드 복사").close("button");
                r.close("header").openStart("pre").attr("tabindex", "0").attr("aria-label", (b.lang || "") + " 코드").openEnd();
                r.openStart("code").attr("id", codeId).openEnd().text(b.src || "").close("code").close("pre").close("div");
            }
            if (b.t === "table") {
                r.openStart("div").class("pfProgramTableWrap").openEnd();
                r.openStart("table").class("pfProgramTable").openEnd();
                r.openStart("thead").openEnd().openStart("tr").openEnd();
                (b.head || []).forEach(function (h) { r.openStart("th").attr("scope", "col").openEnd().text(h).close("th"); });
                r.close("tr").close("thead").openStart("tbody").openEnd();
                (b.rows || []).forEach(function (row) {
                    r.openStart("tr").openEnd();
                    (row.cells || []).forEach(function (cell, ci) {
                        r.openStart("td").attr("data-label", (b.head || [])[ci] || "").openEnd().text(cell.v || "").close("td");
                    });
                    r.close("tr");
                });
                r.close("tbody").close("table").close("div");
            }
        });
    }
    function groups(items) {
        var result = [], current = { heading: "", blocks: [] };
        (items || []).forEach(function (b) {
            if (b.t === "h") {
                if (current.heading || current.blocks.length) { result.push(current); }
                current = { heading: b.text, blocks: [] };
            } else { current.blocks.push(b); }
        });
        if (current.heading || current.blocks.length) { result.push(current); }
        return result;
    }
    return Control.extend("portfolio.dashboard.control.ProgramDetail", {
        metadata: {
            properties: {
                card: { type: "object", defaultValue: null },
                selectedSection: { type: "string", defaultValue: "all" },
                imageIndex: { type: "int", defaultValue: 0 }
            },
            events: {
                zoom: { parameters: { shot: { type: "object" } } },
                copy: { parameters: { code: { type: "string" } } }
            }
        },
        setCard: function (card) {
            if ((this.getCard() || {}).key !== (card || {}).key) {
                this.setProperty("selectedSection", "all", true);
                this.setProperty("imageIndex", 0, true);
                this._focusTarget = null; this._scrollToSection = false;
            }
            return this.setProperty("card", card);
        },
        _selectSection: function (key) {
            var sections = (this.getCard() || {}).caseSecs || [];
            if (key !== "all" && !sections.some(function (s) { return s.num === key; })) { return; }
            if (key === this.getSelectedSection()) { return; }
            this._focusTarget = '[data-program-tab="' + key + '"]';
            this._scrollToSection = true;
            this.setSelectedSection(key);
        },
        onclick: function (event) {
            var root = this.getDomRef(), target = event.target.closest("button");
            if (!root || !target || !root.contains(target)) { return; }
            if (target.hasAttribute("data-program-tab")) { this._selectSection(target.getAttribute("data-program-tab")); }
            if (target.hasAttribute("data-program-image")) {
                var index = Number(target.getAttribute("data-program-image"));
                if (Number.isInteger(index) && ((this.getCard() || {}).shots || [])[index]) {
                    this._focusTarget = '[data-program-image="' + index + '"]';
                    this.setImageIndex(index);
                }
            }
            if (target.hasAttribute("data-program-zoom")) {
                var shots = (this.getCard() || {}).shots || [], shot = shots[this.getImageIndex()] || shots[0];
                if (shot) { this.fireZoom({ shot: shot }); }
            }
            if (target.hasAttribute("data-program-copy")) {
                var code = root.querySelector('[id="' + target.getAttribute("data-program-copy") + '"]');
                if (code) { this.fireCopy({ code: code.textContent }); }
            }
        },
        onkeydown: function (event) {
            var root = this.getDomRef(), tab = event.target.closest("[data-program-tab]");
            if (!root || !tab || !root.contains(tab)) { return; }
            var keys = ["all"].concat(((this.getCard() || {}).caseSecs || []).map(function (s) { return s.num; }));
            var index = keys.indexOf(tab.getAttribute("data-program-tab")), next;
            if (event.key === "ArrowRight") { next = keys[(index + 1) % keys.length]; }
            if (event.key === "ArrowLeft") { next = keys[(index + keys.length - 1) % keys.length]; }
            if (event.key === "Home") { next = keys[0]; }
            if (event.key === "End") { next = keys[keys.length - 1]; }
            if (next) { event.preventDefault(); this._selectSection(next); }
        },
        onAfterRendering: function () {
            var root = this.getDomRef(); if (!root) { return; }
            if (this._focusTarget) {
                var focus = root.querySelector(this._focusTarget);
                if (focus) {
                    focus.focus({ preventScroll: true });
                    if (focus.hasAttribute("data-program-tab")) {
                        var strip = root.querySelector(".pfProgramTabList");
                        if (strip) {
                            var box = focus.getBoundingClientRect(), frame = strip.getBoundingClientRect();
                            if (box.left < frame.left) { strip.scrollLeft -= frame.left - box.left; }
                            if (box.right > frame.right) { strip.scrollLeft += box.right - frame.right; }
                        }
                    }
                }
                this._focusTarget = null;
            }
            if (this._scrollToSection) {
                var page = root.closest('[id$="--pageCard"]'), first = root.querySelector(".pfProgramSection"), nav = root.querySelector(".pfProgramTabBar");
                if (page && first && nav) {
                    var top = page.scrollTop + first.getBoundingClientRect().top - page.getBoundingClientRect().top - nav.getBoundingClientRect().height - 16;
                    page.scrollTo({ top: Math.max(0, top), behavior: "auto" });
                }
                this._scrollToSection = false;
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (r, c) {
                var card = c.getCard() || {}, detail = card.caseData || {}, sections = card.caseSecs || [];
                var id = c.getId(), selected = c.getSelectedSection(), shots = card.shots || [], image = shots[c.getImageIndex()] || shots[0];
                r.openStart("div", c).class("pfProgramDetail").openEnd();
                r.openStart("section").class("pfProgramHero").class("pfProgramBoard").attr("aria-label", card.title || "프로그램").openEnd();
                r.openStart("nav").class("pfProgramCrumb").attr("aria-label", "현재 위치").openEnd();
                link(r, card.projectTo || "sap", "SAP 프로젝트"); text(r, "span", "", ">");
                link(r, "sap/programs", "03 담당 프로그램"); text(r, "span", "", ">"); text(r, "span", "", card.title);
                if (card.hlText) { text(r, "span", "pfProgramHighlight", card.hlText); }
                r.close("nav");
                r.openStart("header").class("pfProgramTitleRow").openEnd();
                text(r, "h1", "", card.title);
                r.openStart("div").class("pfProgramBadges").openEnd();
                [card.kind, card.id, card.tag, card.metaText].filter(Boolean).forEach(function (v) { text(r, "span", "", v); });
                r.close("div").close("header");
                if (card.std) { text(r, "p", "pfProgramStandard", "대체 표준: " + card.std); }
                text(r, "p", "pfProgramLead", detail.summary);
                r.openStart("dl").class("pfProgramFacts").openEnd();
                (detail.facts || []).forEach(function (fact) {
                    r.openStart("div"); if (fact.key === "기술" || fact.key === "프로그램") { r.class("pfProgramFactWide"); }
                    r.openEnd(); text(r, "dt", "", fact.key); text(r, "dd", "", fact.value); r.close("div");
                });
                r.close("dl");
                if ((detail.points || []).length) {
                    r.openStart("div").class("pfProgramPoints").openEnd();
                    detail.points.forEach(function (p) {
                        r.openStart("article").openEnd(); text(r, "span", "pfProgramPointNumber", p.num);
                        text(r, "h2", "", p.title); text(r, "p", "", p.text); r.close("article");
                    });
                    r.close("div");
                }
                if (image) {
                    r.openStart("div").class("pfProgramGallery").openEnd();
                    r.openStart("button").attr("type", "button").attr("data-program-zoom", "")
                        .attr("aria-label", "크게 보기: " + image.caption).attr("aria-haspopup", "dialog").class("pfProgramImageStage").openEnd();
                    r.voidStart("img").attr("src", media(image.src)).attr("alt", image.caption || card.title).voidEnd();
                    text(r, "span", "pfProgramZoom", "크게 보기"); r.close("button");
                    text(r, "p", "pfProgramCaption", image.caption);
                    if (shots.length > 1) {
                        r.openStart("div").class("pfProgramThumbnails").attr("role", "group").attr("aria-label", "화면 선택").openEnd();
                        shots.forEach(function (shot, i) {
                            r.openStart("button").attr("type", "button").attr("data-program-image", String(i))
                                .attr("aria-pressed", String(i === c.getImageIndex())).attr("title", shot.caption).openEnd();
                            r.voidStart("img").attr("src", media(shot.src)).attr("alt", "").attr("loading", "lazy").voidEnd();
                            text(r, "span", "", String(i + 1).padStart(2, "0") + " " + (shot.caption || "").split(" / ")[0]);
                            r.close("button");
                        });
                        r.close("div");
                    }
                    r.close("div");
                }
                r.close("section");
                r.openStart("nav").class("pfProgramTabBar").attr("aria-label", "프로그램 상세 섹션").openEnd();
                r.openStart("div").class("pfProgramTabList").attr("role", "tablist").openEnd();
                [{ num: "all", title: "전체 연속 보기" }].concat(sections).forEach(function (section) {
                    var key = section.num, active = selected === key;
                    r.openStart("button").attr("type", "button").attr("id", id + "-tab-" + key).attr("role", "tab")
                        .attr("data-program-tab", key).attr("aria-selected", String(active)).attr("tabindex", active ? "0" : "-1")
                        .attr("aria-controls", key === "all" ? id + "-sections" : id + "-section-" + key).openEnd()
                        .text(key === "all" ? section.title : section.num + " " + section.title).close("button");
                });
                r.close("div").close("nav");
                r.openStart("div").attr("id", id + "-sections").class("pfProgramSections").openEnd();
                sections.forEach(function (section) {
                    var show = selected === "all" || selected === section.num;
                    r.openStart("section").attr("id", id + "-section-" + section.num).class("pfProgramBoard").class("pfProgramSection")
                        .attr("role", "tabpanel").attr("aria-labelledby", id + "-tab-" + section.num).attr("tabindex", "0");
                    if (!show) { r.attr("hidden", "hidden"); }
                    r.openEnd();
                    r.openStart("header").class("pfProgramSectionHead").openEnd();
                    text(r, "span", "", section.num); text(r, "h2", "", section.title); r.close("header");
                    var grouped = /문제 해결|트러블슈팅/.test(section.title) ? "trouble" : /핵심/.test(section.title) ? "implementation" : "";
                    if (grouped) {
                        var parts = groups(section.blocks), named = parts.filter(function (p) { return !!p.heading; });
                        parts.filter(function (p) { return !p.heading; }).forEach(function (p, i) { blocks(r, p.blocks, id + "-" + section.num + "-intro-" + i); });
                        r.openStart("div").class(grouped === "trouble" ? "pfProgramTroubles" : "pfProgramImplementations").openEnd();
                        named.forEach(function (part, i) {
                            r.openStart("article").class("pfProgramTopic").openEnd(); text(r, "h3", "", part.heading);
                            blocks(r, part.blocks, id + "-" + section.num + "-group-" + i); r.close("article");
                        });
                        r.close("div");
                    } else { blocks(r, section.blocks, id + "-" + section.num); }
                    r.close("section");
                });
                r.close("div");
                if ((detail.links || []).length) {
                    r.openStart("div").class("pfProgramResources").openEnd();
                    detail.links.forEach(function (l) {
                        r.openStart("a").attr("href", l.url).attr("target", "_blank").attr("rel", "noopener noreferrer").openEnd().text(l.label).close("a");
                    });
                    r.close("div");
                }
                r.openStart("footer").class("pfProgramBoard").class("pfProgramFooter").openEnd();
                r.openStart("div").class("pfProgramReturnLinks").openEnd();
                link(r, detail.listTo || "sap/programs", "← " + (detail.listLabel || "담당 프로그램 목록"));
                link(r, card.projectTo, "← " + card.projectLabel); link(r, "highlights", "← 홈 주요 구현 사례"); r.close("div");
                r.openStart("nav").class("pfProgramPager").attr("aria-label", "다른 프로그램").openEnd();
                if (card.prev) { link(r, card.prev.to, "← " + card.prev.title, "pfProgramPagerPrev"); }
                link(r, "sap/programs", "목록으로", "pfProgramPagerList");
                if (card.next) { link(r, card.next.to, card.next.title + " →", "pfProgramPagerNext"); }
                r.close("nav").close("footer").close("div");
            }
        }
    });
});
