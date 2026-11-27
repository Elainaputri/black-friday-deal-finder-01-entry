// HTML for Deal Radar's pages, built from the deal data. Every value is
// escaped before it goes into the page. Views never fetch anything: they
// only render the deals data.js already holds.

import { checkDay, percentOff, saved, usd, verdictHint, verdictLabel } from "./format.js";

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function card(d) {
  return `<article class="card">
  <div class="card-top"><span class="verdict verdict-${escape(d.verdict)}">${verdictLabel(d.verdict)}</span><span class="pct">${percentOff(d)}% off</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
  <p class="price"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="save">save ${usd(saved(d))}</span></p>
  <p class="checked">Checked ${checkDay(d.checked)}</p>
  <p class="actions"><a class="buy" href="${escape(d.url)}" rel="noopener" target="_blank">Buy at ${escape(d.store)} &rarr;</a> <a class="detail" href="#/deal/${encodeURIComponent(d.id)}">Details</a></p>
</article>`;
}

export function dealCards(shown) {
  if (shown.length === 0) {
    return '<p class="empty">No deal matches those filters. Clear the search or lower the minimum discount.</p>';
  }
  return `<div class="grid">${shown.map(card).join("")}</div>`;
}

export function listPage(deals, state, counts) {
  return `<section class="hero">
  <h1>Black Friday Deal Radar</h1>
  <p class="tagline">${deals.length} real Black Friday &amp; Cyber Monday deals, each price checked on 27 Nov 2026 and traced to the store or report that showed it. No inflated list prices dressed up as bargains — every deal carries an honest verdict.</p>
  <p class="stats"><strong>${deals.length} deals</strong> &middot; <strong>${counts.newLow} new lows</strong> &middot; best saving <strong>${usd(counts.bestSave)}</strong> &middot; deepest cut <strong>${counts.bestPct}% off</strong></p>
</section>
<section class="controls" aria-label="Search and filters">
  <label class="search">Search <input id="q" type="search" placeholder="Try &ldquo;AirPods&rdquo;, &ldquo;TV&rdquo;, &ldquo;Dyson&rdquo;&hellip;" value="${escape(state.q)}"></label>
  <label>Category <select id="cat"><option value="">All categories</option>${counts.categories.map((c) => `<option${state.cat === c ? " selected" : ""}>${escape(c)}</option>`).join("")}</select></label>
  <label>Store <select id="store"><option value="">All stores</option>${counts.stores.map((s) => `<option${state.store === s ? " selected" : ""}>${escape(s)}</option>`).join("")}</select></label>
  <label>Min. discount <select id="minoff"><option value="0">Any discount</option>${[20, 30, 40, 50, 60].map((n) => `<option value="${n}"${state.minOff === n ? " selected" : ""}>${n}% off or more</option>`).join("")}</select></label>
  <label>Sort <select id="sort"><option value="pct"${state.sort === "pct" ? " selected" : ""}>Biggest % off</option><option value="save"${state.sort === "save" ? " selected" : ""}>Biggest $ saving</option><option value="price"${state.sort === "price" ? " selected" : ""}>Lowest price</option><option value="verdict"${state.sort === "verdict" ? " selected" : ""}>New lows first</option></select></label>
</section>
<p class="result-count" id="count"></p>
<div id="results">${dealCards(state.shown)}</div>
<section class="how">
  <h2>How to read a verdict</h2>
  <ul>
    <li><span class="verdict verdict-new-low">NEW LOW</span> — lowest price any source has reported for this product.</li>
    <li><span class="verdict verdict-strong">STRONG DEAL</span> — a deep cut on a real usual price, worth buying now.</li>
    <li><span class="verdict verdict-routine">ROUTINE SALE</span> — a real saving, but this price recurs every sale season.</li>
  </ul>
  <p>Prices move all day on Black Friday. Check the price at checkout before you order, and use the store link on each card — it opens that store's search for the exact product.</p>
</section>`;
}

export function dealPage(d, siblings) {
  const same = siblings.filter((x) => x.title === d.title && x.id !== d.id);
  const compare = same.length
    ? `<section class="compare"><h2>Same product, another store</h2><ul>${same.map((x) => `<li><a href="#/deal/${encodeURIComponent(x.id)}">${escape(x.store)} — ${usd(x.price)}</a> (${percentOff(x)}% off)</li>`).join("")}</ul><p>Buy the cheaper one while it is in stock.</p></section>`
    : "";
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top"><span class="verdict verdict-${escape(d.verdict)}">${verdictLabel(d.verdict)}</span><span class="pct">${percentOff(d)}% off</span></div>
  <h1>${escape(d.title)}</h1>
  <p class="meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
  <p class="price big"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="save">you save ${usd(saved(d))}</span></p>
  <p class="verdict-note">${escape(verdictHint(d.verdict))} ${escape(d.note)}</p>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Price checked</dt><dd>${checkDay(d.checked)}</dd>
    <dt>Where the price was read</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="buy big-buy" href="${escape(d.url)}" rel="noopener" target="_blank">Buy it at ${escape(d.store)} &rarr;</a></p>
</article>
${compare}`;
}

export function missingPage() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
