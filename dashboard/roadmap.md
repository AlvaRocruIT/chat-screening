# Roadmap de Implementación - Sistema de Evaluación Inteligente

**Objetivo:** Implementar el algoritmo de scoring basado en embeddings según `ruleset.md`

**Stack:** Supabase (Database) → n8n (Workflow) → GitHub (Dashboard Frontend)

---

## Fase 0: Preparación y Análisis

### Objetivos
- Comprender el flujo actual
- Identificar puntos de modificación
- Preparar entorno de desarrollo

### Tareas
1. ✅ Revisar `ruleset.md` completo
2. ✅ Mapear flujo actual de datos: 📌
   - Chatbot → n8n webhook
   - n8n → Supabase `conversations`
   - n8n → Supabase `candidate_scores`
   - Dashboard → Supabase REST API
3. ✅ Identificar nodos n8n que requieren modificación:
   - "Log Conversation" (actual)
   - "Topic Classification" (reemplazar)
   - "Keyword Analysis" (reemplazar)
   - "Update Scores" (modificar)
4. ✅ Verificar estructura actual de tablas en Supabase

**Salida:** Documento de arquitectura actual vs. arquitectura objetivo

---

## Fase 1: Preparación de Base de Datos (Supabase)

### Objetivos
- Asegurar que la estructura de datos soporta el nuevo algoritmo
- Crear/verificar embeddings de textos de referencia

### Tareas

#### 1.1 Verificar Estructura de Tablas
- [ ] Confirmar que `conversations` tiene:
  - `chatinput` (TEXT)
  - `bot_response` (TEXT)
  - `session_id` (VARCHAR)
  - `vacante` (VARCHAR)
- [ ] Confirmar que `candidate_scores` tiene:
  - 5 columnas de dimensión (DECIMAL 3,2)
  - `overall_score` (DECIMAL 3,2)
  - `interactions` (INTEGER)
  - `session_id` + `vacante` (UNIQUE constraint)

**SQL de verificación:**
```sql
-- Verificar estructura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidate_scores';
```

#### 1.2 Crear Tabla de Referencias (Opcional pero Recomendado)
Crear tabla para almacenar embeddings de textos de referencia:

```sql
CREATE TABLE dimension_references (
    id SERIAL PRIMARY KEY,
    dimension_name VARCHAR(50) UNIQUE NOT NULL,
    reference_text TEXT NOT NULL,
    embedding VECTOR(1536),  -- Ajustar según modelo
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar textos de referencia (sin embeddings aún)
INSERT INTO dimension_references (dimension_name, reference_text) VALUES
('cultural_alignment', 'Interés en valores de la empresa, cultura organizacional...'),
('growth_mindset', 'Interés en aprendizaje continuo, desarrollo profesional...'),
('engagement_depth', 'Profundidad de las preguntas, calidad de seguimiento...'),
('role_understanding', 'Claridad sobre responsabilidades del puesto...'),
('strategic_thinking', 'Comprensión de impacto empresarial, visión a largo plazo...');
```

**Nota:** Los embeddings se generarán en n8n y se almacenarán después.

**Salida:** Tablas verificadas y lista para recibir nuevos datos

---

## Fase 2: Implementación en n8n (Core Logic)

### Objetivos
- Reemplazar keyword matching con embeddings
- Implementar cálculo de similitud coseno
- Aplicar algoritmo de scoring progresivo

### Tareas

#### 2.1 Generar Embeddings de Referencias (Una vez)
Crear workflow n8n separado o nodo inicial:

**Nodo: "Generate Reference Embeddings" (Code Node)**
- [ ] Usar OpenAI Embeddings node o HTTP Request a OpenAI API
- [ ] Generar embeddings para los 5 textos de referencia
- [ ] Guardar embeddings en Supabase `dimension_references` o como constantes en código

**Alternativa:** Embeddings como constantes en código (más simple, menos dinámico)

#### 2.2 Modificar Workflow Principal: Análisis de Conversación

**Flujo actual:**
```
Chat Trigger → Q&A Chain → Log Conversation → Topic Classification → Keyword Analysis → Format Data → Update Scores
```

**Flujo nuevo:**
```
Chat Trigger → Q&A Chain → Log Conversation → Generate Embeddings → Calculate Similarities → Calculate Scores → Format Data → Update Scores
```

#### 2.3 Crear Nodo: "Generate Embeddings" (Después de Log Conversation)
**Tipo:** OpenAI Embeddings node o HTTP Request + Code node

