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
  on: ["V","K","Th","S","L","M","N","R","D","Z","Ael","Cy","Ia","Ka","Or","Se","Ta","Ve","Yu","Xa","Br","Cl","Gr","Pr","Sh","F","H","J","Q","W"],
  vo: ["a","e","i","o","u","ae","ia","ei","ou","y","ai","io"],
  co: ["","n","r","l","s","th","x","m","k","ra","na","la","ris","len","dan","mir","vek","sen","tar","zon"],
  sp: ["Vael","Ordin","Kest","Ash","Mor","Thal","Ir","Sol","Nox","Quill","Hal","Bran","Cael","Dusk","Fen","Grey","Lorn","Wyr","Ves","Tor"],
  ss: ["hart","wen","drake","mere","vane","lowe","sten","ryn","thorn","field","well","crest","brook","shade","mark","wick"],
  traits: ["Patient","Restless","Wry","Meticulous","Fearless","Guarded","Tender","Relentless","Dreamy","Blunt","Curious","Stoic","Playful","Watchful","Gracious","Stubborn","Luminous","Dry-humoured","Methodical","Reckless","Loyal","Elusive","Warm","Exacting"],
  roles: ["Lanternkeeper","Ring cartographer","Signal archivist","Tide mechanic","Void courier","Glasswright","Orbit surveyor","Memory broker","Dockside medic","Star-chart forger","Silence translator","Beam tender","Salvage diver","Ledger monk","Weather clerk","Orchard engineer","Echo tuner","Gate inspector","Night baker","Cargo poet","Clockmaker","Customs diplomat","Relay pilot","Ink restorer"],
  o1: ["Ring","Ash","Umbra","Halo","Cinder","Vesper","Rift","Pale","Ember","Obsidian","Silt","Crescent"],
  o2: ["Terrace","Harbor","Spire","Reach","Quarter","Drift","Station","Hollow","Landing","Arc","Market","Stair"],
  ring: ["First","Second","Third","Fifth","Seventh","Ninth","Eleventh","Outer","Lower","Hidden"],
  hobby: ["slow chess","pressing red glass","mapping rings","night markets","repairing radios","tidal music","growing moss","cold swimming","letter writing","stargazing without lenses","archive wandering","cooking for crowds","bell ringing","kite building","collecting silence","sketching faces","walking the dark side","mending coats","riddle trading","bookbinding","clock repair","pickling","old maps","choir singing"],
  joy: ["when the beam is brightest and the docks are quiet","in the hour after the last ship leaves","with a map unfolded and nowhere to be","trading small secrets for small favours","when someone else needs help with something difficult"],
  end: ["Few know the full story, and fewer ask.","Keeps a notebook of every face met, still unfinished.","Has never been seen leaving at the same hour twice.","Is owed a favour by at least three strangers.","Intends, someday, to follow the red light to its source.","Remembers every promise, especially the ones others forgot."]
};
const SKIN = ["#f0cfb4","#e3b48d","#c98d63","#a06643","#74462c","#4e2e1e","#f6dcc6","#b87c56","#8a5538","#dcb08a"];
const HAIRC = ["#0d0d0d","#2a1a12","#4a3020","#7a5a3a","#b8b8bd","#d9d9dc","#5a0a10","#1e1e24","#8c6c4c"];
const CLOTH = ["#1d1d22","#2a2a30","#3a0a10","#55555c","#8b000b","#c7c9ce","#16161a","#40232a","#2f3138","#6d6d74"];
const cap = s => s[0].toUpperCase() + s.slice(1);

function gen(id) {
  const r = rngFor(id);
  const syl = () => r.p(V.on) + r.p(V.vo) + (r.f() < .6 ? r.p(V.co) : "");
  let first = syl() + (r.f() < .55 ? r.p(V.vo) + r.p(V.co) : "");
  first = cap(first.toLowerCase()).replace(/(.)\1\1+/g, "$1$1");
  const last = r.p(V.sp) + r.p(V.ss);
  const [t1, t2] = r.many(V.traits, 2);
  const role = r.p(V.roles);
  const origin = `${r.p(V.o1)} ${r.p(V.o2)}, ${r.p(V.ring)} Ring`;
  const hobbies = r.many(V.hobby, 3);
  const age = 19 + r.i(62);
  const bio = `${first} was born in ${origin}. ${t1} by nature and ${t2.toLowerCase()} when pressed, they now work as a ${role.toLowerCase()}. They are happiest ${r.p(V.joy)}, and spend free hours on ${hobbies[0]} and ${hobbies[1]}. ${r.p(V.end)}`;
  return {
    id, name: `${first} ${last}`, first, role, origin, age, t: [t1, t2], hobbies, bio,
    desc: `${t1}, ${t2.toLowerCase()}. ${role}.`,
    av: { skin: r.p(SKIN), hair: r.p(HAIRC), cloth: r.p(CLOTH), style: r.i(7), cs: r.i(4), eye: r.p(["#222","#3b2a1a","#2b4a5a","#4a5a3a","#6a6a70"]),
      w: 34 + r.i(9), h: 42 + r.i(7), side: r.f() < .5 ? -1 : 1, glow: r.i(3), mouth: r.i(3), brow: r.i(3), acc: r.i(5), bgx: 30 + r.i(40) }
  };
}

