# Roadmap de Implementación - Sistema de Evaluación Inteligente

**Objetivo:** Implementar el algoritmo de scoring basado en embeddings según `ruleset.md`

**Stack:** Supabase (Database) → n8n (Workflow) → GitHub (Dashboard Frontend)

**Estado Actual:** ✅ Fases 0-1 completas | 🔄 Fase 2 en progreso (workflow implementado, requiere fixes)

---

## Fase 0: Preparación y Análisis

### Objetivos
- Comprender el flujo actual
- Identificar puntos de modificación
- Preparar entorno de desarrollo

### Tareas
1. ✅ Revisar `ruleset.md` completo
2. ✅ Mapear flujo actual de datos:
   - Chatbot → n8n webhook
   - n8n → Supabase `conversations`
   - n8n → Supabase `candidate_scores`
   - Dashboard → Supabase REST API
3. ✅ Identificar nodos n8n que requieren modificación:
   - "Log Conversation" (actual)
   - "Fetch New Conversations" (existente)
   - "Calculate Similarities" (nuevo - requiere fixes)
   - "Update Scores" (modificado)
4. ✅ Verificar estructura actual de tablas en Supabase

**Salida:** ✅ Documento de arquitectura actual vs. arquitectura objetivo

---

## Fase 1: Preparación de Base de Datos (Supabase)

### Objetivos
- Asegurar que la estructura de datos soporta el nuevo algoritmo
- Crear/verificar embeddings de textos de referencia

### Tareas

#### 1.1 Verificar Estructura de Tablas
- [x] Confirmar que `conversations` tiene:
  - `chatinput` (TEXT) ✅
  - `bot_response` (TEXT) ✅
  - `session_id` (VARCHAR) ✅
  - `vacante` (VARCHAR) ✅
- [x] Confirmar que `candidate_scores` tiene:
  - 5 columnas de dimensión (DECIMAL 3,2) ✅
  - `overall_score` (DECIMAL 3,2) ✅
  - `interactions` (INTEGER) ✅
  - `session_id` + `vacante` (UNIQUE constraint) ✅

**SQL de verificación:**
```sql
-- Verificar estructura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidate_scores';
```

#### 1.2 Crear Tabla de Referencias
✅ **COMPLETADO:** Tabla creada (sin columna vector, solo texto)

```sql
CREATE TABLE dimension_references (
    id SERIAL PRIMARY KEY,
    dimension_name VARCHAR(50) UNIQUE NOT NULL,
    reference_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ✅ Insertados los 5 textos de referencia
INSERT INTO dimension_references (dimension_name, reference_text) VALUES
('cultural_alignment', 'Interés en valores de la empresa...'),
('growth_mindset', 'Interés en aprendizaje continuo...'),
('engagement_depth', 'Profundidad de las preguntas...'),
('role_understanding', 'Claridad sobre responsabilidades...'),
('strategic_thinking', 'Comprensión de impacto empresarial...');
```

**Nota:** Los embeddings se generan externamente (PowerShell/n8n) y se almacenan como constantes en código n8n (no en DB).

**Salida:** ✅ Tablas verificadas y lista para recibir nuevos datos

---

## Fase 2: Implementación en n8n (Core Logic)

### Objetivos
- Reemplazar keyword matching con embeddings
- Implementar cálculo de similitud coseno
- Aplicar algoritmo de scoring progresivo

### Tareas

#### 2.1 Generar Embeddings de Referencias (Una vez) ⚠️ **CRÍTICO - HACER PRIMERO**
**Método:** Usar script PowerShell externo (recomendado)

- [ ] Ejecutar: `.\generate_embeddings.ps1 -ApiKey "your-openai-api-key"`
- [ ] Copiar el output completo (constante `REFERENCE_EMBEDDINGS`)
- [ ] Guardar output para pegar en n8n

**Alternativa n8n workflow:** Ver `n8n_generate_embeddings_workflow.md` (más complejo)

**Salida:** Constante JavaScript con 5 arrays de embeddings (1536 números cada uno)

---

#### 2.2 Estructura del Workflow Actual

**Workflow:** "ChatAnalysis - new algorythm"

**Flujo actual (requiere fixes):**
```
Schedule Trigger
    ↓
Fetch New Conversations
    ↓
G-Questions Embeddings (HTTP Request)
    ↓
G-Answer Embeddings (HTTP Request)
    ↓
    ├→ Calculate Similarities (Code) ⚠️ REQUIERE FIXES
    └→ Get Current Scores (PostgreSQL)
    ↓
Merge (Code) ⚠️ REQUIERE REEMPLAZO
    ↓
Calculate Scores (Code)
    ↓
Format data (Code)
    ↓
Update Scores (PostgreSQL)
    ↓
🕸️ Chart Data (Code)
    ↓
Send 2 Dashboard (HTTP Request)
```

