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
    { id:'c17', name:'데이터 시각화',       sem:5, col:2, cols:3, type:'ele', status:'locked',    pre:['c12'],       car:['data','svc'] },
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
        '지난 학기 기록을 불러왔어요. <span class="hl">딥러닝</span>과 <span class="hl">자연어처리</span> 이수 완료!',
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
