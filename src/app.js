/* =====================================================================
   급식대장의 작전 만들기 — 화면과 조작
   ===================================================================== */
const $ = id => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};
const KEY = { book: 'gc-book-v1', drafts: 'gc-drafts-v1', sport: 'gc-sport-v1', theme: 'gc-theme-v1', rate: 'gc-rate-v1', racket: 'gc-racket-v1' };
const clone = o => JSON.parse(JSON.stringify(o));

let BOOK = store.get(KEY.book, []);
if (!Array.isArray(BOOK)) BOOK = [];
let drafts = store.get(KEY.drafts, {}) || {};
let sport = SPORT[store.get(KEY.sport, 'basketball')] || basketball;
let play = null, F = null;
let hist = [], sel = null, selLine = null, mode = 'draw', kind = 'auto', kindsOpen = false, drag = null, temp = null, tempZone = null, zoneTeam = 'B';
let curPreset = null, pb = null, view = 'make', bookFilter = 'all', playRate = store.get(KEY.rate, 1);
const board = $('board');

/* ---------- 공용 ---------- */
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2600); }
function ask(title, text, yes = '확인') {
  return new Promise(res => {
    $('askTitle').textContent = title; $('askText').textContent = text; $('askYes').textContent = yes; $('ask').hidden = false; $('askYes').focus();
    const done = v => { $('ask').hidden = true; $('askYes').onclick = $('askNo').onclick = null; res(v); };
    $('askYes').onclick = () => done(true); $('askNo').onclick = () => done(false);
  });
}
let _saveT = 0;
function save() { clearTimeout(_saveT); _saveT = setTimeout(() => { drafts[sport.id] = play; store.set(KEY.drafts, drafts); }, 250); }
function saveBook() { store.set(KEY.book, BOOK); $('bookCount').textContent = BOOK.length; }
function snap() { hist.push(JSON.stringify(play)); if (hist.length > 80) hist.shift(); }
const getP = id => play.players.find(p => p.id === id);
const teamName = t => sport.teams[t];

function normalize(pl, sp) {
  pl = pl && typeof pl === 'object' ? pl : {};
  pl.players = Array.isArray(pl.players) ? pl.players : [];
  pl.lines = Array.isArray(pl.lines) ? pl.lines.filter(l => l && Array.isArray(l.pts) && sp.kinds[l.k]) : [];
  pl.zones = Array.isArray(pl.zones) ? pl.zones : [];
  pl.opts = pl.opts || {};
  if (!sp.fields[pl.field]) pl.field = sp.defaultField;
  pl.sport = sp.id;
  if (sp.id === 'dodgeball') pl.players.forEach(p => { if (p.pos === '\uC655') p.pos = '\uB0B4\uC57C'; });
  return pl;
}
/* 예전 버전에 저장된 피구 「왕」을 「내야」로 바꿔요 */
(function () {
  let ch = false;
  BOOK.forEach(it => { if (it.sport === 'dodgeball' && it.data && Array.isArray(it.data.players)) it.data.players.forEach(p => { if (p.pos === '\uC655') { p.pos = '\uB0B4\uC57C'; ch = true; } }); });
  if (ch) store.set(KEY.book, BOOK);
  /* 예전 「핸드볼 → 추크볼 경기장」 작전은 새 추크볼 종목으로 옮겨요 */
  BOOK.forEach(it => { if (it.sport === 'handball' && (it.field === 'tchouk' || (it.data && it.data.field === 'tchouk'))) { it.sport = 'chukball'; it.field = 'court'; if (it.data) { it.data.sport = 'chukball'; it.data.field = 'court'; } ch = true; } });
  if (ch) store.set(KEY.book, BOOK);
  if (drafts.handball && drafts.handball.field === 'tchouk') { if (!drafts.chukball) { drafts.chukball = drafts.handball; drafts.chukball.field = 'court'; drafts.chukball.sport = 'chukball'; } delete drafts.handball; }
  if (drafts.dodgeball && Array.isArray(drafts.dodgeball.players)) drafts.dodgeball.players.forEach(p => { if (p.pos === '\uC655') p.pos = '\uB0B4\uC57C'; });
})();
function defaultPlay(sp, field) {
  if (sp.start && (!field || field === sp.defaultField)) {
    let pl = presetToPlay(sp, sp.presets.find(p => p.id === sp.start[0]));
    pl = presetToPlay(sp, sp.presets.find(p => p.id === sp.start[1]), pl);
    return pl;
  }
  const list = sp.presets.filter(p => (p.field || sp.defaultField) === (field || sp.defaultField));
  return presetToPlay(sp, list[0] || sp.presets[0]);
}

/* ---------- 종목 바꾸기 ---------- */
function setSport(id, opt = {}) {
  stopPlay();
  if (play) { drafts[sport.id] = play; store.set(KEY.drafts, drafts); }
  sport = SPORT[id] || basketball; store.set(KEY.sport, sport.id);
  play = normalize(opt.play || drafts[sport.id] || defaultPlay(sport), sport);
  if (!opt.play && !drafts[sport.id]) curPreset = sport.start ? sport.start[0] : (sport.presets[0] && sport.presets[0].id); else curPreset = null;
  kind = 'auto'; sel = selLine = null; hist = []; mode = 'draw';
  renderAll();
}
function renderAll() {
  F = fieldOf(sport, play.field);
  renderSportBar(); renderFieldSwitch(); renderKinds(); renderSportTools(); renderPresets(); renderRoster(); renderTips();
  if (sport.family) {
    const g = GROUPS[sport.family];
    $('sportBadge').innerHTML = `<select id="subSport" aria-label="종목 고르기">${g.members.map(m => `<option value="${m}"${m === sport.id ? ' selected' : ''}>${SPORT[m].icon} ${SPORT[m].name} 복식</option>`).join('')}</select>`;
    $('sportBadge').classList.add('has-select');
  } else { $('sportBadge').textContent = `${sport.icon} ${sport.name}`; $('sportBadge').classList.remove('has-select'); }
  $('playName').value = $('playName2').value = play.name || ''; $('playDesc').value = play.desc || '';
  $('addAName').textContent = teamName('A'); $('addBName').textContent = teamName('B');
  setMode(mode); renderLinePanel(); draw();
}
const SPORT_COLOR = { basketball: '#f97316', volleyball: '#eab308', teeball: '#ef4444', flag: '#b45309', soccer: '#16a34a', futsal: '#0ea5e9', dodgeball: '#e11d48', ultimate: '#8b5cf6', handball: '#2563eb', netball: '#a855f7', floorball: '#0891b2', kinball: '#ec4899', lacrosse: '#65a30d', rugby: '#1e40af', chukball: '#ea580c', badminton: '#0d9488', tabletennis: '#0d9488', pickleball: '#0d9488', tennis: '#0d9488', racket: '#0d9488' };
const TILE = { soccer: '__T_soccer__', basketball: '__T_basketball__', volleyball: '__T_volleyball__', teeball: '__T_teeball__', ultimate: '__T_ultimate__', flag: '__T_flag__', handball: '__T_handball__', futsal: '__T_futsal__', dodgeball: '__T_dodgeball__', netball: '__T_netball__', floorball: '__T_floorball__', kinball: '__T_kinball__', lacrosse: '__T_lacrosse__', rugby: '__T_rugby__', chukball: '__T_chukball__', racket: '__T_racket__' };
const TILE_BG = __TILEBG__;
const tileSrc = id => TILE[RACKET.includes(id) ? 'racket' : id];
const tileBg = id => TILE_BG[RACKET.includes(id) ? 'racket' : id] || '#fbf3e3';
/* 첫 화면의 묶음 카드: 라켓 스포츠 → 배드민턴 · 탁구 · 피클볼 · 테니스 */
const GROUPS = { racket: { name: '라켓 스포츠', members: RACKET } };
const homeItem = id => {
  const g = GROUPS[id];
  if (g) return { id, name: g.name, n: g.members.reduce((a, m) => a + SPORT[m].presets.length, 0), members: g.members };
  return SPORT[id] ? { id, name: SPORT[id].name, n: SPORT[id].presets.length, members: [id] } : null;
};
const groupOpen = id => { const g = GROUPS[id]; if (!g) return id; const last = store.get(KEY.racket, ''); return g.members.includes(last) ? last : (g.members.includes(sport && sport.id) ? sport.id : g.members[0]); };
const HOME_ORDER = ['flag', 'basketball', 'volleyball', 'teeball', 'soccer', 'ultimate', 'dodgeball', 'netball', 'futsal', 'handball', 'floorball', 'kinball', 'lacrosse', 'rugby', 'chukball', 'racket'];
function renderSportBar() {
  document.documentElement.style.setProperty('--sp', SPORT_COLOR[sport.id] || '#f97316');
  const fam = sport.family ? GROUPS[sport.family] : null;
  $('wsSport').innerHTML = `<img src="${tileSrc(sport.id)}" alt=""><b>${fam ? fam.name : sport.name}</b>`;
  if (fam) store.set(KEY.racket, sport.id);
}
function renderHome() {
  const counts = {}; BOOK.forEach(it => counts[it.sport] = (counts[it.sport] || 0) + 1);
  $('sportGrid').innerHTML = HOME_ORDER.map(homeItem).filter(Boolean).map((s, i) => { const c = s.members.reduce((a, m) => a + (counts[m] || 0), 0); return `<button class="tile" style="--c:${SPORT_COLOR[s.id]};--i:${i}" data-sport="${s.id}">
    <span class="tile-img"><img src="${tileSrc(s.id)}" alt="" loading="lazy"></span>
    <span class="tile-name">${s.name}</span>
    <span class="tile-meta">${s.members.length > 1 ? `${s.members.length}종목 · ` : ''}예시 ${s.n}개${c ? ` · 작전집 ${c}개` : ''}</span></button>`; }).join('');
}
function showHome() {
  stopPlay(); if (typeof closeViewer === 'function') closeViewer();
  $('home').hidden = false; $('workspace').hidden = true; document.body.classList.add('home-mode'); renderHome(); window.scrollTo(0, 0);
}
function openSport(id, v = 'make', filter) {
  id = groupOpen(id);
  if (!play || id !== sport.id) setSport(id);
  $('home').hidden = true; $('workspace').hidden = false; document.body.classList.remove('home-mode');
  if (filter) bookFilter = filter;
  showView(v); window.scrollTo(0, 0);
}
$('sportBadge').addEventListener('change', e => { if (e.target.id === 'subSport' && SPORT[e.target.value]) { setSport(e.target.value); toast(`${sport.name} 복식 작전판으로 바꿨어요`); } });
$('sportGrid').addEventListener('click', e => { const b = e.target.closest('[data-sport]'); if (b) zoomOpen(b); });
$('homeBtn').onclick = showHome;
$('brandHome').onclick = showHome;
$('brandHome').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showHome(); } };

