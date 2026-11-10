/* =====================================================================
   종목 정의 7 — 추크볼 · 라켓 스포츠(배드민턴 · 탁구 · 피클볼 · 테니스, 복식)
   ===================================================================== */

/* =====================================================================
   🥅 추크볼 (핸드볼에서 독립)
   ===================================================================== */
const chukball = {
  id: 'chukball', name: '추크볼', icon: '🥅', ball: 'handball',
  fields: { court: TC }, defaultField: 'court',
  teams: { A: '우리 팀', B: '상대 팀' },
  pos: { A: ['1', '2', '3', '4', '5', '6', '7'], B: ['1', '2', '3', '4', '5', '6', '7'] },
  posName: { 1: '1번', 2: '2번', 3: '3번', 4: '4번', 5: '5번', 6: '6번', 7: '7번' },
  max: 16,
  kinds: {
    run: kRun('이동', { speed: 5, hint: '공 없이 자리 옮기기 (공을 들고는 3걸음까지)' }),
    pass: kPass('패스', { speed: 11, arc: .08, hint: '한 번 공격에 패스는 3번까지' }),
    shot: kShot('슛', { speed: 17, arc: .05, hint: '양쪽 프레임 중 아무 곳으로나 던지기' }),
    def: kDef('수비 자리 잡기', { speed: 4.8, hint: '공이 튀어나올 곳으로 미리 가기' })
  },
  defaultKind: 'run',
  catchR: 1.2, homeR: 2.4, holdMin: .3, carryOnRun: true, noIntercept: true, loose: false,
  goalTarget: handball.goalTarget, warnings: handball.warnings, rules: handball.rules,
  tips: [
    ['방해 금지', '추크볼은 상대를 막거나 공을 가로챌 수 없어요. 그래서 몸싸움 없이 모두가 안전하게 할 수 있어요.'],
    ['리바운드 수비', '프레임에 맞고 튀어나온 공을 수비가 바닥에 떨어지기 전에 잡으면 수비 성공, 떨어지면 공격팀 득점이에요.'],
    ['거울처럼 튀어요', '공은 프레임에 들어간 각도와 거울처럼 반대로 튀어나와요. 수비는 슛하는 선수의 반대편을 미리 지켜요.'],
    ['패스는 3번까지', '한 번 공격에서 패스는 3번까지, 공을 들고는 3걸음까지만 움직일 수 있어요. 금지구역(빨간 반원)에는 들어갈 수 없어요.']
  ],
  presets: [
    { id: 'angle', group: '공격', name: '빈 곳 노려 슛',
      desc: '두 번 패스로 각도를 바꾼 뒤 슛해요. 공이 수비가 없는 쪽으로 튀어나와 바닥에 떨어지면 득점!',
      tip: '수비가 어디에 서 있는지 보고, 반사된 공이 빈 곳에 떨어지도록 각도를 골라요.',
      players: [['A', '1', 200, 100, { ball: 1 }], ['A', '2', 250, 40], ['A', '3', 300, 150], ['B', '1', 335, 130], ['B', '2', 320, 172], ['B', '3', 300, 55]],
      lines: [[0, 'pass', [[50, -60]]], [1, 'pass', [[50, 110]], { delay: .2 }], [2, 'shot', [[100, -50]]]] },
    { id: 'switch', group: '공격', name: '반대쪽 프레임으로 바꾸기',
      desc: '수비가 오른쪽 프레임에 몰려 있으면, 패스 한 번으로 방향을 바꿔 비어 있는 왼쪽 프레임에 슛해요.',
      tip: '추크볼은 양쪽 프레임 모두 우리 골대예요. 수비가 적은 쪽을 골라요.',
      players: [['A', '1', 220, 70, { ball: 1 }], ['A', '2', 130, 140], ['A', '3', 260, 150], ['B', '1', 330, 70], ['B', '2', 320, 140], ['B', '3', 280, 100], ['B', '4', 90, 30]],
      lines: [[0, 'pass', [[-90, 70]]], [1, 'shot', [[-130, -40]]]] },
    { id: 'quick', group: '공격', name: '빠른 패스 → 즉시 슛',
      desc: '수비가 자리를 잡기 전에 패스 두 번으로 공을 옮기고 바로 슛해요. 늦게 움직인 수비는 공을 못 잡아요.',
      tip: '공을 받기 전에 다음에 줄 곳을 미리 봐요.',
      players: [['A', '1', 150, 60, { ball: 1 }], ['A', '2', 220, 150], ['A', '3', 280, 50], ['B', '1', 330, 150], ['B', '2', 300, 100], ['B', '3', 250, 100]],
      lines: [[0, 'pass', [[70, 90]]], [1, 'pass', [[60, -100]], { delay: .1 }], [2, 'shot', [[120, 50]]], [3, 'def', [[10, -100]], { delay: 1.2 }]] },
    { id: 'rule', group: '공격', name: '규칙: 패스는 3번까지',
      desc: '한 번 공격에서 패스는 3번까지예요. 4번째 패스를 하면 반칙 알림이 떠요.',
      tip: '패스 선을 하나 지우고 다시 보기를 눌러 보세요.',
      players: [['A', '1', 150, 60, { ball: 1 }], ['A', '2', 200, 140], ['A', '3', 250, 60], ['A', '4', 300, 140], ['A', '5', 330, 90], ['B', '1', 300, 40], ['B', '2', 260, 160], ['B', '3', 200, 100]],
      lines: [[0, 'pass', [[50, 80]]], [1, 'pass', [[50, -80]], { delay: .1 }], [2, 'pass', [[50, 80]], { delay: .1 }], [3, 'pass', [[30, -50]], { delay: .1 }], [4, 'shot', [[70, 10]]]] },
    { id: 'rebound', group: '수비', name: '반사 각도 예측해 잡기',
      desc: '공격이 프레임에 슛하면 공이 거울처럼 반대로 튀어나와요. 수비는 공이 튈 곳을 예상해 미리 서 있다가 잡아요.',
      tip: '공이 들어간 각도의 반대쪽으로 튀어나와요(거울처럼).',
      players: [['A', '1', 290, 70, { ball: 1 }], ['A', '2', 250, 120], ['A', '3', 220, 60], ['B', '1', 335, 122], ['B', '2', 330, 60], ['B', '3', 300, 155]],
      lines: [[0, 'shot', [[110, 30]]]] },
    { id: 'two', group: '수비', name: '두 줄 수비 대형',
      desc: '프레임 가까이 한 줄, 멀리 한 줄로 서서 짧게 튀는 공과 길게 튀는 공을 나눠 맡아요.',
      tip: '앞줄은 짧은 공, 뒷줄은 길게 튀는 공을 책임져요.',
      players: [['A', '1', 260, 130, { ball: 1 }], ['A', '2', 230, 60], ['B', '1', 350, 60], ['B', '2', 345, 150], ['B', '3', 300, 40], ['B', '4', 300, 160], ['B', '5', 318, 88]],
      zones: [[350, 60, 18, 26, 'B'], [345, 150, 18, 26, 'B'], [300, 40, 22, 22, 'B'], [300, 160, 22, 22, 'B']],
      lines: [[0, 'shot', [[140, -30]]], [1, 'run', [[20, 10]]]] },
    { id: 'follow', group: '수비', name: '슛 방향 보고 따라가기',
      desc: '슛하는 선수의 반대편 공간으로 수비가 재빨리 이동해 튀어나온 공을 잡아요.',
      tip: '공격수가 던지는 순간 그 반대편으로 출발!',
      players: [['A', '1', 280, 150, { ball: 1 }], ['A', '2', 240, 80], ['B', '1', 330, 100], ['B', '2', 300, 40], ['B', '3', 250, 130]],
      lines: [[0, 'shot', [[120, -50]], { delay: .3 }], [2, 'def', [[5, -25]], { delay: .4 }]] },
    { id: 'both', group: '수비', name: '양쪽 프레임 나눠 지키기',
      desc: '공격은 양쪽 프레임을 모두 쓸 수 있어요. 수비도 둘로 나눠 반대쪽 프레임까지 지켜요.',
      tip: '한쪽에만 몰리면 반대쪽 프레임이 텅 비어요.',
      players: [['A', '1', 200, 100, { ball: 1 }], ['A', '2', 150, 50], ['B', '1', 330, 70], ['B', '2', 330, 130], ['B', '3', 70, 70], ['B', '4', 70, 130]],
      lines: [[0, 'pass', [[-50, -50]]], [1, 'shot', [[-150, 50]]], [4, 'def', [[-15, 0]], { delay: .8 }]] }
  ]
};

