/* =====================================================================
   모바일 전용: 작전판 전체화면 그리기
   하단 고정 줄 — 예시 작전 · 선수 세팅 · 작전 보기 · 편집 도구 · 작전 보내기
   ===================================================================== */
(function () {
  const layer = $('fsLayer'), stage = $('fsStage'), sheet = $('fsSheet'), sheetBody = $('fsSheetBody'), pbar = $('fsPbar');
  const homes = new Map(); /* 옮긴 요소 → 원래 자리 표시 */
  const park = el => { if (!el || homes.has(el)) return el; const mark = document.createComment('fs'); el.parentNode.insertBefore(mark, el); homes.set(el, mark); return el; };
  const unpark = el => { const m = homes.get(el); if (m) { m.parentNode.insertBefore(el, m); m.remove(); homes.delete(el); } };
  const SHEETS = {
    preset: { title: '예시 작전', els: () => [$('presetList').closest('.panel')] },
    roster: { title: '선수 세팅', els: () => [$('roster').closest('.panel')] },
    tools: { title: '편집 도구', els: () => [$('linePanel'), $('tools'), $('hint')] },
    send: { title: '작전 보내기', els: () => [...$('fsSendSrc').children] }
  };
  let open = false, cur = null, homeOnExit = false, moved = [], bookOn = false, skipPop = false, bookOnly = false;
  const PHONE = matchMedia('(max-width: 1180px), (max-width: 1366px) and (pointer: coarse), (hover: none) and (max-width: 1366px)'); /* 모바일 + 태블릿(가로·세로) */
  const X_ICON = $('fsClose').innerHTML, BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  function goFull() { try { const r = document.documentElement, f = r.requestFullscreen || r.webkitRequestFullscreen; if (f && !document.fullscreenElement) { const q = f.call(r, { navigationUI: 'hide' }); q && q.catch && q.catch(() => {}); } } catch (e) {} }
  const isOn = () => open;

  const SWAP = {
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5Z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5Z"/></svg><span>작전집</span>',
    board: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16Z"/><path d="M14 7l3 3"/></svg><span>작전판</span>'
  };
  function modeBtn() { const b = $('fsMode'); b.hidden = bookOn; const mv = mode === 'move'; b.classList.toggle('on', mv); b.innerHTML = mv ? '✋<span>옮기기</span>' : '✏️<span>그리기</span>'; b.title = mv ? '지금은 선수 옮기기 (누르면 그리기로)' : '지금은 선 그리기 (누르면 옮기기로)'; }
  function swapBtn() { modeBtn(); $('fsUndo').hidden = bookOn; const b = $('fsSwap'); b.innerHTML = bookOn ? SWAP.board : SWAP.book; b.setAttribute('aria-label', bookOn ? '작전판 그리기' : '작전집 보기'); b.title = bookOn ? '작전판 그리기' : '작전집 보기'; }
  function title() {
    swapBtn();
    if (bookOn) { $('fsTitle').innerHTML = `<span class="fs-sport">📒 작전집</span><span class="fs-name">${BOOK.length}개 작전</span>`; return; }
    const g = sport.family && GROUPS[sport.family];
    const chip = g ? `<label class="fs-sport fs-pick"><select id="fsSub" aria-label="종목 바꾸기">${g.members.map(m => `<option value="${m}"${m === sport.id ? ' selected' : ''}>${SPORT[m].icon} ${SPORT[m].name}</option>`).join('')}</select></label>` : `<span class="fs-sport">${sport.icon} ${esc(sport.name)}</span>`;
    $('fsTitle').innerHTML = `${chip}<span class="fs-name">${esc(play.name || '이름 없는 작전')}</span>`;
  }
  $('fsTitle').addEventListener('change', e => { if (e.target.id === 'fsSub' && SPORT[e.target.value]) { closeSheet(); setSport(e.target.value); title(); toast(`${sport.name} 복식 작전판으로 바꿨어요`); } });
  /* 작전집 화면 (전체화면 안에서) */
  function bookMode(o = {}) {
    if (!open || bookOn) return;
    bookOnly = !!o.only;
    closeSheet(); if (pb) stopPlay();
    bookOn = true; layer.classList.add('book-mode');
    stage.appendChild(park($('view-book')));
    bookFilter = bookOnly ? 'all' : (BOOK.some(it => it.sport === sport.id) ? sport.id : 'all');
    _showView('book'); title(); navState(); stage.scrollTop = 0;
    $('fsClose').innerHTML = BACK_ICON; $('fsClose').setAttribute('aria-label', '작전판으로');
    if (!bookOnly) { try { history.pushState({ fs: 2 }, ''); } catch (e) {} }
    if (stage.animate) stage.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
  }
  function boardMode(fromHistory) {
    if (!bookOn) return;
    bookOn = false; layer.classList.remove('book-mode');
    unpark($('view-book')); _showView('make'); title(); navState();
    $('fsClose').innerHTML = homeOnExit ? BACK_ICON : X_ICON; $('fsClose').setAttribute('aria-label', homeOnExit ? '종목 고르기로' : '전체화면 닫기');
    if (!fromHistory) { try { if (history.state && history.state.fs === 2) { skipPop = true; history.back(); } } catch (e) {} }
  }
  const _showHome = showHome;
  const bookCount = () => { const c = $('homeBookCnt'); if (c) { c.textContent = BOOK.length; c.hidden = !BOOK.length; } };
  showHome = function () { if (open) exit(false, true); _showHome(); bookCount(); };
  /* 첫 화면 오른쪽 위 작전집 아이콘 → 전체화면 작전집 */
  $('homeBookBtn').onclick = () => {
    goFull();
    openSport(sport.id, 'make');
    if (!open) enter({ home: true, noFull: true });
    bookMode({ only: true }); renderBook(); title();
    $('fsClose').setAttribute('aria-label', '첫 화면으로');
  };
  bookCount();
  /* 모바일은 일반 작전판 화면 없이 언제나 전체화면에서 */
  const _showView = showView;
  showView = function (v) {
    if (open && bookOn && v === 'make') { boardMode(); return; }
    if (open && !bookOn && v === 'book' && PHONE.matches) { bookMode(); return; }
    _showView(v);
    if (PHONE.matches && !open && !document.body.classList.contains('home-mode')) { enter({ home: true, noFull: true }); if (v === 'book') bookMode(); }
  };
  function closeSheet() {
    if (!cur) return;
    moved.forEach(el => cur === 'send' ? $('fsSendSrc').appendChild(el) : unpark(el)); moved = [];
    sheetBody.replaceChildren();
    sheet.hidden = true; cur = null; navState();
  }
  function openSheet(k) {
    if (cur === k) return closeSheet();
    closeSheet();
    if (pb) stopPlay();
    cur = k; $('fsSheetTitle').textContent = SHEETS[k].title;
    moved = SHEETS[k].els().filter(Boolean);
    moved.forEach(el => { if (k !== 'send') park(el); sheetBody.appendChild(el); });
    if (k === 'send') { $('fsName').value = play.name || ''; $('fsDesc').value = play.desc || ''; }
    sheet.hidden = false; sheetBody.scrollTop = 0; navState();
  }
  function navState() {
    layer.querySelectorAll('[data-fs]').forEach(b => {
      const k = b.dataset.fs, on = k === 'play' ? !!pb : k === cur;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      if (k === 'play') b.querySelector('span').textContent = pb ? '멈추기' : '작전 보기';
    });
  }

  function enter(o = {}) {
    if (open) return;
    homeOnExit = !!o.home;
    $('fsClose').innerHTML = homeOnExit ? BACK_ICON : X_ICON; $('fsClose').setAttribute('aria-label', homeOnExit ? '종목 고르기로' : '전체화면 닫기');
    open = true; document.body.classList.add('fs-mode'); layer.hidden = false;
    stage.appendChild(park(document.querySelector('#view-make .board-wrap')));
    pbar.appendChild(park($('playerBar')));
    title(); navState();
    if (!o.noFull) goFull();
    try { history.pushState({ fs: 1 }, ''); } catch (e) {}
    if (layer.animate && !(typeof RM !== 'undefined' && RM)) layer.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.3,1)' });
  }
  function exit(fromHistory, keep) {
    if (!open) return;
    bookOnly = false;
    if (bookOn) { bookOn = false; layer.classList.remove('book-mode'); unpark($('view-book')); _showView('make'); }
    const toHome = homeOnExit && !keep; homeOnExit = false;
    closeSheet();
    unpark(document.querySelector('.fs-stage .board-wrap')); unpark($('playerBar'));
    open = false; document.body.classList.remove('fs-mode'); layer.hidden = true;
    try { if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
    if (!fromHistory) { try { if (history.state && history.state.fs) history.back(); } catch (e) {} }
    if (toHome) showHome();
  }

  $('fsBtn').onclick = () => enter();
  $('fsClose').onclick = () => bookOn && !bookOnly ? boardMode() : exit(false);
  $('fsSheetClose').onclick = closeSheet;
  $('fsMode').onclick = () => { if (pb) stopPlay(); setMode(mode === 'move' ? 'draw' : 'move'); modeBtn(); toast(mode === 'move' ? '✋ 선수를 끌어서 자리를 옮겨요' : '✏️ 선수를 끌어서 선을 그려요'); };
  $('fsUndo').onclick = () => { if (pb) stopPlay(); $('undoBtn').click(); title(); };
  $('fsSwap').onclick = () => { if (bookOn) { bookOnly = false; boardMode(); } else bookMode(); };
  addEventListener('popstate', () => { if (skipPop) { skipPop = false; return; } if (!open) return; if (bookOn && !bookOnly) boardMode(true); else exit(true); });
  $('fsNav').addEventListener('click', e => {
    const b = e.target.closest('[data-fs]'); if (!b) return;
    const k = b.dataset.fs;
    bookOnly = false;
    if (bookOn) boardMode();
    if (k === 'play') { closeSheet(); $('playBtn').click(); navState(); return; }
    openSheet(k);
  });
  /* 예시를 고르면 시트를 닫고 작전판을 보여 줘요 */
  $('presetList').addEventListener('change', () => { if (open && cur === 'preset') setTimeout(() => { closeSheet(); title(); }, 60); });
  /* 보내기 시트 */
  $('fsName').addEventListener('input', e => { const v = e.target.value; ['playName', 'playName2'].forEach(id => { const el = $(id); el.value = v; }); $('playName').dispatchEvent(new Event('input', { bubbles: true })); title(); });
  $('fsDesc').addEventListener('input', e => { $('playDesc').value = e.target.value; $('playDesc').dispatchEvent(new Event('input', { bubbles: true })); });
  sheetBody.addEventListener('click', e => {
    const b = e.target.closest('[data-fsgo]'); if (!b) return;
    if (b.dataset.fsgo === 'book') { const n = BOOK.length; $('toBookBtn').click(); if (BOOK.length > n && PHONE.matches) setTimeout(bookMode, 350); }
    if (b.dataset.fsgo === 'png') $('pngBtn').click();
    if (b.dataset.fsgo === 'file') $('fileBtn').click();
    if (b.dataset.fsgo === 'bookview') { if (PHONE.matches) bookMode(); else { exit(false, true); showView('book'); window.scrollTo(0, 0); } }
  });
  /* 작전판에서 선을 누르면 편집 도구가 열려요 */
  new MutationObserver(() => { if (open && !$('linePanel').hidden && cur !== 'tools') openSheet('tools'); }).observe($('linePanel'), { attributes: true, attributeFilter: ['hidden'] });
  /* 재생 상태 · 종목 바뀜 따라가기 */
  new MutationObserver(() => { if (open) navState(); }).observe($('playBtn'), { childList: true, characterData: true, subtree: true });
  new MutationObserver(() => { if (open) title(); }).observe($('sportBadge'), { childList: true, characterData: true, subtree: true });
  new MutationObserver(() => { if (open && bookOn) title(); }).observe($('bookGrid'), { childList: true });
  window.fsRefresh = () => { if (open) modeBtn(); };
  window.fsMode = { enter, exit, isOn, goFull, bookMode, boardMode, phone: () => PHONE.matches };
})();
