/* =====================================================================
   급식대장의 작전 만들기 — 공용 엔진
   좌표: 각 경기장(field)마다 고유 단위를 쓰고, F.m = 1m 당 단위 수
   선(line): 선수 출발점 기준 상대 좌표 pts, 이어 그린 선은 from(상대 좌표)
   ===================================================================== */
const FONT = "'Pretendard GC', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
const DT = 1 / 60;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, f) => a + (b - a) * f;
const lerp2 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const smooth = x => x * x * (3 - 2 * x);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r1 = v => Math.round(v * 10) / 10;

function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i], pts[i - 1]); return L; }
function polyAt(pts, d) {
  if (pts.length < 2) return [...pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = dist(a, b);
    if (d <= L || i === pts.length - 1) { const f = L ? clamp(d / L, 0, 1) : 1; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; }
    d -= L;
  }
  return [...pts[pts.length - 1]];
}
function polyDir(pts, d) {
  const a = polyAt(pts, Math.max(0, d - 1)), b = polyAt(pts, d + 1);
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
  const f = L2 ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - dx * f, p[1] - a[1] - dy * f);
}
function polyDist(p, pts) { let m = Infinity; for (let i = 1; i < pts.length; i++) m = Math.min(m, segDist(p, pts[i - 1], pts[i])); return m; }
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, ix = 0; const a = pts[0], b = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) { const d = segDist(pts[i], a, b); if (d > dmax) { dmax = d; ix = i; } }
  if (dmax > eps) { const l = rdp(pts.slice(0, ix + 1), eps), r = rdp(pts.slice(ix), eps); return l.slice(0, -1).concat(r); }
  return [a, b];
}

/* ---------- 경기장 / 종류 조회 ---------- */
const fieldOf = (sport, key) => sport.fields[key] || sport.fields[sport.defaultField];
const kindOf = (sport, k) => sport.kinds[k];

/* ---------- SVG 조각 ---------- */
function markerDefs(pre, sport, F) {
  return Object.entries(sport.kinds).map(([k, v]) => {
    if (v.marker === 'bar') return `<marker id="${pre}-${k}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M5 0 V10" stroke="${v.color}" stroke-width="3"/></marker>`;
    if (v.marker === 'dot') return `<marker id="${pre}-${k}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><circle cx="5" cy="5" r="4" fill="${v.color}"/></marker>`;
    return `<marker id="${pre}-${k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${v.color}"/></marker>`;
  }).join('');
}

