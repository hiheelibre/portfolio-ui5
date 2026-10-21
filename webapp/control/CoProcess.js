sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";
    function node(r, n) {
        r.openStart(n.go ? "a" : "div").class("pfCoNode");
        if (n.go) { r.attr("href", "#sap/" + n.go); } else { r.class("pfCoTeam"); }
        r.openEnd();
        if (n.label) { r.openStart("span").class("pfCoNodeLabel").openEnd().text(n.label).close("span"); }
        r.openStart("strong").openEnd().text(n.title).close("strong");
        if (n.role === "팀") { r.openStart("span").class("pfCoRole").openEnd().text("팀원 구현 (PL / CO 담당)").close("span"); }
        if (n.sub) { r.openStart("p").openEnd().text(n.sub).close("p"); }
        if (n.go) { r.openStart("span").class("pfCoArrow").attr("aria-hidden", "true").openEnd().text("→").close("span"); }
        r.close(n.go ? "a" : "div");
    }
    return Control.extend("portfolio.dashboard.control.CoProcess", {
        metadata: { properties: { lanes: { type: "object", defaultValue: null } } },
        renderer: {
            apiVersion: 2,
            render: function (r, c) {
                r.openStart("div", c).class("pfCoDocument").openEnd();
                (c.getLanes() || []).forEach(function (lane, index) {
                    r.openStart("section").class("pfCoRow").class("pfCoRow" + index).openEnd();
                    r.openStart("header").openEnd();
                    r.openStart("span").openEnd().text("STEP 0" + (index + 1)).close("span");
                    r.openStart("h4").openEnd().text(lane.name).close("h4").close("header");
                    r.openStart("div").class("pfCoRowBody").openEnd();
                    if (index === 0) {
                        r.openStart("div").class("pfCoPlanInputs").openEnd();
                        lane.tracks.forEach(function (track) {
                            r.openStart("div").class("pfCoTrack").openEnd();
                            r.openStart("p").class("pfCoTrackLabel").openEnd().text(track.label).close("p");
                            r.openStart("div").class("pfCoNodes").openEnd();
                            track.nodes.forEach(function (n, i) { if (i) { r.openStart("span").class("pfCoConnector").attr("aria-hidden", "true").openEnd().text("→").close("span"); } node(r, n); });
                            r.close("div").close("div");
                        });
                        r.close("div");
                        r.openStart("div").class("pfCoMerge").openEnd();
                        r.openStart("p").class("pfCoTrackLabel").openEnd().text(lane.target.label).close("p");
                        node(r, lane.target); r.close("div");
                    } else if (index === 1) {
                        r.openStart("p").class("pfCoTrackLabel").openEnd().text(lane.entryLabel).close("p"); node(r, lane.entry);
                        r.openStart("p").class("pfCoTrackLabel").openEnd().text(lane.branchLabel).close("p");
                        r.openStart("div").class("pfCoPosting").openEnd();
                        node(r, lane.allocation);
                        r.openStart("span").class("pfCoConnector").attr("aria-hidden", "true").openEnd().text("→").close("span");
                        node(r, lane.processing);
                        r.openStart("div").class("pfCoBranches").openEnd();
                        lane.branches.forEach(function (n) { node(r, n); });
                        r.close("div").close("div");
                    } else {
                        r.openStart("div").class("pfCoIndependent").openEnd();
                        lane.nodes.forEach(function (n) { node(r, n); });
                        r.close("div");
                    }
                    r.close("div").close("section");
                });
                r.close("div");
            }
        }
    });
});