**Flujo objetivo (después de fixes):**
```
Schedule Trigger
    ↓
Fetch New Conversations
    ↓
Load Reference Embeddings (Code) ⚠️ NUEVO - AGREGAR PRIMERO
    ↓
G-Questions Embeddings (HTTP Request)
    ↓
Preserve Question Embedding (Code) ⚠️ NUEVO - AGREGAR
    ↓
G-Answer Embeddings (HTTP Request)
    ↓
    ├→ Calculate Similarities (Code) ⚠️ REQUIERE FIXES
    └→ Get Current Scores (PostgreSQL)
    ↓
Combine Similarities and Current Scores (Code) ⚠️ REEMPLAZAR Merge
    ↓
Calculate Scores (Code)
    ↓
Format data (Code)
    ↓
Update Scores (PostgreSQL)
    ↓
🕸️ Chart Data (Code)
    ↓
Send 2 Dashboard (HTTP Request)
```

---

#### 2.3 ⚠️ FIXES REQUERIDOS (Ver `WORKFLOW_FIX_CHECKLIST.md`)

##### Fix 1: Agregar "Load Reference Embeddings" Node
**Posición:** Inmediatamente después de "Fetch New Conversations"

**Tipo:** Code Node

**Código:**
```javascript
// PEGAR AQUÍ EL OUTPUT COMPLETO DE generate_embeddings.ps1
const REFERENCE_EMBEDDINGS = {
    "cultural_alignment": [0.123, -0.456, ...], // 1536 números
    "growth_mindset": [...],
    "engagement_depth": [...],
    "role_understanding": [...],
    "strategic_thinking": [...]
};

const items = $input.all();
return items.map(item => ({
    json: {
        ...item.json,
        _referenceEmbeddings: REFERENCE_EMBEDDINGS
    }
}));
```

**Conexiones:**
- Desconectar: "Fetch New Conversations" → "G-Questions Embeddings"
- Conectar: "Fetch New Conversations" → "Load Reference Embeddings" → "G-Questions Embeddings"

---

##### Fix 2: Agregar "Preserve Question Embedding" Node
**Posición:** Entre "G-Questions Embeddings" y "G-Answer Embeddings"

**Tipo:** Code Node

**Código:**
```javascript
const items = $input.all();
return items.map(item => ({
    json: {
        ...item.json,
        questionEmbedding: item.json.data?.[0]?.embedding || []
    }
}));
```

**Conexiones:**
- Desconectar: "G-Questions Embeddings" → "G-Answer Embeddings"
- Conectar: "G-Questions Embeddings" → "Preserve Question Embedding" → "G-Answer Embeddings"

---

##### Fix 3: Reemplazar Código de "Calculate Similarities" Node
**Problema actual:** 
- No tiene acceso a `REFERENCE_EMBEDDINGS` (está vacío)
- No puede extraer correctamente `questionEmbedding` y `answerEmbedding`

**Solución:** Ver código completo en `WORKFLOW_FIX_CHECKLIST.md` (sección 4)

**Código actualizado debe:**
- Extraer `_referenceEmbeddings` del input
- Extraer `questionEmbedding` (del nodo "Preserve Question Embedding")
- Extraer `answerEmbedding` (del nodo "G-Answer Embeddings")
- Calcular similitud coseno para 5 dimensiones
- Aplicar umbral mínimo (0.15)
- Retornar estructura: `{ dimension: { question: 0-1, response: 0-1 } }`

---

##### Fix 4: Reemplazar "Merge" Node
**Problema:** Merge no alinea correctamente datos por `session_id` + `vacante`

**Solución:** Reemplazar con Code Node "Combine Similarities and Current Scores"

**Código:** Ver `WORKFLOW_FIX_CHECKLIST.md` (sección 5)

**Debe:**
- Agrupar items por `session_id` + `vacante`
- Combinar `similarities` (de "Calculate Similarities") con `currentScores` (de "Get Current Scores")
- Retornar un item por candidato con ambos datos

---

#### 2.4 Verificar Nodos Existentes

##### "Get Current Scores" (PostgreSQL)
✅ **Estado:** Correcto

