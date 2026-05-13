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
    locked:    { fill:'#F1F5F9', stroke:'#CBD5E1', text:'#64748B', sw:1   },
    confirmed: { fill:'#ECFDF5', stroke:'#10B981', text:'#065F46', sw:1.5 },
    undecided: { fill:'#FFFFFF', stroke:'#8B5CF6', text:'#6D28D9', sw:1.5, dash:'5 3' },
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
    const flood = el('feFlood', { 'flood-color':'#10B981', 'flood-opacity':'.22', result:'c' });
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

      if (isCur || isDes) {
        svg.appendChild(el('rect', {
          x:0, y:cy - 25, width:SVG_W, height:48,
          fill: isDes ? '#F5F3FF' : '#F0FDF9',
        }));
      }

      if (isDes) {
        svg.appendChild(el('rect', {
          x:LEFT - 2, y:cy - 22, width:AVAIL + 4, height:42, rx:'5',
          fill:'none', stroke:'#C4B5FD', 'stroke-width':'1', 'stroke-dasharray':'7 4',
        }));
      }

      if (s < 8) {
        if (!collapsed || s >= 5) {
          const sep = (cy + SY[s + 1]) / 2;
          svg.appendChild(el('line', {
            x1:LEFT, y1:sep, x2:SVG_W, y2:sep,
            stroke:'#E2E8F0', 'stroke-width':'0.8',
          }));
        }
      }

      const lc = isDes ? '#7C3AED' : isCur ? '#059669' : isBlur ? '#CBD5E1' : '#94A3B8';
      const lw = (isDes || isCur) ? '600' : '400';
      svg.appendChild(el('text', {
        x:LEFT - 5, y:cy + 1,
        'text-anchor':'end', 'dominant-baseline':'middle',
        'font-size':'7.5', 'font-family':'Noto Sans KR,sans-serif',
        fill:lc, 'font-weight':lw,
      }, semLabels[s]));

      const tagCfg = isDes
        ? { bg:'#EDE9FE', text:'설계 중', tc:'#7C3AED' }
        : isCur
          ? { bg:'#D1FAE5', text:'현재', tc:'#059669' }
          : null;

      if (tagCfg) {
        const g = el('g');
        g.appendChild(el('rect', { x:2, y:cy - 7, width:38, height:14, rx:3, fill:tagCfg.bg }));
        g.appendChild(el('text', {
          x:21, y:cy + 1, 'text-anchor':'middle', 'dominant-baseline':'middle',
          'font-size':'7', 'font-family':'Noto Sans KR,sans-serif', fill:tagCfg.tc, 'font-weight':'600',
        }, tagCfg.text));
        svg.appendChild(g);
      }
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

      const stroke  = isHL ? '#10B981' : bothSolid ? '#94A3B8' : '#CBD5E1';
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
          fill:'none', stroke:'#10B981', 'stroke-width':'1.5',
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
    const hc = App.state.hilightCareer;
    const isHL = hc && c.car.includes(hc) && c.status !== 'blurred';

    const fill   = isHL ? '#DCFCE7' : s.fill;
    const stroke = isHL ? '#10B981' : s.stroke;
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

    if (c.status !== 'blurred') {
      const tc = TYPE_COLOR[c.type];
      g.appendChild(el('rect', { x:x+NW-19, y:y+3, width:16, height:9, rx:2, fill:tc, opacity:'.5' }));
      g.appendChild(el('text', {
        x:x+NW-11, y:y+8.5,
        'text-anchor':'middle', 'font-size':'5.5',
        'font-family':'Noto Sans KR,sans-serif', fill:'#fff',
      }, TYPE_LBL[c.type]));
    }

    const ICONS = { locked:'■', confirmed:'✓', undecided:'◇', blurred:'' };
    const ICON_COLORS = { locked:'#94A3B8', confirmed:'#10B981', undecided:'#8B5CF6', blurred:'#CBD5E1' };

    if (c.status !== 'blurred') {
      g.appendChild(el('text', {
        x:x+7, y:cy,
        'text-anchor':'start', 'dominant-baseline':'middle',
        'font-size':'8', fill:ICON_COLORS[c.status],
        'font-family':'Noto Sans KR,sans-serif',
      }, ICONS[c.status]));
    }

    const isBlur = c.status === 'blurred';
    let name = c.name;
    const maxC = isBlur ? 10 : 8;
    if (name.length > maxC) name = name.slice(0, maxC - 1) + '..';

    g.appendChild(el('text', {
      x: isBlur ? x + NW / 2 : x + 17,
      y: cy,
      'text-anchor': isBlur ? 'middle' : 'start',
      'dominant-baseline': 'middle',
      'font-size': '9.5', 
      'font-family': 'Noto Sans KR,sans-serif',
      fill: isHL ? '#065F46' : s.text,
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
    const x   = colX(m.col, m.cols, MW);
    const y   = cy - MH / 2;
    const g   = el('g');

    g.appendChild(el('rect', {
      x, y, width:MW, height:MH, rx:MR,
      fill:   m.selected ? '#FFFBEB' : '#F8FAFC',
      stroke: m.selected ? '#F59E0B' : '#E2E8F0',
      'stroke-width': m.selected ? 1.5 : 1,
      opacity: m.selected ? 1 : 0.7,
    }));

    const textStr = m.selected ? '🔒 ' + m.name : m.name;
    const textColor = m.selected ? '#92400E' : '#94A3B8';
    const textWeight = m.selected ? '600' : '400';

    g.appendChild(el('text', {
      x: x + MW / 2, y: cy + 1, 
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-size': m.selected ? '10' : '9.5', 
      'font-family': 'Noto Sans KR,sans-serif',
      fill: textColor, 'font-weight': textWeight,
    }, textStr));

    svg.appendChild(g);
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