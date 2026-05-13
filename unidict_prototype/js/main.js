/* ═══════════════════════════════════════════════
   MAIN.JS — 앱 코디네이터 & 전역 상태
═══════════════════════════════════════════════ */

window.App = (() => {

  const state = {
    hilightCareer: null,
    progressPct: 0,
    mobileTab: 'chat',
  };

  /* ─── 진도 바 ────────────────────────────── */
  function updateProgress(pct) {
    state.progressPct = pct;
    ['pFill','mobPFill'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = pct + '%';
    });
    ['pPct','mobPPct'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = pct + '%';
    });
    const bar = document.querySelector('.prog-bar');
    if (bar) bar.setAttribute('aria-valuenow', pct);
  }

  /* ─── 트리 업데이트 알림 (모바일 배지) ───── */
  function notifyTreeUpdate() {
    if (window.innerWidth > 640) return;
    if (state.mobileTab === 'tree') return;
    document.getElementById('treeBadge')?.classList.add('is-visible');
  }

  /* ─── 모바일 탭 전환 ─────────────────────── */
  function switchTab(tab) {
    if (window.innerWidth > 640) return;
    state.mobileTab = tab;

    const pChat = document.getElementById('panelChat');
    const pTree = document.getElementById('panelTree');
    const tChat = document.getElementById('tabChat');
    const tTree = document.getElementById('tabTree');
    const badge = document.getElementById('treeBadge');

    if (tab === 'chat') {
      pChat.classList.remove('is-hidden');
      pTree.classList.add('is-hidden');
      tChat.classList.add('mob-tab--active');
      tTree.classList.remove('mob-tab--active');
      tChat.setAttribute('aria-selected', 'true');
      tTree.setAttribute('aria-selected', 'false');
    } else {
      pTree.classList.remove('is-hidden');
      pChat.classList.add('is-hidden');
      tTree.classList.add('mob-tab--active');
      tChat.classList.remove('mob-tab--active');
      tTree.setAttribute('aria-selected', 'true');
      tChat.setAttribute('aria-selected', 'false');
      badge?.classList.remove('is-visible');
    }
  }

  /* ─── 자유 입력 이벤트 ───────────────────── */
  function _initInput() {
    const inp = document.getElementById('freeInput');
    const btn = document.getElementById('sendBtn');
    if (!inp || !btn) return;

    const send = () => {
      const val = inp.value.trim();
      if (!val) return;
      inp.value = '';
      UniChat.handleFreeInput(val);
    };

    btn.addEventListener('click', send);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  /* ─── 리사이즈 ───────────────────────────── */
  function _onResize() {
    if (window.innerWidth > 640) {
      document.getElementById('panelChat')?.classList.remove('is-hidden');
      document.getElementById('panelTree')?.classList.remove('is-hidden');
    } else {
      switchTab(state.mobileTab);
    }
    UniTree.render();
  }

  /* ─── 초기화 ─────────────────────────────── */
  function init() {
    UniTree.render();

    // 탭 이벤트
    document.getElementById('tabChat')?.addEventListener('click', () => switchTab('chat'));
    document.getElementById('tabTree')?.addEventListener('click', () => switchTab('tree'));

    // 자유 입력 이벤트
    _initInput();

    // 리사이즈
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(_onResize, 150); });

    // 챗봇 시작
    setTimeout(() => UniChat.showStep('s0'), 700);
  }

  return { state, updateProgress, switchTab, notifyTreeUpdate, init };

})();

document.addEventListener('DOMContentLoaded', () => App.init());
