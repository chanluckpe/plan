/* =====================================================================
   종목 정의 3 — 피구 · 플라잉디스크 · 핸드볼
   ===================================================================== */

/* =====================================================================
   🔴 피구
   ===================================================================== */
const DB = {
  name: '피구장', vb: '-36 -36 272 172', m: 10, tok: 6.5, ball: 2.9, lw: 1.1, flip: 'y', bounds: [-30, -30, 230, 130], center: 100,
  draw() {
    let s = `<rect x="-36" y="-36" width="272" height="172" fill="#c79b6b"/>`;
    s += `<path d="M100 -25 H225 V125 H100 V100 H200 V0 H100 Z" fill="#3b82f6" fill-opacity=".16"/>`;
    s += `<path d="M100 -25 H-25 V125 H100 V100 H0 V0 H100 Z" fill="#ef4444" fill-opacity=".16"/>`;
    s += `<rect x="-25" y="-25" width="250" height="150" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="3 3" stroke-opacity=".7"/>`;
    s += `<rect x="0" y="0" width="200" height="100" fill="#d2a777" stroke="#fff" stroke-width="1.3"/>` + LN(100, 0, 100, 100, 1.3);
    s += TX(50, 54, '우리 팀 내야', 7, { op: .5, c: '#1e3a8a' }) + TX(150, 54, '상대 팀 내야', 7, { op: .5, c: '#7f1d1d' });
    s += TX(204, -14, '우리 팀 외야', 5.4, { op: .7, c: '#1e40af' }) + TX(-4, -14, '상대 팀 외야', 5.4, { op: .7, c: '#991b1b' });
    s += TX(212, 18, '우리 외야', 5, { op: .7, c: '#1e40af', rot: 90 }) + TX(-12, 82, '상대 외야', 5, { op: .7, c: '#991b1b', rot: -90 });
    return s;
  }
};
const dodgeball = {
  id: 'dodgeball', name: '피구', icon: '🔴', ball: 'dodgeball',
  fields: { court: DB }, defaultField: 'court',
  teams: { A: '우리 팀', B: '상대 팀' },
  pos: { A: ['내야', '외야'], B: ['내야', '외야'] },
  posName: { 내야: '내야 선수', 외야: '외야 선수(상대 코트 바깥)' },
  max: 24,
  kinds: {
    move: kRun('이동', { speed: 3.8 }),
    dodge: { name: '피하기', type: 'move', color: COL.screen, w: 1, speed: 6, hint: '날아오는 공을 보고 옆으로 재빨리 피하기' },
    pass: kPass('패스', { speed: 10, arc: .2, hint: '같은 팀(외야 포함)에게 공 넘기기' }),
    throw: { name: '공격 던지기', type: 'ball', color: COL.shot, w: 1.15, speed: 13, arc: .03, aim: true, attack: true, callCatch: false, hint: '상대 선수를 맞히려고 던지기 (끝점 가까운 상대를 노려요)' }
  },
  defaultKind: 'move',
  catchR: 1.2, homeR: 2.0, holdMin: .35, carryOnRun: true, loose: true, pickWord: '공 잡았다!', interWord: '가로챘다!',
  tokenStyle(p) {
    if (p.pos === '외야') return p.t === 'A' ? { fill: '#dbeafe', stroke: '#2563eb', ink: '#1e3a8a', dash: 1 } : { fill: '#fee2e2', stroke: '#dc2626', ink: '#7f1d1d', dash: 1 };
    return null;
  },
  warnings(play) {
    const w = {};
    play.players.forEach(p => {
      const inCourt = p.x > 0 && p.x < 200 && p.y > 0 && p.y < 100;
      if (p.pos === '외야') { if (inCourt) w[p.id] = 1; return; }
      if (!inCourt || (p.t === 'A' ? p.x > 100 : p.x < 100)) w[p.id] = 1;
    });
    return w;
  },
  rules: {
    arrive(ctx, f, end) {
      if (!f.K.attack) return false;
      const { P, ball } = ctx;
      const hit = ctx.nearest(end, .95 * ctx.M, j => P[j].t !== f.team && P[j].pos !== '외야');
      if (hit >= 0) {
        ctx.setOut(hit);
        ball.rest = [end[0] + (end[0] < 100 ? 9 : -9), end[1] + 7];
        ctx.call('맞았다!', ctx.pos[hit], { color: '#f87171' }); ctx.big('아웃!', { color: '#f87171' });
        return true;
      }
      ball.rest = end; ctx.call('피했다!', end, { color: '#38bdf8' }); return true;
    },
    step(ctx) {
      const { P, pos, st } = ctx;
      P.forEach((p, j) => {
        if (p.pos === '외야' || st[j].out || st[j].lineSaid) return;
        if ((p.t === 'A' && pos[j][0] > 100 + ctx.F.tok * .4) || (p.t === 'B' && pos[j][0] < 100 - ctx.F.tok * .4)) { st[j].lineSaid = 1; ctx.call('선 넘었어요!', pos[j], { color: '#f87171' }); }
      });
      return false;
    }
  },
  tips: [
    ['외야 활용', '외야 선수는 상대 코트 바깥에서 상대를 뒤나 옆에서 노려요. 내야와 외야가 공을 주고받으면 상대가 계속 몸을 돌려야 해요.'],
    ['피하기', '초록 피하기 선은 빠르게 움직여요. 공이 던져지는 순간 옆으로 피하면 공이 빗나가요.'],
    ['공격 던지기', '빨간 공격 선은 끝점 가까운 상대 선수를 노려 던져요. 던지는 순간 그 자리에 없으면 빗나가요.'],
    ['선 밟기', '내야 선수는 가운데 선을 넘으면 안 돼요. 넘어가면 바로 알려 줘요.']
  ],
  presets: [
    { id: 'crossfire', group: '공격', name: '외야와 협공',
      desc: '내야에서 외야로 공을 넘기면, 상대는 등 뒤에서 공이 날아와요. 외야가 바로 던져 맞혀요.',
      tip: '공이 넘어가는 동안 상대는 앞뒤를 동시에 볼 수 없어요.',
      players: [['A', '내야', 75, 50, { ball: 1 }], ['A', '내야', 40, 25], ['A', '내야', 40, 75], ['A', '내야', 20, 50], ['A', '외야', 215, 50], ['A', '외야', 150, -14],
        ['B', '내야', 125, 30], ['B', '내야', 140, 55], ['B', '내야', 165, 25], ['B', '내야', 170, 75], ['B', '내야', 180, 50], ['B', '외야', -14, 50]],
      lines: [[0, 'pass', [[140, 0]]], [4, 'throw', [[-45, 25]]], [9, 'dodge', [[0, 16]], { delay: 3.2 }], [7, 'move', [[-10, 8]], { delay: 1.2 }]] },
    { id: 'dodge', group: '수비', name: '피하고 → 줍고 → 반격',
      desc: '상대가 던지는 순간 옆으로 피해요. 빗나간 공을 주워 바로 되던지면 상대가 미처 못 피해요.',
      tip: '공을 끝까지 보고 몸을 옆으로 빼요. 피한 뒤엔 공을 먼저 주워요.',
      players: [['A', '내야', 80, 50, { ball: 1 }], ['A', '내야', 45, 25], ['A', '내야', 45, 78], ['A', '내야', 20, 50], ['A', '외야', 215, 50],
        ['B', '내야', 150, 50], ['B', '내야', 130, 20], ['B', '내야', 175, 80], ['B', '내야', 185, 30], ['B', '외야', -14, 50]],
      lines: [[0, 'throw', [[70, 0]]], [5, 'dodge', [[0, -22]], { delay: .55 }], [5, 'move', [[-4, 0]], { from: [0, -22], delay: .3 }], [5, 'throw', [[-70, 0]], { from: [-4, 0] }]] },
    { id: 'shake', group: '공격', name: '빠른 패스로 흔들기',
      desc: '외야 위·아래로 빠르게 공을 돌리면 상대가 공을 따라 몸을 움직여요. 한쪽으로 몰린 순간 던져요.',
      tip: '세게 던지는 것보다 빠른 패스로 빈틈을 만드는 게 먼저예요.',
      players: [['A', '내야', 70, 50, { ball: 1 }], ['A', '내야', 40, 25], ['A', '내야', 40, 75], ['A', '외야', 150, -14], ['A', '외야', 150, 114], ['A', '외야', 215, 50],
        ['B', '내야', 135, 22], ['B', '내야', 160, 45], ['B', '내야', 180, 70], ['B', '내야', 125, 75], ['B', '외야', -14, 50]],
      lines: [[0, 'pass', [[80, -64]]], [3, 'pass', [[0, 128]], { delay: .1 }], [4, 'throw', [[-10, -34]]], [6, 'dodge', [[5, 55]], { delay: 1.4 }], [7, 'dodge', [[5, -20]], { delay: 3.3 }]] }
  ]
};