**Input:** `chatinput` y `bot_response` del nodo anterior

**Acción:**
- [ ] Convertir `chatinput` a embedding
- [ ] Convertir `bot_response` a embedding
- [ ] Pasar ambos embeddings al siguiente nodo

**Código ejemplo (si usas Code node + HTTP Request):**
```javascript
const chatInput = $json.chatInput || '';
const botResponse = $json.botResponse || '';

// Llamar a OpenAI Embeddings API (o usar nodo nativo)
// Retornar ambos embeddings
return [{
    json: {
        ...$json,
        questionEmbedding: questionEmbeddingVector,
        responseEmbedding: responseEmbeddingVector
    }
}];
```

#### 2.4 Crear Nodo: "Calculate Similarities" (Code Node)
**Input:** Embeddings de pregunta/respuesta + embeddings de referencias

**Funciones requeridas:**
- [ ] Función `cosineSimilarity(vectorA, vectorB)`
- [ ] Comparar pregunta contra 5 referencias → 5 similitudes
- [ ] Comparar respuesta contra 5 referencias → 5 similitudes
- [ ] Aplicar umbral mínimo (0.15)

**Código estructura:**
```javascript
// Embeddings de referencia (constantes o desde DB)
const referenceEmbeddings = {
    cultural_alignment: [...],
    growth_mindset: [...],
    engagement_depth: [...],
    role_understanding: [...],
    strategic_thinking: [...]
};

function cosineSimilarity(vecA, vecB) {
    // Implementar fórmula
}

const item = $input.item.json;
const questionEmbedding = item.questionEmbedding;
const responseEmbedding = item.responseEmbedding;

const similarities = {};

for (const [dimension, refEmbedding] of Object.entries(referenceEmbeddings)) {
    const questionSim = cosineSimilarity(questionEmbedding, refEmbedding);
    const responseSim = cosineSimilarity(responseEmbedding, refEmbedding);
    
    similarities[dimension] = {
        question: Math.max(0, questionSim - 0.15), // Aplicar umbral
        response: Math.max(0, responseSim - 0.15)
    };
}

return [{
    json: {
        ...item,
        similarities: similarities
    }
}];
```

#### 2.5 Crear Nodo: "Calculate Scores" (Code Node)
**Input:** Similitudes calculadas

**Acción:**
- [ ] Calcular puntos ponderados: `(similitud_pregunta × 3) + (similitud_respuesta × 1)`
- [ ] Aplicar tope por interacción: `min(0.5, (puntos_totales / 2) × 0.5)`
- [ ] Retornar puntuación por interacción (0.0 a 0.5 por dimensión)

**Código estructura:**
```javascript
const item = $input.item.json;
const similarities = item.similarities;

const interactionScores = {};

for (const [dimension, sim] of Object.entries(similarities)) {
    const totalPoints = (sim.question * 3) + (sim.response * 1);
    const interactionScore = Math.min(0.5, (totalPoints / 2) * 0.5);
    
    interactionScores[dimension] = interactionScore;
}

return [{
    json: {
        ...item,
        interactionScores: interactionScores
    }
}];
```

#### 2.6 Modificar Nodo: "Format Data" (Code Node)
**Cambios:**
- [ ] Obtener puntuaciones acumuladas actuales desde Supabase
- [ ] Sumar puntuación de interacción actual a acumuladas
- [ ] Contar número de interacciones
- [ ] Aplicar umbrales progresivos
- [ ] Normalizar (0-1)
- [ ] Mapear a escala final (1-5)

**Código estructura:**
```javascript
// 1. Obtener scores actuales desde Supabase (usando Execute Query node antes)
const currentScores = $json.currentScores; // Desde Supabase
const interactionScores = $json.interactionScores; // Del nodo anterior
const interactionCount = $json.interactionCount; // Desde Supabase

// 2. Acumular
const accumulatedScores = {};
for (const dimension of ['cultural_alignment', 'growth_mindset', 'engagement_depth', 'role_understanding', 'strategic_thinking']) {
    accumulatedScores[dimension] = (currentScores[dimension] || 0) + interactionScores[dimension];
}

// 3. Aplicar umbral progresivo
function getProgressiveThreshold(count) {
    if (count <= 2) return 0.125;
    if (count <= 4) return 0.25;
    if (count <= 7) return 0.375;
    if (count <= 10) return 0.5;
    if (count <= 14) return 0.625;
    if (count <= 19) return 0.875;
    return 1.0;
}

const threshold = getProgressiveThreshold(interactionCount);

// 4. Normalizar y mapear
const finalScores = {};
for (const [dimension, accumulated] of Object.entries(accumulatedScores)) {
    const normalized = Math.min(threshold, accumulated * 0.1);
    const final = 1 + (normalized * 4);
    finalScores[dimension] = Number(final.toFixed(2));
}

// 5. Calcular overall
const overall = Object.values(finalScores).reduce((a, b) => a + b, 0) / 5;

return [{
    json: {
        session_id: $json.sessionId,
        vacante: $json.vacante,
        ...finalScores,
        overall_score: Number(overall.toFixed(2)),
        interactions: interactionCount
    }
}];
```

