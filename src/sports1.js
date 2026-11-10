/* =====================================================================
   종목 정의 1 — 공용 도우미 + 농구 · 배구 · 티볼
   ===================================================================== */
const COL = { run: '#fbbf24', drib: '#fb923c', pass: '#60a5fa', lob: '#c084fc', shot: '#f43f5e', def: '#fca5a5', screen: '#34d399', motion: '#e879f9', toss: '#facc15', serve: '#22d3ee' };

const kRun = (name = '이동', o = {}) => ({ name, type: 'move', color: COL.run, w: 1, speed: 5, hint: '선수가 달려가는 길', ...o });
const kDef = (name = '수비 이동', o = {}) => ({ name, type: 'move', color: COL.def, dash: '5 3', w: .95, speed: 4.6, hint: '수비가 따라가거나 자리를 옮기는 길', ...o });
const kDrib = (name = '드리블', o = {}) => ({ name, type: 'move', color: COL.drib, w: 1, speed: 3.8, wavy: true, withBall: true, hint: '공을 가진 선수가 공과 함께 움직이는 길', ...o });
const kPass = (name = '패스', o = {}) => ({ name, type: 'ball', color: COL.pass, dash: '1.2 2.4', w: 1, speed: 11, arc: .08, hint: '공이 날아가는 길', ...o });
const kShot = (name = '슛', o = {}) => ({ name, type: 'ball', color: COL.shot, w: 1.15, speed: 18, arc: .05, shot: true, callCatch: false, hint: '골대를 향해 차거나 던지는 길', ...o });

/* 프리셋을 실제 작전 데이터로 바꿔요 */
let _nid = 0;
const nid = () => 'n' + Date.now().toString(36) + (++_nid).toString(36) + Math.random().toString(36).slice(2, 5);
function presetToPlay(sport, pr, base) {
  const field = pr.field || (base && base.field) || sport.defaultField;
  const keep = pr.side && pr.side !== 'both' && base && base.field === field ? base : null;
  const players = [], lines = [], zones = [];
  if (keep) {
    const other = pr.side === 'A' ? 'B' : 'A';
    keep.players.filter(p => p.t === other).forEach(p => players.push({ ...p, ball: pr.side === 'A' ? false : p.ball }));
    keep.lines.filter(l => players.some(p => p.id === l.pid)).forEach(l => lines.push(JSON.parse(JSON.stringify(l))));
    (keep.zones || []).filter(z => (z.t || 'B') === other).forEach(z => zones.push({ ...z }));
  }
  const ids = pr.players.map(q => {
    const [t, pos, x, y, o = {}] = q;
    const p = { id: nid(), t, pos, name: o.name || '', x, y };
    if (o.ball) p.ball = true;
    players.push(p); return p.id;
  });
  if (pr.side === 'B' && players.some(p => p.ball && p.t === 'B') && players.some(p => p.ball && p.t === 'A')) players.forEach(p => { if (p.t === 'B') delete p.ball; });
  (pr.lines || []).forEach(q => { const [pi, k, pts, o = {}] = q; const l = { id: nid(), pid: ids[pi], k, pts: pts.map(v => [...v]) }; if (o.from) l.from = [...o.from]; if (o.delay) l.delay = o.delay; lines.push(l); });
  (pr.zones || []).forEach(z => zones.push({ id: nid(), cx: z[0], cy: z[1], rx: z[2], ry: z[3], t: z[4] || 'B' }));
  return { sport: sport.id, field, name: keep ? (base.name || '') : (pr.name || ''), desc: keep ? (base.desc || '') : (pr.desc || ''), players, lines, zones, opts: { ...(pr.opts || {}) } };
}

/* 경기장 그리기 도우미 */
const LN = (x1, y1, x2, y2, w, c = '#fff', o = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${o}/>`;
const TX = (x, y, s, size, o = {}) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${o.w || 800}" fill="${o.c || '#ffffff'}" fill-opacity="${o.op ?? .55}" text-anchor="${o.a || 'middle'}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>${s}</text>`;
function planks(x, y, w, h, gap, c1, c2) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/>`;
  for (let i = x, k = 0; i < x + w; i += gap, k++) if (k % 2) s += `<rect x="${i}" y="${y}" width="${gap}" height="${h}" fill="${c2}"/>`;
  return s;
}
function grass(x, y, w, h, gap, dir = 'v') {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2f7d3a"/>`;
  if (dir === 'v') for (let i = x, k = 0; i < x + w; i += gap, k++) { if (k % 2) s += `<rect x="${i}" y="${y}" width="${gap}" height="${h}" fill="#358a41"/>`; }
  else for (let i = y, k = 0; i < y + h; i += gap, k++) { if (k % 2) s += `<rect x="${x}" y="${i}" width="${w}" height="${gap}" fill="#358a41"/>`; }
  return s;
}
/* 반대쪽 팀 */
const other = t => t === 'A' ? 'B' : 'A';

/* =====================================================================
   🏀 농구
   ===================================================================== */
