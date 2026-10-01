/* Mobile picker variants for the PRAZY subscription wireframe.
   Every variant shows the same five things: set tabs (7 / 10 / 5), price "$X (Save $Y)",
   delivery every 4 / 6 / 8 weeks, thumbs of the picked designs, and (A, B) the chevron with the
   pick count (mix-and-match BundleDrawerTrigger). Only their arrangement differs.
   Starts with 3 picks so the thumbs are visible in review. */
const VARIANT = document.body.dataset.variant;
const ONE_SET = 12;
const TIERS = [{ n: 7, price: 60 }, { n: 10, price: 80 }, { n: 5, price: 40 }];
const FREQS = [4, 6, 8];
const REC_FREQ = { 5: 4, 7: 6, 10: 8 };
const DESIGNS = Array.from({ length: 12 }, (_, i) => ({ id: "d" + (i + 1), name: "Design " + (i + 1) }));
const byId = Object.fromEntries(DESIGNS.map(d => [d.id, d]));

const S = { n: 7, freq: 6, picks: ["d1", "d1", "d4"], open: false };
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const tier = () => TIERS.find(t => t.n === S.n);
const save = () => ONE_SET * S.n - tier().price;
const left = () => S.n - S.picks.length;

const CHEVRON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>`;

/* building blocks */
const tabs = () => `<div class="tabs" role="radiogroup" aria-label="Sets per delivery">${TIERS.map(t => `<button type="button" role="radio" aria-checked="${t.n === S.n}" data-n="${t.n}">${t.n} sets</button>`).join("")}</div>`;
const seg = () => `<div class="seg" role="radiogroup" aria-label="Sets per delivery">${TIERS.map(t => `<button type="button" role="radio" aria-checked="${t.n === S.n}" data-n="${t.n}">${t.n} sets</button>`).join("")}</div>`;
const price = () => `<div class="price"><b>$${tier().price}</b> <span>(Save $${save()})</span></div>`;
const freqButtons = () => `<div class="freqs" role="radiogroup" aria-label="Delivered every"><span class="lbl">Delivered every</span>${FREQS.map(f => `<button type="button" role="radio" aria-checked="${f === S.freq}" data-f="${f}">${f} weeks</button>`).join("")}</div>`;
const chevron = (disabledWhenEmpty = true) => `<button class="drawer" type="button" aria-expanded="${S.open}" aria-label="${S.open ? "Hide" : "Show"} your picks" ${disabledWhenEmpty && !S.picks.length ? "disabled" : ""}>${CHEVRON}<span class="count">${S.picks.length}</span></button>`;
const thumbs = () => `<div class="thumbs" style="--cols:${S.n <= 7 ? S.n : 5}">${Array.from({ length: S.n }, (_, i) => {
  const id = S.picks[i];
  return id
    ? `<div class="thumb full"><div class="sq">IMG<button type="button" class="rm" data-rm="${i}" aria-label="Remove ${byId[id].name}">×</button></div><span>${byId[id].name}</span></div>`
    : `<div class="thumb"><div class="sq"></div><span>Colour ${i + 1}</span></div>`;
}).join("")}</div>`;
const strip = () => `<div class="strip" style="--n:${S.n}" aria-label="${S.picks.length} of ${S.n} picked">${Array.from({ length: S.n }, (_, i) => `<i class="${S.picks[i] ? "full" : ""}"></i>`).join("")}</div>`;
/* C: the box's slots as a tray; a picked slot jumps to its design in the grid, its × takes it out */
const tray = () => `<div class="tray" style="--n:${S.n}" aria-label="${S.picks.length} of ${S.n} picked">${Array.from({ length: S.n }, (_, i) => {
  const id = S.picks[i];
  return id
    ? `<div class="ts full"><button type="button" class="go" data-go="${id}" aria-label="Show ${byId[id].name} in the grid">IMG</button><button type="button" class="rm" data-rm="${i}" aria-label="Remove ${byId[id].name}">×</button></div>`
    : `<div class="ts"></div>`;
}).join("")}</div>`;
const picked = () => `<div class="picked">${S.picks.length} of ${S.n} picked</div>`;
/* every slot of the box in a row, picked then empty, running under the Edit button (variant D) */
const editBtn = () => `<button class="edit" type="button" aria-haspopup="dialog" aria-label="Edit your box, ${S.picks.length} designs picked">Edit<span class="count">${S.picks.length}</span></button>`;
const slots = () => `<div class="slots" aria-hidden="true">${Array.from({ length: S.n }, (_, i) => `<i class="${S.picks[i] ? "full" : ""}"></i>`).join("")}</div>`;

/* the four arrangements */
const LAYOUTS = {
  /* A. Drawer: thumbs hidden until the chevron opens them */
  a: () => `${tabs()}
    <div class="row">${price()}${chevron()}</div>
    ${freqButtons()}
    ${S.open ? thumbs() : ""}`,
  /* B. Strip: a small strip of thumbs is always visible; the chevron enlarges it with names */
  b: () => `${tabs()}
    <div class="row center">${price()}</div>
    ${freqButtons()}
    <div class="row">${S.open ? picked() : strip()}${chevron()}</div>
    ${S.open ? thumbs() : ""}`,
  /* C. Compact: joined segmented control, the price centred on its own line (Leon, 2026-10-01: off to
     the left it gets missed), the delivery buttons under it, then the tray of picks */
  c: () => `${seg()}
    <div class="row center">${price()}</div>
    ${freqButtons()}
    ${S.picks.length ? tray() : ""}`,
  /* F. C with the price set on a green tint, so it is not missed */
  f: () => `${seg()}
    <div class="row center">${price()}</div>
    ${freqButtons()}
    ${S.picks.length ? tray() : ""}`,
  /* D. Summary: one line while browsing (the plan left; the box's slots running under "Edit" with
     the pick count right);
     "Edit" opens the settings (sets, weeks, picks) in a sheet */
  d: () => `<div class="row sumrow"><div class="sum"><b>${S.n} sets, every ${S.freq} weeks</b>${price()}</div>
    <div class="sum-act">${slots()}${editBtn()}</div></div>`,
  /* E. Summary with Edit inside: the box's slots first, cut where they meet the frame; then the plan,
     price and "Edit" (with the pick count) in one frame */
  e: () => `<div class="row sumrow"><div class="sum-act">${slots()}</div>
    <div class="sum sum-edit"><div><b>${S.n} sets, every ${S.freq} weeks</b>${price()}</div>${editBtn()}</div></div>`,
};

/* the settings sheet (variants D, E): a modal over the page, kept outside #picker so a change re-renders
   its contents without closing it */
const sheetBody = () => `<div class="sh-hd"><h2>Your box</h2><button class="sh-x" type="button" aria-label="Close">×</button></div>
  <div class="sh-bd">
    <div class="sh-sec"><h3>Sets per delivery</h3>${tabs()}</div>
    <div class="sh-sec">${freqButtons()}</div>
    <div class="sh-sec"><h3>Your picks · ${S.picks.length} of ${S.n}</h3>${thumbs()}</div>
    ${price()}
  </div>
  <div class="sh-ft"><button class="btn" type="button" data-done>Done</button></div>`;

function sheet() {
  let d = $("#sheet");
  if (!d) {
    d = document.createElement("dialog");
    d.id = "sheet";
    d.className = "sheet";
    d.setAttribute("aria-label", "Edit your box");
    d.addEventListener("close", () => { S.open = false; });
    // a press on the backdrop (the dialog itself, outside its content) closes it
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
    document.body.append(d);
  }
  return d;
}
function renderSheet() {
  if ((VARIANT !== "d" && VARIANT !== "e") || !S.open) return;
  const d = sheet();
  d.innerHTML = sheetBody();
  bind(d);
  d.querySelector(".sh-x").onclick = () => d.close();
  d.querySelector("[data-done]").onclick = () => d.close();
}
function openSheet() {
  S.open = true;
  renderSheet();
  sheet().showModal();
}

/* the set / weeks / remove controls, wherever they are drawn (the picker, or D's sheet) */
function bind(root) {
  root.querySelectorAll("[data-n]").forEach(b => b.onclick = () => {
    S.n = +b.dataset.n; S.freq = REC_FREQ[S.n];
    if (S.picks.length > S.n) S.picks = S.picks.slice(0, S.n);
    render();
  });
  root.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { S.freq = +b.dataset.f; render(); });
  root.querySelectorAll("[data-go]").forEach(b => b.onclick = () => goToCard(b.dataset.go));
  root.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { S.picks.splice(+b.dataset.rm, 1); if (!S.picks.length && VARIANT !== "d" && VARIANT !== "e") S.open = false; render(); });
}

/* D: the last slot in view is cut by the Edit button, between 35% and 65% shown, whatever width the
   plan text leaves the slots: the plan's frame takes up the slack, so the row reads as running on
   under the button */
function cutSlots() {
  const row = $("#picker .slots"), sum = $("#picker .sumrow .sum");
  if (!row || !sum || !row.firstElementChild) return;
  const btn = $("#picker .sum-act .edit"); // D: the cut is at the button; E: at the slots' right edge, by the frame
  sum.style.minWidth = "";
  const w = row.firstElementChild.getBoundingClientRect().width;
  const pitch = w + parseFloat(getComputedStyle(row).columnGap || "6");
  const visible = (btn ? btn.getBoundingClientRect().left : row.getBoundingClientRect().right) - row.firstElementChild.getBoundingClientRect().left;
  const k = Math.max(0, Math.floor((visible - 0.35 * w) / pitch)); // whole slots before the cut one
  const slack = visible - k * pitch - 0.65 * w; // width past a 65% cut: the frame takes it
  if (slack > 0) sum.style.minWidth = `${sum.getBoundingClientRect().width + slack}px`;
}
addEventListener("resize", cutSlots);

/* scroll a design's card into view below the pinned picker and flash it, so a pick can be changed where it was made */
function goToCard(id) {
  const card = $(`.card[data-id="${id}"]`); if (!card) return;
  card.style.scrollMarginTop = `${$(".picker").offsetHeight + 12}px`;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");
}

function renderPicker() {
  $("#picker").innerHTML = LAYOUTS[VARIANT]();
  cutSlots();
  bind($("#picker"));
  const dr = $("#picker .drawer"); if (dr) dr.onclick = () => { S.open = !S.open; renderPicker(); };
  const ed = $("#picker .edit"); if (ed) ed.onclick = openSheet;
}

function renderGrid() {
  const full = left() <= 0;
  $("#grid").innerHTML = DESIGNS.map(d => {
    const q = S.picks.filter(p => p === d.id).length;
    const ctl = q
      ? `<button type="button" data-m="${d.id}" aria-label="Remove one ${d.name}">−</button><b>${q}</b><button type="button" data-p="${d.id}" ${full ? "disabled" : ""} aria-label="Add one ${d.name}">+</button>`
      : `<button type="button" class="add" data-p="${d.id}" ${full ? "disabled" : ""}>Add</button>`;
    return `<div class="card" data-id="${d.id}"><div class="box img">Product image</div><div class="nm">${d.name}</div><div class="ctl">${ctl}</div></div>`;
  }).join("");
  $$("[data-p]").forEach(b => b.onclick = () => { if (left() > 0) { S.picks.push(b.dataset.p); render(); } });
  $$("[data-m]").forEach(b => b.onclick = () => { const i = S.picks.lastIndexOf(b.dataset.m); if (i > -1) S.picks.splice(i, 1); render(); });
}

function renderBar() {
  const l = left();
  $("#tot").innerHTML = `Total: <b>$${tier().price}</b> <span class="save">($${save()} saved)</span>`;
  $("#next").disabled = l > 0;
  $("#next").textContent = l > 0 ? `Add ${l} more set${l === 1 ? "" : "s"} to continue` : "Next";
}

function render() { renderPicker(); renderSheet(); renderGrid(); renderBar(); }
render();
