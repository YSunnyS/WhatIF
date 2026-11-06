(function () {
  "use strict";

  /* ==================================================================
     WhatIF simulator engine
     Careers register themselves on window.WhatIFCareers (see /careers).
     ================================================================== */

  var CAREERS = window.WhatIFCareers || {};
  var STORAGE_KEY = "whatif_log";
  var career = null;
  var state = null;
  var stage = null;
  var hud = null;
  var simGrid = null;

  var DEFAULT_GRADES = [
    { min: 80, label: "Exceeds expectations" },
    { min: 60, label: "Meets expectations" },
    { min: 40, label: "Needs improvement" },
    { min: 0, label: "Below expectations" }
  ];

  /* ---------------------------- helpers ---------------------------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function money(n) {
    var r = Math.round(n);
    var s = Math.abs(r).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (r < 0 ? "-$" : "$") + s;
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    var a = parts[0] ? parts[0].charAt(0) : "Y";
    var b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return (a + b).toUpperCase();
  }
  function riskLabel(p) { return p < 0.1 ? "Low" : p < 0.25 ? "Medium" : "High"; }

  function loadLog() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveLog(log) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); return true; } catch (e) { return false; }
  }

  function fill(t) { return String(t).replace(/\[name\]/g, state ? state.name : "you"); }

  /* Rich text: {{term}} or {{shown|key}} become tap-for-definition tooltips. */
  function makeTerm(shown, def) {
    var t = el("span", "term", shown);
    t.tabIndex = 0;
    t.setAttribute("role", "button");
    t.setAttribute("data-def", def);
    t.addEventListener("click", function (e) { e.stopPropagation(); t.classList.toggle("open"); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); t.classList.toggle("open"); }
    });
    return t;
  }

  function rich(parent, text) {
    text = fill(text);
    var re = /\{\{([^}]+)\}\}/g, last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var parts = m[1].split("|");
      var shown = parts[0];
      var key = (parts[1] || parts[0]).toLowerCase();
      var def = career.glossary && career.glossary[key];
      parent.appendChild(def ? makeTerm(shown, def) : document.createTextNode(shown));
      last = re.lastIndex;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
    return parent;
  }

  function portrait(ch, tiny) {
    var a = el("div", "portrait" + (tiny ? " tiny" : ""), ch.initials);
    a.style.background = ch.color;
    a.setAttribute("aria-hidden", "true");
    return a;
  }

  function speaker(who) {
    if (who === "you") return { name: state.name, role: "You", initials: initials(state.name), color: "#111111" };
    return career.characters[who];
  }

  function bubble(line) {
    if (!line.who) {
      var n = el("div", "narration");
      rich(n, line.text);
      return n;
    }
    var ch = speaker(who_(line));
    var row = el("div", "bubble-row" + (line.who === "you" ? " you" : ""));
    row.appendChild(portrait(ch));
    var body = el("div", "bubble");
    body.appendChild(el("div", "bubble-name", ch.name + (ch.role && line.who !== "you" ? " · " + ch.role : "")));
    var tx = el("div");
    rich(tx, line.text);
    body.appendChild(tx);
    row.appendChild(body);
    return row;
  }
  function who_(line) { return line.who; }

  /* ---------------------------- state ----------------------------- */

  function addMoney(label, amount, opts) {
    opts = opts || {};
    state.cash += amount;
    state.ledger.push({
      day: state.day, label: label, amount: amount,
      taxable: !!opts.taxable, cat: opts.cat || (amount >= 0 ? "income" : "spend")
    });
    return { text: (amount >= 0 ? "+" : "") + money(amount) + " " + label, tone: amount >= 0 ? "good" : "bad" };
  }

  function applyFx(fx) {
    var chips = [];
    if (!fx) return chips;
    ["skill", "rep", "energy"].forEach(function (k) {
      if (fx[k]) {
        var before = state[k];
        state[k] = clamp(before + fx[k], 0, 100);
        var d = state[k] - before;
        if (d !== 0) chips.push({ text: (d > 0 ? "+" : "") + d + " " + career.labels[k], tone: d > 0 ? "good" : "bad" });
      }
    });
    if (fx.cash) chips.push(addMoney(fx.cashLabel || "Money", fx.cash, { cat: fx.cashCat }));
    (fx.money || []).forEach(function (m) {
      chips.push(addMoney(m.label, m.amount, { taxable: m.taxable, cat: m.cat }));
    });
    if (fx.bonus) {
      state.bonus += fx.bonus;
      chips.push({ text: (fx.bonus > 0 ? "+" : "") + money(fx.bonus) + " " + career.bonus.label, tone: fx.bonus > 0 ? "good" : "bad" });
    }
    if (fx.rel) {
      Object.keys(fx.rel).forEach(function (id) {
        if (state.rel[id] === undefined) return;
        var before = state.rel[id];
        state.rel[id] = clamp(before + fx.rel[id], 0, 100);
        var d = state.rel[id] - before;
        if (d !== 0) chips.push({ text: (d > 0 ? "+" : "") + d + " " + career.characters[id].name.split(" ")[0], tone: d > 0 ? "good" : "bad" });
      });
    }
    if (fx.edge) state.edge += fx.edge;
    if (fx.flags) Object.keys(fx.flags).forEach(function (k) { state.flags[k] = fx.flags[k]; });
    return chips;
  }

  /* ---------------------------- layout ---------------------------- */

  function clearStage() { stage.innerHTML = ""; }

  function beginPanel(clockText, title) {
    clearStage();
    var bar = el("div", "hud-bar");
    var dayLabel = state
      ? "Day " + (state.day + 1) + " of " + career.days.length + " · " + career.days[state.day].name
      : career.org;
    bar.appendChild(el("span", "day", dayLabel));
    if (state) {
      var c = el("span", "cash", money(state.cash));
      c.setAttribute("data-cash", "1");
      if (state.cash < 0) c.classList.add("neg");
      bar.appendChild(c);
    }
    stage.appendChild(bar);

    if (state) {
      var track = el("div", "progress-track");
      var fillEl = el("div", "progress-fill");
      fillEl.style.width = Math.min(100, (state.stepNo / state.totalSteps) * 100) + "%";
      track.appendChild(fillEl);
      stage.appendChild(track);
    }
    if (clockText) stage.appendChild(el("div", "clock", clockText));
    if (title) stage.appendChild(el("h2", null, title));
    return stage;
  }

  function scrollTop() { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } }

  function statBar(label, value) {
    var wrap = el("div", "meter");
    var l = el("div", "label");
    l.appendChild(el("span", null, label));
    l.appendChild(el("span", null, String(Math.round(value))));
    wrap.appendChild(l);
    var bar = el("div", "bar");
    var f = el("div");
    f.style.width = clamp(value, 0, 100) + "%";
    bar.appendChild(f);
    wrap.appendChild(bar);
    return wrap;
  }

  function refreshHud() {
    if (!state) { hud.hidden = true; return; }
    hud.hidden = false;
    hud.innerHTML = "";
    hud.appendChild(el("h3", null, career.title));
    hud.appendChild(el("div", "hud-sub", state.name + " · " + career.org));

    var cashBox = el("div", "hud-cash");
    cashBox.appendChild(el("span", "hud-cash-label", "Cash"));
    var cv = el("span", "hud-cash-value" + (state.cash < 0 ? " neg" : ""), money(state.cash));
    cashBox.appendChild(cv);
    hud.appendChild(cashBox);
    var bonusLine = el("div", "hud-bonus");
    bonusLine.appendChild(document.createTextNode(career.bonus.label + ": "));
    bonusLine.appendChild(el("strong", null, money(state.bonus)));
    bonusLine.appendChild(document.createTextNode(" (not paid until the end)"));
    hud.appendChild(bonusLine);

    document.querySelectorAll("[data-cash]").forEach(function (n) {
      n.textContent = money(state.cash);
      n.classList.toggle("neg", state.cash < 0);
    });

    hud.appendChild(statBar(career.labels.skill, state.skill));
    hud.appendChild(statBar(career.labels.rep, state.rep));
    hud.appendChild(statBar(career.labels.energy, state.energy));

    var relIds = Object.keys(state.rel);
    if (relIds.length) {
      hud.appendChild(el("h4", null, "Relationships"));
      relIds.forEach(function (id) {
        var ch = career.characters[id];
        var row = el("div", "rel-row");
        row.appendChild(portrait(ch, true));
        var mid = el("div", "rel-mid");
        mid.appendChild(el("div", "rel-name", ch.name));
        var bar = el("div", "bar");
        var f = el("div");
        f.style.width = state.rel[id] + "%";
        bar.appendChild(f);
        mid.appendChild(bar);
        row.appendChild(mid);
        hud.appendChild(row);
      });
    }

    hud.appendChild(el("h4", null, "Recent money"));
    var log = el("ul", "mini-ledger");
    var recent = state.ledger.slice(-5).reverse();
    if (!recent.length) log.appendChild(el("li", "muted", "Nothing yet."));
    recent.forEach(function (e) {
      var li = el("li");
      li.appendChild(el("span", null, e.label));
      li.appendChild(el("span", e.amount >= 0 ? "pos" : "neg", (e.amount >= 0 ? "+" : "") + money(e.amount)));
      log.appendChild(li);
    });
    hud.appendChild(log);
  }

  /* ------------------------ dialogue reveal ----------------------- */

  function revealLines(container, lines, done) {
    if (!lines || !lines.length) { done(); return; }
    var holder = el("div", "dialogue");
    container.appendChild(holder);
    var row = el("div", "next-row");
    container.appendChild(row);
    var i = 0, finished = false;

    function finish() { if (finished) return; finished = true; row.innerHTML = ""; done(); }
    function showNext() {
      holder.appendChild(bubble(lines[i]));
      i++;
      row.innerHTML = "";
      if (i >= lines.length) { finish(); return; }
      var b = el("button", "btn small secondary", "Next");
      b.type = "button";
      b.addEventListener("click", showNext);
      var skip = el("button", "linklike", "Skip to choices");
      skip.type = "button";
      skip.addEventListener("click", function () {
        while (i < lines.length) { holder.appendChild(bubble(lines[i])); i++; }
        finish();
      });
      row.appendChild(b);
      row.appendChild(skip);
      b.focus({ preventScroll: true });
      try { row.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {}
    }
    showNext();
  }

  function renderChips(container, chips) {
    if (!chips.length) return;
    var wrap = el("div", "chips");
    chips.forEach(function (c) { wrap.appendChild(el("span", "chip-fx " + c.tone, c.text)); });
    container.appendChild(wrap);
  }

  /* --------------------------- scenes ----------------------------- */

  function renderScene(def) {
    if (typeof def === "function") def = def(state);
    if (def.enter) def.enter(state);
    var body = beginPanel(def.time ? def.time + "  ·  " + career.days[state.day].name.toUpperCase() : "", def.title);
    scrollTop();
    if (def.setting) {
      var setting = el("div", "scene");
      rich(setting, def.setting);
      body.appendChild(setting);
    }
    if (def.facts) {
      var facts = el("div", "facts");
      def.facts.forEach(function (f) {
        var box = el("div", "fact");
        var v = el("b");
        rich(v, f.value);
        box.appendChild(v);
        var l = el("span");
        rich(l, f.label);
        box.appendChild(l);
        facts.appendChild(box);
      });
      body.appendChild(facts);
    }

    var after = el("div");
    body.appendChild(after);

    revealLines(body, def.lines || [], function () {
      body.appendChild(after);
      if (def.choices) showChoices(after, def);
      else showAuto(after, def);
    });
  }

  function showChoices(container, def) {
    if (def.prompt) {
      var p = el("p", "prompt");
      var s = el("strong");
      rich(s, def.prompt);
      p.appendChild(s);
      container.appendChild(p);
    }
    var wrap = el("div", "choices");
    var buttons = [];
    def.choices.forEach(function (c) {
      if (c.when && !c.when(state)) return;
      var b = el("button", "choice");
      b.type = "button";
      var t = el("span", "choice-text");
      rich(t, c.text);
      b.appendChild(t);
      var hint = typeof c.hint === "function" ? c.hint(state) : c.hint;
      if (hint) b.appendChild(el("span", "choice-hint", hint));
      b.addEventListener("click", function () {
        buttons.forEach(function (x) { x.disabled = true; });
        b.classList.add("picked");
        resolveChoice(container, c);
      });
      buttons.push(b);
      wrap.appendChild(b);
    });
    container.appendChild(wrap);
  }

  function showOutcome(container, res) {
    var chips = applyFx(res.fx);
    var out = el("div", "outcome");
    if (res.reaction && res.reaction.length) {
      var d = el("div", "dialogue");
      res.reaction.forEach(function (l) { d.appendChild(bubble(l)); });
      out.appendChild(d);
    }
    renderChips(out, chips);
    var next = el("button", "btn", "Continue");
    next.type = "button";
    next.addEventListener("click", advance);
    out.appendChild(next);
    container.appendChild(out);
    refreshHud();
    try { next.focus({ preventScroll: true }); next.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {}
  }

  function resolveChoice(container, c) {
    var res = typeof c.run === "function" ? c.run(state) : c;
    showOutcome(container, { reaction: res.reaction, fx: res.fx });
  }

  function showAuto(container, def) {
    showOutcome(container, { reaction: def.reaction, fx: def.fx });
  }

  /* ----------------------------- commute -------------------------- */

  function commuteScene() {
    var c = career.commute, d = state.day;
    var deadline = c.deadlines[d], fee = c.fees[d];
    var baseP = state.housing.late + (state.energy < 45 ? 0.15 : 0);
    var choices = c.options.map(function (opt) {
      var p = clamp(baseP * opt.mult, 0.02, 0.75);
      return {
        text: opt.text + (opt.cost ? " (" + money(-opt.cost) + ")" : " (free)"),
        hint: "Risk of arriving late: " + riskLabel(p),
        run: function (s) {
          var pp = clamp((s.housing.late + (s.energy < 45 ? 0.15 : 0)) * opt.mult, 0.02, 0.75);
          var fx = { money: [], energy: opt.energy || 0, skill: opt.skill || 0, rel: {} };
          if (opt.cost) fx.money.push({ label: opt.short, amount: -opt.cost, cat: "spend" });
          var late = Math.random() < pp;
          var reaction = [];
          if (late) {
            s.lates += 1;
            fx.money.push({ label: c.feeLabels[d], amount: -fee, cat: "penalty" });
            fx.rep = -4;
            if (c.bossId) fx.rel[c.bossId] = -4;
            reaction.push({ text: c.lateLines[d] });
          } else {
            reaction.push({ text: c.okLines[d] });
          }
          return { reaction: reaction, fx: fx };
        }
      };
    });
    return {
      time: "Morning",
      title: "Getting to " + c.where,
      setting: c.flavor[d],
      prompt: "You need to be at " + c.where + " by " + deadline + ". Arriving late costs " + money(fee) + ". How do you get there?",
      choices: choices
    };
  }

  /* ------------------------------ flow ---------------------------- */

  function startRun(name, housing) {
    var st = career.start;
    state = {
      name: name || "Alex", housing: housing, day: 0, ptr: 0, stepNo: 0, totalSteps: 0, steps: [],
      cash: st.cash, startCash: st.cash, rep: st.rep, skill: st.skill, energy: st.energy,
      bonus: career.bonus.start, lates: 0, edge: 0, rel: {}, flags: {}, ledger: [], bought: {}
    };
    Object.keys(career.characters).forEach(function (k) {
      var ch = career.characters[k];
      if (ch.rel) state.rel[k] = ch.start;
    });
    var last = career.days.length - 1;
    state.totalSteps = career.days.reduce(function (n, d, i) {
      return n + 1 + d.scenes.length + (i === last && career.finale ? 1 : 0) + 1;
    }, 0);
    simGrid.classList.remove("no-hud");
    startDay();
  }

  function startDay() {
    if (state.day > 0) state.energy = clamp(state.energy + 25, 0, 100);
    var day = career.days[state.day];
    var last = state.day === career.days.length - 1;
    state.steps = [{ type: "commute" }];
    day.scenes.forEach(function (def) { state.steps.push({ type: "scene", def: def }); });
    if (last && career.finale) state.steps.push({ type: "finale" });
    state.steps.push({ type: "evening" });
    state.ptr = 0;
    refreshHud();
    runStep();
  }

  function runStep() {
    var step = state.steps[state.ptr];
    state.stepNo += 1;
    if (step.type === "commute") renderScene(commuteScene());
    else if (step.type === "scene") renderScene(step.def);
    else if (step.type === "finale") renderScene(career.finale(state));
    else if (step.type === "evening") renderEvening();
  }

  function advance() { state.ptr += 1; runStep(); }

  /* ----------------------------- evening -------------------------- */

  function todaysLedger() { return state.ledger.filter(function (e) { return e.day === state.day; }); }

  function renderEvening() {
    shopBtns = [];
    var d = state.day;
    var last = d === career.days.length - 1;
    var body = beginPanel("Evening", "End of day " + (d + 1));
    scrollTop();
    if (career.evening && career.evening[d]) {
      var n = el("div", "scene");
      rich(n, career.evening[d]);
      body.appendChild(n);
    }

    var gross = career.pay.gross;
    var taxable = gross;
    todaysLedger().forEach(function (e) { if (e.taxable && e.amount > 0) taxable += e.amount; });
    var tax = Math.round(taxable * career.taxRate);
    addMoney(career.pay.label, gross, { cat: "income" });
    addMoney("Estimated taxes (" + Math.round(career.taxRate * 100) + "%)", -tax, { cat: "tax" });
    addMoney("Housing: " + state.housing.name, -state.housing.cost, { cat: "bill" });
    career.dailyBills.forEach(function (b) { addMoney(b.label, -b.amount, { cat: "bill" }); });
    var overdrawn = false;
    if (state.cash < 0) {
      overdrawn = true;
      addMoney("Overdraft fee", -30, { cat: "penalty" });
    }

    body.appendChild(el("h3", null, "Your money today"));
    var table = el("table", "payslip");
    var rows = todaysLedger();
    var net = 0;
    rows.forEach(function (e) {
      net += e.amount;
      var tr = el("tr");
      tr.appendChild(el("td", null, e.label));
      tr.appendChild(el("td", "amt " + (e.amount >= 0 ? "pos" : "neg"), (e.amount >= 0 ? "+" : "") + money(e.amount)));
      table.appendChild(tr);
    });
    var tot = el("tr", "total");
    tot.appendChild(el("td", null, "Change in cash today"));
    tot.appendChild(el("td", "amt " + (net >= 0 ? "pos" : "neg"), (net >= 0 ? "+" : "") + money(net)));
    table.appendChild(tot);
    var now = el("tr", "total");
    now.appendChild(el("td", null, "Cash now"));
    var nowAmt = el("td", "amt", money(state.cash));
    nowAmt.setAttribute("data-cash", "1");
    now.appendChild(nowAmt);
    table.appendChild(now);
    body.appendChild(table);
    if (overdrawn) {
      var warn = el("p", "warn", "You went below zero, so the bank charged an overdraft fee. Running out of cash gets expensive quickly.");
      body.appendChild(warn);
    }
    refreshHud();

    if (last) {
      var go = el("button", "btn", "See my review");
      go.type = "button";
      go.style.marginTop = "18px";
      go.addEventListener("click", renderReview);
      body.appendChild(go);
      return;
    }

    body.appendChild(el("h3", null, "After work"));
    var sub = el("p", "muted", "Spend some of your cash, or keep it. Everything here has a trade-off.");
    body.appendChild(sub);
    var shop = el("div", "shop");
    career.shop.forEach(function (item) {
      var key = item.id + (item.daily ? "@" + d : "");
      var card = el("div", "shop-item");
      var left = el("div", "shop-left");
      left.appendChild(el("strong", null, item.name));
      var desc = el("div", "shop-desc");
      rich(desc, item.desc);
      left.appendChild(desc);
      card.appendChild(left);
      var right = el("div", "shop-right");
      right.appendChild(el("div", "shop-price", item.cost ? money(item.cost) : "Free"));
      var btn = el("button", "btn small secondary", item.cost ? "Buy" : "Do it");
      btn.type = "button";
      function sync() {
        var owned = !!state.bought[key];
        btn.disabled = owned || state.cash < item.cost;
        btn.textContent = owned ? "Done" : state.cash < item.cost ? "Can't afford" : (item.cost ? "Buy" : "Do it");
      }
      btn.addEventListener("click", function () {
        if (state.bought[key] || state.cash < item.cost) return;
        state.bought[key] = true;
        var fx = {};
        Object.keys(item.fx || {}).forEach(function (k) { fx[k] = item.fx[k]; });
        fx.money = (item.cost ? [{ label: item.name, amount: -item.cost, cat: "spend" }] : []);
        var chips = applyFx(fx);
        card.querySelectorAll(".chips").forEach(function (c) { c.remove(); });
        renderChips(left, chips);
        refreshHud();
        shopBtns.forEach(function (s) { s(); });
      });
      shopBtns.push(sync);
      right.appendChild(btn);
      card.appendChild(right);
      shop.appendChild(card);
    });
    body.appendChild(shop);
    shopBtns.forEach(function (s) { s(); });

    var end = el("button", "btn", "Go to sleep and start Day " + (d + 2));
    end.type = "button";
    end.style.marginTop = "18px";
    end.addEventListener("click", function () { shopBtns = []; state.day += 1; startDay(); });
    body.appendChild(end);
  }
  var shopBtns = [];

  /* ------------------------------ review -------------------------- */

  function sumLedger(pred) {
    return state.ledger.reduce(function (n, e) { return pred(e) ? n + e.amount : n; }, 0);
  }

  function renderReview() {
    var review = career.review(state);
    state.reviewScore = review.score;
    var grades = career.grades || DEFAULT_GRADES;
    var grade = grades[grades.length - 1].label;
    for (var i = 0; i < grades.length; i++) { if (review.score >= grades[i].min) { grade = grades[i].label; break; } }

    var objectives = career.objectives.map(function (o) { return { text: o.text, done: !!o.test(state) }; });
    var stars = objectives.filter(function (o) { return o.done; }).length;

    var body = beginPanel("Final review", career.reviewTitle);
    scrollTop();

    var big = el("div", "review-head");
    var starRow = el("div", "stars");
    for (var s = 0; s < objectives.length; s++) {
      starRow.appendChild(el("span", s < stars ? "star on" : "star", "★"));
    }
    big.appendChild(starRow);
    big.appendChild(el("div", "grade", grade));
    big.appendChild(el("div", "muted", "Review score: " + review.score + " / 100"));
    body.appendChild(big);

    var d = el("div", "dialogue");
    review.lines.forEach(function (l) { d.appendChild(bubble(l)); });
    body.appendChild(d);

    body.appendChild(el("h3", null, "Mission goals"));
    var ol = el("ul", "objectives");
    objectives.forEach(function (o) {
      var li = el("li", o.done ? "done" : "");
      li.appendChild(el("span", "tick", o.done ? "✓" : "–"));
      var t = el("span");
      rich(t, o.text);
      li.appendChild(t);
      ol.appendChild(li);
    });
    body.appendChild(ol);

    body.appendChild(el("h3", null, "Where your money went"));
    var income = sumLedger(function (e) { return e.cat === "income" && e.amount > 0; });
    var taxes = sumLedger(function (e) { return e.cat === "tax"; });
    var bills = sumLedger(function (e) { return e.cat === "bill"; });
    var spending = sumLedger(function (e) { return e.cat === "spend"; });
    var penalties = sumLedger(function (e) { return e.cat === "penalty"; });
    var table = el("table", "payslip");
    [
      ["Total earned (pay, bonuses and prizes)", income],
      ["Estimated taxes", taxes],
      ["Housing and food", bills],
      ["Commuting, purchases and other spending", spending],
      ["Penalties and fees", penalties]
    ].forEach(function (r) {
      var tr = el("tr");
      tr.appendChild(el("td", null, r[0]));
      tr.appendChild(el("td", "amt " + (r[1] >= 0 ? "pos" : "neg"), (r[1] > 0 ? "+" : "") + money(r[1])));
      table.appendChild(tr);
    });
    var tot = el("tr", "total");
    tot.appendChild(el("td", null, "Cash at the end (started with " + money(state.startCash) + ")"));
    tot.appendChild(el("td", "amt", money(state.cash)));
    table.appendChild(tot);
    body.appendChild(table);

    var reality = el("div", "scene");
    reality.appendChild(el("strong", null, "Reality check: "));
    reality.appendChild(document.createTextNode(career.reality));
    body.appendChild(reality);

    body.appendChild(el("h3", null, "How much did you enjoy this career?"));
    var ratingRow = el("div", "filters");
    ratingRow.style.justifyContent = "flex-start";
    ratingRow.style.margin = "8px 0 16px";
    var rating = 0, chips = [];
    for (var r = 1; r <= 5; r++) {
      (function (val) {
        var chip = el("button", "chip", String(val));
        chip.type = "button";
        chip.setAttribute("aria-label", val + " out of 5");
        chip.addEventListener("click", function () {
          rating = val;
          chips.forEach(function (c, idx) { c.classList.toggle("on", idx + 1 === val); });
        });
        chips.push(chip);
        ratingRow.appendChild(chip);
      })(r);
    }
    body.appendChild(ratingRow);

    body.appendChild(el("h3", null, "What stood out to you?"));
    var note = el("textarea");
    note.placeholder = "Which decision felt most natural? Which was stressful? Would you want to try this for real?";
    body.appendChild(note);

    var saveBtn = el("button", "btn", "Save to my journal");
    saveBtn.type = "button";
    var status = el("p");
    status.style.marginTop = "10px";
    saveBtn.addEventListener("click", function () {
      var log = loadLog();
      log[career.id] = { rating: rating, note: note.value, date: new Date().toISOString(), stars: stars, grade: grade, cash: state.cash };
      status.textContent = saveLog(log)
        ? "Saved. Your journal lives in this browser."
        : "Couldn't save in this browser, but your reflection above is still yours to copy.";
    });
    body.appendChild(saveBtn);
    body.appendChild(status);

    var links = el("div");
    links.style.cssText = "margin-top:22px;display:flex;gap:12px;flex-wrap:wrap;";
    var again = el("a", "btn secondary small", "Replay this career");
    again.href = "simulator.html?career=" + career.id;
    var more = el("a", "btn small", "Try another career");
    more.href = "main.html";
    links.appendChild(again);
    links.appendChild(more);
    body.appendChild(links);
    refreshHud();
  }

  /* ----------------------------- briefing ------------------------- */

  function renderBriefing() {
    state = null;
    refreshHud();
    simGrid.classList.add("no-hud");
    var body = beginPanel("Briefing", career.title + " at " + career.org);
    document.title = career.title + " | WhatIF";

    var intro = el("p");
    rich(intro, career.briefing.intro);
    body.appendChild(intro);

    body.appendChild(el("h3", null, "Your mission"));
    var ul = el("ul", "objectives");
    career.objectives.forEach(function (o) {
      var li = el("li");
      li.appendChild(el("span", "tick", "–"));
      var t = el("span");
      rich(t, o.text);
      li.appendChild(t);
      ul.appendChild(li);
    });
    body.appendChild(ul);

    body.appendChild(el("h3", null, "How the money works"));
    var rules = el("ul", "rules");
    career.briefing.rules.forEach(function (r) {
      var li = el("li");
      rich(li, r);
      rules.appendChild(li);
    });
    body.appendChild(rules);

    body.appendChild(el("h3", null, "Meet the people you'll work with"));
    var cast = el("div", "cast");
    Object.keys(career.characters).forEach(function (id) {
      var ch = career.characters[id];
      var row = el("div", "cast-row");
      row.appendChild(portrait(ch));
      var t = el("div");
      t.appendChild(el("strong", null, ch.name));
      t.appendChild(el("div", "muted", ch.role));
      row.appendChild(t);
      cast.appendChild(row);
    });
    body.appendChild(cast);

    body.appendChild(el("h3", null, "Your character"));
    var label = el("label", "field-label", "Your name");
    label.setAttribute("for", "player-name");
    body.appendChild(label);
    var input = el("input", "text-input");
    input.id = "player-name";
    input.type = "text";
    input.maxLength = 20;
    input.placeholder = "Alex";
    body.appendChild(input);

    body.appendChild(el("h3", null, career.briefing.housingTitle));
    body.appendChild(el("p", "muted", career.briefing.housingHelp));
    var picked = 1;
    var cards = [];
    var grid = el("div", "housing");
    career.housing.forEach(function (h, idx) {
      var b = el("button", "housing-card");
      b.type = "button";
      b.appendChild(el("strong", null, h.name));
      b.appendChild(el("span", "housing-cost", h.cost ? money(h.cost) + " per day" : "Free"));
      b.appendChild(el("span", "housing-desc", h.desc));
      b.appendChild(el("span", "housing-risk", "Late risk: " + riskLabel(h.late)));
      b.addEventListener("click", function () {
        picked = idx;
        cards.forEach(function (c, i) { c.classList.toggle("on", i === idx); c.setAttribute("aria-pressed", i === idx ? "true" : "false"); });
      });
      cards.push(b);
      grid.appendChild(b);
    });
    cards[picked].classList.add("on");
    cards[picked].setAttribute("aria-pressed", "true");
    body.appendChild(grid);

    var start = el("button", "btn", "Start Day 1");
    start.type = "button";
    start.style.marginTop = "24px";
    start.addEventListener("click", function () {
      startRun(input.value.trim() || "Alex", career.housing[picked]);
    });
    body.appendChild(start);
  }

  /* ------------------------------ picker -------------------------- */

  function renderPicker() {
    var picker = document.getElementById("picker");
    var grid = document.getElementById("picker-grid");
    picker.hidden = false;
    simGrid.hidden = true;
    Object.keys(CAREERS).forEach(function (key) {
      var c = CAREERS[key];
      var card = el("div", "card career-card");
      card.appendChild(el("span", "tag", "Playable · " + c.days.length + " days"));
      card.appendChild(el("div", "field", c.field));
      card.appendChild(el("h3", null, c.title));
      card.appendChild(el("p", null, c.blurb));
      var push = el("div", "push");
      var a = el("a", "btn small", "Start");
      a.href = "simulator.html?career=" + key;
      push.appendChild(a);
      card.appendChild(push);
      grid.appendChild(card);
    });
  }

  /* ------------------------------- init --------------------------- */

  function init() {
    stage = document.getElementById("stage");
    hud = document.getElementById("hud");
    simGrid = document.getElementById("sim");
    var id = new URLSearchParams(window.location.search).get("career");
    if (!id || !CAREERS[id]) { renderPicker(); return; }
    career = CAREERS[id];
    simGrid.hidden = false;
    renderBriefing();
  }

  init();
  window.WhatIFEngine = { get state() { return state; } };
})();
