"use strict";
(() => {
const $ = id => document.getElementById(id);
const BATCH = 24, M64 = (1n << 64n) - 1n;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

/* ---------- Deterministic generator (BigInt-safe) ---------- */
const mix = z => {
  z = (z + 0x9E3779B97F4A7C15n) & M64;
  z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & M64;
  z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & M64;
  return z ^ (z >> 31n);
};
function rngFor(id) {
  let h = 0x51A7n, n = id;
  do { h = mix(h ^ (n & M64)); n >>= 64n; } while (n > 0n);
  let s = mix(h);
  const next = () => { s = mix(s); return Number(s >> 11n) / 9007199254740992; };
  const r = {
    f: next,
    i: n => Math.floor(next() * n),
    p: a => a[Math.floor(next() * a.length)],
    many(a, n) { const c = a.slice(), o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(next() * c.length), 1)[0]); return o; }
  };
  return r;
}
const V = {
  on: ["V","K","Th","S","L","M","N","R","D","Z","Ael","Cy","Ia","Ka","Or","Se","Ta","Ve","Yu","Xa","Br","Cl","Gr","Pr","Sh","F","H","J","Q","Tz","Ny","Od"],
  vo: ["a","e","i","o","u","ae","ia","ei","ou","y","ai","io"],
  co: ["","n","r","l","s","th","x","m","k","dr","vor","zen","mar","tal"],
  en: ["ar","oth","ion","ax","ris","eon","ul","ara","is","yx","um","or","eth","ath"],
  suf: ["Prime","Minor","Reach","Veil","Hollow","Deep","Crown","Verge"],
  rom: ["II","III","IV","V","VI","VII","VIII","IX","X","XII"],
  types: ["Ringed giant","Ash world","Ice dwarf","Ember world","Glass desert","Storm giant","Basalt world","Tar ocean world","Frozen titan","Dark gas giant","Crater world","Obsidian world","Salt moon","Twilight world"],
  atm: ["a thin silver haze","drifting crimson dust","almost no air","methane mist","ion storms","cold fog","slow white clouds","a veil of ash"],
  feat: ["glass storms","singing ice","black dunes","rivers of tar","floating ridges","silent canyons","ring shadows","lightning plains","mirror lakes","red auroras","buried cities of salt","endless twilight","humming caves","crystal forests","frozen waterfalls","magnetic spires"],
  tr: ["Silent","Cold","Restless","Ancient","Brooding","Luminous","Remote","Stormy","Patient","Austere","Hollow","Radiant","Watchful","Slow"],
  o1: ["Ring","Ash","Umbra","Halo","Cinder","Vesper","Rift","Pale","Ember","Obsidian","Silt","Crescent"],
  o2: ["Terrace","Harbor","Spire","Reach","Quarter","Drift","Station","Hollow","Landing","Arc","Market","Stair"],
  ring: ["First","Second","Third","Fifth","Seventh","Ninth","Eleventh","Outer","Lower","Hidden"],
  end: ["Few ships have ever landed, and fewer have left.","Its orbit is slowly drifting toward the red beam.","Travellers report that it looks different at every visit.","No chart agrees on where it ends.","It was named by the first crew to survive its night.","The beam is visible from its darkest side."]
};
const BASE = ["#0c0c0e","#16161a","#232328","#34343a","#4a4a52","#6d6d74","#8d8f95","#2b0a0f","#4a0a12","#8B000B","#c7c9ce"];
const cap = s => s[0].toUpperCase() + s.slice(1);

