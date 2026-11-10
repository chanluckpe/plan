/* =====================================================================
   종목 정의 2 — 플래그풋볼 · 축구 · 풋살
   ===================================================================== */

/* =====================================================================
   🏈 플래그풋볼 (기존 작전판 좌표 그대로)
   ===================================================================== */
const FF = {
  name: '플래그풋볼 필드', vb: '0 0 400 392', m: 17.5, tok: 12.5, ball: 6, lw: 3.4, flip: 'x', bounds: [12, 10, 388, 382], los: 250,
  draw() {
    let s = `<rect x="0" y="0" width="400" height="392" fill="#134e2a"/>`;
    for (let y = 10; y < 392; y += 80) s += `<rect x="0" y="${y}" width="400" height="40" fill="#15803d" fill-opacity=".3"/>`;
    [[10, '15 YD'], [90, '10 YD'], [170, '5 YD']].forEach(([y, t]) => { s += LN(0, y, 400, y, 1.5, '#ffffff', 'stroke-opacity=".3"'); s += TX(12, y + 14, t, 10, { a: 'start', op: .6 }); });
    s += LN(0, 330, 400, 330, 1.5, '#ffffff', 'stroke-opacity=".25"');
    s += LN(0, 138, 400, 138, 1.5, '#fbbf24', 'stroke-opacity=".8" stroke-dasharray="6 4"') + TX(388, 132, 'BLITZ LINE (7 YD)', 10, { a: 'end', c: '#fbbf24', op: 1 });
    s += LN(0, 250, 400, 250, 2.5, '#60a5fa') + TX(388, 244, 'SCRIMMAGE LINE', 10, { a: 'end', c: '#93c5fd', op: 1 });
    s += TX(388, 384, '▲ 공격 방향', 10, { a: 'end', op: .5 });
    return s;
  }
};
const FF_OFF = [
  ['singleback', '싱글백', 'QB 뒤에 RB 1명, 양 끝에 WR 2명이 균형 있게 서는 표준 대형이에요. 왼쪽 WR의 슬랜트로 빠르게 패스!', '런과 패스를 모두 쓸 수 있어 처음 배우는 팀에 좋아요.',
    [['C', 200, 262], ['QB', 200, 290, 1], ['RB', 200, 322], ['WR', 50, 262], ['WR', 350, 262]],
    [[3, 'route', [[0, -30], [60, -95]]], [4, 'route', [[0, -200]]], [2, 'route', [[30, -12], [110, -28]]], [0, 'route', [[0, -75], [-12, -62]]], [1, 'pass', [[-90, -123]]]]],
  ['spread', '스프레드', 'WR을 좌우로 넓게 벌려 필드를 크게 쓰는 대표 대형이에요. 안쪽 WR이 인(In) 라우트로 가로질러요.', '수비 사이 간격이 넓어져 QB가 보기 편해요.',
    [['C', 200, 262], ['QB', 200, 316, 1], ['WR', 40, 262], ['WR', 120, 262], ['WR', 360, 262]],
    [[2, 'route', [[0, -200]]], [3, 'route', [[0, -80], [100, -80]]], [4, 'route', [[0, -105], [-12, -92]]], [0, 'route', [[0, -30], [70, -45]]], [1, 'pass', [[20, -134]]]]],
  ['bunch', '번치', 'WR 3명이 삼각형으로 모여 섰다가 엇갈려 달려 맨투맨 수비를 헷갈리게 해요.', '시작이 좁아 존 수비 상대로는 공간이 답답할 수 있어요.',
    [['C', 200, 262], ['QB', 200, 310, 1], ['WR', 300, 262], ['WR', 325, 284], ['WR', 275, 284]],
    [[2, 'route', [[0, -110], [-50, -160]]], [3, 'route', [[25, -40], [60, -45]]], [4, 'route', [[0, -75], [-150, -75]]], [0, 'route', [[-20, -20], [-130, -25]]], [1, 'pass', [[-75, -101]], { delay: .9 }]]],
  ['trips', '트립스', '한쪽에 WR 3명을 몰아 숫자로 이겨요. 딥·미들·숏 세 층으로 수비를 벌려요.', '반대쪽이 비어 수비가 한쪽만 막으면 답답해져요.',
    [['C', 200, 262], ['QB', 200, 310, 1], ['WR', 265, 262], ['WR', 320, 262], ['WR', 370, 262]],
    [[4, 'route', [[0, -190]]], [3, 'route', [[0, -100], [40, -145]]], [2, 'route', [[0, -15], [95, -30]]], [0, 'route', [[0, -35], [-120, -55]]], [1, 'pass', [[160, -193]]]]],
  ['twins', '트윈스', 'WR 2명이 한쪽에서 짝을 이뤄 컬과 코너를 겹쳐 수비 한 명을 괴롭혀요.', '반대쪽 공격 선택지가 단순해져요.',
    [['C', 200, 262], ['QB', 200, 316, 1], ['RB', 150, 316], ['WR', 300, 262], ['WR', 360, 262]],
    [[3, 'route', [[0, -110], [50, -160]]], [4, 'route', [[0, -80], [-10, -68]]], [2, 'route', [[-40, -10], [-110, -40]]], [0, 'route', [[0, -60], [-70, -60]]], [1, 'pass', [[150, -214]]]]],
  ['iform', 'I 포메이션 (핸드오프)', 'QB 뒤로 RB 2명이 세로로 서요. QB가 뒤 RB에게 공을 건네고(핸드오프) RB가 바깥으로 달려요.', '패스할 리시버가 적어 러닝 플레이 위주예요.',
    [['C', 200, 262], ['QB', 200, 286, 1], ['RB', 200, 314], ['RB', 200, 342], ['WR', 350, 262]],
    [[1, 'handoff', [[-6, 50]]], [3, 'carry', [[-40, -20], [-60, -80], [-50, -170]]], [2, 'route', [[40, -12], [110, -20]]], [4, 'route', [[0, -200]]], [0, 'route', [[0, -70], [-12, -58]]]]],
  ['doubleback', '더블백 (핸드오프)', 'QB 양옆 뒤에 RB를 두어 어느 쪽으로 달릴지 숨겨요. 오른쪽 RB가 공을 받아 달려요.', '바깥 리시버가 적어 가운데가 붐벼요.',
    [['C', 200, 262], ['QB', 200, 290, 1], ['RB', 160, 320], ['RB', 240, 320], ['WR', 40, 262]],
    [[1, 'handoff', [[34, 26]]], [3, 'carry', [[50, -15], [90, -70], [85, -160]]], [2, 'route', [[-40, -10], [-110, -20]]], [4, 'route', [[0, -200]]], [0, 'route', [[0, -75], [12, -62]]]]],
  ['rollout', '롤아웃 패스', 'QB가 스냅 후 공을 들고 오른쪽으로 이동(볼 캐리)하고, 도착한 곳에서 코너로 달리는 WR에게 던져요. 블리처를 피하면서 던질 수 있어요.', 'QB의 볼 캐리 선 끝에서 패스 선을 이어 그려요. 스크리미지 라인을 넘어서 던지면 반칙!',
    [['C', 200, 262], ['QB', 200, 316, 1], ['RB', 150, 316], ['WR', 300, 262], ['WR', 360, 262]],
    [[3, 'route', [[0, -110], [50, -160]]], [4, 'route', [[0, -80], [-10, -68]]], [1, 'carry', [[60, 10], [110, 0]]], [1, 'pass', [[150, -200]], { from: [110, 0] }], [2, 'route', [[-40, -10], [-110, -40]]], [0, 'route', [[0, -60], [-70, -60]]]]],
  ['motion', '모션 후 패스', '스냅 전에 왼쪽 WR이 옆으로 이동(모션)해 수비 반응을 확인해요. 모션 끝에서 바로 위로 달려요.', '모션을 따라 움직이는 수비가 있으면 맨투맨, 가만히 있으면 존이에요.',
    [['C', 200, 262], ['QB', 200, 316, 1], ['WR', 40, 262], ['WR', 290, 262], ['WR', 360, 262]],
    [[2, 'motion', [[50, 0], [90, 0]]], [2, 'route', [[90, -60], [150, -110]], { from: [90, 0] }], [3, 'route', [[0, -120]]], [4, 'route', [[0, -95], [-14, -82]]], [0, 'route', [[0, -30], [-60, -40]]], [1, 'pass', [[-10, -164]]]]]
];
const FF_DEF = [
  ['man', '맨투맨 수비', '수비가 공격수 한 명씩 맡아 바짝 따라가요. B 1명은 QB에게 달려가요.', '번치처럼 엇갈리는 라우트에 약해요.',
    [['B', 175, 138], ['DB', 40, 205], ['DB', 120, 205], ['DB', 200, 215], ['DB', 360, 205]],
    [[0, 'def', [[23, 150]]], [1, 'def', [[0, 34]]], [2, 'def', [[0, 34]]], [3, 'def', [[0, 26]]], [4, 'def', [[0, 34]]]], []],
  ['cover2', '커버 2 존', '앞쪽 2구역, 뒤쪽 2구역으로 나눠 맡아요. 긴 패스를 잘 막아요.', '가운데 깊은 곳과 양 구석이 약해요.',
    [['B', 200, 138], ['DB', 110, 205], ['DB', 290, 205], ['S', 110, 95], ['S', 290, 95]],
    [[0, 'def', [[0, 150]]]], [[100, 205, 95, 36], [300, 205, 95, 36], [100, 92, 98, 52], [300, 92, 98, 52]]],
  ['131', '1-3-1 존', '앞에 3명이 짧은 패스를 막고, 뒤에서 S 1명이 깊은 곳을 지켜요.', '양쪽 깊은 곳이 비기 쉬워요.',
    [['B', 200, 138], ['DB', 70, 205], ['DB', 200, 210], ['DB', 330, 205], ['S', 200, 78]],
    [[0, 'def', [[0, 150]]]], [[70, 205, 68, 34], [200, 210, 62, 34], [330, 205, 68, 34], [200, 80, 185, 44]]],
  ['blitz', '블리츠', '블리처 2명이 동시에 QB에게 달려가 급하게 던지게 만들어요.', '앞쪽이 비어 빠른 패스에 크게 뚫릴 수 있어요.',
    [['B', 155, 138], ['B', 245, 138], ['DB', 40, 205], ['DB', 120, 205], ['DB', 360, 205]],
    [[0, 'def', [[37, 155]]], [1, 'def', [[-37, 155]]], [2, 'def', [[0, 34]]], [3, 'def', [[0, 34]]], [4, 'def', [[0, 34]]]], []]
];
/* 스크리미지 라인 기준 실제 전진 거리 (16px = 1야드) */
function flagGain(F, q) {
  const yd = Math.round((F.los - q[1]) / 16);
  return { yd, txt: yd > 0 ? `${yd}야드 전진` : yd < 0 ? `${-yd}야드 손실` : '전진 없음' };
}
const flag = {
  id: 'flag', name: '플래그풋볼', icon: '🏈', ball: 'football',
  fields: { field: FF }, defaultField: 'field',
  teams: { A: '공격', B: '수비' },
  pos: { A: ['QB', 'C', 'WR', 'RB'], B: ['B', 'DB', 'S'] },
  posName: { QB: '쿼터백', C: '센터', WR: '와이드 리시버', RB: '러닝백', B: '블리처', DB: '디펜시브 백', S: '세이프티' },
  max: 14,
  kinds: {
    route: kRun('러닝 라우트', { speed: 5.2, hint: '리시버가 달리는 길 (패스를 받으러 가기)' }),
    carry: { name: '볼 캐리', type: 'move', color: '#f97316', dash: '3 1.5', w: 1, speed: 4.8, withBall: true, hint: '공을 받은 선수가 들고 달리는 길' },
    motion: { name: '모션', type: 'move', color: COL.motion, dash: '2.6 .9 .6 .9', w: .9, speed: 3.5, preSnap: true, hint: '스냅 전에 옆으로 움직이기' },
    pass: kPass('패스', { speed: 14, arc: .16, dash: '.6 1.8', hint: 'QB가 던지는 공의 길' }),
    handoff: { name: '핸드오프', type: 'ball', color: '#fde047', dash: '.6 1.2', w: .9, speed: 4.5, arc: 0, base: .1, hint: 'QB가 러닝백에게 공을 손으로 건네기' },
    def: kDef('수비 커버리지', { dash: '1.8 1.2', speed: 5 })
  },
  defaultKind: 'route',
  catchR: 1.9, homeR: 2.4, holdMin: .3, carryOnRun: true, snapT: .6, read: .9,
  warnings(play) { const w = {}; play.players.forEach(p => { if (p.t === 'B' && p.pos === 'B' && p.y > 140) w[p.id] = 1; }); return w; },
  rules: {
    release(ctx, f) {
      /* 전진 패스는 스크리미지 라인 뒤에서만 */
      if (f.k === 'pass' && ctx.pos[f.h][1] < ctx.F.los - 4) {
        ctx.ball.flight = null; ctx.ball.rest = [...ctx.pos[f.h]]; ctx.kill();
        ctx.call('반칙!', ctx.pos[f.h], { color: '#f87171' }); ctx.big('반칙! 스크리미지 라인을 넘어서 던졌어요', { color: '#f87171' });
      }
    },
    catch(ctx, f, r, inter) {
      if (f.k === 'handoff') { ctx.call('핸드오프', ctx.pos[r]); ctx.ball.run = true; return true; }
      if (!inter) { ctx.call('캐치!', ctx.pos[r]); ctx.ball.caught = true; return true; }
      return false;
    },
    step(ctx) {
      const { ball, P, pos, t, snapT, st, legs, acts } = ctx;
      if (!ball.said && t >= 0) { ball.said = 1; const c = P.findIndex(p => p.pos === 'C'); ctx.call('SET…', c >= 0 ? pos[c] : null, { color: '#e2e8f0' }); }
      if (ball.said === 1 && t >= snapT) { ball.said = 2; const c = P.findIndex(p => p.pos === 'C'); ctx.call('HUT!', c >= 0 ? pos[c] : null, { color: '#fde047' }); }
      const h = ball.holder;
      if (h < 0 || ball.flight || ball.dead || t <= snapT || P[h].t !== 'A') return false;
      const gain = () => flagGain(ctx.F, pos[h]);
      /* 플래그를 뺏기면 그 자리에서 끝 */
      const d = ctx.nearest(pos[h], .95 * ctx.M, j => P[j].t === 'B');
      if (d >= 0) {
        const sack = ball.firstRelease === null && !ball.run;
        st[h].stop = true; ctx.kill();
        ctx.call('플래그!', pos[h], { color: '#f87171' });
        ctx.big(sack ? `색! QB가 플래그를 뺏겼어요 (${gain().txt})` : `플래그! ${gain().txt}에서 멈춤`, { color: '#f87171' });
        return false;
      }
      /* 공 가진 선수가 더 움직일 길도, 던질 공도 없으면 플레이 끝 → 실제 전진 거리 */
      const moving = st[h].cur || st[h].li < legs[h].length, pending = acts[h].some(a => !a.done);
      if (!moving && !pending) {
        ctx.kill();
        const g = gain(), col = g.yd > 0 ? '#facc15' : '#f87171';
        if (ball.caught) ctx.big(`패스 성공! ${g.txt}`, { color: col });
        else if (ball.run || ball.firstRelease !== null) ctx.big(`러닝 ${g.txt}`, { color: col });
        else ctx.big(`QB가 공을 들고 멈췄어요 (${g.txt})`, { color: col });
      }
      return false;
    }
  },
  tips: [
    ['스냅과 모션', '분홍 모션 선은 스냅(HUT!) 전에 움직여요. 다른 선수는 스냅 뒤에 출발해요.'],
    ['패스 타이밍', 'QB는 스냅 후 잠깐 읽고 던져요. 리시버가 공이 떨어지는 곳에 제때 닿는지 확인해 보세요.'],
    ['플래그', '공을 가진 선수 옆에 수비가 닿으면 플래그를 뺏겨 공격이 끝나요. QB가 던지기 전에 뺏기면 색(Sack)이에요.'],
    ['전진 거리', '공을 잡은 뒤에도 선이 이어져 있으면 계속 달려요. 플레이가 끝난 자리와 스크리미지 라인 사이의 거리가 진짜 전진 거리예요.'],
    ['롤아웃 패스', 'QB가 볼 캐리로 옆으로 이동한 뒤, 그 끝에서 패스 선을 이어 그리면 움직이며 던질 수 있어요. 단, 스크리미지 라인을 넘어서 던지면 반칙이에요.'],
    ['블리츠 규칙', '블리처(B)는 스크리미지 라인에서 7야드 떨어진 블리츠 라인 뒤에서 출발해야 해요. 앞에 서 있으면 빨갛게 표시돼요.']
  ],
  presets: [
    ...FF_OFF.map(([id, name, desc, tip, ps, ls]) => ({ id, group: '공격 대형', side: 'A', name, desc, tip, players: ps.map(q => ['A', q[0], q[1], q[2], q[3] ? { ball: 1 } : {}]), lines: ls })),
    ...FF_DEF.map(([id, name, desc, tip, ps, ls, zs]) => ({ id, group: '수비 대형', side: 'B', name, desc, tip, players: ps.map(q => ['B', q[0], q[1], q[2]]), lines: ls, zones: zs }))
  ],
  start: ['spread', 'man']
};