/* =====================================================================
   🏸 라켓 스포츠 공통 — 복식 랠리
   ===================================================================== */
const nextAct = (ctx, r) => ctx.acts[r].filter(a => !a.done).sort((a, b) => a.order - b.order)[0];
function racketRules(cfg) {
  const T = () => ({ A: '우리 팀', B: '상대 팀' });
  const point = (ctx, team, why, col = '#facc15') => { ctx.kill(); ctx.big(`${T()[team]} 득점! ${why}`, { color: col }); };
  return {
    release(ctx, f) {
      const { ball, F, pos } = ctx;
      ball.hits = (ball.hits || 0) + 1; ball.lastHit = ball.lastHit || {};
      f.hitNo = ball.hits; ball.lastHit[f.team] = f.h;
      if (f.k === 'serve') {
        ball.sv = ball.hits;
        const from = pos[f.h], end = f.drawnEnd, why = cfg.serveCheck(F, f.team, from, end);
        if (why) f.fault = why;
      }
      if (cfg.kitchen && f.K.air && Math.abs(pos[f.h][0] - F.net) < cfg.kitchen * ctx.M) f.fault = f.fault || '키친(논발리 존)에서 발리했어요';
    },
    flight(ctx, f, u) {
      if (f.bounceTo !== undefined || f.recvLock === false) return;
      const { P, pos, F, M } = ctx, net = F.net, p0 = f.pts[0];
      if (f.recvLock === undefined) {
        const side = Math.sign(f.drawnEnd[0] - net);
        let best = -1, bd = cfg.airR * M;
        P.forEach((p, j) => {
          if (p.t === f.team || Math.sign(pos[j][0] - net) !== side) return;
          const a = nextAct(ctx, j); if (!a || !(cfg.air || a.K.air)) return;
          const d = segDist(pos[j], p0, f.drawnEnd); if (d < bd) { bd = d; best = j; }
        });
        if (best < 0) return;
        f.recvLock = best; f.lockU = u;
      }
      const r = f.recvLock, w = smooth(clamp((u - f.lockU) / Math.max(.05, 1 - f.lockU), 0, 1));
      f.pts[f.pts.length - 1] = lerp2(f.drawnEnd, pos[r], w); f.len = polyLen(f.pts); f.recv = r;
    },
    arrive(ctx, f, end) {
      const { P, pos, F, M, ball } = ctx, net = F.net;
      if (f.bounceTo !== undefined) {
        const r = f.bounceTo; ctx.give(r); ctx.call(cfg.hitWord || '리턴!', pos[r], { color: '#fde047' }); return true;
      }
      if (f.fault) { ball.rest = end; ctx.call('반칙!', pos[f.h], { color: '#f87171' }); point(ctx, other(f.team), `(${f.fault})`, '#f87171'); return true;
      }
      if ((f.drawnEnd[0] - net) * (f.pts[0][0] - net) > 0) { ball.rest = end; ctx.call('네트!', [net, end[1]], { color: '#f87171' }); point(ctx, other(f.team), '(네트에 걸렸어요)', '#f87171'); return true; }
      /* 공중에서 받기 (배드민턴 · 발리) */
      if (f.recvLock !== undefined && f.recvLock !== false) {
        const r = f.recvLock;
        if (cfg.twoBounce && ball.sv && f.hitNo - ball.sv <= 1) { ball.rest = end; ctx.call('투 바운스 규칙!', pos[r], { color: '#f87171' }); point(ctx, f.team, '(서브와 리턴은 한 번 튄 뒤 쳐야 해요)', '#f87171'); return true; }
        if (cfg.kitchen && Math.abs(pos[r][0] - net) < cfg.kitchen * M) { ball.rest = end; ctx.call('키친 발리!', pos[r], { color: '#f87171' }); point(ctx, f.team, '(키친 안에서는 발리 금지)', '#f87171'); return true; }
        ctx.give(r); ctx.call(cfg.air ? (cfg.hitWord || '리턴!') : '발리!', pos[r], { color: '#fde047' }); return true;
      }
      ball.rest = end;
      const [x0, y0, x1, y1] = cfg.land(F, f.k === 'serve');
      const inside = end[0] >= x0 && end[0] <= x1 && end[1] >= y0 && end[1] <= y1;
      if (!inside) { ctx.call('아웃!', end, { color: '#f87171' }); point(ctx, other(f.team), '(밖으로 나갔어요)', '#f87171'); return true; }
      if (cfg.air) { ctx.call(cfg.downWord || '바닥!', end, { color: '#facc15' }); point(ctx, f.team, cfg.winWhy); return true; }
      /* 한 번 튀고 받기 */
      ctx.call('바운드', end, { color: '#e2e8f0' });
      const L = dist(f.pts[0], end) || 1, ext = [end[0] + (end[0] - f.pts[0][0]) / L * cfg.ext * M, end[1] + (end[1] - f.pts[0][1]) / L * cfg.ext * M];
      const r = ctx.nearest(ext, cfg.reach * M, j => P[j].t !== f.team);
      if (r < 0) { ctx.kill(); ctx.call('못 받았어요', ext, { color: '#facc15' }); ctx.big(`${T()[f.team]} 득점! ${cfg.winWhy}`, { color: '#facc15' }); return true; }
      if (cfg.alternate && ball.lastHit[P[r].t] === r) { ctx.kill(); ctx.call('순서 위반!', pos[r], { color: '#f87171' }); point(ctx, f.team, '(복식은 두 사람이 번갈아 쳐야 해요)', '#f87171'); return true; }
      ball.rest = null;
      const pts = [[...end], [...pos[r]]], len = polyLen(pts), sp = (f.K.speed || 8) * .7;
      ball.flight = { a: { id: 'bnc' }, K: { speed: sp, arc: .12, noHome: true }, k: 'bounce', h: f.h, team: f.team, t0: ctx.t, dur: .08 + len / (sp * M), pts, drawnEnd: pts[1], len, arc: .12 * len + .2 * M, snap: [], recv: r, bounceTo: r };
      return true;
    }
  };
}
const rk = (name, color, o = {}) => ({ name, type: 'ball', color, dash: o.dash ?? '', w: o.w ?? 1, noHome: true, ...o });
const diag = (from, end, cy) => Math.sign(from[1] - cy) !== Math.sign(end[1] - cy);
const RK_TEAMS = { A: '우리 팀', B: '상대 팀' };
const rkBase = (o) => ({
  teams: RK_TEAMS, max: 4, family: 'racket', familyName: '라켓 스포츠',
  pos: { A: ['1', '2'], B: ['1', '2'] }, posName: { 1: '1번', 2: '2번' },
  defaultKind: 'move', homeR: 1, holdMin: .15, carryOnRun: false, noIntercept: true, loose: false, snapT: .3, read: .45,
  tokenStyle: p => p.t === 'A' ? { fill: '#2563eb', stroke: '#ffffff', ink: '#ffffff' } : { fill: '#dc2626', stroke: '#ffffff', ink: '#ffffff' },
  ...o
});

