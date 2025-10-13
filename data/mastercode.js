// --- Rank Chunks Node jerárquico: context → semantic → keywords → relevance score ---

// 1️⃣ Obtener chunks y pregunta
const chunks = $input.all().map(item => item.json);
const question = $("Question router node").all()[0]?.json?.question || '';

if (!question) {
    console.log("No question found");
    return [{ json: { topChunks: [] } }];
}

console.log(`Processing ${chunks.length} chunks for question: "${question}"`);

// 2️⃣ Normalización y tokenización
function norm(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function tokenize(s) {
    return norm(s).split(/[^a-z0-9]+/).filter(t => t.length > 1);
}

const questionNorm = norm(question);
const questionTokens = tokenize(question);

// 3️⃣ Stop words
const stopWords = new Set([
    'de','la','el','y','en','a','un','una','para','que','con',
    'los','las','del','al','por','se','es','lo','mi','su','tu',
    'como','sobre','cual','donde','cuando','son','estan','tiene',
    'tienen','mas','muy','tan','asi','tambien','pero','sin','bajo',
    'ccu'
]);

const filteredTokens = questionTokens.filter(t => !stopWords.has(t));

// 4️⃣ Funciones de scoring jerárquico

// Context type match: 2 = exact match, 1 = partial token match, 0 = no match
function contextScore(chunk) {
    const context = chunk.context_type || '';
    if (!context) return 0;
    const contextNorm = norm(context);
    if (questionNorm.includes(contextNorm)) return 2; // exact-ish
    const contextTokens = tokenize(context).filter(t => !stopWords.has(t));
    return contextTokens.some(t => filteredTokens.includes(t)) ? 1 : 0;
}

// Semantic tags match: 2 = exact, 1 = partial token, 0 = no match
function semanticScore(chunk) {
    const tags = chunk.semantic_tags || [];
    if (!tags.length) return 0;

    for (const tag of tags) {
        const tagNorm = norm(tag);
        if (questionNorm.includes(tagNorm)) return 2; // exact-ish
        const tagTokens = tokenize(tag).filter(t => !stopWords.has(t));
        if (tagTokens.some(t => filteredTokens.includes(t))) return 1; // partial
    }
    return 0;
}

// Keywords match: 1 si hay algún token coincidente, 0 si no
function keywordScore(chunk) {
    const kws = chunk.keywords || [];
    for (const kw of kws) {
        const kwTokens = tokenize(kw).filter(t => !stopWords.has(t));
        if (kwTokens.some(t => filteredTokens.includes(t))) return 1;
    }
    return 0;
}

// Normalized relevance score textual (tie-breaker)
function relevanceScore(chunk) {
    const txt = chunk.text || '';
    let score = 0;

    if (questionNorm.length >= 6 && norm(txt).includes(questionNorm)) score += 50;

    const txtTokens = tokenize(txt);
    for (const t of filteredTokens) if (txtTokens.includes(t)) score += 10;

    // Normalización simple 0.90-0.99
    return Math.min(0.99, 0.90 + Math.min(score, 100)/100 * 0.09);
}

// 5️⃣ Ranking jerárquico con score original
const rankedChunks = chunks.map(chunk => {
  const cScore = contextScore(chunk);
  const sScore = semanticScore(chunk);
  const kScore = keywordScore(chunk);
  const baseScore = Number(chunk.score || 0); // ← score original del repo
  return { chunk, cScore, sScore, kScore, baseScore };
}).sort((a, b) => {
  if (b.cScore !== a.cScore) return b.cScore - a.cScore;
  if (b.sScore !== a.sScore) return b.sScore - a.sScore;
  if (b.kScore !== a.kScore) return b.kScore - a.kScore;
  return b.baseScore - a.baseScore; // desempate con score real
});

// 6️⃣ Top 3
const topChunks = rankedChunks.slice(0,3).map(({chunk, rScore}) => ({
    id: chunk.id,
    source: chunk.source,
    text: chunk.text,
    score: rScore
}));

console.log('Top 3 chunks:', topChunks.map(c => ({ id: c.id, score: c.score, textPreview: c.text.slice(0,100)+'...' })));

// 7️⃣ Retornar a n8n
return [{ json: { topChunks } }];
