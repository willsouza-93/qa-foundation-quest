# QA Foundation Quest

Aplicação web estática, responsiva e gamificada para estudos da certificação **ISTQB Certified Tester Foundation Level (CTFL) v4.0.1**.

## Como executar localmente

```bash
python3 -m http.server 4173
```

Acesse `http://127.0.0.1:4173/index.html`.

## Recursos

- Dashboard com progresso, XP, nível, streak, badges e meta diária.
- Seis módulos oficiais CTFL v4.0.1 com aula guiada, LOs, flashcards, quizzes e exercícios práticos.
- Glossário pesquisável com categorias, favoritos, exemplos e termos confundíveis.
- Simulados rápido, por módulo e completo, com temporizador e relatório por módulo/LO.
- Revisão de erros salva em LocalStorage.
- Tema claro/escuro, modo foco, busca global, importação/exportação de progresso e PWA offline.

## Estrutura

- `index.html` — shell principal da SPA.
- `data/content.js` — conteúdo didático, glossário, flashcards e questões.
- `scripts/storage.js` — persistência, XP, streak e badges.
- `scripts/app.js` — renderização, rotas e interações.
- `styles/main.css` — design responsivo e temas.
- `pages/` — atalhos estáticos para rotas importantes no GitHub Pages.