/* ---------- 🏸 배드민턴 (복식 코트 13.4 × 6.1m) ---------- */
const BD = {
  name: '배드민턴 복식 코트', vb: '-48 -34 498 251', m: 30, tok: 11, ball: 5, lw: 2.4, flip: 'y', bounds: [-40, -26, 442, 209], net: 201, cy: 91.5, court: [0, 0, 402, 183],
  draw() {
    let s = `<rect x="-48" y="-34" width="498" height="251" fill="#1e3a5f"/><rect x="0" y="0" width="402" height="183" fill="#15803d"/>`;
    const w = 1.6, L = (a, b, c, d) => LN(a, b, c, d, w);
    s += `<rect x="0" y="0" width="402" height="183" fill="none" stroke="#fff" stroke-width="${w}"/>`;
    s += L(0, 13.8, 402, 13.8) + L(0, 169.2, 402, 169.2) + L(141.6, 0, 141.6, 183) + L(260.4, 0, 260.4, 183) + L(22.8, 0, 22.8, 183) + L(379.2, 0, 379.2, 183);
    s += L(0, 91.5, 141.6, 91.5) + L(260.4, 91.5, 402, 91.5);
    s += `<line x1="201" y1="-8" x2="201" y2="191" stroke="#f8fafc" stroke-width="3.2" stroke-dasharray="2 1.6"/><circle cx="201" cy="-8" r="3" fill="#f8fafc"/><circle cx="201" cy="191" r="3" fill="#f8fafc"/>`;
    s += TX(171, 205, '숏 서비스 라인', 9, { op: .6 }) + TX(11, 205, '복식 롱 서비스 라인', 8, { op: .5, a: 'start' }) + TX(320, -16, '상대 코트 ▶', 10, { op: .55 });
    return s;
  }
};
const badminton = rkBase({
  id: 'badminton', name: '배드민턴', icon: '🏸', ball: 'shuttle',
  fields: { court: BD }, defaultField: 'court',
  kinds: {
    move: kRun('이동(풋워크)', { speed: 4.2 }),
    serve: rk('서브', COL.serve, { dash: '1.2 2.4', speed: 6, arc: .22, hint: '대각선 상대 서비스 코트로 (숏 서비스 라인 넘기기)' }),
    clear: rk('클리어', COL.lob, { speed: 8, arc: .45, hint: '상대 코트 끝까지 높고 길게' }),
    drop: rk('드롭', '#a3e635', { dash: '3 2', speed: 5.5, arc: .28, hint: '네트 바로 넘어 살짝 떨어뜨리기' }),
    smash: rk('스매시', COL.shot, { w: 1.2, speed: 20, arc: .02, hint: '높은 셔틀을 아래로 강하게 내리치기' }),
    drive: rk('드라이브', COL.pass, { dash: '1.2 2', speed: 13, arc: .04, hint: '네트 높이로 빠르고 평평하게' }),
    net: rk('헤어핀', COL.toss, { dash: '1 1.6', speed: 3.2, arc: .5, hint: '네트 앞에서 살짝 넘기기' }),
    def: kDef('자리 잡기', { speed: 4.2 })
  },
  catchR: 1.5,
  rules: racketRules({
    air: true, airR: 1.5, hitWord: '리턴!', downWord: '셔틀 바닥!', winWhy: '(셔틀콕이 상대 코트 바닥에 떨어졌어요)',
    land: (F, sv) => sv ? [0, 0, 402, 183] : [0, 0, 402, 183],
    serveCheck(F, t, from, end) {
      if (!diag(from, end, F.cy)) return '서브는 대각선으로 넣어요';
      const dx = Math.abs(end[0] - F.net);
      if (dx < 59.4) return '숏 서비스 라인을 넘기지 못했어요';
      if (dx > 178.2) return '복식 롱 서비스 라인을 넘었어요';
      return '';
    }
  }),
  tips: [
    ['공격은 앞뒤, 수비는 좌우', '우리가 공격할 때는 한 명은 뒤에서 스매시, 한 명은 네트 앞(전위)에 서요. 수비할 때는 나란히 좌우로 서서 반씩 맡아요.'],
    ['서브는 대각선', '서브는 대각선 서비스 코트로! 숏 서비스 라인을 넘겨야 하고, 복식은 뒤쪽 롱 서비스 라인 안에 떨어져야 해요.'],
    ['높은 공 = 기회', '상대가 높게 올려 주면 스매시 기회예요. 낮고 빠른 드라이브나 네트 앞 헤어핀으로 높은 공을 주지 않는 게 수비의 핵심이에요.'],
    ['셔틀은 바닥에 닿으면 끝', '셔틀콕은 튀지 않아요. 바닥에 떨어지기 전에 쳐서 넘겨야 해요.']
  ],
  presets: [
    { id: 'frontback', group: '공격', name: '스매시 → 전위 마무리',
      desc: '뒤에 있는 2번이 스매시! 상대가 겨우 네트 앞으로 받아 넘기면, 앞에 있던 1번이 달려들어 빈 곳에 꽂아요.',
      tip: '공격할 때는 앞뒤(전위·후위)로 서요. 전위는 네트 앞에서 짧은 공을 노려요.',
      players: [['A', '1', 150, 90], ['A', '2', 70, 95, { ball: 1 }], ['B', '1', 300, 50], ['B', '2', 300, 132]],
      lines: [[1, 'smash', [[222, 35]]], [3, 'net', [[-122, -12]]], [0, 'move', [[15, 22]], { delay: .5 }], [0, 'smash', [[210, -65]], { from: [15, 22] }]] },
    { id: 'short3', group: '공격', name: '숏 서브 → 3구 공격',
      desc: '1번이 네트 바로 너머로 짧게 서브해요. 상대가 위로 띄워 넘기면, 뒤에서 기다리던 2번이 스매시로 두 사람 사이를 뚫어요.',
      tip: '복식은 짧은 서브가 기본! 상대가 공을 위로 올리게 만들어요.',
      players: [['A', '1', 150, 115, { ball: 1 }], ['A', '2', 90, 90], ['B', '1', 280, 62], ['B', '2', 345, 118]],
      lines: [[0, 'serve', [[118, -45]]], [2, 'clear', [[-235, -12]]], [1, 'move', [[-35, -18]], { delay: .9 }], [1, 'smash', [[230, 7]], { from: [-35, -18] }], [0, 'move', [[0, -25]], { delay: 1 }], [2, 'def', [[25, -10]], { delay: 1.2 }]] },
    { id: 'drive', group: '공격', name: '드라이브로 빈 곳 찌르기',
      desc: '빠르고 평평한 드라이브를 주고받다가, 상대가 한쪽으로 몰린 틈에 반대쪽 옆줄로 드라이브!',
      tip: '드라이브는 네트 높이로 빠르게. 상대가 위로 띄우지 못하게 해요.',
      players: [['A', '1', 130, 60, { ball: 1 }], ['A', '2', 130, 125], ['B', '1', 275, 60], ['B', '2', 275, 125]],
      lines: [[0, 'drive', [[145, 0]]], [2, 'drive', [[-145, 65]]], [3, 'def', [[0, -40]], { delay: .9 }], [1, 'drive', [[180, 50]]]] },
    { id: 'sbs', group: '수비', name: '좌우 수비로 스매시 받기',
      desc: '상대가 스매시하면 우리는 좌우로 나란히 서서 반씩 맡아요. 스매시를 네트 앞으로 짧게 받아 넘기면 상대 전위가 늦어요.',
      tip: '수비 때는 나란히(사이드 바이 사이드)! 라켓을 앞에 들고 낮은 자세로 기다려요.',
      players: [['A', '1', 100, 52], ['A', '2', 100, 132], ['B', '1', 330, 92, { ball: 1 }], ['B', '2', 245, 90]],
      lines: [[2, 'smash', [[-232, 38]]], [1, 'net', [[128, 30]]], [3, 'move', [[0, 25]], { delay: 1.2 }]] },
    { id: 'lift', group: '수비', name: '클리어로 시간 벌기',
      desc: '몰리는 상황에서는 높고 길게 클리어를 쳐서 상대를 뒤로 보내요. 그 사이 우리는 좌우 수비 자리로 돌아와요.',
      tip: '높게 칠수록 셔틀이 오래 떠 있어 자리를 잡을 시간이 생겨요.',
      players: [['A', '1', 160, 50, { ball: 1 }], ['A', '2', 160, 130], ['B', '1', 245, 70], ['B', '2', 310, 120]],
      lines: [[0, 'clear', [[220, 100]]], [0, 'move', [[-60, 2]], { delay: .4 }], [1, 'move', [[-60, 2]], { delay: .4 }], [3, 'move', [[58, 25]], { delay: .2 }], [3, 'smash', [[-268, -47]], { from: [58, 25] }], [0, 'drive', [[180, -40]], { from: [-60, 2] }]] },
    { id: 'longsv', group: '수비', name: '롱 서브 받기',
      desc: '상대가 뒤쪽으로 길게 서브하면, 받는 1번이 물러나며 클리어로 상대 코트 끝까지 돌려보내요. 짝(2번)은 반대쪽을 지켜요.',
      tip: '서브를 받을 때는 숏 서비스 라인 가까이에 서되, 긴 서브에 대비해 오른발을 뒤에 둬요.',
      players: [['A', '1', 125, 60], ['A', '2', 85, 130], ['B', '1', 260, 125, { ball: 1 }], ['B', '2', 330, 70]],
      lines: [[2, 'serve', [[-230, -75]]], [0, 'move', [[-90, -10]], { delay: .1 }], [0, 'clear', [[260, 100]], { from: [-90, -10] }], [3, 'move', [[45, 75]], { delay: .8 }]] }
  ]
});