function renderFieldSwitch() {
  const keys = Object.keys(sport.fields);
  $('fieldSwitch').innerHTML = keys.length < 2 ? '' : `<div class="seg" role="group" aria-label="경기장">${keys.map(k => `<button data-field="${k}" class="${k === play.field ? 'on' : ''}">${sport.fields[k].name}</button>`).join('')}</div>`;
}
$('fieldSwitch').addEventListener('click', async e => {
  const b = e.target.closest('[data-field]'); if (!b || b.dataset.field === play.field) return;
  if (play.lines.length && !(await ask('경기장을 바꿀까요?', `「${sport.fields[b.dataset.field].name}」의 첫 예시 작전으로 바뀌어요. 지금 작전판은 되돌리기로 다시 불러올 수 있어요.`, '바꾸기'))) return;
  snap(); stopPlay(); play = normalize(defaultPlay(sport, b.dataset.field), sport); sel = selLine = null; curPreset = null; renderAll();
});

/* ---------- 선 종류 · 도구 ---------- */
function kindSample(K) {
  const dash = K.dash ? ` stroke-dasharray="${K.dash.split(' ').map(v => Math.max(1.5, v * 2.2).toFixed(1)).join(' ')}"` : '';
  const d = K.wavy ? 'M2 7 q2.5 -4 5 0 t5 0 t5 0 t5 0' : 'M2 7 H22';
  const end = K.marker === 'bar' ? '<path d="M24 2 V12" stroke-width="3"/>' : '<path d="M22 3 L29 7 L22 11 Z" fill="currentColor" stroke="none"/>';
  return `<svg width="30" height="14" viewBox="0 0 30 14" aria-hidden="true" style="color:${K.color}"><g stroke="${K.color}" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="${d}"${dash}/>${end}</g></svg>`;
}
function renderKinds() {
  /* 아무것도 고르지 않으면 그린 모양을 보고 알아서 정해요. 같은 칸을 다시 누르면 선택이 풀려요 */
  $('kinds').innerHTML = `<span class="lbl">선 종류</span>` +
    Object.entries(sport.kinds).map(([k, K]) => `<button class="chip${k === kind && mode === 'draw' ? ' on' : ''}" data-kind="${k}" title="${esc(K.hint || '')}">${kindSample(K)}${K.name}</button>`).join('');
}
$('kinds').addEventListener('click', e => {
  const b = e.target.closest('[data-kind]'); if (!b) return;
  kind = kind === b.dataset.kind ? 'auto' : b.dataset.kind; setMode('draw');
});

const HINTS = {
  move: '<b>옮기기</b> 선수를 끌어서 자리를 바꿔요. 선을 누르면 선 종류와 출발 시점을 바꿀 수 있어요.',
  zone: '<b>구역</b> 필드 위를 끌어서 수비(또는 공격)가 맡을 구역을 타원으로 그려요.',
  erase: '<b>지우기</b> 지울 선수, 선, 구역을 눌러요.'
};
function setMode(m) {
  mode = m;
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  const K = sport.kinds[kind];
  $('hint').innerHTML = '💡 <span>' + (m === 'draw' ? (kind === 'auto'
    ? '<b>선수를 누른 채 끌어요.</b> 선 종류를 고르지 않으면 공 가진 선수 → 동료 쪽은 <b>패스</b>, 골대 쪽은 <b>슛</b>, 빈 곳은 <b>드리블</b>, 공 없는 선수는 <b>달리기</b>로 정해져요. 선수 자리를 바꿀 때는 <b>✋ 옮기기</b>를 눌러요.'
    : `<b>${esc(K.name)}</b> ${esc(K.hint || '')}. 선수(또는 선 끝의 동그라미)를 누른 채로 그어요. (한 번 더 누르면 선택이 풀려요)`) : HINTS[m]) + '</span>';
  $('zoneTeam').hidden = m !== 'zone';
  $('zoneTeam').innerHTML = `<span class="seg"><button data-zt="B" class="${zoneTeam === 'B' ? 'on' : ''}">${esc(teamName('B'))} 구역</button><button data-zt="A" class="${zoneTeam === 'A' ? 'on' : ''}">${esc(teamName('A'))} 구역</button></span>`;
  board.style.cursor = m === 'draw' || m === 'zone' ? 'crosshair' : m === 'erase' ? 'pointer' : 'default';
  renderKinds(); draw();
  if (window.fsRefresh) fsRefresh();
}

/* =====================================================================
   🤖 자동 선 종류: 누가 공을 가졌는지 · 어디로 그었는지를 보고 정해요
   ===================================================================== */
const CROSS_SPORTS = ['volleyball', 'kinball', 'teeball', 'badminton', 'tabletennis', 'pickleball', 'tennis'];
const RK_SHORT = { badminton: 'drop', tabletennis: 'push', pickleball: 'dink', tennis: 'drop' };
const RK_LONG = { badminton: 'clear', tabletennis: 'drive', pickleball: 'drive', tennis: 'stroke' };
function autoMap(sp) {
  const K = sp.kinds, keys = Object.keys(K), has = k => K[k] ? k : null;
  return {
    run: sp.defaultKind, def: has('def') || has('mark') || has('field') || sp.defaultKind,
    carry: keys.find(k => K[k].withBall) || null, shot: keys.find(k => K[k].shot) || null,
    pass: has('pass') || has('throw') || has('hit') || keys.find(k => K[k].type === 'ball')
  };
}
const absEnd = (p, l) => { const q = l.pts[l.pts.length - 1]; return [p.x + q[0], p.y + q[1]]; };
/* 선수들이 지나갈 자리 (처음 자리 + 각 이동 선의 끝) */
function plannedSpots(excl) {
  const out = [];
  play.players.forEach(p => {
    if (p.id === excl) return;
    out.push({ p, at: [p.x, p.y], rel: null });
    play.lines.forEach(l => { if (l.pid !== p.id || sport.kinds[l.k].type !== 'move') return; out.push({ p, at: absEnd(p, l) }); });
  });
  return out;
}
function receiverAt(end, passer, anyTeam) {
  let best = null, bd = F.tok * 2.6;
  plannedSpots(passer.id).forEach(o => { if (!anyTeam && o.p.t !== passer.t) return; const d = dist(o.at, end); if (d < bd) { bd = d; best = o; } });
  return best;
}
/* 이 선수가 지금 공을 가지고 있나? (처음 공 + 받은 횟수 > 던진 횟수) */
function holdsBall(p) {
  const cross = CROSS_SPORTS.includes(sport.id);
  let n = p.ball ? 1 : 0;
  play.lines.forEach(l => {
    if (sport.kinds[l.k].type !== 'ball') return;
    const q = getP(l.pid); if (!q) return;
    if (l.pid === p.id) { n--; return; }
    const r = receiverAt(absEnd(q, l), q, cross); if (r && r.p.id === p.id) n++;
  });
  if (!play.players.some(x => x.ball) && !play.lines.some(l => sport.kinds[l.k].type === 'ball') && p.t === 'A') return true;
  return n > 0;
}
function nearGoal(p, end) {
  if (!sport.goalTarget) return false;
  try {
    const g = sport.goalTarget({ F, M: F.m, P: [], pos: [], st: [] }, p, end);
    if (!g || !g.pt) return false;
    const W = Math.abs(F.bounds[2] - F.bounds[0]);
    return dist(end, g.pt) < Math.max(F.tok * 4, W * .12);
  } catch (e) { return false; }
}
function smartKind(p, S, E, hasBall) {
  const A = autoMap(sport), id = sport.id;
  if (!hasBall) return (p.t === 'B' && !CROSS_SPORTS.includes(id) && sport.kinds[A.def]) ? A.def : A.run;
  const L = dist(S, E);
  if (id === 'teeball') return p.t === 'A' ? (L > 150 ? 'hitF' : 'hitG') : 'throw';
  if (id === 'kinball') return L < 60 ? 'soft' : 'hit';
  if (id === 'volleyball') {
    const net = F.net, cross = (S[0] - net) * (E[0] - net) < 0, [x0, y0, x1, y1] = F.court;
    const out = S[0] < x0 || S[0] > x1 || S[1] < y0 || S[1] > y1;
    if (cross) return out ? 'serve' : Math.abs(S[0] - net) < 30 ? 'spike' : 'pass';
    return Math.abs(E[0] - net) < 30 ? 'toss' : 'pass';
  }
  if (RK_LONG[id]) {
    if (!play.lines.some(l => sport.kinds[l.k].type === 'ball')) return 'serve';
    const half = Math.abs(F.court[2] - F.court[0]) / 2, nearNet = Math.abs(S[0] - F.net) < half * .3;
    if (nearNet && sport.kinds.volley) return 'volley';
    return Math.abs(E[0] - F.net) < half * .32 ? RK_SHORT[id] : RK_LONG[id];
  }
  const r = receiverAt(E, p, false);
  if (r && sport.kinds.handoff && L < 70) return 'handoff';
  if (r) return id === 'ultimate' && L > 170 ? 'huck' : A.pass;
  if (A.shot && nearGoal(p, E)) return A.shot;
  if (id === 'dodgeball') return 'throw';
  if (A.carry) return A.carry;
  return A.pass;
}
$('tools').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode); });
$('zoneTeam').addEventListener('click', e => { const b = e.target.closest('[data-zt]'); if (b) { zoneTeam = b.dataset.zt; setMode('zone'); } });

