/* ═══════════════════════════════════════════════
   CHAT.JS — 챗봇 엔진
   즉시 액션 · 분기형 플로우 · 자유 텍스트 입력
═══════════════════════════════════════════════ */

window.UniChat = (() => {

  let _currentStepId = null;
  let _inputLocked = false;
  let _timers = [];  // 진행 중인 setTimeout ID 목록

  function _clearTimers() {
    _timers.forEach(clearTimeout);
    _timers = [];
  }

  /* ═══════════════════════════════════════════
     공개 API: 스텝 시작
  ═══════════════════════════════════════════ */
  function showStep(stepId) {
    const step = AppData.chatFlow[stepId]
      || (AppData.exploreData && AppData.exploreData.chatFlow[stepId]);
    if (!step) return;
    _currentStepId = stepId;

    // 이전 스텝의 지연 콜백 취소
    _clearTimers();
    _clearOpts();
    _inputLocked = true;

    const msgs = step.msgs || [];
    const delay = 680;

    msgs.forEach((msg, i) => {
      if (i > 0) _timers.push(setTimeout(_showTyping, i * delay - 180));
      _timers.push(setTimeout(() => addMsg('bot', msg), i * delay));
    });

    // 선택지 및 입력창 활성화
    const total = msgs.length * delay + 200;
    _timers.push(setTimeout(() => {
      _renderOpts(step.opts || []);
      _inputLocked = false;
      _updateInputState();
    }, total));
  }

  /* 공개 API: 모드 전환 시 진행 중인 타이머 즉시 취소 */
  function cancelPending() {
    _clearTimers();
    _inputLocked = false;
  }

  /* ═══════════════════════════════════════════
     메시지 추가
  ═══════════════════════════════════════════ */
  function addMsg(type, html) {
    const wrap = document.getElementById('msgs');
    wrap.querySelector('.typing-group')?.remove();

    const g = document.createElement('div');
    g.className = `mg mg--${type}`;
    g.innerHTML = type === 'bot'
      ? `<div class="mg__who">Unidict AI</div><div class="mg__bub">${html}</div>`
      : `<div class="mg__bub">${html}</div>`;

    wrap.appendChild(g);
    _scrollBottom(wrap);
  }

  /* ─── 타이핑 인디케이터 ──────────────────── */
  function _showTyping() {
    const wrap = document.getElementById('msgs');
    const g = document.createElement('div');
    g.className = 'mg mg--bot typing-group';
    g.innerHTML = `
      <div class="mg__who">Unidict AI</div>
      <div class="typing">
        <span class="typing__dot"></span>
        <span class="typing__dot"></span>
        <span class="typing__dot"></span>
      </div>`;
    wrap.appendChild(g);
    _scrollBottom(wrap);
  }

  /* ═══════════════════════════════════════════
     선택지 버튼
  ═══════════════════════════════════════════ */
  function _renderOpts(opts) {
    const grid = document.getElementById('opts');
    grid.innerHTML = '';
    if (!opts.length) return;

    opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'opt' + (i === 0 ? ' opt--pri' : '');
      btn.textContent = opt.text;
      btn.addEventListener('click', () => _handleOptChoice(opt));
      grid.appendChild(btn);
    });

    // 버튼 추가로 opts 영역 높이가 늘어나 마지막 메시지가 가려지지 않도록 재스크롤
    const wrap = document.getElementById('msgs');
    requestAnimationFrame(() => requestAnimationFrame(() => _scrollBottom(wrap)));
  }

  function _clearOpts() {
    document.getElementById('opts').innerHTML = '';
  }

  /* ─── 선택지 클릭 처리 ───────────────────── */
  function _handleOptChoice(opt) {
    // 버튼 전체 비활성화
    document.querySelectorAll('.opt').forEach(b => b.disabled = true);

    // 사용자 말풍선
    addMsg('usr', opt.text);

    // ★ 즉시 액션 실행 (트리 갱신이 바로 반영됨)
    if (opt.action) opt.action();

    // 모바일: 트리 변화가 있으면 잠깐 트리 탭으로 이동
    if (opt.action && window.innerWidth <= 640) {
      setTimeout(() => App.switchTab('tree'), 600);
      setTimeout(() => App.switchTab('chat'), 2200);
    }

    // 다음 스텝으로 이동
    if (opt.next) {
      setTimeout(() => showStep(opt.next), 460);
    }
  }

  /* ═══════════════════════════════════════════
     자유 텍스트 입력 처리
  ═══════════════════════════════════════════ */
  function handleFreeInput(text) {
    if (!text.trim() || _inputLocked) return;
    addMsg('usr', text);

    // 키워드 매칭 → 응답 생성
    _inputLocked = true;
    setTimeout(_showTyping, 100);
    setTimeout(() => {
      const reply = _matchKeyword(text.trim());
      addMsg('bot', reply.msg);
      if (reply.action) reply.action();
      _inputLocked = false;
      _updateInputState();
    }, 900);
  }

  /* ─── 키워드 기반 응답 매칭 ─────────────── */
  const _keywords = [
    {
      keys: ['강화학습', 'rl', 'reinforcement'],
      msg: '<span class="hl">강화학습</span>은 에이전트가 환경과 상호작용하며 최적 행동을 학습하는 분야예요. 딥러닝 선수과목을 이수했으니 수강 가능해요! ML 엔지니어·AI 연구원 진로에 직결돼요.',
    },
    {
      keys: ['컴퓨터비전', 'cv', 'vision'],
      msg: '<span class="hl">컴퓨터비전</span>은 이미지·영상 인식 모델을 다뤄요. CNN, ViT, YOLO 등 실무에서 많이 쓰이는 아키텍처를 배워요. 포트폴리오 프로젝트로도 활용하기 좋아요!',
    },
    {
      keys: ['mlops', '엠엘옵스', '파이프라인', '배포'],
      msg: '<span class="hl">MLOps</span>는 ML 모델을 실제 서비스에 배포·운영하는 역량이에요. CI/CD, Docker, Kubernetes, MLflow를 다뤄요. 취업 시장에서 수요가 빠르게 늘고 있어요.',
    },
    {
      keys: ['빅데이터', '스파크', 'spark', '하둡', 'hadoop'],
      msg: '<span class="hl">빅데이터처리</span>는 Spark·하둡 기반 대규모 데이터 파이프라인을 다뤄요. 데이터분석가 채용 공고에서 가장 많이 요구되는 기술 스택이에요.',
    },
    {
      keys: ['딥러닝', 'deep learning', 'dl'],
      msg: '이미 <span class="hl">딥러닝</span>을 이수했어요 ✅ 이 과목이 강화학습·컴퓨터비전·자연어처리 등 6학기 심화 과목들의 공통 선수과목이에요.',
    },
    {
      keys: ['진로', '취업', '직업', '커리어', '직무'],
      msg: '현재 교과 이력 기반 진로 연결도: <span class="hl">ML 엔지니어 72%</span> · 데이터분석가 58% · AI 연구원 45% · 서비스기획 30%에요. 트리 상단 진로 노드를 클릭하면 연결 교과를 볼 수 있어요!',
      action: () => {
        if (App.state.currentMode !== 'explore') return;
        const md = AppData.exploreData.majors[App.state.exploreMajor];
        if (!md) return;
        const top = [...md.careers].sort((a, b) => b.score - a.score)[0];
        if (!top) return;
        App.state.exploreCareer = top.id;
        UniTree.render();
        App.notifyTreeUpdate();
      },
    },
    {
      keys: ['학점', '이수', '몇 학점', '졸업'],
      msg: '현재까지 이수 완료 학점은 약 67학점이에요. 졸업 요건(130학점)까지 63학점 남았어요. 필수 전공 학점도 충족 중이에요!',
    },
    {
      keys: ['전공', 'ai융합', '컴퓨터공학', '데이터사이언스'],
      msg: '<span class="hl">AI 융합</span> 전공으로 확정됐어요 🔒 전공 필수 35학점 + 전공 선택 21학점 이수 목표예요. 현재 필수 21학점 이수 완료!',
    },
    {
      keys: ['다시', '처음', '리셋', '초기화', 'restart'],
      msg: '처음부터 다시 시작하려면 페이지를 새로고침해주세요!',
    },
    {
      keys: ['선수', '들을 수 있', '수강 가능'],
      msg: '6학기 설계 대상 과목 수강 조건: 강화학습·컴퓨터비전·MLOps는 딥러닝 이수 후 수강 가능 ✅, 빅데이터처리는 알고리즘 이수 후 가능 ✅에요.',
    },
    {
      keys: ['비교과', '동아리', '활동', '자격증'],
      msg: 'ML 엔지니어 방향 추천 비교과: AI 해커톤 참가, 오픈소스 기여(HuggingFace), TensorFlow 자격증. 데이터분석가 방향: Kaggle 대회, SQL 자격증, ADsP 취득을 추천해요!',
    },
  ];

  function _matchKeyword(text) {
    const lower = text.toLowerCase();
    for (const entry of _keywords) {
      if (entry.keys.some(k => lower.includes(k.toLowerCase()))) {
        return { msg: entry.msg, action: entry.action || null };
      }
    }
    // 기본 응답
    const current = AppData.chatFlow[_currentStepId];
    if (current && current.opts && current.opts.length) {
      return {
        msg: '좋은 질문이에요! 위의 선택지로 계속 진행하거나, 더 궁금한 점이 있으면 말씀해주세요 😊',
      };
    }
    return {
      msg: '더 자세한 내용은 담당 교수님 또는 학생처에 문의해보세요. 교과 추천이나 진로 방향에 대해 더 물어봐도 좋아요!',
    };
  }

  /* ─── 입력창 상태 갱신 ───────────────────── */
  function _updateInputState() {
    const inp = document.getElementById('freeInput');
    const btn = document.getElementById('sendBtn');
    if (inp) inp.disabled = _inputLocked;
    if (btn) btn.disabled = _inputLocked;
  }

  /* ─── 스크롤 ─────────────────────────────── */
  function _scrollBottom(el) {
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  /* ─── 공개 API ───────────────────────────── */
  return { showStep, addMsg, handleFreeInput, cancelPending };

})();