const BB_HALF = {
  name: '반코트', vb: '-8 -8 166 156', m: 10, tok: 5, ball: 2.3, lw: .9, flip: 'x', bounds: [-6, -6, 156, 146],
  hoop: [75, 15.75], attack: '▲',
  draw() {
    const w = .55;
    let s = planks(-8, -8, 166, 156, 7, '#d8a15f', '#d19a58');
    s += `<rect x="50.5" y="0" width="49" height="58" fill="#9a3f1c" fill-opacity=".55"/>`;
    s += `<rect x="0" y="0" width="150" height="140" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<rect x="50.5" y="0" width="49" height="58" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M57 58 A18 18 0 0 0 93 58" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M57 58 A18 18 0 0 1 93 58" fill="none" stroke="#fff" stroke-width="${w}" stroke-dasharray="2 2"/>`;
    s += `<path d="M9 0 V29.9 A67.5 67.5 0 0 0 141 29.9 V0" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M62.5 15.75 A12.5 12.5 0 0 0 87.5 15.75" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M57 140 A18 18 0 0 1 93 140" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += LN(66, 12, 84, 12, 1.1) + `<circle cx="75" cy="15.75" r="2.3" fill="none" stroke="#f97316" stroke-width=".8"/>`;
    s += TX(145, 136, '▲ 공격 방향', 4.2, { a: 'end' }) + TX(75, 100, '3점 라인 밖 = 3점', 3.6, { op: .45 });
    return s;
  }
};
const BB_FULL = {
  name: '전체 코트', vb: '-8 -8 296 166', m: 10, tok: 5, ball: 2.3, lw: .9, flip: 'y', bounds: [-6, -6, 286, 156],
  hoops: { A: [264.25, 75], B: [15.75, 75] },
  draw() {
    const w = .55;
    let s = planks(-8, -8, 296, 166, 7, '#d8a15f', '#d19a58');
    s += `<rect x="0" y="50.5" width="58" height="49" fill="#9a3f1c" fill-opacity=".55"/><rect x="222" y="50.5" width="58" height="49" fill="#1e3a8a" fill-opacity=".45"/>`;
    s += `<rect x="0" y="0" width="280" height="150" fill="none" stroke="#fff" stroke-width="${w}"/>` + LN(140, 0, 140, 150, w) + `<circle cx="140" cy="75" r="18" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<rect x="0" y="50.5" width="58" height="49" fill="none" stroke="#fff" stroke-width="${w}"/><rect x="222" y="50.5" width="58" height="49" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M0 9 H29.9 A67.5 67.5 0 0 1 29.9 141 H0" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M280 9 H250.1 A67.5 67.5 0 0 0 250.1 141 H280" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<circle cx="58" cy="75" r="18" fill="none" stroke="#fff" stroke-width="${w}" stroke-dasharray="2 2"/><circle cx="222" cy="75" r="18" fill="none" stroke="#fff" stroke-width="${w}" stroke-dasharray="2 2"/>`;
    s += LN(12, 66, 12, 84, 1.1) + LN(268, 66, 268, 84, 1.1);
    s += `<circle cx="15.75" cy="75" r="2.3" fill="none" stroke="#f97316" stroke-width=".8"/><circle cx="264.25" cy="75" r="2.3" fill="none" stroke="#f97316" stroke-width=".8"/>`;
    s += TX(200, 146, '우리 팀 공격 방향 ▶', 4.2);
    return s;
  }
};
const basketball = {
  id: 'basketball', name: '농구', icon: '🏀', ball: 'basketball',
  fields: { half: BB_HALF, full: BB_FULL }, defaultField: 'half',
  teams: { A: '공격', B: '수비' },
  pos: { A: ['PG', 'SG', 'SF', 'PF', 'C'], B: ['X1', 'X2', 'X3', 'X4', 'X5'] },
  posName: { PG: '포인트가드', SG: '슈팅가드', SF: '스몰포워드', PF: '파워포워드', C: '센터', X1: '수비 1', X2: '수비 2', X3: '수비 3', X4: '수비 4', X5: '수비 5' },
  max: 12,
  kinds: {
    cut: kRun('컷(이동)', { hint: '공 없이 빈 곳으로 달려 들어가기' }),
    dribble: kDrib('드리블', { speed: 3.6 }),
    screen: { name: '스크린', type: 'move', color: COL.screen, w: 1, speed: 4, marker: 'bar', screen: true, hint: '수비수 길목에 버티고 서서 막아 주기' },
    pass: kPass('패스', { speed: 10, arc: .06 }),
    lob: kPass('로브 패스', { color: COL.lob, dash: '', speed: 7.5, arc: .28, hint: '수비 머리 위로 높게 띄우는 패스' }),
    shot: kShot('슛', { speed: 8.5, arc: .3, arcMin: 2.2, hint: '골대를 향해 던지기 (거리로 2점·3점 판정)' }),
    def: kDef('수비 이동', { speed: 4.4 })
  },
  defaultKind: 'cut',
  catchR: 1.3, homeR: 2.6, holdMin: .35, carryOnRun: false, travelWord: '트래블 주의! 드리블 선으로 움직여요',
  goalTarget(ctx, p) {
    const F = ctx.F; const h = F.hoop || F.hoops[p.t]; return { pt: [...h], hoop: h };
  },
  rules: {
    release(ctx, f) {
      if (!f.K.shot) return;
      const hoop = f.goal.hoop; f.dist = dist(ctx.pos[f.h], hoop) / ctx.M;
      const d = ctx.nearest(ctx.pos[f.h], .85 * ctx.M, j => ctx.P[j].t !== f.team);
      if (d >= 0 && f.dist > 1.6) f.blocked = d;
    },
    arrive(ctx, f, end) {
      if (!f.K.shot) return false;
      if (f.blocked !== undefined) { ctx.ball.rest = [end[0] + 6, end[1] + 10]; ctx.kill(); ctx.call('블록슛!', ctx.pos[f.blocked], { color: '#38bdf8' }); ctx.big('수비가 막았어요', { color: '#38bdf8' }); return true; }
      ctx.ball.rest = end; ctx.kill();
      ctx.big(f.dist > 6.75 ? '3점 슛 성공!' : f.dist < 1.7 ? '레이업 성공! 2점' : '2점 슛 성공!', { color: '#facc15' });
      return true;
    }
  },
  tips: [
    ['공 없는 움직임', '컷은 수비가 공을 보는 순간 빈 곳으로 뛰어 들어가는 거예요. 패스하고 바로 골밑으로 달리는 기브 앤 고가 기본이에요.'],
    ['스크린', '초록 스크린 선 끝에 서면, 지나가던 상대 수비가 잠깐 걸려 멈춰요. 작전 보기에서 확인해 보세요.'],
    ['트래블', '공을 든 선수는 드리블 선으로만 움직일 수 있어요. 노란 이동 선을 쓰면 패스할 때까지 기다려요.'],
    ['슛 거리', '3점 라인 밖에서 던지면 3점, 안쪽은 2점이에요. 수비가 바로 붙어 있으면 블록슛을 당해요.']
  ],
  presets: [
    { id: 'giveandgo', group: '공격', name: '기브 앤 고', field: 'half',
      desc: 'PG가 SG에게 패스하고 곧바로 골밑으로 달려요. SG가 다시 돌려주면 레이업!',
      tip: '패스한 뒤 서 있지 말고 바로 움직이는 게 핵심이에요.',
      players: [['A', 'PG', 75, 82, { ball: 1 }], ['A', 'SG', 125, 50], ['A', 'SF', 25, 50], ['A', 'PF', 14, 14], ['A', 'C', 112, 24],
        ['B', 'X1', 75, 70], ['B', 'X2', 116, 44], ['B', 'X3', 34, 45], ['B', 'X4', 22, 22], ['B', 'X5', 104, 22]],
      lines: [[0, 'pass', [[50, -32]]], [0, 'cut', [[-8, -18], [8, -56]]], [1, 'pass', [[-42, -24]], { delay: .2 }], [0, 'shot', [[0, -66.25]], { from: [8, -56] }],
        [4, 'cut', [[22, -8]]], [9, 'def', [[20, -6]], { delay: .2 }], [5, 'def', [[16, -6]], { delay: .5 }], [6, 'def', [[4, 2]]]] },
    { id: 'pnr', group: '공격', name: '픽 앤 롤', field: 'half',
      desc: 'C가 PG 수비 옆에 스크린을 걸고, PG가 드리블로 돌아 나가요. C가 골밑으로 굴러가며(롤) 패스를 받아 슛!',
      tip: '스크린에 걸린 수비가 멈춘 사이 두 명이 동시에 움직여요.',
      players: [['A', 'PG', 75, 84, { ball: 1 }], ['A', 'C', 102, 60], ['A', 'SG', 22, 52], ['A', 'SF', 140, 14], ['A', 'PF', 12, 14],
        ['B', 'X1', 75, 73], ['B', 'X5', 96, 52], ['B', 'X2', 30, 46], ['B', 'X3', 130, 20], ['B', 'X4', 22, 22]],
      lines: [[1, 'screen', [[-16, 14]]], [0, 'dribble', [[18, -6], [34, -30]], { delay: .9 }], [1, 'cut', [[-12, -32]], { from: [-16, 14], delay: .35 }],
        [0, 'pass', [[15, -56]], { from: [34, -30] }], [1, 'shot', [[-27, -44.25]], { from: [-12, -32] }],
        [5, 'def', [[30, -17]], { delay: 1.0 }], [6, 'def', [[8, 8]], { delay: 1.1 }]] },
    { id: 'kick', group: '공격', name: '드라이브 앤 킥 (3점)', field: 'half',
      desc: 'PG가 골밑으로 파고들면 수비가 몰려요. 그 순간 비어 있는 코너의 SF에게 빼 주면 3점 슛!',
      tip: '돌파는 득점뿐 아니라 수비를 끌어당겨 동료를 자유롭게 만들어요.',
      players: [['A', 'PG', 75, 86, { ball: 1 }], ['A', 'SF', 144, 9], ['A', 'SG', 12, 48], ['A', 'PF', 46, 20], ['A', 'C', 104, 38],
        ['B', 'X1', 75, 74], ['B', 'X3', 134, 16], ['B', 'X2', 22, 44], ['B', 'X4', 54, 26], ['B', 'X5', 98, 30]],
      lines: [[0, 'dribble', [[4, -26], [10, -44]]], [0, 'pass', [[69, -77]], { from: [10, -44] }], [1, 'shot', [[-69, 6.75]]],
        [5, 'def', [[8, -34]], { delay: .4 }], [6, 'def', [[-40, 22]], { delay: .7 }], [9, 'def', [[-10, 6]], { delay: .9 }]] },
    { id: 'zone23', group: '수비', name: '2-3 지역 방어', field: 'half',
      desc: '앞에 2명, 뒤에 3명이 구역을 나눠 맡아요. 공이 오른쪽으로 가면 다섯 명이 함께 미끄러지듯 이동해요.',
      tip: '사람보다 공과 내 구역을 먼저 봐요.',
      players: [['A', 'PG', 75, 88, { ball: 1 }], ['A', 'SG', 128, 56], ['A', 'SF', 22, 56], ['A', 'PF', 140, 12], ['A', 'C', 75, 46],
        ['B', 'X1', 58, 62], ['B', 'X2', 92, 62], ['B', 'X3', 24, 26], ['B', 'X4', 75, 24], ['B', 'X5', 126, 26]],
      zones: [[58, 62, 21, 14], [92, 62, 21, 14], [26, 28, 22, 22], [75, 26, 17, 15], [124, 28, 22, 22]],
      lines: [[0, 'pass', [[53, -32]]], [1, 'pass', [[12, -44]], { delay: .3 }],
        [6, 'def', [[20, -8]], { delay: .5 }], [5, 'def', [[20, -4]], { delay: .6 }], [9, 'def', [[8, -12]], { delay: 1.3 }], [8, 'def', [[20, -2]], { delay: 1.3 }], [7, 'def', [[24, 0]], { delay: 1.4 }]] },
    { id: 'fastbreak', group: '공격', name: '속공 (3대2)', field: 'full',
      desc: '수비 리바운드를 잡은 C가 PG에게 아웃렛 패스! 세 명이 세 갈래로 달려 수비 두 명보다 먼저 골밑에 닿아요.',
      tip: '가운데는 드리블, 양옆은 넓게 달려 수비를 벌려요.',
      players: [['A', 'C', 28, 82, { ball: 1 }], ['A', 'PG', 55, 25], ['A', 'SG', 70, 128], ['A', 'SF', 40, 60],
        ['B', 'X1', 150, 70], ['B', 'X2', 175, 40]],
      lines: [[0, 'pass', [[27, -57]]], [1, 'dribble', [[45, 25], [140, 48]]], [2, 'cut', [[80, -8], [175, -25]]], [3, 'cut', [[90, -40], [195, -45]], { delay: .3 }],
        [1, 'pass', [[190, 78]], { from: [140, 48] }], [2, 'shot', [[194.25, -53]], { from: [175, -25] }],
        [4, 'def', [[80, 8]], { delay: .3 }], [5, 'def', [[65, 12]], { delay: .5 }]] }
  ]
};

/* =====================================================================
   🏐 배구
   ===================================================================== */
const VB_ZONES = {
  A: { 4: [100, 45], 3: [100, 75], 2: [100, 105], 5: [55, 45], 6: [55, 75], 1: [55, 105] },
  B: { 4: [140, 105], 3: [140, 75], 2: [140, 45], 5: [185, 105], 6: [185, 75], 1: [185, 45] }
};
const VB = {
  name: '배구 코트', vb: '0 0 240 150', m: 10, tok: 5.4, ball: 2.5, lw: .9, flip: 'y', bounds: [2, 2, 238, 148], net: 120, court: [30, 30, 210, 120],
  draw(o = {}) {
    let s = `<rect x="0" y="0" width="240" height="150" fill="#1f5f99"/>`;
    s += `<rect x="30" y="30" width="180" height="90" fill="#e2833c"/>`;
    s += `<rect x="90" y="30" width="60" height="90" fill="#d4762f"/>`;
    s += `<rect x="30" y="30" width="180" height="90" fill="none" stroke="#fff" stroke-width=".8"/>`;
    s += LN(90, 30, 90, 120, .6) + LN(150, 30, 150, 120, .6);
    s += LN(90, 22, 90, 30, .5, '#fff', 'stroke-dasharray="1.5 1.5"') + LN(150, 22, 150, 30, .5, '#fff', 'stroke-dasharray="1.5 1.5"');
    s += LN(120, 22, 120, 128, 2.2, '#0f172a') + LN(120, 22, 120, 128, .7, '#f8fafc', 'stroke-dasharray="1.2 1.2"');
    s += `<circle cx="120" cy="22" r="1.8" fill="#f8fafc"/><circle cx="120" cy="128" r="1.8" fill="#f8fafc"/>`;
    s += TX(75, 138, '우리 팀 코트', 4.4, { op: .7 }) + TX(165, 138, '상대 팀 코트', 4.4, { op: .7 }) + TX(120, 16, '네트', 4, { op: .8 });
    s += TX(60, 26, '공격선(3m)', 3.2, { op: .55 }).replace('x="60"', 'x="90"');
    return s;
  }
};
const volleyball = {
  id: 'volleyball', name: '배구', icon: '🏐', ball: 'volleyball',
  fields: { court: VB }, defaultField: 'court',
  teams: { A: '우리 팀', B: '상대 팀' },
  pos: { A: ['S', 'OH', 'MB', 'OP', 'L', 'D'], B: ['S', 'OH', 'MB', 'OP', 'L', 'D'] },
  posName: { S: '세터', OH: '레프트(아웃사이드)', MB: '센터(미들 블로커)', OP: '라이트(아포짓)', L: '리베로', D: '수비' },
  max: 14,
  kinds: {
    move: kRun('이동', { speed: 4.2, hint: '자리 이동, 공격 도움닫기' }),
    block: { name: '블로킹', type: 'move', color: COL.screen, w: 1, speed: 4, marker: 'bar', hint: '네트 앞으로 가서 상대 스파이크를 막기' },
    serve: { name: '서브', type: 'ball', color: COL.serve, dash: '1.2 2.4', w: 1, speed: 12, arc: .16, cross: true, hint: '엔드라인 뒤에서 상대 코트로 넣기' },
    pass: kPass('리시브·패스', { speed: 7.5, arc: .3, hint: '언더·오버로 우리 편에게 띄워 주기' }),
    toss: { name: '토스', type: 'ball', color: COL.toss, dash: '1.2 2.4', w: 1, speed: 6.5, arc: .5, hint: '세터가 공격수 머리 위로 높게 올리기' },
    spike: { name: '스파이크', type: 'ball', color: COL.shot, w: 1.15, speed: 17, arc: .04, cross: true, spike: true, hint: '높이 뛰어 상대 코트에 강하게 내리꽂기' },
    tip: { name: '연타(페인트)', type: 'ball', color: COL.lob, dash: '', w: 1, speed: 5.5, arc: .45, cross: true, hint: '블로커 뒤로 살짝 넘기기' },
    def: kDef('수비 이동', { speed: 4.2 })
  },
  defaultKind: 'move',
  catchR: 1.2, homeR: 2.2, holdMin: .14, carryOnRun: false, noIntercept: true,
  tokenStyle(p) {
    if (p.pos === 'L') return { fill: '#facc15', stroke: p.t === 'A' ? '#2563eb' : '#b91c1c', ink: '#422006' };
    return null;
  },
  overlay(play, F) {
    if (play.opts && play.opts.zones === false) return '';
    let s = '';
    for (const t of ['A', 'B']) for (const [z, q] of Object.entries(VB_ZONES[t])) s += TX(q[0], q[1] + 3.2, z, 9, { op: .32, c: '#fff' });
    return s;
  },
  warnings(play, F) {
    const w = {};
    play.lines.filter(l => l.k === 'serve').forEach(l => { const p = play.players.find(x => x.id === l.pid); if (!p) return; const [x0, y0, x1, y1] = F.court; if (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1) w[p.id] = 1; });
    return w;
  },
  rules: {
    flight(ctx, f, u) {
      if (!f.K.spike || f.blockDone) return;
      const q = polyAt(f.pts, f.len * u), net = ctx.F.net;
      if ((f.pts[0][0] - net) * (q[0] - net) > 0) return;
      f.blockDone = true;
      const b = ctx.nearest(q, 1.4 * ctx.M, j => ctx.P[j].t !== f.team && Math.abs(ctx.pos[j][0] - net) < 1.6 * ctx.M);
      if (b < 0) return;
      const back = Math.sign(f.pts[0][0] - net), land = [net + back * .7 * ctx.M, q[1] + (q[1] < 75 ? 7 : -7)];
      ctx.call('블로킹!', ctx.pos[b], { color: '#22d3ee' });
      const pts = [q, land];
      ctx.ball.flight = { a: { id: 'blk' }, K: { speed: 6, arc: .3, base: .1, noHome: true, cross: true }, k: 'pass', h: b, team: ctx.P[b].t, t0: ctx.t, dur: .55, pts, drawnEnd: land, len: polyLen(pts), arc: .6 * ctx.M, snap: [], recv: -1, blockShot: true };
    },
    arrive(ctx, f, end) {
      const { P, ball, F } = ctx;
      const r = ctx.nearest(end, ctx.catchR, j => j !== f.h && !(f.blockShot && P[j].t === f.team));
      if (r >= 0) {
        ctx.give(r);
        if (ball.touchTeam === P[r].t) ball.touches++; else { ball.touchTeam = P[r].t; ball.touches = 1; }
        if (ball.touches > 3) { ctx.kill(); ctx.call('4번 터치!', ctx.pos[r], { color: '#f87171' }); ctx.big(`반칙! ${volleyball.teams[other(P[r].t)]} 득점`, { color: '#f87171' }); return true; }
        ctx.call(`${ball.touches}번째 터치`, ctx.pos[r], { color: '#fde047' });
        return true;
      }
      ball.rest = end; ctx.kill();
      const [x0, y0, x1, y1] = F.court, inside = end[0] >= x0 && end[0] <= x1 && end[1] >= y0 && end[1] <= y1;
      const side = end[0] < F.net ? 'A' : 'B';
      if (f.blockShot) { ctx.big(`${volleyball.teams[other(side)]} 블로킹 득점!`, { color: '#22d3ee' }); return true; }
      if (inside) ctx.big(`${volleyball.teams[other(side)]} 득점!`, { color: '#facc15' });
      else { ctx.call('아웃!', end, { color: '#f87171' }); ctx.big(`아웃! ${volleyball.teams[other(f.team)]} 득점`, { color: '#f87171' }); }
      return true;
    },
    step(ctx) {
      const { ball, acts, st } = ctx;
      if (!ball.init) { ball.init = 1; const h0 = ball.holder; if (h0 >= 0) { ball.touchTeam = ctx.P[h0].t; ball.touches = acts[h0].some(a => a.k === 'serve') ? 0 : 1; } }
      if (ball.holder < 0 || ball.flight || ball.dead) return false;
      const h = ball.holder, ready = acts[h].some(a => !a.done && (a.anchorLeg < 0 || st[h].done > a.anchorLeg));
      const later = acts[h].some(a => !a.done);
      if (!ready && !later && ctx.t - ball.gotAt > .75 && ctx.t > ctx.snapT + .8) {
        ctx.kill(); ball.rest = [...ctx.pos[h]]; ball.holder = -1;
        ctx.call('공을 잡고 있으면 안 돼요', ctx.pos[h], { color: '#f87171' }); ctx.big(`${volleyball.teams[other(ctx.P[h].t)]} 득점`, { color: '#f87171' });
      }
      return later;
    }
  },
  tools: ['rotate', 'zones'],
  tips: [
    ['3번 안에 넘기기', '리시브 → 토스 → 공격, 세 번의 터치로 공을 넘겨요. 네 번째 터치는 반칙이에요.'],
    ['잡지 않기', '배구는 공을 잡으면 안 돼요. 공을 받은 선수에게 다음 패스·토스 선이 없으면 공이 떨어져요.'],
    ['블로킹', '초록 블로킹 선으로 네트 앞에 서면, 스파이크가 지나갈 때 막아 낼 수 있어요.'],
    ['로테이션', '서브권을 되찾으면 시계 방향으로 한 칸씩 자리를 옮겨요. 「로테이션」 버튼으로 연습해 보세요.']
  ],
  presets: [
    { id: 'three', group: '공격', name: '3단 공격 (리시브-토스-스파이크)',
      desc: '상대 서브를 리베로가 받아 세터에게, 세터가 높게 토스, 레프트가 도움닫기 후 스파이크!',
      tip: '공격수는 토스가 올라간 뒤에 출발해야 타이밍이 맞아요.',
      players: [['A', 'OH', 82, 40], ['A', 'MB', 100, 75], ['A', 'S', 100, 106], ['A', 'OH', 55, 45], ['A', 'L', 56, 76], ['A', 'OP', 55, 105],
        ['B', 'OH', 140, 105], ['B', 'MB', 140, 75], ['B', 'S', 140, 45], ['B', 'OH', 185, 105], ['B', 'L', 185, 75], ['B', 'OP', 218, 48, { ball: 1 }]],
      lines: [[11, 'serve', [[-161, 28]]], [11, 'move', [[-25, 0]]], [2, 'move', [[8, -20]], { delay: .2 }], [4, 'pass', [[52, 10]]],
        [2, 'toss', [[0, -62]], { from: [8, -20] }], [0, 'move', [[20, 4]], { delay: 3.5 }], [0, 'spike', [[86, 56]], { from: [20, 4] }]] },
    { id: 'block', group: '수비', name: '블로킹으로 막기',
      desc: '상대가 레프트 쪽에서 스파이크를 때리면, 앞줄 두 명이 네트로 붙어 손을 뻗어 막아요.',
      tip: '공격수의 도움닫기 방향을 보고 미리 자리를 잡아요.',
      players: [['A', 'S', 110, 88, { ball: 1 }], ['A', 'OH', 84, 42], ['A', 'MB', 100, 75], ['A', 'OH', 55, 45], ['A', 'L', 55, 75], ['A', 'OP', 55, 105],
        ['B', 'MB', 138, 48], ['B', 'OH', 138, 75], ['B', 'OP', 138, 105], ['B', 'D', 185, 45], ['B', 'L', 185, 75], ['B', 'D', 185, 105]],
      lines: [[0, 'toss', [[-10, -44]]], [1, 'move', [[18, 3]], { delay: .9 }], [1, 'spike', [[88, 20]], { from: [18, 3] }],
        [6, 'block', [[-15, 1]], { delay: .6 }], [7, 'block', [[-15, -15]], { delay: .7 }]] },
    { id: 'tip', group: '공격', name: '연타(페인트) 공격',
      desc: '상대 블로커가 네트에 붙어 있을 때, 세게 때리지 않고 블로커 뒤 빈 곳으로 살짝 넘겨요.',
      tip: '상대 수비가 뒤로 물러나 있으면 앞쪽이 비어요.',
      players: [['A', 'S', 110, 88, { ball: 1 }], ['A', 'OH', 84, 42], ['A', 'MB', 100, 75], ['A', 'OH', 55, 45], ['A', 'L', 55, 75], ['A', 'OP', 55, 105],
        ['B', 'MB', 124, 48], ['B', 'OH', 124, 62], ['B', 'OP', 140, 104], ['B', 'D', 185, 45], ['B', 'L', 185, 75], ['B', 'D', 185, 105]],
      lines: [[0, 'toss', [[-10, -44]]], [1, 'move', [[18, 3]], { delay: .9 }], [1, 'tip', [[52, 40]], { from: [18, 3] }],
        [10, 'def', [[-30, 5]], { delay: 1.6 }]] },
    { id: 'rotation', group: '대형', name: '로테이션 자리 익히기',
      desc: '숫자 1~6은 코트의 자리(존)예요. 1번 자리 선수가 서브를 넣고, 서브권을 되찾을 때마다 시계 방향으로 한 칸씩 돌아요.',
      tip: '「로테이션」 버튼을 눌러 선수들이 어떻게 도는지 확인해 보세요.',
      players: [['A', 'OH', 100, 45], ['A', 'MB', 100, 75], ['A', 'S', 100, 105], ['A', 'OP', 55, 45], ['A', 'L', 55, 75], ['A', 'OH', 22, 105, { ball: 1 }],
        ['B', 'OH', 140, 105], ['B', 'MB', 140, 75], ['B', 'S', 140, 45], ['B', 'OP', 185, 105], ['B', 'L', 185, 75], ['B', 'OH', 185, 45]],
      lines: [[5, 'serve', [[160, -30]]], [5, 'move', [[33, 0]]], [10, 'pass', [[-45, -30]]], [8, 'toss', [[0, 58]]], [6, 'spike', [[-72, -25]]]] }
  ]
};
/* 로테이션: 시계 방향으로 한 칸 (2→1→6→5→4→3→2) */
function vbRotate(play, team) {
  const Z = VB_ZONES[team], next = { 2: 1, 1: 6, 6: 5, 5: 4, 4: 3, 3: 2 };
  const ps = play.players.filter(p => p.t === team);
  const taken = new Set();
  ps.map(p => { let best = null, bd = 1e9; for (const [z, q] of Object.entries(Z)) { if (taken.has(z)) continue; const d = dist([p.x, p.y], q); if (d < bd) { bd = d; best = z; } } if (best) taken.add(best); return [p, best]; })
    .forEach(([p, z]) => { if (!z) return; const q = Z[next[z]]; p.x = q[0]; p.y = q[1]; });
}

/* =====================================================================
   ⚾ 티볼 (야구)
   ===================================================================== */
const TB_HOME = [300, 520], TB_BASES = [TB_HOME, [427.3, 392.7], [300, 265.4], [172.7, 392.7]];
const TB = {
  name: '티볼 경기장', vb: '0 95 600 475', m: 10, tok: 15, ball: 4.8, lw: 2.2, flip: null, bounds: [4, 100, 596, 566], bases: TB_BASES, fenceR: 400,
  draw() {
    let s = `<rect x="0" y="95" width="600" height="475" fill="#2c6e35"/>`;
    s += `<path d="M300 520 L17.2 237.2 A400 400 0 0 1 582.8 237.2 Z" fill="#3b8c45"/>`;
    for (let r = 60; r < 400; r += 40) s += `<path d="M${300 - r * .7071} ${520 - r * .7071} A${r} ${r} 0 0 1 ${300 + r * .7071} ${520 - r * .7071}" fill="none" stroke="#45994f" stroke-width="18" stroke-opacity=".5"/>`;
    s += `<path d="M300 520 L17.2 237.2 A400 400 0 0 1 582.8 237.2 Z" fill="none" stroke="#c9a37a" stroke-width="10" stroke-opacity=".0"/>`;
    s += `<path d="M28 248 A385 385 0 0 1 572 248" fill="none" stroke="#b98d5f" stroke-width="18" stroke-opacity=".75"/>`;
    s += `<path d="M300 560 L470 378 A172 172 0 0 0 130 378 Z" fill="#c69563"/>`;
    const c = [300, 392.7], k = .62, sh = q => [c[0] + (q[0] - c[0]) * k, c[1] + (q[1] - c[1]) * k];
    const g = TB_BASES.map(sh);
    s += `<path d="M${g.map(q => q.join(' ')).join(' L')} Z" fill="#3b8c45"/>`;
    s += `<circle cx="300" cy="400" r="20" fill="#c69563"/><rect x="292" y="398" width="16" height="4" fill="#fff"/>`;
    s += `<circle cx="300" cy="522" r="26" fill="#c69563"/>`;
    s += LN(300, 520, 17.2, 237.2, 1.6) + LN(300, 520, 582.8, 237.2, 1.6);
    s += `<path d="M17.2 237.2 A400 400 0 0 1 582.8 237.2" fill="none" stroke="#f8fafc" stroke-width="3"/>`;
    s += `<rect x="279" y="508" width="12" height="22" fill="none" stroke="#fff" stroke-width="1"/><rect x="309" y="508" width="12" height="22" fill="none" stroke="#fff" stroke-width="1"/>`;
    TB_BASES.slice(1).forEach(q => s += `<rect x="${q[0] - 4.5}" y="${q[1] - 4.5}" width="9" height="9" fill="#fff" transform="rotate(45 ${q[0]} ${q[1]})"/>`);
    s += `<path d="M295 516 H305 V521 L300 526 L295 521 Z" fill="#fff"/><rect x="298" y="512" width="4" height="8" fill="#111827"/>`;
    s += TX(445, 410, '1루', 11, { op: .8 }) + TX(300, 252, '2루', 11, { op: .8 }) + TX(155, 410, '3루', 11, { op: .8 }) + TX(300, 562, '홈', 11, { op: .8 });
    s += TX(300, 132, '외야 펜스', 10, { op: .5 }) + TX(300, 440, '투수', 9, { op: .5 });
    return s;
  }
};
function tbBaseAt(q, r = 26) { let b = -1, bd = r; TB_BASES.forEach((p, i) => { const d = dist(p, q); if (d < bd) { bd = d; b = i; } }); return b; }
const teeball = {
  id: 'teeball', name: '티볼', icon: '⚾', ball: 'baseball',
  fields: { diamond: TB }, defaultField: 'diamond',
  teams: { A: '공격', B: '수비' },
  pos: { A: ['타자', '주자'], B: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'RC'] },
  posName: { 타자: '타자', 주자: '주자', P: '투수', C: '포수', '1B': '1루수', '2B': '2루수', '3B': '3루수', SS: '유격수', LF: '좌익수', CF: '중견수', RF: '우익수', RC: '우중간 수비' },
  max: 16,
  kinds: {
    run: kRun('주루', { speed: 5.2, snapBase: true, hint: '타자·주자가 베이스를 따라 달리기 (끝점 가까운 베이스까지 자동으로 이어져요)' }),
    field: kDef('수비 이동', { speed: 5, color: '#fca5a5', hint: '수비가 공이나 베이스 쪽으로 움직이기' }),
    hitG: { name: '땅볼 타격', type: 'ball', color: '#fb923c', w: 1.1, speed: 14, arc: .01, ease: 'roll', callCatch: false, hit: 'ground', noHome: true, hint: '티 위의 공을 쳐서 땅으로 굴리기' },
    hitF: { name: '뜬공 타격', type: 'ball', color: COL.lob, dash: '', w: 1.1, speed: 16, arc: .3, callCatch: false, hit: 'fly', noHome: true, hint: '공을 높이 띄워 치기' },
    throw: kPass('송구', { speed: 17, arc: .06, color: COL.pass, hint: '수비가 베이스나 동료에게 공 던지기' })
  },
  defaultKind: 'run',
  catchR: 1.5, homeR: 2.4, holdMin: .28, carryOnRun: true, snapOnHit: true, read: .8, loose: true, noIntercept: true,
  canPick: p => p.t === 'B', pickWord: '포구!',
  tokenStyle(p) { if (p.pos === '타자') return { fill: '#fde68a', stroke: '#2563eb', ink: '#1e3a8a' }; return null; },
  snapLine(play, p, pts) {
    /* 주루 선은 베이스를 차례로 따라가요 */
    const start = [p.x, p.y], end = [p.x + pts[pts.length - 1][0], p.y + pts[pts.length - 1][1]];
    let b0 = tbBaseAt(start, 40); if (b0 < 0) b0 = 0;
    let b1 = tbBaseAt(end, 70); if (b1 < 0) return null;
    if (b1 === b0) b1 = (b0 + 1) % 4;
    const out = []; let b = b0;
    for (let i = 0; i < 4; i++) { b = (b + 1) % 4; out.push([TB_BASES[b][0] - p.x, TB_BASES[b][1] - p.y]); if (b === b1) break; }
    return out;
  },
  rules: {
    release(ctx, f) { if (f.K.hit) { ctx.call('딱!', ctx.pos[f.h], { color: '#fde047' }); ctx.ball.batter = f.h; } },
    arrive(ctx, f, end) {
      const { ball } = ctx;
      if (f.K.hit) {
        if (dist(end, TB_HOME) > ctx.F.fenceR && f.K.hit === 'fly') { ball.rest = end; ctx.kill(); ctx.big('홈런!', { color: '#facc15' }); return true; }
        const r = ctx.nearest(end, ctx.catchR * (f.K.hit === 'fly' ? 1.1 : 1), j => ctx.P[j].t === 'B');
        if (r >= 0) {
          ctx.give(r);
          if (f.K.hit === 'fly') { ctx.setOut(f.h); ctx.big('플라이 아웃!', { color: '#f87171' }); ball.flyOut = ctx.t; }
          else ctx.call('포구!', ctx.pos[r]);
          tbJudge(ctx); return true;
        }
        ball.rest = end; ctx.call(f.K.hit === 'fly' ? '안타!' : '굴러가요', end, { color: '#fde047' }); return true;
      }
      const r = ctx.nearest(end, ctx.catchR, j => ctx.P[j].t === f.team && j !== f.h);
      if (r >= 0) { ctx.give(r); tbJudge(ctx); return true; }
      ball.rest = end; ctx.call('공이 빠졌어요!', end, { color: '#f87171' }); return true;
    },
    pick(ctx) { tbJudge(ctx); },
    legEnd(ctx, i, g) {
      if (ctx.P[i].t !== 'A') return;
      const b = tbBaseAt(g.pts[g.pts.length - 1]); if (b < 0) return;
      ctx.ball.arr = ctx.ball.arr || {}; ctx.ball.arr[b] = { i, t: ctx.t };
      if (b === 0 && !ctx.st[i].out) ctx.big('득점!', { color: '#facc15' });
      tbJudge(ctx);
    },
    step(ctx) { if (ctx.ball.holder >= 0 && !ctx.ball.flight) tbJudge(ctx, true); return false; }
  },
  tools: ['runners'],
  tips: [
    ['포스 아웃', '주자가 베이스에 닿기 전에, 공을 가진 수비가 그 베이스를 밟으면 아웃이에요.'],
    ['송구가 더 빨라요', '사람이 달리는 것보다 공을 던지는 게 훨씬 빨라요. 작전 보기로 공과 주자 중 누가 먼저 닿는지 확인해 보세요.'],
    ['중계 플레이', '외야에서 멀리 있는 베이스로 바로 던지기보다, 중간에 있는 내야수를 거치면 빠르고 정확해요.'],
    ['주루 선', '주루 선은 끝점 가까운 베이스까지 1루 → 2루 → 3루 → 홈 순서로 자동으로 이어져요.']
  ],
  presets: [
    { id: 'ground1b', group: '수비', name: '내야 땅볼 → 1루 아웃',
      desc: '유격수 쪽으로 굴러온 땅볼을 잡아 1루로 던져요. 타자보다 공이 먼저 1루에 닿으면 아웃!',
      tip: '1루수는 공이 맞자마자 베이스로 가서 기다려요.',
      players: [['A', '타자', 284, 522, { ball: 1 }],
        ['B', 'P', 300, 405], ['B', 'C', 300, 552], ['B', '1B', 440, 372], ['B', '2B', 362, 302], ['B', 'SS', 238, 302], ['B', '3B', 160, 372], ['B', 'LF', 165, 215], ['B', 'CF', 300, 170], ['B', 'RF', 435, 215]],
      lines: [[0, 'hitG', [[-41, -204]]], [0, 'run', [[143.3, -129.3]], { delay: .3 }], [5, 'field', [[6, 14]]], [3, 'field', [[-11, 19]]], [5, 'throw', [[191, 89]], { from: [6, 14] }]] },
    { id: 'cutoff', group: '수비', name: '중계 플레이 (외야 → 유격수 → 3루)',
      desc: '좌중간 안타를 좌익수가 잡아 유격수에게, 유격수가 3루로 이어 던져 3루까지 달린 주자를 잡아요.',
      tip: '외야수는 중계 선수(유격수)의 가슴을 보고 던져요.',
      players: [['A', '타자', 284, 522, { ball: 1 }], ['A', '주자', 420, 386],
        ['B', 'P', 300, 405], ['B', 'C', 300, 552], ['B', '1B', 440, 372], ['B', '2B', 362, 302], ['B', 'SS', 238, 302], ['B', '3B', 160, 372], ['B', 'LF', 165, 215], ['B', 'CF', 300, 170], ['B', 'RF', 435, 215]],
      lines: [[0, 'hitG', [[-69, -317]]], [0, 'run', [[143.3, -129.3], [16, -256.6]], { delay: .3 }], [1, 'run', [[-120, -120.6], [-247.3, 6.7]]],
        [8, 'field', [[46, -6]]], [6, 'field', [[-8, -50]]], [7, 'field', [[14, 19]]],
        [8, 'throw', [[65, 37]], { from: [46, -6] }], [6, 'throw', [[-63, 89]], { from: [-8, -50] }]] },
    { id: 'dp', group: '수비', name: '더블 플레이 (6-4-3)',
      desc: '1루 주자가 있을 때 유격수(6) → 2루수(4) → 1루수(3)로 이어 던져 한 번에 두 명을 잡아요.',
      tip: '2루수는 공보다 먼저 2루 베이스에 가 있어야 해요.',
      players: [['A', '타자', 284, 522, { ball: 1 }], ['A', '주자', 420, 386],
        ['B', 'P', 300, 405], ['B', 'C', 300, 552], ['B', '1B', 440, 372], ['B', '2B', 362, 302], ['B', 'SS', 238, 302], ['B', '3B', 160, 372], ['B', 'LF', 165, 215], ['B', 'CF', 300, 170], ['B', 'RF', 435, 215]],
      lines: [[0, 'hitG', [[-34, -210]]], [0, 'run', [[143.3, -129.3]], { delay: .5 }], [1, 'run', [[-120, -120.6]]],
        [6, 'field', [[8, 8]]], [5, 'field', [[-58, -35]]], [4, 'field', [[-11, 19]]],
        [6, 'throw', [[66, -35]], { from: [8, 8] }], [5, 'throw', [[67, 89]], { from: [-58, -35] }]] },
    { id: 'tagup', group: '공격', name: '뜬공 & 태그업',
      desc: '중견수 뜬공이 잡힌 뒤 3루 주자가 홈으로 출발해요(태그업). 중견수는 홈으로 강하게 던져요.',
      tip: '주자는 공이 잡힌 다음에 출발해야 해요. 누가 먼저 홈에 닿을까요?',
      players: [['A', '타자', 284, 522, { ball: 1 }], ['A', '주자', 180, 398],
        ['B', 'P', 300, 405], ['B', 'C', 300, 552], ['B', '1B', 440, 372], ['B', '2B', 362, 302], ['B', 'SS', 238, 302], ['B', '3B', 160, 372], ['B', 'LF', 165, 215], ['B', 'CF', 300, 170], ['B', 'RF', 435, 215]],
      lines: [[0, 'hitF', [[30, -380]]], [0, 'run', [[143.3, -129.3]], { delay: .3 }], [1, 'run', [[120, 122]], { delay: 2.6 }],
        [9, 'field', [[12, -28]]], [3, 'field', [[0, -28]]], [9, 'throw', [[0, 352]], { from: [12, -28] }]] }
  ]
};
function tbJudge(ctx, quiet) {
  const { ball, P, pos, st } = ctx; const h = ball.holder; if (h < 0 || P[h].t !== 'B') return;
  const at = pos[h], b = tbBaseAt(at, 1.6 * ctx.M);
  ctx.legs.forEach((L, i) => {
    if (P[i].t !== 'A' || st[i].out || !st[i].cur) return;
    const g = st[i].cur.g, tgt = tbBaseAt(g.pts[g.pts.length - 1]);
    if (b >= 0 && tgt === b) { ctx.setOut(i); ctx.call('아웃!', pos[i], { color: '#f87171' }); ctx.big(`${['홈', '1루', '2루', '3루'][b]} 아웃!`, { color: '#f87171' }); return; }
    if (tbBaseAt(pos[i], 1.6 * ctx.M) < 0 && dist(at, pos[i]) < 1.1 * ctx.M) { ctx.setOut(i); ctx.big('태그 아웃!', { color: '#f87171' }); }
  });
  if (!quiet && b >= 0 && ball.arr && ball.arr[b] && !st[ball.arr[b].i].out && !ball.arr[b].judged && ctx.t - ball.arr[b].t < 3) {
    ball.arr[b].judged = true; ctx.big(`${['홈', '1루', '2루', '3루'][b]} 세이프!`, { color: '#4ade80' });
  }
}
