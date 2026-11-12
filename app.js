"use strict";

const $ = (id) => document.getElementById(id);
const SLOPE_RANK = { flat: 0, gentle: 1, steep: 2 };

// ---------- setup ----------
function fillSelect(select, items) {
  items.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function fillReportSelect() {
  $("report-route").innerHTML = "";
  routes.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.from} to ${r.to}: ${r.label}` + (r.status === "closed" ? " (closed)" : "");
    $("report-route").appendChild(opt);
  });
}

// ---------- logic ----------
function walkMinutes(distanceM, pace) {
  return Math.ceil(distanceM / pace);
}

function accessScore(r) {
  // lower is better
  return (r.hasSteps ? 10 : 0) + SLOPE_RANK[r.slope] * 2 + (r.covered ? 0 : 1) + (r.status === "closed" ? 20 : 0);
}

function readFilters() {
  return {
    from: $("from").value,
    to: $("to").value,
    stepFree: $("stepFree").checked,
    covered: $("covered").checked,
    noSteep: $("noSteep").checked,
    pace: Number($("pace").value),
    maxDist: $("maxDist").value === "" ? null : Number($("maxDist").value),
    sort: $("sort").value
  };
}

function validate(f) {
  let ok = true;
  $("from-err").textContent = "";
  $("to-err").textContent = "";
  $("maxDist-err").textContent = "";

  if (!f.from) { $("from-err").textContent = "Choose a starting building."; ok = false; }
  if (!f.to) { $("to-err").textContent = "Choose a destination."; ok = false; }
  if (f.from && f.to && f.from === f.to) {
    $("to-err").textContent = "You are already there. Choose a different destination.";
    ok = false;
  }
  if (!$("maxDist").checkValidity()) {
    $("maxDist-err").textContent = "Enter a distance between 50 and 2000 metres, or leave it empty.";
    ok = false;
  }
  return ok;
}

function findRoutes(f) {
  const between = routes.filter(
    (r) => (r.from === f.from && r.to === f.to) || (r.from === f.to && r.to === f.from)
  );
  const matches = between.filter((r) => {
    if (f.stepFree && r.hasSteps) return false;
    if (f.covered && !r.covered) return false;
    if (f.noSteep && r.slope === "steep") return false;
    if (f.maxDist !== null && r.distanceM > f.maxDist) return false;
    return true;
  });
  matches.sort((a, b) =>
    f.sort === "access"
      ? accessScore(a) - accessScore(b) || a.distanceM - b.distanceM
      : a.distanceM - b.distanceM
  );
  return { between, matches };
}

// ---------- rendering ----------
function badge(text, cls) {
  const s = document.createElement("span");
  s.className = "badge " + cls;
  s.textContent = text;
  return s;
}

function renderCard(r, pace) {
  const li = document.createElement("li");
  li.className = "card" + (r.status === "closed" ? " closed" : (r.hasSteps || r.slope === "steep") ? " caution" : "");

  const h = document.createElement("h3");
  h.textContent = r.label;
  li.appendChild(h);

  const p = document.createElement("p");
  p.className = "time";
  p.textContent = `${walkMinutes(r.distanceM, pace)} min, ${r.distanceM} m`;
  li.appendChild(p);

  const tags = document.createElement("div");
  tags.className = "tags";
  tags.appendChild(r.hasSteps ? badge("Has steps", "bad") : badge("Step-free", "good"));
  tags.appendChild(badge("Slope: " + r.slope, r.slope === "steep" ? "bad" : "good"));
  tags.appendChild(badge(r.covered ? "Covered" : "Open to weather", r.covered ? "good" : "neutral"));
  if (r.lift) tags.appendChild(badge("Uses a lift", "neutral"));
  li.appendChild(tags);

  if (r.status === "closed") {
    const w = document.createElement("p");
    w.className = "warn";
    w.textContent = "Closed: " + (r.note || "reported blocked") + ". Do not rely on this route.";
    li.appendChild(w);
  }
  return li;
}

function update() {
  const f = readFilters();
  const list = $("route-list");
  const status = $("status");
  list.innerHTML = "";

  if (!f.from || !f.to) {
    status.textContent = "Choose where you are starting and where you are going.";
    return;
  }
  if (!validate(f)) {
    status.textContent = "Fix the highlighted fields to see routes.";
    return;
  }

  const { between, matches } = findRoutes(f);
  if (between.length === 0) {
    status.textContent = "No direct route is recorded between these buildings. Try going via another building.";
    return;
  }
  if (matches.length === 0) {
    status.textContent = `None of the ${between.length} routes match your needs. Try turning off a filter or raising the distance limit.`;
    return;
  }
  matches.forEach((r) => list.appendChild(renderCard(r, f.pace)));
  const closedCount = matches.filter((r) => r.status === "closed").length;
  status.textContent =
    `${matches.length} route${matches.length > 1 ? "s" : ""} found from ${f.from} to ${f.to}.` +
    (closedCount ? ` ${closedCount} of them ${closedCount > 1 ? "are" : "is"} currently closed.` : "");
}

// ---------- events ----------
$("plan-form").addEventListener("input", update);
$("plan-form").addEventListener("change", update);
$("plan-form").addEventListener("submit", (e) => {
  e.preventDefault();
  update();
  $("results").focus();
});
$("plan-form").addEventListener("reset", () => {
  setTimeout(() => {
    ["from-err", "to-err", "maxDist-err"].forEach((id) => ($(id).textContent = ""));
    update();
  }, 0);
});

$("report-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const reason = $("reason").value.trim();
  const msg = $("report-status");
  $("reason-err").textContent = "";
  if (reason.length < 5) {
    $("reason-err").textContent = "Describe the problem in at least 5 characters.";
    return;
  }
  const route = routes.find((r) => r.id === Number($("report-route").value));
  if (!route) return;
  if (route.status === "closed") {
    msg.textContent = "That route is already marked closed.";
    return;
  }
  route.status = "closed";
  route.note = reason;
  msg.textContent = `Marked "${route.label}" as closed. Thank you.`;
  $("reason").value = "";
  fillReportSelect();
  update();
});

// ---------- start ----------
fillSelect($("from"), locations);
fillSelect($("to"), locations);
fillReportSelect();
update();