/* ---------- Procedural portrait (SVG, no network) ---------- */
function avatar(p) {
  const a = p.av, s = a.skin, hx = 100, hy = 86, rx = a.w, ry = a.h, side = a.side;
  const back = [
    "", `<path d="M${hx-rx-8} 100C${hx-rx-14} 30 ${hx+rx+14} 30 ${hx+rx+8} 100L${hx+rx+14} 175L${hx-rx-14} 175Z" fill="${a.hair}"/>`, "", "", "",
    `<path d="M${hx-rx-6} 92C${hx-rx-12} 40 ${hx+rx+12} 40 ${hx+rx+6} 92L${hx+rx+8} 128L${hx-rx-8} 128Z" fill="${a.hair}"/>`, ""
  ][a.style];
  const front = [
    `<path d="M${hx-rx-3} 84C${hx-rx} 36 ${hx+rx} 36 ${hx+rx+3} 84C${hx+rx-6} 62 ${hx-rx+6} 62 ${hx-rx-3} 84Z" fill="${a.hair}"/>`,
    `<path d="M${hx-rx-2} 90C${hx-rx} 38 ${hx+rx} 38 ${hx+rx+2} 90C${hx+10} 56 ${hx-rx+8} 60 ${hx-rx-2} 90Z" fill="${a.hair}"/>`,
    `<circle cx="${hx}" cy="${hy-ry-8}" r="15" fill="${a.hair}"/><path d="M${hx-rx-2} 80C${hx-rx} 38 ${hx+rx} 38 ${hx+rx+2} 80C${hx+rx-8} 64 ${hx-rx+8} 64 ${hx-rx-2} 80Z" fill="${a.hair}"/>`,
    "",
    `<path d="M${hx-rx-1} 80C${hx-rx} 42 ${hx+rx} 42 ${hx+rx+1} 80C${hx+rx-4} 68 ${hx-rx+4} 68 ${hx-rx-1} 80Z" fill="${a.hair}" opacity=".85"/>`,
    `<path d="M${hx-rx-4} 84C${hx-rx-4} 36 ${hx+rx+4} 36 ${hx+rx+4} 84C${hx+rx-4} 60 ${hx-6} 56 ${hx-rx-4} 84Z" fill="${a.hair}"/>`,
    `<path d="M${hx-10} ${hy-ry-12}h20l4 30h-28Z" fill="${a.hair}"/>`
  ][a.style];
  const collar = [
    `<path d="M${hx-16} 150L${hx} 170L${hx+16} 150Z" fill="${s}"/>`,
    `<rect x="${hx-18}" y="140" width="36" height="14" rx="6" fill="${a.cloth}" stroke="#ffffff22"/>`,
    `<path d="M${hx-14} 146L${hx} 158L${hx+14} 146" stroke="#C7C9CE" stroke-width="1.5" fill="none"/>`,
    `<path d="M${hx} 150V200" stroke="#FF202A" stroke-width="1.5"/>`
  ][a.cs];
  const eyeY = hy - 4, ex = Math.round(rx * .42);
  const accs = ["", `<circle cx="${hx-ex}" cy="${eyeY}" r="9" fill="none" stroke="#C7C9CE" stroke-width="1.4"/><circle cx="${hx+ex}" cy="${eyeY}" r="9" fill="none" stroke="#C7C9CE" stroke-width="1.4"/><path d="M${hx-ex+9} ${eyeY}h${2*ex-18}" stroke="#C7C9CE" stroke-width="1.4"/>`,
    `<circle cx="${hx-rx}" cy="${hy+10}" r="2.6" fill="#C7C9CE"/>`, `<path d="M${hx-rx+8} ${hy+16}q4 10 10 10" stroke="#00000055" stroke-width="1.5" fill="none"/>`, `<path d="M${hx-ex-6} ${eyeY-3}l12 10M${hx-ex-2} ${eyeY-3}l12 10" stroke="#00000000"/>`][a.acc];
  const brow = [`M${hx-ex-8} ${eyeY-9}q8-5 16 0M${hx+ex-8} ${eyeY-9}q8-5 16 0`, `M${hx-ex-8} ${eyeY-9}h16M${hx+ex-8} ${eyeY-9}h16`, `M${hx-ex-8} ${eyeY-7}q8-6 16-2M${hx+ex-8} ${eyeY-9}q8-4 16 2`][a.brow];
  const mouth = [`M${hx-9} ${hy+26}q9 6 18 0`, `M${hx-8} ${hy+27}h16`, `M${hx-9} ${hy+25}q9 -2 18 2`][a.mouth];
  const rim = `<path d="M${hx+side*(rx-1)} ${hy-ry*.55}A${rx} ${ry} 0 0 ${side>0?1:0} ${hx+side*(rx-1)} ${hy+ry*.5}" fill="none" stroke="#FF202A" stroke-width="${1.2+a.glow*.5}" opacity="${.45+a.glow*.15}"/>`;
  const shade = `<ellipse cx="${hx-side*rx*.45}" cy="${hy+6}" rx="${rx*.6}" ry="${ry*.9}" fill="#000" opacity=".28"/>`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Generated portrait of ${p.name}" preserveAspectRatio="xMidYMid slice">
<rect width="200" height="200" fill="#060606"/><circle cx="${a.bgx*2+20}" cy="60" r="70" fill="#8B000B" opacity=".13"/><ellipse cx="100" cy="196" rx="120" ry="26" fill="none" stroke="#C7C9CE" stroke-opacity=".18"/>
${back}<path d="M42 200C44 160 70 144 ${hx} 144C${hx+32} 144 156 160 158 200Z" fill="${a.cloth}"/>${collar}
<rect x="${hx-13}" y="${hy+ry-12}" width="26" height="${64-ry+12}" fill="${s}"/><rect x="${hx-13}" y="${hy+ry-12}" width="26" height="14" fill="#000" opacity=".25"/>
<ellipse cx="${hx}" cy="${hy}" rx="${rx}" ry="${ry}" fill="${s}"/>${shade}${rim}
<ellipse cx="${hx-ex}" cy="${eyeY}" rx="3.6" ry="2.6" fill="${a.eye}"/><ellipse cx="${hx+ex}" cy="${eyeY}" rx="3.6" ry="2.6" fill="${a.eye}"/>
<path d="${brow}" stroke="${a.hair}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M${hx} ${eyeY+4}q-4 12 2 14" stroke="#00000044" stroke-width="1.6" fill="none"/>
<path d="${mouth}" stroke="#2a0f10" stroke-width="2" fill="none" stroke-linecap="round"/>${front}${accs}</svg>`;
}
const safeAvatar = p => { try { return avatar(p); } catch { return `<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#060606"/><circle cx="100" cy="80" r="34" fill="none" stroke="#C7C9CE"/><path d="M100 0v40" stroke="#FF202A"/></svg>`; } };

/* ---------- Feed with batching + windowing ---------- */
const feed = $("feed"), sentinel = $("sentinel");
const batches = [];
let estH = 0, created = 0, topIdx = 0, failing = false;
const idOf = (b, j) => BigInt(b * BATCH + j) + 1n;
const card = p => `<button class="card" type="button" data-id="${p.id}" aria-label="Open ${p.name}, identity ${p.id}"><div class="av">${safeAvatar(p)}</div><div class="meta"><b>${p.name}</b><span class="id">№ ${p.id}</span><p>${p.desc}</p></div><span class="open">Open identity record</span></button>`;

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
    $("count").textContent = `${(created * BATCH).toLocaleString()} identities discovered so far`;
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
  dlg.innerHTML = `<form method="dialog" class="x"><button aria-label="Close identity record">✕</button></form>
<div class="rec"><div class="pav">${safeAvatar(p)}</div><div class="pbody">
<h2 id="pName">${p.name}</h2><p class="pid" id="pId">Identity № ${p.id}</p>
<dl><dt>Role</dt><dd>${p.role}</dd><dt>Origin</dt><dd>${p.origin}</dd><dt>Apparent age</dt><dd>${p.age}</dd><dt>Character</dt><dd>${p.t.join(", ")}</dd></dl>
<div class="tags" aria-label="Interests">${p.hobbies.map(h => `<span>${h}</span>`).join("")}</div>
<p class="bio">${p.bio}</p><p class="bio" style="margin-top:10px;font-size:.74rem;color:var(--mute);border:0;padding:0">Fictional, procedurally generated record. The portrait is an illustration, not a photograph.</p></div></div>
<div class="acts"><button type="button" id="aPrev" ${prev ? "" : "disabled"} aria-label="Previous identity">← Previous</button><button type="button" id="aNext" aria-label="Next identity">Next →</button>
<span class="sp"></span><button type="button" id="aCid">Copy identifier</button><button type="button" id="aCl">Copy link</button>${navigator.share ? '<button type="button" id="aSh">Share</button>' : ""}<button type="button" id="aBack">Back to feed</button></div>`;
  $("aPrev").onclick = () => go(cur - 1n); $("aNext").onclick = () => go(cur + 1n);
  $("aCid").onclick = () => copy(String(cur), "Identifier copied"); $("aCl").onclick = () => copy(link(cur), "Link copied");
  if ($("aSh")) $("aSh").onclick = () => navigator.share({ title: p.name, text: `${p.name} — identity ${p.id}`, url: link(cur) }).catch(() => {});
  $("aBack").onclick = () => dlg.close();
  dlg.scrollTop = 0;
}
const link = id => location.origin + location.pathname + "?profile=" + id;
function go(id) { if (id < 1n) return; cur = id; try { render(id); } catch { toast("Could not render that identity"); } history.replaceState(null, "", "?profile=" + id); const f = $("aNext"); if (f && document.activeElement === document.body) f.focus(); }
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
  ul.innerHTML = out.length ? "" : `<li class="note">No discovered identity matches. Scroll further, or use an exact identifier.</li>`;
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
