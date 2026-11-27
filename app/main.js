// Deal Radar wiring: hash routes, search and filters, sorting, and the
// result count. All state lives in the URL hash, so a filtered view can be
// shared and screenshotted. Nothing is fetched: deals come from data.js.
//
//   #/                          the finder, with search and filters
//   #/?q=airpods&cat=TV...      the finder, pre-filtered
//   #/deal/<id>                 one deal, with a cross-store comparison
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { CATEGORIES, STORES, deals } from "./data.js";
import { percentOff, saved } from "./format.js";
import { dealCards, dealPage, listPage, missingPage } from "./views.js";

const app = document.getElementById("app");

function readState() {
  const params = new URLSearchParams(location.hash.replace(/^#\/\??/, ""));
  const q = params.get("q") || "";
  const cat = params.get("cat") || "";
  const store = params.get("store") || "";
  const minOff = Number(params.get("min") || 0) || 0;
  const sort = params.get("sort") || "pct";
  return { q, cat, store, minOff, sort };
}

function applyFilters(state) {
  const q = state.q.trim().toLowerCase();
  let shown = deals.filter(
    (d) =>
      (state.cat === "" || d.category === state.cat) &&
      (state.store === "" || d.store === state.store) &&
      percentOff(d) >= state.minOff &&
      (q === "" || `${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)),
  );
  const rank = { "new-low": 0, strong: 1, routine: 2 };
  const by = {
    pct: (a, b) => percentOff(b) - percentOff(a),
    save: (a, b) => saved(b) - saved(a),
    price: (a, b) => a.price - b.price,
    verdict: (a, b) => rank[a.verdict] - rank[b.verdict] || percentOff(b) - percentOff(a),
  };
  shown = [...shown].sort(by[state.sort] || by.pct);
  return shown;
}

function counts() {
  return {
    newLow: deals.filter((d) => d.verdict === "new-low").length,
    bestSave: Math.max(...deals.map(saved)),
    bestPct: Math.max(...deals.map(percentOff)),
    categories: CATEGORIES,
    stores: STORES,
  };
}

function writeHash(state) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.cat) params.set("cat", state.cat);
  if (state.store) params.set("store", state.store);
  if (state.minOff) params.set("min", String(state.minOff));
  if (state.sort !== "pct") params.set("sort", state.sort);
  const query = params.toString();
  history.replaceState(null, "", `#/${query ? `?${query}` : ""}`);
}

function renderList() {
  const state = readState();
  const shown = applyFilters(state);
  app.innerHTML = listPage(deals, { ...state, shown }, counts());
  const count = document.getElementById("count");
  count.textContent = `Showing ${shown.length} of ${deals.length} deals`;
  const results = document.getElementById("results");
  const rerender = () => {
    const next = {
      q: document.getElementById("q").value,
      cat: document.getElementById("cat").value,
      store: document.getElementById("store").value,
      minOff: Number(document.getElementById("minoff").value),
      sort: document.getElementById("sort").value,
    };
    const filtered = applyFilters(next);
    results.innerHTML = dealCards(filtered);
    count.textContent = `Showing ${filtered.length} of ${deals.length} deals`;
    writeHash(next);
  };
  for (const id of ["q", "cat", "store", "minoff", "sort"]) {
    const el = document.getElementById(id);
    el.addEventListener(id === "q" ? "input" : "change", rerender);
  }
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : "Not found"} | Deal Radar`;
    app.innerHTML = found ? dealPage(found, deals) : missingPage();
  } else {
    document.title = "Deal Radar — Black Friday 2026";
    renderList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