/* =====================================================================
   ⚽ 축구
   ===================================================================== */
function soccerGoalBox(x, dir, y0, y1) {
  const n = dir > 0 ? 0 : 1; let s = '';
  const gx = dir > 0 ? x : x - 20;
  s += `<rect x="${gx}" y="${y0}" width="20" height="${y1 - y0}" fill="#e5e7eb" fill-opacity=".25" stroke="#fff" stroke-width="1.6"/>`;
  for (let y = y0 + 8; y < y1; y += 8) s += LN(gx, y, gx + 20, y, .6, '#fff', 'stroke-opacity=".5"');
  return s;
}
const SC_FULL = {
  name: '전체 경기장', vb: '-35 -35 1120 750', m: 10, tok: 24, ball: 9.5, lw: 3.6, flip: 'y', bounds: [-25, -25, 1075, 705], axis: 'x', half: 525,
  goals: { A: { x: 1050, y0: 303.4, y1: 376.6 }, B: { x: 0, y0: 303.4, y1: 376.6 } },
  draw() {
    let s = grass(-35, -35, 1120, 750, 52.5, 'v');
    const w = 1.8;
    s += `<rect x="0" y="0" width="1050" height="680" fill="none" stroke="#fff" stroke-width="${w}"/>` + LN(525, 0, 525, 680, w);
    s += `<circle cx="525" cy="340" r="91.5" fill="none" stroke="#fff" stroke-width="${w}"/><circle cx="525" cy="340" r="3" fill="#fff"/>`;
    s += `<rect x="0" y="138.5" width="165" height="403" fill="none" stroke="#fff" stroke-width="${w}"/><rect x="885" y="138.5" width="165" height="403" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<rect x="0" y="248.5" width="55" height="183" fill="none" stroke="#fff" stroke-width="${w}"/><rect x="995" y="248.5" width="55" height="183" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<circle cx="110" cy="340" r="3" fill="#fff"/><circle cx="940" cy="340" r="3" fill="#fff"/>`;
    s += `<path d="M165 266.9 A91.5 91.5 0 0 1 165 413.1" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M885 266.9 A91.5 91.5 0 0 0 885 413.1" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M10 0 A10 10 0 0 1 0 10 M1040 0 A10 10 0 0 0 1050 10 M0 670 A10 10 0 0 1 10 680 M1050 670 A10 10 0 0 0 1040 680" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += soccerGoalBox(0, -1, 303.4, 376.6) + soccerGoalBox(1050, 1, 303.4, 376.6);
    s += TX(787, 700, '우리 팀 공격 방향 ▶', 22, { op: .55 });
    return s;
  }
};
const SC_HALF = {
  name: '하프 (세트피스)', vb: '-30 -42 740 602', m: 10, tok: 22, ball: 8.5, lw: 3.6, flip: 'x', bounds: [-25, -30, 705, 555], axis: 'y', half: 525,
  goals: { A: { y: 0, x0: 303.4, x1: 376.6 } },
  draw() {
    let s = grass(-30, -42, 740, 602, 52.5, 'h');
    const w = 1.8;
    s += `<rect x="0" y="0" width="680" height="525" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<rect x="138.5" y="0" width="403" height="165" fill="none" stroke="#fff" stroke-width="${w}"/><rect x="248.5" y="0" width="183" height="55" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<circle cx="340" cy="110" r="3" fill="#fff"/><path d="M266.9 165 A91.5 91.5 0 0 0 413.1 165" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M248.5 525 A91.5 91.5 0 0 1 431.5 525" fill="none" stroke="#fff" stroke-width="${w}"/><circle cx="340" cy="525" r="3" fill="#fff"/>`;
    s += `<path d="M10 0 A10 10 0 0 1 0 10 M670 0 A10 10 0 0 0 680 10" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<rect x="303.4" y="-20" width="73.2" height="20" fill="#e5e7eb" fill-opacity=".25" stroke="#fff" stroke-width="1.6"/>`;
    for (let x = 311; x < 376; x += 8) s += LN(x, -20, x, 0, .6, '#fff', 'stroke-opacity=".5"');
    s += TX(660, 545, '하프라인 · ▲ 공격 방향', 20, { a: 'end', op: .55 });
    return s;
  }
};
function soccerGoal(ctx, p, end, reach) {
  const F = ctx.F, g = F.goals && F.goals[p.t]; if (!g) return null;
  const M = ctx.M, ins = .45 * M;
  if (g.x !== undefined) { const c = [g.x, (g.y0 + g.y1) / 2]; if (dist(end, c) > reach * M) return null; return { pt: [g.x, clamp(end[1], g.y0 + ins, g.y1 - ins)] }; }
  const c = [(g.x0 + g.x1) / 2, g.y]; if (dist(end, c) > reach * M) return null; return { pt: [clamp(end[0], g.x0 + ins, g.x1 - ins), g.y] };
}
function offsideCheck(ctx, f, r) {
  const { P, F, M } = ctx, team = f.team;
  const fw = q => F.axis === 'x' ? (team === 'A' ? q[0] : -q[0]) : (team === 'A' ? -q[1] : q[1]);
  const half = F.axis === 'x' ? (team === 'A' ? F.half : -F.half) : (team === 'A' ? -F.half : F.half);
  const vals = P.map((p, j) => [p, j]).filter(([p, j]) => p.t !== team && !ctx.st[j].out).map(([p, j]) => fw(f.snap[j])).sort((a, b) => b - a);
  if (vals.length < 2) return false;
  const line = Math.max(vals[1], half), rv = fw(f.snap[r]), bv = fw(f.pts[0]);
  return rv > line + .25 * M && rv > bv + .25 * M;
}
function offsideLineSVG(play, F, players) {
  if (!play.opts || !play.opts.offside) return '';
  const B = players.filter(p => p.t === 'B' && !p.out);
  if (B.length < 2) return '';
  if (F.axis === 'x') {
    const xs = B.map(p => p.x).sort((a, b) => b - a), x = Math.max(xs[1], F.half);
    return LN(x, 0, x, 680, 2.4, '#fde047', 'stroke-dasharray="14 9" stroke-opacity=".9"') + TX(x - 6, 18, '오프사이드 라인', 17, { a: 'end', c: '#fde047', op: .95 });
  }
  const ys = B.map(p => p.y).sort((a, b) => a - b), y = Math.min(ys[1], F.half);
  return LN(0, y, 680, y, 2.4, '#fde047', 'stroke-dasharray="14 9" stroke-opacity=".9"') + TX(670, y - 8, '오프사이드 라인', 17, { a: 'end', c: '#fde047', op: .95 });
}
const gkStyle = p => p.pos === 'GK' ? (p.t === 'A' ? { fill: '#facc15', stroke: '#2563eb', ink: '#1e3a8a' } : { fill: '#22c55e', stroke: '#ffffff', ink: '#052e16' }) : null;
const soccer = {
  id: 'soccer', name: '축구', icon: '⚽', ball: 'soccer',
  fields: { full: SC_FULL, half: SC_HALF }, defaultField: 'full',
  teams: { A: '우리 팀', B: '상대 팀' },
  pos: { A: ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'], B: ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'] },
  posName: { GK: '골키퍼', CB: '센터백', LB: '왼쪽 수비', RB: '오른쪽 수비', DM: '수비형 미드필더', CM: '중앙 미드필더', AM: '공격형 미드필더', LW: '왼쪽 윙어', RW: '오른쪽 윙어', ST: '스트라이커' },
  max: 24,
  kinds: {
    run: kRun('침투·이동', { speed: 5.6 }),
    dribble: kDrib('드리블', { speed: 4.6 }),
    pass: kPass('땅볼 패스', { speed: 14, arc: .01, dash: '1.2 2' }),
    long: kPass('롱패스·크로스', { color: COL.lob, dash: '', speed: 17, arc: .22, hint: '높게 멀리 차는 패스' }),
    shot: kShot('슛', { speed: 24, arc: .04 }),
    def: kDef('수비 이동·압박', { speed: 5.2 })
  },
  defaultKind: 'run',
  catchR: 1.6, homeR: 3, holdMin: .3, carryOnRun: true, saveR: 1.5, loose: true, pickWord: '공 잡았다!',
  tokenStyle: gkStyle,
  goalTarget: (ctx, p, end) => soccerGoal(ctx, p, end, 14),
  overlay: (play, F, ps) => offsideLineSVG(play, F, ps),
  liveOverlay: (play, F, ps) => offsideLineSVG(play, F, ps),
  rules: {
    catch(ctx, f, r, inter) {
      if (inter || f.k === 'shot') return false;
      if (offsideCheck(ctx, f, r)) { ctx.kill(); ctx.call('깃발!', ctx.pos[r], { color: '#fde047' }); ctx.big('오프사이드!', { color: '#fde047' }); return true; }
      return false;
    },
    land(ctx, f, end) { ctx.call('공이 굴러가요', end, { color: '#e2e8f0' }); return true; }
  },
  tools: ['offside'],
  tips: [
    ['패스하고 움직이기', '패스한 선수는 그 자리에 서 있지 말고 빈 공간으로 다시 달려요. 2대1 월패스가 기본이에요.'],
    ['오프사이드', '패스하는 순간, 받는 선수가 상대 진영에서 뒤에서 두 번째 수비수보다 앞에 있으면 오프사이드예요. 「오프사이드 라인」을 켜 보세요.'],
    ['공간 패스', '선수 발밑이 아닌 앞쪽 빈 공간으로 패스하면, 달려오는 동료가 속도를 살려 받아요.'],
    ['슛 방향', '골키퍼에게서 먼 쪽 골대 구석을 노려요. 골키퍼 가까이로 차면 막혀요.']
  ],
  presets: [
    { id: 'onetwo', group: '공격', name: '2대1 월패스', field: 'full',
      desc: 'CM이 ST에게 패스하고 수비 뒤로 달려요. ST가 벽처럼 바로 돌려주면 CM이 슛!',
      tip: '패스한 뒤 바로 달리는 것, 돌려주는 패스는 달리는 앞쪽으로!',
      players: [['A', 'CM', 600, 330, { ball: 1 }], ['A', 'ST', 760, 300], ['A', 'LW', 700, 120], ['B', 'CB', 690, 335], ['B', 'CB', 820, 420], ['B', 'GK', 1040, 340]],
      lines: [[0, 'pass', [[160, -30]]], [0, 'run', [[110, -40], [250, 0]]], [1, 'pass', [[100, 25]], { delay: .15 }], [0, 'shot', [[450, -18]], { from: [250, 0] }], [3, 'def', [[60, -10]], { delay: .7 }], [4, 'def', [[20, -40]], { delay: 1 }]] },
    { id: 'overlap', group: '공격', name: '오버래핑 → 크로스 → 헤딩', field: 'full',
      desc: '왼쪽 수비 LB가 바깥으로 겹쳐 달려 올라가요. LM이 앞 공간에 패스하면 LB가 크로스, ST가 반대편 골대 쪽으로 들어가 마무리!',
      tip: '크로스를 받을 선수는 공이 올라가기 직전에 출발해야 오프사이드에 걸리지 않아요.',
      players: [['A', 'LW', 720, 110, { ball: 1 }], ['A', 'LB', 650, 160], ['A', 'ST', 870, 330], ['A', 'CM', 760, 420], ['B', 'RB', 780, 140], ['B', 'CB', 930, 320], ['B', 'CB', 930, 400], ['B', 'GK', 1040, 340]],
      lines: [[1, 'run', [[120, -60], [220, -70]]], [0, 'pass', [[150, -20]], { delay: 2.2 }], [1, 'long', [[335, 210]], { from: [220, -70] }], [2, 'run', [[110, 40]], { delay: 4.6 }], [2, 'shot', [[180, -12]], { from: [110, 40] }],
        [4, 'def', [[-50, 0]], { delay: .3 }], [5, 'def', [[30, 30]], { delay: 4.9 }]] },
    { id: 'counter', group: '공격', name: '역습 (공간 패스)', field: 'full',
      desc: '공을 뺏자마자 CM이 수비 뒤 빈 공간으로 길게 패스! LW가 달려가 받아 드리블 후 슛.',
      tip: '상대 수비가 올라와 있을 때 뒤 공간이 가장 넓어요.',
      players: [['A', 'CM', 420, 350, { ball: 1 }], ['A', 'LW', 480, 140], ['A', 'ST', 500, 360], ['A', 'RW', 470, 560], ['B', 'CB', 560, 300], ['B', 'CB', 560, 420], ['B', 'RB', 640, 90], ['B', 'LB', 600, 560], ['B', 'GK', 1040, 340], ['B', 'CM', 450, 300]],
      lines: [[0, 'long', [[340, -160]], { delay: .2 }], [1, 'run', [[150, 10], [290, 50]]], [1, 'dribble', [[400, 110], [440, 160]], { from: [290, 50] }], [1, 'shot', [[570, 225]], { from: [440, 160] }],
        [2, 'run', [[260, -20], [400, 0]], { delay: .4 }], [4, 'def', [[260, 0]], { delay: .6 }], [6, 'def', [[150, 40]], { delay: .5 }], [5, 'def', [[250, -40]], { delay: .8 }]] },
    { id: 'trap', group: '수비', name: '오프사이드 함정', field: 'full', opts: { offside: true },
      desc: '수비 네 명이 한 줄로 동시에 앞으로 올라가요. 패스 순간 ST가 수비 라인보다 앞에 남아 있으면 오프사이드!',
      tip: '네 명이 한 줄로, 같은 순간에 움직이는 게 핵심이에요. 노란 점선이 오프사이드 라인이에요.',
      players: [['A', 'CM', 600, 340, { ball: 1 }], ['A', 'ST', 790, 330], ['A', 'RW', 760, 520], ['B', 'LB', 820, 180], ['B', 'CB', 820, 290], ['B', 'CB', 820, 390], ['B', 'RB', 820, 500], ['B', 'GK', 1040, 340]],
      lines: [[3, 'def', [[-60, 0]], { delay: .25 }], [4, 'def', [[-60, 0]], { delay: .25 }], [5, 'def', [[-60, 0]], { delay: .25 }], [6, 'def', [[-60, 0]], { delay: .25 }], [0, 'pass', [[190, -10]], { delay: .9 }]] },
    { id: 'corner', group: '세트피스', name: '코너킥 (니어 포스트)', field: 'half',
      desc: '코너킥을 가까운 골대(니어 포스트) 쪽으로 차요. ST가 수비 앞을 가로질러 들어가 헤딩슛!',
      tip: '공이 떠 있는 동안 달려 들어가야 수비보다 먼저 닿아요.',
      players: [['A', 'CM', 6, 6, { ball: 1 }], ['A', 'ST', 400, 170], ['A', 'CB', 300, 190], ['A', 'AM', 200, 260], ['B', 'GK', 340, 14], ['B', 'CB', 300, 50], ['B', 'CB', 380, 70], ['B', 'DM', 340, 110], ['B', 'LB', 260, 120]],
      lines: [[0, 'long', [[316, 58]]], [1, 'run', [[-75, -104]], { delay: .3 }], [1, 'shot', [[-40, -170]], { from: [-75, -104] }], [2, 'run', [[60, -110]], { delay: .3 }], [6, 'def', [[-35, -6]], { delay: 1.4 }]] },
    { id: 'freekick', group: '세트피스', name: '프리킥 (벽 돌아가기)', field: 'half',
      desc: '수비 벽 바깥쪽으로 휘어 차서 골키퍼가 먼 구석에 꽂아요.',
      tip: '슛 선을 곡선으로 그리면 공도 휘어져 날아가요.',
      players: [['A', 'AM', 330, 300, { ball: 1 }], ['A', 'ST', 420, 200], ['B', 'GK', 345, 12], ['B', 'CB', 305, 210], ['B', 'CB', 325, 210], ['B', 'DM', 345, 210], ['B', 'CM', 365, 210]],
      lines: [[0, 'shot', [[-62, -160], [-20, -300]]]] },
    { id: 'f442', group: '대형', name: '4-4-2 (가장 기본)', field: 'full',
      desc: '수비 4 · 미드필더 4 · 공격 2. 두 줄 4명이 넓게 서서 균형이 좋아요. 공격수 둘이 서로 도와요.',
      tip: '네모 두 줄(4·4) 간격을 좁게 유지하면 상대가 사이로 들어오기 어려워요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 220, 110], ['A', 'CB', 200, 270], ['A', 'CB', 200, 410], ['A', 'RB', 220, 570], ['A', 'LW', 430, 110], ['A', 'CM', 400, 270], ['A', 'CM', 400, 410], ['A', 'RW', 430, 570], ['A', 'ST', 620, 290], ['A', 'ST', 620, 390]],
      lines: [] },
    { id: 'f433', group: '대형', name: '4-3-3 (공격형)', field: 'full',
      desc: '수비 4 · 미드필더 3 · 공격 3. 양쪽 윙어가 넓게 벌려 측면을 공격하고 가운데 공격수가 마무리해요.',
      tip: '윙어는 옆줄 가까이 넓게! 가운데 미드필더 3명이 삼각형을 만들어요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 220, 110], ['A', 'CB', 200, 270], ['A', 'CB', 200, 410], ['A', 'RB', 220, 570], ['A', 'DM', 360, 340], ['A', 'CM', 440, 220], ['A', 'CM', 440, 460], ['A', 'LW', 640, 110], ['A', 'ST', 680, 340], ['A', 'RW', 640, 570]],
      lines: [] },
    { id: 'f4231', group: '대형', name: '4-2-3-1 (안정 + 창의)', field: 'full',
      desc: '수비 4 · 수비형 미드필더 2 · 공격형 미드필더 3 · 공격 1. 두 명이 수비 앞을 지키고 세 명이 공격을 만들어요.',
      tip: '공격형 미드필더(AM)는 수비수와 미드필더 사이 빈 공간에서 공을 받아요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 220, 110], ['A', 'CB', 200, 270], ['A', 'CB', 200, 410], ['A', 'RB', 220, 570], ['A', 'DM', 360, 270], ['A', 'DM', 360, 410], ['A', 'LW', 540, 120], ['A', 'AM', 540, 340], ['A', 'RW', 540, 560], ['A', 'ST', 690, 340]],
      lines: [] },
    { id: 'f4141', group: '대형', name: '4-1-4-1 (중원 장악)', field: 'full',
      desc: '수비 4 · 수비형 미드필더 1 · 미드필더 4 · 공격 1. 미드필더 다섯 명이 가운데를 꽉 채워요.',
      tip: '수비형 미드필더(DM) 한 명이 수비 바로 앞에서 빈틈을 메워요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 220, 110], ['A', 'CB', 200, 270], ['A', 'CB', 200, 410], ['A', 'RB', 220, 570], ['A', 'DM', 340, 340], ['A', 'LW', 480, 110], ['A', 'CM', 470, 270], ['A', 'CM', 470, 410], ['A', 'RW', 480, 570], ['A', 'ST', 670, 340]],
      lines: [] },
    { id: 'f4312', group: '대형', name: '4-3-1-2 (다이아몬드)', field: 'full',
      desc: '수비 4 · 미드필더가 다이아몬드(마름모) · 공격 2. 가운데에 사람이 많아 짧은 패스가 쉬워요.',
      tip: '측면이 비기 쉬우니 풀백(LB·RB)이 앞으로 올라가 도와줘요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 230, 110], ['A', 'CB', 200, 270], ['A', 'CB', 200, 410], ['A', 'RB', 230, 570], ['A', 'DM', 340, 340], ['A', 'CM', 430, 220], ['A', 'CM', 430, 460], ['A', 'AM', 530, 340], ['A', 'ST', 650, 280], ['A', 'ST', 650, 400]],
      lines: [] },
    { id: 'f352', group: '대형', name: '3-5-2 (윙백 활용)', field: 'full',
      desc: '수비 3 · 미드필더 5 · 공격 2. 양쪽 윙백(LB·RB)이 높이 올라가 미드필더처럼 뛰어요.',
      tip: '윙백은 공격할 땐 앞으로, 수비할 땐 뒤로 내려와 5명 수비를 만들어요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'CB', 200, 210], ['A', 'CB', 190, 340], ['A', 'CB', 200, 470], ['A', 'LB', 420, 90], ['A', 'DM', 360, 340], ['A', 'CM', 450, 240], ['A', 'CM', 450, 440], ['A', 'RB', 420, 590], ['A', 'ST', 640, 290], ['A', 'ST', 640, 390]],
      lines: [] },
    { id: 'f343', group: '대형', name: '3-4-3 (공격적)', field: 'full',
      desc: '수비 3 · 미드필더 4 · 공격 3. 앞쪽에 사람이 많아 상대를 높은 곳에서 압박하기 좋아요.',
      tip: '수비가 3명이라 뒷공간이 넓어요. 공을 뺏기면 빨리 돌아와야 해요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'CB', 200, 210], ['A', 'CB', 190, 340], ['A', 'CB', 200, 470], ['A', 'LB', 420, 100], ['A', 'CM', 400, 270], ['A', 'CM', 400, 410], ['A', 'RB', 420, 580], ['A', 'LW', 640, 140], ['A', 'ST', 680, 340], ['A', 'RW', 640, 540]],
      lines: [] },
    { id: 'f532', group: '대형', name: '5-3-2 (수비 단단)', field: 'full',
      desc: '수비 5 · 미드필더 3 · 공격 2. 강한 상대를 만날 때 골문 앞을 단단히 지키고 역습을 노려요.',
      tip: '공을 뺏으면 공격수 둘에게 빠르게 길게 연결해요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 240, 90], ['A', 'CB', 190, 220], ['A', 'CB', 180, 340], ['A', 'CB', 190, 460], ['A', 'RB', 240, 590], ['A', 'CM', 400, 220], ['A', 'CM', 380, 340], ['A', 'CM', 400, 460], ['A', 'ST', 600, 290], ['A', 'ST', 600, 390]],
      lines: [] },
    { id: '442', group: '대형', name: '4-4-2 vs 4-3-3 대형', field: 'full',
      desc: '우리 팀은 수비 4 · 미드필더 4 · 공격 2, 상대는 수비 4 · 미드필더 3 · 공격 3이에요. 서로 어느 자리에서 숫자가 많은지 비교해 보세요.',
      tip: '선수를 움직여 우리 팀만의 대형을 만들어 보세요.',
      players: [['A', 'GK', 40, 340, { ball: 1 }], ['A', 'LB', 220, 120], ['A', 'CB', 200, 270], ['A', 'CB', 200, 410], ['A', 'RB', 220, 560], ['A', 'LW', 430, 110], ['A', 'CM', 400, 270], ['A', 'CM', 400, 410], ['A', 'RW', 430, 570], ['A', 'ST', 600, 290], ['A', 'ST', 600, 390],
        ['B', 'GK', 1010, 340], ['B', 'RB', 840, 110], ['B', 'CB', 860, 270], ['B', 'CB', 860, 410], ['B', 'LB', 840, 570], ['B', 'CM', 700, 220], ['B', 'DM', 740, 340], ['B', 'CM', 700, 460], ['B', 'RW', 560, 130], ['B', 'ST', 545, 340], ['B', 'LW', 560, 550]],
      lines: [] }
  ]
};