/* 종목 전용 도구 */
function renderSportTools() {
  const t = sport.tools || [], h = [];
  if (t.includes('rotate')) h.push(`<button class="chip" data-st="rotA">🔄 ${esc(teamName('A'))} 로테이션</button><button class="chip" data-st="rotB">🔄 ${esc(teamName('B'))} 로테이션</button><label class="chk"><input type="checkbox" data-st="zones"${play.opts.zones === false ? '' : ' checked'}> 자리 번호</label>`);
  if (t.includes('runners')) h.push([1, 2, 3].map(b => `<button class="chip${tbRunnerOn(b) ? ' on' : ''}" data-st="run${b}">🏃 ${b}루 주자</button>`).join(''));
  if (t.includes('offside') && (fieldOf(sport, play.field).axis)) h.push(`<label class="chk"><input type="checkbox" data-st="offside"${play.opts.offside ? ' checked' : ''}> 오프사이드 라인 보기</label>`);
  $('sportTools').innerHTML = h.length ? `<span class="lbl">${sport.icon} 종목</span>` + h.join('') : '';
  $('sportTools').hidden = !h.length;
}
function tbRunnerOn(b) { const q = TB_BASES[b]; return play.players.some(p => p.t === 'A' && p.pos === '주자' && dist([p.x, p.y], q) < 30); }
$('sportTools').addEventListener('click', e => {
  const b = e.target.closest('[data-st]'); if (!b) return;
  const k = b.dataset.st;
  if (k === 'rotA' || k === 'rotB') { snap(); vbRotate(play, k === 'rotA' ? 'A' : 'B'); toast('시계 방향으로 한 칸씩 돌았어요'); draw(); renderRoster(); save(); }
  if (k.startsWith('run')) {
    const n = +k.slice(3), q = TB_BASES[n]; snap();
    const ex = play.players.find(p => p.t === 'A' && p.pos === '주자' && dist([p.x, p.y], q) < 30);
    if (ex) { play.players = play.players.filter(p => p !== ex); play.lines = play.lines.filter(l => l.pid !== ex.id); }
    else { const prev = TB_BASES[n - 1], v = [q[0] - prev[0], q[1] - prev[1]], L = Math.hypot(...v); play.players.push({ id: nid(), t: 'A', pos: '주자', name: '', x: q[0] - v[0] / L * 8, y: q[1] - v[1] / L * 8 }); }
    renderSportTools(); renderRoster(); draw(); save();
  }
});
$('sportTools').addEventListener('change', e => {
  const b = e.target.closest('[data-st]'); if (!b) return;
  if (b.dataset.st === 'zones') play.opts.zones = b.checked;
  if (b.dataset.st === 'offside') play.opts.offside = b.checked;
  draw(); save();
});

/* ---------- 예시 작전 ---------- */
let shownPreset = null;
function renderPresets() {
  const groups = {};
  sport.presets.forEach(p => (groups[p.group] = groups[p.group] || []).push(p));
  const multi = Object.keys(sport.fields).length > 1;
  const icon = g => /공격/.test(g) ? '⚡' : /수비/.test(g) ? '🛡️' : /세트/.test(g) ? '🎯' : /대형/.test(g) ? '🧩' : '⭐';
  $('presetNote').textContent = sport.start ? '공격 대형과 수비 대형을 따로 골라 섞을 수 있어요' : '고르면 작전판에 바로 불러와요';
  const pick = sport.presets.find(p => p.id === curPreset);
  $('presetList').innerHTML = `<div class="psel-grid">` + Object.entries(groups).map(([g, ps]) =>
    `<label class="psel"><span class="psel-name">${icon(g)} ${esc(g)} <small>${ps.length}</small></span><select data-pgroup="${esc(g)}" aria-label="${esc(g)} 예시 고르기"><option value="">고르기…</option>${ps.map(p => `<option value="${p.id}"${p.id === curPreset ? ' selected' : ''}>${esc(p.name)}${multi && p.field ? ' · ' + esc(sport.fields[p.field].name) : ''}</option>`).join('')}</select></label>`).join('') + `</div>` +
    (pick ? `<div class="pcur"><b>${esc(pick.name)}</b><span>${esc(pick.desc)}</span>${pick.tip ? `<em>💡 ${esc(pick.tip)}</em>` : ''}</div>` : '');
}
$('presetList').addEventListener('change', async e => {
  const sel2 = e.target.closest('[data-pgroup]'); if (!sel2 || !sel2.value) return;
  const pr = sport.presets.find(p => p.id === sel2.value);
  const side = pr.side && pr.side !== 'both' && (pr.field || sport.defaultField) === play.field;
  if (!side && play.lines.length && !(await ask(`「${pr.name}」을 불러올까요?`, '지금 작전판이 이 예시로 바뀌어요. 되돌리기로 다시 돌아올 수 있어요.', '불러오기'))) { renderPresets(); return; }
  snap(); stopPlay();
  play = normalize(presetToPlay(sport, pr, side ? play : null), sport);
  if (side && pr.side === 'A') { play.name = pr.name; play.desc = pr.desc; }
  curPreset = pr.id; sel = selLine = null;
  renderAll(); save();
  toast(`「${pr.name}」을 불러왔어요. ▶ 작전 보기로 확인해 보세요`);
});

/* ---------- 선수 명단 ---------- */
function ballIcon() { return `<svg viewBox="-1.5 -1.5 3 3" aria-hidden="true">${ballSVG(sport, { ball: 1 }, 1)}</svg>`; }
function renderRoster() {
  const posA = posList(sport, play.field, 'A'), posB = posList(sport, play.field, 'B');
  const ord = p => (p.t === 'A' ? posA : posB).indexOf(p.pos);
  const list = [...play.players].sort((a, b) => (a.t > b.t ? 1 : a.t < b.t ? -1 : 0) || ord(a) - ord(b) || a.x - b.x);
  const row = p => {
    const ps = p.t === 'A' ? posA : posB, opts = (ps.includes(p.pos) ? ps : [p.pos, ...ps]).map(v => `<option value="${esc(v)}"${v === p.pos ? ' selected' : ''}>${esc(v)}${sport.posName && sport.posName[v] && sport.posName[v] !== v ? ' · ' + esc(sport.posName[v]) : ''}</option>`).join('');
    return `<div class="rrow${sel === p.id ? ' on' : ''}" data-row="${p.id}"><select data-pos aria-label="포지션">${opts}</select><input data-name maxlength="6" placeholder="이름" value="${esc(p.name || '')}" aria-label="${esc(p.pos)} 이름"><button class="ball${p.ball ? ' on' : ''}" data-ball title="처음에 공을 가진 선수" aria-label="공 가진 선수로 정하기" aria-pressed="${!!p.ball}">${ballIcon()}</button><button class="del" data-del title="선수 빼기" aria-label="선수 빼기">✕</button></div>`;
  };
  const team = t => { const ps = list.filter(p => p.t === t); return `<div class="rteam"><h4><span class="dot ${t}"></span>${esc(teamName(t))} <small style="color:var(--muted)">${ps.length}명</small></h4>${ps.length ? ps.map(row).join('') : '<div class="empty-row">아래 버튼으로 선수를 더해요.</div>'}</div>`; };
  $('roster').innerHTML = team('A') + team('B');
  $('rosterCount').textContent = `공 아이콘 = 처음에 공을 가진 선수`;
}
const rowP = el => getP(el.closest('[data-row]').dataset.row);
$('roster').addEventListener('focusin', e => { if (!e.target.closest('[data-row]')) return; if (e.target.matches('[data-name]')) snap(); const p = rowP(e.target); if (sel !== p.id) { sel = p.id; markRows(); draw(); } });
$('roster').addEventListener('input', e => { if (!e.target.matches('[data-name]')) return; rowP(e.target).name = e.target.value.trim(); draw(); save(); });
$('roster').addEventListener('change', e => { if (!e.target.matches('[data-pos]')) return; snap(); rowP(e.target).pos = e.target.value; draw(); save(); });
$('roster').addEventListener('click', e => {
  const p = e.target.closest('[data-row]') && rowP(e.target); if (!p) return;
  if (e.target.closest('[data-ball]')) { snap(); const on = !p.ball; play.players.forEach(x => delete x.ball); if (on) p.ball = true; renderRoster(); draw(); save(); }
  if (e.target.closest('[data-del]')) { snap(); removePlayer(p.id); }
});
function markRows() { document.querySelectorAll('.rrow').forEach(r => r.classList.toggle('on', r.dataset.row === sel)); }
function removePlayer(id) { play.players = play.players.filter(p => p.id !== id); play.lines = play.lines.filter(l => l.pid !== id); if (sel === id) sel = null; if (selLine && !play.lines.some(l => l.id === selLine)) selLine = null; renderRoster(); renderLinePanel(); renderSportTools(); draw(); save(); }
function addPlayer(t) {
  if (play.players.length >= (sport.max || 20)) return toast(`이 종목은 ${sport.max}명까지 놓을 수 있어요`);
  snap();
  const [x0, y0, x1, y1] = F.bounds, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0, j = () => (Math.random() - .5) * F.tok * 3;
  let x, y;
  if (F.spawn) [x, y] = F.spawn[t];
  else if (F.flip === 'x' || !F.flip) { x = cx + j(); y = cy + (t === 'A' ? h : -h) * .18; }
  else { x = cx + (t === 'A' ? -w : w) * .18; y = cy + j(); }
  if (sport.id === 'teeball') [x, y] = t === 'A' ? [270, 520] : [300 + j() * 3, 330];
  const ps = posList(sport, play.field, t);
  const used = play.players.filter(p => p.t === t).map(p => p.pos);
  const pos = ps.find(v => !used.includes(v)) || ps[ps.length - 1];
  const p = { id: nid(), t, pos, name: '', x: Math.round(x), y: Math.round(y) };
  play.players.push(p); sel = p.id; renderRoster(); draw(); save(); toast('새 선수예요. 「✋ 옮기기」로 자리를 옮겨요');
}
$('addA').onclick = () => addPlayer('A'); $('addB').onclick = () => addPlayer('B');

