/* =====================================================================
   종목 정의 5 — 🟣 넷볼
   코트 30.5m × 15.25m, 3구역(⅓)과 골 서클(반지름 4.9m). 포지션마다 들어갈 수 있는 구역이 정해져 있어요.
   ===================================================================== */
const NB_T1 = 101.67, NB_T2 = 203.33, NB_CY = 76.25, NB_R = 49;
const NB_ALLOW = { GS: ['A', 'Ac'], GA: ['C', 'A', 'Ac'], WA: ['C', 'A'], C: ['D', 'C', 'A'], WD: ['D', 'C'], GD: ['D', 'Dc', 'C'], GK: ['D', 'Dc'] };
function nbCode(t, x, y) {
  if (x < 0 || x > 305 || y < 0 || y > 152.5) return null;
  const cl = dist([x, y], [0, NB_CY]) <= NB_R, cr = dist([x, y], [305, NB_CY]) <= NB_R;
  const third = x < NB_T1 ? 'L' : x < NB_T2 ? 'M' : 'R';
  if (t === 'A') return cr ? 'Ac' : cl ? 'Dc' : third === 'L' ? 'D' : third === 'M' ? 'C' : 'A';
  return cl ? 'Ac' : cr ? 'Dc' : third === 'R' ? 'D' : third === 'M' ? 'C' : 'A';
}
const nbOk = (p, x, y) => { const c = nbCode(p.t, x, y), a = NB_ALLOW[p.pos]; return !a || c === null || a.includes(c); };
const NB = {
  name: '넷볼 코트', vb: '-16 -16 337 184.5', m: 10, tok: 9, ball: 3.6, lw: 1.6, flip: 'y', bounds: [-12, -12, 317, 164.5],
  rings: { A: [303, NB_CY], B: [2, NB_CY] },
  draw() {
    let s = `<rect x="-16" y="-16" width="337" height="184.5" fill="#17604f"/>`;
    s += `<rect x="0" y="0" width="${NB_T1}" height="152.5" fill="#22906f"/><rect x="${NB_T1}" y="0" width="${NB_T2 - NB_T1}" height="152.5" fill="#1f8667"/><rect x="${NB_T2}" y="0" width="${305 - NB_T2}" height="152.5" fill="#22906f"/>`;
    s += `<path d="M0 ${NB_CY - NB_R} A${NB_R} ${NB_R} 0 0 1 0 ${NB_CY + NB_R} Z" fill="#2aa17d"/><path d="M305 ${NB_CY - NB_R} A${NB_R} ${NB_R} 0 0 0 305 ${NB_CY + NB_R} Z" fill="#2aa17d"/>`;
    const w = 1;
    s += `<rect x="0" y="0" width="305" height="152.5" fill="none" stroke="#fff" stroke-width="${w}"/>` + LN(NB_T1, 0, NB_T1, 152.5, w) + LN(NB_T2, 0, NB_T2, 152.5, w);
    s += `<path d="M0 ${NB_CY - NB_R} A${NB_R} ${NB_R} 0 0 1 0 ${NB_CY + NB_R}" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M305 ${NB_CY - NB_R} A${NB_R} ${NB_R} 0 0 0 305 ${NB_CY + NB_R}" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<circle cx="152.5" cy="${NB_CY}" r="4.5" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    [[2, 1], [303, -1]].forEach(([x, d]) => s += `<rect x="${x < 100 ? -3 : 305}" y="${NB_CY - 1}" width="3" height="2" fill="#e5e7eb"/><circle cx="${x}" cy="${NB_CY}" r="2.4" fill="none" stroke="#f97316" stroke-width=".9"/>`);
    s += TX(50, 146, '우리 수비 ⅓', 6.5, { op: .55 }) + TX(152.5, 146, '가운데 ⅓', 6.5, { op: .55 }) + TX(255, 146, '우리 공격 ⅓ ▶', 6.5, { op: .55 });
    s += TX(270, 12, '골 서클', 5.5, { op: .6 }) + TX(35, 12, '골 서클', 5.5, { op: .6 });
    return s;
  }
};
const netball = {
  id: 'netball', name: '넷볼', icon: '🟣', ball: 'volleyball',
  fields: { court: NB }, defaultField: 'court',
  teams: { A: '우리 팀', B: '상대 팀' },
  pos: { A: ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'], B: ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'] },
  posName: { GS: '골 슈터', GA: '골 어택', WA: '윙 어택', C: '센터', WD: '윙 디펜스', GD: '골 디펜스', GK: '골 키퍼' },
  max: 14,
  kinds: {
    lead: kRun('리드(빈 곳으로)', { speed: 5.2, hint: '공을 받으려고 빈 곳으로 빠르게 뛰어나가기' }),
    pass: kPass('패스', { speed: 11, arc: .05, hint: '가슴·바운드 패스로 동료에게' }),
    lob: kPass('로브 패스', { color: COL.lob, dash: '', speed: 8, arc: .3, hint: '수비 머리 위로 높게 넘기는 패스' }),
    shot: kShot('슛', { speed: 7, arc: .45, arcMin: 2, hint: 'GS·GA만 골 서클 안에서 링을 향해 던져요' }),
    def: kDef('수비 이동', { speed: 4.8 })
  },
  defaultKind: 'lead',
  catchR: 1.2, homeR: 2.2, holdMin: .4, carryOnRun: false, travelWord: '스텝 반칙! 공을 잡으면 발을 옮길 수 없어요', saveR: .01, goalWord: '골! (1점)',
  goalTarget(ctx, p) { return { pt: [...ctx.F.rings[p.t]] }; },
  tokenStyle(p) { return null; },
  warnings(play) { const w = {}; play.players.forEach(p => { if (!nbOk(p, p.x, p.y)) w[p.id] = 1; }); return w; },
  rules: {
    release(ctx, f) {
      if (!f.K.shot) return;
      const p = ctx.P[f.h], c = nbCode(p.t, ...ctx.pos[f.h]);
      if (!['GS', 'GA'].includes(p.pos) || c !== 'Ac') {
        ctx.ball.flight = null; ctx.ball.rest = [...ctx.pos[f.h]]; ctx.kill();
        ctx.call('슛 반칙!', ctx.pos[f.h], { color: '#f87171' }); ctx.big('슛은 GS·GA가 골 서클 안에서만!', { color: '#f87171' });
      }
    },
    step(ctx) {
      const { P, pos, st, ball, t } = ctx;
      P.forEach((p, j) => { if (st[j].zoneSaid || st[j].out) return; if (!nbOk(p, pos[j][0], pos[j][1])) { st[j].zoneSaid = 1; ctx.call(`${p.pos} 구역 반칙!`, pos[j], { color: '#f87171' }); } });
      if (ball.holder >= 0 && !ball.flight && !ball.dead && t > ctx.snapT && t - Math.max(ball.gotAt, ctx.snapT) > 3) {
        ctx.kill(); ctx.call('3초!', pos[ball.holder], { color: '#f87171' }); ctx.big('3초 반칙! 공이 상대에게', { color: '#f87171' });
      }
      return false;
    }
  },
  tips: [
    ['내 구역 지키기', '포지션마다 들어갈 수 있는 구역이 정해져 있어요. GS는 공격 ⅓과 골 서클만, C는 서클을 뺀 모든 구역이에요. 구역을 벗어나면 빨갛게 표시돼요.'],
    ['공을 잡으면 멈추기', '공을 잡은 선수는 발을 옮길 수 없고(스텝 반칙), 3초 안에 패스하거나 슛해야 해요.'],
    ['슛은 둘만', '골 서클 안의 GS와 GA만 슛할 수 있어요. 그래서 공을 서클 안까지 이어 주는 패스가 중요해요.'],
    ['리드', '수비를 떼어 내고 빈 곳으로 짧고 빠르게 뛰어나가 공을 받아요. 받는 자리가 좋아야 다음 패스가 쉬워요.']
  ],
  presets: []
};
const NB_A = () => [['A', 'C', 152.5, 76, { ball: 1 }], ['A', 'GA', 210, 45], ['A', 'WA', 210, 112], ['A', 'GS', 262, 76], ['A', 'WD', 95, 112], ['A', 'GD', 95, 45], ['A', 'GK', 40, 76]];
const NB_B = () => [['B', 'GK', 268, 96], ['B', 'GD', 220, 40], ['B', 'WD', 220, 120], ['B', 'C', 165, 95], ['B', 'WA', 100, 124], ['B', 'GA', 100, 30], ['B', 'GS', 40, 100]];
netball.presets.push(
  { id: 'centre', group: '공격', name: '센터 패스 → 골 서클 슛',
    desc: '센터 패스로 WA에게, WA가 GA에게, GA가 서클 안으로 들어온 GS에게 이어 줘요. GS가 링을 향해 슛!',
    tip: '공을 받는 사람이 먼저 빈 곳으로 뛰어나가야(리드) 패스가 이어져요.',
    players: [...NB_A(), ...NB_B()],
    lines: [[2, 'lead', [[-30, -2]]], [0, 'pass', [[27.5, 32]], { delay: .2 }], [1, 'lead', [[45, 15]], { delay: .8 }], [2, 'pass', [[46, -52]], { from: [-30, -2] }],
      [3, 'lead', [[23, 0]], { delay: 1.6 }], [1, 'pass', [[74, 31]], { from: [45, 15] }], [3, 'shot', [[41, .25]], { from: [23, 0] }], [8, 'def', [[30, 8]], { delay: 1.0 }]] },
  { id: 'gadrive', group: '공격', name: 'GA 서클 파고들기 슛',
    desc: 'GS가 수비를 데리고 서클 뒤로 빠지면, 빈 서클 앞쪽으로 GA가 파고들어 패스를 받고 바로 슛해요.',
    tip: '한 명이 수비를 끌고 나가면 다른 한 명에게 공간이 생겨요.',
    players: [...NB_A(), ...NB_B()],
    lines: [[2, 'lead', [[-30, -2]]], [0, 'pass', [[27.5, 32]], { delay: .2 }], [3, 'lead', [[25, 28]], { delay: .4 }], [1, 'lead', [[60, 30]], { delay: 1.2 }],
      [2, 'pass', [[59, -37]], { from: [-30, -2] }], [1, 'shot', [[93, 31.25]], { from: [60, 30] }], [7, 'def', [[12, 12]], { delay: .8 }], [8, 'def', [[30, 20]], { delay: 1.8 }]] },
  { id: 'lob', group: '공격', name: '로브 패스로 GS에게',
    desc: '상대 GK가 GS 앞을 막고 있으면, WA가 머리 위로 높게 넘겨(로브) 뒤에 있는 GS에게 줘요. GS가 받아 바로 슛!',
    tip: '키가 큰 GS는 수비 뒤쪽 공간에서 높은 공을 받기 좋아요.',
    players: [['A', 'WA', 215, 118, { ball: 1 }], ['A', 'GA', 230, 50], ['A', 'GS', 292, 100], ['A', 'C', 180, 80], ['A', 'WD', 120, 112], ['A', 'GD', 95, 45], ['A', 'GK', 40, 76],
      ['B', 'GK', 276, 88], ['B', 'GD', 236, 58], ['B', 'WD', 222, 126], ['B', 'C', 175, 92], ['B', 'WA', 100, 124], ['B', 'GA', 100, 30], ['B', 'GS', 40, 100]],
    lines: [[0, 'lob', [[77, -20]]], [2, 'shot', [[11, -23.75]]]] },
  { id: 'cutlane', group: '수비', name: '패스길 끊기 (WD 가로채기)',
    desc: '상대 C가 옆으로 패스하려는 순간, 우리 WD가 상대 WA보다 먼저 그 자리로 뛰어들어 공을 가로채요.',
    tip: '내가 막는 선수와 공 사이에 서 있으면 패스가 오는 길이 보여요.',
    players: [['A', 'WD', 95, 112], ['A', 'GD', 95, 45], ['A', 'GK', 40, 76], ['A', 'C', 150, 70], ['A', 'WA', 200, 112], ['A', 'GA', 210, 45], ['A', 'GS', 262, 76],
      ['B', 'C', 165, 95, { ball: 1 }], ['B', 'WA', 100, 135], ['B', 'GA', 100, 30], ['B', 'GS', 40, 100], ['B', 'GK', 268, 96], ['B', 'GD', 220, 40], ['B', 'WD', 220, 120]],
    lines: [[7, 'pass', [[-37, 25]], { delay: .4 }], [8, 'lead', [[28, -12]], { delay: 1.6 }], [0, 'def', [[30, 6]], { delay: .2 }]] },
  { id: 'gkcircle', group: '수비', name: 'GK 서클 지키기 (로브 끊기)',
    desc: '상대가 서클 안 GS에게 높게 넘기면, 우리 GK가 공이 떨어질 곳을 먼저 읽고 뛰어올라 끊어 내요.',
    tip: 'GK는 GS만 보지 말고 공을 던지는 선수의 눈과 팔을 함께 봐요.',
    players: [['A', 'GK', 40, 76], ['A', 'GD', 80, 40], ['A', 'WD', 95, 112], ['A', 'C', 150, 76], ['A', 'GS', 262, 76], ['A', 'GA', 210, 45], ['A', 'WA', 210, 112],
      ['B', 'GA', 95, 30, { ball: 1 }], ['B', 'GS', 15, 110], ['B', 'WA', 110, 120], ['B', 'C', 160, 90], ['B', 'GK', 268, 96], ['B', 'GD', 220, 40], ['B', 'WD', 220, 120]],
    lines: [[7, 'lob', [[-69, 32]], { delay: .2 }], [8, 'lead', [[10, -48]], { delay: 1.5 }], [0, 'def', [[-12, -12]], { delay: .3 }]] },
  { id: 'offside', group: '수비', name: '구역 반칙 조심하기',
    desc: '상대 GA가 서클 안으로 파고들 때 우리 WD가 따라 들어가면 구역 반칙이에요. 서클 안은 GD와 GK만 지킬 수 있어요.',
    tip: '내 구역 끝까지 따라간 뒤에는 멈추고, 안쪽 수비(GD·GK)에게 맡겨요.',
    players: [['A', 'WD', 100, 70], ['A', 'GD', 60, 40], ['A', 'GK', 30, 110], ['A', 'C', 150, 76], ['A', 'GS', 262, 76], ['A', 'GA', 210, 45], ['A', 'WA', 210, 112],
      ['B', 'C', 150, 95, { ball: 1 }], ['B', 'GA', 110, 55], ['B', 'GS', 20, 120], ['B', 'WA', 110, 125], ['B', 'GK', 268, 96], ['B', 'GD', 220, 40], ['B', 'WD', 220, 120]],
    lines: [[8, 'lead', [[-75, 15]]], [7, 'pass', [[-115, -25]], { delay: 1.0 }], [0, 'def', [[-55, 4]], { delay: .5 }], [8, 'shot', [[-108, 6.25]], { from: [-75, 15] }]] }
);
SPORTS.push(netball);
SPORT.netball = netball;
