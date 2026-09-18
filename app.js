/* Btown Merch Prototypes — one engine, seven visual languages.
   Nothing here is purchasable: "Continue" ends at a summary because the checkout destination is undecided. */
(function () {
  'use strict';
  const DATA = window.BTOWN;
  // display order: newer designs lead, two new then one old, until the new ones run out
  const mixNew = (nw, old) => { const out = []; let i = 0, j = 0; while (i < nw.length || j < old.length) { if (i < nw.length) out.push(nw[i++]); if (i < nw.length) out.push(nw[i++]); if (j < old.length) out.push(old[j++]); } return out; };
  // ids 51–84 are the 2026 designs and lead; ids 85+ are older designs brought back, so they sit with the originals
  const isNew = d => d.id > 50 && d.id < 85;
  // a fresh shuffle on every load (Fisher–Yates), inside each group, so the rhythm holds but the lineup never repeats
  const shuffle = arr => { const out = arr.slice(); for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };
  const DES = mixNew(shuffle(DATA.designs.filter(isNew)), shuffle(DATA.designs.filter(d => !isNew(d))));
  const G = DATA.garments;                 // name -> hex
  const GN = {}; Object.keys(G).forEach(k => { GN[G[k].toUpperCase()] = k; });
  const PR = DATA.products.filter(p => !p.hold); // products on hold (embroidery, for now) stay in the data but off the page
  const PK = {}; PR.forEach(p => { PK[p.key] = p; });
  const byId = {}; DES.forEach(d => { byId[d.id] = d; });
  const SMALL = { 6: 1, 12: 1, 16: 1, 35: 1, 48: 1 }; // compact marks that could fit a hat panel or a polo chest
  const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  const PROTOS = [
    { key: 'hub', name: 'Hub' },
    { key: 'awge', name: 'AWGE' },
    { key: 'oak', name: 'Oaklandish' },
    { key: 'hubo', name: 'Hub × Oaklandish' },
    { key: 'huba', name: 'Hub × merch.exe' },
    { key: 'oaka', name: 'Oaklandish × AWGE' },
    { key: 'mix', name: 'The blend' },
  ];

  // ------------------------------------------------------------ state
  const S = {};
  PROTOS.forEach(p => { S[p.key] = { sel: { id: null, vkey: null, product: 'tee', place: 'Back', color: null, size: null }, bag: [], note: '', noteKind: '', peek: null, lb: false, tour: false, tourAt: null, tourAuto: false, page: 0, view: p.key === 'huba' ? 'art' : 'garment', night: false }; });

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = n => '$' + n;
  const vOf = (d, key) => d.variants.find(v => v.key === key) || d.variants[0];
  const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const gname = hex => { if (!hex) return 'Cream'; const k = hex.toUpperCase(); if (GN[k]) return GN[k]; const c = hexRGB(k); let best = 'Cream', bd = Infinity; for (const n in G) { const g = hexRGB(G[n].toUpperCase()); const dd = (c[0] - g[0]) ** 2 + (c[1] - g[1]) ** 2 + (c[2] - g[2]) ** 2; if (dd < bd) { bd = dd; best = n; } } return best; };
  const SUNNY = { 3: 1, 9: 1, 15: 1, 21: 1, 27: 1, 33: 1, 40: 1, 45: 1 };
  const noSize = p => !(p.sizes && p.sizes.length);
  // every palette colour the product comes in, the design's own colours first (Printify offers the full list at checkout)
  const suitFor = (v, p) => { const all = (p.colors && p.colors.length) ? p.colors : v.suit; const first = v.suit.filter(c => all.includes(c)); return first.concat(all.filter(c => !first.includes(c))); };
  const colorless = p => p.colors && p.colors.length === 0;
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const smooth = () => reduced() ? 'auto' : 'smooth';
  const aspect = v => v.w / v.h;

  // ------------------------------------------------------------ garment silhouettes (viewBox 0 0 200 230; body 112 units ≈ 20 in)
  const SIL = {
    tee: 'M62 18 C75 32 125 32 138 18 L176 34 L196 88 L156 100 L156 222 L44 222 L44 100 L4 88 L24 34 Z',
    crew: 'M62 18 C75 32 125 32 138 18 L176 34 L198 150 L158 156 L156 222 L44 222 L42 156 L2 150 L24 34 Z',
    hoodie: 'M62 18 C75 32 125 32 138 18 L176 34 L198 150 L158 156 L156 222 L44 222 L42 156 L2 150 L24 34 Z',
    zip: 'M62 18 C75 32 125 32 138 18 L176 34 L198 150 L158 156 L156 222 L44 222 L42 156 L2 150 L24 34 Z',
    crop: 'M62 18 C75 32 125 32 138 18 L176 34 L196 88 L156 100 L156 160 L44 160 L44 100 L4 88 L24 34 Z',
    tank: 'M70 18 C80 34 120 34 130 18 L150 26 L150 78 C142 96 148 112 152 222 L48 222 C52 112 58 96 50 78 L50 26 Z',
    wtank: 'M74 18 C82 34 118 34 126 18 L146 26 L146 78 C140 96 146 112 150 222 L50 222 C54 112 60 96 54 78 L54 26 Z',
    polo: 'M62 18 C75 32 125 32 138 18 L176 34 L196 88 L156 100 L156 222 L44 222 L44 100 L4 88 L24 34 Z',
    tote: 'M46 78 L154 78 L154 214 L46 214 Z',
    mug: 'M50 56 L150 56 L150 196 L50 196 Z',
    hat: 'M34 128 C34 66 166 66 166 128 L34 128 Z',
    ls: 'M62 18 C75 32 125 32 138 18 L176 34 L200 156 L164 162 L156 100 L156 222 L44 222 L44 100 L36 162 L0 156 L24 34 Z',
    beanie: 'M42 176 L42 120 C42 56 158 56 158 120 L158 176 Z',
    magnet: 'M40 70 h120 a10 10 0 0 1 10 10 v70 a10 10 0 0 1 -10 10 h-120 a10 10 0 0 1 -10 -10 v-70 a10 10 0 0 1 10 -10 Z',
    sticker: 'M48 56 h104 a12 12 0 0 1 12 12 v104 a12 12 0 0 1 -12 12 h-104 a12 12 0 0 1 -12 -12 v-104 a12 12 0 0 1 12 -12 Z',
  };
  const EXTRA = {
    hoodie: '<path d="M62 18 C58 -4 142 -4 138 18" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/><path d="M62 170 L138 170 L138 212 L62 212 Z" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>',
    zip: '<path d="M62 18 C58 -4 142 -4 138 18" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/><path d="M100 26 L100 222" stroke="rgba(0,0,0,.45)" stroke-width="3"/>',
    polo: '<path d="M62 18 L100 44 L138 18" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/><path d="M100 44 L100 70" stroke="rgba(0,0,0,.35)" stroke-width="2"/>',
    tote: '<path d="M70 78 C70 24 130 24 130 78" fill="none" stroke="currentColor" stroke-width="5"/>',
    mug: '<path d="M150 90 C186 90 186 160 150 160" fill="none" stroke="currentColor" stroke-width="12"/>',
    hat: '<path d="M16 128 L184 128 C186 140 100 148 16 128 Z" fill="currentColor" opacity=".8"/>',
    beanie: '<path d="M42 146 L158 146 L158 176 L42 176 Z" fill="rgba(0,0,0,.14)"/><path d="M42 146 L158 146" stroke="rgba(0,0,0,.25)" stroke-width="2"/>',
    ls: '<path d="M0 156 L36 162 M200 156 L164 162" stroke="rgba(0,0,0,.2)" stroke-width="2"/>',
  };
  const CENTER = { ls: [100, 108], beanie: [100, 161], magnet: [100, 115], tee: [100, 108], crew: [100, 112], hoodie: [100, 108], zip: [100, 120], crop: [100, 96], tank: [100, 108], wtank: [100, 106], polo: [74, 76], tote: [100, 146], mug: [100, 126], hat: [100, 108], sticker: [100, 120] };
  const UPI = { tote: 112 / 15, mug: 100 / 8.5, sticker: 104 / 4, magnet: 120 / 6, hat: 132 / 8, beanie: 116 / 8 };

  // does this product/placement carry the small front print instead of the main design?
  const APPAREL = ['tee', 'ls', 'crew', 'hoodie', 'zip', 'crop', 'polo', 'tank', 'wtank'];
  function frontHere(prod, place) { const kind = prod.sil || 'tee'; return kind === 'hat' || kind === 'beanie' || kind === 'polo' || place === 'Left chest' || place === 'Front panel' || place === 'Cuff' || (APPAREL.includes(kind) && (place === 'Both' || (place === 'Front' && kind === 'zip'))); }
  function gar(prod, fillHex, v, widthIn, place, front) {
    const kind = prod.sil || 'tee';
    const back = place === 'Back' && !['tote', 'mug', 'hat', 'sticker'].includes(kind);
    const upi = UPI[kind] || (112 / 20);
    const useFront = !!front && frontHere(prod, place);
    const art = useFront ? front : v;
    let wi = useFront ? (kind === 'hat' || kind === 'beanie' ? 3 : 3.5) : Math.min(widthIn || 8, prod.max || 12);
    let aw = wi * upi, ah = aw * art.h / art.w;
    let [cx, cy] = CENTER[kind];
    if (kind === 'zip') { cx = 100; cy = 120; }
    if (useFront && kind !== 'hat' && kind !== 'beanie') { cx = 74; cy = kind === 'zip' ? 84 : 76; } // left chest
    let img = `<image href="${art.file}?r=${REL}" x="${(cx - aw / 2).toFixed(1)}" y="${(cy - ah / 2).toFixed(1)}" width="${aw.toFixed(1)}" height="${ah.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`;
    if (prod.aop) img = `<clipPath id="aop"><path d="${SIL[kind]}"/></clipPath><image clip-path="url(#aop)" href="${art.file}?r=${REL}" x="46" y="78" width="108" height="136" preserveAspectRatio="xMidYMid slice"/>`; // all-over: the design fills the bag
    let path = SIL[kind], extra = EXTRA[kind] || '';
    if (back) { path = path.replace('C75 32 125 32', 'C75 22 125 22').replace('C80 34 120 34', 'C80 24 120 24').replace('C82 34 118 34', 'C82 24 118 24'); if (kind === 'zip') extra = EXTRA.hoodie; if (kind === 'polo') extra = ''; }
    return `<svg class="gar" viewBox="0 0 200 230" style="color:${fillHex}" aria-hidden="true"><path d="${path}" fill="${fillHex}"/>${extra}${img}</svg>`;
  }

  // ------------------------------------------------------------ rules
  function avail(d, v, p) {
    const a = aspect(v);
    if ((p.key === 'hat' || p.key === 'polo') && !d.front) return p.key === 'hat' ? 'needs a small version drawn later' : 'needs a small chest version';
    if (p.key === 'magnet' && a < 0.6) return 'too tall for a car magnet';
    return null;
  }
  const HEAVY = ['crew', 'crewpremium', 'hoodie', 'hoodiepremium', 'zip'];   // ship at $7.39; the promotion covers $4.89, the buyer pays $2.50
  const shipNote = p => HEAVY.includes(p.key) ? '$2.50 shipping · free on everything else' : 'Free shipping for a limited time';
  const BOTH_UP = 8;                    // front + back on any shirt
  const TOTE_TWO = 28;                  // canvas tote printed on both sides
  function priceOf(sel) {
    const p = PK[sel.product];
    if (p.price == null) return { num: null, text: 'price to confirm' };
    let num = p.price; const bits = [];
    if (sel.place === 'Both') { num += BOTH_UP; bits.push(`$${BOTH_UP} for the front print`); }
    if (sel.place === 'Two sides') { num = TOTE_TWO; bits.push('two sides'); }
    const up = p.up && sel.size ? (p.up[sel.size] || 0) : 0;
    if (up) { num += up; bits.push(`$${up} for ${sel.size}`); }
    let t = money(num);
    if (bits.length) t += ' · includes ' + bits.join(' and ');
    return { num, text: t };
  }
  function ensureValid(st) {
    const sel = st.sel; const d = byId[sel.id]; if (!d) return;
    const v = vOf(d, sel.vkey); sel.vkey = v.key;
    const p = PK[sel.product];
    let notes = [];
    if (avail(d, v, p)) { sel.product = 'tee'; notes.push(p.label + ' is not offered for this design; switched to Standard tee.'); }
    const pp = PK[sel.product];
    if (!pp.places.includes(sel.place)) { const old = sel.place; sel.place = pp.places[0]; notes.push(`${pp.label} does not offer “${old}”; placement set to ${sel.place}.`); }
    const okc = suitFor(v, pp);
    if (!sel.color || !okc.includes(sel.color)) {
      const old = sel.color; const want = v.gname || gname(v.garment); sel.color = okc.includes(want) ? want : okc[0];
      if (old) notes.push(`${old} is not a candidate for this ink on ${pp.label.toLowerCase()}; color set to ${sel.color}. Change it below.`);
    }
    if (sel.size && pp.sizes && pp.sizes.length && !pp.sizes.includes(sel.size)) { const old = sel.size; sel.size = null; notes.push(`${pp.label} is not offered in ${old} (candidate sizes); choose a size again.`); }
    if (notes.length) { st.note = notes.join(' '); st.noteKind = 'warn'; }
  }
  function select(pk, id) {
    const st = S[pk]; const sel = st.sel;
    if (sel.id !== id) { sel.id = id; sel.vkey = byId[id].variants[0].key; st.note = ''; st.noteKind = ''; }
    ensureValid(st);
  }

  // ------------------------------------------------------------ shared components
  function ladder(pk, opts) {
    opts = opts || {};
    const st = S[pk], sel = st.sel, d = byId[sel.id], v = vOf(d, sel.vkey);
    const prod = PK[sel.product];
    const rows = [];
    // product
    // scope switch: with a core list in data.js, only core designs offer the full lineup; the rest offer the two tees
    const prods = PR;   // every design gets the full lineup (since 2026-09-19)
    rows.push(row('Product', prods.map(p => {
      const why = avail(d, v, p);
      const pr = p.price == null ? '<small>price to confirm</small>' : `<small>${money(p.price)}</small>`;
      const cap = '';
      return opt({ pk, k: 'product', val: p.key, on: sel.product === p.key, dis: !!why, label: p.label, extra: why ? `<small>${esc(why)}</small>` : pr + cap, title: why || p.note || '' });
    }).join(''), ''));
    // placement
    const PL = { Front: 'Front print', Back: 'Back print', Both: 'Both' };
    rows.push(row('Print', prod.places.map(pl => opt({ pk, k: 'place', val: pl, on: sel.place === pl, label: (PL[pl] || pl) + (pl === 'Both' ? ' · +$8' : pl === 'Two sides' ? ' · $28' : '') })).join(''),
      (prod.places.includes('Both') ? `Front or back: the full design, roughly 8 to 10 in wide${prod.key === 'zip' ? ' (on the full-zip, the front print is the small chest version beside the zipper)' : ''}. Both: the full design on the back plus the small chest print on the front.` : (prod.key === 'tote' ? 'One side $22 · two sides $28' : (prod.note || '')))));
    // version: chosen in the carousel above the options (dots + swipe), not repeated here
    // color
    if (colorless(prod)) rows.push(row('Color', `<span class="lad-static">${prod.key === 'sticker' ? 'The sticker follows the art; no garment color.' : 'One color for this product.'}</span>`, ''));
    else rows.push(row('Garment color', suitFor(v, prod).map(c => `<button class="opt sw${sel.color === c ? ' on' : ''}" aria-pressed="${sel.color === c}" style="background:${G[c]}" title="${c}" aria-label="${c}" data-act="pick" data-pk="${pk}" data-k="color" data-v="${c}"></button>`).join(''), (() => { const cs = (window.BTOWN_COLORS || {})[prod.key]; return cs && cs.length ? `${sel.color} shown · ${cs.length} colors at checkout: ${cs.join(', ')}` : `${sel.color} · every color the blank comes in is offered at checkout`; })()));
    // size
    rows.unshift(rows.pop());   // colour first, so the preview recolours before anything else is chosen (Stephen, 2026-09-19)
    if (!noSize(prod)) rows.push(row('Size', prod.sizes.map(s => opt({ pk, k: 'size', val: s, on: sel.size === s, label: s, cls: 'sz' })).join(''), (sel.size ? (prod.up && prod.up[sel.size] ? `${sel.size} adds $${prod.up[sel.size]}` : 'Standard price') : 'Choose a size')));
    const note = st.note ? `<div class="lad-note ${st.noteKind || 'warn'}">${esc(st.note)}</div>` : '';
    return `<div class="lad">${note}${rows.join('')}</div>`;
  }
  function row(label, opts, note) {
    return `<div class="lad-row"><div class="lad-lab">${label}</div><div class="opts">${opts}</div>${note ? `<div class="lad-note">${note}</div>` : ''}</div>`;
  }
  function opt(o) {
    return `<button class="opt ${o.cls || ''}${o.on ? ' on' : ''}${o.dis ? ' dis' : ''}" aria-pressed="${!!o.on}" ${o.dis ? 'disabled' : ''} title="${esc(o.title || '')}" data-act="pick" data-pk="${o.pk}" data-k="${o.k}" data-v="${esc(o.val)}"><span>${esc(o.label)}</span>${o.extra || ''}</button>`;
  }
  function summary(pk) {
    const sel = S[pk].sel, d = byId[sel.id], v = vOf(d, sel.vkey), p = PK[sel.product], pr = priceOf(sel);
    const size = noSize(p) ? '' : ' · ' + (sel.size || '<span class="tbc">size not chosen</span>');
    return `<div class="sum"><span class="sl">Your pick</span><b>${esc(d.name)}</b>${d.variants.length > 1 ? ' · ' + esc(v.label) : ''} · ${p.label} · ${({ Front: 'front print', Back: 'back print', Both: 'front + back' })[sel.place] || sel.place.toLowerCase()} · ${sel.color}${size}<span class="sp">${pr.num == null ? '<span class="tbc">price to confirm</span>' : esc(pr.text)} <small class="ship">${shipNote(p)}</small></span></div>`;
  }
  function needsSize(pk) { const sel = S[pk].sel; return !noSize(PK[sel.product]) && !sel.size; }
  // live store links: site/buy.js maps design|version|product|placement to the Printify Pop-Up store listing
  const BUY = window.BTOWN_BUY || {};
  function buyUrl(sel) { return BUY[`${sel.id}|${sel.vkey}|${sel.product}|${sel.place}`] || ''; }
  function addBtn(pk, label) {
    if (pk === 'huba') {
      const sel = S[pk].sel, url = buyUrl(sel);
      if (url) return `<a class="cta buy" href="${url}" target="_blank" rel="noopener">Buy this on the BTown Brief store →</a><small class="buynote">Opens this exact listing in a new tab. Choose your color and size there.</small><button class="save" type="button" data-act="add" data-pk="${pk}">Save for later</button>`;
      return `<button class="cta" disabled>Coming to the store shortly</button>`;
    }
    const ns = needsSize(pk); return `<button class="cta" data-act="add" data-pk="${pk}" ${ns ? 'disabled' : ''}>${ns ? 'Choose a size to add' : (label || 'Add to bag')}</button>`;
  }
  function bagCount(pk) { return S[pk].bag.length; }
  function bagLines(pk) {
    const b = S[pk].bag;
    if (!b.length) return '<p class="empty">Nothing here yet.</p>';
    let total = 0, open = 0, sides = 0;
    const lines = b.map((l, i) => {
      const d = byId[l.id], v = vOf(d, l.vkey), p = PK[l.product], pr = priceOf(l);
      const two = l.place === 'Both' || l.place === 'Two sides'; if (two) sides++;
      if (pr.num == null) open++; else total += pr.num;
      return `<div class="bag-line"><span class="th" style="background:${G[l.color]}"><img src="${v.file}?r=${REL}" alt="${esc(d.name)}"></span><div><b>${esc(d.name)}${d.variants.length > 1 ? ' · ' + esc(v.label) : ''}</b><small>${p.label} · ${({ Front: 'front print', Back: 'back print', Both: 'front + back' })[l.place] || l.place.toLowerCase()} · ${l.color}${noSize(p) ? '' : ' · ' + l.size}</small></div><div><b>${pr.num == null ? '<span class="tbc">TBC</span>' : money(pr.num)}</b>${buyUrl(l) ? `<a class="rm buy" href="${buyUrl(l)}" target="_blank" rel="noopener">buy →</a>` : ''}<button class="rm" data-act="rm" data-pk="${pk}" data-i="${i}">remove</button></div></div>`;
    }).join('');
    const tot = `<p><b>Together: ${money(total)}</b>${open ? ` · ${open} line${open > 1 ? 's' : ''} with a price to confirm` : ''} · free shipping for a limited time; hoodies, crewnecks and the full-zip add $2.50.</p>`;
    return `<div class="bag-lines">${lines}</div>${tot}`;
  }
  const REL = DATA.release || '01';
  const TOUR_MS = 7000;
  const artField = (v, hex, extra, alt, eager) => `<div class="artf" style="background:${hex}"${extra || ''}><img src="prev/${v.key}-900.webp?r=${REL}" alt="${esc(alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`;
  function tileOf(d) { const v = d.variants[0]; return artField(v, v.garment, '', d.name); }
  function firstPrice(d) { return 'From $20'; }
  const printW = (d, p) => Math.min(Math.round(d.width * 13) / 10, p.max || 12);   // prints run 1.3x the intended width, under the product cap
  function viewBlock(pk, cls) {
    const st = S[pk], sel = st.sel, d = byId[sel.id], v = vOf(d, sel.vkey), p = PK[sel.product];
    st.view = 'art';   // the store shows the close-up only; the on-garment sketch is retired until real Printify photos are imported
    const hex = G[sel.color];
    const wi = printW(d, p);
    const multi = d.variants.length > 1;
    const one = vv => st.view === 'art' ? `<button class="zoom" data-act="lb" data-pk="${pk}" aria-label="Open the design at full size">${artField(vv, hex, '', d.name + (multi ? ' · ' + vv.label : ''), true)}<span class="zh">Tap to see it full size</span></button>` : (sel.place === 'Both' ? `<div class="garv both"><span class="gside">${gar(p, hex, vv, wi, 'Front', d.front)}<i>front</i></span><span class="gside">${gar(p, hex, vv, wi, 'Back', d.front)}<i>back</i></span></div>` : `<div class="garv">${gar(p, hex, vv, wi, sel.place, d.front)}</div>`);
    const vi = d.variants.indexOf(v);
    // the small front print: in a free corner when the main design is wide or tall, in its own strip when it fills the frame
    const fr = d.front; const ar = aspect(v); const room = st.view === 'garment' || ar > 1.45 || ar < 0.8;
    const chip = fr ? `<button class="fchip${room ? '' : ' strip'}" type="button" data-act="lbf" data-pk="${pk}" style="background:${hex}" aria-label="See the front print at full size"><img src="${fr.prev}?r=${REL}" alt="Front print for ${esc(d.name)}"><span>front</span></button>` : '';
    const strip = fr && !room ? `<div class="pair">${chip}<span class="ptext"><b>Small front print</b> · about 3½ in wide on the left chest when you choose both sides · the main design goes on the back · front print only is the full design</span></div>` : '';
    const body = multi ? `<div class="vcar"><div class="vtrack" tabindex="0" data-vcar aria-roledescription="carousel" aria-label="Versions of ${esc(d.name)}. Swipe, drag, or use the arrow keys.">${d.variants.map((vv, i) => `<div class="vslide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${d.variants.length}: ${esc(vv.label)}">${one(vv)}</div>`).join('')}</div><button class="varr l" data-act="vstep" data-pk="${pk}" data-dir="-1" aria-label="Previous version"${vi === 0 ? ' hidden' : ''}>‹</button><button class="varr r" data-act="vstep" data-pk="${pk}" data-dir="1" aria-label="Next version"${vi === d.variants.length - 1 ? ' hidden' : ''}>›</button>${room ? chip : ''}</div><div class="vdots"><span role="tablist" aria-label="Versions">${d.variants.map((vv, i) => `<button role="tab" class="vdot${i === vi ? ' on' : ''}" aria-selected="${i === vi}" tabindex="${i === vi ? 0 : -1}" data-act="pick" data-pk="${pk}" data-k="vkey" data-v="${vv.key}" aria-label="Version ${i + 1}: ${esc(vv.label)}"></button>`).join('')}</span><span class="vlab" aria-live="polite">${esc(v.label)} · ${vi + 1} of ${d.variants.length}</span></div>` : `<div class="vcar solo">${one(v)}${room ? chip : ''}</div>`;
    const chest = fr && frontHere(p, sel.place);
    const cap = st.view === 'art' ? `Shown on ${sel.color}`
      : sel.place === 'Both' ? `${p.label} · small front print on the left chest, full design on the back`
      : p.aop ? `${p.label} · the design covers the whole bag`
      : chest ? `${p.label} · ${p.method === 'embroidery' ? 'embroidered ' : ''}front print, about ${['hat', 'beanie'].includes(p.sil) ? 3 : 3.5} in wide`
      : `${p.label} · ${sel.place === 'Back' ? 'back print' : sel.place.toLowerCase()}`;
    return `<div class="${cls || 'view'}">${body}${strip}<div class="cap">${esc(cap)}</div></div>`;
  }
  function pimg(pk) { // square product image used by the Oaklandish-type pages
    const st = S[pk], sel = st.sel, d = byId[sel.id], v = vOf(d, sel.vkey), p = PK[sel.product];
    const hex = G[sel.color]; const wi = printW(d, p);
    return st.view === 'art' ? artField(v, hex) : gar(p, hex, v, wi, sel.place);
  }
  function vtoggle(pk) {
    const st = S[pk];
    return `<div class="vt"><button class="opt${st.view === 'garment' ? ' on' : ''}" data-act="view" data-pk="${pk}" data-v="garment"><span>On the garment</span></button><button class="opt${st.view === 'art' ? ' on' : ''}" data-act="view" data-pk="${pk}" data-v="art"><span>Art only</span></button></div>`;
  }
  function photoCard(pk, d, cls) { // garment on white, like a product photo
    const v = d.variants[0]; const p = PK.tee;
    return `${gar(p, v.garment, v, printW(d, p), 'Front')}`;
  }

  // each chapter lists its new designs first (nw), then the originals (old); mixNew weaves them two-to-one
  const SECTIONS_SRC = [
    { n: 1, t: 'Lake Champlain', nw: [57, 63, 65, 66, 78, 83, 79, 68], old: [2, 5, 6, 7, 8, 10, 12, 31, 32, 39, 43, 90, 87], lede: 'Sunsets, the ferry, a loon, small boats, and a creature that remains unconfirmed.' },
    { n: 2, t: 'The Paper', nw: [76, 67, 58, 52, 60, 64, 59, 73, 51], old: [11, 35, 42, 48, 85, 86], lede: 'The newsletter, folded, floated and set in type.' },
    { n: 3, t: 'The Gang, in Vermont', nw: [], old: [3, 9, 15, 21, 27, 33, 40, 45], lede: 'Eight lines that land twice if you know the show. No affiliation with it.' },
    { n: 4, t: 'Maple and snacks', nw: [54, 53, 71, 72], old: [13, 16, 17, 47, 50], lede: 'Creemees, sugar on snow, pie with cheddar, and a firm position on syrup.' },
    { n: 5, t: 'Streets and neighborhoods', nw: [55, 70, 74, 75, 77, 84, 80, 81, 62], old: [1, 14, 25, 26, 28, 29, 30, 49, 89], lede: 'Market runs, the hill, the roundabout, the bike path, the Old North End.' },
    { n: 6, t: 'Seasons', nw: [61, 82, 56], old: [20, 22, 23, 24, 44, 88], lede: 'Mud, thaw, first chair, a leaf in the spokes.' },
    { n: 7, t: 'Field and forest', nw: [69], old: [37, 38, 41, 46, 91, 92], lede: 'A red eft, clover in a mug, maple seeds, one turtle with right of way.' },
  ].map(s => ({ ...s, ids: mixNew(shuffle(s.nw), shuffle(s.old)) }));  // and the designs inside each chapter reshuffle too
  // chapters come out in a fresh order on every load; the numbers follow the order, and the photo bands follow the numbers
  const SECTIONS = shuffle(SECTIONS_SRC).map((s, i) => ({ ...s, n: i + 1 }));

  // ------------------------------------------------------------ templates
  const T = {};

  // ---------- P1 · HUB
  T.hub = {
    home(pk) {
      const st = S[pk];
      const cover = byId[49].variants[0];
      const secs = SECTIONS.map(s => `<section class="sec" id="s${s.n}"><p class="secnum">[${s.n}] ${esc(s.t)}</p><h2 class="D">${esc(s.t)}</h2><p class="lede">${esc(s.lede)}</p><div class="rows">${s.ids.map(i => rowOf(pk, byId[i])).join('')}</div></section>`).join('');
      return `<div class="proto p-hub${st.night ? ' night' : ''}">
        ${hubTop(pk, 'hub')}
        <section class="cover"><img class="photo" src="img/hero.jpg" alt="Sunset over Burlington Harbor">
          <div class="ct"><div class="eyebrow">Burlington, Vermont</div><h1 class="D"><span>Things to wear</span><span>for Burlington</span></h1>
          <ol class="toc">${SECTIONS.map(s => `<li><span class="n">[${s.n}]</span><span class="ld"></span><a href="#/p/hub/home#s${s.n}" data-act="jump" data-t="s${s.n}">${esc(s.t)}</a></li>`).join('')}<li><span class="n">[${SECTIONS.length + 1}]</span><span class="ld"></span><a href="#/p/hub/bag">Your bag (${bagCount(pk)})</a></li></ol></div>
          <div class="skyc"><button class="pill" data-act="night" data-pk="${pk}" aria-pressed="${st.night}"><span>Day</span><i></i><span>Night</span></button></div>
          <p class="credit">Burlington Harbor · Photograph by Steve Davis</p>
        </section>
        ${secs}
        <footer class="foot"><span>Tees $20 · Premium $25 · Long sleeve $25 · Crop $30 · Crewneck $38 · Hoodie $45 · Full-zip $50 · Tote $22 · Stickers from $5 · Magnets from $12</span><span><b>Free shipping for a limited time.</b> Hoodies, crewnecks and the full-zip add $2.50.</span></footer>
      </div>`;
      function rowOf(pk, d) { return `<a class="row" href="#/p/hub/d/${d.id}"><span class="n">${String(d.id).padStart(2, '0')}</span>${tileOf(d)}<span><span class="nm">${esc(d.name)}</span><div class="idea">${esc(d.idea)}</div></span><span class="fr"><b>From $20</b>${d.variants.length > 1 ? d.variants.length + ' versions' : ''}</span></a>`; }
    },
    detail(pk, d) {
      const st = S[pk];
      const copy = d.copy && d.copy.length ? d.copy.join(' / ') : 'No words';
      return `<div class="proto p-hub${st.night ? ' night' : ''}">${hubTop(pk, 'hub')}
        <article class="story"><a class="back" href="#/p/hub/home">← All designs</a>
          <p class="secnum" style="margin-top:14px">No. ${String(d.id).padStart(2, '0')} · ${esc(d.kind)}</p>
          <h1 class="D">${esc(d.name)}</h1><p class="idea">${esc(d.idea)}</p><p class="copy">${esc(copy)}</p>
          <div class="two"><div class="views">${viewBlock(pk)}</div><div>${ladder(pk)}${summary(pk)}${addBtn(pk)}</div></div>
        </article></div>`;
    },
    bag(pk) { const st = S[pk]; return `<div class="proto p-hub${st.night ? ' night' : ''}">${hubTop(pk, 'hub')}<div class="bagpage"><a class="back" href="#/p/hub/home">← Keep browsing</a><h1 class="D">Your bag</h1>${bagLines(pk)}</div></div>`; },
  };
  function hubTop(pk, key) {
    return `<header class="top"><a class="mark" href="#/p/${key}/home">BTown <i>Brief</i></a><div class="doors"><span class="door cur">MERCH</span><a class="door" href="https://hub.btownbrief.com/" target="_blank" rel="noopener">CITY HUB</a></div><nav class="verbs">${SECTIONS.map(s => `<a href="#/p/${key}/home" data-act="jump" data-t="s${s.n}">${esc(s.t)}</a>`).join('')}</nav><a class="btn-dark" href="#/p/${key}/bag">Bag (${bagCount(pk)})</a></header>`;
  }

  // ---------- P2 · AWGE
  T.awge = {
    home(pk) {
      const st = S[pk];
      const feat = byId[st.sel.id || 10]; const fv = vOf(feat, st.sel.vkey);
      const icons = DES.map(d => `<a class="icon" href="#/p/awge/d/${d.id}"><span class="ico" style="background:${d.variants[0].garment}"><img src="${d.variants[0].file}" alt=""></span><span class="lbl">${esc(d.name)}</span></a>`).join('');
      return `<div class="proto p-awge"><div class="tv"><div class="screen"><div class="noise"></div>
        <div class="win main"><div class="tb"><span class="px">BTOWN BRIEF</span><span class="btns"><span>_</span><span>□</span><span>X</span></span></div>
          <div class="desk"><div class="icons">${icons}</div>
            <div class="media"><div class="artf" style="background:${fv.garment}"><img src="${fv.file}" alt=""></div><span class="cap">MEDIA · ${esc(feat.name).toUpperCase()}</span></div></div>
          <div class="status"><span>${DES.length} DESIGNS · TEES $20 · PREMIUM $25</span><a href="#/p/awge/bag">CART (${bagCount(pk)})</a></div></div>
        <p class="copy">© 2026 BTOWN BRIEF<br>RULE #1: PRICES BEYOND THE TEES ARE TO BE CONFIRMED</p></div><div class="brand">BTOWN</div></div></div>`;
    },
    detail(pk, d) {
      const st = S[pk], sel = st.sel, v = vOf(d, sel.vkey), p = PK[sel.product], hex = G[sel.color], wi = Math.min(d.width, p.max);
      const body = st.view === 'art' ? artField(v, hex) : `<div class="garv">${gar(p, hex, v, wi, sel.place)}</div>`;
      return `<div class="proto p-awge"><div class="tv"><div class="screen"><div class="noise"></div>
        <div class="win dwin"><div class="tb"><span class="px">${esc(d.name).toUpperCase().replace(/ /g, '_')}.EXE</span><span class="btns"><a href="#/p/awge/home"><span>_</span></a><span>□</span><a href="#/p/awge/home"><span>X</span></a></span></div>
          <div class="dbody"><div class="dart">${body}<div class="vt"><button class="opt${st.view === 'garment' ? ' on' : ''}" data-act="view" data-pk="${pk}" data-v="garment">ON ${p.key === 'tote' ? 'TOTE' : p.key === 'mug' ? 'MUG' : p.key === 'hat' ? 'HAT' : 'GARMENT'}</button><button class="opt${st.view === 'art' ? ' on' : ''}" data-act="view" data-pk="${pk}" data-v="art">ART ONLY</button></div></div>
            <div class="dcfg"><h1>${esc(d.name)}</h1><p class="idea">${esc(d.idea)} <span class="px" style="font-size:7px;color:#666">// about ${wi} in wide, approximate</span></p>${ladder(pk)}${summary(pk)}${addBtn(pk, 'ADD TO CART')}<a class="cta alt" href="#/p/awge/home">BACK TO DESKTOP</a></div></div>
          <div class="status"><span>${DES.length} DESIGNS</span><a href="#/p/awge/bag">CART (${bagCount(pk)})</a></div></div>
        <p class="copy">© 2026 BTOWN BRIEF</p></div><div class="brand">BTOWN</div></div></div>`;
    },
    bag(pk) {
      return `<div class="proto p-awge"><div class="tv"><div class="screen"><div class="noise"></div>
        <div class="win bagwin"><div class="tb"><span class="px">CART</span><span class="btns"><a href="#/p/awge/home"><span>X</span></a></span></div><div class="bagbody"><h1>YOUR CART</h1>${bagLines(pk)}<a class="cta alt" href="#/p/awge/home" style="display:block;text-align:center">BACK TO DESKTOP</a></div></div>
        <p class="copy">© 2026 BTOWN BRIEF</p></div><div class="brand">BTOWN</div></div></div>`;
    },
  };

  // ---------- P3 · OAKLANDISH
  function oakHdr(pk, key) {
    const mk = byId[48].variants[0];
    return `<div class="ann"><span class="arr l">‹</span>Local pickup in Burlington: to be decided · Shipping: to be decided<span class="arr r">›</span></div><div class="gold">Standard tees $20 · Premium tees $25 · everything else priced soon</div>
      <header class="hdr"><a class="wm" href="#/p/${key}/home"><span class="mk"><img src="${mk.file}" alt="" style="width:34px"></span>BTOWN BRIEF</a><nav class="nav"><a href="#/p/${key}/home">Shop</a><a href="https://btownbrief.com" target="_blank" rel="noopener">Blog</a><a href="https://hub.btownbrief.com/" target="_blank" rel="noopener">The hub</a><a>Help</a></nav><div class="util"><span>Search</span><a href="#/p/${key}/bag">Cart (${bagCount(pk)})</a></div></header>`;
  }
  function oakCard(key, d, cls) {
    return `<a class="card" href="#/p/${key}/d/${d.id}"><div class="ph">${photoCard(key, d)}</div><div class="t">${esc(d.name)}${d.variants.length > 1 ? ` <small>· ${d.variants.length} versions</small>` : ''}</div><div class="p">From $20.00</div><div class="co">Choose options</div></a>`;
  }
  T.oak = {
    home(pk) {
      const hv = byId[49].variants[0];
      const a = DES.slice(0, 12), b = DES.slice(12, 28), c = DES.slice(28);
      return `<div class="proto p-oak">${oakHdr(pk, 'oak')}
        <section class="hero" style="background:${hv.garment}">${artField(hv, hv.garment)}<div class="ht"><h1>Burlington, worn.</h1><p>Original flat-ink designs from the newsletter. Pick a design first, then the shirt, sweatshirt, tote or mug it goes on.</p><a class="btn w" href="#/p/oak/d/49">Shop this design</a></div></section>
        <section class="blk"><h2>New arrivals</h2><div class="grid">${a.map(d => oakCard('oak', d)).join('')}</div><div class="shopall"><a class="btn" href="#/p/oak/home">Shop new arrivals</a></div></section>
        <section class="blk" style="background:#f6f6f6"><h2>Lake Champlain</h2><div class="grid">${b.map(d => oakCard('oak', d)).join('')}</div><div class="shopall"><a class="btn" href="#/p/oak/home">Shop the lake</a></div></section>
        <section class="blk"><h2>Marks and lettering</h2><div class="grid">${c.map(d => oakCard('oak', d)).join('')}</div></section>
        <footer class="foot"><div><b>Shop</b>Designs · Tees · Sweatshirts · Totes · Stickers</div><div><b>Customer care</b>Sizing (to be written) · Shipping (to be decided) · Returns (to be decided)</div><div><b>BTown Brief</b>A newsletter that got out of hand. Prototype: nothing is purchasable.</div></footer></div>`;
    },
    detail(pk, d) {
      const st = S[pk], sel = st.sel, pr = priceOf(sel);
      const more = DES.filter(x => x.id !== d.id).slice(0, 4);
      return `<div class="proto p-oak">${oakHdr(pk, 'oak')}<div class="crumb"><a href="#/p/oak/home">Home</a> › ${esc(d.name)}</div>
        <section class="pp"><div><div class="pimg">${pimg(pk)}</div><div class="dots"><button class="opt${st.view === 'garment' ? ' on' : ''}" data-act="view" data-pk="${pk}" data-v="garment" aria-label="On the garment"></button><button class="opt${st.view === 'art' ? ' on' : ''}" data-act="view" data-pk="${pk}" data-v="art" aria-label="Art only"></button></div></div>
          <div class="pinfo"><h1>${esc(d.name)}</h1><p class="price">${pr.num == null ? '<span class="tbc">Price to confirm</span>' : esc(pr.text)} <small>+ shipping</small></p><p class="desc">${esc(d.idea)}</p>
            <ul class="bul"><li>${d.variants.length > 1 ? d.variants.length + ' versions of the art' : 'One version of the art'}</li><li>Print about ${Math.min(d.width, PK[sel.product].max)} in wide, approximate; final size set per product</li><li>Blank, fit and sizing to be chosen</li></ul>
            ${ladder(pk)}${summary(pk)}${addBtn(pk, 'Add to cart')}</div></section>
        <section class="more"><h2>You may also like</h2><div class="grid">${more.map(x => oakCard('oak', x)).join('')}</div></section></div>`;
    },
    bag(pk) { return `<div class="proto p-oak">${oakHdr(pk, 'oak')}<div class="bagpage"><h1>Your cart</h1>${bagLines(pk)}<a class="btn" href="#/p/oak/home">Continue shopping</a></div></div>`; },
  };

  // ---------- P4 · HUB × OAKLANDISH
  function hubMast(pk, key, cls) {
    return `<header class="top"><a class="mark" href="#/p/${key}/home">BTown <i>Brief</i></a><div class="doors"><span class="door cur">MERCH</span><a class="door" href="https://hub.btownbrief.com/" target="_blank" rel="noopener">CITY HUB</a></div><nav class="verbs"><a href="#/p/${key}/home">New</a><a href="#/p/${key}/home">The lake</a><a href="#/p/${key}/home">The Gang</a><a href="#/p/${key}/home">Small marks</a></nav><a class="btn-dark" href="#/p/${key}/bag">Bag (${bagCount(pk)})</a></header>`;
  }
  function edCard(key, d, extra) {
    return `<a class="card" href="#/p/${key}/d/${d.id}"><div class="ph">${photoCard(key, d)}</div><div class="t">${esc(d.name)}</div><div class="i">${esc(d.idea)}</div><div class="p">From $20${d.variants.length > 1 ? ' · ' + d.variants.length + ' versions' : ''}</div>${extra || ''}</a>`;
  }
  T.hubo = {
    home(pk) {
      const a = DES.slice(0, 12), b = DES.slice(12, 28), c = DES.slice(28);
      return `<div class="proto p-hubo"><div class="ann">Local pickup and shipping: to be decided</div><div class="sap">Standard tees $20 · Premium tees $25 · everything else priced soon</div>${hubMast(pk, 'hubo')}
        <section class="cover"><img class="photo" src="img/hero.jpg" alt="Sunset over Burlington Harbor"><div><div class="eyebrow">Burlington, Vermont</div><h1 class="D">Things to wear<br>for Burlington</h1></div><p>Twenty of the forty-five designs, on the products they suit. Pick the design first; the shirt comes second.</p><p class="credit">Burlington Harbor · Photograph by Steve Davis</p></section>
        <section class="blk"><p class="secnum">[1]</p><h2 class="D">New this month</h2><div class="grid">${a.map(d => edCard('hubo', d, '<div class="co">Choose options</div>')).join('')}</div></section>
        <section class="blk" style="background:var(--card)"><p class="secnum">[2]</p><h2 class="D">The lake</h2><div class="grid">${b.map(d => edCard('hubo', d, '<div class="co">Choose options</div>')).join('')}</div></section>
        <section class="blk"><p class="secnum">[3]</p><h2 class="D">Marks and lettering</h2><div class="grid">${c.map(d => edCard('hubo', d, '<div class="co">Choose options</div>')).join('')}</div></section>
        <footer class="foot">BTown Brief · a newsletter that got out of hand · prototype, nothing is purchasable</footer></div>`;
    },
    detail(pk, d) {
      const st = S[pk], sel = st.sel, pr = priceOf(sel);
      return `<div class="proto p-hubo"><div class="ann">Local pickup and shipping: to be decided</div>${hubMast(pk, 'hubo')}<div class="crumb"><a href="#/p/hubo/home">All designs</a> › No. ${String(d.id).padStart(2, '0')}</div>
        <section class="pp"><div><div class="pimg">${pimg(pk)}</div>${vtoggle(pk)}</div>
          <div class="pinfo"><h1 class="D">${esc(d.name)}</h1><p class="idea">${esc(d.idea)}</p><p class="price">${pr.num == null ? '<span class="tbc">Price to confirm</span>' : esc(pr.text)} <small>+ shipping, to be confirmed</small></p>${ladder(pk)}${summary(pk)}${addBtn(pk)}</div></section></div>`;
    },
    bag(pk) { return `<div class="proto p-hubo">${hubMast(pk, 'hubo')}<div class="bagpage"><h1 class="D">Your bag</h1>${bagLines(pk)}<a class="btn-dark" href="#/p/hubo/home">Keep browsing</a></div></div>`; },
  };

  // ---------- P5 · HUB × merch.exe (the hub's language, a paged grid in a window, chapters, photo bands)
  const BANDS = {
    1: [['img/sculpture.jpg?v=4', 'Sunset over Lake Champlain from the waterfront', 2400, 1800, 'center 62%']],
    3: [['img/steel.jpg?v=4', 'The City of Burlington sign through the steel frame', 2400, 1800, 'center 52%']],
    4: [['img/lakesunset.jpg?v=4', 'Purple and orange sunset over Lake Champlain', 2400, 1800, 'center 45%']],
    5: [['img/bikepath.jpg?v=4', 'Autumn on the Burlington bike path', 2400, 1800, 'center 55%']],
    7: [['img/docksunset.jpg', 'Waterfront docks at sunset', 1000, 1000, 'center 60%']],
  };
  const PAGE = 12;
  function band(n) { const b = BANDS[n]; if (!b) return ''; return `<div class="band c${b.length}">${b.map(([s, t, w, h, pos], i) => `<figure><div class="pw"><img class="px" src="${s}" alt="${esc(t)}" width="${w}" height="${h}" loading="eager" fetchpriority="high" decoding="async"></div></figure>`).join('')}<span class="cr">Photographs by Steve Davis</span></div>`; }
  function hubaTop(pk) {
    return `<header class="top"><a class="mark" href="#/p/huba/home">BTown <i>Brief</i></a><div class="doors"><span class="door cur">MERCH</span><a class="door" href="https://hub.btownbrief.com/" target="_blank" rel="noopener">CITY HUB</a></div><nav class="verbs">${SECTIONS.slice(0, 5).map(s => `<a href="#/p/huba/home" data-act="jump" data-t="h${s.n}">${esc(s.t)}</a>`).join('')}</nav><a class="btn-dark" href="#/p/huba/bag">Saved (${bagCount(pk)})</a></header>`;
  }
  const preview = (d, eager) => { const v = d.variants[0]; return `<div class="artf pv" style="background:${v.garment}"><img src="prev/${v.key}-480.webp?r=${REL}" alt="${esc(d.name)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`; };
  function gridTile(d, eager) { return `<a class="gt" href="#/p/huba/d/${d.id}" data-act="peek" data-pk="huba" data-id="${d.id}">${stacked(d, preview(d, eager))}<b>${esc(d.name)}${plusV(d)}</b></a>`; }
  const EXPAND = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 8.8 7.2M6.5 13.5h-4v-4M2.5 13.5 7.2 8.8"/></svg>';
  function tourPanel(pk) {
    const st = S[pk]; if (!st.tour) return '';
    const at = Math.max(0, DES.findIndex(x => x.id === st.tourAt));
    return `<div class="ov tourv" data-act="tour" data-pk="${pk}"><div class="twin" role="dialog" aria-modal="true" aria-label="Designs, one per screen">
      <div class="tbar"><span class="t" data-tourname aria-live="polite">${esc(DES[at].name)}</span><span class="cnt" data-tourcnt>${at + 1} of ${DES.length}</span><span class="tnav"><button class="tarr" data-act="tstep" data-pk="${pk}" data-dir="-1" aria-label="Previous design">↑</button><button class="tarr" data-act="tstep" data-pk="${pk}" data-dir="1" aria-label="Next design">↓</button></span><button class="x" data-act="tour" data-pk="${pk}" aria-label="Close">×</button></div>
      <div class="tscroll" tabindex="-1" data-tscroll>${DES.map((d, i) => { const v = d.variants[0]; const r = ((v.w || 4) / (v.h || 3)).toFixed(4); const eager = Math.abs(i - at) < 2; const n = d.variants.length;
        const art = n > 1 ? `<div class="htrack" data-htrack tabindex="0" aria-roledescription="carousel" aria-label="${n} versions of ${esc(d.name)}. Swipe or use the arrows.">${d.variants.map((vv, k) => `<div class="hslide" role="group" aria-label="${k + 1} of ${n}: ${esc(vv.label)}">${artField(vv, vv.garment, '', d.name + ' · ' + vv.label, eager)}</div>`).join('')}</div><button class="harr l" data-act="hstep" data-dir="-1" aria-label="Previous version" hidden>‹</button><button class="harr r" data-act="hstep" data-dir="1" aria-label="Next version">›</button>` : artField(v, v.garment, '', d.name, eager);
        const cue = n > 1 ? `<div class="hcue"><span class="hdots" data-hdots>${d.variants.map((vv, k) => `<i${k === 0 ? ' class="on"' : ''}></i>`).join('')}</span><span class="hlab" data-hlab>‹ swipe for ${n} versions · ${esc(d.variants[0].label)} ›</span></div>` : '';
        return `<section class="slide${n > 1 ? ' multi' : ''}" data-i="${i}"><div class="sart" style="--r:${r}">${art}</div>${cue}<div class="scap"><button class="tplay${st.tourAuto ? ' on' : ''}" data-act="tplay" data-pk="${pk}" aria-pressed="${st.tourAuto}" aria-label="${st.tourAuto ? 'Pause auto-advance' : 'Auto-advance every 7 seconds'}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="ring-bg" cx="32" cy="32" r="27"/><circle class="ring" cx="32" cy="32" r="27"/></svg><span class="tnum" aria-hidden="true"></span><span class="ic" aria-hidden="true"></span></button><span class="tpause" aria-hidden="true">${st.tourAuto ? 'click to pause' : 'click to play'}</span><span class="nm">${esc(d.name)}</span><span class="pr">From $20</span>${d.front ? `<span class="fmock" title="The small front print, left chest" style="background:${v.garment}"><img src="${d.front.prev}?r=${REL}" alt="Front print for ${esc(d.name)}" loading="lazy" decoding="async"><i>front print</i></span>` : ''}<a class="go" href="#/p/huba/d/${d.id}">Choose product and size</a></div></section>`; }).join('')}</div></div></div>`;
  }
  function lightbox(pk) {
    const st = S[pk]; if (!st.lb) return ''; const d = byId[st.sel.id], v = vOf(d, st.sel.vkey), hex = G[st.sel.color];
    if (st.lb === 'front' && d.front) return `<div class="ov lbv" data-act="lb" data-pk="${pk}" role="dialog" aria-modal="true" aria-label="Front print for ${esc(d.name)}"><figure class="lbf" data-stop style="background:${hex}"><img src="${d.front.file}?r=${REL}" alt="Front print for ${esc(d.name)}"><figcaption><b>${esc(d.name)} · front print</b> · on ${st.sel.color} · <em>about 3½ in wide on the chest; shown large here</em></figcaption><button class="x" data-act="lb" data-pk="${pk}" aria-label="Close">×</button></figure></div>`;
    return `<div class="ov lbv" data-act="lb" data-pk="${pk}" role="dialog" aria-modal="true" aria-label="${esc(d.name)} at full size"><figure class="lbf" data-stop style="background:${hex}"><img src="${v.file}?r=${REL}" alt="${esc(d.name)}${d.variants.length > 1 ? ' · ' + esc(v.label) : ''}"><figcaption><b>${esc(d.name)}${d.variants.length > 1 ? ' · ' + esc(v.label) : ''}</b> · on ${st.sel.color} · <em>close-up, not print size</em></figcaption><button class="x" data-act="lb" data-pk="${pk}" aria-label="Close">×</button></figure></div>`;
  }
  function nightPill(pk) { const st = S[pk]; return `<div class="skyc"><button class="pill" data-act="night" data-pk="${pk}" aria-pressed="${st.night}"><span>Day</span><i></i><span>Evening</span></button></div>`; }
  function gridWin(pk) {
    const pages = []; for (let i = 0; i < DES.length; i += PAGE) pages.push(DES.slice(i, i + PAGE));
    const st = S[pk]; const cur = Math.min(pages.length - 1, Math.max(0, st.page || 0));
    return `<div class="win"><div class="tb"><span class="dots pd">${pages.map((p, i) => `<button class="dot${i === cur ? ' on' : ''}" data-act="pageto" data-pk="${pk}" data-page="${i}" aria-label="Page ${i + 1}" aria-pressed="${i === cur}"></button>`).join('')}</span><span class="title">merch.exe</span><span class="cnt">Page ${cur + 1} of ${pages.length}</span></div>
      <div class="pager"><div class="track" data-pages style="transform:translateX(-${cur * 100}%)">${pages.map((p, i) => `<div class="page" data-page="${i + 1}" ${i === cur ? '' : 'aria-hidden="true"'}>${p.map(d => gridTile(d, i === 0)).join('')}</div>`).join('')}</div><button class="arr l" data-act="page" data-pk="${pk}" data-dir="-1" aria-label="Previous page" ${cur === 0 ? 'disabled' : ''}>‹</button><button class="arr r" data-act="page" data-pk="${pk}" data-dir="1" aria-label="Next page" ${cur >= pages.length - 1 ? 'disabled' : ''}>›</button></div>
      <div class="status"><span>${DES.length} designs · ${pages.length} pages</span><span class="sr"><a href="#" data-act="random" data-pk="huba">Surprise me</a> · <a href="#/p/huba/bag">Saved (${bagCount(pk)})</a></span></div></div>`;
  }
  // "(+2 versions)" after the name wherever a design has more than one
  const plusV = d => d.variants.length > 1 ? ` <span class="pv">(+${d.variants.length - 1} version${d.variants.length > 2 ? 's' : ''})</span>` : '';
  // a design with more versions shows them as cards stacked behind the tile, in their own garment colors
  // every tile sits on a backing card; a design with more versions gets a red one (and a third card when there are three)
  const stacked = (d, inner) => `<span class="pvw stack${d.variants.length > 1 ? ' multi' : ''}${d.variants.length > 2 ? ' n3' : ''}">${inner}</span>`;
  function card(d, i) { return `<div class="card" style="--d:${120 + i * 40}ms"><button class="qopen" type="button" data-act="peek" data-pk="huba" data-id="${d.id}" aria-label="Quick view: ${esc(d.name)}">${stacked(d, preview(d, i < 4))}<span class="ex">${EXPAND}</span></button><a class="nm" href="#/p/huba/d/${d.id}">${esc(d.name)}${plusV(d)}</a><span class="fr">From $20</span></div>`; }
  // product tiers: facts come from the product data; blank names for the two tees come from the brief
  const TIER = {
    tee: { price: '$20' }, premium: { price: '$25' }, ls: { price: '$25' }, lspremium: { price: '$40' }, crop: { price: '$30' }, crew: { price: '$38' }, crewpremium: { price: '$52' },
    hoodie: { price: '$45' }, hoodiepremium: { price: '$55' }, zip: { price: '$50' }, tote: { price: '$22 · both sides $28' }, sticker: { price: 'from $5' }, magnet: { price: 'from $12' },
  };
  function about() {
    const ab = DATA.about || {}; if (!ab.text) return '';
    return `<section class="about" id="about"><h2 class="D">${esc(ab.heading || 'About')}</h2><p>${esc(ab.text)}</p><p class="more">If you like these, <a href="https://www.btownbrief.com" target="_blank" rel="noopener">read the newsletter</a>, <a href="https://www.meetup.com/burlington-social-activites-group/" target="_blank" rel="noopener">come to a meetup</a>, and <a href="https://play.btownbrief.com/" target="_blank" rel="noopener">play the arcade</a>.</p></section>`;
  }
  T.huba = {
    home(pk) {
      const secs = SECTIONS.map(s => `<section class="sec" id="h${s.n}"><h2 class="D">${esc(s.t)}</h2><p class="lede">${esc(s.lede)}</p><div class="cards rvg">${s.ids.map((i, k) => card(byId[i], k)).join('')}</div></section>${band(s.n)}`).join('');
      const st = S[pk];
      return `<div class="proto p-huba${st.night ? ' night' : ''}">${hubaTop(pk)}
        <section class="cover"><img class="photo px" src="img/harbor.jpg?v=4" fetchpriority="high" decoding="async" alt="Burlington Harbor from above at dusk">
          <div class="ct"><div class="eyebrow">Burlington, Vermont</div><h1 class="D">Things to wear<br>for Burlington</h1><p class="jackson"><b>Tees start at $20 shipped!</b><br>That’s a single Andrew Jackson</p>
            <ol class="toc">${SECTIONS.map(s => `<li><span class="n">[${s.n}]</span><span class="ld"></span><a href="#/p/huba/home" data-act="jump" data-t="h${s.n}">${esc(s.t)}</a></li>`).join('')}</ol>
            <ul class="onwhat"><li class="ship"><b>Free shipping</b> for a limited time · hoodies, crewnecks and the full-zip add $2.50</li>${PR.filter(p => TIER[p.key]).map(p => `<li><b>${esc(p.label)}</b> ${TIER[p.key].price}<span class="ld"></span><i>${esc(p.blank)}</i></li>`).join('')}<li class="wide"><b>Front, back, or both</b> on every shirt · both +$8</li></ul>
            <p class="onwhat-links"><a href="#/p/huba/home" data-act="jump" data-t="about">About the maker ↓</a></p></div>
          ${gridWin(pk)}
          ${nightPill(pk)}
          <p class="credit">Burlington Harbor · Photograph by Steve Davis</p></section>
        <nav class="ribbon" aria-label="Chapters">${SECTIONS.map(s => `<a href="#/p/huba/home" data-act="jump" data-t="h${s.n}">[${s.n}] ${esc(s.t)}</a>`).join('')}<a href="#/p/huba/home" data-act="jump" data-t="about">About</a></nav>
        <div class="searchwrap"><label class="search"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" id="q" placeholder="Search ${DES.length} designs" aria-label="Search designs" autocomplete="off" spellcheck="false" value="${esc(st.q || '')}"><button type="button" class="qclear" data-act="qclear" data-pk="${pk}" aria-label="Clear search" ${st.q ? '' : 'hidden'}>×</button></label><span class="qhint" data-qhint></span></div>
        <section class="sec results" id="results" hidden><h2 class="D">Results</h2><p class="lede" data-qlede></p><div class="cards go now" id="resgrid"></div></section>
        <div class="tourwrap"><span class="arrs" aria-hidden="true"><i></i><i></i><i></i></span><button class="tour" type="button" data-act="tour" data-pk="${pk}"><span>Click to view each design 1 by 1 (it's a doozy)</span></button><span class="tourhint">Opens a scroller with one design per screen. Scroll or swipe to move through all ${DES.length}.</span><p class="jackson red"><b>Tees start at $20 shipped!</b><br>That’s a single Andrew Jackson<small>Free shipping is limited time, get it while it lasts</small></p></div>
        ${secs}${about()}<footer class="foot"><span>Tees $20 · Premium $25 · Long sleeve $25 · Crop $30 · Crewneck $38 · Hoodie $45 · Full-zip $50 · Tote $22 · Stickers from $5 · Magnets from $12</span><span>Prototype. Checkout links come next.</span></footer>${tourPanel(pk)}</div>`;
    },
    detail(pk, d) {
      const copy = d.copy && d.copy.length ? d.copy.join(' / ') : 'No words';
      const st = S[pk]; const pr = priceOf(st.sel);
      const ref = SUNNY[d.id] ? `<p class="ref">A nod to a show we like. Not affiliated with it.</p>` : '';
      return `<div class="proto p-huba${st.night ? ' night' : ''}">${hubaTop(pk)}<article class="story"><a class="back" href="#/p/huba/home">← All designs</a>
        <h1 class="D">${esc(d.name)}</h1>${ref}
        <div class="two"><div class="win view"><div class="tb"><span class="dots"><i></i><i></i><i></i></span><span class="title">${esc(d.name)}</span></div>${viewBlock(pk, 'vb')}</div><div>${ladder(pk)}${summary(pk)}${addBtn(pk)}</div></div></article>
        <div class="buybar"><span><b>${esc(d.name)}</b> · ${pr.num == null ? 'price to confirm' : esc(pr.text)}</span>${buyUrl(S[pk].sel) ? `<a class="cta buy" href="${buyUrl(S[pk].sel)}" target="_blank" rel="noopener">Buy →</a>` : '<button class="cta" disabled>Soon</button>'}</div>${lightbox(pk)}</div>`;
    },
    bag(pk) { return `<div class="proto p-huba${S[pk].night ? ' night' : ''}">${hubaTop(pk)}<div class="bagpage"><a class="back" href="#/p/huba/home">← Keep browsing</a><div class="win" style="margin-top:14px"><div class="tb"><span class="dots"><i></i><i></i><i></i></span><span class="title">saved</span></div><div class="bagbody"><h1 class="D">Saved for later</h1><p class="lede">Your picks, kept here on this device. Each one buys on the BTown Brief store.</p>${bagLines(pk)}</div></div></div></div>`; },
  };

  // scroll effects for prototype 5: reveal on scroll (fade + rise; images settle from a slight zoom) and a soft parallax on photographs
  let rvEls = [];
  function reveal(stage) {
    rvEls = [...stage.querySelectorAll('.rvg, .rv')];
    const vh = window.innerHeight;
    rvEls.forEach(el => { const r = el.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) { el.classList.add(el.classList.contains('rvg') ? 'go' : 'in'); el.classList.add('now'); } else el.classList.add('wait'); });
    rvEls = rvEls.filter(el => el.classList.contains('wait'));
  }
  function revealTick() {
    if (!rvEls.length) return;
    const vh = window.innerHeight;
    rvEls = rvEls.filter(el => { const r = el.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) { el.classList.remove('wait'); el.classList.add(el.classList.contains('rvg') ? 'go' : 'in'); return false; } return true; });
  }
  const PX = 11.538461538461538; // (1.3 - 1) / 1.3 / 2, so the scaled image never shows an edge
  function parallax() {
    // runs synchronously on every scroll event: cheap (a dozen rects), and it never waits on an animation frame that a hidden tab may pause
    {
      revealTick();
      const vh = window.innerHeight;
      document.querySelectorAll('.p-huba .px').forEach(img => {
        const first = img.classList.contains('photo');
        const box = (first ? img.closest('.cover') : img.parentElement).getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        if (first) { const p = Math.min(1, Math.max(0, -box.top / box.height)); img.style.transform = `scale(1.3) translateY(${(-PX + 2 * PX * p).toFixed(3)}%)`; return; }
        // band photos are position:fixed and clipped by their frame, so the compositor keeps them still with no per-frame JS
      });
    }
  }
  window.addEventListener('scroll', parallax, { passive: true });
  window.addEventListener('resize', parallax);
  window.addEventListener('load', parallax);
  setTimeout(parallax, 600); setTimeout(parallax, 1600);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) parallax(); });

  // ---------- P6 · OAKLANDISH × AWGE
  T.oaka = {
    home(pk) {
      const cards = DES.map((d, i) => `<a class="card" href="#/p/oaka/d/${d.id}"><div class="ph">${photoCard('oaka', d)}</div>${i < 4 ? '<span class="tag">NEW</span>' : (d.variants.length > 1 ? `<span class="tag g">${d.variants.length} VERSIONS</span>` : '')}<div class="t">${esc(d.name)}</div><div class="p">FROM $20</div></a>`).join('');
      return `<div class="proto p-oaka"><div class="marq"><span>BTOWN BRIEF MERCH · FALL 2026 · TEES $20 · PREMIUM $25 · EVERYTHING ELSE TBC · NO ACCOUNTS · NO URGENCY · JUST SHIRTS · BTOWN BRIEF MERCH · FALL 2026 · TEES $20 · PREMIUM $25 · EVERYTHING ELSE TBC</span></div>
        <header class="hdr"><a class="wm" href="#/p/oaka/home">BTown Brief<small>MERCH · BURLINGTON, VT</small></a><div class="util"><span>SEARCH</span><a href="#/p/oaka/bag">BAG (${bagCount(pk)})</a></div></header><div class="static"></div>
        <section class="grid">${cards}</section>
        <footer class="foot">© 2026 BTOWN BRIEF<br>PROTOTYPE · NOTHING IS PURCHASABLE<br>RULE #1: NEVER OVERSELL THE PRINT SIZE</footer></div>`;
    },
    detail(pk, d) {
      const st = S[pk], sel = st.sel, pr = priceOf(sel);
      return `<div class="proto p-oaka"><div class="marq"><span>BTOWN BRIEF MERCH · TEES $20 · PREMIUM $25 · EVERYTHING ELSE TBC · NO ACCOUNTS · NO URGENCY · JUST SHIRTS · BTOWN BRIEF MERCH · TEES $20 · PREMIUM $25 · EVERYTHING ELSE TBC</span></div>
        <header class="hdr"><a class="wm" href="#/p/oaka/home">BTown Brief<small>MERCH · BURLINGTON, VT</small></a><div class="util"><a href="#/p/oaka/bag">BAG (${bagCount(pk)})</a></div></header><a class="back" href="#/p/oaka/home">&lt; ALL DESIGNS</a>
        <section class="pp"><div><div class="pimg">${pimg(pk)}</div>${vtoggle(pk)}</div>
          <div class="pinfo"><h1>${esc(d.name)}</h1><p class="idea">${esc(d.idea)}</p><p class="price">${pr.num == null ? 'PRICE TO CONFIRM' : esc(pr.text).toUpperCase()}<small>+ SHIPPING, TO BE CONFIRMED · PRINT ABOUT ${Math.min(d.width, PK[sel.product].max)} IN WIDE, APPROXIMATE</small></p>${ladder(pk)}${summary(pk)}${addBtn(pk, 'ADD TO BAG')}</div></section></div>`;
    },
    bag(pk) { return `<div class="proto p-oaka"><header class="hdr"><a class="wm" href="#/p/oaka/home">BTown Brief<small>MERCH · BURLINGTON, VT</small></a></header><div class="bagpage"><h1>Your bag</h1>${bagLines(pk)}<a class="back" href="#/p/oaka/home" style="padding:0">&lt; BACK</a></div></div>`; },
  };

  // ---------- P7 · THE BLEND
  T.mix = {
    home(pk) {
      const hv = byId[14].variants[0];
      const a = DES.slice(0, 12), b = DES.slice(12, 28), c = DES.slice(28);
      const card = d => `<a class="card" href="#/p/mix/d/${d.id}"><div class="ph">${photoCard('mix', d)}</div><span class="num">${String(d.id).padStart(2, '0')}</span><div class="t">${esc(d.name)}</div><div class="i">${esc(d.idea)}</div><div class="p">FROM $20${d.variants.length > 1 ? ' · ' + d.variants.length + ' VERSIONS' : ''}</div></a>`;
      return `<div class="proto p-mix"><div class="ann"><span>TEES $20</span><span>PREMIUM $25</span><span>EVERYTHING ELSE: PRICED SOON</span><span>NO ACCOUNTS, NO COUNTDOWNS</span></div>${hubMast(pk, 'mix')}
        <section class="hero"><img class="photo" src="img/hero.jpg" alt="Sunset over Burlington Harbor"><div class="ht"><div class="eyebrow">Burlington, Vermont · Fall 2026</div><h1 class="D">Things to wear<br>for Burlington</h1><p>Original flat-ink designs from the newsletter. Find one you like, then decide what it goes on.</p><div class="row2"><a class="btn-dark" href="#/p/mix/d/14">See this design</a><span class="pxtag">20 DESIGNS</span><span class="pxtag">57 VERSIONS IN THE FULL SET</span></div></div><p class="credit">Burlington Harbor · Photograph by Steve Davis</p></section>
        <section class="blk"><div class="blkh"><span class="px">[01]</span><h2 class="D">New this month</h2><a class="all" href="#/p/mix/home">All designs</a></div><div class="grid">${a.map(card).join('')}</div></section>
        <section class="blk" style="background:var(--card)"><div class="blkh"><span class="px">[02]</span><h2 class="D">The lake</h2></div><div class="grid">${b.map(card).join('')}</div></section>
        <section class="blk"><div class="blkh"><span class="px">[03]</span><h2 class="D">Marks and lettering</h2></div><div class="grid">${c.map(card).join('')}</div></section>
        <footer class="foot"><span class="px">© 2026 BTOWN BRIEF</span><span>Prototype · nothing is purchasable · prices beyond the tees are open</span></footer></div>`;
    },
    detail(pk, d) {
      const st = S[pk], sel = st.sel, pr = priceOf(sel);
      return `<div class="proto p-mix"><div class="ann"><span>TEES $20</span><span>PREMIUM $25</span><span>EVERYTHING ELSE: PRICED SOON</span></div>${hubMast(pk, 'mix')}<div class="crumb"><a href="#/p/mix/home">All designs</a> › <span class="px">[${String(d.id).padStart(2, '0')}]</span></div>
        <section class="pp"><div><div class="pimg">${pimg(pk)}</div>${vtoggle(pk)}</div>
          <div class="pinfo"><h1 class="D">${esc(d.name)}</h1><p class="idea">${esc(d.idea)}</p><p class="price">${pr.num == null ? 'PRICE TO CONFIRM' : esc(pr.text).toUpperCase()}<br><small>+ SHIPPING, TBC · PRINT ABOUT ${Math.min(d.width, PK[sel.product].max)} IN WIDE, APPROXIMATE</small></p>${ladder(pk)}${summary(pk)}${addBtn(pk)}</div></section></div>`;
    },
    bag(pk) { return `<div class="proto p-mix">${hubMast(pk, 'mix')}<div class="bagpage"><p class="px" style="color:var(--mute)">[BAG]</p><h1 class="D">Your bag</h1>${bagLines(pk)}<a class="btn-dark" href="#/p/mix/home">Keep browsing</a></div></div>`; },
  };

  // ------------------------------------------------------------ router + render
  function parse() {
    const h = location.hash || '#/p/huba/home';
    const m = h.match(/^#\/p\/([a-z]+)(?:\/([a-z]+))?(?:\/(\d+))?/);
    if (!m || !T[m[1]]) return { p: 'huba', view: 'home', id: null };
    return { p: m[1], view: m[2] || 'home', id: m[3] ? +m[3] : null };
  }
  function hdrag(tr) { // mouse drag on desktop; touch swipes natively
    let x0 = null, sl = 0; tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; x0 = e.clientX; sl = tr.scrollLeft; delete tr.dataset.dragged; }); tr.addEventListener('pointermove', e => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 6) { tr.dataset.dragged = '1'; tr.scrollLeft = sl - dx; } }); const end = () => { if (x0 == null) return; x0 = null; const i = Math.round(tr.scrollLeft / tr.clientWidth); tr.scrollTo({ left: i * tr.clientWidth, behavior: smooth() }); setTimeout(() => delete tr.dataset.dragged, 50); }; tr.addEventListener('pointerup', end); tr.addEventListener('pointercancel', end); tr.addEventListener('pointerleave', end);
  }
  // a card's layout position on the page: its (untransformed) offset inside its positioned ancestor, plus where that ancestor sits
  const pageTop = el => { const p = el.offsetParent; return (p ? p.getBoundingClientRect().top + scrollNow() : 0) + el.offsetTop; };
  const scrollNow = () => (render.lockY != null ? render.lockY : window.scrollY); // while a pop-up pins the page, this is where it really was
  function render() {
    const r = parse();
    const sw = document.getElementById('switch');
    if (sw) sw.remove(); // the prototype switcher is retired: the page is the store now
    const stage = document.getElementById('stage');
    let html;
    if (r.view === 'd' && byId[r.id]) { select(r.p, r.id); html = T[r.p].detail(r.p, byId[r.id]); }
    else if (r.view === 'bag') html = T[r.p].bag(r.p);
    else html = T[r.p].home(r.p);
    render.pos = render.pos || {};
    if (render.lastKey) {
      render.pos[render.lastKey] = scrollNow();
      // also remember the first card on screen and where it sat, so the way back does not depend on pixel heights
      render.anchor = render.anchor || {};
      const first = [...stage.querySelectorAll('.p-huba .card')].find(c => c.getBoundingClientRect().bottom > 0);
      render.anchor[render.lastKey] = first ? { href: first.querySelector('.nm').getAttribute('href'), top: pageTop(first) - scrollNow() } : null;
    }
    stage.innerHTML = html;
    try { document.documentElement.lang = 'en'; document.title = r.view === 'd' && byId[r.id] ? `${byId[r.id].name} · BTown Brief Merch` : r.view === 'bag' ? 'Cart · BTown Brief Merch' : 'BTown Brief Merch'; document.documentElement.style.setProperty('--sw', '0px'); } catch (e) {}
    if (r.p === 'huba') { try { reveal(stage); parallax(); if (S.huba.q) applySearch(stage); } catch (e) {} }
    const BG = { hub: S.hub.night ? '#191a18' : '#faf9f5', awge: '#1a1a1a', oak: '#fff', hubo: '#faf9f5', huba: S.huba.night ? '#191a18' : '#faf9f5', oaka: '#fff', mix: '#faf9f5' };
    if (window.__tourStop) { window.__tourStop(); window.__tourStop = null; }
    const ts = stage.querySelector('[data-tscroll]');
    if (ts) {
      const st = S[r.p]; const at = Math.max(0, DES.findIndex(x => x.id === st.tourAt)); const cnt = stage.querySelector('[data-tourcnt]');
      const plays = [...stage.querySelectorAll('.tplay')]; let numTimer = null, deadline = 0;
      const ringAt = i => plays[i] && plays[i].querySelector('.ring');
      const nums = () => { const n = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); plays.forEach(p => { p.querySelector('.tnum').textContent = st.tourAuto ? String(n) : ''; }); };
      const idx = () => Math.min(DES.length - 1, Math.max(0, Math.round(ts.scrollTop / ts.clientHeight)));
      let last = -1, timer = null;
      const stop = () => { clearTimeout(timer); timer = null; clearInterval(numTimer); numTimer = null; nums(); };
      const setBtn = () => { plays.forEach(p => { p.classList.toggle('on', st.tourAuto); p.setAttribute('aria-pressed', String(st.tourAuto)); p.setAttribute('aria-label', st.tourAuto ? 'Pause auto-advance' : 'Auto-advance every 7 seconds'); }); nums(); };
      const arm = () => { // restart the 7 s clock and the draining ring for the design now on screen
        stop(); if (!st.tourAuto) return;
        if (idx() >= DES.length - 1) { st.tourAuto = false; setBtn(); return; }
        const ring = ringAt(idx()); if (ring) { ring.style.animation = 'none'; void ring.getBoundingClientRect(); ring.style.animation = ''; }
        deadline = Date.now() + TOUR_MS; nums(); clearInterval(numTimer); numTimer = setInterval(nums, 200);
        timer = setTimeout(() => ts.scrollBy({ top: ts.clientHeight, behavior: smooth() }), TOUR_MS);
      };
      const nameEl = stage.querySelector('[data-tourname]');
      const upd = () => { const i = idx(); if (i !== last) { last = i; cnt.textContent = `${i + 1} of ${DES.length}`; nameEl.textContent = DES[i].name; arm(); } };
      const pause = () => { if (!st.tourAuto) return; st.tourAuto = false; setBtn(); stop(); };
      ts.__toggle = () => { st.tourAuto = !st.tourAuto; setBtn(); arm(); };
      ts.__pause = pause;
      ts.addEventListener('pointerdown', pause); // a click, a touch, or the start of any swipe on the design stops auto-advance
      window.__tourStop = stop;
      ts.scrollTop = at * ts.clientHeight; upd(); ts.addEventListener('scroll', upd, { passive: true });
      setTimeout(() => ts.focus({ preventScroll: true }), 0);
    }
    const tr = stage.querySelector('[data-vcar]');
    if (tr) {
      const st = S[r.p], d = byId[st.sel.id]; const idx = Math.max(0, d.variants.findIndex(vv => vv.key === st.sel.vkey));
      tr.scrollLeft = idx * tr.clientWidth;
      let t; const sync = () => { const i = Math.min(d.variants.length - 1, Math.max(0, Math.round(tr.scrollLeft / tr.clientWidth))); if (d.variants[i].key !== st.sel.vkey) { st.sel.vkey = d.variants[i].key; st.note = ''; st.noteKind = ''; ensureValid(st); render(); } };
      tr.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(sync, 90); }, { passive: true });
      hdrag(tr);
    }
    // version tracks inside the feed: dots and label follow the swipe
    stage.querySelectorAll('.slide.multi').forEach(sl => {
      const tr = sl.querySelector('[data-htrack]'), dots = [...sl.querySelectorAll('[data-hdots] i')], lab = sl.querySelector('[data-hlab]'), d = DES[+sl.dataset.i];
      const al = sl.querySelector('.harr.l'), ar = sl.querySelector('.harr.r');
      const upd = () => { const k = Math.min(d.variants.length - 1, Math.max(0, Math.round(tr.scrollLeft / tr.clientWidth))); dots.forEach((x, j) => x.classList.toggle('on', j === k)); lab.textContent = `${k > 0 ? '‹ ' : ''}swipe for ${d.variants.length} versions · ${d.variants[k].label}${k < d.variants.length - 1 ? ' ›' : ''}`; al.hidden = k === 0; ar.hidden = k === d.variants.length - 1; };
      tr.addEventListener('scroll', () => { upd(); const t = stage.querySelector('[data-tscroll]'); if (t && t.__pause) t.__pause(); }, { passive: true }); hdrag(tr); upd();
    });
    try {
      // a pop-up pins the page where it is (iOS Safari drops the scroll position under a plain overflow:hidden), and closing it puts the page back
      const open = !!stage.querySelector('.ov'); const b = document.body.style;
      if (open && render.lockY == null) {
        render.lockY = window.scrollY;
        const sbw = window.innerWidth - document.documentElement.clientWidth; // keep the page the same width once the scrollbar goes, so nothing reflows underneath
        b.position = 'fixed'; b.top = -render.lockY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%'; b.overflow = 'hidden'; b.paddingRight = sbw > 0 ? sbw + 'px' : '';
      }
      if (!open && render.lockY != null) { const y = render.lockY; render.lockY = null; b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = ''; b.overflow = ''; b.paddingRight = ''; window.scrollTo(0, y); }
      if (open) { const x = stage.querySelector('.ov .x'); if (x) x.focus({ preventScroll: true }); }
    } catch (e) {}
    document.body.style.background = BG[r.p] || '#141413';
    const trk = stage.querySelector('[data-pages]');
    if (trk) { let x0 = null; trk.addEventListener('pointerdown', e => { x0 = e.clientX; }, { passive: true }); trk.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { const st = S[r.p]; const n = Math.ceil(DES.length / PAGE); st.page = Math.min(n - 1, Math.max(0, (st.page || 0) + (dx < 0 ? 1 : -1))); render(); } }, { passive: true }); }
    const key = r.p + r.view + r.id;
    if (key !== render.lastKey) {
      let saved = r.view === 'home' ? render.pos[key] : null;
      const an = r.view === 'home' && render.anchor && render.anchor[key];
      if (an) { const el = stage.querySelector(`.p-huba .card .nm[href="${an.href}"]`); if (el) saved = Math.max(0, Math.round(pageTop(el.closest('.card')) - an.top)); }
      window.scrollTo(0, saved || 0);
      // then settle: once images and fonts have laid out, put the same card back at the same height
      if (an) { const fix = () => { const e2 = stage.querySelector(`.p-huba .card .nm[href="${an.href}"]`); if (!e2 || render.lockY != null) return; const y = Math.max(0, Math.round(pageTop(e2.closest('.card')) - an.top)); if (Math.abs(y - window.scrollY) > 2) window.scrollTo(0, y); }; setTimeout(fix, 40); setTimeout(fix, 250); setTimeout(fix, 800); }
      // coming back to a spot down the page: everything at or above it is already "seen", so show it at once with no stagger
      if (saved) { rvEls.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.remove('wait'); el.classList.add(el.classList.contains('rvg') ? 'go' : 'in'); el.classList.add('now'); } }); rvEls = rvEls.filter(el => el.classList.contains('wait')); }
    }
    render.lastKey = key;
  }
  window.addEventListener('hashchange', () => { Object.keys(S).forEach(k => { S[k].peek = null; S[k].lb = false; S[k].tour = false; }); render(); });
  document.addEventListener('keydown', e => {
    const ts = document.querySelector('[data-tscroll]');
    if (ts && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) { const dir = (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) ? -1 : 1; ts.scrollBy({ top: dir * ts.clientHeight, behavior: smooth() }); e.preventDefault(); return; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.classList && e.target.classList.contains('vdot')) { const dots = [...e.target.parentElement.querySelectorAll('.vdot')]; const i = dots.indexOf(e.target); const n = dots[(i + (e.key === 'ArrowRight' ? 1 : dots.length - 1)) % dots.length]; if (n) { n.click(); setTimeout(() => { const f = document.querySelector('.vdot.on'); if (f) f.focus({ preventScroll: true }); }, 0); } e.preventDefault(); return; }
    if (e.key !== 'Escape') return; let hit = false; Object.keys(S).forEach(k => { if (S[k].peek || S[k].lb || S[k].tour) { S[k].peek = null; S[k].lb = false; S[k].tour = false; hit = true; } }); if (hit) render(); });
  // ---------- search: name, version labels and chapter, live as you type
  function chapterOf(id) { const s = SECTIONS.find(s => s.ids.includes(id)); return s ? s.t : ''; }
  function applySearch(stage) {
    const st = S.huba; const q = (st.q || '').trim().toLowerCase(); const res = stage.querySelector('#results'); if (!res) return;
    const secs = [...stage.querySelectorAll('.p-huba .sec:not(.results)')], bands = [...stage.querySelectorAll('.p-huba .band')], tw = stage.querySelector('.p-huba .tourwrap');
    const clear = stage.querySelector('.qclear'), hint = stage.querySelector('[data-qhint]');
    if (!q) { res.hidden = true; secs.forEach(s => s.hidden = false); bands.forEach(b => b.hidden = false); if (tw) tw.hidden = false; if (clear) clear.hidden = true; if (hint) hint.textContent = ''; return; }
    const words = q.split(/\s+/).filter(Boolean);
    const hay = d => [d.name, d.catalogName || '', chapterOf(d.id), ...d.variants.map(v => v.label)].join(' ').toLowerCase();
    const hits = DES.filter(d => { const h = hay(d); return words.every(w => h.includes(w)); });
    res.hidden = false; secs.forEach(s => s.hidden = true); bands.forEach(b => b.hidden = true); if (tw) tw.hidden = true; if (clear) clear.hidden = false;
    res.querySelector('[data-qlede]').textContent = hits.length ? `${hits.length} design${hits.length === 1 ? '' : 's'} for “${st.q.trim()}”` : `Nothing called “${st.q.trim()}”. Try a word from the design, or a chapter like “lake” or “maple”.`;
    res.querySelector('#resgrid').innerHTML = hits.map((d, i) => card(d, i)).join('');
    if (hint) hint.textContent = hits.length ? `${hits.length} found` : 'no matches';
  }
  document.getElementById('stage').addEventListener('input', e => { if (e.target.id !== 'q') return; S.huba.q = e.target.value; applySearch(document.getElementById('stage')); });
  document.getElementById('stage').addEventListener('keydown', e => { if (e.target.id === 'q' && e.key === 'Escape') { S.huba.q = ''; e.target.value = ''; applySearch(document.getElementById('stage')); } });
  document.getElementById('stage').addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act, pk = el.dataset.pk;
    if (act === 'pick') { const st = S[pk]; const k = el.dataset.k, v = el.dataset.v; st.sel[k] = v; st.note = ''; st.noteKind = ''; ensureValid(st); render(); const f = document.querySelector(`[data-act="pick"][data-pk="${pk}"][data-k="${k}"][data-v="${v.replace(/"/g, '\\"')}"]`); if (f) f.focus({ preventScroll: true }); }
    else if (act === 'view') { S[pk].view = el.dataset.v; render(); }
    else if (act === 'night') { S[pk].night = !S[pk].night; render(); }
    else if (act === 'add') { const st = S[pk]; if (needsSize(pk)) { st.note = 'Choose a size first.'; st.noteKind = 'warn'; render(); return; } st.bag.push(Object.assign({}, st.sel)); st.note = pk === 'huba' ? 'Saved for later.' : 'Added to your bag.'; st.noteKind = 'ok'; render(); }
    else if (act === 'peek') { e.preventDefault(); S[pk].tour = true; S[pk].tourAt = +el.dataset.id; S[pk].tourAuto = false; render(); }
    else if (act === 'tour') { if (el.classList.contains('ov') && e.target !== el) return; S[pk].tour = !S[pk].tour; S[pk].tourAuto = S[pk].tour && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); if (!S[pk].tour) S[pk].tourAt = null; render(); }
    else if (act === 'hstep') { const tr = el.parentElement.querySelector('[data-htrack]'); tr.scrollBy({ left: (+el.dataset.dir) * tr.clientWidth, behavior: smooth() }); }
    else if (act === 'tplay') { const ts = document.querySelector('[data-tscroll]'); if (ts && ts.__toggle) ts.__toggle(); }
    else if (act === 'tstep') { const ts = document.querySelector('[data-tscroll]'); if (ts) ts.scrollBy({ top: (+el.dataset.dir) * ts.clientHeight, behavior: smooth() }); }
    else if (act === 'vstep') { const tr = el.closest('.vcar').querySelector('[data-vcar]'); tr.scrollBy({ left: (+el.dataset.dir) * tr.clientWidth, behavior: smooth() }); }
    else if (act === 'lbf') { S[pk].lb = 'front'; render(); }
    else if (act === 'lb') { if (el.classList.contains('ov') && e.target !== el) return; const tr = el.closest('[data-vcar]'); if (tr && tr.dataset.dragged) return; e.preventDefault(); S[pk].lb = !S[pk].lb; render(); }
    else if (act === 'random') { e.preventDefault(); const d = DES[Math.floor(Math.random() * DES.length)]; location.hash = `#/p/${pk}/d/${d.id}`; }
    else if (act === 'pageto') { S[pk].page = +el.dataset.page; render(); }
    else if (act === 'page') { const st = S[pk]; const n = Math.ceil(DES.length / PAGE); st.page = Math.min(n - 1, Math.max(0, (st.page || 0) + (+el.dataset.dir))); render(); }
    else if (act === 'rm') { S[pk].bag.splice(+el.dataset.i, 1); render(); }
    else if (act === 'qclear') { S.huba.q = ''; const q = document.getElementById('q'); if (q) { q.value = ''; q.focus(); } applySearch(document.getElementById('stage')); }
    else if (act === 'jump') { e.preventDefault(); const r = parse(); if (r.view !== 'home') { location.hash = `#/p/${r.p || 'hub'}/home`; setTimeout(() => { const t = document.getElementById(el.dataset.t); if (t) t.scrollIntoView({ behavior: smooth() }); }, 60); } else { const t = document.getElementById(el.dataset.t); if (t) t.scrollIntoView({ behavior: smooth() }); } }
  });
  render();
  // warm the cache: once the page is idle, fetch every tile preview in the background, one at a time, so later scrolling finds them already loaded
  const warmTiles = () => {
    const list = DATA.designs.flatMap(d => d.variants.map(v => `prev/${v.key}-480.webp?r=${REL}`));
    let i = 0;
    const next = () => { if (i >= list.length) return; const im = new Image(); im.onload = im.onerror = () => setTimeout(next, 40); im.src = list[i++]; };
    next();
  };
  (window.requestIdleCallback || (f => setTimeout(f, 1200)))(warmTiles);
})();