$('tipsBtn').onclick = () => { $('tipsModal').hidden = false; $('tipsClose').focus(); };
$('tipsClose').onclick = () => $('tipsModal').hidden = true;
function renderTips() {
  $('tipsTitle').textContent = `${sport.icon} ${sport.name} 포인트`; $('tipsBtnName').textContent = `${sport.name} 포인트`;
  $('tips').innerHTML = sport.tips.map(([t, d]) => `<li><span><b>${esc(t)}</b>${esc(d)}</span></li>`).join('');
}

/* ---------- 선택한 선 ---------- */
const DELAYS = [0, .5, 1, 1.5, 2, 3];
function renderLinePanel() {
  const l = selLine && play.lines.find(x => x.id === selLine);
  $('linePanel').hidden = !l;
  if (!l) return;
  const p = getP(l.pid), K = sport.kinds[l.k];
  $('lineWho').textContent = `${p ? p.pos + (p.name ? ' ' + p.name : '') : ''} · ${K.name}`;
  $('lineKinds').innerHTML = Object.entries(sport.kinds).filter(([k, v]) => v.type === K.type).map(([k, v]) => `<button class="chip${k === l.k ? ' on' : ''}" data-lk="${k}">${kindSample(v)}${v.name}</button>`).join('');
  const isAuto = l.auto && !l.delay;
  $('lineDelays').innerHTML = `<button class="chip${isAuto ? ' on' : ''}" data-ld="auto">🤖 자동</button>` + DELAYS.map(d => `<button class="chip${!isAuto && (+l.delay || 0) === d ? ' on' : ''}" data-ld="${d}">${d ? `+${d}초 늦게` : '바로'}</button>`).join('');
}
function selectLine(id) { selLine = id; sel = null; markRows(); renderLinePanel(); draw(); }
$('lineKinds').addEventListener('click', e => { const b = e.target.closest('[data-lk]'); if (!b) return; snap(); play.lines.find(x => x.id === selLine).k = b.dataset.lk; renderLinePanel(); draw(); save(); });
$('lineDelays').addEventListener('click', e => { const b = e.target.closest('[data-ld]'); if (!b) return; snap(); const l = play.lines.find(x => x.id === selLine); if (b.dataset.ld === 'auto') { l.auto = true; delete l.delay; } else { const d = +b.dataset.ld; l.auto = false; if (d) l.delay = d; else delete l.delay; } renderLinePanel(); draw(); save(); });
$('lineDel').onclick = () => { snap(); play.lines = play.lines.filter(l => l.id !== selLine); selLine = null; renderLinePanel(); draw(); save(); };
$('lineClose').onclick = () => { selLine = null; renderLinePanel(); draw(); };

/* ---------- 작전판 그리기 ---------- */
function draw() {
  if (pb) return;
  F = fieldOf(sport, play.field);
  board.setAttribute('viewBox', F.vb);
  board.innerHTML = fieldInner(sport, play, { prefix: 'b', editor: true, sel, selLine, temp, tempZone, handles: mode === 'draw' });
}
function toSvg(e) { const pt = board.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(board.getScreenCTM().inverse()); }
const inB = (x, y) => [clamp(x, F.bounds[0], F.bounds[2]), clamp(y, F.bounds[1], F.bounds[3])];