**Query actual:**
```sql
SELECT session_id, vacante,
    COALESCE(cultural_alignment, 0) AS cultural_alignment,
    COALESCE(growth_mindset, 0) AS growth_mindset,
    COALESCE(engagement_depth, 0) AS engagement_depth,
    COALESCE(role_understanding, 0) AS role_understanding,
    COALESCE(strategic_thinking, 0) AS strategic_thinking,
    COALESCE(interactions, 0) AS interactions,
    overall_score
FROM candidate_scores
WHERE session_id = '{{ $json.session_id }}'
  AND vacante = '{{ $json.vacante }}'
LIMIT 1;
```

**Verificar:** Input debe venir de "G-Answer Embeddings" (tiene `session_id` y `vacante`)

---

##### "Calculate Scores" (Code)
✅ **Estado:** Estructura correcta, pero verificar que recibe `similarities` correctamente

**Input esperado:**
```json
{
    "similarities": {
        "cultural_alignment": { "question": 0.45, "response": 0.32 },
        ...
    }
}
```

**Output:**
```json
{
    "interactionScores": {
        "cultural_alignment": 0.25,
        ...
    }
}
```

---

##### "Format data" (Code)
✅ **Estado:** Lógica correcta, pero verificar que recibe datos combinados

**Debe recibir de "Combine Similarities and Current Scores":**
- `similarities` (para calcular `interactionScores`)
- `cultural_alignment`, `growth_mindset`, etc. (scores actuales)
- `interactions` (conteo actual)

**Verificar:** Lógica de acumulación, umbrales progresivos, normalización (1-5)

---

##### "Update Scores" (PostgreSQL)
✅ **Estado:** Correcto

**Query actual usa:**
- UPSERT con `ON CONFLICT (session_id, vacante)`
- Calcula `interactions` automáticamente desde `conversations`
- 5 dimensiones correctas

---

**Salida:** ✅ Workflow n8n completamente funcional con algoritmo de embeddings (después de aplicar fixes)

---

## Fase 3: Actualización de Frontend (Dashboard)

### Objetivos
- Verificar que el dashboard muestra correctamente las nuevas puntuaciones
- Confirmar que los cálculos de promedios usan 5 dimensiones

### Tareas

#### 3.1 Verificar Estructura de Datos
- [x] Confirmar que `dashboard.js` lee correctamente 5 dimensiones desde Supabase ✅
- [x] Verificar que `scoresObjectToArray()` maneja 5 dimensiones ✅
- [x] Confirmar que cálculos de promedio dividen por 5 ✅

**Archivos revisados:**
- ✅ `dashboard/dashboard.js`
- ✅ Funciones: `calculateOverallAverage()`, `calculateGeneralAverage()`, `sortCandidates()`

#### 3.2 Verificar Visualización
- [x] Confirmar que spider chart muestra 5 dimensiones ✅
- [x] Verificar que tabla de candidatos muestra 5 columnas de scores ✅
- [x] Confirmar que estadísticas calculan correctamente ✅

**Salida:** ✅ Dashboard funcionando correctamente con nuevos scores

---

## Fase 4: Testing y Validación

### Objetivos
- Verificar que el algoritmo funciona correctamente
- Validar casos edge (interacciones de baja calidad, acumulación, umbrales)

### Tareas

#### 4.1 Test 0: Verificar Embeddings Generados ⚠️ **PRIMERO**
- [ ] Ejecutar `generate_embeddings.ps1`
- [ ] Verificar que output tiene 5 arrays de 1536 números cada uno
- [ ] Confirmar que arrays no están vacíos
- [ ] Verificar que se pueden pegar en "Load Reference Embeddings" sin errores

#### 4.2 Test 1: Verificar Flujo de Datos
- [ ] Ejecutar workflow manualmente (desactivar schedule trigger)
- [ ] Verificar que "Load Reference Embeddings" pasa `_referenceEmbeddings` correctamente
- [ ] Verificar que "Preserve Question Embedding" guarda `questionEmbedding` array
- [ ] Verificar que "G-Answer Embeddings" genera embedding correctamente
- [ ] Verificar que "Calculate Similarities" recibe ambos embeddings
- [ ] Verificar que "Calculate Similarities" calcula 5 similitudes correctamente

#### 4.3 Test 2: Interacción de Alta Calidad
- [ ] Enviar pregunta relevante a Cultural Alignment
- [ ] Verificar que similitud > 0.15
- [ ] Confirmar que puntuación de interacción > 0.0
- [ ] Verificar acumulación en Supabase

