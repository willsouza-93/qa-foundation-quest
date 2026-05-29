# QA Foundation Quest

Aplicação web estática, responsiva e gamificada para estudos da certificação **ISTQB Certified Tester Foundation Level (CTFL) v4.0.1**.

## Como executar localmente

```bash
python3 -m http.server 4173
```

Acesse `http://127.0.0.1:4173/index.html`.

## Recursos

- Dashboard com progresso, XP, nível, streak, badges e meta diária.
- Seis módulos oficiais CTFL v4.0.1 com navegação por abas: visão geral, aula aprofundada, LOs enriquecidos, flashcards, questões, exercícios e revisão.
- Glossário expandido com mais de 100 termos, pesquisa instantânea, categorias, favoritos, exemplos e termos relacionados.
- Simulados rápido, por módulo e completo, com sorteio sem repetição, navegação lateral, marcação para revisão e resultado detalhado.
- Revisão de erros salva em LocalStorage.
- Tema claro/escuro, modo foco, busca global, importação/exportação de progresso e PWA offline.

## Estrutura

- `index.html` — shell principal da SPA.
- `data/*.js` — conteúdo didático separado por módulo, montagem do glossário, flashcards e banco de questões.
- `scripts/storage.js` — persistência, XP, streak e badges.
- `scripts/app.js` — renderização, rotas e interações.
- `styles/main.css` — design responsivo e temas.
- `pages/` — atalhos estáticos para rotas importantes no GitHub Pages.