board.addEventListener('pointerdown', e => {
  if (pb) { pb.toggle(); return; }
  const pt = toSvg(e);
  const pg = e.target.closest('[data-pid]'), lg = e.target.closest('[data-lid]'), zg = e.target.closest('[data-zid]'), hg = e.target.closest('[data-lend]');
  if (mode === 'erase') {
    if (pg) { snap(); removePlayer(pg.dataset.pid); }
    else if (lg) { snap(); play.lines = play.lines.filter(l => l.id !== lg.dataset.lid); if (selLine === lg.dataset.lid) selLine = null; renderLinePanel(); draw(); save(); }
    else if (zg) { snap(); play.zones = play.zones.filter(z => z.id !== zg.dataset.zid); draw(); save(); }
    return;
  }
  if (mode === 'zone') { drag = { type: 'zone', x0: pt.x, y0: pt.y }; tempZone = null; board.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  if (mode === 'draw') {
    /* 가장 가까운 것: 선 끝 동그라미(이어 그리기) 또는 선수(새로 그리기 · 길게 누르면 옮기기) */
    let hand = null, hd = F.tok * 1.3, pl = null, pd = F.tok * 1.25;
    play.lines.forEach(l => { const K = sport.kinds[l.k]; if (K.type !== 'move') return; const p = getP(l.pid); if (!p) return; const q = l.pts[l.pts.length - 1], d = dist([p.x + q[0], p.y + q[1]], [pt.x, pt.y]); if (d < hd) { hd = d; hand = { pid: p.id, from: [...q] }; } });
    play.players.forEach(p => { const d = dist([p.x, p.y], [pt.x, pt.y]); if (d < pd) { pd = d; pl = p; } });
    if (pl && (!hand || pd <= hd)) {
      const p = pl;
      /* 그리기에서는 끌면 언제나 선이 그려져요 (선수 자리는 「옮기기」에서) */
      drag = { type: 'pend', pid: p.id, sx: pt.x, sy: pt.y };
      board.setPointerCapture(e.pointerId); e.preventDefault(); return;
    }
    if (hand) { beginDraw(hand); board.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (lg) { selectLine(lg.dataset.lid); return; }
    if (sel || selLine) { sel = null; selLine = null; markRows(); renderLinePanel(); draw(); } else toast('선수를 누른 채로 그어 주세요');
    return;
  }
  if (pg) { const p = getP(pg.dataset.pid); drag = { type: 'move', id: p.id, ox: pt.x - p.x, oy: pt.y - p.y, sx: pt.x, sy: pt.y, moved: false }; board.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  if (lg) { selectLine(lg.dataset.lid); return; }
  if (sel || selLine) { sel = null; selLine = null; markRows(); renderLinePanel(); draw(); }
});
function beginDraw(start) {
  const p = getP(start.pid), hb = kind === 'auto' ? holdsBall(p) : null;
  drag = { type: 'draw', pid: start.pid, hb };
  temp = { pid: start.pid, k: kind === 'auto' ? smartKind(p, [p.x, p.y], [p.x, p.y], hb) : kind, pts: [], from: start.from };
}
board.addEventListener('pointermove', e => {
  if (!drag) return;
  const pt = toSvg(e);
  if (drag.type === 'pend') {
    if (Math.hypot(pt.x - drag.sx, pt.y - drag.sy) < F.tok * .35) return;
    beginDraw({ pid: drag.pid });
  }
  if (drag.type === 'zone') {
    const [x, y] = inB(pt.x, pt.y);
    tempZone = { cx: (drag.x0 + x) / 2, cy: (drag.y0 + y) / 2, rx: Math.abs(x - drag.x0) / 2, ry: Math.abs(y - drag.y0) / 2, t: zoneTeam };
    draw(); return;
  }
  if (drag.type === 'move') {
    if (!drag.moved && Math.hypot(pt.x - drag.sx, pt.y - drag.sy) > F.tok * .3) { drag.moved = true; snap(); }
    if (drag.moved) { const p = getP(drag.id); [p.x, p.y] = inB(pt.x - drag.ox, pt.y - drag.oy); p.x = r1(p.x); p.y = r1(p.y); draw(); }
    return;
  }
  const p = getP(drag.pid), [x, y] = inB(pt.x, pt.y), q = [r1(x - p.x), r1(y - p.y)];
  const last = temp.pts[temp.pts.length - 1] || temp.from || [0, 0];
  if (dist(q, last) > F.tok * .35) {
    temp.pts.push(q);
    if (kind === 'auto') { const st = temp.from || [0, 0]; temp.k = smartKind(p, [p.x + st[0], p.y + st[1]], [x, y], drag.hb); }
    draw();
  }
});
function endDrag(cancel) {
  if (!drag) return;
  const d = drag; drag = null;
  if (d.type === 'pend') { if (!cancel) { sel = sel === d.pid ? null : d.pid; selLine = null; markRows(); renderLinePanel(); draw(); } return; }
  if (d.type === 'zone') {
    if (!cancel && tempZone && tempZone.rx > F.tok && tempZone.ry > F.tok * .8) { snap(); play.zones.push({ ...tempZone, id: nid(), cx: r1(tempZone.cx), cy: r1(tempZone.cy), rx: r1(tempZone.rx), ry: r1(tempZone.ry) }); save(); }
    else if (!cancel) toast('끌어서 구역 크기를 정해 주세요');
    tempZone = null; draw(); return;
  }
  if (d.type === 'move') {
    if (!d.moved && !cancel) { sel = sel === d.id ? null : d.id; selLine = null; markRows(); renderLinePanel(); }
    if (d.moved) { renderSportTools(); save(); }
    draw(); return;
  }
  const t = temp; temp = null;
  const st = t.from || [0, 0], end = t.pts[t.pts.length - 1];
  if (!cancel && end && dist(end, st) > F.tok * 1.1) {
    let pts = $('straightChk').checked ? rdp([st, ...t.pts], F.tok * .55).slice(1) : t.pts.filter((q, i) => i % 2 === 0 || i === t.pts.length - 1);
    const p = getP(d.pid);
    if (kind === 'auto') {
      const S = [p.x + st[0], p.y + st[1]], last = pts[pts.length - 1], E = [p.x + last[0], p.y + last[1]];
      t.k = smartKind(p, S, E, d.hb);
      /* 패스는 받을 동료가 도착할 자리로 끝을 붙여요 */
      if (sport.kinds[t.k].type === 'ball' && !sport.kinds[t.k].shot) { const r = receiverAt(E, p, CROSS_SPORTS.includes(sport.id)); if (r) pts[pts.length - 1] = [r.at[0] - p.x, r.at[1] - p.y]; }
    }
    const K = sport.kinds[t.k];
    if (K.snapBase && p.t === 'A' && !t.from && sport.snapLine) { const s2 = sport.snapLine(play, p, pts); if (s2) pts = s2.map(q => q.map(r1)); else toast('주루 선은 베이스 쪽으로 그어 주세요'); }
    const nl = { id: nid(), pid: d.pid, k: t.k, pts: pts.map(q => q.map(r1)), auto: true };
    if (t.from) nl.from = t.from;
    snap(); play.lines.push(nl);
    if (K.type === 'ball' && !play.players.some(x => x.ball)) { p.ball = true; renderRoster(); toast(`${p.pos} 선수가 처음에 공을 가진 선수가 됐어요`); }
    if (kind === 'auto') { selLine = null; toast(`${p.pos} · ${K.name}`); } else selLine = nl.id;
    renderLinePanel(); save();
  } else if (!cancel) toast('조금 더 길게 그어 주세요');
  draw();
}
board.addEventListener('pointerup', () => endDrag(false));
board.addEventListener('pointercancel', () => endDrag(true));

/* ---------- 편집 버튼 ---------- */
$('undoBtn').onclick = () => {
  if (!hist.length) return toast('되돌릴 작업이 없어요');
  stopPlay(); play = normalize(JSON.parse(hist.pop()), sport); sel = selLine = null; renderAll(); save();
};
$('flipBtn').onclick = () => {
  if (!F.flip) return toast('이 경기장은 대칭을 쓸 수 없어요');
  snap();
  const ax = F.flip === 'x' ? 0 : 1, c = (F.bounds[ax] + F.bounds[ax + 2]) / 2;
  play.players.forEach(p => { if (ax === 0) p.x = r1(2 * c - p.x); else p.y = r1(2 * c - p.y); });
  play.lines.forEach(l => { l.pts = l.pts.map(q => ax === 0 ? [-q[0], q[1]] : [q[0], -q[1]]); if (l.from) l.from = ax === 0 ? [-l.from[0], l.from[1]] : [l.from[0], -l.from[1]]; });
  play.zones.forEach(z => { if (ax === 0) z.cx = 2 * c - z.cx; else z.cy = 2 * c - z.cy; });
  draw(); save(); toast(F.flip === 'x' ? '좌우를 바꿨어요' : '위아래(왼쪽·오른쪽 측면)를 바꿨어요');
};
$('clearBtn').onclick = () => { if (!play.lines.length) return; snap(); play.lines = []; selLine = null; renderLinePanel(); draw(); save(); toast('선을 모두 지웠어요. 되돌리기로 살릴 수 있어요'); };
$('resetBtn').onclick = async () => {
  if (!(await ask('처음 예시로 돌릴까요?', '이 종목의 첫 예시 작전으로 바뀌어요.', '돌리기'))) return;
  snap(); stopPlay(); play = normalize(defaultPlay(sport, play.field), sport); sel = selLine = null; curPreset = null; renderAll(); save();
};
function syncName(v) { play.name = v; $('playName').value = $('playName2').value = v; save(); }
$('playName').addEventListener('input', e => syncName(e.target.value));
$('playName2').addEventListener('input', e => syncName(e.target.value));
$('playDesc').addEventListener('input', e => { play.desc = e.target.value; save(); });

/* =====================================================================
   재생 막대 (작전판·작전집 보기 공용)
   ===================================================================== */
function createPlayer(bar, svg, sp, pl, o = {}) {
  const m = mountPlayback(svg, sp, pl, { prefix: o.prefix || 'pv' });
  bar.hidden = false;
  bar.innerHTML = `<button class="pb-play" data-pb="toggle" aria-label="재생 또는 일시정지">⏸</button><button class="btn sm" data-pb="restart">↺ 처음부터</button><input type="range" min="0" max="1000" value="0" data-pb="seek" aria-label="재생 위치"><span class="time" data-pb="time"></span><span class="seg" data-pb="rate">${[.5, 1, 1.5].map(r => `<button data-r="${r}" class="${r === playRate ? 'on' : ''}">${r}×</button>`).join('')}</span>${o.close ? '<button class="btn sm" data-pb="close">✕ 작전판으로</button>' : ''}`;
  const Q = s => bar.querySelector(`[data-pb="${s}"]`);
  const ui = t => { Q('seek').value = Math.round(t / m.dur * 1000); Q('time').textContent = `${t.toFixed(1)} / ${m.dur.toFixed(1)}초`; Q('toggle').textContent = clock.playing ? '⏸' : '▶'; };
  const clock = makeClock(t => { m.set(t); ui(t); }, () => ui(clock.t));
  clock.rate = playRate; clock.load(m.dur); ui(0);
  const onClick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pb === 'toggle') api.toggle();
    if (b.dataset.pb === 'restart') { clock.seek(0); clock.play(); ui(0); }
    if (b.dataset.r) { playRate = +b.dataset.r; clock.rate = playRate; store.set(KEY.rate, playRate); bar.querySelectorAll('[data-r]').forEach(x => x.classList.toggle('on', x === b)); }
    if (b.dataset.pb === 'close' && o.close) o.close();
  };
  const onSeek = e => { clock.pause(); clock.seek(+e.target.value / 1000 * m.dur); ui(clock.t); };
  bar.addEventListener('click', onClick); Q('seek').addEventListener('input', onSeek);
  const api = {
    toggle() { if (clock.playing) clock.pause(); else clock.play(); ui(clock.t); },
    destroy() { clock.pause(); bar.removeEventListener('click', onClick); bar.innerHTML = ''; bar.hidden = true; },
    clock, m
  };
  setTimeout(() => { clock.play(); ui(0); }, 120);
  return api;
}
function startPlay() {
  if (!play.players.length) return toast('선수를 먼저 놓아 주세요');
  if (!play.lines.length) return toast('선을 그려야 움직일 수 있어요. 「선 그리기」로 그어 보세요');
  if (drag) endDrag(true);
  board.classList.add('playing');
  pb = createPlayer($('playerBar'), board, sport, play, { prefix: 'pv', close: stopPlay });
  $('playBtn').textContent = '✕ 작전판으로'; $('tools').style.opacity = .35; $('tools').style.pointerEvents = 'none';
  $('hint').innerHTML = '💡 <span>작전판을 누르면 멈추거나 다시 재생돼요. 막대를 끌면 원하는 순간을 볼 수 있어요.</span>';
}
function stopPlay() {
  if (!pb) return;
  pb.destroy(); pb = null; board.classList.remove('playing');
  $('playBtn').textContent = '▶ 작전 보기'; $('tools').style.opacity = ''; $('tools').style.pointerEvents = '';
  setMode(mode);
}
$('playBtn').onclick = () => pb ? stopPlay() : startPlay();

/* ---------- 작전집에 담기 ---------- */
function addToBook() {
  const name = (play.name || '').trim();
  if (!name) { toast('작전 이름을 먼저 적어 주세요'); $('playName').focus(); return; }
  if (!play.players.length) return toast('선수를 먼저 놓아 주세요');
  BOOK.push({ id: nid(), sport: sport.id, field: play.field, name, desc: (play.desc || '').trim(), data: clone({ players: play.players, lines: play.lines, zones: play.zones, opts: play.opts }), at: Date.now() });
  saveBook(); toast(`📒 작전집에 담았어요 (모두 ${BOOK.length}개)`);
  if (view === 'book') renderBook();
}
$('toBookBtn').onclick = addToBook; $('toBookBtn2').onclick = addToBook;

/* =====================================================================
   그림 만들기 (PNG)
   ===================================================================== */
function wrapText(s, size, maxW, maxLines) {
  const out = []; let line = '', w = 0;
  const cw = ch => ch.charCodeAt(0) > 0x1100 ? size * .98 : ch === ' ' ? size * .32 : size * .56;
  for (const ch of String(s || '').replace(/\s+/g, ' ')) {
    const c = cw(ch);
    if (w + c > maxW && line) { out.push(line); line = ''; w = 0; if (out.length >= maxLines) break; }
    line += ch; w += c;
  }
  if (line && out.length < maxLines) out.push(line);
  if (out.length === maxLines && String(s).length > out.join('').length) out[maxLines - 1] = out[maxLines - 1].slice(0, -1) + '…';
  return out;
}
const playOf = it => normalize({ sport: it.sport, field: it.field, name: it.name, desc: it.desc, ...clone(it.data) }, SPORT[it.sport]);
function cardSVG(it, x, y, w, h, n, pre) {
  const sp = SPORT[it.sport], pl = playOf(it), Fi = fieldOf(sp, pl.field);
  const head = 46, foot = 92;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>`;
  s += `<text x="${x + 22}" y="${y + 32}" font-family="${FONT}" font-size="24" font-weight="800" fill="#0f172a">${n ? n + '. ' : ''}${esc(it.name)}</text>`;
  s += `<text x="${x + w - 22}" y="${y + 32}" text-anchor="end" font-family="${FONT}" font-size="18" font-weight="800" fill="#9e1b32">${sp.icon} ${esc(sp.name)}</text>`;
  s += `<svg x="${x + 14}" y="${y + head}" width="${w - 28}" height="${h - head - foot}" viewBox="${Fi.vb}" preserveAspectRatio="xMidYMid meet">${fieldInner(sp, pl, { prefix: pre })}</svg>`;
  wrapText(it.desc || '', 18, w - 44, 3).forEach((l, i) => s += `<text x="${x + 22}" y="${y + h - foot + 30 + i * 26}" font-family="${FONT}" font-size="18" fill="#334155">${esc(l)}</text>`);
  return s;
}
/* 작전 개수에 맞춘 배치: 1 · 2 · 3 → 한 줄, 4 → 2×2, 5~6 → 3×2, 7~8 → 4×2, 9 → 3×3, 10~12 → 4×3, 13~16 → 4×4 */
const PER_PAGE = 16;
function gridFor(n) {
  if (n <= 3) return [n, 1]; if (n === 4) return [2, 2]; if (n <= 6) return [3, 2]; if (n <= 8) return [4, 2];
  if (n === 9) return [3, 3]; if (n <= 12) return [4, 3]; return [4, 4];
}
function pageSVG(items, start, title, W = 1600, H = 1131) {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f1f5f9"/>`;
  s += `<text x="40" y="58" font-family="${FONT}" font-size="34" font-weight="800" fill="#0f172a">${esc(title)}</text><text x="${W - 40}" y="58" text-anchor="end" font-family="${FONT}" font-size="20" font-weight="700" fill="#64748b">급식대장의 작전 만들기</text>`;
  const [C, R] = gridFor(items.length), gap = 16, top = 84;
  const cw = (W - 80 - gap * (C - 1)) / C, ch = (H - top - 36 - gap * (R - 1)) / R;
  const bw = 760, bh = bw * ch / cw; /* 카드는 같은 크기로 그린 뒤 칸에 맞춰 줄여요 (글씨 비율 유지) */
  items.forEach((it, i) => {
    const x = 40 + (i % C) * (cw + gap), y = top + Math.floor(i / C) * (ch + gap);
    s += `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" viewBox="0 0 ${bw} ${bh.toFixed(1)}">${cardSVG(it, 2, 2, bw - 4, bh - 4, start + i + 1, 'pg' + start + '_' + i)}</svg>`;
  });
  return s + '</svg>';
}
async function bookPages(L, title) { const out = []; for (let i = 0; i < L.length; i += PER_PAGE) out.push(await svgToPng(pageSVG(L.slice(i, i + PER_PAGE), i, title), 1600, 1131)); return out; }
async function savePdf(pages, name) {
  const J = window.jspdf && window.jspdf.jsPDF;
  if (!J) { toast('PDF 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요'); return false; }
  const doc = new J({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const jpg = u => new Promise((res, rej) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0); res(c.toDataURL('image/jpeg', .9)); }; im.onerror = rej; im.src = u; });
  for (let i = 0; i < pages.length; i++) { if (i) doc.addPage(); doc.addImage(await jpg(pages[i]), 'JPEG', 0, 0, 842, 595); }
  return saveFile(`${name}.pdf`, doc.output('blob'));
}
function svgToPng(markup, W, H) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.drawImage(img, 0, 0, W, H); URL.revokeObjectURL(url); try { res(c.toDataURL('image/png')); } catch (e) { rej(e); } };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('그림을 만들지 못했어요')); };
    img.src = url;
  });
}
let imgFiles = [];
function showImages(title, list) {
  imgFiles = list; $('imgTitle').textContent = title;
  $('imgList').innerHTML = list.map((x, i) => `<img src="${x.url}" alt="${esc(title)} ${i + 1}">`).join('');
  $('imgModal').hidden = false;
}
function tryDownload(url, name) { try { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { } }
let _dl;
const getDl = () => _dl || (_dl = (window.claude && window.claude.use) ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null));
async function dataUrlBlob(u) { return (await fetch(u)).blob(); }
/* 파일 저장: 클로드 화면 안에서는 저장 확인 창, 따로 연 파일에서는 바로 내려받기 */
async function saveFile(name, data, url) {
  const dl = await getDl();
  if (dl) {
    try { await dl.save({ filename: name, data }); return true; }
    catch (e) { if (e && e.code === 'declined') return false; if (e && e.code === 'rate_limited') { toast('잠시 뒤 다시 눌러 주세요'); return false; } }
  }
  const u = url || URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
  tryDownload(u, name); return true;
}
$('imgDl').onclick = async () => { for (const f of imgFiles) { const ok = await saveFile(f.name, await dataUrlBlob(f.url), f.url); if (!ok) break; } };
$('imgClose').onclick = () => $('imgModal').hidden = true;
$('pngBtn').onclick = async () => {
  stopPlay();
  const it = { sport: sport.id, field: play.field, name: play.name || '이름 없는 작전', desc: play.desc || '', data: play };
  const W = 1200, H = 1000;
  const mk = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f1f5f9"/>${cardSVG(it, 20, 20, W - 40, H - 40, 0, 'png')}</svg>`;
  try { const url = await svgToPng(mk, W, H); showImages('작전판 그림', [{ url, name: `${it.name}.png` }]); } catch (e) { toast(e.message); }
};

