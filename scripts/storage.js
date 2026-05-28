window.QAStore = (() => {
  const KEY = 'qaFoundationQuest.v1';
  const today = () => new Date().toISOString().slice(0, 10);
  const defaults = () => ({
    xp: 0, dailyXp: 0, dailyDate: today(), streak: 0, lastStudyDate: '', level: 1,
    theme: 'dark', focus: false, lastModule: 'fundamentos', completedModules: [],
    loStatus: {}, knownCards: {}, dueCards: {}, favoriteTerms: [], wrongQuestions: [],
    quizHistory: [], examHistory: [], badges: [], goals: { dailyXp: 15 }, answers: {}
  });
  const load = () => {
    try { return { ...defaults(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
    catch { return defaults(); }
  };
  let state = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const rolloverDaily = () => {
    const current = today();
    if (state.dailyDate !== current) { state.dailyDate = current; state.dailyXp = 0; save(); }
  };
  const addXp = (amount, reason = 'Estudo registrado') => {
    rolloverDaily();
    const last = state.lastStudyDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (last !== today()) state.streak = last === yesterday ? state.streak + 1 : 1;
    state.lastStudyDate = today(); state.xp += amount; state.dailyXp += amount; state.level = Math.floor(state.xp / 120) + 1;
    unlockBadges(); save(); window.dispatchEvent(new CustomEvent('qa:toast', { detail: `+${amount} XP — ${reason}` }));
  };
  const unlockBadges = () => {
    const rules = [
      ['primeiro-passo','Primeiro passo','Ganhou seus primeiros XP', state.xp > 0],
      ['50-xp','Aquecimento QA','Acumulou 50 XP', state.xp >= 50],
      ['7-dias','Constância 7x','Manteve 7 dias de streak', state.streak >= 7],
      ['tecnicas','Mestre das Técnicas','Concluiu Técnicas de Teste', state.completedModules.includes('tecnicas')],
      ['50-corretas','Precisão 50','Acertou 50 questões', Object.values(state.answers).filter(Boolean).length >= 50]
    ];
    rules.forEach(([id, title, desc, ok]) => { if (ok && !state.badges.find(b => b.id === id)) state.badges.push({ id, title, desc, date: today() }); });
  };
  return {
    get: () => state,
    set: patch => { state = { ...state, ...patch }; save(); },
    save,
    addXp,
    reset: () => { state = defaults(); save(); },
    export: () => JSON.stringify(state, null, 2),
    import: json => { state = { ...defaults(), ...JSON.parse(json) }; save(); },
    today
  };
})();
