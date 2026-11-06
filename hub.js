(function () {
  "use strict";
  var STORAGE_KEY = "whatif_log";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function loadLog() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (err) { return {}; }
  }

  var chips = document.querySelectorAll("#filters .chip");
  var cards = document.querySelectorAll("#career-grid .career-card");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) { c.classList.toggle("on", c === chip); });
      cards.forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.style.display = show ? "" : "none";
      });
    });
  });

  var log = loadLog();
  cards.forEach(function (card) {
    var id = card.getAttribute("data-career");
    if (id && log[id]) {
      var entry = log[id];
      var text = "Completed" +
        (entry.stars !== undefined ? " · " + entry.stars + "/3 goals" : "") +
        (entry.rating ? " · rated " + entry.rating + "/5" : "");
      var badge = el("p", null, "✓ " + text);
      badge.style.fontWeight = "700";
      badge.style.color = "#0d6b61";
      badge.style.fontSize = "0.9rem";
      card.insertBefore(badge, card.querySelector(".push"));
    }
  });
})();