/* =====================================================================
   작전집
   ===================================================================== */
function showView(v) {
  view = v;
  document.querySelectorAll('.tab').forEach(b => { b.classList.toggle('on', b.dataset.view === v); b.setAttribute('aria-selected', b.dataset.view === v); });
  $('view-make').hidden = v !== 'make'; $('view-book').hidden = v !== 'book';
  if (v === 'book') { stopPlay(); renderBook(); }
}
document.querySelectorAll('.tab').forEach(b => b.onclick = () => { if (b.dataset.view === 'book') bookFilter = BOOK.some(it => it.sport === sport.id) ? sport.id : 'all'; showView(b.dataset.view); });
function bookList() { return BOOK.map((it, i) => [it, i]).filter(([it]) => SPORT[it.sport] && (bookFilter === 'all' || it.sport === bookFilter)); }
function renderBook() {
  const counts = {}; BOOK.forEach(it => counts[it.sport] = (counts[it.sport] || 0) + 1);
  if (bookFilter !== 'all' && !counts[bookFilter]) bookFilter = 'all';
  $('bookFilters').innerHTML = `<button class="chip${bookFilter === 'all' ? ' on' : ''}" data-bf="all">전체 ${BOOK.length}</button>` + SPORTS.filter(s => counts[s.id]).map(s => `<button class="chip${bookFilter === s.id ? ' on' : ''}" data-bf="${s.id}">${s.icon} ${s.name} ${counts[s.id]}</button>`).join('');
  const L = bookList();
  if (!L.length) {
    $('bookGrid').innerHTML = `<div class="book-empty"><img src="__CHANDO__" alt=""><div><b>작전집이 비어 있어요</b><p>작전판에서 작전을 만들고 「📒 작전집에 담기」를 누르면 여기에 모여요. 먼저 ${sport.icon} ${sport.name} 예시를 담아 볼까요?</p><div class="modal-btns" style="justify-content:flex-start"><button class="btn primary" id="seedBook">${sport.icon} ${sport.name} 예시 작전 담기</button></div></div></div>`;
    $('seedBook').onclick = () => { sport.presets.filter(p => !p.side || p.side === 'both').slice(0, 4).forEach(pr => { const pl = presetToPlay(sport, pr); BOOK.push({ id: nid(), sport: sport.id, field: pl.field, name: pr.name, desc: pr.desc, data: clone({ players: pl.players, lines: pl.lines, zones: pl.zones, opts: pl.opts }), at: Date.now() }); }); if (sport.start) { const pl = defaultPlay(sport); BOOK.push({ id: nid(), sport: sport.id, field: pl.field, name: pl.name, desc: pl.desc, data: clone({ players: pl.players, lines: pl.lines, zones: pl.zones, opts: pl.opts }), at: Date.now() }); } saveBook(); renderBook(); toast('예시 작전을 담았어요'); };
    return;
  }
  $('bookGrid').innerHTML = L.map(([it, i], k) => {
    const sp = SPORT[it.sport], pl = playOf(it), Fi = fieldOf(sp, pl.field);
    return `<article class="card" draggable="true" data-bi="${i}">
      <div class="thumb"><svg viewBox="${Fi.vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${fieldInner(sp, pl, { prefix: 'bk' + i })}</svg><span class="num">${k + 1}</span><button class="play-over" data-bv="${i}" aria-label="${esc(it.name)} 작전 보기"><span>▶</span></button></div>
      <div class="body"><b>${esc(it.name)}</b><span class="meta">${sp.icon} ${sp.name}${Object.keys(sp.fields).length > 1 ? ' · ' + esc(Fi.name) : ''}</span><span class="desc">${esc(it.desc || '설명이 없어요')}</span>
      <div class="acts"><button class="btn sm primary" data-bv="${i}">▶ 보기</button><button class="btn sm" data-be="${i}">✏️ 고치기</button><button class="btn sm ghost" data-bm="${i}:-1" aria-label="앞으로">◀</button><button class="btn sm ghost" data-bm="${i}:1" aria-label="뒤로">▶</button><button class="btn sm ghost" data-bd="${i}" aria-label="빼기">✕</button></div></div></article>`;
  }).join('');
}
$('bookFilters').addEventListener('click', e => { const b = e.target.closest('[data-bf]'); if (!b) return; bookFilter = b.dataset.bf; renderBook(); });
function moveBook(i, dir) {
  const L = bookList().map(x => x[1]), k = L.indexOf(i), j = L[k + dir]; if (j === undefined) return;
  [BOOK[i], BOOK[j]] = [BOOK[j], BOOK[i]]; saveBook(); renderBook();
}
$('bookGrid').addEventListener('click', async e => {
  const v = e.target.closest('[data-bv]'), ed = e.target.closest('[data-be]'), mv = e.target.closest('[data-bm]'), del = e.target.closest('[data-bd]');
  if (v) openViewer(+v.dataset.bv);
  if (ed) editFromBook(+ed.dataset.be);
  if (mv) { const [i, d] = mv.dataset.bm.split(':').map(Number); moveBook(i, d); }
  if (del) { const i = +del.dataset.bd; if (await ask('작전집에서 뺄까요?', `「${BOOK[i].name}」을 작전집에서 빼요.`, '빼기')) { BOOK.splice(i, 1); saveBook(); renderBook(); } }
});
let dragCard = null;
$('bookGrid').addEventListener('dragstart', e => { const c = e.target.closest('.card'); if (!c) return; dragCard = +c.dataset.bi; c.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'x'); } catch (er) { } });
$('bookGrid').addEventListener('dragover', e => { const c = e.target.closest('.card'); if (!c || dragCard === null) return; e.preventDefault(); document.querySelectorAll('.card.over').forEach(x => x !== c && x.classList.remove('over')); c.classList.add('over'); });
$('bookGrid').addEventListener('drop', e => { const c = e.target.closest('.card'); if (!c || dragCard === null) return; e.preventDefault(); const to = +c.dataset.bi; if (to !== dragCard) { const [it] = BOOK.splice(dragCard, 1); BOOK.splice(to, 0, it); saveBook(); } dragCard = null; renderBook(); });
$('bookGrid').addEventListener('dragend', () => { dragCard = null; document.querySelectorAll('.card').forEach(x => x.classList.remove('drag', 'over')); });