/* ---------- 🏓 탁구 (복식, 탁구대 2.74 × 1.525m) ---------- */
const TT = {
  name: '탁구 복식', vb: '-185 -78 589 278', m: 80, tok: 14, ball: 3.6, lw: 3.4, flip: 'y', bounds: [-175, -68, 394, 190], net: 109.6, cy: 61, court: [0, 0, 219.2, 122],
  draw() {
    let s = `<rect x="-185" y="-78" width="589" height="278" fill="#7c2d12"/>` + planks(-185, -78, 589, 278, 40, '#9a3412', '#92330f');
    s += `<rect x="-6" y="128" width="231" height="10" rx="3" fill="#000" fill-opacity=".25"/>`;
    s += `<rect x="0" y="0" width="219.2" height="122" fill="#1d4ed8" stroke="#fff" stroke-width="2.4"/>` + LN(0, 61, 219.2, 61, 1.1);
    s += `<rect x="107.6" y="-10" width="4" height="142" fill="#f8fafc" fill-opacity=".9"/><rect x="106.6" y="-14" width="6" height="6" fill="#111827"/><rect x="106.6" y="130" width="6" height="6" fill="#111827"/>`;
    s += TX(-90, 190, '우리 팀', 14, { op: .6 }) + TX(310, 190, '상대 팀', 14, { op: .6 }) + TX(54.8, -22, '오른쪽 반 → 대각선 오른쪽 반', 9.5, { op: .55 });
    return s;
  }
};
const tabletennis = rkBase({
  id: 'tabletennis', name: '탁구', icon: '🏓', ball: 'pingpong',
  fields: { table: TT }, defaultField: 'table',
  kinds: {
    move: kRun('이동(비켜 주기)', { speed: 2.6, hint: '치고 나서 짝에게 자리를 비켜 주기' }),
    serve: rk('서브', COL.serve, { dash: '1.2 2.4', speed: 3.2, arc: .12, hint: '내 오른쪽 반에서 상대 오른쪽 반(대각선)으로' }),
    drive: rk('드라이브', COL.shot, { speed: 7.5, arc: .1, hint: '공을 감아 올려 빠르게 넘기기' }),
    push: rk('커트(푸시)', COL.pass, { dash: '1.2 2', speed: 3.4, arc: .1, hint: '아래로 깎아 짧고 낮게 넘기기' }),
    flick: rk('플릭', COL.toss, { dash: '1 1.6', speed: 5.5, arc: .08, hint: '짧은 공을 손목으로 튕겨 공격' }),
    smash: rk('스매시', '#f97316', { w: 1.2, speed: 11, arc: .03, hint: '높게 뜬 공을 강하게 내리치기' })
  },
  catchR: .6,
  rules: racketRules({
    air: false, airR: .1, ext: .4, reach: .8, alternate: true, hitWord: '리턴!', winWhy: '(상대가 받지 못했어요)',
    land: () => [0, 0, 219.2, 122],
    serveCheck(F, t, from, end) {
      const right = t === 'A' ? from[1] > F.cy : from[1] < F.cy;
      if (!right) return '복식 서브는 내 오른쪽 반에서 넣어요';
      if (!diag(from, end, F.cy)) return '서브는 대각선(상대 오른쪽 반)으로 넣어요';
      return '';
    }
  }),
  tips: [
    ['번갈아 치기', '복식은 짝과 한 번씩 번갈아 쳐야 해요. 같은 사람이 두 번 연속 치면 상대 점수예요.'],
    ['치고 비켜 주기', '공을 친 사람은 바로 옆·뒤로 비켜서 짝이 칠 자리를 만들어 줘요.'],
    ['복식 서브', '복식 서브는 내 오른쪽 반에서 상대 오른쪽 반으로, 대각선으로 넣어요. (가운데 흰 줄 기준)'],
    ['짧게, 길게', '짧은 커트로 상대를 앞으로 끌어낸 뒤 길고 빠른 드라이브로 공격하면 좋아요.']
  ],
  presets: [
    { id: 'serve3', group: '공격', name: '짧은 서브 → 3구 드라이브',
      desc: '1번이 짧게 서브하고 바로 비켜요. 상대가 커트로 넘기면 짝(2번)이 들어와 드라이브로 공격!',
      tip: '서브를 넣은 사람은 반드시 비켜서 짝의 자리를 만들어 줘요.',
      players: [['A', '1', -30, 92, { ball: 1 }], ['A', '2', -80, 40], ['B', '1', 262, 30], ['B', '2', 310, 75]],
      lines: [[0, 'serve', [[205, -67]]], [0, 'move', [[-40, 45]], { delay: .2 }], [2, 'push', [[-197, 35]]], [2, 'move', [[25, -30]], { delay: .2 }], [1, 'move', [[56, 40]], { delay: .1 }], [1, 'drive', [[292, 78]], { from: [56, 40] }]] },
    { id: 'wide', group: '공격', name: '양옆 끝 찌르기',
      desc: '복식은 두 사람이 번갈아 쳐야 해서 움직임이 커요. 상대가 비켜 나간 쪽 끝 모서리로 길게 찔러요.',
      tip: '상대가 방금 친 사람이 비켜 간 쪽이 비어요.',
      players: [['A', '1', -30, 92, { ball: 1 }], ['A', '2', -80, 30], ['B', '1', 262, 30], ['B', '2', 300, 45]],
      lines: [[0, 'serve', [[205, -67]]], [0, 'move', [[-40, 45]], { delay: .2 }], [2, 'push', [[-202, -5]]], [2, 'move', [[40, -45]], { delay: .2 }], [1, 'move', [[45, 0]], { delay: .1 }], [1, 'drive', [[292, 88]], { from: [45, 0] }]] },
    { id: 'smash', group: '공격', name: '높은 공 스매시',
      desc: '상대가 공을 높게 띄워 넘기면, 차례인 사람이 앞으로 나와 스매시로 끝내요.',
      tip: '스매시 전에 짝은 미리 뒤로 비켜 줘요.',
      players: [['A', '1', -40, 95], ['A', '2', -60, 30], ['B', '1', 270, 40, { ball: 1 }], ['B', '2', 320, 100]],
      lines: [[2, 'drive', [[-215, 45]]], [0, 'smash', [[235, 15]]], [1, 'move', [[-30, -20]], { delay: .2 }]] },
    { id: 'recv', group: '수비', name: '서브 받기 → 커트로 짧게',
      desc: '상대 서브를 커트로 짧고 낮게 넘겨요. 상대가 공격하기 어렵고, 친 다음 비켜 주면 짝이 다음 공을 받아요.',
      tip: '짧은 공을 받을 때는 오른발을 탁구대 밑으로 쑥 넣어요.',
      players: [['A', '1', -42, 92], ['A', '2', -90, 30], ['B', '1', 262, 30, { ball: 1 }], ['B', '2', 300, 92]],
      lines: [[2, 'serve', [[-232, 65]]], [0, 'push', [[192, 3]]], [0, 'move', [[-30, 40]], { delay: .2 }], [3, 'move', [[-60, 8]], { delay: .1 }], [3, 'drive', [[-260, -62]], { from: [-60, 8] }], [3, 'move', [[0, 48]], { from: [-60, 8], delay: .1 }], [1, 'move', [[45, 0]], { delay: .2 }], [1, 'push', [[285, 80]], { from: [45, 0] }]] },
    { id: 'block', group: '수비', name: '드라이브를 블록으로 막기',
      desc: '상대가 강하게 드라이브하면 라켓을 세워 대기만 해도(블록) 공이 넘어가요. 상대 쪽 빈 곳으로 방향만 바꿔요.',
      tip: '세게 치려 하지 말고 라켓 각도만 맞춰요.',
      players: [['A', '1', -42, 92], ['A', '2', -80, 20], ['B', '1', 270, 30, { ball: 1 }], ['B', '2', 330, 100]],
      lines: [[2, 'drive', [[-245, 75]]], [2, 'move', [[30, -40]], { delay: .1 }], [0, 'push', [[242, 18]]], [3, 'move', [[-40, -50]], { delay: .2 }]] },
    { id: 'order', group: '수비', name: '규칙: 번갈아 치지 않으면?',
      desc: '복식은 짝과 번갈아 쳐야 해요. 1번이 서브 받은 뒤 비켜 주지 않고 또 치면 「순서 위반」으로 상대 점수예요.',
      tip: '1번의 「비켜 주기」 선을 그려 넣고 2번이 치게 바꿔 보세요.',
      players: [['A', '1', -42, 92], ['A', '2', -90, 30], ['B', '1', 262, 30, { ball: 1 }], ['B', '2', 300, 92]],
      lines: [[2, 'serve', [[-232, 65]]], [0, 'push', [[192, 3]]], [3, 'move', [[-60, 8]], { delay: .1 }], [3, 'drive', [[-260, -7]], { from: [-60, 8] }], [0, 'drive', [[230, -50]]]] }
  ]
});