function gen(id) {
  const r = rngFor(id);
  let base = r.p(V.on) + r.p(V.vo) + (r.f() < .5 ? r.p(V.co) : "") + r.p(V.en);
  base = cap(base.toLowerCase()).replace(/(.)\1\1+/g, "$1$1");
  const q = r.f(), name = q < .45 ? `${base} ${r.p(V.rom)}` : q < .65 ? `${base} ${r.p(V.suf)}` : base;
  const [t1, t2] = r.many(V.tr, 2), type = r.p(V.types), atm = r.p(V.atm);
  const origin = `${r.p(V.o1)} ${r.p(V.o2)}, ${r.p(V.ring)} Ring`;
  const feats = r.many(V.feat, 3), moons = r.i(10);
  const R = 40 + r.i(20), bands = [];
  for (let i = 0, n = r.i(7); i < n; i++) bands.push({ y: -R + r.i(2 * R), h: 3 + r.i(10), o: .15 + r.f() * .4 });
  const stars = []; for (let i = 0; i < 16; i++) stars.push([r.i(200), r.i(200), .4 + r.f() * .9, .25 + r.f() * .6]);
  const bio = `${name} is a ${type.toLowerCase()} circling in ${origin}. It is ${t1.toLowerCase()} and ${t2.toLowerCase()}, wrapped in ${atm}. ${moons ? `It keeps ${moons} moon${moons > 1 ? "s" : ""}` : "It keeps no moons"}, and its surface is known for ${feats[0]} and ${feats[1]}. ${r.p(V.end)}`;
  return {
    id, name, type, atm, origin, t: [t1, t2], feats, moons, bio,
    diam: (3000 + r.i(140000)).toLocaleString("en-US") + " km", orbit: (20 + r.i(9000)).toLocaleString("en-US") + " days",
    grav: (.1 + r.f() * 3.4).toFixed(2) + " g", temp: (-230 + r.i(560)) + " °C",
    desc: `${t1}, ${t2.toLowerCase()} ${type.toLowerCase()}.`,
    av: { R, bands, stars, base: r.p(BASE), band: r.p(BASE), side: r.f() < .5 ? -1 : 1, glow: r.i(3), ring: r.f() < .4, rc: 2 + r.i(3), tilt: -28 + r.i(56),
      craters: r.f() < .5 ? [0,1,2,3,4].map(() => [r.i(2 * R) - R, r.i(2 * R) - R, 2 + r.i(7)]) : [], moonA: [0,1,2].slice(0, Math.min(moons, 3)).map(() => r.f() * 6.28), beam: r.f() < .6 }
  };
}

