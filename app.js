/* First Coast Handyman — punch-list board */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + n; };

  var PHONE = "+19045392716";
  var TZ = "America/New_York";
  var HALF = 175;

  var JOBS = {
    drywall: { label: "Drywall Patch", price: 120 },
    tv: { label: "TV Mount & Conceal", price: 95 },
    fan: { label: "Ceiling Fan / Light", price: 110 },
    lock: { label: "Smart Lock Install", price: 85 }
  };
  var ORDER = ["drywall", "tv", "fan", "lock"];

  var state = { mode: "individual", items: ["drywall", "tv"] };

  /* ---------- boot failsafe ---------- */
  var boot = $("#boot");
  if (boot) {
    window.setTimeout(function () {
      if (boot && boot.parentNode) { boot.parentNode.removeChild(boot); }
    }, 2600);
  }

  /* ---------- today in Jacksonville ---------- */
  (function today() {
    var rows = $$(".hours__table tr[data-day]");
    if (!rows.length) { return; }
    var label;
    try {
      label = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: TZ }).format(new Date());
    } catch (err) {
      label = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
    }
    rows.forEach(function (row) {
      if (row.getAttribute("data-day") === label) {
        row.classList.add("is-today");
        var cell = $(".hours__now", row);
        if (cell) { cell.textContent = "Today"; }
      }
    });
  })();

  /* ---------- elements ---------- */
  var boardTotal = $("#boardTotal");
  var boardCount = $("#boardCount");
  var boardNote = $("#boardNote");
  var boardText = $("#boardText");

  var stackTotal = $("#stackTotal");
  var stackSub = $("#stackSub");
  var stackList = $("#stackList");
  var stackRef = $("#stackRef");
  var stackText = $("#stackText");
  var stackCall = $("#stackCall");

  var drawerNum = $("#drawerTotal");
  var drawerSub = $("#drawerSub");
  var drawerList = $("#drawerList");
  var drawerText = $("#drawerText");
  var drawerCall = $("#drawerCall");

  var barTotal = $("#barTotal");

  function selected() {
    return ORDER.filter(function (k) { return state.items.indexOf(k) !== -1; });
  }

  function total() {
    if (state.mode === "half") { return HALF; }
    return selected().reduce(function (sum, k) { return sum + JOBS[k].price; }, 0);
  }

  function countText() {
    var n = selected().length;
    if (!n) { return "No jobs yet"; }
    return n + (n === 1 ? " job" : " jobs");
  }

  function subText() {
    if (state.mode === "half") { return selected().length ? "Flat half-day rate" : "Flat half-day rate"; }
    var n = selected().length;
    if (!n) { return "Pick a job to price it"; }
    return n + (n === 1 ? " job on the list" : " jobs on the list");
  }

  function message() {
    var picked = selected();
    if (state.mode === "half") {
      var names = picked.map(function (k) { return JOBS[k].label; }).join(", ");
      return "Hi First Coast Handyman — half-day punch list (" + money(HALF) + " flat)." +
        (names ? " Jobs to cover: " + names + "." : "") +
        " Jacksonville. Can you confirm a window?";
    }
    if (!picked.length) {
      return "Hi First Coast Handyman — I'd like to book a punch-list visit in Jacksonville. What windows do you have?";
    }
    var parts = picked.map(function (k) { return JOBS[k].label + " " + money(JOBS[k].price); });
    return "Hi First Coast Handyman — punch list from your site: " + parts.join(" · ") +
      " = " + money(total()) + " (starting). Can you confirm a window?";
  }

  function rowsHtml() {
    var picked = selected();
    if (!picked.length) {
      return '<li class="is-empty">Nothing on the list yet — tap a job above.</li>';
    }
    var out = "";
    if (state.mode === "half") {
      out += "<li><span>Half-Day Punch-List</span><span>" + money(HALF) + "</span></li>";
      picked.forEach(function (k) {
        out += '<li class="is-inc"><span>' + JOBS[k].label + "</span><span>Included</span></li>";
      });
      return out;
    }
    picked.forEach(function (k) {
      out += "<li><span>" + JOBS[k].label + "</span><span>" + money(JOBS[k].price) + "</span></li>";
    });
    return out;
  }

  function render(pop) {
    var t = total();
    var rows = rowsHtml();
    var msgHref = "sms:" + PHONE + "?&body=" + encodeURIComponent(message());

    if (boardTotal) {
      boardTotal.textContent = money(t);
      if (pop) {
        boardTotal.classList.add("pop");
        window.setTimeout(function () { boardTotal.classList.remove("pop"); }, 220);
      }
    }
    if (boardCount) { boardCount.textContent = countText(); }
    if (boardNote) {
      boardNote.textContent = state.mode === "half"
        ? "Flat half-day rate — list what to cover."
        : (selected().length ? "Priced per job · half-day is $175 flat" : "Pick a job or two — or take the flat half-day.");
    }
    if (boardText) { boardText.href = msgHref; }

    if (stackTotal) {
      stackTotal.textContent = money(t);
      if (pop) {
        stackTotal.classList.add("pop");
        window.setTimeout(function () { stackTotal.classList.remove("pop"); }, 220);
      }
    }
    if (stackSub) { stackSub.textContent = subText(); }
    if (stackList) { stackList.innerHTML = rows; }
    if (stackRef) { stackRef.textContent = "FC-" + t; }
    if (stackText) { stackText.href = msgHref; }
    if (stackCall) { stackCall.href = "tel:" + PHONE; }

    if (drawerNum) { drawerNum.textContent = money(t); }
    if (drawerSub) { drawerSub.textContent = subText(); }
    if (drawerList) { drawerList.innerHTML = rows; }
    if (drawerText) { drawerText.href = msgHref; }
    if (drawerCall) { drawerCall.href = "tel:" + PHONE; }
    if (barTotal) { barTotal.textContent = money(t); }

    $$(".row[data-item]").forEach(function (row) {
      var on = state.items.indexOf(row.getAttribute("data-item")) !== -1;
      row.setAttribute("aria-pressed", on ? "true" : "false");
    });

    $$(".card[data-item]").forEach(function (card) {
      var key = card.getAttribute("data-item");
      var on = key === "half" ? state.mode === "half" : state.items.indexOf(key) !== -1;
      card.classList.toggle("is-on", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
      var pick = $("[data-pick]", card);
      if (pick) {
        pick.textContent = key === "half"
          ? (on ? "Selected" : "Select")
          : (on ? "Added" : "Add");
      }
    });

    $$(".seg[data-mode]").forEach(function (seg) {
      seg.setAttribute("aria-pressed", seg.getAttribute("data-mode") === state.mode ? "true" : "false");
    });
  }

  /* ---------- toggles ---------- */
  function toggle(key) {
    var i = state.items.indexOf(key);
    if (i === -1) { state.items.push(key); } else { state.items.splice(i, 1); }
    render(i === -1);
  }

  $$(".row[data-item]").forEach(function (row) {
    row.addEventListener("click", function () { toggle(row.getAttribute("data-item")); });
  });

  $$(".card[data-item]").forEach(function (card) {
    card.addEventListener("click", function () {
      var key = card.getAttribute("data-item");
      if (key === "half") {
        state.mode = state.mode === "half" ? "individual" : "half";
        render(state.mode === "half");
        return;
      }
      toggle(key);
    });
  });

  $$(".seg[data-mode]").forEach(function (seg) {
    seg.addEventListener("click", function () {
      state.mode = seg.getAttribute("data-mode") === "half" ? "half" : "individual";
      render(true);
    });
  });

  /* ---------- filters ---------- */
  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $$(".filter").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var f = btn.getAttribute("data-filter");
      $$(".card").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-cat") === f;
        card.hidden = !show;
      });
    });
  });

  /* ---------- card tilt ---------- */
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !calm) {
    $$(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" +
          (x * 8).toFixed(2) + "deg) translateZ(18px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
      card.addEventListener("blur", function () { card.style.transform = ""; });
    });
  }

  render(false);

  /* ---------- drawer ---------- */
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var drawerClose = $("#drawerClose");
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) { return; }
    lastFocus = document.activeElement;
    render(false);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (scrim) {
      scrim.hidden = false;
      window.requestAnimationFrame(function () { scrim.classList.add("is-open"); });
    }
    document.body.style.overflow = "hidden";
    if (drawerClose) { drawerClose.focus(); }
  }

  function closeDrawer() {
    if (!drawer) { return; }
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("is-open");
      window.setTimeout(function () {
        if (!drawer.classList.contains("is-open")) { scrim.hidden = true; }
      }, 400);
    }
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  $$("[data-open-estimate]").forEach(function (b) { b.addEventListener("click", openDrawer); });
  if (drawerClose) { drawerClose.addEventListener("click", closeDrawer); }
  if (scrim) { scrim.addEventListener("click", closeDrawer); }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) { closeDrawer(); }
  });
})();