function wavyD(pts, amp, wl) {
  const L = polyLen(pts);
  if (L < wl * 1.2) return 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
  const step = wl / 8, tail = Math.min(wl, L * 0.25);
  let d = '';
  for (let s = 0; s <= L - tail; s += step) {
    const q = polyAt(pts, s), a = polyDir(pts, s), o = Math.sin(s / wl * Math.PI * 2) * amp;
    const x = q[0] - Math.sin(a) * o, y = q[1] + Math.cos(a) * o;
    d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  const e = pts[pts.length - 1];
  return d + ` L${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
}

function linePath(sport, F, p, l, pre, opt = {}) {
  const K = sport.kinds[l.k]; if (!K) return '';
  const f0 = l.from || [0, 0];
  const pts = [f0, ...l.pts].map(q => [p.x + q[0], p.y + q[1]]);
  const w = (K.w || 1) * F.lw;
  const d = K.wavy ? wavyD(pts, F.tok * 0.32, F.tok * 1.3) : 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
  const dash = K.dash ? ` stroke-dasharray="${K.dash.split(' ').map(v => r1(v * F.lw)).join(' ')}"` : '';
  const sel = opt.sel ? `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="${w + F.lw * 2.6}" stroke-linecap="round" stroke-linejoin="round" data-noexport="1"/>` : '';
  const line = `<path d="${d}" fill="none" stroke="${K.color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash} marker-end="url(#${pre}-${l.k})"/>`;
  const delayTag = l.delay && opt.editor ? (() => { const e = pts[0]; return `<text x="${e[0] + F.tok * 0.9}" y="${e[1] - F.tok * 0.9}" font-family="${FONT}" font-size="${F.tok * 0.85}" font-weight="800" fill="${K.color}" stroke="#0b1220" stroke-width="${F.tok * .18}" paint-order="stroke" data-noexport="1">+${l.delay}초</text>`; })() : '';
  if (!opt.editor) return sel + line;
  return `<g data-lid="${l.id}">${sel}${line}<path d="${d}" fill="none" stroke="transparent" stroke-width="${F.tok * 1.5}" pointer-events="stroke" data-noexport="1"/>${delayTag}</g>`;
}

function tokenStyle(sport, p) {
  const st = sport.tokenStyle && sport.tokenStyle(p);
  if (st) return st;
  return p.t === 'A' ? { fill: '#ffffff', stroke: '#2563eb', ink: '#1e3a8a' } : { fill: '#ef4444', stroke: '#ffffff', ink: '#ffffff' };
}

function playerSVG(sport, F, p, o = {}) {
  const r = F.tok, s = tokenStyle(sport, p);
  const lab = String(p.pos || '');
  const fs = r * (lab.length >= 3 ? 0.7 : lab.length === 2 ? 0.86 : 1.05);
  let g = `<g${o.noPos ? '' : ` transform="translate(${r1(p.x)} ${r1(p.y)})"`}${o.editor ? ` data-pid="${p.id}"` : ''}${o.dim ? ' opacity=".35"' : ''}>`;
  if (o.sel) g += `<circle r="${r * 1.55}" fill="none" stroke="#facc15" stroke-width="${r * .18}" stroke-dasharray="${r * .35} ${r * .25}" data-noexport="1"/>`;
  if (o.warn) g += `<circle r="${r * 1.45}" fill="rgba(239,68,68,.25)" stroke="#ef4444" stroke-width="${r * .14}"/>`;
  g += `<circle r="${r}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${r * .2}"${s.dash ? ` stroke-dasharray="${r * .45} ${r * .3}"` : ''}/>`;
  g += `<text y="${r1(fs * 0.36)}" text-anchor="middle" font-family="${FONT}" font-size="${r1(fs)}" font-weight="800" fill="${s.ink}">${esc(lab)}</text>`;
  const nm = String(p.name || '').trim().slice(0, 6);
  if (nm && o.names !== false) g += `<text y="${r1(r * 2.15)}" text-anchor="middle" font-family="${FONT}" font-size="${r1(r * .78)}" font-weight="800" fill="#ffffff" stroke="#0b1220" stroke-width="${r1(r * .22)}" paint-order="stroke">${esc(nm)}</text>`;
  if (o.ball) g += `<g transform="translate(${r1(r * .95)} ${r1(-r * .8)})">${ballSVG(sport, F, 0.8)}</g>`;
  return g + '</g>';
}

function zoneSVG(z, editor) {
  const c = z.t === 'A' ? ['rgba(59,130,246,.16)', '#60a5fa'] : ['rgba(239,68,68,.16)', '#f87171'];
  return `<ellipse${editor ? ` data-zid="${z.id}"` : ''} cx="${r1(z.cx)}" cy="${r1(z.cy)}" rx="${r1(z.rx)}" ry="${r1(z.ry)}" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>`;
}

/* 종목별 공 모양 (반지름 F.ball 기준, 원점 중심) */
function ballSVG(sport, F, k = 1) {
  const R = F.ball * k, t = sport.ball;
  const s = v => r1(v * R);
  if (t === 'basketball') return `<circle r="${s(1)}" fill="#ea7a1f" stroke="#7c2d12" stroke-width="${s(.12)}"/><path d="M${s(-1)} 0 H${s(1)} M0 ${s(-1)} V${s(1)} M${s(-.7)} ${s(-.7)} Q0 0 ${s(-.7)} ${s(.7)} M${s(.7)} ${s(-.7)} Q0 0 ${s(.7)} ${s(.7)}" fill="none" stroke="#7c2d12" stroke-width="${s(.1)}"/>`;
  if (t === 'football') return `<ellipse rx="${s(1.25)}" ry="${s(.78)}" fill="#9a3412" stroke="#ffffff" stroke-width="${s(.16)}"/><path d="M${s(-.5)} 0 H${s(.5)} M${s(-.25)} ${s(-.22)} V${s(.22)} M0 ${s(-.22)} V${s(.22)} M${s(.25)} ${s(-.22)} V${s(.22)}" stroke="#fff" stroke-width="${s(.11)}"/>`;
  if (t === 'disc') return `<ellipse rx="${s(1.3)}" ry="${s(.55)}" fill="#f8fafc" stroke="#0ea5e9" stroke-width="${s(.18)}"/><ellipse rx="${s(.75)}" ry="${s(.28)}" fill="none" stroke="#0ea5e9" stroke-width="${s(.1)}"/>`;
  if (t === 'volleyball') return `<circle r="${s(1)}" fill="#fde047" stroke="#1d4ed8" stroke-width="${s(.12)}"/><path d="M${s(-.95)} ${s(.2)} Q0 ${s(-.5)} ${s(.6)} ${s(.78)} M${s(-.3)} ${s(-.95)} Q${s(.2)} 0 ${s(-.4)} ${s(.9)}" fill="none" stroke="#1d4ed8" stroke-width="${s(.14)}"/>`;
  if (t === 'baseball') return `<circle r="${s(1)}" fill="#ffffff" stroke="#94a3b8" stroke-width="${s(.1)}"/><path d="M${s(-.55)} ${s(-.8)} Q${s(-.15)} 0 ${s(-.55)} ${s(.8)} M${s(.55)} ${s(-.8)} Q${s(.15)} 0 ${s(.55)} ${s(.8)}" fill="none" stroke="#dc2626" stroke-width="${s(.12)}"/>`;
  if (t === 'dodgeball') return `<circle r="${s(1)}" fill="#e11d48" stroke="#ffffff" stroke-width="${s(.14)}"/><circle cx="${s(-.3)}" cy="${s(-.35)}" r="${s(.25)}" fill="#ffffff" fill-opacity=".6"/>`;
  if (t === 'shuttle') return `<path d="M${s(-.2)} ${s(-.35)} L${s(-1.3)} ${s(-.9)} Q${s(-1.55)} 0 ${s(-1.3)} ${s(.9)} L${s(-.2)} ${s(.35)} Z" fill="#ffffff" stroke="#64748b" stroke-width="${s(.1)}"/><path d="M${s(-.3)} 0 H${s(-1.35)} M${s(-.3)} ${s(-.2)} L${s(-1.3)} ${s(-.55)} M${s(-.3)} ${s(.2)} L${s(-1.3)} ${s(.55)}" stroke="#94a3b8" stroke-width="${s(.07)}"/><circle cx="${s(.1)}" r="${s(.45)}" fill="#f8fafc" stroke="#16a34a" stroke-width="${s(.14)}"/>`;
  if (t === 'pingpong') return `<circle r="${s(1)}" fill="#ffffff" stroke="#f97316" stroke-width="${s(.18)}"/><circle cx="${s(-.3)}" cy="${s(-.3)}" r="${s(.28)}" fill="#fde68a" fill-opacity=".6"/>`;
  if (t === 'pickle') return `<circle r="${s(1)}" fill="#d9f99d" stroke="#4d7c0f" stroke-width="${s(.12)}"/>${[[-.45, -.4], [.4, -.45], [0, 0], [-.45, .4], [.45, .4]].map(q => `<circle cx="${s(q[0])}" cy="${s(q[1])}" r="${s(.16)}" fill="#4d7c0f"/>`).join('')}`;
  if (t === 'tennis') return `<circle r="${s(1)}" fill="#d9f99d" stroke="#65a30d" stroke-width="${s(.1)}"/><path d="M${s(-.85)} ${s(-.5)} Q0 ${s(-.1)} ${s(-.85)} ${s(.5)} M${s(.85)} ${s(-.5)} Q0 ${s(-.1)} ${s(.85)} ${s(.5)}" fill="none" stroke="#ffffff" stroke-width="${s(.14)}"/>`;
  if (t === 'floorball') return `<circle r="${s(1)}" fill="#f8fafc" stroke="#475569" stroke-width="${s(.12)}"/><circle cx="${s(-.4)}" cy="${s(-.3)}" r="${s(.16)}" fill="#475569"/><circle cx="${s(.35)}" cy="${s(-.35)}" r="${s(.16)}" fill="#475569"/><circle cx="${s(0)}" cy="${s(.2)}" r="${s(.16)}" fill="#475569"/><circle cx="${s(-.35)}" cy="${s(.5)}" r="${s(.14)}" fill="#475569"/><circle cx="${s(.45)}" cy="${s(.45)}" r="${s(.14)}" fill="#475569"/>`;
  if (t === 'kinball') return `<circle r="${s(1)}" fill="#ec4899" stroke="#ffffff" stroke-width="${s(.08)}"/><path d="M${s(-1)} 0 Q0 ${s(-.35)} ${s(1)} 0 M0 ${s(-1)} Q${s(.35)} 0 0 ${s(1)}" fill="none" stroke="#9d174d" stroke-width="${s(.06)}"/><circle cx="${s(-.35)}" cy="${s(-.4)}" r="${s(.22)}" fill="#fff" fill-opacity=".45"/>`;
  if (t === 'rugby') return `<ellipse rx="${s(1.3)}" ry="${s(.8)}" fill="#f8fafc" stroke="#1e3a8a" stroke-width="${s(.14)}"/><path d="M${s(-.6)} ${s(-.55)} Q0 0 ${s(-.6)} ${s(.55)} M${s(.6)} ${s(-.55)} Q0 0 ${s(.6)} ${s(.55)}" fill="none" stroke="#dc2626" stroke-width="${s(.14)}"/>`;
  if (t === 'handball') return `<circle r="${s(1)}" fill="#facc15" stroke="#1e40af" stroke-width="${s(.14)}"/><path d="M${s(-1)} 0 Q0 ${s(-.6)} ${s(1)} 0" fill="none" stroke="#1e40af" stroke-width="${s(.14)}"/>`;
  return `<circle r="${s(1)}" fill="#ffffff" stroke="#111827" stroke-width="${s(.12)}"/><path d="M0 ${s(-.42)} L${s(.4)} ${s(-.13)} L${s(.25)} ${s(.34)} L${s(-.25)} ${s(.34)} L${s(-.4)} ${s(-.13)} Z" fill="#111827"/>`;
}

/* ---------- 정적 그림 (편집기·작전집 카드) ---------- */
function holderOf(play) { const p = play.players.find(x => x.ball); return p ? p.id : null; }

function fieldInner(sport, play, o = {}) {
  const F = fieldOf(sport, play.field), pre = o.prefix || 'f';
  let s = `<defs>${markerDefs(pre, sport, F)}</defs>` + F.draw(o);
  (play.zones || []).forEach(z => s += zoneSVG(z, o.editor));
  if (o.tempZone) s += zoneSVG(o.tempZone, false);
  if (sport.overlay) s += sport.overlay(play, F, play.players, o) || '';
  const byId = Object.fromEntries(play.players.map(p => [p.id, p]));
  (play.lines || []).forEach(l => { const p = byId[l.pid]; if (p) s += linePath(sport, F, p, l, pre, { editor: o.editor, sel: o.selLine === l.id }); });
  if (o.handles) (play.lines || []).forEach(l => {
    const K = sport.kinds[l.k]; if (!K || K.type !== 'move' || !l.pts.length) return;
    const p = byId[l.pid]; if (!p) return; const q = l.pts[l.pts.length - 1];
    s += `<circle data-lend="${l.id}" cx="${r1(p.x + q[0])}" cy="${r1(p.y + q[1])}" r="${r1(F.tok * .5)}" fill="${K.color}" stroke="#ffffff" stroke-width="${r1(F.tok * .14)}" data-noexport="1"/>`;
  });
  if (o.temp) { const p = byId[o.temp.pid]; if (p && o.temp.pts.length) s += linePath(sport, F, p, { k: o.temp.k, pts: o.temp.pts, from: o.temp.from }, pre, {}); }
  const warn = sport.warnings ? sport.warnings(play, F) : {};
  [...play.players].sort((a, b) => (a.t === 'B' ? 0 : 1) - (b.t === 'B' ? 0 : 1)).forEach(p => s += playerSVG(sport, F, p, { editor: o.editor, sel: o.sel === p.id, ball: p.ball, warn: warn[p.id], names: o.names }));
  return s;
}

/* =====================================================================
   시뮬레이션: 1/60초 단위로 선수·공을 움직여 프레임과 사건(콜)을 기록
   ===================================================================== */
function simulate(sport, play) {
  const F = fieldOf(sport, play.field), M = F.m, KS = sport.kinds;
  const P = play.players.map(p => ({ ...p }));
  const n = P.length, idx = {}; P.forEach((p, i) => idx[p.id] = i);
  const tol = F.tok * 0.7;
  const near = (a, b, r = tol) => dist(a, b) <= r;
  const lines = (play.lines || []).filter(l => idx[l.pid] !== undefined && l.pts && l.pts.length && KS[l.k]);
  const R = sport.rules || {};
  const catchR = (sport.catchR || 1.4) * M, homeR = (sport.homeR || 2.6) * M;
  const holdMin = sport.holdMin ?? 0.3;

  /* 선수별 이동 구간(leg) */
  const legs = P.map(() => []);
  const mkLeg = (p, l, rel) => { const pts = rel.map(q => [p.x + q[0], p.y + q[1]]); return { l, k: l.k, K: KS[l.k], pts, len: polyLen(pts), endRel: rel[rel.length - 1], delay: +l.delay || 0 }; };
  P.forEach((p, i) => {
    const mine = lines.filter(l => l.pid === p.id && KS[l.k].type === 'move');
    const used = new Set(); let cur = [0, 0];
    for (;;) {
      const c = mine.filter(l => !used.has(l) && near(l.from || [0, 0], cur)).sort((a, b) => (KS[b.k].preSnap ? 1 : 0) - (KS[a.k].preSnap ? 1 : 0))[0];
      if (!c) break;
      used.add(c); legs[i].push(mkLeg(p, c, [c.from || [0, 0], ...c.pts])); cur = c.pts[c.pts.length - 1];
    }
    mine.filter(l => !used.has(l)).forEach(l => { legs[i].push(mkLeg(p, l, [cur, l.from || [0, 0], ...l.pts])); cur = l.pts[l.pts.length - 1]; });
  });

  /* 공 동작(패스·슛·서브…) */
  const acts = P.map(() => []);
  lines.filter(l => KS[l.k].type === 'ball').forEach((l, order) => {
    const i = idx[l.pid], p = P[i], anc = l.from || [0, 0];
    let anchorLeg = -1;
    if (l.from) legs[i].forEach((g, j) => { if (anchorLeg < 0 && near(g.endRel, anc)) anchorLeg = j; });
    acts[i].push({ id: l.id, l, k: l.k, K: KS[l.k], anchorLeg, ptsAbs: l.pts.map(q => [p.x + q[0], p.y + q[1]]), order, delay: +l.delay || 0, done: false, readyAt: null });
  });

  let holder = P.findIndex(p => p.ball);
  if (holder < 0) { const all = acts.flat().sort((a, b) => a.order - b.order); const f = all.find(a => a.anchorLeg < 0) || all[0]; if (f) holder = idx[f.l.pid]; }

  /* 스냅 시점 (모션은 스냅 전에 움직여요) */
  let pre = 0;
  legs.forEach(L => { if (L[0] && L[0].K.preSnap) pre = Math.max(pre, L[0].len / (L[0].K.speed * M)); });
  const snapT = pre > 0 ? pre + 0.4 : (sport.snapT ?? 0.35);
  const firstAt = sport.snapOnHit ? (sport.read ?? 0.8) : snapT + (sport.read ?? 0.55);

  const pos = P.map(p => [p.x, p.y]);
  const st = P.map(() => ({ li: 0, cur: null, done: 0, readyAt: null, waitT0: null, blockedUntil: 0, out: false, stop: false, alpha: 1, travelSaid: false }));
  const ball = { holder, gotAt: 0, flight: null, rest: null, dead: false, firstRelease: null, team: holder >= 0 ? P[holder].t : null, touches: 0, passes: 0, last: null };
  const ev = [], frames = [], screens = [];
  const ctx = {
    sport, F, M, P, pos, st, ball, legs, acts, ev, idx, t: 0, catchR, homeR, snapT,
    call(txt, at, o = {}) { const last = ev[ev.length - 1]; if (last && last.txt === txt && ctx.t - last.t < 0.5) return; ev.push({ t: ctx.t, txt, x: at ? at[0] : null, y: at ? at[1] : null, ...o }); },
    big(txt, o = {}) { ev.push({ t: ctx.t, txt, big: true, ...o }); },
    give(j, why) { ball.holder = j; ball.gotAt = ctx.t; ball.rest = null; ball.flight = null; ball.team = P[j].t; },
    nearest(at, r, filt) { let b = -1, bd = r; P.forEach((p, j) => { if (st[j].out || (filt && !filt(j))) return; const d = dist(pos[j], at); if (d <= bd) { bd = d; b = j; } }); return b; },
    snapped(t) { return sport.snapOnHit ? (ball.firstRelease !== null && t >= ball.firstRelease) : t >= snapT; },
    kill() { ball.dead = true; },
    setOut(j) { st[j].out = true; },
    addScreen(i) { screens.push({ i, at: [...pos[i]], team: P[i].t, hit: new Set() }); }
  };

  /* 자동 타이밍: 받을 동료가 공이 떨어지는 곳에 맞춰 도착할 때 던져요 (직접 그린 선, 지연을 정하지 않은 경우) */
  function autoReady(a, h) {
    if (!a.l.auto || a.delay || a.K.shot || a.K.noAuto) return true;
    if (a.waitT0 === undefined) a.waitT0 = ctx.t;
    if (ctx.t - a.waitT0 > 3.5) return true;
    const tgt = a.ptsAbs[a.ptsAbs.length - 1];
    /* 받을 사람: 선 끝(또는 선 경로)이 목표 지점 가까이 지나가는 동료 */
    let best = -1, bestRem = 0, bd = Math.max(homeR * 1.6, F.tok * 3);
    P.forEach((p, j) => {
      if (j === h || st[j].out || (p.t !== P[h].t && !a.K.cross)) return;
      if (dist(pos[j], tgt) < bd) { bd = dist(pos[j], tgt); best = j; bestRem = 0; }
      const S = st[j]; let rem = 0, from = pos[j];
      for (let li = S.li; li < legs[j].length; li++) {
        const g = legs[j][li];
        const left = S.cur && S.cur.g === g ? Math.max(0, g.len - S.cur.d) : g.len;
        const end = g.pts[g.pts.length - 1];
        rem += left / (g.K.speed * M) + (S.cur && S.cur.g === g ? 0 : g.delay);
        const d = dist(end, tgt);
        if (d < bd) { bd = d; best = j; bestRem = rem; }
        from = end;
      }
    });
    if (best < 0) return true;
    const len = dist(pos[h], tgt), fly = (a.K.base ?? 0.15) + len / (a.K.speed * M);
    return bestRem <= fly + 0.12;
  }
  function release(a, h) {
    const t = ctx.t, from = [...pos[h]];
    const pts = [from, ...a.ptsAbs.map(q => [...q])];
    let goal = null;
    if (a.K.shot && sport.goalTarget) { goal = sport.goalTarget(ctx, P[h], pts[pts.length - 1]); if (goal) pts[pts.length - 1] = goal.pt; }
    if (a.K.aim) { /* 공격 던지기: 끝점 가까운 상대에게 조준 고정 */
      const j = ctx.nearest(pts[pts.length - 1], homeR, x => P[x].t !== P[h].t);
      if (j >= 0) pts[pts.length - 1] = [...pos[j]];
    }
    const len = Math.max(1, polyLen(pts));
    const dur = (a.K.base ?? 0.15) + len / (a.K.speed * M);
    const f = { a, K: a.K, k: a.k, h, team: P[h].t, t0: t, dur, pts, drawnEnd: [...pts[pts.length - 1]], len, arc: (a.K.arc || 0) * len + (a.K.arcMin || 0) * M, snap: pos.map(q => [...q]), recv: -1, goal };
    ball.flight = f; ball.holder = -1; ball.rest = null; a.done = true; ball.last = f;
    if (ball.firstRelease === null) ball.firstRelease = t;
    if (R.release) R.release(ctx, f);
  }

  function arrive(f) {
    const end = [...f.pts[f.pts.length - 1]];
    ball.flight = null;
    if (R.arrive && R.arrive(ctx, f, end)) return;
    if (f.K.shot) {
      if (f.goal) {
        const keep = ctx.nearest(end, (sport.saveR || 1.2) * M, j => P[j].t !== f.team);
        if (keep >= 0) { ctx.give(keep); ctx.call('막았다!', pos[keep], { color: '#38bdf8' }); return; }
        ball.rest = end; ctx.kill(); ctx.big(sport.goalWord || '골!', { color: '#facc15' }); if (R.score) R.score(ctx, f); return;
      }
      ball.rest = end; ctx.kill(); ctx.call('빗나갔어요', end); return;
    }
    let r = ctx.nearest(end, catchR, j => P[j].t === f.team && j !== f.h);
    let inter = false;
    if (r < 0 && !sport.noIntercept) { r = ctx.nearest(end, catchR, j => P[j].t !== f.team); inter = r >= 0; }
    if (r >= 0) {
      ctx.give(r);
      if (R.catch && R.catch(ctx, f, r, inter)) return;
      if (inter) ctx.call(sport.interWord || '가로채기!', pos[r], { color: '#f87171' });
      else if (f.K.callCatch !== false) ctx.call(sport.catchWord || '캐치!', pos[r]);
      return;
    }
    ball.rest = end;
    if (R.land && R.land(ctx, f, end)) return;
    if (!sport.loose) { ctx.kill(); ctx.call(sport.missWord || '패스 실패', end, { color: '#f87171' }); }
  }

  let lastActive = 0, t = 0;
  const MAX = 40 / DT;
  for (let s = 0; s < MAX; s++) {
    t = s * DT; ctx.t = t; let active = false;

    /* 1) 공을 가진 선수의 다음 동작 */
    if (ball.holder >= 0 && !ball.flight && !ball.dead) {
      const h = ball.holder, A = acts[h].filter(a => !a.done).sort((a, b) => a.order - b.order);
      for (const a of A) {
        if (!(a.anchorLeg < 0 || st[h].done > a.anchorLeg)) continue;
        if (st[h].cur && a.anchorLeg >= 0 && st[h].cur.g !== legs[h][a.anchorLeg]) { /* 이미 다음 구간 진행 중이면 바로 */ }
        const base = Math.max(ball.gotAt + holdMin, firstAt);
        if (a.readyAt === null) a.readyAt = Math.max(t, base);
        active = true;
        if (t >= Math.max(base, a.readyAt) + a.delay && autoReady(a, h)) release(a, h);
        break;
      }
    }

    /* 2) 날아가는 공 */
    if (ball.flight) {
      active = true;
      const f = ball.flight, u = clamp((t - f.t0) / f.dur, 0, 1);
      if (!f.K.shot && !f.K.aim && !f.K.noHome) {
        const team = f.K.cross ? (x => P[x].t !== f.team) : (x => P[x].t === f.team && x !== f.h);
        const hr = f.K.cross ? catchR * 1.15 : homeR;
        const j = ctx.nearest(f.drawnEnd, hr, team);
        const o = f.K.cross ? -1 : ctx.nearest(f.drawnEnd, j >= 0 ? dist(pos[j], f.drawnEnd) : 0, x => P[x].t !== f.team);
        if (j >= 0 && o < 0) { const w = smooth(clamp((u - 0.15) / 0.85, 0, 1)); f.pts[f.pts.length - 1] = lerp2(f.drawnEnd, pos[j], w); f.len = polyLen(f.pts); f.recv = j; }
      }
      if (R.flight) R.flight(ctx, f, u);
      if (ball.flight === f && u >= 1) arrive(f);
    }

    /* 3) 바닥에 있는 공 줍기 */
    if (!ball.dead && !ball.flight && ball.holder < 0 && ball.rest && sport.loose) {
      const j = ctx.nearest(ball.rest, catchR, x => !sport.canPick || sport.canPick(P[x], ctx));
      if (j >= 0) { ctx.give(j); ctx.call(sport.pickWord || '잡았다!', pos[j]); if (R.pick) R.pick(ctx, j); }
    }

    /* 4) 선수 이동 */
    for (let i = 0; i < n; i++) {
      const S = st[i]; if (S.out || S.stop) continue;
      if (S.cur) {
        active = true;
        if (t < S.blockedUntil) continue;
        const g = S.cur.g;
        const v = g.K.speed * M * Math.min(1, 0.35 + (t - S.cur.t0) / 0.35) * (sport.speedK || 1);
        S.cur.d += v * DT;
        const d = Math.min(S.cur.d, g.len); pos[i] = polyAt(g.pts, d);
        if (screens.length) screens.forEach(sc => {
          if (sc.team === P[i].t || sc.hit.has(i) || sc.i === i) return;
          if (dist(pos[i], sc.at) < F.tok * 2.3) { sc.hit.add(i); S.blockedUntil = t + 0.85; ctx.call('스크린에 걸렸어요!', pos[i], { color: '#34d399' }); }
        });
        if (d >= g.len) { S.cur = null; S.done++; S.li++; if (g.K.screen) { ctx.addScreen(i); ctx.call('스크린!', pos[i], { color: '#34d399' }); } if (R.legEnd) R.legEnd(ctx, i, g); }
      } else if (S.li < legs[i].length) {
        const g = legs[i][S.li];
        let ok = true;
        const preSnap = g.K.preSnap && S.li === 0;
        if (!preSnap && !ctx.snapped(t)) { ok = false; active = true; }
        if (ok && g.K.withBall && ball.holder !== i) { ok = false; if (!ball.dead) active = true; }
        if (ok && ball.holder === i && !g.K.withBall && !sport.carryOnRun) {
          ok = false;
          if (!S.travelSaid && sport.travelWord && !acts[i].some(a => !a.done)) { S.travelSaid = true; ctx.call(sport.travelWord, pos[i], { color: '#fbbf24' }); }
          if (acts[i].some(a => !a.done)) active = true;
        }
        if (ok) {
          const pend = acts[i].find(a => !a.done && (a.anchorLeg === S.done - 1 || (a.anchorLeg < 0 && S.done === 0)));
          if (pend && !ball.dead) {
            if (S.waitT0 === null) S.waitT0 = t;
            if (ball.holder === i || t - S.waitT0 < 4) { ok = false; active = true; }
          }
        }
        if (ok) {
          if (S.readyAt === null) S.readyAt = t;
          active = true;
          if (t >= S.readyAt + g.delay) { S.cur = { g, d: 0, t0: t }; S.readyAt = null; S.waitT0 = null; }
        }
      }
    }

    if (R.step && R.step(ctx)) active = true;

    /* 5) 프레임 기록 */
    let b = null;
    if (ball.flight) {
      const f = ball.flight, u = clamp((t - f.t0) / f.dur, 0, 1);
      const e = f.K.ease === 'roll' ? 1 - Math.pow(1 - u, 1.6) : u;
      const q = polyAt(f.pts, f.len * e);
      b = { x: q[0], y: q[1], h: f.arc * 4 * u * (1 - u), fl: 1, ang: polyDir(f.pts, f.len * e), spin: f.K.spin || 0 };
    } else if (ball.holder >= 0) {
      const g = st[ball.holder].cur, dr = g && g.g.K.wavy;
      b = { x: pos[ball.holder][0], y: pos[ball.holder][1], hold: ball.holder, dr: dr ? 1 : 0 };
    } else if (ball.rest) b = { x: ball.rest[0], y: ball.rest[1], rest: 1 };
    frames.push({ p: pos.map(q => [q[0], q[1]]), a: st.map(S => S.out ? 0.28 : 1), b });

    if (active) lastActive = t;
    if (s > 30 && t - lastActive > 0.9) break;
  }
  const lastEv = ev.length ? ev[ev.length - 1].t + (ev[ev.length - 1].big ? 1.6 : 0.9) : 0;
  const dur = Math.max(t, lastEv) + 0.25;
  while (frames.length * DT < dur) frames.push(frames[frames.length - 1]);
  return { dur, frames, ev, snapT, holder, P };
}

/* =====================================================================
   재생 화면: 시간 t를 주면 그 순간을 그려요 (되감기·건너뛰기 가능)
   ===================================================================== */
function mountPlayback(svg, sport, play, o = {}) {
  const F = fieldOf(sport, play.field), pre = o.prefix || 'pv';
  const sim = simulate(sport, play);
  svg.setAttribute('viewBox', F.vb);
  const byId = Object.fromEntries(play.players.map(p => [p.id, p]));
  let s = `<defs>${markerDefs(pre, sport, F)}</defs>` + F.draw({});
  (play.zones || []).forEach(z => s += zoneSVG(z, false));
  s += `<g data-ov></g>`;
  s += `<g opacity=".3">` + (play.lines || []).map(l => byId[l.pid] ? linePath(sport, F, byId[l.pid], l, pre, {}) : '').join('') + `</g>`;
  s += play.players.map((p, i) => [p, i]).sort((a, b) => (a[0].t === 'B' ? 0 : 1) - (b[0].t === 'B' ? 0 : 1)).map(([p, i]) => `<g data-ap="${i}">${playerSVG(sport, F, { ...p }, { noPos: true, names: o.names })}</g>`).join('');
  s += `<g data-ball style="display:none"><ellipse data-bsh rx="${r1(F.ball * 1.1)}" ry="${r1(F.ball * .5)}" fill="#000" fill-opacity=".32"/><g data-bb>${ballSVG(sport, F, 1)}</g></g>`;
  s += `<g data-calls></g><g data-banner></g>`;
  svg.innerHTML = s;
  const Q = q => svg.querySelector(q);
  const gs = play.players.map((p, i) => Q(`[data-ap="${i}"]`));
  const gBall = Q('[data-ball]'), gSh = Q('[data-bsh]'), gB = Q('[data-bb]'), gCalls = Q('[data-calls]'), gBan = Q('[data-banner]'), gOv = Q('[data-ov]');
  const [vx, vy, vw, vh] = F.vb.split(' ').map(Number);
  function set(t) {
    t = clamp(t, 0, sim.dur);
    const fi = Math.min(sim.frames.length - 1, Math.floor(t / DT)), fr = sim.frames[fi], nx = sim.frames[Math.min(sim.frames.length - 1, fi + 1)], w = t / DT - fi;
    fr.p.forEach((q, i) => {
      const x = lerp(q[0], nx.p[i][0], w), y = lerp(q[1], nx.p[i][1], w);
      gs[i].setAttribute('transform', `translate(${r1(x)} ${r1(y)})`);
      gs[i].setAttribute('opacity', fr.a[i]);
    });
    if (sport.liveOverlay) gOv.innerHTML = sport.liveOverlay(play, F, fr.p.map((q, i) => ({ ...play.players[i], x: q[0], y: q[1], out: fr.a[i] < 1 })), t) || '';
    const b = fr.b;
    if (!b) gBall.style.display = 'none';
    else {
      gBall.style.display = '';
      if (b.fl) {
        const sc = 1 + Math.min(.7, b.h / (F.tok * 6)) ;
        gSh.style.display = ''; gSh.setAttribute('transform', `translate(${r1(b.x)} ${r1(b.y)})`);
        const rot = sport.ball === 'disc' ? 0 : b.ang * 180 / Math.PI;
        const sq = sport.ball === 'football' ? 1 : 1;
        gB.setAttribute('transform', `translate(${r1(b.x)} ${r1(b.y - b.h)}) rotate(${r1(rot)}) scale(${r1(sc * 100) / 100} ${r1(sc * sq * 100) / 100})`);
      } else if (b.hold !== undefined) {
        gSh.style.display = 'none';
        const bx = b.x + F.tok * .95, by = b.y - F.tok * .55 + (b.dr ? Math.abs(Math.sin(t * 9)) * F.tok * .9 : 0);
        gB.setAttribute('transform', `translate(${r1(bx)} ${r1(by)}) scale(.9)`);
      } else { gSh.style.display = 'none'; gB.setAttribute('transform', `translate(${r1(b.x)} ${r1(b.y)})`); }
    }
    /* 콜(말풍선 글자) */
    let ch = '';
    sim.ev.forEach(e => {
      if (e.big) return;
      const age = t - e.t; if (age < 0 || age > 1.15) return;
      const op = age < .12 ? age / .12 : 1 - Math.max(0, (age - .75) / .4);
      const x = e.x ?? (vx + vw / 2), y = (e.y ?? (vy + vh / 2)) - F.tok * (2.1 + age * .9);
      const fs = F.tok * 1.15 * (1 + Math.max(0, .25 - age) * 1.2);
      const hw = Math.min(vw / 2 - 2, textEm(e.txt) * fs / 2 + fs * .2);
      ch += `<text x="${r1(clamp(x, vx + hw, vx + vw - hw))}" y="${r1(Math.max(vy + fs, y))}" text-anchor="middle" font-family="${FONT}" font-size="${r1(fs)}" font-weight="900" fill="${e.color || '#fde047'}" stroke="#0b1220" stroke-width="${r1(fs * .22)}" paint-order="stroke" opacity="${r1(op * 100) / 100}">${esc(e.txt)}</text>`;
    });
    gCalls.innerHTML = ch;
    const bigE = sim.ev.filter(e => e.big && t >= e.t && t - e.t < 1.8).pop();
    if (bigE) {
      const age = t - bigE.t, op = Math.min(1, age / .15, (1.8 - age) / .35), pop = 1 + Math.max(0, .3 - age) * .5;
      const col = bigE.color || '#facc15', maxW = vw * .9;
      let fs = Math.min(vw, vh) * 0.1, lines = [String(bigE.txt)];
      const fit = () => Math.max(...lines.map(textEm)) * fs + fs * 1.4 <= maxW;
      if (!fit()) lines = splitBanner(lines[0]);
      while (!fit() && fs > Math.min(vw, vh) * .045) fs *= .94;
      const lh = fs * 1.22, tw = Math.min(maxW, Math.max(...lines.map(textEm)) * fs + fs * 1.4), th = lh * lines.length + fs * .55;
      const cx = vx + vw / 2, cy = vy + Math.max(vh * .2, th / 2 + vh * .04), sc = Math.min(pop, (vw * .97) / tw);
      const tl = lines.map((ln, i) => { const w = textEm(ln) * fs, lim = tw - fs * 1.1; return `<text y="${r1((i - (lines.length - 1) / 2) * lh + fs * .36)}" text-anchor="middle" font-family="${FONT}" font-size="${r1(fs)}" font-weight="900" fill="${col}"${w > lim ? ` textLength="${r1(lim)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(ln)}</text>`; }).join('');
      gBan.innerHTML = `<g opacity="${r1(op * 100) / 100}" transform="translate(${r1(cx)} ${r1(cy)}) scale(${r1(sc * 100) / 100})"><rect x="${r1(-tw / 2)}" y="${r1(-th / 2)}" width="${r1(tw)}" height="${r1(th)}" rx="${r1(Math.min(th / 2, fs * .45))}" fill="#0b1220" fill-opacity=".8" stroke="${col}" stroke-width="${r1(fs * .06)}"/>${tl}</g>`;
    } else gBan.innerHTML = '';
  }
  set(0);
  return { dur: sim.dur, set, sim };
}

/* 글자 폭 어림잡기 (em): 한글·전각 1, 영문·숫자 0.6, 공백 0.3 */
function textEm(str) { let w = 0; for (const c of String(str)) { const k = c.codePointAt(0); w += c === ' ' ? .3 : k > 0x2e7f ? .88 : /[A-Z0-9]/.test(c) ? .64 : .55; } return w; }
/* 긴 배너는 괄호나 가운데 띄어쓰기에서 두 줄로 */
function splitBanner(t) {
  const i = t.indexOf(' (');
  if (i > 0) return [t.slice(0, i), t.slice(i + 1)];
  const sp = [...t.matchAll(/ /g)].map(m => m.index); if (!sp.length) return [t];
  const mid = t.length / 2, j = sp.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
  return [t.slice(0, j), t.slice(j + 1)];
}

/* 재생 시계: 재생/일시정지/속도/되감기 */
function makeClock(onTick, onEnd) {
  let t = 0, dur = 0, rate = 1, playing = false, raf = 0, last = 0;
  function loop(now) {
    if (!playing) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    t += dt * rate;
    if (t >= dur) { t = dur; playing = false; onTick(t); onEnd && onEnd(); return; }
    onTick(t); raf = requestAnimationFrame(loop);
  }
  return {
    load(d) { dur = d; t = 0; },
    play() { if (playing) return; if (t >= dur) t = 0; playing = true; last = performance.now(); raf = requestAnimationFrame(loop); },
    pause() { playing = false; cancelAnimationFrame(raf); },
    seek(v) { t = clamp(v, 0, dur); onTick(t); },
    get t() { return t; }, get dur() { return dur; }, get playing() { return playing; },
    set rate(v) { rate = v; }, get rate() { return rate; }
  };
}
