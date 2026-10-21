sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";

    function addClasses(r, classes) {
        classes.split(/\s+/).filter(Boolean).forEach(function (name) { r.class(name); });
        return r;
    }
    function el(r, tag, classes, text) {
        addClasses(r.openStart(tag), classes).openEnd().text(text).close(tag);
    }

    return Control.extend("portfolio.dashboard.control.Deliverables", {
        metadata: {
            properties: {
                programs: { type: "object", defaultValue: null },
                steps: { type: "object", defaultValue: null },
                heading: { type: "string", defaultValue: "" },
                summary: { type: "string", defaultValue: "" },
                notice: { type: "string", defaultValue: "" },
                badge: { type: "string", defaultValue: "CORE DELIVERABLES" },
                selectedType: { type: "string", defaultValue: "all" }
            }
        },

        renderer: {
            apiVersion: 2,
            render: function (r, control) {
                var all = control.getPrograms() || [];
                var selected = control.getSelectedType();
                var filtered = selected === "all" ? all : all.filter(function (p) { return p.type === selected; });
                var id = control.getId();
                r.openStart("section", control).class("pfDeliverables")
                    .class("relative").class("min-h-screen").class("py-20").class("px-6")
                    .class("lg:px-12").class("max-w-7xl").class("mx-auto")
                    .attr("aria-label", "직접 개발 프로그램 목록").openEnd();
                r.openStart("div").attr("id", id + "-program-grid").class("program-grid").class("grid").class("grid-cols-1").class("md:grid-cols-2").class("lg:grid-cols-3").class("gap-6")
                    .openEnd();
                filtered.forEach(function (item) {
                    var gui = item.type === "gui";
                    var accent = gui ? "hover:border-blue-400/70" : "hover:border-teal-400/70";
                    addClasses(r.openStart("a").attr("href", item.url).attr("data-type", item.type),
                        "program-card group bg-white rounded-2xl border border-slate-200/90 " + accent + " p-6 flex flex-col justify-between cursor-pointer card-transition relative overflow-hidden block")
                        .openEnd();
                    r.openStart("div").class("card-body").openEnd();
                    r.openStart("div").class("card-header").class("flex").class("items-center").class("justify-between").class("gap-2").class("mb-4").openEnd();
                    el(r, "span", "program-badge px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md border " + (gui ? "bg-blue-50 text-blue-700 border-blue-200/80" : "bg-teal-50 text-teal-700 border-teal-200/80"), item.code);
                    r.openStart("div").class("card-header-right").class("flex").class("items-center").class("gap-2").openEnd();
                    el(r, "span", "phase text-[11px] font-medium text-slate-400", item.phase);
                    r.close("div").close("div");
                    el(r, "h3", "card-title text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2", item.title);
                    el(r, "p", "card-description text-sm text-slate-600 leading-relaxed mb-5 break-keep", item.desc);
                    r.openStart("div").class("card-points").class("bg-slate-50/80").class("rounded-xl").class("p-3.5").class("border").class("border-slate-100").class("mb-5").openEnd();
                    r.openStart("ul").class("space-y-1.5").openEnd();
                    (item.points || []).forEach(function (point) {
                        r.openStart("li").class("text-xs").class("text-slate-700").class("font-medium").class("flex").class("items-start").class("gap-2").class("break-keep").openEnd();
                        addClasses(r.openStart("span"), "point-dot w-1.5 h-1.5 rounded-full " + (gui ? "bg-blue-500" : "bg-teal-500") + " mt-1.5 shrink-0")
                            .attr("aria-hidden", "true").openEnd().close("span");
                        r.openStart("span").openEnd().text(point).close("span").close("li");
                    });
                    r.close("ul").close("div").close("div");
                    r.openStart("div").class("card-footer").class("pt-3").class("border-t").class("border-slate-100").class("flex").class("flex-wrap").class("gap-1.5").openEnd();
                    (item.tags || []).forEach(function (tag) {
                        el(r, "span", "px-2 py-0.5 text-[11px] font-mono font-medium bg-slate-100 text-slate-600 rounded", tag);
                    });
                    r.close("div");
                    el(r, "span", "card-arrow", "→");
                    r.close("a");
                });
                r.close("div");
                r.openStart("span").class("deliverables-sr-only").attr("role", "status").attr("aria-live", "polite").openEnd()
                    .text(filtered.length + "개 프로그램 표시").close("span");
                r.close("section");
            }
        }
    });
});
