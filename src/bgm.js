/* =====================================================================
   🎵 배경음 (Full Field Pressure) — 첫 터치에 시작, 하단 「음악」으로 켜고 끄기
   ===================================================================== */
(function () {
  const KEY_BGM = 'gc-bgm-v1';
  let on = true; try { on = localStorage.getItem(KEY_BGM) !== 'off'; } catch (e) {}
  let audio = null, started = false, fadeT = null;
  function getAudio() {
    if (audio) return audio;
    const el = document.getElementById('bgmData'); if (!el) return null;
    try {
      const bin = atob(el.textContent.trim()), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      audio = new Audio(URL.createObjectURL(new Blob([u8], { type: 'audio/mpeg' })));
      audio.loop = true; audio.volume = 0; audio.preload = 'auto';
      el.textContent = '';
    } catch (e) { return null; }
    return audio;
  }
  function fadeTo(v, ms, then) {
    clearInterval(fadeT); const a = audio; if (!a) return;
    const v0 = a.volume, t0 = performance.now();
    fadeT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = Math.max(0, Math.min(1, v0 + (v - v0) * k)); if (k >= 1) { clearInterval(fadeT); then && then(); } }, 40);
  }
  function play() {
    const a = getAudio(); if (!a) return;
    const p = a.play(); started = true;
    if (p && p.then) p.then(() => document.documentElement.classList.remove('bgm-blocked')).catch(() => { started = false; a.volume = 0; document.documentElement.classList.add('bgm-blocked'); });
    fadeTo(.35, 1200);
  }
  function stop() { if (!audio) return; fadeTo(0, 400, () => audio.pause()); }
  function sync() {
    document.querySelectorAll('.bgm-btn').forEach(b => {
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      b.querySelector('.bgm-t').textContent = on ? '음악 켜짐' : '음악 꺼짐';
      b.title = on ? '배경음 끄기' : '배경음 켜기';
    });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.bgm-btn');
    if (b) { e.stopPropagation(); on = !on; try { localStorage.setItem(KEY_BGM, on ? 'on' : 'off'); } catch (er) {} on ? play() : stop(); sync(); return; }
  }, true);
  /* 브라우저는 소리를 사용자의 첫 터치 뒤에만 낼 수 있어요 */
  const first = () => { if (on && !started) play(); };
  document.addEventListener('pointerdown', first, true);
  document.addEventListener('keydown', first, true);
  document.addEventListener('visibilitychange', () => { if (!audio) return; if (document.hidden) audio.pause(); else if (on && started) { audio.play().catch(() => {}); } });
  window.bgmState = () => audio ? { paused: audio.paused, t: +audio.currentTime.toFixed(1), v: +audio.volume.toFixed(2) } : null;
  sync();
  /* 앱을 열자마자 바로 재생해요. 브라우저가 막으면 첫 터치(아무 곳) 때 바로 시작해요 */
  if (on) play();
})();
