// Rank Chunks — composite-first scoring for context_type, semantic_tags, keywords

const chunks = $input.all().map(i => i.json);
const questionOriginal = $("Question router node").all()[0]?.json?.question || "";

if (!questionOriginal) {
  console.log("No question found");
  return [{ json: { topChunks: [] } }];
}

// ---------- Text utilities ----------
function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toConceptSlug(text) {
  // normalize and convert spaces/hyphens to underscores
  return normalizeText(text).replace(/[\s-]+/g, "_");
}

function tokenizePreservingUnderscores(text) {
  return normalizeText(text).split(/[^a-z0-9_]+/).filter(Boolean);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- Stop words (include "va") ----------
const stopWords = new Set([
  "de","la","el","y","en","a","un","una","para","que","con",
  "los","las","del","al","por","se","es","lo","mi","su","tu",
  "como","sobre","cual","donde","cuando","son","estan","tiene",
  "tienen","mas","muy","tan","asi","tambien","pero","sin","bajo",
  "ccu","va"
]);

// ---------- Build set of composite concepts from data ----------
const compositeConcepts = new Set();
for (const chunk of chunks) {
  const pushConcept = (v) => {
    if (!v) return;
    const slug = toConceptSlug(v);
    if (slug.includes("_")) compositeConcepts.add(slug);
  };
  pushConcept(chunk.context_type);
  (chunk.semantic_tags || []).forEach(pushConcept);
  (chunk.keywords || []).forEach(pushConcept);
}

// ---------- Align question to composite slugs (spaces/hyphens -> underscores) ----------
let questionNorm = normalizeText(questionOriginal);
for (const concept of compositeConcepts) {
  const spaced = concept.replace(/_/g, " ");
  const hyphen = concept.replace(/_/g, "-");
  const spacedRe = new RegExp(`\\b${escapeRegex(spaced)}\\b`, "g");
  const hyphenRe = new RegExp(`\\b${escapeRegex(hyphen)}\\b`, "g");
  questionNorm = questionNorm.replace(spacedRe, concept).replace(hyphenRe, concept);
}

const qTokens = tokenizePreservingUnderscores(questionNorm).filter(t => !stopWords.has(t));
const qTokenSet = new Set(qTokens);

// ---------- Matching helpers (composite > both components > single token) ----------
function componentsOf(slug) {
  return slug.split("_").filter(Boolean);
}

function hasExactComposite(slug) {
  return questionNorm.includes(slug);
}

function hasBothComponents(slug) {
  const comps = componentsOf(slug);
  if (comps.length < 2) return false;
  return comps.every(c => qTokenSet.has(c));
}

function hasAnyComponent(slug) {
  return componentsOf(slug).some(c => qTokenSet.has(c));
}

function bestCompositeTierForValues(values) {
  // Evaluate a list of values (strings). Return the best tier seen among them.
  // 3 = exact composite match; 2 = both components present; 1 = any single component; 0 = no match
  let best = 0;
  for (const v of values) {
    const slug = toConceptSlug(v);
    if (!slug) continue;

    if (slug.includes("_") && hasExactComposite(slug)) return 3; // highest possible
    if (slug.includes("_") && hasBothComponents(slug)) best = Math.max(best, 2);
    if (hasAnyComponent(slug)) best = Math.max(best, 1);
  }
  return best;
}

function bestCompositeTierForValue(value) {
  if (!value) return 0;
  return bestCompositeTierForValues([value]);
}

// ---------- Textual relevance (low-weight tie-breaker) ----------
function textualRelevance(chunk) {
  const txt = normalizeText(chunk.text || "");
  let s = 0;
  if (questionNorm.length >= 6 && txt.includes(questionNorm)) s += 50;
  for (const t of qTokens) if (txt.includes(t)) s += 10;
  // map to ~0..10 for a gentle nudge
  return Math.min(10, (Math.min(s, 100) / 100) * 10);
}

// ---------- Score each chunk: composite-first across fields ----------
const scored = chunks.map(chunk => {
  const ctxTier = bestCompositeTierForValue(chunk.context_type);              // 0..3
  const semTier = bestCompositeTierForValues(chunk.semantic_tags || []);      // 0..3
  const kwTier  = bestCompositeTierForValues(chunk.keywords || []);           // 0..3

  // Strong weights to enforce priority: exact composite >> both components >> single token
  const compositeScore =
    (ctxTier === 3 ? 1000 : ctxTier === 2 ? 120 : ctxTier === 1 ? 15 : 0) +
    (semTier === 3 ? 900  : semTier === 2 ? 110 : semTier === 1 ? 12 : 0) +
    (kwTier  === 3 ? 800  : kwTier  === 2 ? 100 : kwTier  === 1 ? 10 : 0);

  const textScore = textualRelevance(chunk); // 0..10
  const base = Number(chunk.relevance_score ?? chunk.score ?? 0); // tiny tie-breaker

  const total = compositeScore + textScore + base;

  return {
    chunk,
    ctxTier,
    semTier,
    kwTier,
    textScore,
    base,
    total
  };
}).sort((a, b) => {
  // Sort by our composite-first total, then by textual and base as tie-breakers
  if (b.total !== a.total) return b.total - a.total;
  if (b.textScore !== a.textScore) return b.textScore - a.textScore;
  return b.base - a.base;
});

// ---------- Output top 3 ----------
const topChunks = scored.slice(0, 3).map(s => ({
  id: s.chunk.id,
  source: s.chunk.source,
  text: s.chunk.text,
  contextTier: s.ctxTier,      // 3 exact composite, 2 both components, 1 single token
  semanticTier: s.semTier,
  keywordTier: s.kwTier,
  textualRelevance: s.textScore,
  baseScore: s.base
}));

console.log("Top 3 (composite-first):", topChunks.map(t => ({
  id: t.id, c: t.contextTier, s: t.semanticTier, k: t.keywordTier
})));

return [{ json: { topChunks } }];
