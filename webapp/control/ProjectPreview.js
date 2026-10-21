sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";
    function text(r, tag, cls, value) { r.openStart(tag).class(cls).openEnd().text(value || "").close(tag); }
    return Control.extend("portfolio.dashboard.control.ProjectPreview", {
        metadata: {
            properties: {
                mode: { type: "string", defaultValue: "process" },
                steps: { type: "object", defaultValue: null },
                images: { type: "object", defaultValue: null },
                points: { type: "object", defaultValue: null },
                to: { type: "string", defaultValue: "" },
                paused: { type: "boolean", defaultValue: false }
            },
            events: { mediaPress: { parameters: { media: { type: "object" } } } }
        },
        _stop: function () { if (this._rotation) { clearInterval(this._rotation); this._rotation = null; } },
        onBeforeRendering: function () {
            var root = this.getDomRef(), rail = root && root.querySelector(".pfPreviewRail");
            this._railLeft = rail ? rail.scrollLeft : 0;
            this._stop();
        },
        exit: function () { this._stop(); },
        onAfterRendering: function () {
            var root = this.getDomRef(), that = this;
            if (this.getMode() !== "programs") { return; }
            var rail = root.querySelector(".pfPreviewRail");
            rail.scrollLeft = this._railLeft || 0;
            /* 2026-10-21 UX 개선 13: 자동 이동 없음 (읽는 중에 넘어가지 않게). 조작은 이전, 다음 화살표 하나로.
               끝에 닿으면 해당 화살표를 비활성으로 표시 */
            var fnEdge = function () {
                var end = rail.scrollWidth - rail.clientWidth;
                root.querySelectorAll("[data-scroll]").forEach(function (b) {
                    b.disabled = b.dataset.scroll === "-1" ? rail.scrollLeft <= 2 : rail.scrollLeft >= end - 2;
                });
            };
            rail.onscroll = function () { clearTimeout(that._edgeTimer); that._edgeTimer = setTimeout(fnEdge, 80); };
            fnEdge();
        },
        onclick: function (event) {
            var root = this.getDomRef(), button = event.target.closest("button");
            if (!button || !root.contains(button)) { return; }
            if (button.hasAttribute("data-media")) {
                this.fireMediaPress({ media: (this.getImages() || [])[Number(button.dataset.media)] });
            } else if (button.hasAttribute("data-scroll")) {
                var rail = root.querySelector(".pfPreviewRail");
                this._manualUntil = Date.now() + 6000;
                rail.scrollBy({ left: Number(button.dataset.scroll) * rail.clientWidth * .8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            } else if (button.hasAttribute("data-pause")) {
                var value = !this.getPaused();
                this.setProperty("paused", value, true);
                button.setAttribute("aria-pressed", String(value));
                button.textContent = value ? "자동 이동 재생" : "자동 이동 일시정지";
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (r, c) {
                var mode = c.getMode(), images = c.getImages() || [];
                r.openStart("div", c).class("pfProjectPreview").class("pfPreview-" + mode).openEnd();
                if (mode === "outcomes") {
                    r.openStart("ul").class("pfPreviewOutcomePoints").openEnd();
                    (c.getPoints() || []).forEach(function (p) { text(r, "li", "", p); });
                    r.close("ul");
                }
                r.openStart("div").class("pfPreviewFrame").openEnd();
                if (mode === "process") {
                    r.openStart("ol").class("pfPreviewSteps").openEnd();
                    (c.getSteps() || []).forEach(function (step) {
                        r.openStart("li").openEnd();
                        text(r, "span", "pfPreviewNumber", step.no);
                        text(r, "span", "pfPreviewStepLabel", "STEP " + Number(step.no));
                        text(r, "h3", "pfPreviewStepTitle", step.title);
                        text(r, "p", "pfPreviewStepText", step.items);
                        r.close("li");
                    });
                    r.close("ol");
                } else {
                    r.openStart("div").class(mode === "programs" ? "pfPreviewRail" : "pfPreviewMediaGrid")
                        .attr("aria-label", mode === "programs" ? "개발 프로그램 미리보기 이미지" : "프로젝트 발표 사진 및 영상");
                    if (mode === "programs") { r.attr("tabindex", "0"); }
                    r.openEnd();
                    images.forEach(function (media, index) {
                        r.openStart("button").class("pfPreviewMedia").attr("type", "button").attr("data-media", index)
                            .attr("aria-label", (media.videoUrl ? "영상 보기: " : "사진 확대: ") + media.caption).openEnd();
                        if (media.src) {
                            r.voidStart("img").attr("src", media.src).attr("alt", media.caption || "").attr("loading", "lazy").voidEnd();
                        } else {
                            r.openStart("span").class("pfPreviewVideo").attr("aria-hidden", "true").openEnd();
                            text(r, "span", "pfPreviewPlay", "▷");
                            text(r, "span", "pfPreviewVideoLabel", "최종 프로젝트 발표");
                            r.close("span");
                        }
                        text(r, "span", "pfPreviewCaption", media.caption);
                        r.close("button");
                    });
                    r.close("div");
                }
                r.openStart("div").class("pfPreviewFoot").openEnd();
                if (mode === "programs" && images.length > 1) {
                    r.openStart("div").class("pfPreviewControls").openEnd();
                    [{ key: "-1", label: "이전 이미지", text: "←" }, { key: "1", label: "다음 이미지", text: "→" }].forEach(function (b) {
                        r.openStart("button").attr("type", "button").attr("data-scroll", b.key).attr("aria-label", b.label).openEnd().text(b.text).close("button");
                    });
                    r.close("div");
                }
                if (c.getTo()) { r.openStart("a").attr("href", "#" + c.getTo()).class("pfPreviewDetail").openEnd().text("자세히 보기 →").close("a"); }
                r.close("div").close("div").close("div");
            }
        }
    });
});