#### 4.4 Test 3: Interacción de Baja Calidad (30x "P")
- [ ] Enviar 30 interacciones con texto irrelevante ("P")
- [ ] Verificar que todas las similitudes < 0.15
- [ ] Confirmar que puntuaciones acumuladas = 0.0
- [ ] Verificar score final = 1.0 (mínimo)

#### 4.5 Test 4: Umbrales Progresivos
- [ ] Crear candidato con 2 interacciones perfectas
- [ ] Verificar que score máximo = 1.5 (umbral 0.125)
- [ ] Agregar interacciones hasta 10
- [ ] Verificar que score máximo = 3.0 (umbral 0.5)
- [ ] Agregar hasta 20 interacciones
- [ ] Verificar que score puede alcanzar 5.0 (umbral 1.0)

#### 4.6 Test 5: Multi-dimensionalidad
- [ ] Enviar pregunta que toca 2+ dimensiones
- [ ] Verificar que ambas dimensiones reciben puntuación
- [ ] Confirmar que acumulación es independiente por dimensión

#### 4.7 Test 6: Ponderación Pregunta vs. Respuesta
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
- [ ] Cachear embeddings de referencias (ya implementado como constantes)
- [ ] Considerar batch processing si hay muchas interacciones
- [ ] Optimizar consultas a Supabase (ya optimizado con LIMIT 1)

#### 5.2 Logging
- [ ] Agregar logs de similitudes calculadas (para debugging)
- [ ] Registrar puntuaciones por interacción (para análisis)
- [ ] Guardar historial de acumulación (opcional: nueva tabla)

**Ejemplo de logging en "Calculate Similarities":**
```javascript
console.log('Similarities calculated:', {
    sessionId: $json.session_id,
    similarities: similarities,
    questionSimAvg: Object.values(similarities).reduce((sum, s) => sum + s.question, 0) / 5,
    responseSimAvg: Object.values(similarities).reduce((sum, s) => sum + s.response, 0) / 5
});
```

#### 5.3 Monitoreo
- [ ] Verificar que embeddings se generan correctamente
- [ ] Monitorear distribución de similitudes (detectar problemas)
- [ ] Alertar si muchas interacciones tienen similitud = 0

**Salida:** Sistema optimizado y monitoreado

---

## Orden de Implementación Actualizado

### ⚠️ Sprint 0: FIXES CRÍTICOS (HACER PRIMERO)
**Duración:** 1-2 horas

1. **Generar embeddings de referencias:**
   ```powershell
   .\generate_embeddings.ps1 -ApiKey "your-key"
   ```

2. **Aplicar fixes del workflow:**
   - Agregar "Load Reference Embeddings" node
   - Agregar "Preserve Question Embedding" node
   - Reemplazar código de "Calculate Similarities"
   - Reemplazar "Merge" con "Combine Similarities and Current Scores"

3. **Verificar flujo:**
   - Ejecutar workflow manualmente
   - Verificar outputs de cada nodo
   - Confirmar que embeddings se calculan correctamente

**Ver:** `WORKFLOW_FIX_CHECKLIST.md` para pasos detallados

---

### Sprint 1: Fundamentos (Fase 1 + Parte de Fase 2) ✅
1. ✅ Verificar/crear estructura de base de datos
2. ✅ Crear tabla `dimension_references`
3. ⚠️ Generar embeddings de referencias (PENDIENTE - hacer en Sprint 0)

**Duración estimada:** ✅ Completado (excepto embeddings)

---

### Sprint 2: Algoritmo Core (Fase 2) 🔄
4. ✅ Implementar nodo "Generate Embeddings" (G-Questions + G-Answer)
5. ⚠️ Implementar nodo "Calculate Similarities" (requiere fixes)
6. ✅ Implementar nodo "Calculate Scores"
7. ✅ Conectar con workflow existente

**Duración estimada:** ✅ Mayormente completado (requiere fixes)

---

### Sprint 3: Acumulación y Persistencia (Fase 2) ✅
8. ✅ Crear nodo "Get Current Scores"
9. ✅ Modificar nodo "Format Data" con lógica de acumulación
10. ✅ Verificar nodo "Update Scores"

**Duración estimada:** ✅ Completado

---

### Sprint 4: Testing (Fase 4) 📋
11. ⚠️ Ejecutar suite completa de tests (después de Sprint 0)
12. ⚠️ Ajustar parámetros si es necesario
13. ⚠️ Validar con datos reales

**Duración estimada:** 2-3 días (después de fixes)

---

### Sprint 5: Optimización (Fase 5) 📋
14. Optimizar performance (mayormente hecho)
15. Implementar logging
16. Documentar cambios

**Duración estimada:** 1-2 días