function editFromBook(i) {
  const it = BOOK[i]; if (!it) return;
  closeViewer(); setSport(it.sport, { play: playOf(it) }); openSport(it.sport, 'make');
  toast('작전판으로 불러왔어요. 고친 뒤 다시 담으면 새 작전으로 더해져요');
}

/* 크게 보기 */
let vIdx = null, vPlayer = null;
function openViewer(i) {
  const it = BOOK[i]; if (!it) return;
  if (vPlayer) vPlayer.destroy();
  vIdx = i; const sp = SPORT[it.sport];
  $('vSport').textContent = `${sp.icon} ${sp.name}`; $('vTitle').textContent = it.name; $('vDesc').textContent = it.desc || '';
  const L = bookList().map(x => x[1]), k = L.indexOf(i);
  $('vNum').textContent = `${k + 1} / ${L.length}`; $('vPrev').disabled = k <= 0; $('vNext').disabled = k >= L.length - 1;
  $('viewer').hidden = false;
  vPlayer = createPlayer($('vBar'), $('vBoard'), sp, playOf(it), { prefix: 'vv' });
}
function closeViewer() { if (vPlayer) { vPlayer.destroy(); vPlayer = null; } $('viewer').hidden = true; vIdx = null; }
function stepViewer(d) { const L = bookList().map(x => x[1]), k = L.indexOf(vIdx); if (L[k + d] !== undefined) openViewer(L[k + d]); }
$('vClose').onclick = closeViewer; $('vPrev').onclick = () => stepViewer(-1); $('vNext').onclick = () => stepViewer(1);
$('vEdit').onclick = () => editFromBook(vIdx);
$('vBoard').addEventListener('pointerdown', () => vPlayer && vPlayer.toggle());

/* 작전집 그림 · 인쇄 */
const bookTitle = () => bookFilter === 'all' ? '우리 반 작전집' : `${SPORT[bookFilter].name} 작전집`;
$('bookImgBtn').onclick = () => {
  const n = bookList().length; if (!n) return toast('작전집이 비어 있어요');
  const pages = Math.ceil(n / PER_PAGE), [c, r] = gridFor(Math.min(n, PER_PAGE));
  $('saveNote').textContent = `「${bookTitle()}」 작전 ${n}개를 ${c}×${r} 배치로 ${pages}쪽에 담아요.`;
  $('saveModal').hidden = false;
};
$('saveClose').onclick = () => $('saveModal').hidden = true;
$('saveModal').addEventListener('click', async e => {
  if (e.target === $('saveModal')) { $('saveModal').hidden = true; return; }
  const b = e.target.closest('[data-save]'); if (!b) return;
  const L = bookList().map(x => x[0]), title = bookTitle(), name = title.replace(/[\\/:*?"<>|]/g, ' ').trim();
  const btns = $('saveModal').querySelectorAll('[data-save]'); btns.forEach(x => x.disabled = true);
  toast(b.dataset.save === 'pdf' ? 'PDF를 만들고 있어요…' : '그림을 만들고 있어요…');
  try {
    const pages = await bookPages(L, title);
    $('saveModal').hidden = true;
    if (b.dataset.save === 'pdf') { if (await savePdf(pages, name)) toast('PDF로 저장했어요'); }
    else showImages(`${title} (${pages.length}장)`, pages.map((url, i) => ({ url, name: pages.length > 1 ? `${name}-${i + 1}.png` : `${name}.png` })));
  } catch (er) { toast('저장하지 못했어요: ' + (er.message || er)); }
  finally { btns.forEach(x => x.disabled = false); }
});
const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
$('printBtn').hidden = framed;
$('printBtn').onclick = () => {
  const L = bookList().map(x => x[0]); if (!L.length) return toast('작전집이 비어 있어요');
  let h = '';
  for (let i = 0; i < L.length; i += 4) h += `<div class="ppage"><h2>작전집 ${i / 4 + 1}쪽</h2>` + L.slice(i, i + 4).map((it, j) => { const sp = SPORT[it.sport], pl = playOf(it), Fi = fieldOf(sp, pl.field); return `<div class="pcell"><b>${i + j + 1}. ${esc(it.name)} · ${sp.name}</b><svg viewBox="${Fi.vb}" preserveAspectRatio="xMidYMid meet">${fieldInner(sp, pl, { prefix: 'pr' + i + j })}</svg><p>${esc(it.desc || '')}</p></div>`; }).join('') + '</div>';
  $('printArea').innerHTML = h; window.print();
};

/* 작전 파일: 범위(지금 작전판 · 이 종목 · 전체)와 형식(JSON · PNG · PDF) */
let fileScope = 'board';
function scopeItems() {
  if (fileScope === 'board') return [{ sport: sport.id, field: play.field, name: (play.name || '').trim() || '이름 없는 작전', desc: (play.desc || '').trim(), data: clone({ players: play.players, lines: play.lines, zones: play.zones, opts: play.opts }) }];
  return fileScope === 'sport' ? BOOK.filter(it => it.sport === sport.id) : BOOK.filter(it => SPORT[it.sport]);
}
function renderScope() {
  $('scopeSport').textContent = `${sport.name} 작전집`;
  document.querySelectorAll('#fileScope [data-scope]').forEach(b => b.classList.toggle('on', b.dataset.scope === fileScope));
  const n = scopeItems().length;
  $('scopeNote').textContent = fileScope === 'board' ? `지금 작전판의 「${(play.name || '').trim() || '이름 없는 작전'}」을 저장해요.` : n ? `작전 ${n}개를 저장해요.` : '저장할 작전이 없어요. 먼저 작전집에 담아 주세요.';
}
$('fileBtn').onclick = () => { if (!$('home').hidden) fileScope = 'all'; renderScope(); $('fileModal').hidden = false; };
$('fileClose').onclick = () => $('fileModal').hidden = true;
$('fileScope').addEventListener('click', e => { const b = e.target.closest('[data-scope]'); if (!b) return; fileScope = b.dataset.scope; renderScope(); });
const scopeTitle = () => fileScope === 'board' ? ((play.name || '').trim() || '작전판') : fileScope === 'sport' ? `${sport.name} 작전집` : '우리 반 작전집';
async function scopePages() {
  const L = scopeItems(), title = scopeTitle(), out = [];
  if (fileScope === 'board') {
    const W = 1600, H = 1131, it = L[0];
    const mk = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f1f5f9"/>${cardSVG(it, 40, 40, W - 80, H - 80, 0, 'fx')}</svg>`;
    out.push(await svgToPng(mk, W, H));
  } else return bookPages(L, title);
  return out;
}
$('fileModal').addEventListener('click', async e => {
  const b = e.target.closest('[data-fmt]'); if (!b) return;
  const L = scopeItems(); if (!L.length) return toast('저장할 작전이 없어요. 먼저 작전집에 담아 주세요');
  const name = scopeTitle().replace(/[\\/:*?"<>|]/g, ' ').trim();
  const btns = document.querySelectorAll('[data-fmt]'); btns.forEach(x => x.disabled = true);
  try {
    if (b.dataset.fmt === 'json') {
      await saveFile(`${name}.json`, new Blob([JSON.stringify({ app: 'gc-tactics', v: 1, book: L })], { type: 'application/json' }));
    } else {
      toast('파일을 만들고 있어요…');
      const pages = await scopePages();
      if (b.dataset.fmt === 'png') {
        for (let i = 0; i < pages.length; i++) { const ok = await saveFile(pages.length > 1 ? `${name}-${i + 1}.png` : `${name}.png`, await dataUrlBlob(pages[i]), pages[i]); if (!ok) break; }
      } else {
        await savePdf(pages, name);
      }
    }
  } catch (er) { toast('파일을 만들지 못했어요: ' + (er.message || er)); }
  finally { btns.forEach(x => x.disabled = false); }
});
$('filePick').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    e.target.value = '';
    let d; try { d = JSON.parse(r.result); } catch (er) { return toast('작전 파일(JSON)이 아니에요'); }
    const list = Array.isArray(d) ? d : Array.isArray(d.book) ? d.book : [];
    let n = 0;
    list.forEach(it => { if (!it || !SPORT[it.sport] || !it.data || !Array.isArray(it.data.players)) return; BOOK.push({ ...clone(it), id: nid(), name: String(it.name || '이름 없는 작전').slice(0, 30), desc: String(it.desc || '').slice(0, 400) }); n++; });
    if (!n) return toast('불러올 작전을 찾지 못했어요');
    saveBook(); $('fileModal').hidden = true; toast(`작전 ${n}개를 작전집에 더했어요`); openSport(sport.id, 'book', 'all');
  };
  r.readAsText(f);
};

/* ---------- 테마 · 단축키 ---------- */
function applyTheme(t) { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }
applyTheme(store.get(KEY.theme, ''));
$('themeBtn').onclick = () => {
  const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const t = dark ? 'light' : 'dark'; applyTheme(t); store.set(KEY.theme, t);
};
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if (e.key === 'Escape') { if (!$('ask').hidden) return $('askNo').click(); if (!$('viewer').hidden) return closeViewer(); if (!$('imgModal').hidden) return $('imgModal').hidden = true; if (!$('fileModal').hidden) return $('fileModal').hidden = true; if (!$('tipsModal').hidden) return $('tipsModal').hidden = true; if (!$('fbModal').hidden) return $('fbClose').click(); if (pb) return stopPlay(); }
  if (!$('viewer').hidden) { if (e.key === 'ArrowLeft') stepViewer(-1); if (e.key === 'ArrowRight') stepViewer(1); if (e.key === ' ' && !typing) { e.preventDefault(); vPlayer && vPlayer.toggle(); } return; }
  if (typing || view !== 'make') return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && selLine) { e.preventDefault(); $('lineDel').click(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); $('undoBtn').click(); }
  if (e.key === ' ' && pb) { e.preventDefault(); pb.toggle(); }
});
document.querySelectorAll('.modal').forEach(m => m.addEventListener('pointerdown', e => { if (e.target === m) { if (m.id === 'viewer') closeViewer(); else if (m.id === 'ask') $('askNo').click(); else m.hidden = true; } }));


