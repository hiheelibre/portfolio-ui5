sap.ui.define(["sap/ui/core/Control"], function (Control) {
    "use strict";

    function tag(r, name, classes, text) {
        r.openStart(name);
        classes.split(/\s+/).filter(Boolean).forEach(function (c) { r.class(c); });
        r.openEnd().text(text || "").close(name);
    }
    function mine(item) { return (item.programs || []).some(function (p) { return !!p.to; }); }
    function list(r, items) {
        r.openStart("ul").openEnd();
        (items || []).forEach(function (text) { tag(r, "li", "", text); });
        r.close("ul");
    }

    return Control.extend("portfolio.dashboard.control.Challenges", {
        metadata: {
            properties: {
                challenges: { type: "object", defaultValue: null },
                heading: { type: "string", defaultValue: "" },
                note: { type: "string", defaultValue: "" },
                selectedFilter: { type: "string", defaultValue: "all" },
                selectedNo: { type: "string", defaultValue: "" }
            }
        },
        _items: function () {
            var items = this.getChallenges() || [];
            return this.getSelectedFilter() === "mine" ? items.filter(mine) : items;
        },
        _choose: function (no, kind) {
            if (!this._items().some(function (item) { return String(item.no) === no; })) { return; }
            this._focus = { kind: kind || "choice", value: no };
            this.setSelectedNo(no);
        },
        onclick: function (event) {
            var filter = event.target.closest("button[data-challenge-filter]");
            if (filter && this.getDomRef().contains(filter)) {
                var value = filter.getAttribute("data-challenge-filter");
                if (["all", "mine"].indexOf(value) < 0) { return; }
                this._focus = { kind: "filter", value: value };
                this.setSelectedFilter(value);
                var items = this._items(), no = this.getSelectedNo();
                if (!items.some(function (item) { return String(item.no) === no; })) {
                    this.setSelectedNo(items.length ? String(items[0].no) : "");
                }
                return;
            }
            var choice = event.target.closest("button[data-challenge-choice]");
            if (choice && this.getDomRef().contains(choice)) {
                this._choose(choice.getAttribute("data-challenge-choice"));
            }
        },
        onchange: function (event) {
            if (event.target.matches("select[data-challenge-select]")) {
                this._choose(event.target.value, "select");
            }
        },
        onkeydown: function (event) {
            var choice = event.target.closest("button[data-challenge-choice]");
            if (!choice || !this.getDomRef().contains(choice)) { return; }
            var items = this._items(), no = choice.getAttribute("data-challenge-choice");
            var index = items.findIndex(function (item) { return String(item.no) === no; });
            if (event.key === "ArrowDown") { index = (index + 1) % items.length; }
            else if (event.key === "ArrowUp") { index = (index + items.length - 1) % items.length; }
            else if (event.key === "Home") { index = 0; }
            else if (event.key === "End") { index = items.length - 1; }
            else { return; }
            event.preventDefault();
            this._choose(String(items[index].no));
        },
        onAfterRendering: function () {
            if (!this._focus) { return; }
            var selector = this._focus.kind === "select" ? "select[data-challenge-select]" :
                '[data-challenge-' + this._focus.kind + '="' + this._focus.value + '"]';
            var target = this.getDomRef().querySelector(selector);
            if (target) { target.focus({ preventScroll: true }); }
            this._focus = null;
        },
        renderer: {
            apiVersion: 2,
            render: function (r, control) {
                var all = control.getChallenges() || [], items = control._items(), id = control.getId();
                var selected = items.find(function (item) { return String(item.no) === control.getSelectedNo(); }) || items[0];
                r.openStart("section", control).class("pfOverviewChallenges").attr("aria-labelledby", id + "-heading").openEnd();
                r.openStart("header").class("pfChallengeHeader").openEnd();
                r.openStart("div").class("pfChallengeHeadingCopy").openEnd();
                r.openStart("h3").attr("id", id + "-heading").openEnd().text(control.getHeading()).close("h3");
                tag(r, "p", "pfChallengeNote", control.getNote());
                r.close("div");
                r.openStart("div").class("pfChallengeFilters").attr("role", "group").attr("aria-label", "과제 표시 범위").openEnd();
                [{ key: "all", text: "전체 과제", count: all.length }, { key: "mine", text: "내 개발 포함", count: all.filter(mine).length }].forEach(function (filter) {
                    r.openStart("button").attr("type", "button").attr("data-challenge-filter", filter.key)
                        .attr("aria-pressed", String(control.getSelectedFilter() === filter.key)).openEnd()
                        .text(filter.text + " " + filter.count).close("button");
                });
                r.close("div").close("header");
                if (selected) {
                    var no = String(selected.no);
                    r.openStart("div").class("pfChallengeBody").openEnd();
                    r.openStart("div").class("pfChallengeMobileSelect").openEnd();
                    r.openStart("label").attr("for", id + "-select").openEnd().text("과제 선택").close("label");
                    r.openStart("select").attr("id", id + "-select").attr("data-challenge-select", "true").openEnd();
                    items.forEach(function (item) {
                        r.openStart("option").attr("value", String(item.no));
                        if (String(item.no) === no) { r.attr("selected", "selected"); }
                        r.openEnd().text(item.no + ". " + item.title).close("option");
                    });
                    r.close("select").close("div");
                    r.openStart("div").class("pfChallengeList").attr("role", "tablist").attr("aria-label", "비즈니스 과제").attr("aria-orientation", "vertical").openEnd();
                    items.forEach(function (item) {
                        var active = String(item.no) === no;
                        r.openStart("button").attr("id", id + "-tab-" + item.no).attr("type", "button")
                            .attr("data-challenge-choice", String(item.no)).attr("role", "tab")
                            .attr("aria-selected", String(active)).attr("aria-controls", id + "-detail").attr("tabindex", active ? "0" : "-1").openEnd();
                        tag(r, "span", "pfChallengeListTitle", item.no + ". " + item.title);
                        if (mine(item)) { tag(r, "span", "pfChallengeMineBadge", "내 개발 포함"); }
                        r.close("button");
                    });
                    r.close("div");
                    r.openStart("section").attr("id", id + "-detail").class("pfChallengeDetail").attr("role", "tabpanel")
                        .attr("aria-label", selected.no + ". " + selected.title).attr("tabindex", "0").openEnd();
                    tag(r, "h4", "pfChallengeDetailTitle", selected.no + ". " + selected.title);
                    r.openStart("div").class("pfChallengeCompare").openEnd();
                    r.openStart("div").class("pfChallengeAsis").openEnd();
                    tag(r, "h5", "", "AS-IS"); list(r, selected.asis);
                    r.openStart("div").class("pfChallengeIssues").openEnd();
                    (selected.issues || []).forEach(function (issue) { tag(r, "span", "", issue); });
                    r.close("div").close("div");
                    r.openStart("div").class("pfChallengeTobe").openEnd();
                    tag(r, "h5", "", "TO-BE 해소 방안"); list(r, selected.tobe);
                    r.close("div").close("div");
                    r.openStart("footer").class("pfChallengePrograms").openEnd();
                    tag(r, "span", "pfChallengeProgramsLabel", "연계 프로그램");
                    (selected.programs || []).forEach(function (program) {
                        if (program.to && /^sap\/[a-z0-9-]+$/.test(program.to)) {
                            r.openStart("a").attr("href", "#" + program.to).class("pfChallengeProgramMine").openEnd().text(program.name + " →").close("a");
                        } else { tag(r, "span", "pfChallengeProgram", program.name); }
                    });
                    r.close("footer").close("section").close("div");
                }
                r.close("section");
            }
        }
    });
});