**Total estimado:** 10-15 días de desarrollo (con fixes incluidos: ~12-17 días)

---

## Checklist Maestro Actualizado

### Supabase
- [x] Estructura de tablas verificada ✅
- [x] Tabla `dimension_references` creada ✅
- [ ] Embeddings de referencia generados ⚠️ **HACER PRIMERO**

### n8n - Generación de Embeddings
- [ ] Script PowerShell ejecutado (`generate_embeddings.ps1`)
- [ ] Output copiado y guardado
- [ ] Embeddings verificados (5 arrays de 1536 números)

### n8n - Workflow Principal
- [ ] Nodo "Load Reference Embeddings" agregado ✅ (estructura lista)
- [ ] Embeddings pegados en "Load Reference Embeddings" ⚠️
- [ ] Nodo "Preserve Question Embedding" agregado ⚠️
- [ ] Nodo "G-Questions Embeddings" funcionando ✅
- [ ] Nodo "G-Answer Embeddings" funcionando ✅
- [ ] Nodo "Calculate Similarities" código actualizado ⚠️
- [ ] Función `cosineSimilarity` implementada ✅
- [ ] Nodo "Get Current Scores" funcionando ✅
- [ ] Nodo "Combine Similarities and Current Scores" reemplaza Merge ⚠️
- [ ] Nodo "Calculate Scores" funcionando ✅
- [ ] Nodo "Format Data" modificado con acumulación ✅
- [ ] Nodo "Update Scores" verificado ✅
- [ ] Workflow completo probado end-to-end ⚠️

### Dashboard (GitHub)
- [x] `dashboard.js` verificado para 5 dimensiones ✅
- [x] Cálculos de promedio verificados (÷ 5) ✅
- [x] Visualización funcionando correctamente ✅

### Testing
- [ ] Test 0: Embeddings generados correctamente ⚠️
- [ ] Test 1: Flujo de datos verificado ⚠️
- [ ] Test 2: Interacción de alta calidad
- [ ] Test 3: Interacción de baja calidad (30x "P" = 1.0)
- [ ] Test 4: Umbrales progresivos
- [ ] Test 5: Multi-dimensionalidad
- [ ] Test 6: Ponderación pregunta/respuesta

---

## Recursos Necesarios

### APIs y Servicios
- ✅ OpenAI API key (para generar embeddings)
- ✅ Supabase credentials (ya tienes)
- ✅ n8n workflow (ya tienes)

### Modelo de Embeddings
- **Usado:** `text-embedding-3-small` (OpenAI)
- **Tamaño:** 1536 dimensiones

### Scripts y Documentación
- ✅ `generate_embeddings.ps1` (PowerShell script)
- ✅ `WORKFLOW_FIX_CHECKLIST.md` (guía de fixes)
- ✅ `FIX_WORKFLOW_ISSUES.md` (explicación detallada)
- ✅ `QUICK_START_EMBEDDINGS.md` (guía rápida)

---

## Notas Importantes

1. **⚠️ CRÍTICO:** Generar embeddings PRIMERO antes de probar el workflow
2. **Backup:** Hacer backup de workflow n8n actual antes de aplicar fixes
3. **Testing incremental:** Probar cada nodo individualmente después de cada fix
4. **Versionado:** Mantener versiones del workflow en n8n
5. **Rollback plan:** Tener plan para revertir si algo falla

---

## Próximos Pasos Inmediatos

### Paso 1: Generar Embeddings (5 minutos)
```powershell
.\generate_embeddings.ps1 -ApiKey "your-openai-api-key"
```

### Paso 2: Aplicar Fixes (30 minutos)
1. Abrir `WORKFLOW_FIX_CHECKLIST.md`
2. Seguir pasos 1-5
3. Verificar cada nodo después de cada cambio

### Paso 3: Test Manual (15 minutos)
1. Desactivar schedule trigger
2. Ejecutar workflow manualmente
3. Verificar outputs de cada nodo
4. Confirmar que embeddings se calculan

### Paso 4: Activar y Monitorear (continuo)
1. Activar schedule trigger
2. Monitorear ejecuciones
3. Verificar scores en Supabase
4. Ajustar si es necesario

---

**Estado:** 🔄 Listo para aplicar fixes críticos (Sprint 0)

**Bloqueadores actuales:**
- ⚠️ Embeddings de referencia no generados
- ⚠️ Workflow tiene bugs de data flow
- ⚠️ "Merge" node no alinea datos correctamente

**Solución:** Ver `WORKFLOW_FIX_CHECKLIST.md`
