// Question Router — refined company vs role (no mixed), content-first

// 1) Input
let rawQuestion = $('Carry Text')?.item?.json?.text || '';
const vacante = $('Carry Text')?.item?.json?.vacante || null;

// 2) Normalization helpers
function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
function toSlug(text) {
  return normalize(text).replace(/[\s-]+/g, '_');
}
function tokenize(text) {
  return toSlug(text).split(/[^a-z0-9_]+/).filter(Boolean);
}

// 3) Normalize question
const qNorm = normalize(rawQuestion);
const qSlug = toSlug(rawQuestion);
const qTokens = new Set(tokenize(rawQuestion));

// 4) Organizational composites (underscored concepts seen in your data)
const companyComposite = [
  'desempeno_financiero','estrategia_corporativa','gobierno_corporativo',
  'perfil_corporativo','quienes_somos','estructura_empresarial',
  'estructura_organizacional','operaciones_corporativas',
  'organizational_identity','equipo_directivo','memoria_anual',
  'desempeno_corporativo','recursos_humanos','organigrama'
];

// 5) Organizational intent keywords (single words, normalized)
const orgKeywordsTop50 = new Set([
  'empresa','compania','corporacion','organizacion','corporativo',
  'cultura','valores','mision','vision','proposito',
  'historia','fundacion','liderazgo','directorio','gobierno',
  'organigrama','estructura','equipo','areas','departamentos',
  'procesos','politicas','etica','cumplimiento','compliance',
  'sostenibilidad','sustentabilidad','esg','rse','diversidad',
  'inclusion','igualdad','impacto','finanzas','financiero',
  'resultados','ingresos','utilidades','rentabilidad','crecimiento',
  'mercado','competencia','marcas','productos','clientes',
  'operaciones','presencia','gerente','director','ceo','rrhh'
]);

// 6) Role intent keywords (single words, normalized)
const roleKeywordsTop50 = new Set([
  'rol','puesto','cargo','posicion','perfil',
  'funcion','responsabilidades','tareas','requisitos','habilidades',
  'competencias','conocimientos','experiencia','senioridad','junior',
  'senior','lider','jefe','jefatura','reporta',
  'reportar','objetivos','indicadores','seleccion','entrevista',
  'proceso','postulacion','aplicar','contrato','indefinido',
  'jornada','horario','ubicacion','remoto','hibrido',
  'presencial','modalidad','salario','sueldo','remuneracion',
  'renta','salarial','compensaciones','beneficios','bonos',
  'vacaciones','compensacion','tecnologia','herramientas','excel'
]);

// 7) Extra heuristics for org intent
const leaderWords = new Set(['gerente','director','jefe','ceo','presidente','vicepresidente','vp','lider','subgerente','subgerenta']);
const departments = new Set(['rrhh','recursos_humanos','finanzas','operaciones','legal','it','ti','tecnologia','marketing','ventas','comercial','personas','talento','sistemas','innovacion','logistica','supply_chain','compensaciones']);

// 8) Scoring
let orgScore = 0;
let roleScore = 0;

// 8.1 Composite org concepts: strong signal
for (const c of companyComposite) {
  if (qSlug.includes(c)) orgScore += 3;
}

// 8.2 Leadership + department pattern → organizational
const hasLeader = [...qTokens].some(t => leaderWords.has(t));
const hasDept = [...qTokens].some(t => departments.has(t));
if (hasLeader && hasDept) orgScore += 3;

// 8.3 Token presence from curated keyword maps
for (const t of qTokens) {
  if (orgKeywordsTop50.has(t)) orgScore += 1;
  if (roleKeywordsTop50.has(t)) roleScore += 1;
}

// 8.4 Common phrasing cue for org
if (qSlug.includes('quien_es')) orgScore += 1;

// 8.5 Small boosts for role clusters
const salarySet = new Set(['salario','sueldo','remuneracion','renta','salarial','beneficios','bonos','compensacion','compensaciones','vacaciones']);
if ([...qTokens].some(t => salarySet.has(t))) roleScore += 1;

const processSet = new Set(['postulacion','aplicar','seleccion','entrevista','proceso']);
if ([...qTokens].some(t => processSet.has(t))) roleScore += 1;

const toolsSet = new Set(['tecnologia','herramientas','excel']);
if ([...qTokens].some(t => toolsSet.has(t))) roleScore += 1;

// 9) Decide (no mixed). Vacante only breaks ties.
let questionType;
if (orgScore > roleScore) questionType = 'company';
else if (roleScore > orgScore) questionType = 'role';
else questionType = (vacante && String(vacante).trim() !== '') ? 'role' : 'company';

console.log(`Router -> orgScore=${orgScore}, roleScore=${roleScore}, type=${questionType}`);

return [{
  json: {
    question: qNorm,
    vacante: vacante || null,
    questionType
  }
}];
