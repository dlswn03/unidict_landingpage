/* ═══════════════════════════════════════════════
   MAIN.JS — 앱 코디네이터 & 전역 상태
═══════════════════════════════════════════════ */

window.App = (() => {

  const state = {
    hilightCareer: null,
    progressPct: 0,
    mobileTab: 'chat',
    currentMode: 'design',
    exploreMajor: null,
    exploreCareer: null,
  };

  /* ─── 모드 전환 ──────────────────────────── */
  function switchMode(mode) {
    if (state.currentMode === mode) return;
    state.currentMode = mode;
    state.exploreMajor = null;
    state.exploreCareer = null;

    // 버튼 활성 상태
    const btnD = document.getElementById('btnDesign');
    const btnE = document.getElementById('btnExplore');
    if (btnD) btnD.classList.toggle('mode-btn--active', mode === 'design');
    if (btnE) btnE.classList.toggle('mode-btn--active', mode === 'explore');

    // 헤더 컨텍스트 라벨 업데이트
    const sub = document.getElementById('modeSub');
    if (sub) sub.textContent = mode === 'design' ? '3학년 2학기' : '복수전공 탐구';

    // 진도바 표시 여부
    const hdrRight = document.querySelector('.hdr__right');
    if (hdrRight) hdrRight.style.visibility = mode === 'design' ? '' : 'hidden';

    // 채팅 초기화 (진행 중인 타이머 먼저 취소)
    UniChat.cancelPending();
    const msgs = document.getElementById('msgs');
    if (msgs) msgs.innerHTML = '';
    document.getElementById('opts').innerHTML = '';

    // tpBody 재초기화 (다른 모드 SVG 레이아웃 재시작)
    const tpBody = document.getElementById('tpBody');
    if (tpBody) delete tpBody.dataset.init;

    // 범례 업데이트
    const legend = document.querySelector('.legend');
    if (legend) {
      if (mode === 'explore') {
        legend.innerHTML = `
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--overlap"></span>중복인정</div>
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--req"></span>필수</div>
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--ele"></span>선택</div>`;
      } else {
        legend.innerHTML = `
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--lk"></span>고정</div>
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--cf"></span>확정</div>
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--un"></span>미결정</div>
          <div class="lgd-item" role="listitem"><span class="lgd-dot lgd-dot--bl"></span>미래</div>`;
      }
    }

    // 트리 렌더 + 챗봇 시작
    UniTree.render();
    const startStep = mode === 'design' ? 's0' : 'ex_start';
    setTimeout(() => UniChat.showStep(startStep), 400);
  }

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

  return { state, updateProgress, switchTab, switchMode, notifyTreeUpdate, init };

})();

document.addEventListener('DOMContentLoaded', () => App.init());