/* ---------- 🥒 피클볼 (복식 코트 13.41 × 6.1m) ---------- */
const PB = {
  name: '피클볼 코트', vb: '-78 -34 558 251', m: 30, tok: 11, ball: 4, lw: 2.4, flip: 'y', bounds: [-70, -26, 472, 209], net: 201, cy: 91.5, court: [0, 0, 402, 183],
  draw() {
    let s = `<rect x="-78" y="-34" width="558" height="251" fill="#1e40af"/><rect x="0" y="0" width="402" height="183" fill="#0f766e"/>`;
    s += `<rect x="137" y="0" width="128" height="183" fill="#14b8a6" fill-opacity=".45"/>`;
    const w = 1.8, L = (a, b, c, d) => LN(a, b, c, d, w);
    s += `<rect x="0" y="0" width="402" height="183" fill="none" stroke="#fff" stroke-width="${w}"/>` + L(137, 0, 137, 183) + L(265, 0, 265, 183) + L(0, 91.5, 137, 91.5) + L(265, 91.5, 402, 91.5);
    s += `<line x1="201" y1="-8" x2="201" y2="191" stroke="#f8fafc" stroke-width="3.2" stroke-dasharray="2 1.6"/>`;
    s += TX(169, 205, '키친(논발리 존)', 10, { op: .7 }) + TX(233, 205, '키친', 10, { op: .7 }) + TX(320, -16, '상대 코트 ▶', 10, { op: .55 });
    return s;
  }
};
const pickleball = rkBase({
  id: 'pickleball', name: '피클볼', icon: '🥒', ball: 'pickle',
  fields: { court: PB }, defaultField: 'court',
  kinds: {
    move: kRun('이동', { speed: 3.6 }),
    serve: rk('서브', COL.serve, { dash: '1.2 2.4', speed: 9, arc: .16, hint: '아래에서 위로 쳐서 대각선 서비스 코트로 (키친 넘기기)' }),
    drive: rk('드라이브', COL.shot, { speed: 13, arc: .05, hint: '낮고 빠르게 깊이 치기' }),
    drop: rk('서드 샷 드롭', '#a3e635', { dash: '3 2', speed: 6.5, arc: .3, hint: '상대 키친 안에 부드럽게 떨어뜨리기' }),
    dink: rk('딩크', COL.toss, { dash: '1 1.6', speed: 3.6, arc: .35, hint: '키친 앞에서 키친 안으로 살짝' }),
    volley: rk('발리', COL.pass, { dash: '1.2 2', speed: 11, arc: .04, air: true, hint: '튀기 전에 공중에서 치기 (키친 밖에서만!)' }),
    lob: rk('로브', COL.lob, { speed: 7, arc: .5, hint: '키친 앞 상대 머리 위로 높게' }),
    def: kDef('자리 잡기', { speed: 3.6 })
  },
  catchR: 1,
  rules: racketRules({
    air: false, airR: 1.1, ext: 1.6, reach: 1.5, twoBounce: true, kitchen: 2.13, hitWord: '리턴!', winWhy: '(상대가 받지 못했어요)',
    land: () => [0, 0, 402, 183],
    serveCheck(F, t, from, end) {
      if (!diag(from, end, F.cy)) return '서브는 대각선으로 넣어요';
      if (Math.abs(end[0] - F.net) < 64) return '서브가 키친에 떨어졌어요';
      return '';
    }
  }),
  tips: [
    ['투 바운스 규칙', '서브를 받는 쪽도, 그 공을 다시 받는 서브 쪽도 한 번 튄 다음에 쳐야 해요. 세 번째 공부터 발리(공중에서 치기)를 할 수 있어요.'],
    ['키친(논발리 존)', '네트 앞 2.13m 구역(키친) 안에서는 발리를 할 수 없어요. 튄 공은 들어가서 쳐도 괜찮아요.'],
    ['함께 앞으로', '두 사람이 함께 키친 선까지 올라가면 유리해요. 서드 샷 드롭으로 시간을 벌며 앞으로 나가요.'],
    ['딩크 싸움', '키친 앞에서 서로 키친 안으로 살살 넘기는 딩크를 주고받다가, 높게 뜬 공을 발리로 공격해요.']
  ],
  presets: [
    { id: 'third', group: '공격', name: '서드 샷 드롭 → 함께 전진',
      desc: '서브 → 상대 리턴 → 우리 2번이 상대 키친 안으로 부드럽게 떨어뜨려요(서드 샷 드롭). 그 사이 우리 둘이 함께 키친 선까지 올라가요.',
      tip: '서브 팀은 두 번째 공이 튀길 기다려야 해서 뒤에 있어요. 드롭으로 시간을 벌며 앞으로!',
      players: [['A', '1', -15, 135, { ball: 1 }], ['A', '2', -10, 45], ['B', '1', 395, 45], ['B', '2', 280, 135]],
      lines: [[0, 'serve', [[345, -95]]], [2, 'drive', [[-345, 30]]], [1, 'drop', [[255, 30]]], [0, 'move', [[140, -15]], { delay: 1.6 }], [1, 'move', [[125, 10]], { delay: 2.4 }]] },
    { id: 'dinkspeed', group: '공격', name: '딩크 → 높은 공 발리',
      desc: '키친 앞에서 딩크를 주고받다가 상대 공이 높게 뜨면, 키친 밖에서 발리로 내리쳐 끝내요.',
      tip: '발리는 꼭 키친 선 밖에서! 발이 키친에 들어가면 반칙이에요.',
      players: [['A', '1', 125, 50, { ball: 1 }], ['A', '2', 125, 135], ['B', '1', 280, 50], ['B', '2', 280, 135]],
      lines: [[0, 'dink', [[100, 10]]], [2, 'lob', [[-110, 75]]], [1, 'volley', [[200, -90]]]] },
    { id: 'serve_deep', group: '공격', name: '깊은 서브 → 리턴 드라이브 공격',
      desc: '받는 팀이 깊게 리턴하고 바로 키친 선으로 올라가요. 서브 팀이 낮게 넘기지 못하면 발리로 공격!',
      tip: '리턴 팀은 리턴하자마자 앞으로! 서브 팀보다 먼저 키친 선을 차지해요.',
      players: [['A', '1', -15, 140], ['A', '2', 125, 48], ['B', '1', 415, 45, { ball: 1 }], ['B', '2', 410, 140]],
      lines: [[2, 'serve', [[-355, 90]]], [0, 'drive', [[370, -80]]], [0, 'move', [[135, -5]], { delay: 2.2 }], [2, 'drive', [[-300, 30]]], [1, 'volley', [[205, 127]]]] },
    { id: 'reset', group: '수비', name: '리셋: 빠른 공을 키친에 죽이기',
      desc: '상대가 세게 드라이브하면 맞받아 치지 말고, 라켓을 부드럽게 대서 상대 키친 안으로 떨어뜨려요(리셋).',
      tip: '빠른 공일수록 힘을 빼요. 낮게 떨어진 공은 상대가 세게 칠 수 없어요.',
      players: [['A', '1', 30, 50], ['A', '2', 30, 135], ['B', '1', 280, 60, { ball: 1 }], ['B', '2', 280, 135]],
      lines: [[2, 'drive', [[-240, 70]]], [1, 'drop', [[200, 40]]], [0, 'move', [[90, 0]], { delay: 1 }]] },
    { id: 'kitchenrule', group: '수비', name: '규칙: 키친 발리 반칙',
      desc: '키친 안에 서서 발리하면 반칙이에요. 1번이 키친 선을 넘어 들어가 발리하면 상대 점수가 돼요.',
      tip: '1번의 이동 선을 줄여 키친 밖에서 발리하게 바꿔 보세요.',
      players: [['A', '1', 125, 60], ['A', '2', 120, 135], ['B', '1', 280, 50, { ball: 1 }], ['B', '2', 280, 135]],
      lines: [[0, 'move', [[40, 5]], { delay: .2 }], [2, 'drive', [[-150, 15]]], [0, 'volley', [[200, 60]], { from: [40, 5] }]] },
    { id: 'twobounce', group: '수비', name: '규칙: 투 바운스',
      desc: '서브를 받는 1번이 앞으로 뛰어나가 공이 튀기 전에 발리로 받으면 반칙! 서브와 리턴은 반드시 한 번 튄 뒤 쳐야 해요.',
      tip: '1번의 이동 선을 지우고 발리를 「드라이브」로 바꿔 보세요.',
      players: [['A', '1', -15, 140], ['A', '2', 125, 48], ['B', '1', 415, 45, { ball: 1 }], ['B', '2', 410, 140]],
      lines: [[0, 'move', [[125, -18]], { delay: .1 }], [2, 'serve', [[-355, 90]]], [0, 'volley', [[330, -60]], { from: [125, -18] }]] }
  ]
});