/* =====================================================================
   ⚽ 풋살
   ===================================================================== */
const FS = {
  name: '풋살 코트', vb: '-26 -26 452 252', m: 10, tok: 8.5, ball: 3.6, lw: 1.7, flip: 'y', bounds: [-20, -20, 420, 220],
  goals: { A: { x: 400, y0: 85, y1: 115 }, B: { x: 0, y0: 85, y1: 115 } },
  draw() {
    let s = `<rect x="-26" y="-26" width="452" height="252" fill="#1d5f93"/><rect x="0" y="0" width="400" height="200" fill="#2a78b4"/>`;
    s += `<path d="M0 25 A60 60 0 0 1 60 85 L60 115 A60 60 0 0 1 0 175 Z" fill="#e2863f"/><path d="M400 25 A60 60 0 0 0 340 85 L340 115 A60 60 0 0 0 400 175 Z" fill="#e2863f"/>`;
    const w = 1.2;
    s += `<rect x="0" y="0" width="400" height="200" fill="none" stroke="#fff" stroke-width="${w}"/>` + LN(200, 0, 200, 200, w) + `<circle cx="200" cy="100" r="30" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += `<path d="M0 25 A60 60 0 0 1 60 85 L60 115 A60 60 0 0 1 0 175" fill="none" stroke="#fff" stroke-width="${w}"/><path d="M400 25 A60 60 0 0 0 340 85 L340 115 A60 60 0 0 0 400 175" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    [[60, 100], [100, 100], [340, 100], [300, 100], [200, 100]].forEach(q => s += `<circle cx="${q[0]}" cy="${q[1]}" r="1.6" fill="#fff"/>`);
    s += `<rect x="-10" y="85" width="10" height="30" fill="#e5e7eb" fill-opacity=".3" stroke="#fff" stroke-width="1"/><rect x="400" y="85" width="10" height="30" fill="#e5e7eb" fill-opacity=".3" stroke="#fff" stroke-width="1"/>`;
    s += TX(300, 214, '우리 팀 공격 방향 ▶', 8, { op: .6 });
    return s;
  }
};
const futsal = {
  id: 'futsal', name: '풋살', icon: '🥅', ball: 'soccer',
  fields: { court: FS }, defaultField: 'court',
  teams: { A: '우리 팀', B: '상대 팀' },
  pos: { A: ['GK', '픽소', '알라', '피보'], B: ['GK', '픽소', '알라', '피보'] },
  posName: { GK: '골키퍼', 픽소: '픽소(최후방 수비·조율)', 알라: '알라(측면)', 피보: '피보(최전방·등지고 받기)' },
  max: 14,
  kinds: {
    run: kRun('이동', { speed: 5 }),
    dribble: kDrib('드리블', { speed: 4 }),
    pass: kPass('패스', { speed: 11, arc: .01, dash: '1.2 2' }),
    chip: kPass('로빙 패스', { color: COL.lob, dash: '', speed: 9, arc: .25, hint: '수비 머리 위로 살짝 띄우는 패스' }),
    shot: kShot('슛', { speed: 18, arc: .03 }),
    def: kDef('수비 이동', { speed: 4.6 })
  },
  defaultKind: 'run',
  catchR: 1.25, homeR: 2.4, holdMin: .3, carryOnRun: true, saveR: 1.2, loose: true, pickWord: '공 잡았다!',
  tokenStyle: gkStyle,
  goalTarget: (ctx, p, end) => soccerGoal(ctx, p, end, 8),
  rules: { land(ctx, f, end) { ctx.call('공이 굴러가요', end, { color: '#e2e8f0' }); return true; } },
  tips: [
    ['다섯 명의 로테이션', '좁은 코트에서는 자리를 계속 바꿔 수비를 끌어내요. 패스한 선수가 빈자리로 이동하는 게 기본이에요.'],
    ['피보 활용', '피보(최전방)는 골대를 등지고 공을 받아 동료에게 내주거나 돌아서 슛해요.'],
    ['오프사이드 없음', '풋살에는 오프사이드가 없어요. 대신 공간이 좁아 빠른 패스가 중요해요.'],
    ['킥인', '공이 옆줄 밖으로 나가면 손이 아닌 발로 차서 다시 시작해요(킥인).']
  ],
  presets: [
    { id: 'diamond', group: '공격', name: '1-2-1 다이아몬드 로테이션',
      desc: '픽소 → 왼쪽 알라 → 피보로 이어지고, 피보가 안쪽으로 파고드는 오른쪽 알라에게 내줘서 슛!',
      tip: '패스한 픽소는 왼쪽 빈자리로 이동해 균형을 맞춰요.',
      players: [['A', 'GK', 16, 100], ['A', '픽소', 120, 100, { ball: 1 }], ['A', '알라', 205, 40], ['A', '알라', 205, 160], ['A', '피보', 320, 100],
        ['B', 'GK', 388, 100], ['B', '피보', 160, 105], ['B', '알라', 232, 52], ['B', '알라', 232, 150], ['B', '픽소', 336, 100]],
      lines: [[1, 'pass', [[85, -60]]], [1, 'run', [[60, -35], [78, -60]]], [2, 'dribble', [[40, 25]]], [2, 'pass', [[100, 54]], { from: [40, 25] }],
        [4, 'run', [[-22, -6]], { delay: .9 }], [3, 'run', [[60, -20], [90, -38]], { delay: 1.4 }], [4, 'pass', [[-24, 22]], { from: [-22, -6] }], [3, 'shot', [[195, -70]], { from: [90, -38] }],
        [9, 'def', [[-22, -4]], { delay: 1.1 }]] },
    { id: 'pivot', group: '공격', name: '피보 등지고 돌아서 슛',
      desc: '픽소가 피보에게 길게 넣어 주면, 피보가 수비를 등지고 받아 몸을 돌려 슛!',
      tip: '피보는 공을 받기 전에 어깨 너머로 골대와 수비 위치를 확인해요.',
      players: [['A', 'GK', 16, 100], ['A', '픽소', 150, 100, { ball: 1 }], ['A', '알라', 230, 30], ['A', '알라', 230, 170], ['A', '피보', 330, 95],
        ['B', 'GK', 388, 100], ['B', '피보', 200, 100], ['B', '알라', 260, 50], ['B', '알라', 260, 150], ['B', '픽소', 345, 92]],
      lines: [[1, 'pass', [[180, -5]]], [4, 'dribble', [[15, 15]]], [4, 'shot', [[70, -7]], { from: [15, 15] }], [9, 'def', [[-6, 8]], { delay: 1.6 }]] },
    { id: 'kickin', group: '세트피스', name: '킥인 → 바로 슛',
      desc: '옆줄 킥인을 알라가 달려 들어오며 받아 원터치에 가깝게 슛해요. 피보는 가까운 골대로 달려 수비를 끌어요.',
      tip: '킥인은 4초 안에 차야 해요. 미리 약속한 움직임이 중요해요.',
      players: [['A', '알라', 300, 200, { ball: 1 }], ['A', '알라', 250, 120], ['A', '피보', 330, 120], ['A', '픽소', 170, 110], ['A', 'GK', 16, 100],
        ['B', 'GK', 388, 100], ['B', '알라', 300, 172], ['B', '피보', 320, 90], ['B', '알라', 260, 80], ['B', '픽소', 200, 110]],
      lines: [[0, 'pass', [[-15, -50]], { delay: .2 }], [1, 'run', [[35, 30]], { delay: .2 }], [1, 'shot', [[150, -12]], { from: [35, 30] }], [2, 'run', [[30, -20]]], [7, 'def', [[20, 5]], { delay: .4 }]] }
  ]
};
