const { modules, glossary } = window.QAQUEST_DATA;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const app = $('#app');
const state = () => QAStore.get();
const allQuestions = () => modules.flatMap(m => m.questions);
const byId = id => modules.find(m => m.id === id) || modules[0];

const routes = [
  ['dashboard','Dashboard','🏠'], ['modules','Módulos','📚'], ['simulados','Simulados','⏱️'], ['errors','Revisão de erros','🧩'], ['glossary','Glossário','🔤'], ['about','Sobre a CTFL','🎓'], ['roadmap','Roadmap','🗺️']
];

function init() {
  document.documentElement.dataset.theme = state().theme;
  document.body.classList.toggle('focus', state().focus);
  renderNav(); bindChrome(); route(); updateGoal();
  window.addEventListener('hashchange', route);
  window.addEventListener('qa:toast', e => toast(e.detail));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

function renderNav() {
  $('#mainNav').innerHTML = routes.map(([id,label,icon]) => `<a href="#${id}" data-route="${id}"><span>${icon}</span>${label}</a>`).join('') + '<hr>' + modules.map(m => `<a href="#module/${m.id}" data-route="module/${m.id}"><span>${m.icon}</span>${m.title}</a>`).join('');
}
function bindChrome() {
  $('#themeToggle').onclick = () => { const theme = state().theme === 'dark' ? 'light' : 'dark'; QAStore.set({ theme }); document.documentElement.dataset.theme = theme; $('#themeToggle').textContent = theme === 'dark' ? '🌙' : '☀️'; };
  $('#focusMode').onclick = () => { const focus = !state().focus; QAStore.set({ focus }); document.body.classList.toggle('focus', focus); toast(focus ? 'Modo foco ativado' : 'Modo foco desativado'); };
  $('#menuToggle').onclick = () => document.body.classList.toggle('nav-open');
  $('#globalSearch').addEventListener('input', searchGlobal);
  document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#globalSearch').focus(); } if (e.key === 'Escape') $('#searchResults').classList.remove('open'); });
}
function route() {
  document.body.classList.remove('nav-open');
  const hash = location.hash.replace('#','') || 'dashboard';
  $$('#mainNav a').forEach(a => a.classList.toggle('active', hash === a.dataset.route));
  if (hash.startsWith('module/')) return renderModule(hash.split('/')[1]);
  const map = { dashboard: renderDashboard, modules: renderModules, simulados: renderSimulados, errors: renderErrors, glossary: renderGlossary, about: renderAbout, roadmap: renderRoadmap };
  (map[hash] || renderDashboard)(); app.focus(); updateGoal();
}
function shell(title, subtitle, content) { app.innerHTML = `<section class="hero"><p class="eyebrow">QA Foundation Quest</p><h1>${title}</h1><p>${subtitle}</p></section>${content}`; }
function pct(n,d) { return d ? Math.round((n/d)*100) : 0; }
function moduleProgress(m) { const s = state(); const los = m.los.length; const mastered = m.los.filter(([id]) => s.loStatus[id] === 'dominado').length; return pct(mastered, los); }
function totalProgress() { return pct(modules.reduce((a,m)=>a+moduleProgress(m),0), modules.length*100); }
function updateGoal() { const s = state(); const p = Math.min(100, pct(s.dailyXp, s.goals.dailyXp)); $('#dailyGoalText').textContent = `${s.dailyXp}/${s.goals.dailyXp} XP`; $('#dailyGoalBar').style.width = `${p}%`; }

function renderDashboard() {
  const s = state(), progress = totalProgress(), last = byId(s.lastModule);
  shell('Dashboard de estudos CTFL', 'Acompanhe sua evolução, revise erros e mantenha consistência com XP, badges e simulados.', `
    <section class="stats-grid">
      ${stat('Progresso geral', `${progress}%`, '🎯')} ${stat('XP total', s.xp, '⚡')} ${stat('Nível', s.level, '🏅')} ${stat('Streak', `${s.streak} dias`, '🔥')}
    </section>
    <section class="panel accent"><div><h2>Continuar estudando</h2><p>Último módulo: <strong>${last.title}</strong>. Foque nos LOs ainda não dominados e pratique questões contextualizadas.</p><div class="progress big"><span style="width:${moduleProgress(last)}%"></span></div></div><a class="btn primary" href="#module/${last.id}">Continuar estudando</a></section>
    <section class="grid two"><div class="panel"><h2>Resumo de desempenho</h2>${performanceSummary()}</div><div class="panel"><h2>Conquistas</h2>${badges()}</div></section>
    <section class="quick-actions"><a href="#simulados">⏱️ Simulado rápido</a><a href="#errors">🧩 Revisar erros (${s.wrongQuestions.length})</a><a href="#glossary">🔤 Consultar glossário</a><a href="#roadmap">🗺️ Roadmap</a></section>`);
}
function stat(label, value, icon) { return `<article class="stat"><span>${icon}</span><small>${label}</small><strong>${value}</strong></article>`; }
function performanceSummary() { const s=state(); return `<ul class="clean"><li>Questões respondidas: <strong>${Object.keys(s.answers).length}</strong></li><li>Erros em revisão: <strong>${s.wrongQuestions.length}</strong></li><li>Simulados feitos: <strong>${s.examHistory.length}</strong></li><li>Módulos concluídos: <strong>${s.completedModules.length}/6</strong></li></ul>`; }
function badges() { const b=state().badges; return b.length ? `<div class="badges">${b.map(x=>`<span title="${x.desc}">🏆 ${x.title}</span>`).join('')}</div>` : '<p class="muted">Ganhe XP respondendo quizzes e marcando cards conhecidos para desbloquear badges.</p>'; }
function renderModules() { shell('Módulos oficiais CTFL v4.0.1', 'Seis capítulos com aulas guiadas, LOs, flashcards, quizzes e exercícios práticos.', `<section class="module-grid">${modules.map(m => moduleCard(m)).join('')}</section>`); }
function moduleCard(m) { return `<article class="module-card"><div class="module-icon">${m.icon}</div><h2>${m.title}</h2><p>${m.overview}</p><div class="progress"><span style="width:${moduleProgress(m)}%"></span></div><small>${moduleProgress(m)}% dos LOs dominados</small><a class="btn" href="#module/${m.id}">Estudar módulo</a></article>`; }

function renderModule(id) {
  const m = byId(id); QAStore.set({ lastModule: m.id });
  shell(m.title, m.overview, `
    <section class="grid two"><article class="panel"><h2>Como aparece na prova</h2><p>${m.exam}</p></article><article class="panel"><h2>Na prática QA</h2><p>${m.daily}</p><p>${m.agile}</p></article></section>
    <section class="panel"><h2>Aula guiada completa</h2><div class="accordion">${m.sections.map(([t,body],i)=>`<details ${i===0?'open':''}><summary>${t}</summary><p>${body}</p><div class="note">Dica CTFL: pergunte qual conceito oficial está sendo testado e elimine alternativas absolutas como “sempre”, “nunca” e “garantir”.</div></details>`).join('')}</div></section>
    <section class="panel"><h2>Learning Objectives</h2><div class="lo-list">${m.los.map(loRow).join('')}</div></section>
    <section class="panel"><h2>Flashcards com revisão espaçada</h2><div class="cards">${m.cards.map((c,i)=>flashcard(m.id,c,i)).join('')}</div></section>
    <section class="panel"><h2>Quiz do módulo</h2><div id="quizMount">${quizIntro(m)}</div></section>
    <section class="panel"><h2>Exercícios práticos</h2><div class="exercise-list">${m.exercises.map((e,i)=>`<article><strong>Cenário ${i+1}</strong><p>${e}</p><textarea placeholder="Escreva sua análise, critérios e decisão..."></textarea><button class="btn small" onclick="QAStore.addXp(5,'exercício refletido')">Registrar reflexão</button></article>`).join('')}</div></section>`);
  bindModule(m);
}
function loRow([id,k,desc]) { const status = state().loStatus[id] || 'não iniciado'; return `<article><div><strong>${id}</strong><span class="pill">${k}</span><p>${desc}</p></div><select data-lo="${id}" aria-label="Status ${id}"><option ${status==='não iniciado'?'selected':''}>não iniciado</option><option ${status==='estudando'?'selected':''}>estudando</option><option ${status==='dominado'?'selected':''}>dominado</option></select></article>`; }
function flashcard(mid, [term,def,ex], i) { const key=`${mid}-${i}`; const known=state().knownCards[key]; return `<article class="flashcard ${known?'known':''}" data-card="${key}" tabindex="0"><div class="front"><strong>${term}</strong><span>Clique para virar</span></div><div class="back"><p>${def}</p><small>Exemplo: ${ex}</small><button class="btn small known-btn">Marcar como conhecido</button></div></article>`; }
function quizIntro(m) { return `<p>Responda questões associadas aos LOs, com explicações das corretas e incorretas.</p><div class="filters"><button class="btn primary" data-start-quiz="${m.id}">Iniciar quiz do módulo</button>${m.los.map(([id])=>`<button class="btn small" data-start-quiz="${m.id}" data-lo-filter="${id}">${id}</button>`).join('')}</div>`; }
function bindModule(m) {
  $$('[data-lo]').forEach(sel => sel.onchange = () => { const loStatus = { ...state().loStatus, [sel.dataset.lo]: sel.value }; QAStore.set({ loStatus }); if (sel.value === 'dominado') QAStore.addXp(8, `LO ${sel.dataset.lo} dominado`); if (m.los.every(([id]) => loStatus[id] === 'dominado') && !state().completedModules.includes(m.id)) QAStore.set({ completedModules: [...state().completedModules, m.id] }); });
  $$('.flashcard').forEach(card => { card.onclick = e => { if (!e.target.classList.contains('known-btn')) card.classList.toggle('flipped'); }; card.querySelector('.known-btn').onclick = e => { e.stopPropagation(); const knownCards={...state().knownCards,[card.dataset.card]:true}; QAStore.set({knownCards}); card.classList.add('known'); QAStore.addXp(3,'flashcard conhecido'); }; });
  $$('[data-start-quiz]').forEach(btn => btn.onclick = () => startQuiz(m.questions.filter(q => !btn.dataset.loFilter || q.lo === btn.dataset.loFilter), '#quizMount', `Quiz — ${m.title}`));
}

function startQuiz(questions, mountSelector, title='Quiz') {
  let idx=0, score=0, answers=[]; const mount=$(mountSelector); const qs=shuffle([...questions]);
  const renderQ = () => { const q=qs[idx]; mount.innerHTML = `<div class="quiz-head"><strong>${title}</strong><span>${idx+1}/${qs.length}</span></div><div class="progress"><span style="width:${pct(idx,qs.length)}%"></span></div><h3>${q.text}</h3><p><span class="pill">${q.lo}</span> <span class="pill ${q.difficulty}">${q.difficulty}</span></p><div class="options">${q.options.map((o,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div><div id="feedback"></div>`; $$('[data-answer]', mount).forEach(b => b.onclick = () => answerQ(q, Number(b.dataset.answer))); };
  const answerQ = (q, chosen) => { const ok = chosen === q.answer; score += ok ? 1 : 0; answers.push({ id:q.id, ok, chosen }); const s=state(); QAStore.set({ answers:{...s.answers,[`${q.id}-${Date.now()}`]:ok}, wrongQuestions: ok ? s.wrongQuestions.filter(x=>x.id!==q.id) : uniqWrong([...s.wrongQuestions, q]) }); if (ok) QAStore.addXp(5,'questão correta'); $('#feedback').innerHTML = `<article class="feedback ${ok?'ok':'bad'}"><h4>${ok?'Correto!':'Revise este ponto'}</h4><p>${q.explanation}</p><ul>${q.optionExplanations.map((e,i)=>`<li><strong>${String.fromCharCode(65+i)}:</strong> ${e}</li>`).join('')}</ul><button class="btn primary" id="nextQ">${idx === qs.length-1 ? 'Ver resultado' : 'Próxima'}</button></article>`; $$('.options button').forEach(b=>b.disabled=true); $('#nextQ').onclick = () => { idx++; idx < qs.length ? renderQ() : finish(); }; };
  const finish = () => { const result={ date:new Date().toISOString(), title, score, total:qs.length, answers }; const examLike = title.toLowerCase().includes('simulado'); QAStore.set({ quizHistory:[...state().quizHistory,result], examHistory: examLike ? [...state().examHistory,result] : state().examHistory }); mount.innerHTML = `<article class="result"><h3>Resultado: ${score}/${qs.length} (${pct(score,qs.length)}%)</h3><p>${pct(score,qs.length)>=65?'Você atingiu a referência de aprovação. Continue revisando explicações.':'Abaixo de 65%. Revise LOs e erros antes do próximo simulado.'}</p>${breakdown(qs, answers)}<button class="btn" onclick="location.hash='errors'">Revisar erros</button></article>`; };
  renderQ();
}
function breakdown(qs, answers) { const rows = groupStats(qs, answers, q => byId(q.module).title).concat(groupStats(qs, answers, q => q.lo)); return `<div class="breakdown"><h4>Relatório por módulo e LO</h4>${rows.map(r=>`<span class="pill">${r.name}: ${r.ok}/${r.total} (${pct(r.ok,r.total)}%)</span>`).join('')}</div>`; }
function groupStats(qs, answers, keyFn) { const map = {}; qs.forEach((q,i)=>{ const k=keyFn(q); map[k] ||= { name:k, ok:0, total:0 }; map[k].total++; if (answers[i]?.ok) map[k].ok++; }); return Object.values(map); }
function uniqWrong(list) { return Object.values(list.reduce((a,q)=>({...a,[q.id]:q}),{})); }
function shuffle(a) { return a.sort(() => Math.random() - 0.5); }

function renderSimulados() {
  shell('Simulados e histórico', 'Pratique com temporizador, embaralhamento, relatório por módulo/LO e revisão de erros.', `<section class="sim-grid"><button class="sim" data-exam="quick">10 questões<br><small>Simulado rápido</small></button><div class="sim module-sim"><label for="examModule">Por módulo</label><select id="examModule">${modules.map(m=>`<option value="${m.id}">${m.title}</option>`).join('')}</select><button class="btn small" data-exam="module">Iniciar</button></div><button class="sim" data-exam="full">40 questões<br><small>Simulado completo</small></button></section><section class="panel"><h2>Histórico</h2>${history()}</section><section id="examMount" class="panel"></section>`);
  $$('[data-exam]').forEach(b => b.onclick = () => runExam(b.dataset.exam));
}
function runExam(type) { const selected = $('#examModule')?.value; const source = type === 'module' ? byId(selected).questions : allQuestions(); const count = type === 'full' ? 40 : type === 'quick' ? 10 : Math.max(10, source.length); const minutes = type === 'full' ? 60 : 15; const qs = Array.from({length:count},(_,i)=>source[i%source.length]); $('#examMount').innerHTML = `<div class="timer" id="timer">Tempo restante: ${minutes}:00</div><div id="examQuiz"></div>`; startTimer(minutes * 60); startQuiz(shuffle(qs), '#examQuiz', type==='full'?'Simulado completo': type==='module' ? `Simulado — ${byId(selected).title}` : 'Simulado rápido'); }
function startTimer(seconds) { clearInterval(window.qaTimer); const el = $('#timer'); window.qaTimer = setInterval(() => { seconds--; if (!el || seconds < 0) return clearInterval(window.qaTimer); const m = String(Math.floor(seconds/60)).padStart(2,'0'), s = String(seconds%60).padStart(2,'0'); el.textContent = `Tempo restante: ${m}:${s}`; if (seconds === 0) toast('Tempo encerrado: finalize a questão atual e revise o relatório.'); }, 1000); }
function history() { const h=state().quizHistory.slice(-5).reverse(); return h.length ? `<table><thead><tr><th>Data</th><th>Tipo</th><th>Resultado</th></tr></thead><tbody>${h.map(x=>`<tr><td>${new Date(x.date).toLocaleString('pt-BR')}</td><td>${x.title}</td><td>${x.score}/${x.total} (${pct(x.score,x.total)}%)</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhuma tentativa registrada.</p>'; }

function renderErrors() { const wrong=state().wrongQuestions; shell('Questões que você errou', 'Revise por módulo, dificuldade e LO até consolidar o raciocínio.', `<section class="panel"><div class="filters"><select id="errModule"><option value="">Todos módulos</option>${modules.map(m=>`<option value="${m.id}">${m.title}</option>`).join('')}</select><select id="errDiff"><option value="">Todas dificuldades</option><option>fácil</option><option>médio</option><option>difícil</option></select><button class="btn primary" id="repeatErrors">Repetir apenas erros</button></div><div id="wrongList">${wrongList(wrong)}</div></section>`); $('#repeatErrors').onclick=()=> wrong.length ? startQuiz(wrong,'#wrongList','Revisão de erros') : toast('Nenhum erro para revisar'); ['errModule','errDiff'].forEach(id=>$('#'+id).onchange=filterErrors); }
function wrongList(list){ return list.length ? list.map(q=>`<article class="question-row"><strong>${q.text}</strong><p><span class="pill">${byId(q.module).title}</span><span class="pill">${q.lo}</span><span class="pill">${q.difficulty}</span></p><p>${q.explanation}</p></article>`).join('') : '<p class="muted">Sem erros registrados. Faça quizzes para alimentar esta lista.</p>'; }
function filterErrors(){ const m=$('#errModule').value,d=$('#errDiff').value; $('#wrongList').innerHTML=wrongList(state().wrongQuestions.filter(q=>(!m||q.module===m)&&(!d||q.difficulty===d))); }

function renderGlossary() { shell('Glossário ISTQB prático', 'Busque termos, filtre categorias, favorite conceitos e veja confusões comuns.', `<section class="panel"><div class="filters"><input id="termSearch" placeholder="Buscar termo"><select id="catFilter"><option value="">Todas categorias</option>${[...new Set(glossary.map(g=>g.category))].map(c=>`<option>${c}</option>`).join('')}</select></div><div id="glossaryList" class="glossary-list">${glossaryItems(glossary)}</div></section>`); $('#termSearch').oninput=filterGlossary; $('#catFilter').onchange=filterGlossary; bindFavs(); }
function glossaryItems(items){ return items.sort((a,b)=>a.name.localeCompare(b.name)).map(t=>`<article><button class="fav" data-term="${t.name}" aria-label="Favoritar ${t.name}">${state().favoriteTerms.includes(t.name)?'★':'☆'}</button><h2>${t.name}</h2><p><strong>Definição:</strong> ${t.definition}</p><p><strong>Explicação:</strong> ${t.simple}</p><p><strong>Exemplo:</strong> ${t.example}</p><p><strong>Confundidos:</strong> ${t.confused || '—'}</p><small>${t.category}</small></article>`).join(''); }
function filterGlossary(){ const q=$('#termSearch').value.toLowerCase(), c=$('#catFilter').value; $('#glossaryList').innerHTML=glossaryItems(glossary.filter(t=>(!q||JSON.stringify(t).toLowerCase().includes(q))&&(!c||t.category===c))); bindFavs(); }
function bindFavs(){ $$('.fav').forEach(b=>b.onclick=()=>{ const fav=new Set(state().favoriteTerms); fav.has(b.dataset.term)?fav.delete(b.dataset.term):fav.add(b.dataset.term); QAStore.set({favoriteTerms:[...fav]}); renderGlossary(); }); }

function renderAbout() { shell('Sobre a certificação CTFL', 'Entenda o exame, níveis cognitivos e como estudar para compreensão real, não decoração.', `<section class="grid two"><article class="panel"><h2>O que é e para quem serve</h2><p>A CTFL é a certificação Foundation Level para profissionais que precisam compreender fundamentos de teste de software, incluindo QA, devs, BAs, POs e gestores.</p><p>Ela fortalece vocabulário comum, raciocínio por risco e colaboração em qualidade.</p></article><article class="panel"><h2>Como funciona a prova</h2><ul><li>40 questões de múltipla escolha.</li><li>Nota mínima usual: 65% (26 acertos).</li><li>Tempo-base comum: 60 minutos, com variações por idioma/provedor.</li><li>Níveis K1 lembrar, K2 compreender e K3 aplicar.</li></ul></article></section><section class="panel"><h2>Decorar x entender</h2><p>Decorar ajuda em K1, mas K2 e K3 exigem interpretar cenários. Use exemplos próprios, explique alternativas incorretas e derive casos de teste manualmente.</p></section><section class="timeline"><article>CTFL Foundation</article><article>Agile / Specialist</article><article>Advanced</article><article>Expert e liderança</article></section>`); }
function renderRoadmap(){ shell('Roadmap de estudos', 'Uma trilha progressiva para 4 semanas de preparação consistente.', `<section class="timeline vertical"><article><strong>Semana 1</strong><p>Fundamentos + ciclo de vida + glossário essencial.</p></article><article><strong>Semana 2</strong><p>Teste estático e técnicas K3 com exercícios no papel.</p></article><article><strong>Semana 3</strong><p>Gerenciamento, ferramentas, simulados por módulo e revisão de erros.</p></article><article><strong>Semana 4</strong><p>Simulados completos, análise por LO e revisão espaçada de flashcards.</p></article></section><section class="panel"><h2>Importar/exportar progresso</h2><textarea id="progressBox" placeholder="Cole ou gere seu JSON de progresso"></textarea><button class="btn" id="exportBtn">Exportar</button><button class="btn" id="importBtn">Importar</button></section>`); $('#exportBtn').onclick=()=>$('#progressBox').value=QAStore.export(); $('#importBtn').onclick=()=>{ QAStore.import($('#progressBox').value); toast('Progresso importado'); route(); }; }

function searchGlobal(e){ const q=e.target.value.toLowerCase().trim(), box=$('#searchResults'); if(!q){box.classList.remove('open');return;} const results=[...modules.map(m=>({label:m.title,href:`#module/${m.id}`,meta:'Módulo'})),...glossary.map(t=>({label:t.name,href:'#glossary',meta:t.definition})),...modules.flatMap(m=>m.los.map(([id,k,d])=>({label:id,href:`#module/${m.id}`,meta:`${k} — ${d}`})))].filter(r=>`${r.label} ${r.meta}`.toLowerCase().includes(q)).slice(0,8); box.innerHTML=results.map(r=>`<a href="${r.href}" role="option"><strong>${r.label}</strong><small>${r.meta}</small></a>`).join('')||'<p>Nada encontrado.</p>'; box.classList.add('open'); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }
function bindFavsInitial(){ document.addEventListener('click', e => { if(e.target.matches('.fav')) bindFavs(); }); }
init(); bindFavsInitial();
