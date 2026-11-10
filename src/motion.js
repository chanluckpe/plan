/* =====================================================================
   모션: 첫 인트로 · 종목 카드 확대 전환 · 작전판 페이드 인
   ===================================================================== */
const RM = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const anim = (el, kf, o) => el.animate(kf, { fill: 'both', ...o });
const done = a => a.finished.catch(() => {});
const wait = ms => new Promise(r => setTimeout(r, ms));
let fxBusy = false;

/* ---------- 1) 첫 인트로 ---------- */
function runIntro() {
  const root = document.documentElement, intro = $('intro');
  const finish = () => { root.classList.add('intro-done'); intro && intro.remove(); };
  if (!intro) return finish();
  if (/skipintro/.test(location.hash)) return finish();
  const go = intro.querySelector('.in-go');
  let leaving = false;
  /* 화면 아무 곳이나 누르면 메인으로 (애니메이션이 끝나도 자동으로 넘어가지 않아요) */
  const leave = () => {
    if (leaving) return; leaving = true;
    removeEventListener('keydown', onKey);
    intro.getAnimations({ subtree: true }).forEach(a => { try { a.finish(); } catch (e) { a.cancel(); } });
    root.classList.add('intro-done');
    if (RM) { intro.remove(); return; }
    const out = anim(intro, [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.08)', filter: 'blur(6px)' }], { duration: 480, easing: 'ease-in' });
    revealHome(true);
    done(out).then(() => intro.remove());
  };
  const onKey = e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); leave(); } };
  intro.addEventListener('click', e => { if (e.target.closest('.in-foot')) return; leave(); }); addEventListener('keydown', onKey);
  if (RM) { intro.classList.add('static'); go.classList.add('show'); return; }

  const img = intro.querySelector('.in-img'), ring = intro.querySelector('.in-ring'), chars = [...intro.querySelectorAll('.in-ch')], tag = intro.querySelector('.in-tag'), spark = [...intro.querySelectorAll('.in-spark')];
  const ease = 'cubic-bezier(.2,1.4,.4,1)';
  anim(ring, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: .9, offset: .6 }, { transform: 'scale(1)', opacity: .55 }], { duration: 700, delay: 80, easing: 'ease-out' });
  anim(img, [{ transform: 'translateY(-60vh) rotate(-200deg) scale(.4)', opacity: 0 }, { transform: 'translateY(0) rotate(8deg) scale(1.12)', opacity: 1, offset: .7 }, { transform: 'translateY(0) rotate(-4deg) scale(1)', opacity: 1 }], { duration: 820, delay: 120, easing: ease });
  spark.forEach((s, i) => anim(s, [{ transform: 'scale(0) rotate(0deg)', opacity: 0 }, { transform: 'scale(1.2) rotate(90deg)', opacity: 1, offset: .5 }, { transform: 'scale(.9) rotate(180deg)', opacity: 0 }], { duration: 900, delay: 650 + i * 90, easing: 'ease-out' }));
  chars.forEach((c, i) => anim(c, [{ transform: 'translateY(46px) scale(.3) rotate(-18deg)', opacity: 0 }, { transform: 'translateY(-8px) scale(1.15) rotate(4deg)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 620 + i * 55, easing: ease }));
  const tagA = anim(tag, [{ transform: 'translateY(14px) scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 640 + chars.length * 55 + 120, easing: ease });
  /* 끝나면 아래에 「작전 분석 시작하기」가 나타나 깜빡여요 */
  done(tagA).then(() => { if (leaving) return; go.classList.add('show'); anim(go, [{ transform: 'translateY(18px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: ease, fill: 'none' }); });
}

/* 첫 화면 카드가 차례로 떠올라요 */
function revealHome(first) {
  if (RM) return;
  const app = document.querySelector('.app');
  if (first) anim(app, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
  const top = document.querySelector('.top'), foot = document.querySelector('#home ~ .sitefoot, .sitefoot');
  if (first && top) anim(top, [{ transform: 'translateY(-18px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 80, easing: 'cubic-bezier(.2,.9,.3,1)' });
  [...document.querySelectorAll('#sportGrid .tile')].forEach((t, i) => {
    anim(t, [{ transform: 'translateY(26px) scale(.86)', opacity: 0 }, { transform: 'translateY(-4px) scale(1.02)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: (first ? 160 : 40) + i * 38, easing: 'cubic-bezier(.2,1.2,.4,1)' })
      .finished.then(a => a.cancel()).catch(() => {});
  });
  if (foot) anim(foot, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: first ? 600 : 250 }).finished.then(a => a.cancel()).catch(() => {});
}

/* ---------- 2) 종목 카드 → 화면 가득 확대 ---------- */
/* 종목별 동작: [움직임, 효과 글자] */
const ACTION = {
  basketball: ['dunk', '덩크!'], volleyball: ['dunk', '스파이크!'], handball: ['dunk', '점프 슛!'], chukball: ['dunk', '팡!'], netball: ['throw', '패스!'],
  teeball: ['swing', '딱!'], floorball: ['swing', '딱!'], lacrosse: ['swing', '휙!'], racket: ['swing', '스매시!'],
  soccer: ['kick', '뻥!'], futsal: ['kick', '뻥!'], flag: ['run', '슝!'], rugby: ['run', '돌진!'],
  dodgeball: ['throw', '휙!'], ultimate: ['throw', '휘익!'], kinball: ['push', '옴니킨!']
};
const MOVES = {
  /* 뛰어올라 내리꽂기 */
  dunk: { hit: .62, origin: '50% 100%', kf: [{ transform: 'none' }, { transform: 'translateY(4%) scale(1.04,.94)', offset: .14 }, { transform: 'translateY(-16%) rotate(-5deg) scale(.98,1.06)', offset: .45 }, { transform: 'translateY(-14%) rotate(-7deg)', offset: .55 }, { transform: 'translateY(3%) rotate(5deg) scale(1.05,.93)', offset: .66 }, { transform: 'translateY(-2%) rotate(-1deg)', offset: .8 }, { transform: 'none' }] },
  /* 뒤로 젖혔다가 크게 휘두르기 */
  swing: { hit: .5, origin: '45% 92%', kf: [{ transform: 'none' }, { transform: 'rotate(-11deg) translateX(-3%)', offset: .32 }, { transform: 'rotate(-13deg) translateX(-4%)', offset: .42 }, { transform: 'rotate(12deg) translateX(4%) scale(1.04)', offset: .54 }, { transform: 'rotate(7deg) translateX(3%)', offset: .66 }, { transform: 'rotate(-2deg)', offset: .84 }, { transform: 'none' }] },
  /* 몸을 당겼다가 앞으로 차기 */
  kick: { hit: .52, origin: '50% 95%', kf: [{ transform: 'none' }, { transform: 'rotate(-7deg) translateX(-4%)', offset: .35 }, { transform: 'rotate(9deg) translateX(6%) scale(1.05)', offset: .52 }, { transform: 'rotate(4deg) translateX(4%)', offset: .68 }, { transform: 'none' }] },
  /* 통통 튀며 앞으로 달리기 */
  run: { hit: .7, origin: '50% 95%', kf: [{ transform: 'none' }, { transform: 'translate(-3%, -5%) rotate(-3deg)', offset: .15 }, { transform: 'translate(0, 0) rotate(2deg)', offset: .3 }, { transform: 'translate(3%, -5%) rotate(-3deg)', offset: .45 }, { transform: 'translate(6%, 0) rotate(3deg)', offset: .6 }, { transform: 'translate(10%, -4%) rotate(-2deg) scale(1.04)', offset: .72 }, { transform: 'none' }] },
  /* 뒤로 당겼다가 던지기 */
  throw: { hit: .55, origin: '40% 90%', kf: [{ transform: 'none' }, { transform: 'translateX(-6%) rotate(-9deg)', offset: .38 }, { transform: 'translateX(7%) rotate(8deg) scale(1.05)', offset: .55 }, { transform: 'translateX(3%) rotate(3deg)', offset: .7 }, { transform: 'none' }] },
  /* 힘을 모아 밀어 올리기 */
  push: { hit: .58, origin: '30% 95%', kf: [{ transform: 'none' }, { transform: 'scale(1.03,.94) translateY(3%)', offset: .35 }, { transform: 'scale(1.03,.92) translateY(4%)', offset: .45 }, { transform: 'translate(7%, -8%) rotate(5deg) scale(1.04)', offset: .6 }, { transform: 'translate(4%, -3%) rotate(2deg)', offset: .76 }, { transform: 'none' }] }
};
const STAR = (() => { let d = ''; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 30 : 48; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d + 'Z'; })();
async function zoomOpen(tile) {
  const id = tile.dataset.sport;
  const phone = window.fsMode && fsMode.phone();
  if (phone) fsMode.goFull();
  if (RM || fxBusy || !tile.animate) { openSport(id, 'make'); if (phone) fsMode.enter({ home: true, noFull: true }); else fadeInWorkspace(); return; }
  fxBusy = true;
  const r = tile.getBoundingClientRect(), W = innerWidth, H = innerHeight;
  const fx = document.createElement('div'); fx.className = 'zoom-fx';
  const veil = document.createElement('div'); veil.className = 'zoom-veil';
  const card = document.createElement('div'); card.className = 'zoom-card';
  card.style.cssText = `--c:${tile.style.getPropertyValue('--c')};left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
  const im = tile.querySelector('.tile-img');
  const act = ACTION[id] || ['jump', '나이스!'];
  card.innerHTML = `<div class="zc-img"><div class="zc-glow"></div>${im.innerHTML}<div class="zc-lines"></div><div class="zc-pow"><svg viewBox="-50 -50 100 100" aria-hidden="true"><path d="${STAR}"/></svg><b>${act[1]}</b></div></div><div class="zc-name">${tile.querySelector('.tile-name').textContent}</div>`;
  fx.append(veil, card); document.body.appendChild(fx);
  tile.style.visibility = 'hidden';

  /* 가운데로 굴러오며 커지기 → 화면 가득 */
  const s = Math.min(W * .62 / r.width, H * .62 / r.height, 2.6);
  const mw = r.width * s, mh = r.height * s, cx = (W - mw) / 2, cy = (H - mh) / 2;
  anim(veil, [{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'ease-out' });
  const home = $('home'); anim(home, [{ filter: 'blur(0)', transform: 'scale(1)' }, { filter: 'blur(7px)', transform: 'scale(.97)' }], { duration: 600, easing: 'ease-out' });
  /* ① 굴러서 가운데로 → ② 그 자리에서 종목 동작 (화면 가득 확대는 하지 않아요) */
  const T = 1650, c1 = .42, c2 = 1;
  const roll = anim(card, [
    { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transform: 'rotate(0deg)', borderRadius: '26px', easing: 'cubic-bezier(.3,.1,.25,1)' },
    { left: cx + 'px', top: cy + 'px', width: mw + 'px', height: mh + 'px', transform: 'rotate(360deg)', borderRadius: '34px', offset: c1 },
    { left: cx + 'px', top: cy + 'px', width: mw + 'px', height: mh + 'px', transform: 'rotate(360deg)', borderRadius: '34px' }
  ], { duration: T });
  const img = card.querySelector('.zc-img img'), A0 = T * c1 + 40, AD = T * (c2 - c1) - 80;
  anim(img, [{ transform: 'rotate(0deg) scale(.9)' }, { transform: 'rotate(-10deg) scale(1)', offset: .6 }, { transform: 'none' }], { duration: A0, easing: 'ease-in-out', fill: 'none' });
  const K = MOVES[act[0]];
  anim(img, K.kf, { duration: AD, delay: A0, easing: 'linear', fill: 'none' }).ready.then(() => { img.style.transformOrigin = K.origin || '50% 90%'; });
  anim(card.querySelector('.zc-glow'), [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: .3 }, { transform: 'scale(1.1)', opacity: 1 }], { duration: T * c2, easing: 'ease-out' });
  anim(card.querySelector('.zc-lines'), [{ opacity: 0 }, { opacity: 0, offset: K.hit - .12 }, { opacity: 1, transform: 'translateX(-4%)', offset: K.hit }, { opacity: 0, transform: 'translateX(4%)' }], { duration: AD, delay: A0, fill: 'both' });
  anim(card.querySelector('.zc-pow'), [{ transform: 'scale(0) rotate(-30deg)', opacity: 0 }, { transform: 'scale(0) rotate(-30deg)', opacity: 0, offset: K.hit - .02 }, { transform: 'scale(1.25) rotate(6deg)', opacity: 1, offset: K.hit + .1 }, { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: .9 }, { transform: 'scale(1.1)', opacity: 0 }], { duration: AD + 250, delay: A0, easing: 'ease-out' });
  await done(roll);
  await wait(160);

  /* 다음 화면 준비 → 덮개 사라지며 작전판 페이드 인 */
  home.getAnimations().forEach(a => a.cancel());
  openSport(id, 'make');
  tile.style.visibility = '';
  if (phone) fsMode.enter({ home: true, noFull: true }); else fadeInWorkspace(220);
  anim(card, [{ transform: 'rotate(360deg) scale(1)' }, { transform: 'rotate(360deg) scale(.92)' }], { duration: 420, easing: 'ease-in' });
  await done(anim(fx, [{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in' }));
  fx.remove(); fxBusy = false;
}

/* ---------- 3) 작전판 페이드 인 (부분별로 차례로) ---------- */
function fadeInWorkspace(delay = 0) {
  if (RM) return;
  const parts = ['.ws-bar', '#view-make .board-card', '#view-make .board-col > :not(.board-card)', '#view-make .side, #view-make .editor > :not(.board-col)', '.sitefoot'];
  let i = 0;
  parts.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    if (!el.offsetParent && el.tagName !== 'FOOTER') return;
    anim(el, [{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 560, delay: delay + i++ * 110, easing: 'cubic-bezier(.2,.8,.3,1)' })
      .finished.then(a => a.cancel()).catch(() => {});
  }));
}

/* 연결: 카드 클릭 · 돌아가기 */
['homeBtn', 'brandHome'].forEach(k => $(k).addEventListener('click', () => { if (!fxBusy) setTimeout(() => revealHome(false), 0); }));
runIntro();

/* 바깥 링크(유튜브 · 인스타 · 홈페이지): 새 창으로 열고, 막혀 있으면 주소를 복사해 알려 줘요 */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="http"]'); if (!a) return;
  e.preventDefault(); e.stopPropagation();
  let w = null;
  try { w = window.open(a.href, '_blank'); if (w) w.opener = null; } catch (er) {}
  if (w === null) {
    try { window.top.location.href = a.href; return; } catch (er) {}
    try { navigator.clipboard.writeText(a.href); toast('새 창이 막혀 있어 주소를 복사했어요. 브라우저 주소창에 붙여 넣어 주세요'); } catch (er) { toast(a.href); }
  }
}, true);
