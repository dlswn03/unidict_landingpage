/* ═══════════════════════════════════════════════
   DATA.JS — 데이터 레이어
   교과·진로·전공 더미 데이터 + 분기형 챗 플로우
═══════════════════════════════════════════════ */

window.AppData = (() => {

  /* ─── 교과 데이터 ─────────────────────────── */
  const courses = [
    { id:'c01', name:'파이썬 기초',        sem:1, col:0, cols:4, type:'req', status:'locked',    pre:[],            car:['ml','svc'] },
    { id:'c02', name:'대학수학 I',          sem:1, col:1, cols:4, type:'req', status:'locked',    pre:[],            car:[] },
    { id:'c03', name:'영어커뮤니케이션',    sem:1, col:2, cols:4, type:'gen', status:'locked',    pre:[],            car:[] },
    { id:'c04', name:'학문의 이해',         sem:1, col:3, cols:4, type:'gen', status:'locked',    pre:[],            car:[] },
    { id:'c05', name:'데이터구조',          sem:2, col:0, cols:4, type:'req', status:'locked',    pre:['c01'],       car:['ml','data'] },
    { id:'c06', name:'대학수학 II',         sem:2, col:1, cols:4, type:'req', status:'locked',    pre:['c02'],       car:[] },
    { id:'c07', name:'웹프로그래밍',        sem:2, col:2, cols:4, type:'ele', status:'locked',    pre:['c01'],       car:['svc'] },
    { id:'c08', name:'인문학과 AI',         sem:2, col:3, cols:4, type:'gen', status:'locked',    pre:[],            car:[] },
    { id:'c09', name:'알고리즘',            sem:3, col:0, cols:3, type:'req', status:'locked',    pre:['c05'],       car:['ml','data'] },
    { id:'c10', name:'선형대수학',          sem:3, col:1, cols:3, type:'req', status:'locked',    pre:['c02'],       car:['ml','res'] },
    { id:'c11', name:'데이터베이스',        sem:3, col:2, cols:3, type:'ele', status:'locked',    pre:['c05'],       car:['data'] },
    { id:'c12', name:'확률과 통계',         sem:4, col:0, cols:3, type:'req', status:'locked',    pre:['c06'],       car:['data','res'] },
    { id:'c13', name:'머신러닝 기초',       sem:4, col:1, cols:3, type:'req', status:'locked',    pre:['c09','c10'], car:['ml','data','res'] },
    { id:'c14', name:'객체지향 프로그래밍', sem:4, col:2, cols:3, type:'ele', status:'locked',    pre:['c07'],       car:['svc'] },
    { id:'c15', name:'딥러닝',              sem:5, col:0, cols:3, type:'req', status:'confirmed', pre:['c13'],       car:['ml','res'] },
    { id:'c16', name:'자연어처리',          sem:5, col:1, cols:3, type:'ele', status:'confirmed', pre:['c13'],       car:['ml','res','data'] },
    { id:'c17', name:'데이터 시각화',       sem:5, col:2, cols:3, type:'ele', status:'confirmed', pre:['c12'],       car:['data','svc'] },
    { id:'c18', name:'강화학습',            sem:6, col:0, cols:4, type:'ele', status:'undecided', pre:['c15'],       car:['ml','res'] },
    { id:'c19', name:'컴퓨터비전',          sem:6, col:1, cols:4, type:'ele', status:'undecided', pre:['c15'],       car:['ml','res'] },
    { id:'c20', name:'빅데이터처리',        sem:6, col:2, cols:4, type:'ele', status:'undecided', pre:['c09'],       car:['data'] },
    { id:'c21', name:'MLOps',               sem:6, col:3, cols:4, type:'ele', status:'undecided', pre:['c15'],       car:['ml'] },
    { id:'c22', name:'캡스톤디자인 I',      sem:7, col:0, cols:3, type:'req', status:'blurred',   pre:[],            car:[] },
    { id:'c23', name:'AI 서비스기획',       sem:7, col:1, cols:3, type:'ele', status:'blurred',   pre:[],            car:['svc'] },
    { id:'c24', name:'클라우드컴퓨팅',      sem:7, col:2, cols:3, type:'ele', status:'blurred',   pre:[],            car:['ml'] },
    { id:'c25', name:'캡스톤디자인 II',     sem:8, col:0, cols:2, type:'req', status:'blurred',   pre:['c22'],       car:[] },
    { id:'c26', name:'졸업 논문',           sem:8, col:1, cols:2, type:'req', status:'blurred',   pre:[],            car:[] },
  ];

  const careers = [
    { id:'ml',   name:'ML 엔지니어',  score:72, col:0, cols:4 },
    { id:'data', name:'데이터분석가', score:58, col:1, cols:4 },
    { id:'res',  name:'AI 연구원',    score:45, col:2, cols:4 },
    { id:'svc',  name:'서비스기획자', score:30, col:3, cols:4 },
  ];

  const majors = [
    { id:'cs',   name:'컴퓨터공학',     selected:false, col:0, cols:3 },
    { id:'ai',   name:'AI 융합',        selected:true,  col:1, cols:3 },
    { id:'data', name:'데이터사이언스', selected:false, col:2, cols:3 },
  ];

  const edges = [
    ['c01','c05'], ['c05','c09'], ['c09','c13'],
    ['c10','c13'], ['c13','c15'],
    ['c15','c18'], ['c15','c19'], ['c15','c21'], ['c09','c20'],
  ];

  /* ─────────────────────────────────────────────
     분기형 챗 플로우
     opts 각 항목: { text, action, next }
     - action: 선택 즉시 실행 (트리 시각화 갱신 포함)
     - next:   다음 스텝 ID
  ───────────────────────────────────────────── */
  const chatFlow = {

    s0: {
      msgs: [
        '안녕하세요! 3학년 2학기 수강신청 시즌이에요 🌱',
        '지난 학기 기록을 불러왔어요. <span class="hl">딥러닝</span> · <span class="hl">자연어처리</span> · <span class="hl">데이터 시각화</span> 이수 완료!',
        '어떻게 시작할까요?',
      ],
      opts: [
        { text: '바로 설계 시작하기', action: null, next: 's1' },
        { text: '내 진로 연결도 먼저 볼게요', action: null, next: 's0b' },
      ],
    },

    s0b: {
      msgs: [
        '현재 교과 이력 기반 진로 연결도예요 📊',
        '<span class="hl">ML 엔지니어 72%</span> · 데이터분석가 58% · AI 연구원 45% · 서비스기획 30%',
        '데이터 시각화 이수로 데이터분석가·서비스기획 연결도가 반영됐어요.',
        '트리 상단의 진로 노드를 클릭하면 연결 교과목도 확인할 수 있어요!',
      ],
      opts: [
        { text: '이제 설계 시작할게요', action: null, next: 's1' },
      ],
    },

    s1: {
      msgs: ['이번 학기 방향을 잡아볼게요. 관심 진로는 어디인가요?'],
      opts: [
        {
          text: 'ML 엔지니어 방향',
          action: () => {
            App.state.hilightCareer = 'ml';
            UniTree.render();
            App.notifyTreeUpdate();
          },
          next: 's2_ml',
        },
        {
          text: '데이터분석가 방향',
          action: () => {
            App.state.hilightCareer = 'data';
            UniTree.render();
            App.notifyTreeUpdate();
          },
          next: 's2_data',
        },
        {
          text: '아직 잘 모르겠어요',
          action: null,
          next: 's2_unsure',
        },
      ],
    },

    /* ── ML 엔지니어 경로 ──────────────────── */
    s2_ml: {
      msgs: [
        'ML 엔지니어 방향! 트리에 관련 교과를 하이라이트했어요 ✨',
        '딥러닝 이수 완료니까 <span class="hl">강화학습</span> (선택 3학점)을 강력 추천해요.',
        '최근 강화학습은 LLM 파인튜닝(RLHF)에도 핵심이 돼요.',
      ],
      opts: [
        {
          text: '강화학습 들을게요 ✓',
          action: () => {
            getCourse('c18').status = 'confirmed';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's3_ml_rl',
        },
        {
          text: '다른 과목이 더 끌려요',
          action: null,
          next: 's2_ml_alt',
        },
      ],
    },

    s2_ml_alt: {
      msgs: [
        '다른 과목으로 시작해볼까요?',
        '<span class="hl">컴퓨터비전</span>은 이미지·영상 모델 분야,',
        '<span class="hl">MLOps</span>는 실무 배포·파이프라인 역량이에요.',
      ],
      opts: [
        {
          text: '컴퓨터비전 선택 ✓',
          action: () => {
            getCourse('c19').status = 'confirmed';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c19');
            App.notifyTreeUpdate();
          },
          next: 's3_ml_cv_first',
        },
        {
          text: 'MLOps 선택 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's3_ml_ops_first',
        },
      ],
    },

    s3_ml_rl: {
      msgs: [
        '강화학습 확정! ✅ 두 번째 자리를 채울게요.',
        '<span class="hl">컴퓨터비전</span>은 모델 개발 포트폴리오에 강력하고,',
        '<span class="hl">MLOps</span>는 실무 배포 역량을 키워줘요.',
      ],
      opts: [
        {
          text: '컴퓨터비전 추가 ✓',
          action: () => {
            getCourse('c19').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c19');
            App.notifyTreeUpdate();
          },
          next: 's4_ml_rl_cv',
        },
        {
          text: 'MLOps 추가 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's4_ml_rl_ops',
        },
      ],
    },

    s3_ml_cv_first: {
      msgs: [
        '컴퓨터비전 확정! ✅',
        '조합으로 <span class="hl">강화학습</span>이나 <span class="hl">MLOps</span> 중 어떤 걸 추가할까요?',
      ],
      opts: [
        {
          text: '강화학습 추가 ✓',
          action: () => {
            getCourse('c18').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's4_ml_rl_cv',
        },
        {
          text: 'MLOps 추가 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's4_ml_cv_ops',
        },
      ],
    },

    s3_ml_ops_first: {
      msgs: [
        'MLOps 확정! ✅',
        '추가로 <span class="hl">강화학습</span>이나 <span class="hl">컴퓨터비전</span> 중 어떤 걸 추가할까요?',
      ],
      opts: [
        {
          text: '강화학습 추가 ✓',
          action: () => {
            getCourse('c18').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's4_ml_rl_ops',
        },
        {
          text: '컴퓨터비전 추가 ✓',
          action: () => {
            getCourse('c19').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c19');
            App.notifyTreeUpdate();
          },
          next: 's4_ml_cv_ops',
        },
      ],
    },

    s4_ml_rl_cv: {
      msgs: [
        '강화학습 + 컴퓨터비전 조합! 마지막 자리예요.',
        '<span class="hl">MLOps</span>를 더하면 개발부터 배포까지 풀스택 ML 역량이 완성돼요.',
      ],
      opts: [
        {
          text: 'MLOps 추가 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            getCareer('ml').score = 86;
            getCareer('res').score = 58;
            App.updateProgress(100);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's5_ml_strong',
        },
        {
          text: '세 과목으로 마무리할게요',
          action: () => {
            getCareer('ml').score = 81;
            getCareer('res').score = 54;
            App.updateProgress(100);
            UniTree.render();
            App.notifyTreeUpdate();
          },
          next: 's5_ml_done',
        },
      ],
    },

    s4_ml_rl_ops: {
      msgs: [
        '강화학습 + MLOps 조합! 마지막 자리예요.',
        '<span class="hl">컴퓨터비전</span>을 더하면 AI 전 영역을 커버하는 강력한 조합이 돼요.',
      ],
      opts: [
        {
          text: '컴퓨터비전 추가 ✓',
          action: () => {
            getCourse('c19').status = 'confirmed';
            getCareer('ml').score = 86;
            getCareer('res').score = 58;
            App.updateProgress(100);
            UniTree.render();
            UniTree.flashNode('c19');
            App.notifyTreeUpdate();
          },
          next: 's5_ml_strong',
        },
        {
          text: '세 과목으로 마무리할게요',
          action: () => {
            getCareer('ml').score = 81;
            App.updateProgress(100);
            UniTree.render();
            App.notifyTreeUpdate();
          },
          next: 's5_ml_done',
        },
      ],
    },

    s4_ml_cv_ops: {
      msgs: [
        '컴퓨터비전 + MLOps 조합! 마지막 자리예요.',
        '<span class="hl">강화학습</span>을 더하면 세 영역을 모두 커버해요.',
      ],
      opts: [
        {
          text: '강화학습 추가 ✓',
          action: () => {
            getCourse('c18').status = 'confirmed';
            getCareer('ml').score = 86;
            getCareer('res').score = 58;
            App.updateProgress(100);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's5_ml_strong',
        },
        {
          text: '두 과목으로 마무리할게요',
          action: () => {
            getCareer('ml').score = 79;
            App.updateProgress(100);
            UniTree.render();
            App.notifyTreeUpdate();
          },
          next: 's5_ml_done',
        },
      ],
    },

    s5_ml_strong: {
      msgs: [
        '🚀 완벽한 ML 엔지니어 라인업 완성!',
        `ML 엔지니어 연결도 <span class="hl">86%</span>로 도달했어요.`,
        '학기 종료 후 회고 세션에서 실제 이수 기록을 업데이트해요 😊',
      ],
      opts: [{ text: '완성! 저장 💾', action: null, next: 's_end' }],
    },

    s5_ml_done: {
      msgs: [
        '3학년 2학기 설계 완성! 🚀',
        'ML 엔지니어 연결도가 크게 향상됐어요.',
        '남은 슬롯은 다음 학기 설계 때 채워요 😊',
      ],
      opts: [{ text: '완성! 저장 💾', action: null, next: 's_end' }],
    },

    /* ── 데이터분석가 경로 ─────────────────── */
    s2_data: {
      msgs: [
        '데이터분석가 방향! 📊 트리에 관련 교과를 하이라이트했어요.',
        '<span class="hl">빅데이터처리</span>는 Spark·하둡 기반 대규모 파이프라인 핵심 과목이에요.',
        '데이터분석가 취업 공고에서 가장 많이 요구하는 스킬이에요.',
      ],
      opts: [
        {
          text: '빅데이터처리 들을게요 ✓',
          action: () => {
            getCourse('c20').status = 'confirmed';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c20');
            App.notifyTreeUpdate();
          },
          next: 's3_data_big',
        },
        {
          text: '다른 과목부터 볼게요',
          action: null,
          next: 's2_data_alt',
        },
      ],
    },

    s2_data_alt: {
      msgs: [
        '데이터분석가 방향에서 다른 조합도 있어요.',
        '<span class="hl">MLOps</span>로 모델 배포까지 커버하거나,',
        '<span class="hl">강화학습</span>으로 AI 스킬을 넓힐 수 있어요.',
      ],
      opts: [
        {
          text: 'MLOps 선택 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's3_data_from_ops',
        },
        {
          text: '강화학습 선택 ✓',
          action: () => {
            getCourse('c18').status = 'confirmed';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's3_data_from_rl',
        },
      ],
    },

    s3_data_big: {
      msgs: [
        '빅데이터처리 확정! ✅ 두 번째 자리예요.',
        '<span class="hl">MLOps</span>를 추가하면 파이프라인 구축+운영까지 강해지고,',
        '<span class="hl">강화학습</span>은 AI 모델 스킬을 넓혀줘요.',
      ],
      opts: [
        {
          text: 'MLOps 추가 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's4_data_final',
        },
        {
          text: '강화학습 추가 ✓',
          action: () => {
            getCourse('c18').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's4_data_final',
        },
      ],
    },

    s3_data_from_ops: {
      msgs: [
        'MLOps 확정! ✅ 다음 자리로 <span class="hl">빅데이터처리</span>를 추천해요.',
        '데이터 파이프라인부터 배포까지 강력한 조합이 돼요.',
      ],
      opts: [
        {
          text: '빅데이터처리 추가 ✓',
          action: () => {
            getCourse('c20').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c20');
            App.notifyTreeUpdate();
          },
          next: 's4_data_final',
        },
        {
          text: '두 과목으로 진행할게요',
          action: () => {
            App.updateProgress(50);
          },
          next: 's4_data_final',
        },
      ],
    },

    s3_data_from_rl: {
      msgs: [
        '강화학습 확정! ✅ 데이터분석가에게도 RLHF 지식이 점점 중요해지고 있어요.',
        '다음으로 <span class="hl">빅데이터처리</span>나 <span class="hl">MLOps</span> 중 어떤 게 맞을까요?',
      ],
      opts: [
        {
          text: '빅데이터처리 추가 ✓',
          action: () => {
            getCourse('c20').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c20');
            App.notifyTreeUpdate();
          },
          next: 's4_data_final',
        },
        {
          text: 'MLOps 추가 ✓',
          action: () => {
            getCourse('c21').status = 'confirmed';
            App.updateProgress(50);
            UniTree.render();
            UniTree.flashNode('c21');
            App.notifyTreeUpdate();
          },
          next: 's4_data_final',
        },
      ],
    },

    s4_data_final: {
      msgs: [
        '마지막 자리! 이번 학기 마무리 단계예요.',
        '<span class="hl">컴퓨터비전</span>을 더하면 ML 역량도 함께 높아져요.',
        '또는 여기서 마무리하고 나머지는 다음 학기에 채워도 돼요.',
      ],
      opts: [
        {
          text: '컴퓨터비전 추가 ✓',
          action: () => {
            getCourse('c19').status = 'confirmed';
            getCareer('data').score = 76;
            getCareer('ml').score = 78;
            App.updateProgress(100);
            UniTree.render();
            UniTree.flashNode('c19');
            App.notifyTreeUpdate();
          },
          next: 's5_data_finish',
        },
        {
          text: '지금까지로 마무리할게요',
          action: () => {
            getCareer('data').score = 71;
            App.updateProgress(100);
            UniTree.render();
            App.notifyTreeUpdate();
          },
          next: 's5_data_finish',
        },
      ],
    },

    s5_data_finish: {
      msgs: [
        '데이터분석가 방향 설계 완성! 📊',
        '데이터분석가 연결도가 크게 향상됐어요.',
        '학기 종료 후 회고 세션에서 다시 만나요 😊',
      ],
      opts: [{ text: '완성! 저장 💾', action: null, next: 's_end' }],
    },

    /* ── 방향 미정 경로 ────────────────────── */
    s2_unsure: {
      msgs: [
        '아직 방향이 안 잡혔군요! 괜찮아요 😊',
        '어떤 방식으로 탐색할까요?',
      ],
      opts: [
        { text: '진로별 과목 비교해볼게요', action: null, next: 's2_compare' },
        { text: '관심 있는 과목부터 고를게요', action: null, next: 's2_course_first' },
      ],
    },

    s2_compare: {
      msgs: [
        '진로별 이번 학기 핵심 과목 비교예요 🔍',
        '<span class="hl">ML 엔지니어:</span> 강화학습 · 컴퓨터비전 · MLOps',
        '<span class="hl">데이터분석가:</span> 빅데이터처리 · MLOps',
        '<span class="hl">AI 연구원:</span> 강화학습 · 컴퓨터비전',
        '트리 상단 진로 노드를 클릭하면 연결 교과가 하이라이트돼요!',
      ],
      opts: [
        {
          text: 'ML 엔지니어로 가볼게요',
          action: () => { App.state.hilightCareer = 'ml'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 's2_ml',
        },
        {
          text: '데이터분석가로 가볼게요',
          action: () => { App.state.hilightCareer = 'data'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 's2_data',
        },
      ],
    },

    s2_course_first: {
      msgs: ['이번 학기 개설 과목 중 가장 끌리는 게 뭔가요?'],
      opts: [
        {
          text: '강화학습이 궁금해요',
          action: () => {
            getCourse('c18').status = 'confirmed';
            App.state.hilightCareer = 'ml';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c18');
            App.notifyTreeUpdate();
          },
          next: 's3_ml_rl',
        },
        {
          text: '컴퓨터비전이 끌려요',
          action: () => {
            getCourse('c19').status = 'confirmed';
            App.state.hilightCareer = 'ml';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c19');
            App.notifyTreeUpdate();
          },
          next: 's3_ml_cv_first',
        },
        {
          text: '빅데이터처리 해볼게요',
          action: () => {
            getCourse('c20').status = 'confirmed';
            App.state.hilightCareer = 'data';
            App.updateProgress(25);
            UniTree.render();
            UniTree.flashNode('c20');
            App.notifyTreeUpdate();
          },
          next: 's3_data_big',
        },
      ],
    },

    /* ── 최종 완료 ───────────────────────────── */
    s_end: {
      msgs: [
        '저장 완료! 🌲 설계가 기록됐어요.',
        '트리의 <span class="hl">진로 노드</span>를 클릭하면 연결 교과를 언제든 확인할 수 있어요.',
        '다음 체크인 때 다시 만나요!',
      ],
      opts: [],
    },
  };

  /* ─── 헬퍼 ───────────────────────────────── */
  const getCourse = (id) => courses.find(c => c.id === id);
  const getCareer = (id) => careers.find(c => c.id === id);

  return { courses, careers, majors, edges, chatFlow, getCourse, getCareer };

})();

// 전역 단축 함수 (chatFlow action 클로저에서 사용)
function getCourse(id) { return AppData.getCourse(id); }
function getCareer(id) { return AppData.getCareer(id); }

/* ═══════════════════════════════════════════════
   탐구 모드 데이터
   3학년 2학기 페르소나 — 복수전공·전과 고려
═══════════════════════════════════════════════ */
window.AppData.exploreData = (() => {

  const majors = {

    cs: {
      id: 'cs', name: '컴퓨터공학',
      tag: 'CS · 시스템 · 소프트웨어',
      color: '#3B82F6', colorBg: '#EFF6FF',
      overlapCredits: 12, extraCredits: 21,
      desc: '운영체제·네트워크·보안 등 CS 기초를 탄탄히 쌓는 전공',
      careers: [
        { id:'be',  name:'백엔드 개발자',  score: 58 },
        { id:'se',  name:'SW 엔지니어',    score: 65 },
        { id:'sec', name:'보안 전문가',     score: 40 },
        { id:'dev', name:'DevOps 엔지니어', score: 50 },
      ],
      courses: [
        { id:'ce01', name:'데이터구조',      row:0, col:0, cols:3, type:'overlap', car:['be','se','dev'] },
        { id:'ce02', name:'알고리즘',        row:0, col:1, cols:3, type:'overlap', car:['se','be'] },
        { id:'ce03', name:'데이터베이스',    row:0, col:2, cols:3, type:'overlap', car:['be','se'] },
        { id:'ce04', name:'운영체제',        row:1, col:0, cols:3, type:'req',     car:['se','sec','dev'] },
        { id:'ce05', name:'컴퓨터네트워크',  row:1, col:1, cols:3, type:'req',     car:['be','dev','sec'] },
        { id:'ce06', name:'컴퓨터구조',      row:1, col:2, cols:3, type:'req',     car:['se'] },
        { id:'ce07', name:'소프트웨어공학',  row:2, col:0, cols:3, type:'req',     car:['be','se'] },
        { id:'ce08', name:'정보보안',        row:2, col:1, cols:3, type:'ele',     car:['sec'] },
        { id:'ce09', name:'컴파일러',        row:2, col:2, cols:3, type:'ele',     car:['se'] },
        { id:'ce10', name:'SW 프로젝트',     row:3, col:0, cols:2, type:'req',     car:['be','se','dev'] },
        { id:'ce11', name:'클라우드시스템',  row:3, col:1, cols:2, type:'ele',     car:['dev','se'] },
      ],
    },

    ai: {
      id: 'ai', name: 'AI 융합',
      tag: '현재 주전공',
      color: '#10B981', colorBg: '#ECFDF5',
      overlapCredits: null, extraCredits: null,
      desc: '현재 AI 융합 주전공 — 머신러닝·딥러닝·NLP 심화',
      careers: [
        { id:'ml',   name:'ML 엔지니어',  score: 72 },
        { id:'data', name:'데이터분석가', score: 58 },
        { id:'res',  name:'AI 연구원',    score: 45 },
        { id:'svc',  name:'서비스기획자', score: 30 },
      ],
      courses: [
        { id:'ae01', name:'딥러닝',        row:0, col:0, cols:3, type:'overlap', car:['ml','res'] },
        { id:'ae02', name:'자연어처리',    row:0, col:1, cols:3, type:'overlap', car:['ml','res','data'] },
        { id:'ae03', name:'머신러닝기초',  row:0, col:2, cols:3, type:'overlap', car:['ml','data','res'] },
        { id:'ae04', name:'강화학습',      row:1, col:0, cols:3, type:'req',     car:['ml','res'] },
        { id:'ae05', name:'컴퓨터비전',    row:1, col:1, cols:3, type:'req',     car:['ml','res'] },
        { id:'ae06', name:'MLOps',         row:1, col:2, cols:3, type:'req',     car:['ml','data'] },
        { id:'ae07', name:'빅데이터처리',  row:2, col:0, cols:3, type:'req',     car:['data'] },
        { id:'ae08', name:'AI서비스기획',  row:2, col:1, cols:3, type:'ele',     car:['svc'] },
        { id:'ae09', name:'클라우드컴퓨팅',row:2, col:2, cols:3, type:'ele',     car:['ml'] },
        { id:'ae10', name:'캡스톤디자인I', row:3, col:0, cols:2, type:'req',     car:['ml','data','res','svc'] },
        { id:'ae11', name:'졸업논문',      row:3, col:1, cols:2, type:'req',     car:['res'] },
      ],
    },

    ds: {
      id: 'ds', name: '데이터사이언스',
      tag: '통계 · 분석 · 비즈니스',
      color: '#8B5CF6', colorBg: '#F5F3FF',
      overlapCredits: 15, extraCredits: 18,
      desc: 'R·SQL·통계 기반 데이터 분석 전문가 과정',
      careers: [
        { id:'da',  name:'데이터분석가', score: 72 },
        { id:'ds2', name:'데이터 과학자', score: 60 },
        { id:'bi',  name:'BI 전문가',    score: 50 },
        { id:'pm2', name:'서비스기획자', score: 38 },
      ],
      courses: [
        { id:'de01', name:'파이썬기초',   row:0, col:0, cols:4, type:'overlap', car:['da','ds2','bi','pm2'] },
        { id:'de02', name:'확률과통계',   row:0, col:1, cols:4, type:'overlap', car:['da','ds2'] },
        { id:'de03', name:'데이터시각화', row:0, col:2, cols:4, type:'overlap', car:['da','bi','pm2'] },
        { id:'de04', name:'데이터베이스', row:0, col:3, cols:4, type:'overlap', car:['da','bi'] },
        { id:'de05', name:'R 프로그래밍', row:1, col:0, cols:3, type:'req',     car:['da','ds2','bi'] },
        { id:'de06', name:'통계학 심화',  row:1, col:1, cols:3, type:'req',     car:['da','ds2'] },
        { id:'de07', name:'SQL 고급',     row:1, col:2, cols:3, type:'req',     car:['da','bi','pm2'] },
        { id:'de08', name:'데이터마이닝', row:2, col:0, cols:3, type:'req',     car:['da','ds2'] },
        { id:'de09', name:'예측모델링',   row:2, col:1, cols:3, type:'req',     car:['ds2'] },
        { id:'de10', name:'비즈니스분석', row:2, col:2, cols:3, type:'ele',     car:['bi','pm2'] },
        { id:'de11', name:'DS 캡스톤',    row:3, col:0, cols:2, type:'req',     car:['da','ds2','bi'] },
        { id:'de12', name:'데이터거버넌스',row:3, col:1, cols:2, type:'ele',    car:['bi'] },
      ],
    },
  };

  /* ─── 탐구 모드 챗 플로우 ─────────────────── */
  const chatFlow = {

    ex_start: {
      msgs: [
        '탐구 모드로 전환했어요 🔍',
        '현재 <span class="hl">AI 융합 3학년 2학기</span>이신데, 복수전공이나 전과를 고민 중이시죠?',
        '추천 전공 3개를 트리로 탐색해볼 수 있어요. 어디서 시작할까요?',
      ],
      opts: [
        {
          text: '💻 컴퓨터공학 살펴보기',
          action: () => { App.state.exploreMajor = 'cs'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_cs',
        },
        {
          text: '📊 데이터사이언스 살펴보기',
          action: () => { App.state.exploreMajor = 'ds'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_ds',
        },
        {
          text: '🌱 현재 AI 융합 전공 보기',
          action: () => { App.state.exploreMajor = 'ai'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_ai',
        },
      ],
    },

    /* ── 컴퓨터공학 ─────────────────────────── */
    ex_cs: {
      msgs: [
        '컴퓨터공학 복수전공을 살펴볼게요 💻',
        '현재 이수 과목 중 <span class="hl">12학점이 중복 인정</span>돼요 (데이터구조, 알고리즘, DB)',
        '추가로 <span class="hl">약 21학점</span>을 이수하면 복수전공 요건 충족이에요.',
        '트리에서 CS 커리큘럼을 확인해보세요!',
      ],
      opts: [
        { text: '어떤 과목을 들어야 하나요?', action: null, next: 'ex_cs_courses' },
        {
          text: '진로는 어떻게 되나요?',
          action: () => {
            const md = AppData.exploreData.majors['cs'];
            const top = [...md.careers].sort((a, b) => b.score - a.score)[0];
            App.state.exploreCareer = top.id;
            UniTree.render(); App.notifyTreeUpdate();
          },
          next: 'ex_cs_career',
        },
        {
          text: '📊 DS 전공과 비교하기',
          action: () => { App.state.exploreMajor = 'ds'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_compare',
        },
      ],
    },

    ex_cs_courses: {
      msgs: [
        '3-2학기부터 바로 수강 가능한 CS 과목이에요 📚',
        '<span class="hl">운영체제</span> — 시스템 이해의 핵심, CS 면접 1순위',
        '<span class="hl">컴퓨터네트워크</span> — 백엔드·DevOps 모든 직군 필수',
        '<span class="hl">컴퓨터구조</span> — 로우레벨 이해, 성능 최적화 역량',
        '이번 학기 1~2개 추가 수강으로 복수전공을 바로 시작할 수 있어요!',
      ],
      opts: [
        { text: 'CS 복수전공 신청하고 싶어요', action: null, next: 'ex_cs_apply' },
        {
          text: 'DS 전공도 볼게요',
          action: () => { App.state.exploreMajor = 'ds'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_ds',
        },
      ],
    },

    ex_cs_career: {
      msgs: [
        'CS 복수전공 후 진출 가능한 진로예요 🎯',
        '<span class="hl">SW 엔지니어 65%</span> — AI 융합 + CS 조합으로 풀스택 역량',
        '<span class="hl">백엔드 개발자 58%</span> — 시스템 이해도 높은 백엔드',
        '<span class="hl">DevOps 엔지니어 50%</span> — 인프라·배포 파이프라인 전문가',
        '현재 ML 엔지니어 방향에 시스템 역량이 더해져 희소성이 올라가요!',
      ],
      opts: [
        { text: '수강 과목 계획 보기', action: null, next: 'ex_cs_courses' },
        { text: '전공 비교 요약', action: null, next: 'ex_compare' },
      ],
    },

    ex_cs_apply: {
      msgs: [
        'CS 복수전공 신청 가이드예요 📋',
        '• 신청 시기: 매 학기 초 1~2주차 학생처 접수',
        '• 최소 이수 학점: 33학점 (중복 인정 12학점 포함)',
        '• 지금 3-2학기가 복수전공 신청 타이밍으로 적절해요!',
        '설계 모드에서 남은 학기 수강 계획을 같이 짜봐요.',
      ],
      opts: [
        { text: '설계 모드에서 계획 잡기', action: () => App.switchMode('design'), next: null },
        {
          text: 'DS도 비교해볼게요',
          action: () => { App.state.exploreMajor = 'ds'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_ds',
        },
      ],
    },

    /* ── 데이터사이언스 ──────────────────────── */
    ex_ds: {
      msgs: [
        '데이터사이언스 복수전공을 살펴볼게요 📊',
        '현재 이수 과목 중 <span class="hl">15학점이 중복 인정</span>돼요 (파이썬, 확률통계, 시각화, DB)',
        '추가로 <span class="hl">약 18학점</span>이면 복수전공 요건 충족이에요.',
        'AI 융합과 시너지가 가장 높은 전공이에요!',
      ],
      opts: [
        { text: '어떤 과목을 들어야 하나요?', action: null, next: 'ex_ds_courses' },
        {
          text: '진로는 어떻게 되나요?',
          action: () => {
            const md = AppData.exploreData.majors['ds'];
            const top = [...md.careers].sort((a, b) => b.score - a.score)[0];
            App.state.exploreCareer = top.id;
            UniTree.render(); App.notifyTreeUpdate();
          },
          next: 'ex_ds_career',
        },
        {
          text: '💻 CS 전공과 비교하기',
          action: () => { App.state.exploreMajor = 'cs'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_compare',
        },
      ],
    },

    ex_ds_courses: {
      msgs: [
        '데이터사이언스 추가 필수 과목이에요 📈',
        '<span class="hl">R 프로그래밍</span> — 통계 분석의 표준 언어, 비즈니스 현장 필수',
        '<span class="hl">통계학 심화</span> — 모델 해석력과 보고서 작성 역량 강화',
        '<span class="hl">SQL 고급</span> — 데이터분석가 채용 1순위 요구 기술',
        'AI 융합에서 분석 베이스가 갖춰져 있어서 학습 부담이 낮아요!',
      ],
      opts: [
        { text: 'DS 복수전공 신청하고 싶어요', action: null, next: 'ex_ds_apply' },
        {
          text: 'CS와 비교해볼게요',
          action: () => { App.state.exploreMajor = 'cs'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_cs',
        },
      ],
    },

    ex_ds_career: {
      msgs: [
        'DS 복수전공 후 진출 진로예요 🎯',
        '<span class="hl">데이터분석가 72%</span> — AI 융합 + DS로 연결도 최대 달성',
        '<span class="hl">데이터 과학자 60%</span> — 통계 + ML 완전체 조합',
        '<span class="hl">BI 전문가 50%</span> — 비즈니스 인텔리전스 전문 분야',
        '현재 AI 융합만으로 58%인 데이터분석가가 72%까지 올라가요!',
      ],
      opts: [
        { text: 'DS 과목 계획 보기', action: null, next: 'ex_ds_courses' },
        { text: '전공 비교 요약', action: null, next: 'ex_compare' },
      ],
    },

    ex_ds_apply: {
      msgs: [
        'DS 복수전공 신청 가이드예요 📋',
        '• 신청 시기: 매 학기 초 학생처 접수',
        '• 최소 이수 학점: 33학점 (중복 인정 15학점 포함)',
        '• AI 융합과 과목 중복이 가장 많아 <span class="hl">이번 학기 신청을 강력 추천!</span>',
        '설계 모드에서 남은 학기 수강 계획을 같이 짜봐요.',
      ],
      opts: [
        { text: '설계 모드에서 계획 잡기', action: () => App.switchMode('design'), next: null },
        {
          text: 'CS도 비교해볼게요',
          action: () => { App.state.exploreMajor = 'cs'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_cs',
        },
      ],
    },

    /* ── AI 융합 현황 ────────────────────────── */
    ex_ai: {
      msgs: [
        'AI 융합 현재 전공 현황이에요 🌱',
        '3학년까지 이수한 AI 융합 커리큘럼과 진로 연결도예요.',
        '<span class="hl">ML 엔지니어 72%</span> · 데이터분석가 58% · AI 연구원 45%',
        '이 전공을 강화하면서 복수전공으로 다른 영역을 확장할 수 있어요!',
      ],
      opts: [
        {
          text: '💻 CS 복수전공 탐구',
          action: () => { App.state.exploreMajor = 'cs'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_cs',
        },
        {
          text: '📊 DS 복수전공 탐구',
          action: () => { App.state.exploreMajor = 'ds'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_ds',
        },
        { text: '두 전공 비교 요약', action: null, next: 'ex_compare' },
      ],
    },

    /* ── 비교 요약 ──────────────────────────── */
    ex_compare: {
      msgs: [
        '두 전공 복수전공 비교 요약이에요 ⚖️',
        '<span class="hl">컴퓨터공학:</span> 중복 12학점 · 추가 21학점 · 시스템·보안 역량',
        '<span class="hl">데이터사이언스:</span> 중복 15학점 · 추가 18학점 · 분석·비즈니스 역량',
        'DS가 중복 인정이 많아 부담이 적고, CS는 차별화 포인트가 강해요.',
        '3-2학기 신청이 가장 좋은 타이밍이에요!',
      ],
      opts: [
        {
          text: 'CS 더 자세히 보기',
          action: () => { App.state.exploreMajor = 'cs'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_cs',
        },
        {
          text: 'DS 더 자세히 보기',
          action: () => { App.state.exploreMajor = 'ds'; UniTree.render(); App.notifyTreeUpdate(); },
          next: 'ex_ds',
        },
        { text: '설계 모드로 돌아가기', action: () => App.switchMode('design'), next: null },
      ],
    },

  };

  return { majors, chatFlow };

})();

/* ═══════════════════════════════════════════════
   진로 상세 데이터 (모달용)
═══════════════════════════════════════════════ */
window.AppData.careerDetails = {
  ml: {
    name: 'ML 엔지니어',
    desc: '머신러닝 모델을 연구·개발하고, 프로덕션 환경에 배포·운영하는 직무예요. 딥러닝·강화학습·MLOps까지 AI 엔지니어링 전반을 담당해요.',
    salary: '연봉 5,500 ~ 8,000만원',
    companies: '네이버, 카카오, 쿠팡, 라인, 당근마켓',
    extra: [
      'AI 해커톤 참가 (CLOVA Challenge, Dacon)',
      'HuggingFace 오픈소스 기여',
      'TensorFlow Developer Certificate 취득',
      'Kaggle 대회 Top 10% 입상 경험',
    ],
    todo: [
      '강화학습·컴퓨터비전 심화 이수',
      'PyTorch 기반 모델 GitHub 공개',
      'MLOps 파이프라인 토이 프로젝트 진행',
      'AI 스타트업 인턴십 1회 이상 경험',
    ],
  },
  data: {
    name: '데이터분석가',
    desc: '비즈니스 데이터를 수집·가공·분석하여 인사이트를 도출하고 의사결정을 지원하는 직무예요. SQL, Python, 시각화 역량이 핵심이에요.',
    salary: '연봉 4,500 ~ 6,500만원',
    companies: '삼성SDS, LG CNS, SK텔레콤, 카카오뱅크, 토스',
    extra: [
      'Kaggle 대회 참가 (데이터 분석 트랙)',
      'ADsP / 데이터분석 준전문가 자격증 취득',
      'SQL Booster 스터디 참여',
      '대학 데이터 분석 동아리 활동',
    ],
    todo: [
      '빅데이터처리(Spark) 과목 이수',
      'SQL 고급 쿼리 실습 포트폴리오 작성',
      'Tableau / Power BI 대시보드 프로젝트',
      '데이터분석 인턴십 지원',
    ],
  },
  res: {
    name: 'AI 연구원',
    desc: '최신 AI 알고리즘을 연구하고 논문으로 발표하는 직무예요. 대학원 진학 후 기업 연구소(네이버AI랩, 카카오AI, LG AI연구원)로 진출하는 경로가 일반적이에요.',
    salary: '연봉 6,000 ~ 1억원+',
    companies: '네이버 AI Lab, 카카오 AI, LG AI연구원, 삼성리서치',
    extra: [
      'CVPR / NeurIPS / ICLR 논문 제출 경험',
      'AI 학부생 연구 인턴 (LAB 참여)',
      '대학원 진학 준비 (추천서 확보)',
      'GitHub 연구 코드 공개 및 관리',
    ],
    todo: [
      '강화학습·컴퓨터비전 심화 이수',
      '지도교수 찾기 및 랩 미팅 참여',
      '학부 졸업논문 연구 주제 확정',
      '대학원 지원 서류 준비 (영어 성적 등)',
    ],
  },
  svc: {
    name: '서비스기획자',
    desc: 'AI 제품의 기획·설계·운영을 주도하는 직무예요. 사용자 리서치, 데이터 기반 의사결정, 개발팀 협업 역량이 중요해요.',
    salary: '연봉 4,000 ~ 6,000만원',
    companies: '카카오, 네이버, 라인, 크래프톤, 쏘카',
    extra: [
      'IT 서비스 앱 케이스 스터디 블로그 운영',
      'Google UX Design Certificate 취득',
      'SQLD (SQL 개발자) 자격증 취득',
      '교내 창업 동아리 및 아이디어톤 참가',
    ],
    todo: [
      'AI 서비스기획 과목 이수',
      '기획서 포트폴리오 2개 이상 작성',
      '사용자 인터뷰 및 UX 리서치 경험',
      'PM 인턴십 지원 (스타트업 우선)',
    ],
  },
  be: {
    name: '백엔드 개발자',
    desc: '서버 사이드 애플리케이션을 개발하고 API를 설계·운영하는 직무예요. Spring, Node.js, Django 등 프레임워크와 DB 설계 역량이 핵심이에요.',
    salary: '연봉 4,500 ~ 7,000만원',
    companies: '카카오, 토스, 배달의민족, 컬리, 29CM',
    extra: [
      '사이드 프로젝트 (백엔드 API 서버 구축)',
      'AWS Solutions Architect 자격증',
      '오픈소스 기여 (GitHub 스타 확보)',
      'SQLD / 정보처리기사 자격증 취득',
    ],
    todo: [
      '운영체제·네트워크 과목 이수',
      'REST API 서버 토이 프로젝트 배포',
      'Docker + GitHub Actions CI/CD 경험',
      '코딩 테스트 (백준 Silver II 이상)',
    ],
  },
  se: {
    name: 'SW 엔지니어',
    desc: '대형 소프트웨어 시스템을 설계·개발·유지보수하는 직무예요. CS 기초(자료구조, 알고리즘, 운영체제)와 소프트웨어 공학 역량이 필요해요.',
    salary: '연봉 5,000 ~ 8,000만원',
    companies: 'SK하이닉스, 삼성전자, 현대오토에버, KT, LG U+',
    extra: [
      '알고리즘 대회 (ICPC, SCPC) 참가',
      '정보처리기사 자격증 취득',
      '소프트웨어 공학 스터디 그룹 참여',
      '교내 개발 동아리 프로젝트 리더',
    ],
    todo: [
      '운영체제·컴퓨터구조·SW공학 이수',
      '코딩 테스트 (백준 Gold IV 이상 목표)',
      '팀 프로젝트 GitHub 관리 경험',
      '대기업 SW 채용 연계 인턴십 지원',
    ],
  },
  sec: {
    name: '보안 전문가',
    desc: '시스템과 네트워크의 취약점을 분석하고 보안 위협에 대응하는 직무예요. 모의해킹, 보안 컨설팅, 디지털 포렌식 분야로 나뉘어요.',
    salary: '연봉 4,500 ~ 7,500만원',
    companies: 'SK쉴더스, 안랩, KT 보안, 삼성SDS 보안팀',
    extra: [
      'CTF(Capture The Flag) 대회 참가',
      '정보보안기사 / CISSP 자격증 준비',
      '버그바운티 프로그램 참여',
      '보안 커뮤니티 (보안프로젝트) 활동',
    ],
    todo: [
      '정보보안 과목 이수',
      'Linux 기반 보안 실습 환경 구축',
      'Wargame (HackCTF, Webhacking.kr) 경험',
      '보안 관련 자격증 1개 이상 취득',
    ],
  },
  dev: {
    name: 'DevOps 엔지니어',
    desc: '개발과 운영을 연결하는 CI/CD 파이프라인, 인프라 자동화, 클라우드 환경을 구축·관리하는 직무예요.',
    salary: '연봉 5,000 ~ 8,000만원',
    companies: '토스, 라인, 쿠팡, 무신사, 왓챠',
    extra: [
      'AWS / GCP 클라우드 자격증 취득',
      'Kubernetes 핸즈온 랩 스터디',
      '오픈소스 데브옵스 도구 기여',
      '사이드 프로젝트 인프라 설계 경험',
    ],
    todo: [
      '컴퓨터네트워크·운영체제 이수',
      'Docker + Kubernetes 실습 환경 구축',
      'Terraform 기반 IaC 토이 프로젝트',
      '클라우드 서비스 자격증 (AWS SAA) 취득',
    ],
  },
  da: {
    name: '데이터분석가',
    desc: '비즈니스 데이터를 R·Python·SQL로 분석하고 시각화하여 의사결정을 지원하는 직무예요. DS 전공은 통계 기반 분석에서 특히 강점을 발휘해요.',
    salary: '연봉 4,500 ~ 6,500만원',
    companies: '삼성SDS, LG CNS, 토스, 카카오뱅크, 올리브영',
    extra: [
      'ADsP / DAP 데이터분석 자격증 취득',
      'Kaggle 데이터 분석 대회 Top 20%',
      'Tableau Public 포트폴리오 작성',
      'R Markdown 분석 보고서 공개',
    ],
    todo: [
      'R 프로그래밍·SQL 고급·통계심화 이수',
      'A/B 테스트 설계 및 결과 분석 실습',
      'BI 대시보드 구축 인턴십 경험',
      '데이터 분석 프로젝트 GitHub 공개',
    ],
  },
  ds2: {
    name: '데이터 과학자',
    desc: '통계·머신러닝을 결합하여 비즈니스 문제를 정량적으로 해결하는 직무예요. AI 융합 + DS 복수전공으로 ML과 통계를 모두 갖춘 인재가 될 수 있어요.',
    salary: '연봉 5,500 ~ 8,500만원',
    companies: '카카오, 네이버, 쿠팡, 우아한형제들, GS리테일',
    extra: [
      'Kaggle Expert / Master 달성',
      'NeurIPS / ICML 논문 리뷰 스터디',
      'DS 포트폴리오 Notion 정리',
      '통계학 대학원 진학 고려',
    ],
    todo: [
      '예측모델링·데이터마이닝 이수',
      'Kaggle 대회 솔루션 블로그 연재',
      '인과추론(Causal Inference) 자습',
      'AI 융합 + DS 복수전공 신청',
    ],
  },
  bi: {
    name: 'BI 전문가',
    desc: '기업 데이터를 Tableau, Power BI 등으로 시각화하고 경영 대시보드를 구축하는 직무예요. 비즈니스 감각과 데이터 리터러시가 핵심이에요.',
    salary: '연봉 4,000 ~ 6,000만원',
    companies: '딜로이트, EY, KPMG, 삼성물산, 현대자동차',
    extra: [
      'Tableau Desktop Specialist 자격증',
      'Power BI 대시보드 포트폴리오 제작',
      'BI 관련 컨설팅 공모전 참가',
      '비즈니스 사례 분석 블로그 운영',
    ],
    todo: [
      '비즈니스분석·SQL 고급 이수',
      'Tableau Public 대시보드 3개 이상 공개',
      '전사 KPI 보고서 자동화 프로젝트',
      '컨설팅 인턴십 또는 BI 인턴 경험',
    ],
  },
  pm2: {
    name: '서비스기획자',
    desc: '데이터 기반으로 프로덕트를 기획하고 운영하는 직무예요. DS 전공이 있으면 데이터를 직접 분석하는 데이터 기반 PM으로 차별화할 수 있어요.',
    salary: '연봉 4,000 ~ 6,000만원',
    companies: '카카오, 배달의민족, 당근마켓, 직방, 야놀자',
    extra: [
      'Google UX Design Certificate 취득',
      '사이드 프로젝트 기획서 공모전 수상',
      'IT 서비스 케이스 스터디 블로그',
      '데이터 기반 PM 스터디 그룹 운영',
    ],
    todo: [
      '비즈니스분석·데이터거버넌스 이수',
      '기획서 포트폴리오 (Figma 활용) 2건 이상',
      'GA4 / Amplitude 데이터 분석 실습',
      'PM 인턴십 지원 (스타트업 우선)',
    ],
  },
};