/* =====================================================================
   🥏 플라잉디스크 (얼티미트)
   ===================================================================== */
const UL = {
  name: '얼티미트 필드', vb: '-25 -25 750 350', m: 10, tok: 17, ball: 6.6, lw: 2.6, flip: 'y', bounds: [-20, -20, 720, 320], ez: { A: 580, B: 120 },
  draw() {
    let s = grass(-25, -25, 750, 350, 50, 'v');
    s += `<rect x="0" y="0" width="120" height="300" fill="#1d4ed8" fill-opacity=".22"/><rect x="580" y="0" width="120" height="300" fill="#1d4ed8" fill-opacity=".22"/>`;
    s += `<rect x="0" y="0" width="700" height="300" fill="none" stroke="#fff" stroke-width="1.6"/>` + LN(120, 0, 120, 300, 1.6) + LN(580, 0, 580, 300, 1.6);
    [[220, 150], [480, 150]].forEach(q => s += `<path d="M${q[0] - 5} ${q[1] - 5} L${q[0] + 5} ${q[1] + 5} M${q[0] + 5} ${q[1] - 5} L${q[0] - 5} ${q[1] + 5}" stroke="#fff" stroke-width="1.4"/>`);
    s += TX(60, 156, '상대 엔드존', 13, { op: .7, rot: -90 }) + TX(640, 156, '우리 팀 득점 엔드존', 13, { op: .75, rot: 90 });
    s += TX(350, 318, '우리 팀 공격 방향 ▶', 13, { op: .55 });
    return s;
  }
};
const ultimate = {
  id: 'ultimate', name: '플라잉디스크', icon: '🥏', ball: 'disc',
  fields: { field: UL }, defaultField: 'field',
  teams: { A: '공격', B: '수비' },
  pos: { A: ['H', 'C'], B: ['M', 'D'] },
  posName: { H: '핸들러(디스크 던지기)', C: '커터(달려서 받기)', M: '마커(디스크 가진 선수 막기)', D: '수비' },
  max: 16,
  kinds: {
    cut: kRun('컷', { speed: 5.4, hint: '빈 곳으로 뛰어 디스크를 받으러 가기' }),
    pass: { name: '패스', type: 'ball', color: COL.pass, dash: '1.2 2.2', w: 1, speed: 10, arc: .1, spin: 1, hint: '곡선으로 그리면 디스크도 휘어서 날아가요' },
    huck: { name: '롱패스(헉)', type: 'ball', color: COL.lob, dash: '', w: 1.1, speed: 13, arc: .2, spin: 1, hint: '엔드존을 향해 멀리 던지기' },
    mark: kDef('수비 이동', { speed: 5 })
  },
  defaultKind: 'cut',
  catchR: 1.3, homeR: 2.6, holdMin: .4, carryOnRun: false, travelWord: '트래블! 디스크를 들고는 못 달려요(피벗만)', interWord: '블록! 턴오버', missWord: '턴오버!',
  rules: {
    catch(ctx, f, r, inter) {
      if (inter) return false;
      const { P, pos, F } = ctx, ez = F.ez[P[r].t];
      if ((P[r].t === 'A' && pos[r][0] >= ez) || (P[r].t === 'B' && pos[r][0] <= ez)) { ctx.kill(); ctx.call('캐치!', pos[r]); ctx.big('엔드존 득점!', { color: '#facc15' }); return true; }
      return false;
    },
    step(ctx) {
      const { ball, t } = ctx;
      if (ball.holder < 0 || ball.flight || ball.dead) { ball.stall = 0; return false; }
      if (t < ctx.snapT) return false;
      const n = Math.floor(t - Math.max(ball.gotAt, ctx.snapT) + .2);
      if (n >= 1 && n !== ball.stall) {
        ball.stall = n;
        if (n >= 10) { ctx.kill(); ctx.big('스톨 아웃! 턴오버', { color: '#f87171' }); return false; }
        ctx.call(`스톨 ${n}`, ctx.pos[ball.holder], { color: '#e2e8f0' });
      }
      return false;
    }
  },
  tips: [
    ['디스크 들고 못 달려요', '디스크를 잡으면 한 발을 축으로 도는 피벗만 할 수 있어요. 그래서 커터들이 쉬지 않고 움직여야 해요.'],
    ['스톨 카운트', '마커가 10까지 세기 전에 던져야 해요. 작전 보기에서 스톨 숫자가 올라가는 걸 확인해 보세요.'],
    ['곡선 패스', '패스 선을 휘게 그리면 디스크도 그 길로 휘어 날아가요. 수비를 돌아가는 백핸드·포핸드를 연습해 보세요.'],
    ['득점', '상대 쪽 엔드존 안에서 디스크를 잡으면 1점이에요.']
  ],
  presets: [
    { id: 'vstack', group: '공격', name: '수직 스택 (아웃 컷 → 롱패스)',
      desc: '커터들이 한 줄로 서 있다가, 맨 앞 선수가 옆으로 빠져나가 받고(아웃 컷), 셋째 선수가 엔드존으로 달려가 롱패스를 받아요.',
      tip: '한 명이 비켜 준 공간으로 다음 선수가 들어가는 게 스택의 원리예요.',
      players: [['A', 'H', 190, 150, { ball: 1 }], ['A', 'H', 160, 205], ['A', 'C', 270, 150], ['A', 'C', 310, 150], ['A', 'C', 350, 150], ['A', 'C', 390, 150],
        ['B', 'M', 200, 158], ['B', 'D', 170, 196], ['B', 'D', 282, 160], ['B', 'D', 322, 160], ['B', 'D', 362, 160], ['B', 'D', 402, 160]],
      lines: [[2, 'cut', [[10, -10], [30, -95]]], [0, 'pass', [[60, -80], [115, -92]], { delay: .4 }], [4, 'cut', [[20, 40], [255, 66]], { delay: .6 }], [2, 'huck', [[338, 66]], { from: [30, -95] }],
        [8, 'mark', [[18, -86]], { delay: .6 }], [10, 'mark', [[200, 50]], { delay: 2.1 }]] },
    { id: 'hstack', group: '공격', name: '수평 스택 (언더 컷 → 딥)',
      desc: '커터 네 명이 가로로 서요. 한 명이 디스크 쪽으로 다가와 받고(언더 컷), 다른 한 명이 깊이 달려가 롱패스를 받아요.',
      tip: '다가오는 컷과 멀어지는 컷을 동시에 하면 수비가 둘 다 막기 어려워요.',
      players: [['A', 'H', 180, 60], ['A', 'H', 160, 150, { ball: 1 }], ['A', 'H', 180, 240], ['A', 'C', 330, 50], ['A', 'C', 330, 120], ['A', 'C', 330, 180], ['A', 'C', 330, 250],
        ['B', 'M', 170, 158], ['B', 'D', 192, 68], ['B', 'D', 192, 232], ['B', 'D', 342, 58], ['B', 'D', 342, 128], ['B', 'D', 342, 188], ['B', 'D', 342, 258]],
      lines: [[4, 'cut', [[-60, 10]]], [1, 'pass', [[112, -20]], { delay: .3 }], [5, 'cut', [[150, 20], [270, 10]], { delay: 1.0 }], [4, 'huck', [[275, 70]], { from: [-60, 10], delay: 1.0 }],
        [11, 'mark', [[-50, 10]], { delay: .7 }], [12, 'mark', [[200, 20]], { delay: 1.8 }]] },
    { id: 'cup', group: '수비', name: '존 수비 (컵)',
      desc: '수비 세 명이 디스크를 가진 선수 앞을 컵 모양으로 감싸 가운데 패스를 막고, 나머지는 구역을 나눠 지켜요.',
      tip: '디스크가 옆으로 가면 컵도 함께 옆으로 미끄러져요.',
      players: [['A', 'H', 190, 150, { ball: 1 }], ['A', 'H', 180, 60], ['A', 'H', 180, 240], ['A', 'C', 330, 90], ['A', 'C', 330, 210], ['A', 'C', 440, 150],
        ['B', 'M', 208, 136], ['B', 'M', 208, 164], ['B', 'D', 226, 150], ['B', 'D', 300, 60], ['B', 'D', 300, 240], ['B', 'D', 470, 150]],
      zones: [[214, 150, 26, 34], [300, 60, 45, 40], [300, 240, 45, 40], [470, 150, 80, 90]],
      lines: [[0, 'pass', [[-10, -90]]], [6, 'mark', [[-10, -90]], { delay: .8 }], [7, 'mark', [[-10, -78]], { delay: .9 }], [8, 'mark', [[-14, -84]], { delay: 1 }], [9, 'mark', [[-10, -10]], { delay: 1 }],
        [1, 'pass', [[148, 32]], { delay: .2 }]] }
  ]
};

