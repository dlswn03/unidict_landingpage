/* ═══════════════════════════════════════════════
   TREE.JS — SVG 트리 렌더러
   전공(뿌리) · 교과(가지) · 진로(잎) 3계층 시각화
═══════════════════════════════════════════════ */

window.UniTree = (() => {

  const SVG_W = 580;
  const LEFT  = 44;
  const AVAIL = SVG_W - LEFT - 8;
  const GAP   = 8;

  const NW = 120, NH = 28, NR = 5;
  const PW = 106, PH = 22;
  const MW = 128, MH = 36, MR = 8;

  let collapsed = true;

  const STATUS_STYLE = {
    locked:    { fill:'#FFFBEB', stroke:'#F59E0B', text:'#92400E', sw:1.5 },
    confirmed: { fill:'#FFF7ED', stroke:'#FB923C', text:'#9A3412', sw:1.5 },
    undecided: { fill:'#FFF7ED', stroke:'#FB923C', text:'#9A3412', sw:1.5, dash:'5 3' },
    blurred:   { fill:'#F8FAFC', stroke:'#E2E8F0', text:'#CBD5E1', sw:0.8 },
  };

  const TYPE_COLOR = { req:'#3B82F6', ele:'#8B5CF6', gen:'#94A3B8' };
  const TYPE_LBL   = { req:'필수', ele:'선택', gen:'교양' };

  function careerTheme(score) {
    if (score >= 70) return { stroke:'#10B981', fill:'#ECFDF5', text:'#065F46' };
    if (score >= 50) return { stroke:'#3B82F6', fill:'#EFF6FF', text:'#1D4ED8' };
    if (score >= 35) return { stroke:'#8B5CF6', fill:'#F5F3FF', text:'#5B21B6' };
    return { stroke:'#94A3B8', fill:'#F8FAFC', text:'#64748B' };
  }

  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs = {}, text = '') {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    return e;
  }

  function colX(col, cols, nodeW = NW) {
    const total = cols * nodeW + (cols - 1) * GAP;
    const start = LEFT + (AVAIL - total) / 2;
    return start + col * (nodeW + GAP);
  }

  function render() {
    if (App.state.currentMode === 'explore') {
      _renderExplore();
      return;
    }

    const container = document.getElementById('tpBody');
    if (!container) return;

    if (!container.dataset.init) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.overflow = 'hidden';

      container.innerHTML = `
        <div id="tree-top-wrap" style="flex-shrink: 0; z-index: 10; background: #FFFFFF; border-bottom: 1px solid #E2E8F0;">
          <svg id="tree-top" viewBox="0 0 580 80" style="display: block; width: 100%; height: auto;"></svg>
        </div>
        <div id="tree-mid-wrap" style="flex: 1; overflow-y: auto; overflow-x: hidden; background: var(--tree-bg); scroll-behavior: smooth;">
          <svg id="tree-mid" style="display: block; width: 100%;"></svg>
        </div>
        <div id="tree-bot-wrap" style="flex-shrink: 0; z-index: 10; background: #FFFFFF; border-top: 1px solid #E2E8F0;">
          <svg id="tree-bot" viewBox="0 0 580 80" style="display: block; width: 100%; height: auto;"></svg>
        </div>
      `;
      container.dataset.init = 'true';
    }

    const svgTop = document.getElementById('tree-top');
    const svgMid = document.getElementById('tree-mid');
    const svgBot = document.getElementById('tree-bot');

    // 탐구 모드에서 설계 모드로 돌아올 때 숨겼던 wrap 복원
    const tw = document.getElementById('tree-top-wrap');
    const bw = document.getElementById('tree-bot-wrap');
    if (tw) tw.style.display = '';
    if (bw) bw.style.display = '';
    // 탐구 모드에서 적용된 inline style 초기화
    svgMid.style.cssText = 'display:block;width:100%;';

    svgTop.innerHTML = '';
    svgMid.innerHTML = '';
    svgBot.innerHTML = '';

    _addDefs(svgMid);

    const SY = {};
    const gap = 60;
    const y8 = 52; 
    
    for (let s = 8; s >= 1; s--) {
      SY[s] = y8 + (8 - s) * gap;
    }

    const lastY = collapsed ? SY[5] : SY[1];
    const toggleY = lastY + 48;
    const midHeight = toggleY + 36;
    svgMid.setAttribute('viewBox', `0 0 580 ${midHeight}`);

    _drawSectionTitle(svgTop, '진로 레이어', 16);
    AppData.careers.forEach(c => _drawCareer(svgTop, c, 48));

    _drawSectionTitle(svgBot, '전공 레이어', 16);
    AppData.majors.forEach(m => _drawMajor(svgBot, m, 52));

    _drawSectionTitle(svgMid, '교과 레이어', 18);
    _drawSemRows(svgMid, SY);
    _drawPrereqEdges(svgMid, SY);

    const hc = App.state.hilightCareer;
    if (hc) _drawCareerEdges(svgMid, hc, SY);

    AppData.courses.forEach(c => _drawCourse(svgMid, c, SY));
    
    _drawToggle(svgMid, toggleY);
  }

  function _drawSectionTitle(svg, title, y) {
    svg.appendChild(el('text', {
      x: 12, y: y,
      'text-anchor': 'start', 'font-size': '8.5',
      'font-family': 'Noto Sans KR,sans-serif', fill: '#64748B',
      'font-weight': '600', 'letter-spacing': '.3'
    }, title));
  }

  function _addDefs(svg) {
    const defs = el('defs');
    const f = el('filter', { id:'glow', x:'-30%', y:'-30%', width:'160%', height:'160%' });
    const blur  = el('feGaussianBlur', { in:'SourceAlpha', stdDeviation:'2', result:'b' });
    const flood = el('feFlood', { 'flood-color':'#FB923C', 'flood-opacity':'.22', result:'c' });
    const comp  = el('feComposite', { in:'c', in2:'b', operator:'in', result:'d' });
    const merge = el('feMerge');
    merge.append(el('feMergeNode', { in:'d' }), el('feMergeNode', { in:'SourceGraphic' }));
    f.append(blur, flood, comp, merge);
    defs.appendChild(f);
    svg.appendChild(defs);
  }

  function _drawSemRows(svg, SY) {
    const semLabels = {
      1:'1-1학기', 2:'1-2학기', 3:'2-1학기', 4:'2-2학기',
      5:'3-1학기', 6:'3-2학기', 7:'4-1학기', 8:'4-2학기',
    };

    for (let s = 1; s <= 8; s++) {
      if (collapsed && s < 5) continue; 

      const cy = SY[s];
      const isCur  = s === 5;
      const isDes  = s === 6;
      const isBlur = s >= 7;

      // 모든 행에 배경 밴드 (탐구모드와 동일한 디자인)
      const bandFill = s === 5 ? '#FFFBEB' : s === 6 ? '#FFF7ED' : '#F8FAFC';
      svg.appendChild(el('rect', {
        x:0, y:cy - 30, width:SVG_W, height:60,
        fill: bandFill,
      }));

      if (s < 8) {
        if (!collapsed || s >= 5) {
          const sep = (cy + SY[s + 1]) / 2;
          svg.appendChild(el('line', {
            x1:0, y1:sep, x2:SVG_W, y2:sep,
            stroke:'#E2E8F0', 'stroke-width':'0.8',
          }));
        }
      }

      const lc = isDes ? '#C2410C' : isCur ? '#D97706' : isBlur ? '#CBD5E1' : '#94A3B8';
      const lw = (isDes || isCur) ? '600' : '400';
      const lblText = isCur ? '현재' : isDes ? '설계 중' : semLabels[s];
      svg.appendChild(el('text', {
        x:LEFT - 5, y:cy + 1,
        'text-anchor':'end', 'dominant-baseline':'middle',
        'font-size':'7.5', 'font-family':'Noto Sans KR,sans-serif',
        fill:lc, 'font-weight':lw,
      }, lblText));
    }
  }

  function _drawToggle(svg, y) {
    const g = el('g', { style: 'cursor:pointer;' });
    
    g.appendChild(el('rect', {
      x: SVG_W/2 - 70, y: y - 11, width: 140, height: 22, rx: 11,
      fill: '#F8FAFC', stroke: '#E2E8F0', 'stroke-width': 1
    }));
    
    // 이 부분의 텍스트를 '이전 수강 과목 보기'로 변경했습니다.
    g.appendChild(el('text', {
      x: SVG_W/2, y: y + 1,
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-size': '8.5', fill: '#64748B', 'font-family': 'Noto Sans KR,sans-serif', 'font-weight': '500'
    }, collapsed ? '▼ 이전 수강 과목 보기' : '▲ 이전 수강 과목 접기'));

    g.addEventListener('click', () => {
      collapsed = !collapsed;
      render();
      if (!collapsed) {
        setTimeout(() => {
          const wrap = document.getElementById('tree-mid-wrap');
          wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' });
        }, 50);
      }
    });
    
    svg.appendChild(g);
  }

  function _drawPrereqEdges(svg, SY) {
    const hc = App.state.hilightCareer;

    AppData.edges.forEach(([fid, tid]) => {
      const fc = AppData.getCourse(fid);
      const tc = AppData.getCourse(tid);
      if (!fc || !tc) return;

      if (collapsed && (fc.sem < 5 || tc.sem < 5)) return;

      const fy = SY[fc.sem] - NH / 2;
      const ty = SY[tc.sem] + NH / 2;
      
      const fx = colX(fc.col, fc.cols) + NW / 2;
      const tx = colX(tc.col, tc.cols) + NW / 2;
      const my = (fy + ty) / 2;

      const isHL     = hc && fc.car.includes(hc) && tc.car.includes(hc);
      const bothSolid = ['locked','confirmed'].includes(fc.status) && ['locked','confirmed'].includes(tc.status);
      const isBlurry  = fc.status === 'blurred' || tc.status === 'blurred';

      const stroke  = isHL ? '#D97706' : bothSolid ? '#94A3B8' : '#CBD5E1';
      const sw      = isHL ? 2 : 1;
      const opacity = isBlurry ? 0.25 : isHL ? 0.7 : bothSolid ? 0.5 : 0.3;

      svg.appendChild(el('path', {
        d:`M${fx} ${fy} C${fx} ${my},${tx} ${my},${tx} ${ty}`,
        fill:'none', stroke, 'stroke-width':sw, opacity,
      }));
    });
  }

  function _drawCareerEdges(svg, cid, SY) {
    const car = AppData.getCareer(cid);
    if (!car) return;

    const th = careerTheme(car.score);
    const cx = colX(car.col, car.cols, PW) + PW / 2;
    const cy = -20;

    AppData.courses
      .filter(c => c.car.includes(cid) && c.status !== 'blurred')
      .forEach(c => {
        if (collapsed && c.sem < 5) return;

        const ny = SY[c.sem] - NH / 2;
        const nx = colX(c.col, c.cols) + NW / 2;
        const my = (ny + cy) / 2;

        svg.appendChild(el('path', {
          d:`M${nx} ${ny} C${nx} ${my},${cx} ${my},${cx} ${cy}`,
          fill:'none', stroke:'#D97706', 'stroke-width':'1.5',
          opacity:'.35', 'stroke-dasharray':'5 4',
        }));
      });
  }

  function _drawCourse(svg, c, SY) {
    if (collapsed && c.sem < 5) return;

    const cy = SY[c.sem];
    const x  = colX(c.col, c.cols);
    const y  = cy - NH / 2;
    const s  = STATUS_STYLE[c.status];
    const hc    = App.state.hilightCareer;
    const isHL  = hc && c.car.includes(hc) && c.status !== 'blurred';
    const CAREER_HL = { fill:'#FEF3C7', stroke:'#D97706', text:'#92400E' };

    const fill   = isHL ? CAREER_HL.fill   : s.fill;
    const stroke = isHL ? CAREER_HL.stroke : s.stroke;
    const sw     = isHL ? 2 : s.sw;

    const g = el('g', { id:`nd-${c.id}` });

    const rect = el('rect', {
      x, y, width:NW, height:NH, rx:NR,
      fill, stroke, 'stroke-width':sw,
      ...(s.dash ? { 'stroke-dasharray':s.dash } : {}),
    });

    if (c.status === 'confirmed') rect.setAttribute('filter', 'url(#glow)');

    if (c.status === 'undecided') {
      const anim = el('animate', {
        attributeName:'opacity', values:'1;.5;1',
        dur:'2.4s', repeatCount:'indefinite',
      });
      rect.appendChild(anim);
    }

    g.appendChild(rect);

    // 타입 배지: blurred(미래)는 gray, 나머지는 타입별 색
    const badgeFill = c.status === 'blurred' ? '#94A3B8' : TYPE_COLOR[c.type];
    g.appendChild(el('rect', { x:x+NW-19, y:y+3, width:16, height:9, rx:2, fill:badgeFill, opacity:'.5' }));
    g.appendChild(el('text', {
      x:x+NW-11, y:y+8.5,
      'text-anchor':'middle', 'font-size':'5.5',
      'font-family':'Noto Sans KR,sans-serif', fill:'#fff',
    }, TYPE_LBL[c.type]));

    // 아이콘: locked 또는 현재학기(sem5)→✓, ele→◇, req/gen→□ / blurred는 회색
    const iconShape = (c.status === 'locked' || c.sem === 5) ? '✓' : c.type === 'ele' ? '◇' : '□';
    const iconColor = c.status === 'blurred' ? '#CBD5E1'
      : c.type === 'req' ? '#3B82F6'
      : c.type === 'ele' ? '#8B5CF6'
      : '#94A3B8';
    g.appendChild(el('text', {
      x:x+7, y:cy,
      'text-anchor':'start', 'dominant-baseline':'middle',
      'font-size':'8', fill:iconColor,
      'font-family':'Noto Sans KR,sans-serif',
    }, iconShape));

    let name = c.name;
    if (name.length > 8) name = name.slice(0, 7) + '..';

    g.appendChild(el('text', {
      x: x + 17,
      y: cy,
      'text-anchor': 'start',
      'dominant-baseline': 'middle',
      'font-size': '9.5',
      'font-family': 'Noto Sans KR,sans-serif',
      fill: isHL ? CAREER_HL.text : s.text,
      'font-weight': c.status === 'confirmed' ? '600' : '400',
    }, name));

    svg.appendChild(g);
  }

  function _drawCareer(svg, car, cy) {
    const x   = colX(car.col, car.cols, PW);
    const y   = cy - PH / 2;
    const th  = careerTheme(car.score);
    const isHL = App.state.hilightCareer === car.id;
    const op  = isHL ? 1 : 0.62;

    const g = el('g', { class:'career-g', 'data-id':car.id });

    if (isHL) {
      g.appendChild(el('rect', {
        x:x-3, y:y-3, width:PW+6, height:PH+6, rx:(PH/2)+3,
        fill:th.fill, opacity:'.4',
      }));
    }

    g.appendChild(el('rect', {
      x, y, width:PW, height:PH, rx:PH/2,
      fill:th.fill, stroke:th.stroke,
      'stroke-width':isHL ? 1.5 : 0.7, opacity:op,
    }));

    g.appendChild(el('text', {
      x:x+PW/2, y:cy,
      'text-anchor':'middle', 'dominant-baseline':'middle',
      'font-size':isHL ? '10' : '9.5', 
      'font-family':'Noto Sans KR,sans-serif',
      fill:isHL ? th.text : '#64748B', 'font-weight':isHL ? '600' : '400',
    }, car.name));

    const bx = x + 3;
    const by = y + PH + 4;
    const bw = PW - 6;
    const filledW = Math.max(0, Math.min(bw, bw * (car.score / 100)));

    g.appendChild(el('rect', { x:bx, y:by, width:bw, height:3, rx:1.5, fill:'#E2E8F0' }));

    const fillBar = el('rect', { x:bx, y:by, width:filledW, height:3, rx:1.5, fill:th.stroke, opacity:isHL ? 1 : 0.55 });
    if (isHL) fillBar.classList && fillBar.classList.add('score-updated');
    g.appendChild(fillBar);

    g.appendChild(el('text', {
      x:x+PW/2, y:by+3+8,
      'text-anchor':'middle', 'font-size':'7.5',
      'font-family':'Noto Sans KR,sans-serif',
      fill:isHL ? th.text : '#94A3B8', 'font-weight': isHL ? '600' : '400',
    }, `${car.score}%`));

    g.addEventListener('click', () => {
      App.state.hilightCareer = App.state.hilightCareer === car.id ? null : car.id;
      render();
    });

    g.addEventListener('touchstart', () => {}, { passive:true });

    svg.appendChild(g);
  }

  function _drawMajor(svg, m, cy) {
    const EW = 164, EH = 40, ER = 8;
    const x  = colX(m.col, m.cols, EW);
    const y  = cy - EH / 2;
    const g  = el('g');

    g.appendChild(el('rect', {
      x, y, width:EW, height:EH, rx:ER,
      fill:           m.selected ? '#FFFBEB' : '#F8FAFC',
      stroke:         m.selected ? '#F59E0B' : '#E2E8F0',
      'stroke-width': m.selected ? 1.5 : 1,
      opacity: m.selected ? 1 : 0.75,
    }));

    const nameY = m.selected ? cy - 7 : cy + 1;
    g.appendChild(el('text', {
      x: x + EW/2, y: nameY,
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-size': m.selected ? '10' : '9.5',
      'font-family': 'Noto Sans KR,sans-serif',
      fill: m.selected ? '#92400E' : '#94A3B8',
      'font-weight': m.selected ? '700' : '400',
    }, m.selected ? `🔒 ${m.name}` : m.name));

    if (m.selected) {
      g.appendChild(el('text', {
        x: x + EW/2, y: cy + 9,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-size': '7.5', 'font-family': 'Noto Sans KR,sans-serif',
        fill: '#F59E0B', opacity: '0.8',
      }, '현재 주전공'));
    }

    svg.appendChild(g);
  }

  /* ═══════════════════════════════════════════
     탐구 모드 렌더러
  ═══════════════════════════════════════════ */

  const EXPLORE_STYLE = {
    overlap: { fill:'#F0FDF9', stroke:'#10B981', text:'#065F46', sw:1.5, label:'중복인정' },
    req:     { fill:'#EFF6FF', stroke:'#3B82F6', text:'#1D4ED8', sw:1.5, label:'필수' },
    ele:     { fill:'#F5F3FF', stroke:'#8B5CF6', text:'#5B21B6', sw:1,   label:'선택' },
  };

  // row 0 = 과거(하단), row 3 = 미래(상단) — 표시 순서는 렌더 시 반전
  const EXPLORE_ROWS = [
    { label:'중복인정', color:'#F59E0B', bandFill:'#FFFBEB' }, // row 0 — 과거
    { label:'3-2 추가', color:'#FB923C', bandFill:'#FFF7ED' }, // row 1
    { label:'4-1학기',  color:'#94A3B8', bandFill:'#F8FAFC' }, // row 2
    { label:'4-2학기',  color:'#94A3B8', bandFill:'#F8FAFC' }, // row 3 — 미래
  ];

  function _renderExplore() {
    const container = document.getElementById('tpBody');
    if (!container) return;

    if (!container.dataset.init) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.overflow = 'hidden';
      container.innerHTML = `
        <div id="tree-top-wrap" style="flex-shrink:0;z-index:10;background:#fff;border-bottom:1px solid #E2E8F0;">
          <svg id="tree-top" viewBox="0 0 580 80" style="display:block;width:100%;height:auto;"></svg>
        </div>
        <div id="tree-mid-wrap" style="flex:1;overflow-y:auto;overflow-x:hidden;background:var(--tree-bg);scroll-behavior:smooth;">
          <svg id="tree-mid" style="display:block;width:100%;"></svg>
        </div>
        <div id="tree-bot-wrap" style="flex-shrink:0;z-index:10;background:#fff;border-top:1px solid #E2E8F0;">
          <svg id="tree-bot" viewBox="0 0 580 90" style="display:block;width:100%;height:auto;"></svg>
        </div>
      `;
      container.dataset.init = 'true';
    }

    const svgTop = document.getElementById('tree-top');
    const svgMid = document.getElementById('tree-mid');
    const svgBot = document.getElementById('tree-bot');
    const topWrap = document.getElementById('tree-top-wrap');
    const botWrap = document.getElementById('tree-bot-wrap');
    svgTop.innerHTML = '';
    svgMid.innerHTML = '';
    svgBot.innerHTML = '';

    const majorId = App.state.exploreMajor;

    if (!majorId) {
      // 흰 상단/하단 패널 숨김 → 하늘색 배경이 패널 전체를 채움
      if (topWrap) topWrap.style.display = 'none';
      if (botWrap) botWrap.style.display = 'none';
      _drawExploreLanding(svgMid);
      return;
    }

    // 전공 선택 시 상단/하단 복원
    if (topWrap) topWrap.style.display = '';
    if (botWrap) botWrap.style.display = '';

    const md = AppData.exploreData.majors[majorId];
    if (!md) return;

    /* ── top: 진로 노드 — 설계 모드와 동일한 careerTheme + colX 스타일 ── */
    _drawSectionTitle(svgTop, '진로 레이어', 16);
    const sortedCareers = [...md.careers].sort((a, b) => b.score - a.score);
    const carCount = sortedCareers.length;
    sortedCareers.forEach((c, i) => {
      const x       = colX(i, carCount, PW);
      const cy      = 48;
      const th      = careerTheme(c.score);
      const isCarHL = App.state.exploreCareer === c.id;
      const op      = isCarHL ? 1 : 0.62;
      const g       = el('g', { style:'cursor:pointer;' });

      if (isCarHL) {
        g.appendChild(el('rect', {
          x:x-3, y:cy-PH/2-3, width:PW+6, height:PH+6, rx:PH/2+3,
          fill:th.fill, opacity:'.4',
        }));
      }
      g.appendChild(el('rect', { x, y:cy-PH/2, width:PW, height:PH, rx:PH/2,
        fill:th.fill, stroke:th.stroke, 'stroke-width': isCarHL ? 1.5 : 0.7, opacity:op }));
      g.appendChild(el('text', { x:x+PW/2, y:cy, 'text-anchor':'middle',
        'dominant-baseline':'middle', 'font-size': isCarHL ? '10' : '9.5',
        'font-family':'Noto Sans KR,sans-serif',
        fill: isCarHL ? th.text : '#64748B', 'font-weight': isCarHL ? '600' : '400' }, c.name));

      const bx = x+3, by = cy+PH/2+4, bw = PW-6;
      const filledW = Math.max(0, Math.min(bw, bw * (c.score / 100)));
      g.appendChild(el('rect', { x:bx, y:by, width:bw, height:3, rx:1.5, fill:'#E2E8F0' }));
      g.appendChild(el('rect', { x:bx, y:by, width:filledW, height:3, rx:1.5,
        fill:th.stroke, opacity: isCarHL ? 1 : 0.55 }));
      g.appendChild(el('text', { x:x+PW/2, y:by+11, 'text-anchor':'middle',
        'font-size':'7.5', 'font-family':'Noto Sans KR,sans-serif',
        fill: isCarHL ? th.text : '#94A3B8', 'font-weight': isCarHL ? '600' : '400' },
        `${c.score}%`));

      g.addEventListener('click', () => {
        App.state.exploreCareer = App.state.exploreCareer === c.id ? null : c.id;
        UniTree.render();
      });
      svgTop.appendChild(g);
    });

    /* ── mid: 교과 노드 (위=미래 / 아래=과거) ── */
    const NROWS  = EXPLORE_ROWS.length;
    const rowGap = 72;
    const rowY0  = 52;   // 첫 행 중심 Y (상단 여백 포함)
    const midH   = rowY0 + (NROWS - 0.5) * rowGap + 14;
    svgMid.setAttribute('viewBox', `0 0 580 ${midH}`);

    // 1) 밴드 배경 — vi=0이 최상단=미래(row 3), vi=3이 최하단=과거(row 0)
    for (let vi = 0; vi < NROWS; vi++) {
      const dataRow = NROWS - 1 - vi;
      const ry      = rowY0 + vi * rowGap;
      const bandTop = vi === 0 ? 0 : ry - rowGap / 2;
      const bandH   = vi === 0 ? ry + rowGap / 2 : rowGap;
      svgMid.appendChild(el('rect', {
        x:0, y:bandTop, width:SVG_W, height:bandH,
        fill: EXPLORE_ROWS[dataRow].bandFill,
      }));
      // 구분선 (첫 번째 밴드 제외)
      if (vi > 0) {
        svgMid.appendChild(el('line', {
          x1:0, y1:bandTop, x2:SVG_W, y2:bandTop,
          stroke:'#E2E8F0', 'stroke-width':'0.8',
        }));
      }
    }

    // 2) 섹션 타이틀 (밴드 위에 렌더)
    _drawSectionTitle(svgMid, '교과 레이어 · 복수전공 로드맵', 16);

    // 3) 행 라벨 (밴드 위에, 좌측 여백)
    for (let vi = 0; vi < NROWS; vi++) {
      const dataRow = NROWS - 1 - vi;
      const ry      = rowY0 + vi * rowGap;
      svgMid.appendChild(el('text', {
        x:LEFT - 4, y:ry, 'text-anchor':'end', 'dominant-baseline':'middle',
        'font-size':'7', fill:EXPLORE_ROWS[dataRow].color, 'font-weight':'600',
        'font-family':'Noto Sans KR,sans-serif',
      }, EXPLORE_ROWS[dataRow].label));
    }

    // 5) 교과-진로 연결선 (노드보다 먼저 그려야 선이 노드 아래에 위치)
    if (App.state.exploreCareer) {
      _drawExploreCareerEdges(svgMid, md, rowY0, rowGap);
    }

    // 6) 교과 노드 — c.row 값 반전: row 3=상단(미래), row 0=하단(과거)
    md.courses.forEach(c => {
      const vi = NROWS - 1 - c.row;
      _drawExploreNode(svgMid, c, rowY0 + vi * rowGap, md);
    });

    /* ── bot: 전공 레이어 — 3개 균등 탭 ── */
    _drawSectionTitle(svgBot, '전공 레이어', 16);
    _drawExploreMajorBar(svgBot, majorId);
  }

  function _drawExploreCareerEdges(svg, md, rowY0, rowGap) {
    const hc = App.state.exploreCareer;
    if (!hc) return;

    const sortedCareers = [...md.careers].sort((a, b) => b.score - a.score);
    const careerIdx = sortedCareers.findIndex(c => c.id === hc);
    if (careerIdx < 0) return;

    const careerCx = colX(careerIdx, sortedCareers.length, PW) + PW / 2;
    const targetY  = -20;
    const NROWS    = EXPLORE_ROWS.length;

    md.courses
      .filter(c => c.car && c.car.includes(hc))
      .forEach(c => {
        const vi  = NROWS - 1 - c.row;
        const cy  = rowY0 + vi * rowGap;
        const nx  = colX(c.col, c.cols) + NW / 2;
        const ny  = cy - NH / 2;
        const my  = (ny + targetY) / 2;

        svg.appendChild(el('path', {
          d: `M${nx} ${ny} C${nx} ${my},${careerCx} ${my},${careerCx} ${targetY}`,
          fill:'none', stroke:'#D97706', 'stroke-width':'1.5',
          opacity:'.4', 'stroke-dasharray':'5 4',
        }));
      });
  }

  function _drawExploreMajorBar(svg, selectedId) {
    const allMajors = Object.values(AppData.exploreData.majors);
    const EW = 164, EH = 40, gap = 8;
    const total = allMajors.length * EW + (allMajors.length - 1) * gap;
    const startX = LEFT + (AVAIL - total) / 2;
    const cy = 55;

    allMajors.forEach((m, i) => {
      const x = startX + i * (EW + gap);
      const y = cy - EH / 2;
      const isSel = m.id === selectedId;
      const g = el('g', { style: isSel ? 'cursor:default;' : 'cursor:pointer;' });

      // 카드 배경 — amber로 통일 (교과·진로 레이어와 색 충돌 없음)
      g.appendChild(el('rect', {
        x, y, width:EW, height:EH, rx:8,
        fill:           isSel ? '#FFFBEB' : '#F8FAFC',
        stroke:         isSel ? '#F59E0B' : '#E2E8F0',
        'stroke-width': isSel ? 1.5 : 1,
        opacity: isSel ? 1 : 0.75,
      }));

      // 전공명
      const nameY = isSel ? cy - 7 : cy + 1;
      g.appendChild(el('text', {
        x: x + EW/2, y: nameY,
        'text-anchor':'middle', 'dominant-baseline':'middle',
        'font-size': isSel ? '10' : '9.5',
        'font-family':'Noto Sans KR,sans-serif',
        fill: isSel ? '#92400E' : '#94A3B8',
        'font-weight': isSel ? '700' : '400',
      }, isSel ? (m.id === 'ai' ? `🔒 ${m.name}` : `◎ ${m.name}`) : m.name));

      // 선택된 카드: 학점 정보 한 줄
      if (isSel) {
        const subText = m.overlapCredits
          ? `중복 ${m.overlapCredits}학점 · 추가 ${m.extraCredits}학점`
          : '현재 주전공';
        g.appendChild(el('text', {
          x: x + EW/2, y: cy + 9,
          'text-anchor':'middle', 'dominant-baseline':'middle',
          'font-size':'7.5', 'font-family':'Noto Sans KR,sans-serif',
          fill: '#F59E0B', opacity:'0.8',
        }, subText));
      }

      if (!isSel) {
        g.addEventListener('click', () => {
          App.state.exploreMajor = m.id;
          UniTree.render();
        });
      }

      svg.appendChild(g);
    });
  }

  function _drawExploreNode(svg, c, cy, md) {
    const hc   = App.state.exploreCareer;
    const isHL = hc && c.car && c.car.includes(hc);
    const s    = EXPLORE_STYLE[c.type];
    const x    = colX(c.col, c.cols);
    const y    = cy - NH / 2;
    const g    = el('g');

    // row 기반 베이스 색상: 과거(0)→amber, 3-2추가(1)→orange dashed, 미래(2/3)→gray
    const ROW_STYLE = [
      { fill:'#FFFBEB', stroke:'#F59E0B', text:'#92400E', sw:1.5 },
      { fill:'#FFF7ED', stroke:'#FB923C', text:'#9A3412', sw:1.5, dash:'5 3' },
      { fill:'#F8FAFC', stroke:'#E2E8F0', text:'#CBD5E1', sw:0.8 },
      { fill:'#F8FAFC', stroke:'#E2E8F0', text:'#CBD5E1', sw:0.8 },
    ];
    const base = ROW_STYLE[c.row] || ROW_STYLE[3];

    // 진로 클릭 하이라이트: golden amber (진로 레이어 색과 구분)
    const CAREER_HL = { fill:'#FEF3C7', stroke:'#D97706', text:'#92400E' };

    const fill   = isHL ? CAREER_HL.fill   : base.fill;
    const stroke = isHL ? CAREER_HL.stroke : base.stroke;
    const sw     = isHL ? 2 : base.sw;
    const textC  = isHL ? CAREER_HL.text   : base.text;

    // 1) 배경 rect
    g.appendChild(el('rect', { x, y, width:NW, height:NH, rx:NR,
      fill, stroke, 'stroke-width':sw,
      ...(base.dash && !isHL ? { 'stroke-dasharray':base.dash } : {}) }));

    // 2) 타입 배지: row 2-3(미래)는 gray
    const BADGE_CFG = {
      overlap: { w:28, fill:'#10B981' },
      req:     { w:16, fill:'#3B82F6' },
      ele:     { w:16, fill:'#8B5CF6' },
    };
    const bd  = BADGE_CFG[c.type];
    const bdFill = c.row >= 2 ? '#94A3B8' : bd.fill;
    const bdX = x + NW - 2 - bd.w;
    g.appendChild(el('rect', { x:bdX, y:y+3, width:bd.w, height:9, rx:2,
      fill:bdFill, opacity:'.5' }));
    g.appendChild(el('text', { x:bdX + bd.w/2, y:y+8.5, 'text-anchor':'middle',
      'font-size':'5.5', 'font-family':'Noto Sans KR,sans-serif', fill:'#fff' },
      s.label));

    // 3) 아이콘: overlap(수강완료)→✓, req→□, ele→◇ / row 2-3는 회색
    const ICONS  = { overlap:'✓', req:'□', ele:'◇' };
    const iColorBase = { overlap:'#10B981', req:'#3B82F6', ele:'#8B5CF6' };
    const iconColor = c.row >= 2 ? '#CBD5E1' : iColorBase[c.type];
    g.appendChild(el('text', { x:x+7, y:cy, 'text-anchor':'start',
      'dominant-baseline':'middle', 'font-size':'8', fill:iconColor,
      'font-family':'Noto Sans KR,sans-serif' }, ICONS[c.type]));

    // 4) 과목명
    let name = c.name;
    if (name.length > 8) name = name.slice(0,7) + '..';
    g.appendChild(el('text', { x:x+17, y:cy, 'text-anchor':'start',
      'dominant-baseline':'middle', 'font-size':'9.5',
      fill: textC, 'font-family':'Noto Sans KR,sans-serif',
      'font-weight': (c.row === 0 || isHL) ? '600' : '400' }, name));

    svg.appendChild(g);
  }

  function _drawExploreLanding(svg) {
    svg.setAttribute('viewBox', '0 0 580 480');
    svg.style.cssText = 'display:block;width:100%;min-height:100%;';

    // 따뜻한 amber 배경
    svg.appendChild(el('rect', { x:0, y:0, width:SVG_W, height:480, fill:'#FFFBEB' }));

    svg.appendChild(el('text', { x:SVG_W/2, y:108, 'text-anchor':'middle',
      'font-size':'13', fill:'#92400E', 'font-family':'Noto Sans KR,sans-serif',
      'font-weight':'600' }, '탐구할 전공을 선택해주세요'));

    svg.appendChild(el('text', { x:SVG_W/2, y:128, 'text-anchor':'middle',
      'font-size':'10', fill:'#D97706', 'font-family':'Noto Sans KR,sans-serif' },
      '카드를 클릭하거나 채팅에서 선택할 수 있어요'));

    const majorList = Object.values(AppData.exploreData.majors);
    const cw = 162, ch = 110, cgap = 14;
    const total = majorList.length * cw + (majorList.length - 1) * cgap;
    const startX = (SVG_W - total) / 2;
    const cardTop = 150;

    // 카드별 amber 계열 색상
    const WARM = [
      { fill:'#FFFBEB', stroke:'#F59E0B', text:'#92400E', badge:'#FEF3C7' },
      { fill:'#FFF7ED', stroke:'#FB923C', text:'#9A3412', badge:'#FFEDD5' },
      { fill:'#FEF3C7', stroke:'#D97706', text:'#78350F', badge:'#FEF9C3' },
    ];

    majorList.forEach((m, i) => {
      const cx = startX + i * (cw + cgap);
      const wc = WARM[i % WARM.length];
      const g = el('g', { style:'cursor:pointer;' });

      g.appendChild(el('rect', { x:cx, y:cardTop, width:cw, height:ch, rx:12,
        fill:wc.fill, stroke:wc.stroke, 'stroke-width':1.5 }));

      g.appendChild(el('text', { x:cx+cw/2, y:cardTop+26, 'text-anchor':'middle',
        'font-size':'12', fill:wc.text, 'font-family':'Noto Sans KR,sans-serif',
        'font-weight':'700' }, m.name));

      g.appendChild(el('text', { x:cx+cw/2, y:cardTop+44, 'text-anchor':'middle',
        'font-size':'8', fill:wc.stroke, 'font-family':'Noto Sans KR,sans-serif',
        opacity:'0.85' }, m.tag));

      g.appendChild(el('line', { x1:cx+16, y1:cardTop+54, x2:cx+cw-16, y2:cardTop+54,
        stroke:wc.stroke, 'stroke-width':'0.6', opacity:'0.3' }));

      const badgeText = m.overlapCredits
        ? `중복인정 ${m.overlapCredits}학점 · 추가 ${m.extraCredits}학점`
        : '현재 주전공';
      g.appendChild(el('rect', { x:cx+12, y:cardTop+62, width:cw-24, height:18, rx:5,
        fill:wc.stroke, opacity:'.15' }));
      g.appendChild(el('text', { x:cx+cw/2, y:cardTop+71, 'text-anchor':'middle',
        'dominant-baseline':'middle', 'font-size':'8', fill:wc.text,
        'font-family':'Noto Sans KR,sans-serif', 'font-weight':'600' }, badgeText));

      g.appendChild(el('text', { x:cx+cw/2, y:cardTop+97, 'text-anchor':'middle',
        'font-size':'8', fill:wc.stroke, 'font-family':'Noto Sans KR,sans-serif',
        opacity:'0.6' }, '클릭하여 탐구 →'));

      g.addEventListener('click', () => {
        App.state.exploreMajor = m.id;
        UniTree.render();
      });
      svg.appendChild(g);
    });
  }

  function flashNode(id) {
    setTimeout(() => {
      const nd = document.getElementById(`nd-${id}`);
      if (!nd) return;
      nd.classList.add('node-flash');
      nd.addEventListener('animationend', () => nd.classList.remove('node-flash'), { once:true });
    }, 650);
  }

  return { render, flashNode };

})();