/* ---------- Procedural planet (SVG, no network) ---------- */
function avatar(p) {
  const a = p.av, R = a.R, cx = 100, cy = 104, s = a.side, u = "c" + p.id;
  let o = `<svg viewBox="0 0 200 200" role="img" aria-label="Generated illustration of the planet ${p.name}" preserveAspectRatio="xMidYMid slice"><rect width="200" height="200" fill="#030303"/>`;
  for (const [x, y, r, op] of a.stars) o += `<circle cx="${x}" cy="${y}" r="${r}" fill="#C7C9CE" opacity="${op}"/>`;
  o += `<circle cx="${cx + s * R * .4}" cy="${cy}" r="${R * 1.6}" fill="#8B000B" opacity="${.07 + a.glow * .05}"/>`;
  if (a.beam) o += `<path d="M${cx} 0V${cy - R}" stroke="#FF202A" stroke-width="1" opacity=".65"/>`;
  const rings = [], arcs = [];
  if (a.ring) for (let k = 0; k < a.rc; k++) {
    const rx = R * (1.4 + k * .24), ry = rx * .2, c = k % 2 ? "#C7C9CE" : "#85858B", w = (1.6 - k * .3).toFixed(2);
    rings.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-opacity=".6" stroke-width="${w}"/>`);
    arcs.push(`<path d="M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}" fill="none" stroke="${c}" stroke-width="${w}"/>`);
  }
  if (a.ring) o += `<g transform="rotate(${a.tilt} ${cx} ${cy})">${rings.join("")}</g>`;
  o += `<defs><clipPath id="${u}"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath></defs><circle cx="${cx}" cy="${cy}" r="${R}" fill="${a.base}"/><g clip-path="url(#${u})">`;
  for (const b of a.bands) o += `<rect x="${cx - R}" y="${cy + b.y}" width="${2 * R}" height="${b.h}" fill="${a.band}" opacity="${b.o}"/>`;
  for (const [x, y, r] of a.craters) o += `<ellipse cx="${cx + x}" cy="${cy + y}" rx="${r}" ry="${r * .8}" fill="#000" opacity=".3"/>`;
  o += `<circle cx="${cx - s * R * .45}" cy="${cy}" r="${R * 1.05}" fill="#000" opacity=".78"/></g>`;
  o += `<path d="M${cx} ${cy - R}A${R} ${R} 0 0 ${s > 0 ? 1 : 0} ${cx} ${cy + R}" fill="none" stroke="#C7C9CE" stroke-width="1.6" opacity=".9"/>`;
  o += `<path d="M${cx} ${cy - R - 3}A${R + 3} ${R + 3} 0 0 ${s > 0 ? 1 : 0} ${cx} ${cy + R + 3}" fill="none" stroke="#FF202A" stroke-width="2" opacity="${.25 + a.glow * .15}"/>`;
  if (a.ring) o += `<g transform="rotate(${a.tilt} ${cx} ${cy})">${arcs.join("")}</g>`;
  for (const t of a.moonA) o += `<circle cx="${cx + Math.cos(t) * R * 2.05}" cy="${cy + Math.sin(t) * R * .8}" r="3.4" fill="#C7C9CE" opacity=".85"/>`;
  return o + `</svg>`;
}
const safeAvatar = p => { try { return avatar(p); } catch { return `<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#030303"/><circle cx="100" cy="100" r="46" fill="#050505" stroke="#C7C9CE"/><path d="M100 0v54" stroke="#FF202A"/></svg>`; } };

/* ---------- Feed with batching + windowing ---------- */
const feed = $("feed"), sentinel = $("sentinel");
const batches = [];
let estH = 0, created = 0, topIdx = 0, failing = false;
const idOf = (b, j) => BigInt(b * BATCH + j) + 1n;
const card = p => `<button class="card" type="button" data-id="${p.id}" aria-label="Open ${p.name}, planet ${p.id}"><div class="av">${safeAvatar(p)}</div><div class="meta"><b>${p.name}</b><span class="id">№ ${p.id}</span><p>${p.desc}</p></div><span class="open">Open planet record</span></button>`;

function mount(el) {
  if (el.dataset.m === "1") return;
  const b = +el.dataset.b;
  try {
    let h = "";
    for (let j = 0; j < BATCH; j++) h += card(gen(idOf(b, j)));
    el.className = "batch"; el.style.height = ""; el.innerHTML = h; el.dataset.m = "1";
    if (!estH) estH = el.offsetHeight;
  } catch (e) {
    el.className = "batch off"; el.dataset.m = "0";
    el.innerHTML = `<div class="errb">This batch could not be generated.<button class="retry" type="button">Retry</button></div>`;
    el.querySelector("button").onclick = () => { el.dataset.m = "0"; mount(el); };
  }
}
function unmount(el) {
  if (el.dataset.m !== "1") return;
  el.style.height = el.offsetHeight + "px"; el.className = "batch off"; el.innerHTML = ""; el.dataset.m = "0";
}
const io = new IntersectionObserver(es => {
  for (const e of es) {
    const el = e.target, b = +el.dataset.b;
    if (e.isIntersecting) { mount(el); if (b === created - 1) addBatch(); topIdx = Math.max(0, b); }
    else unmount(el);
  }
  scheduleSave();
}, { rootMargin: "1600px 0px 1600px 0px" });

function addBatch() {
  try {
    const el = document.createElement("div");
    el.dataset.b = created; el.dataset.m = "0"; el.className = "batch off";
    el.style.height = (estH || 600) + "px";
    feed.appendChild(el); batches.push(el); io.observe(el); created++;
    $("count").textContent = `${(created * BATCH).toLocaleString()} planets discovered so far`;
    failing = false;
  } catch { failing = true; showRetry(); }
}
function showRetry() {
  $("loadTxt").innerHTML = `Generation paused. <button class="retry" type="button" id="rt">Retry</button>`;
  $("rt").onclick = () => { $("loadTxt").textContent = "Reaching further into the void…"; addBatch(); };
}
// safety net: if the last batch is near the viewport but nothing is pending, keep going
new IntersectionObserver(es => { if (es[0].isIntersecting && !failing) { const last = batches[created - 1]; if (last && last.dataset.m === "1") addBatch(); } }, { rootMargin: "1200px" }).observe(sentinel);
addEmpty();
function addEmpty() { addBatch(); mount(batches[0]); }

let rs; addEventListener("resize", () => { clearTimeout(rs); rs = setTimeout(() => { const m = feed.querySelector('[data-m="1"]'); if (m) { estH = m.offsetHeight; batches.forEach(b => { if (b.dataset.m === "0") b.style.height = estH + "px"; }); } }, 250); });

/* ---------- Profile overlay ---------- */
const dlg = $("profile");
let cur = null, lastFocus = null;
const parseId = s => { s = String(s || "").trim().replace(/[,_\s]/g, ""); if (!/^\d{1,400}$/.test(s)) return null; const n = BigInt(s); return n >= 1n ? n : null; };
function render(id) {
  const p = gen(id), prev = id > 1n;
  dlg.innerHTML = `<form method="dialog" class="x"><button aria-label="Close planet record">✕</button></form>
<div class="rec"><div class="pav">${safeAvatar(p)}</div><div class="pbody">
<h2 id="pName">${p.name}</h2><p class="pid" id="pId">Planet № ${p.id}</p>
<dl><dt>Class</dt><dd>${p.type}</dd><dt>Atmosphere</dt><dd>${p.atm}</dd><dt>Diameter</dt><dd>${p.diam}</dd><dt>Orbit</dt><dd>${p.orbit}</dd><dt>Moons</dt><dd>${p.moons}</dd><dt>Gravity</dt><dd>${p.grav}</dd><dt>Surface</dt><dd>${p.temp}</dd><dt>Region</dt><dd>${p.origin}</dd><dt>Character</dt><dd>${p.t.join(", ")}</dd></dl>
<div class="tags" aria-label="Known for">${p.feats.map(h => `<span>${h}</span>`).join("")}</div>
<p class="bio">${p.bio}</p><p class="bio" style="margin-top:10px;font-size:.74rem;color:var(--mute);border:0;padding:0">Fictional, procedurally generated planet. The picture is an illustration, not a photograph or a real astronomical object.</p></div></div>
<div class="acts"><button type="button" id="aPrev" ${prev ? "" : "disabled"} aria-label="Previous planet">← Previous</button><button type="button" id="aNext" aria-label="Next planet">Next →</button>
<span class="sp"></span><button type="button" id="aCid">Copy identifier</button><button type="button" id="aCl">Copy link</button>${navigator.share ? '<button type="button" id="aSh">Share</button>' : ""}<button type="button" id="aBack">Back to feed</button></div>`;
  $("aPrev").onclick = () => go(cur - 1n); $("aNext").onclick = () => go(cur + 1n);
  $("aCid").onclick = () => copy(String(cur), "Identifier copied"); $("aCl").onclick = () => copy(link(cur), "Link copied");
  if ($("aSh")) $("aSh").onclick = () => navigator.share({ title: p.name, text: `${p.name} — planet ${p.id}`, url: link(cur) }).catch(() => {});
  $("aBack").onclick = () => dlg.close();
  dlg.scrollTop = 0;
}
const link = id => location.origin + location.pathname + "?profile=" + id;
function go(id) { if (id < 1n) return; cur = id; try { render(id); } catch { toast("Could not render that planet"); } history.replaceState(null, "", "?profile=" + id); const f = $("aNext"); if (f && document.activeElement === document.body) f.focus(); }
function openProfile(id) {
  lastFocus = document.activeElement;
  if (!dlg.open) dlg.showModal();
  go(id);
}
dlg.addEventListener("close", () => { cur = null; history.replaceState(null, "", location.pathname); store.set("cs-last", String(topIdx * BATCH + 1)); if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); });
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener("keydown", e => { if (!cur) return; if (e.key === "ArrowRight") go(cur + 1n); else if (e.key === "ArrowLeft") go(cur - 1n); });
feed.addEventListener("click", e => { const c = e.target.closest(".card"); if (c) openProfile(BigInt(c.dataset.id)); });

/* ---------- Controls ---------- */
let tt; function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("on"), 1800); }
function copy(t, ok) {
  const done = () => toast(ok);
  if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
  function fallback() { const x = document.createElement("textarea"); x.value = t; x.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(x); x.select(); try { document.execCommand("copy"); done(); } catch { toast("Copy failed — select the identifier manually"); } x.remove(); }
}
function enter() { document.body.classList.add("entered"); store.set("cs-entered", "1"); $("discover").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" }); }
$("enter").onclick = enter;
$("nDiscover").onclick = () => { if (!document.body.classList.contains("entered")) enter(); else scrollTo({ top: 0, behavior: "smooth" }); };
$("nRandom").onclick = () => {
  const bits = 8 + Math.floor(Math.random() * 190), n = Math.ceil(bits / 8), a = new Uint8Array(n);
  crypto.getRandomValues(a); let v = 0n; for (const x of a) v = (v << 8n) | BigInt(x);
  openProfile((v >> BigInt(n * 8 - bits)) + 1n);
};
$("nFind").onclick = () => { $("fRes").innerHTML = ""; $("find").showModal(); $("fId").focus(); };
$("nAbout").onclick = () => $("about").showModal();
$("replay").onclick = () => { store.set("cs-entered", ""); document.body.classList.remove("entered"); $("about").close(); scrollTo(0, 0); };
for (const d of ["find", "about"]) $(d).addEventListener("click", e => { if (e.target === $(d)) $(d).close(); });
$("findForm").onsubmit = e => { e.preventDefault(); const id = parseId($("fId").value); if (!id) { toast("Enter a whole number, 1 or higher"); return; } $("find").close(); openProfile(id); };
$("nameForm").onsubmit = e => {
  e.preventDefault(); const q = $("fName").value.trim().toLowerCase(), ul = $("fRes"); ul.innerHTML = "";
  if (q.length < 2) { toast("Type at least 2 letters"); return; }
  const max = Math.min(created * BATCH, 5000), out = [];
  for (let i = 1; i <= max && out.length < 12; i++) { const p = gen(BigInt(i)); if (p.name.toLowerCase().includes(q)) out.push(p); }
  ul.innerHTML = out.length ? "" : `<li class="note">No discovered planet matches. Scroll further, or use an exact identifier.</li>`;
  for (const p of out) { const li = document.createElement("li"); li.innerHTML = `<button type="button">${p.name}<span>№ ${p.id}</span></button>`; li.firstChild.onclick = () => { $("find").close(); openProfile(p.id); }; ul.appendChild(li); }
};

/* ---------- Continue exploring + persistence ---------- */
let st; function scheduleSave() { clearTimeout(st); st = setTimeout(() => { if (topIdx > 0) store.set("cs-last", String(topIdx * BATCH + 1)); }, 1500); }
addEventListener("pagehide", () => { if (topIdx > 0) store.set("cs-last", String(topIdx * BATCH + 1)); });
const saved = parseInt(store.get("cs-last") || "0", 10);
if (saved > BATCH) $("nContinue").hidden = false;
$("nContinue").onclick = () => {
  const target = Math.floor((saved - 1) / BATCH);
  if (!document.body.classList.contains("entered")) { document.body.classList.add("entered"); store.set("cs-entered", "1"); }
  while (created <= target + 1) addBatch();
  const el = batches[target]; mount(el); el.scrollIntoView({ block: "start" });
  $("nContinue").hidden = true;
};

/* ---------- Boot ---------- */
if (store.get("cs-entered") === "1") document.body.classList.add("entered");
const q = new URLSearchParams(location.search).get("profile");
if (q) { const id = parseId(q); if (id) { document.body.classList.add("entered"); openProfile(id); } }
})();
