sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";
    function inline(r, value) {
        String(value || "").split(/(\*\*[^*]+\*\*)/g).forEach(function (part) {
            if (part.slice(0, 2) === "**") { r.openStart("strong").openEnd().text(part.slice(2, -2)).close("strong"); }
            else { r.text(part); }
        });
    }
    return Control.extend("portfolio.dashboard.control.OverviewDocument", {
        metadata: { properties: { sections: { type: "object", defaultValue: null } } },
        renderer: {
            apiVersion: 2,
            render: function (r, c) {
                r.openStart("div", c).class("pfOverviewDocument").openEnd();
                (c.getSections() || []).forEach(function (section) {
                    r.openStart("section").class("pfDocumentSection").openEnd();
                    r.openStart("h3").openEnd().text(section.title).close("h3");
                    if (section.table) {
                        r.openStart("dl").class("pfDocumentFacts").openEnd();
                        section.table.forEach(function (row) {
                            r.openStart("div").openEnd();
                            r.openStart("dt").openEnd().text(row.key).close("dt");
                            r.openStart("dd").openEnd().text(row.value).close("dd").close("div");
                        });
                        r.close("dl");
                    }
                    if (section.items) {
                        r.openStart("ul").openEnd();
                        section.items.forEach(function (item) {
                            r.openStart("li").openEnd();
                            inline(r, typeof item === "string" ? item : item.text);
                            if (item.children) {
                                r.openStart("ul").openEnd();
                                item.children.forEach(function (sub) { r.openStart("li").openEnd(); inline(r, sub); r.close("li"); });
                                r.close("ul");
                            }
                            r.close("li");
                        });
                        r.close("ul");
                    }
                    r.close("section");
                });
                r.close("div");
            }
        }
    });
});