/* ---------- 🎾 테니스 (복식 코트 23.77 × 10.97m) ---------- */
const TN = {
  name: '테니스 복식 코트', vb: '-82 -34 544 244', m: 16, tok: 11, ball: 4, lw: 2.2, flip: 'y', bounds: [-74, -26, 454, 202], net: 190, cy: 87.75, court: [0, 0, 380, 175.5],
  draw() {
    let s = `<rect x="-82" y="-34" width="544" height="244" fill="#166534"/><rect x="-60" y="-20" width="500" height="216" fill="#2563eb" fill-opacity=".55"/>`;
    s += `<rect x="0" y="0" width="380" height="175.5" fill="#1d4ed8"/>`;
    const w = 1.6, L = (a, b, c, d) => LN(a, b, c, d, w);
    s += `<rect x="0" y="0" width="380" height="175.5" fill="none" stroke="#fff" stroke-width="${w}"/>` + L(0, 21.9, 380, 21.9) + L(0, 153.6, 380, 153.6);
    s += L(87.6, 21.9, 87.6, 153.6) + L(292.4, 21.9, 292.4, 153.6) + L(87.6, 87.75, 292.4, 87.75) + L(0, 87.75, 4, 87.75) + L(376, 87.75, 380, 87.75);
    s += `<line x1="190" y1="-10" x2="190" y2="185.5" stroke="#f8fafc" stroke-width="3" stroke-dasharray="2 1.6"/>`;
    s += TX(139, 198, '서비스 박스', 9, { op: .6 }) + TX(-38, 87.75, '베이스라인', 8, { op: .55, rot: -90 }) + TX(330, -14, '상대 코트 ▶', 10, { op: .55 }) + TX(40, 15, '복식 앨리', 7.5, { op: .5 });
    return s;
  }
};
const tennis = rkBase({
  id: 'tennis', name: '테니스', icon: '🎾', ball: 'tennis',
  fields: { court: TN }, defaultField: 'court',
  kinds: {
    move: kRun('이동', { speed: 5 }),
    serve: rk('서브', COL.serve, { dash: '1.2 2.4', speed: 30, arc: .04, hint: '대각선 서비스 박스 안으로' }),
    stroke: rk('그라운드 스트로크', COL.shot, { speed: 18, arc: .08, hint: '한 번 튄 공을 베이스라인 근처에서 치기' }),
    lob: rk('로브', COL.lob, { speed: 10, arc: .4, hint: '네트 앞 상대 머리 위로 높게 넘기기' }),
    drop: rk('드롭샷', '#a3e635', { dash: '3 2', speed: 8, arc: .22, hint: '네트 바로 너머로 짧게' }),
    volley: rk('발리', COL.pass, { dash: '1.2 2', speed: 18, arc: .03, air: true, hint: '네트 앞에서 튀기 전에 치기' }),
    smash: rk('스매시', '#f97316', { w: 1.2, speed: 28, arc: .02, air: true, hint: '높게 뜬 공을 머리 위에서 내리치기' })
  },
  catchR: 1.4,
  rules: racketRules({
    air: false, airR: 1.6, ext: 4, reach: 2.6, hitWord: '리턴!', winWhy: '(상대가 받지 못했어요)',
    land: (F, sv) => [0, 0, 380, 175.5],
    serveCheck(F, t, from, end) {
      if (!diag(from, end, F.cy)) return '서브는 대각선 서비스 박스로 넣어요';
      if (Math.abs(end[0] - F.net) > 102.4) return '서비스 박스보다 길게 나갔어요';
      if (end[1] < 21.9 || end[1] > 153.6) return '서브는 복식 앨리에 떨어지면 안 돼요';
      return '';
    }
  }),
  tips: [
    ['한 명은 앞, 한 명은 뒤', '복식 기본 대형은 한 명이 네트 앞(발리), 한 명이 베이스라인(스트로크)이에요. 둘 다 앞으로 나가면 더 공격적이에요.'],
    ['포치', '네트 앞 선수가 가운데로 뛰어들어 상대 크로스 공을 발리로 가로채는 걸 포치라고 해요. 복식의 가장 큰 무기!'],
    ['가운데를 노려요', '두 사람 사이 가운데로 치면 누가 받을지 망설여요.'],
    ['복식 앨리', '랠리 중에는 바깥 복식 앨리까지 코트예요. 서브만은 서비스 박스(앨리 제외) 안에 넣어야 해요.']
  ],
  presets: [
    { id: 'poach', group: '공격', name: '서브 → 네트 앞 포치',
      desc: '1번이 대각선으로 서브하고, 상대가 크로스로 받아 치는 순간 네트 앞 2번이 가운데로 뛰어들어 발리로 가로채요.',
      tip: '포치는 상대가 공을 치는 순간 출발해요. 너무 일찍 움직이면 들켜요.',
      players: [['A', '1', -8, 125, { ball: 1 }], ['A', '2', 140, 45], ['B', '1', 368, 42], ['B', '2', 240, 125]],
      lines: [[0, 'serve', [[283, -65]]], [2, 'stroke', [[-308, 88]]], [1, 'move', [[12, 58]], { delay: .9 }], [1, 'volley', [[110, -10]], { from: [12, 58] }]] },
    { id: 'middle', group: '공격', name: '두 사람 가운데로',
      desc: '상대 둘이 베이스라인에 나란히 있을 때, 정확히 두 사람 사이 가운데로 깊게 쳐요. 서로 미루다가 놓쳐요.',
      tip: '「가운데」는 복식에서 가장 확실한 길이에요.',
      players: [['A', '1', 10, 60, { ball: 1 }], ['A', '2', 150, 125], ['B', '1', 400, 20], ['B', '2', 400, 155]],
      lines: [[0, 'stroke', [[340, 28]]]] },
    { id: 'lobover', group: '공격', name: '네트 앞 상대 머리 위로 로브',
      desc: '상대 둘이 모두 네트 앞으로 올라오면 머리 위로 높게 로브! 뒤로 달려가도 늦어요.',
      tip: '로브는 높게, 그리고 베이스라인 가까이 깊게.',
      players: [['A', '1', 5, 60, { ball: 1 }], ['A', '2', 10, 130], ['B', '1', 240, 55], ['B', '2', 240, 125]],
      lines: [[0, 'lob', [[350, 30]]], [2, 'move', [[60, 20]], { delay: .6 }], [3, 'move', [[60, -10]], { delay: .7 }]] },
    { id: 'return', group: '수비', name: '리턴은 크로스로 낮게',
      desc: '상대 서브를 받을 때는 네트 앞 선수를 피해 대각선(크로스)으로 낮게 받아 쳐요. 서버 쪽으로 돌려보내면 안전해요.',
      tip: '리턴이 네트 앞 선수 쪽으로 가면 바로 발리 공격을 당해요.',
      players: [['A', '1', 15, 140], ['A', '2', -8, 45], ['B', '1', 388, 45, { ball: 1 }], ['B', '2', 240, 130]],
      lines: [[2, 'serve', [[-283, 85]]], [0, 'stroke', [[365, -50]]]] },
    { id: 'twoback', group: '수비', name: '둘 다 뒤로 (수비 대형)',
      desc: '상대가 강하게 공격할 때는 둘 다 베이스라인으로 물러나요. 스매시를 받아 높게 로브로 돌려보내며 버텨요.',
      tip: '둘 다 뒤에 있으면 공을 받을 시간이 늘어나요.',
      players: [['A', '1', -20, 50], ['A', '2', -20, 125], ['B', '1', 230, 90, { ball: 1 }], ['B', '2', 260, 30]],
      lines: [[2, 'smash', [[-160, 25]]], [1, 'lob', [[350, -60]]], [3, 'move', [[85, 0]], { delay: .4 }]] },
    { id: 'switchpos', group: '수비', name: '로브 맞으면 자리 바꾸기',
      desc: '네트 앞 2번 머리 위로 로브가 넘어가면, 뒤의 1번이 대각선으로 달려가 받고 2번은 반대쪽으로 자리를 바꿔요.',
      tip: '「스위치!」 하고 크게 외치며 자리를 바꿔요.',
      players: [['A', '1', -10, 125], ['A', '2', 140, 45], ['B', '1', 380, 45, { ball: 1 }], ['B', '2', 240, 125]],
      lines: [[2, 'lob', [[-345, -15]]], [0, 'move', [[0, -95]], { delay: .2 }], [1, 'move', [[0, 80]], { delay: .4 }], [0, 'stroke', [[340, 25]], { from: [0, -95] }]] }
  ]
});

const RACKET = ['badminton', 'tabletennis', 'pickleball', 'tennis'];
SPORTS.push(chukball, badminton, tabletennis, pickleball, tennis);
Object.assign(SPORT, { chukball, badminton, tabletennis, pickleball, tennis });
