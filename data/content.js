window.QAQUEST_DATA = (() => {
  const contexts = ['e-commerce','fintech','aplicativo bancário','API pública','app mobile','plataforma B2B'];
  const examTips = {
    fundamentos:'Compare termos próximos: erro é ação humana, defeito é problema no artefato e falha é comportamento observado. A CTFL também cobra que teste reduz risco, mas não prova ausência de defeitos.',
    ciclo:'Observe se a pergunta fala de nível, tipo ou modelo de desenvolvimento. Nível indica onde o teste acontece; tipo indica objetivo; modelo indica cadência de entrega.',
    estatico:'Se não há execução do software, é estático. Revisões encontram problemas humanos em artefatos; análise estática usa ferramentas sobre código ou modelos.',
    tecnicas:'Em K3, desenhe partições, limites, regras ou estados antes de escolher respostas. A alternativa correta costuma cobrir o requisito com o menor conjunto representativo.',
    gerenciamento:'Risco combina probabilidade e impacto. Severidade mede impacto do defeito; prioridade mede urgência de correção.',
    ferramentas:'Ferramentas apoiam atividades, mas não corrigem processos ruins automaticamente. Procure respostas com PoC, critérios, treinamento e manutenção.'
  };
  const commonErrors = {
    fundamentos:'Confundir teste com depuração, qualidade com ausência total de defeitos, e independência com isolamento do time.',
    ciclo:'Misturar reteste com regressão, aceitar que todo teste deve ser automatizado e confundir teste de sistema com aceite.',
    estatico:'Achar que revisão é informal por definição ou que análise estática executa o produto.',
    tecnicas:'Escolher valores internos demais em BVA, esquecer partições inválidas e contar regras impossíveis em tabelas de decisão.',
    gerenciamento:'Usar apenas quantidade de casos como métrica de qualidade e tratar todo risco como defeito.',
    ferramentas:'Automatizar fluxo instável, ignorar custo de manutenção e escolher ferramenta pela moda.'
  };
  const mnemonic = {
    fundamentos:'Pense em E-D-F: Erro da pessoa, Defeito no artefato, Falha em execução.',
    ciclo:'Nível é “onde”, tipo é “por quê”, técnica é “como”.',
    estatico:'EstáTico = Texto/artefaTo sem execuTar.',
    tecnicas:'Para K3: particione, bordeje, tabule e desenhe estados.',
    gerenciamento:'Risco = probabilidade × impacto; prioridade = fila de correção.',
    ferramentas:'PoC antes de compra; manutenção antes de promessa.'
  };
  function pick(arr, i) { return arr[i % arr.length]; }
  function topic(seed, name, i) {
    const ctx = pick(contexts, i);
    return { title:name,
      concept:`${name} é um ponto central em ${seed.title}. O estudo deve considerar objetivo, artefato afetado, risco, evidência gerada e impacto para pessoas usuárias. Em uma preparação CTFL v4.0.1, o conceito precisa ser entendido como parte de um sistema de decisão: testar fornece informação confiável para decidir liberar, corrigir, aprofundar investigação ou aceitar risco residual.`,
      simple:`Em termos simples, ${name.toLowerCase()} responde a uma pergunta prática do QA: o que observar, por que isso importa e qual evidência prova que o time analisou o risco certo.`,
      example:`Em um contexto de ${ctx}, o time usa ${name.toLowerCase()} para evitar que uma regra crítica seja validada apenas por intuição. O QA transforma a regra em exemplos, critérios, verificações ou conversas revisáveis, reduzindo retrabalho antes da entrega.`,
      exam:examTips[seed.id], errors:commonErrors[seed.id], memory:mnemonic[seed.id], related:[pick(seed.los, i)[0], pick(seed.los, i+1)[0]] };
  }
  function makeCards(seed) {
    const base = seed.topics.map((t,i) => ({ id:`${seed.id}-card-${i+1}`, term:t, front:`O que significa ${t} em ${seed.title}?`, back:`${t} representa uma decisão ou técnica usada para produzir evidência de qualidade. Na prova, relacione com ${pick(seed.los,i)[0]} e evite ${commonErrors[seed.id].toLowerCase()}`, example:`Exemplo: ${topic(seed,t,i).example}` }));
    while (base.length < 20) { const i = base.length; base.push({ id:`${seed.id}-card-${i+1}`, term:`Pegadinha ${i-seed.topics.length+1}`, front:`Qual pegadinha comum em ${seed.title}?`, back:examTips[seed.id], example:`Revise o LO ${pick(seed.los,i)[0]} e explique em voz alta a diferença para conceitos vizinhos.` }); }
    return base;
  }
  const templates = [
    ['fácil','Qual alternativa melhor descreve {topic}?',['É uma forma de obter evidência e reduzir incerteza sobre qualidade.','É a garantia de que não existem defeitos.','É sempre uma atividade feita somente após codificação.','É sinônimo de depuração feita pelo desenvolvedor.'],0],
    ['médio','Em um projeto real, quando {topic} deve ser considerado?',['Somente após produção.','Quando ajuda a orientar risco, cobertura ou comunicação de qualidade.','Apenas se houver automação.','Somente por equipe externa independente.'],1],
    ['difícil','Qual é uma armadilha de prova associada a {topic}?',['Assumir que uma técnica ou ferramenta elimina todos os defeitos.','Usar evidência para decisão.','Relacionar teste a risco.','Documentar premissas e critérios.'],0]
  ];
  function question(seed, i) {
    const t = seed.topics[i % seed.topics.length], lo = pick(seed.los, i)[0], tpl = templates[i % templates.length];
    return { id:`${seed.id}-q-${i+1}`, module:seed.id, chapter:seed.title, lo, difficulty:tpl[0], tags:[t, lo, seed.id], text:tpl[1].replace('{topic}', t), options:tpl[2], answer:tpl[3], explanation:`A resposta correta conecta ${t} ao objetivo do capítulo: produzir informação útil, proporcional ao risco, com evidência entendível. ${examTips[seed.id]}`, optionExplanations:['Correta quando expressa o uso profissional do conceito.','Incorreta quando promete qualidade absoluta ou elimina risco.','Incorreta quando restringe teste a uma fase única.','Incorreta quando confunde papéis ou atividades.'] };
  }
  function k3(seed, n, kind) {
    const scenarios = {
      ep:['Uma API aceita transferências de R$ 10,00 a R$ 5.000,00. Qual conjunto representa partições válida e inválidas?',['R$ 1, R$ 100, R$ 6.000','R$ 10, R$ 11, R$ 12','R$ 0, R$ 9, R$ 10','R$ 5.000, R$ 5.001, R$ 5.002'],0,'O conjunto cobre uma partição inválida abaixo, uma válida e uma inválida acima.'],
      bva:['Para senha com 8 a 20 caracteres, usando valor limite de dois pontos, quais valores são mais relevantes?',['7, 8, 20, 21','1, 10, 30, 40','8, 9, 19, 20','0, 5, 25, 30'],0,'BVA seleciona exatamente os valores nas bordas e imediatamente fora delas.'],
      dt:['Em checkout, frete grátis ocorre quando cliente é VIP OU compra acima de R$ 300. Qual combinação deve resultar em frete grátis?',['VIP=false e total=100','VIP=false e total=350','VIP=false e total=300 exato se a regra é acima de 300','Nenhuma combinação gera benefício'],1,'A condição OR permite benefício quando qualquer condição verdadeira satisfaz a regra.'],
      st:['Um pedido pode ir de Criado para Pago, Cancelado ou Expirado. Após Pago, pode ir para Enviado. Qual transição é inválida?',['Criado → Pago','Pago → Enviado','Cancelado → Enviado','Criado → Cancelado'],2,'Estados finais ou cancelados normalmente não avançam para envio.']
    };
    const s = scenarios[kind];
    return { id:`tecnicas-k3-${kind}-${n}`, module:'tecnicas', chapter:seed.title, lo:{ep:'FL-4.2.1',bva:'FL-4.2.2',dt:'FL-4.2.3',st:'FL-4.2.4'}[kind], difficulty:'difícil', tags:['K3', kind, 'cenário'], text:s[0], options:s[1], answer:s[2], explanation:s[3], optionExplanations:['Avalie cobertura, não apenas valores bonitos.','Verifique se a alternativa exercita a regra completa.','Procure limites, combinações ou transições proibidas.','Elimine respostas que reduzem o cenário.'] };
  }
  const minimums = { fundamentos:20, ciclo:20, estatico:15, tecnicas:30, gerenciamento:20, ferramentas:15 };
  const modules = (window.QAQUEST_MODULE_SEEDS || []).map(seed => {
    const topics = seed.topics.map((t,i)=>topic(seed,t,i));
    const cards = makeCards(seed);
    const questions = Array.from({length:minimums[seed.id]},(_,i)=>question(seed,i));
    if (seed.id === 'tecnicas') ['ep','bva','dt','st','ep','bva','dt','st','dt','st'].forEach((k,i)=>questions[i]=k3(seed,i+1,k));
    const exercises = seed.topics.slice(0,8).map((t,i)=>`Explique ${t.toLowerCase()} usando um exemplo de ${pick(contexts,i)}. Indique risco, evidência esperada, LO relacionado (${pick(seed.los,i)[0]}) e uma pegadinha de prova.`);
    return { ...seed, topics, cards, questions, exercises };
  });
  const glossaryNames = ['Erro','Defeito','Falha','Verificação','Validação','Qualidade','Risco','Objetivo de teste','Testware','Rastreabilidade','Independência','Depuração','Cobertura','Critério de aceite','Requisito','User story','Teste estático','Revisão','Inspeção','Walkthrough','Análise estática','Checklist','Moderador','Autor','Revisor','Teste dinâmico','Nível de teste','Componente','Integração','Sistema','Aceite','UAT','Alfa','Beta','Teste funcional','Teste não funcional','Performance','Usabilidade','Segurança','Confiabilidade','Compatibilidade','Manutenibilidade','Portabilidade','Reteste','Regressão','Manutenção','Shift-left','DevOps','Pipeline','CI/CD','Partição de equivalência','Valor limite','Tabela de decisão','Regra de decisão','Condição','Ação','Transição de estados','Estado','Evento','Caso de uso','Caixa-preta','Caixa-branca','Experiência','Teste exploratório','Error guessing','Cobertura de instruções','Cobertura de decisão','Dados de teste','Oráculo de teste','Caso de teste','Procedimento de teste','Suíte de teste','Plano de teste','Estratégia','Estimativa','Monitoramento','Controle','Métrica','Relatório de teste','Risco de produto','Risco de projeto','Probabilidade','Impacto','Severidade','Prioridade','Relatório de defeito','Ciclo de vida do defeito','Triagem','Gestão de configuração','Baseline','Ferramenta de teste','Automação','Selenium-like','SAST','DAST','Falso positivo','Falso negativo','Mock','Stub','Ambiente de teste','Observabilidade','Flaky test','ROI','PoC','Critério de saída','Critério de entrada','Pirâmide de testes','Smoke test','Sanity test'];
  const glossary = glossaryNames.map((name,i)=>({ name, category:pick(['Fundamentos','Ciclo de Vida','Teste Estático','Técnicas','Gerenciamento','Ferramentas'],i), definition:`${name} é um termo CTFL usado para comunicar qualidade com precisão e reduzir ambiguidades em decisões de teste.`, simple:`Em linguagem simples: ${name.toLowerCase()} ajuda o time a saber o que está sendo avaliado e por quê.`, example:`Em ${pick(contexts,i)}, o QA registra ${name.toLowerCase()} para alinhar expectativa, evidência e risco antes da release.`, related:[glossaryNames[(i+1)%glossaryNames.length], glossaryNames[(i+2)%glossaryNames.length]], confused:glossaryNames[(i+3)%glossaryNames.length] }));
  return { modules, glossary };
})();
