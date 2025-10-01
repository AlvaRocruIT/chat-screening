## Dynamic per-vacante context in n8n (single workflow)

Goal: Use one workflow for all vacancies, injecting role-specific context based on the `vacante` field sent by the chatbot.

### Frontend (already done)
- `vacante1/chatbot/main.js` sends `{ text, vacante: "vacante1" }`.
- `vacante2/chatbot/main.js` sends `{ text, vacante: "vacante2" }`.

### Files in repo
- `data/vacantes/vacante1.json`
- `data/vacantes/vacante2.json`

Each contains: `id`, `title`, `location`, `employment_type`, `seniority`, `summary`, `functions[]`, `requirements[]`, `culture_note`.

### n8n changes (reuse existing workflow, +1 node)
1) Webhook node (unchanged)
   - Path: `chat-screening`
   - CORS: allow `https://alvarocruit.github.io`

2) Carry Text (Set) (unchanged)
   - `text = {{$json.body.text}}`
   - `vacante = {{$json.body?.vacante || ''}}`

3) NEW: HTTP Request "Fetch Vacante Context"
   - Method: GET
   - URL: `https://raw.githubusercontent.com/AlvaRocruIT/chat-screening/main/data/vacantes/{{$json.vacante || 'vacante1'}}.json`
   - Headers: `Accept: application/json`, `User-Agent: n8n`
   - Response: JSON

4) Existing Fetch FAQ (unchanged)
5) Existing Select Q&A (unchanged)
6) Existing Fetch Chunks (unchanged)
7) Existing Rank Chunks (unchanged)
8) Merge node combines (Select Q&A) with (Rank Chunks) (unchanged)

9) Build context (Set) – update `compiledContext` to include vacante details:
```
[VACANTE]
{{
  const v = $json.vacanteData || {};
  const list = (arr)=> (arr||[]).map((x,i)=>`- ${x}`).join('\n');
  return [
    `id: ${v.id||''}`,
    `titulo: ${v.title||''}`,
    `ubicacion: ${v.location||''}`,
    `tipo: ${v.employment_type||''}`,
    `seniority: ${v.seniority||''}`,
    `resumen: ${v.summary||''}`,
    `funciones:\n${list(v.functions)}`,
    `requisitos:\n${list(v.requirements)}`,
    `nota_cultura: ${v.culture_note||''}`,
  ].join('\n');
}}

[Q&A]
... (igual que antes)

[EXTRACTOS PDF]
... (igual que antes)

[PREGUNTA]
... (igual que antes)

[SCORE]
... (igual que antes)
```

Also add a new field in this Set node:
- `vacanteData = {{$node['Fetch Vacante Context'].json}}`

10) AI Agent and downstream nodes (unchanged)

### Notes
- Default to `vacante1` if missing to avoid broken URLs.
- You can add future vacancies by committing a new `data/vacantes/<id>.json` without changing n8n.