**Nota:** Necesitarás un nodo PostgreSQL "Get Current Scores" antes de este nodo.

#### 2.7 Modificar Nodo: "Update Scores" (PostgreSQL)
**Cambios mínimos:**
- [ ] Asegurar que usa los nuevos campos de `finalScores`
- [ ] Mantener lógica de UPSERT con `(session_id, vacante)`

**SQL (ya debería estar correcto):**
```sql
INSERT INTO candidate_scores (
    session_id, vacante,
    cultural_alignment, growth_mindset, engagement_depth,
    role_understanding, strategic_thinking,
    overall_score, interactions, created_at
)
VALUES (...)
ON CONFLICT (session_id, vacante)
DO UPDATE SET ...
```

**Salida:** Workflow n8n completamente funcional con algoritmo de embeddings

---

## Fase 3: Actualización de Frontend (Dashboard)

### Objetivos
- Verificar que el dashboard muestra correctamente las nuevas puntuaciones
- Confirmar que los cálculos de promedios usan 5 dimensiones

### Tareas

#### 3.1 Verificar Estructura de Datos
- [ ] Confirmar que `dashboard.js` lee correctamente 5 dimensiones desde Supabase
- [ ] Verificar que `scoresObjectToArray()` maneja 5 dimensiones
- [ ] Confirmar que cálculos de promedio dividen por 5

**Archivos a revisar:**
- `dashboard/dashboard.js`
- Verificar funciones: `calculateOverallAverage()`, `calculateGeneralAverage()`, `sortCandidates()`

#### 3.2 Verificar Visualización
- [ ] Confirmar que spider chart muestra 5 dimensiones
- [ ] Verificar que tabla de candidatos muestra 5 columnas de scores
- [ ] Confirmar que estadísticas calculan correctamente

**Sin cambios necesarios si ya está usando 5 dimensiones**

**Salida:** Dashboard funcionando correctamente con nuevos scores

---

## Fase 4: Testing y Validación

### Objetivos
- Verificar que el algoritmo funciona correctamente
- Validar casos edge (interacciones de baja calidad, acumulación, umbrales)

### Tareas

#### 4.1 Test 1: Interacción de Alta Calidad
- [ ] Enviar pregunta relevante a Cultural Alignment
- [ ] Verificar que similitud > 0.15
- [ ] Confirmar que puntuación de interacción > 0.0
- [ ] Verificar acumulación en Supabase

#### 4.2 Test 2: Interacción de Baja Calidad (30x "P")
- [ ] Enviar 30 interacciones con texto irrelevante ("P")
- [ ] Verificar que todas las similitudes < 0.15
- [ ] Confirmar que puntuaciones acumuladas = 0.0
- [ ] Verificar score final = 1.0 (mínimo)

#### 4.3 Test 3: Umbrales Progresivos
- [ ] Crear candidato con 2 interacciones perfectas
- [ ] Verificar que score máximo = 1.5 (umbral 0.125)
- [ ] Agregar interacciones hasta 10
- [ ] Verificar que score máximo = 3.0 (umbral 0.5)
- [ ] Agregar hasta 20 interacciones
- [ ] Verificar que score puede alcanzar 5.0 (umbral 1.0)

#### 4.4 Test 4: Multi-dimensionalidad
- [ ] Enviar pregunta que toca 2+ dimensiones
- [ ] Verificar que ambas dimensiones reciben puntuación
- [ ] Confirmar que acumulación es independiente por dimensión

#### 4.5 Test 5: Ponderación Pregunta vs. Respuesta
- [ ] Crear pregunta con alta similitud pero respuesta irrelevante
- [ ] Verificar que pregunta contribuye más (3×)
- [ ] Comparar con caso opuesto (pregunta irrelevante, respuesta relevante)

**Salida:** Suite de tests validada, algoritmo funcionando según especificación

---