/* ---------- 의견 보내기 (카카오톡 · 인스타그램 DM) ---------- */
(function () {
  const box = $('fbModal'), FB_ID = 'chan_ddol'; let kind = 'idea', armed = null, lastVia = null, rt = null;
  const PH = { idea: '예) 넷볼에 센터 패스 작전이 더 있으면 좋겠어요.', bug: '예) 휴대폰에서 선을 그리면 화면이 움직여요. / 작전집을 한글 파일로 저장하는 기능이 있으면 좋겠어요.', etc: '예) 수업에 잘 쓰고 있어요!' };
  const KN = { idea: '💡 아이디어 보내기', bug: '🛠 오류 및 기능추가', etc: '💬 기타의견' };
  $('fbSport').innerHTML = '<option value="">전체 / 종목과 상관없음</option>' + HOME_ORDER.flatMap(id => GROUPS[id] ? GROUPS[id].members : [id]).map(id => SPORT[id]).filter(Boolean).map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  const setKind = k => { kind = k; box.querySelectorAll('#fbType button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.k === k))); $('fbText').placeholder = PH[k]; };
  box.querySelectorAll('#fbType button').forEach(b => b.onclick = () => { setKind(b.dataset.k); refresh(); }); setKind('idea');
  function device() { const u = navigator.userAgent; return /iPad|Macintosh.*Mobile|Macintosh(?=.*Safari)(?!.*Chrome)/.test(u) && 'ontouchend' in document ? '아이패드' : /iPhone/.test(u) ? '아이폰' : /Android/.test(u) ? (/Mobile/.test(u) ? '안드로이드폰' : '안드로이드 태블릿') : /Windows/.test(u) ? '윈도우' : /Mac/.test(u) ? '맥' : '기타'; }
  function msg() { const d = new Date(), z = n => String(n).padStart(2, '0'), name = $('fbName').value.trim(); return `[급식대장의 작전 만들기 의견] ${KN[kind]}\n종목: ${$('fbSport').value || '전체'}\n내용: ${$('fbText').value.trim()}` + (name ? `\n보낸 사람: ${name}` : '') + `\n(${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())} · ${device()} · ${innerWidth}px)`; }
  async function copy(t) { try { const p = navigator.clipboard && navigator.clipboard.writeText(t); if (p) { await p; return true; } } catch (e) { } try { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; } }
  function render(via, ok, changed) {
    const st = $('fbSteps');
    const s1 = ok ? (changed ? '바뀐 내용으로 메시지를 다시 <b>복사</b>했어요.' : '메시지를 <b>복사</b>했어요.') : (changed ? '내용이 바뀌었어요. 아래 글을 길게 눌러 다시 <b>복사</b>해 주세요.' : '자동 복사가 안 됐어요. 아래 글을 길게 눌러 <b>복사</b>해 주세요.');
    const s2 = via === 'kakao' ? `보내기 버튼에 오류가 발생할 경우 <a class="kadd" href="https://open.kakao.com/o/s5bh9QCe" target="_blank" rel="noopener">친구 추가하기</a> ← 를 눌러주세요.` : `인스타그램 <code>@${FB_ID}</code> 프로필이 열려요. <b>메시지</b>를 누르세요. 안 열리면 인스타그램에서 @${FB_ID}을 검색하세요.<button class="btn sm" type="button" data-copy="@${FB_ID}">ID 복사</button>`;
    st.innerHTML = `<ol><li><span>${s1}</span></li><li><span>${s2}</span></li><li><span>대화창에 <b>붙여넣기</b> 해서 보내 주세요.</span></li></ol><textarea readonly aria-label="보낼 메시지">${esc(msg())}</textarea>`;
    if (armed === via) st.insertAdjacentHTML('beforeend', `<p class="fbgo">안내를 확인했으면 아래 <b>${via === 'kakao' ? '카카오톡으로' : '인스타그램 DM으로'} 보내기</b>를 한 번 더 눌러 주세요.</p>`);
    st.hidden = false;
    st.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { const r = await copy(b.dataset.copy); b.textContent = r ? '복사했어요' : '복사 실패'; setTimeout(() => b.textContent = 'ID 복사', 1600); });
  }
  function arm(via) { armed = via; box.querySelectorAll('.sendrow .btn').forEach(b => { const on = b.id === (via === 'kakao' ? 'fbKakao' : 'fbInsta'); b.classList.toggle('armed', on); if (on) b.setAttribute('href', b.dataset.href); else b.removeAttribute('href'); }); }
  function send(via, e) {
    if (!$('fbText').value.trim()) { e && e.preventDefault(); $('fbErr').hidden = false; $('fbText').focus(); return; }
    $('fbErr').hidden = true;
    const go = armed === via && !$('fbSteps').hidden; lastVia = via; const pr = copy(msg());
    if (!go) { e && e.preventDefault(); arm(via); pr.then(ok => { render(via, ok, false); $('fbSteps').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }); }
  }
  function refresh() { if (!lastVia || $('fbSteps').hidden) return; const ta = $('fbSteps').querySelector('textarea'); if (ta) ta.value = msg(); clearTimeout(rt); rt = setTimeout(async () => { if (!$('fbText').value.trim()) return; const ok = await copy(msg()); render(lastVia, ok, true); }, 500); }
  ['fbText', 'fbName'].forEach(id => $(id).addEventListener('input', refresh)); $('fbSport').addEventListener('change', refresh);
  ['fbKakao', 'fbInsta'].forEach(id => $(id).addEventListener('keydown', e => { if ((e.key === 'Enter' && !$(id).hasAttribute('href')) || e.key === ' ') { e.preventDefault(); $(id).click(); } }));
  $('fbKakao').addEventListener('click', e => send('kakao', e)); $('fbInsta').addEventListener('click', e => send('insta', e));
  $('fbOpen').onclick = () => { if (!$('home').hidden) $('fbSport').value = ''; else $('fbSport').value = sport.name; box.hidden = false; armed = null; lastVia = null; box.querySelectorAll('.sendrow .btn').forEach(b => { b.classList.remove('armed'); b.removeAttribute('href'); }); $('fbSteps').hidden = true; $('fbErr').hidden = true; if (matchMedia('(pointer:coarse)').matches || innerWidth < 768) $('fbClose').focus({ preventScroll: true }); else $('fbText').focus(); };
  $('fbClose').onclick = () => { box.hidden = true; $('fbOpen').focus(); };
})();

/* ---------- 시작 ---------- */
saveBook();
setSport(sport.id);
showHome();