/* =====================================================================
   🤾 핸드볼 · 추크볼
   ===================================================================== */
const hbX = (y, r, gx = 400) => { const dy = y < 85 ? 85 - y : y > 115 ? y - 115 : 0; const v = Math.sqrt(Math.max(0, r * r - dy * dy)); return gx > 200 ? gx - v : gx + v; };
function hbArea(q, gx) { const y = clamp(q[1], 85, 115); return dist(q, [gx, y]); }
function courtFloor() { return `<rect x="-26" y="-26" width="452" height="252" fill="#b9814b"/>` + planks(0, 0, 400, 200, 10, '#d39b5d', '#cc9356'); }
const HB = {
  name: '핸드볼 코트', vb: '-26 -26 452 252', m: 10, tok: 8.5, ball: 3.4, lw: 1.7, flip: 'y', bounds: [-20, -20, 420, 220],
  goals: { A: { x: 400, y0: 85, y1: 115 }, B: { x: 0, y0: 85, y1: 115 } },
  draw() {
    let s = courtFloor();
    s += `<path d="M0 25 A60 60 0 0 1 60 85 L60 115 A60 60 0 0 1 0 175 Z" fill="#2b6cb0"/><path d="M400 25 A60 60 0 0 0 340 85 L340 115 A60 60 0 0 0 400 175 Z" fill="#2b6cb0"/>`;
    const w = 1.2;
    s += `<rect x="0" y="0" width="400" height="200" fill="none" stroke="#fff" stroke-width="${w}"/>` + LN(200, 0, 200, 200, w);
    s += `<path d="M0 25 A60 60 0 0 1 60 85 L60 115 A60 60 0 0 1 0 175" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M400 25 A60 60 0 0 0 340 85 L340 115 A60 60 0 0 0 400 175" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M29.6 0 A90 90 0 0 1 90 85 L90 115 A90 90 0 0 1 29.6 200" fill="none" stroke="#fff" stroke-width="${w}" stroke-dasharray="6 5"/><path d="M370.4 0 A90 90 0 0 0 310 85 L310 115 A90 90 0 0 0 370.4 200" fill="none" stroke="#fff" stroke-width="${w}" stroke-dasharray="6 5"/>`;
    s += LN(70, 95, 70, 105, w) + LN(330, 95, 330, 105, w);
    s += `<rect x="-10" y="85" width="10" height="30" fill="#e5e7eb" fill-opacity=".35" stroke="#fff" stroke-width="1"/><rect x="400" y="85" width="10" height="30" fill="#e5e7eb" fill-opacity=".35" stroke="#fff" stroke-width="1"/>`;
    s += TX(30, 100, '6m 골에어리어', 6.5, { op: .75, rot: -90 }) + TX(300, 214, '우리 팀 공격 방향 ▶', 8, { op: .6 });
    return s;
  }
};
const TC = {
  name: '추크볼 코트', vb: '-26 -26 452 252', m: 10, tok: 8.5, ball: 3.4, lw: 1.7, flip: 'y', bounds: [-20, -20, 420, 220], tchouk: true,
  frames: [[0, 100], [400, 100]],
  draw() {
    let s = courtFloor();
    s += `<path d="M0 70 A30 30 0 0 1 0 130 Z" fill="#dc2626" fill-opacity=".55"/><path d="M400 70 A30 30 0 0 0 400 130 Z" fill="#dc2626" fill-opacity=".55"/>`;
    const w = 1.2;
    s += `<rect x="0" y="0" width="400" height="200" fill="none" stroke="#fff" stroke-width="${w}"/>` + LN(200, 0, 200, 200, w, '#fff', 'stroke-opacity=".6"');
    s += `<path d="M0 70 A30 30 0 0 1 0 130" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M400 70 A30 30 0 0 0 400 130" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    [[0, 100, 1], [400, 100, -1]].forEach(([x, y, d]) => { s += `<rect x="${x - 3}" y="${y - 6}" width="6" height="12" fill="#111827" stroke="#facc15" stroke-width="1.1"/>` + LN(x, y - 5, x + d * 4, y - 5, .5, '#facc15') + LN(x, y + 5, x + d * 4, y + 5, .5, '#facc15'); });
    s += TX(30, 100, '금지구역', 6, { op: .8, rot: -90 }) + TX(370, 100, '금지구역', 6, { op: .8, rot: 90 });
    s += TX(200, 214, '양쪽 프레임 어디로든 슛할 수 있어요', 7.5, { op: .6 });
    return s;
  }
};
const handball = {
  id: 'handball', name: '핸드볼', icon: '🤾', ball: 'handball',
  fields: { court: HB }, defaultField: 'court',
  teams: { A: '공격', B: '수비' },
  pos: { A: ['GK', 'LW', 'LB', 'CB', 'RB', 'RW', 'PV'], B: ['GK', 'LW', 'LB', 'CB', 'RB', 'RW', 'PV'] },
  posName: { GK: '골키퍼', LW: '왼쪽 윙', LB: '왼쪽 백', CB: '센터백', RB: '오른쪽 백', RW: '오른쪽 윙', PV: '피벗' },
  max: 16,
  kinds: {
    run: kRun('이동', { speed: 5 }),
    dribble: kDrib('드리블', { speed: 4.2 }),
    pass: kPass('패스', { speed: 11, arc: .08 }),
    shot: kShot('슛', { speed: 17, arc: .05, hint: '골대를 향해 던지기' }),
    def: kDef('수비 이동', { speed: 4.6 })
  },
  defaultKind: 'run',
  catchR: 1.2, homeR: 2.4, holdMin: .3, carryOnRun: true, saveR: 1.0, loose: true, pickWord: '공 잡았다!',
  tokenStyle: gkStyle,
  goalTarget(ctx, p, end) {
    const F = ctx.F;
    if (F.tchouk) { const fr = F.frames.slice().sort((a, b) => dist(a, end) - dist(b, end))[0]; return { pt: [...fr], frame: fr }; }
    return soccerGoal(ctx, p, end, 12);
  },
  warnings(play, F) {
    const w = {};
    play.players.forEach(p => {
      if (F.tchouk) { if (F.frames.some(fr => dist([p.x, p.y], fr) < 30)) w[p.id] = 1; return; }
      if (p.pos !== 'GK' && (hbArea([p.x, p.y], 0) < 60 || hbArea([p.x, p.y], 400) < 60)) w[p.id] = 1;
    });
    return w;
  },
  rules: {
    release(ctx, f) {
      const { P, pos, F, ball } = ctx;
      if (F.tchouk) {
        if (ball.passTeam !== f.team) { ball.passTeam = f.team; ball.passes = 0; }
        if (!f.K.shot) { ball.passes++; if (ball.passes > 3) ctx.call(`${ball.passes}번째 패스! (3번까지)`, pos[f.h], { color: '#f87171' }); }
        else ball.passes = 0;
        return;
      }
      if (P[f.h].pos === 'GK') return;
      const gx = f.team === 'A' ? 400 : 0;
      if (hbArea(pos[f.h], gx) < 60) { ctx.ball.flight = null; ctx.ball.rest = [...pos[f.h]]; ctx.kill(); ctx.call('골에어리어 침범!', pos[f.h], { color: '#f87171' }); ctx.big('반칙! 공격권이 넘어가요', { color: '#f87171' }); }
    },
    arrive(ctx, f, end) {
      const { P, pos, F, ball, M } = ctx;
      if (!F.tchouk) {
        if (f.K.shot) return false;
        const r = ctx.nearest(end, ctx.catchR, j => P[j].t === f.team && j !== f.h);
        if (r >= 0 && P[r].pos !== 'GK' && hbArea(pos[r], f.team === 'A' ? 400 : 0) < 60) { ctx.give(r); ctx.kill(); ctx.call('골에어리어 침범!', pos[r], { color: '#f87171' }); ctx.big('반칙! 공격권이 넘어가요', { color: '#f87171' }); return true; }
        return false;
      }
      if (f.K.shot) {
        const fr = f.goal.frame, nx = fr[0] < 200 ? 1 : -1;
        const dx = end[0] - f.pts[0][0], dy = end[1] - f.pts[0][1], L = Math.hypot(dx, dy) || 1;
        let rx = dx / L, ry = dy / L; rx = -rx;
        if (rx * nx < .25) rx = .25 * nx;
        const n = Math.hypot(rx, ry), len = clamp(.55 * L, 4 * M, 9 * M), land = [fr[0] + rx / n * len, fr[1] + ry / n * len];
        ctx.call('팡!', fr, { color: '#fde047' });
        const pts = [[...fr], land];
        ball.flight = { a: { id: 'reb' }, K: { speed: 9, arc: .25, base: .1, noHome: true }, k: 'reb', h: f.h, team: f.team, t0: ctx.t, dur: .1 + len / (9 * M), pts, drawnEnd: land, len: polyLen(pts), arc: .25 * len, snap: [], recv: -1, rebound: true };
        return true;
      }
      if (f.rebound) {
        const d = ctx.nearest(end, ctx.catchR * 1.1, j => P[j].t !== f.team);
        if (d >= 0) { ctx.give(d); ctx.call('수비 성공!', pos[d], { color: '#38bdf8' }); return true; }
        ball.rest = end; ctx.kill();
        const a = ctx.nearest(end, ctx.catchR, j => P[j].t === f.team);
        if (a >= 0) { ctx.big('실점: 공격팀이 리바운드를 잡았어요', { color: '#f87171' }); return true; }
        const inCourt = end[0] >= 0 && end[0] <= 400 && end[1] >= 0 && end[1] <= 200;
        const inZone = F.frames.some(fr => dist(end, fr) < 30);
        if (!inCourt) ctx.big('실점: 코트 밖으로 나갔어요', { color: '#f87171' });
        else if (inZone) ctx.big('실점: 금지구역에 떨어졌어요', { color: '#f87171' });
        else ctx.big('득점!', { color: '#facc15' });
        return true;
      }
      const r = ctx.nearest(end, ctx.catchR, j => P[j].t === f.team && j !== f.h);
      if (r >= 0) { ctx.give(r); ctx.call('캐치!', pos[r]); return true; }
      ball.rest = end; ctx.kill(); ctx.big('공을 떨어뜨렸어요 → 공격권 넘어가요', { color: '#f87171' }); return true;
    }
  },
  tools: [],
  tips: [
    ['골에어리어', '골키퍼가 아닌 선수는 6m 파란 구역 안에 들어가면 안 돼요. 안에 서 있으면 빨갛게 표시되고, 그 안에서 받거나 던지면 반칙이에요.'],
    ['크로스와 피벗', '백 선수들이 서로 엇갈려 달리면 수비가 누구를 막을지 헷갈려요. 피벗은 수비 사이에서 공을 받아 돌아서 슛해요.'],
    ['골키퍼 각', '골키퍼가 서 있는 쪽 반대편 구석을 노려요.']
  ],
  presets: [
    { id: 'cross', group: '공격', name: '크로스 플레이', field: 'court',
      desc: 'CB가 오른쪽으로 파고들면 RB가 등 뒤로 엇갈려 가운데로 들어와요. CB의 패스를 받은 RB가 점프슛!',
      tip: '엇갈리는 순간 수비가 누구를 막을지 망설여요.',
      players: [['A', 'CB', 250, 100, { ball: 1 }], ['A', 'LB', 265, 45], ['A', 'RB', 265, 155], ['A', 'LW', 370, 8], ['A', 'RW', 370, 192], ['A', 'PV', 322, 128],
        ['B', 'GK', 392, 100], ['B', 'LW', hbX(25, 64), 25], ['B', 'LB', hbX(55, 64), 55], ['B', 'CB', hbX(85, 64), 85], ['B', 'CB', hbX(115, 64), 115], ['B', 'RB', hbX(145, 64), 145], ['B', 'RW', hbX(175, 64), 175]],
      lines: [[0, 'run', [[28, 32]]], [2, 'run', [[10, -30], [30, -52]], { delay: .6 }], [0, 'pass', [[46, 2]], { from: [28, 32] }], [2, 'shot', [[135, -65]], { from: [30, -52] }], [11, 'def', [[-14, -8]], { delay: .5 }]] },
    { id: 'pivot', group: '공격', name: '피벗에게 넣고 돌아서 슛', field: 'court',
      desc: 'LB가 바깥으로 움직여 수비를 끌어내면, CB가 수비 사이의 피벗에게 패스! 피벗이 돌아서 슛해요.',
      tip: '피벗은 골에어리어 선 밖에서 받아야 해요.',
      players: [['A', 'CB', 250, 100, { ball: 1 }], ['A', 'LB', 265, 45], ['A', 'RB', 265, 155], ['A', 'LW', 370, 8], ['A', 'RW', 370, 192], ['A', 'PV', 322, 100],
        ['B', 'GK', 392, 100], ['B', 'LW', hbX(25, 64), 25], ['B', 'LB', hbX(55, 64), 55], ['B', 'CB', hbX(85, 64), 82], ['B', 'CB', hbX(115, 64), 118], ['B', 'RB', hbX(145, 64), 145], ['B', 'RW', hbX(175, 64), 175]],
      lines: [[1, 'run', [[25, 15]]], [8, 'def', [[-15, 2]], { delay: .6 }], [0, 'pass', [[72, 0]], { delay: .5 }], [5, 'run', [[6, 12]]], [5, 'shot', [[78, 12]], { from: [6, 12] }]] },
    { id: 'fast', group: '공격', name: '속공 (골키퍼 롱패스)', field: 'court',
      desc: '골키퍼가 공을 잡자마자 앞으로 달리는 윙에게 길게 던져요. 수비가 돌아오기 전에 슛!',
      tip: '윙은 골키퍼가 공을 잡는 순간 이미 달리고 있어야 해요.',
      players: [['A', 'GK', 12, 100, { ball: 1 }], ['A', 'LW', 90, 20], ['A', 'CB', 120, 110], ['A', 'RW', 100, 185], ['B', 'GK', 392, 100], ['B', 'CB', 200, 60], ['B', 'RB', 170, 150]],
      lines: [[1, 'run', [[150, 0], [260, 5]]], [0, 'pass', [[318, -72]], { delay: .4 }], [1, 'shot', [[310, 92]], { from: [260, 5] }], [5, 'def', [[110, 30]], { delay: .5 }], [4, 'def', [[0, -8]], { delay: 1.5 }], [6, 'def', [[130, -20]], { delay: .6 }]] },
    { id: 'd321', group: '수비', name: '3-2-1 수비', field: 'court',
      desc: '골에어리어 선에 3명, 그 앞에 2명, 가장 앞에 1명이 서서 공을 따라 앞으로 나가 막아요.',
      tip: '공을 가진 선수 앞 수비가 한 걸음 나가고, 옆 수비는 안쪽을 좁혀요.',
      players: [['A', 'CB', 240, 100, { ball: 1 }], ['A', 'LB', 262, 45], ['A', 'RB', 262, 155], ['A', 'LW', 370, 8], ['A', 'RW', 370, 192], ['A', 'PV', 330, 140],
        ['B', 'GK', 392, 100], ['B', 'LW', hbX(30, 64), 30], ['B', 'CB', 336, 100], ['B', 'RW', hbX(170, 64), 170], ['B', 'LB', 316, 62], ['B', 'RB', 316, 138], ['B', 'CB', 292, 100]],
      zones: [[hbX(30, 64), 30, 18, 24], [336, 100, 14, 28], [hbX(170, 64), 170, 18, 24], [316, 62, 18, 16], [316, 138, 18, 16], [292, 100, 18, 18]],
      lines: [[0, 'pass', [[22, -55]]], [1, 'pass', [[108, -37]], { delay: .2 }], [10, 'def', [[-12, -12]], { delay: .5 }], [7, 'def', [[-6, -14]], { delay: 1.1 }], [12, 'def', [[-6, -20]], { delay: .6 }]] }
  ]
};

const SPORTS = [basketball, volleyball, teeball, flag, soccer, futsal, dodgeball, ultimate, handball];
const SPORT = Object.fromEntries(SPORTS.map(s => [s.id, s]));
function posList(sport, field, t) { const pb = sport.posByField && sport.posByField[field]; return (pb || sport.pos)[t]; }