## Fase 5: Optimización y Monitoreo

### Objetivos
- Optimizar performance
- Implementar logging para debugging
- Monitorear calidad de embeddings

### Tareas

#### 5.1 Optimización
- [ ] Cachear embeddings de referencias (no regenerarlos cada vez)
- [ ] Considerar batch processing si hay muchas interacciones
- [ ] Optimizar consultas a Supabase

#### 5.2 Logging
- [ ] Agregar logs de similitudes calculadas (para debugging)
- [ ] Registrar puntuaciones por interacción (para análisis)
- [ ] Guardar historial de acumulación (opcional: nueva tabla)

#### 5.3 Monitoreo
- [ ] Verificar que embeddings se generan correctamente
- [ ] Monitorear distribución de similitudes (detectar problemas)
- [ ] Alertar si muchas interacciones tienen similitud = 0

**Salida:** Sistema optimizado y monitoreado

---

## Orden de Implementación Recomendado

### Sprint 1: Fundamentos (Fase 1 + Parte de Fase 2)
1. Verificar/crear estructura de base de datos
2. Generar embeddings de referencias
3. Crear función `cosineSimilarity` en n8n

**Duración estimada:** 2-3 días

### Sprint 2: Algoritmo Core (Fase 2)
4. Implementar nodo "Generate Embeddings"
5. Implementar nodo "Calculate Similarities"
6. Implementar nodo "Calculate Scores"
7. Conectar con workflow existente

**Duración estimada:** 3-4 días

### Sprint 3: Acumulación y Persistencia (Fase 2)
8. Crear nodo "Get Current Scores"
9. Modificar nodo "Format Data" con lógica de acumulación
10. Verificar nodo "Update Scores"

**Duración estimada:** 2-3 días

### Sprint 4: Testing (Fase 4)
11. Ejecutar suite completa de tests
12. Ajustar parámetros si es necesario
13. Validar con datos reales

**Duración estimada:** 2-3 días

### Sprint 5: Optimización (Fase 5)
14. Optimizar performance
15. Implementar logging
16. Documentar cambios

**Duración estimada:** 1-2 días

**Total estimado:** 10-15 días de desarrollo

---

## Checklist Maestro

### Supabase
- [ ] Estructura de tablas verificada
- [ ] Tabla `dimension_references` creada (opcional)
- [ ] Embeddings de referencia almacenados (opcional)

### n8n
- [ ] Embeddings de referencia generados y almacenados
- [ ] Nodo "Generate Embeddings" creado y funcionando
- [ ] Nodo "Calculate Similarities" creado y funcionando
- [ ] Función `cosineSimilarity` implementada
- [ ] Nodo "Calculate Scores" creado y funcionando
- [ ] Nodo "Get Current Scores" creado
- [ ] Nodo "Format Data" modificado con acumulación y normalización
- [ ] Nodo "Update Scores" verificado
- [ ] Workflow completo probado end-to-end

### Dashboard (GitHub)
- [ ] `dashboard.js` verificado para 5 dimensiones
- [ ] Cálculos de promedio verificados (÷ 5)
- [ ] Visualización funcionando correctamente

### Testing
- [ ] Test de alta calidad pasado
- [ ] Test de baja calidad pasado (30x "P" = 1.0)
- [ ] Test de umbrales progresivos pasado
- [ ] Test de multi-dimensionalidad pasado
- [ ] Test de ponderación pregunta/respuesta pasado

---

## Recursos Necesarios

### APIs y Servicios
- ✅ OpenAI API key (para generar embeddings)
- ✅ Supabase credentials (ya tienes)
- ✅ n8n workflow (ya tienes)

### Modelo de Embeddings
- **Recomendado:** `text-embedding-3-small` (OpenAI)
- **Alternativas:** `text-embedding-3-large`, modelos de Cohere, modelos open-source

### Dependencias de Código
- Librería para cálculos vectoriales (si no usas n8n nativo)
- Función de cosine similarity (implementar o usar librería)

---

## Notas Importantes

1. **Backup antes de cambios:** Hacer backup de workflow n8n actual
2. **Testing incremental:** Probar cada nodo individualmente antes de conectar
3. **Versionado:** Mantener versiones del workflow en n8n
4. **Documentación:** Documentar cambios en código con comentarios
5. **Rollback plan:** Tener plan para revertir si algo falla

---

**¿Por dónde empezamos?** Recomiendo comenzar con **Fase 1** (verificación de base de datos) y luego **Sprint 1** (generar embeddings de referencias).
