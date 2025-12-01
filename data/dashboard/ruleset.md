# Sistema de Evaluación de Candidatos - Reglas de Puntuación

**Versión:** 1.0  
**Última actualización:** 2025-01-29  
**Idioma de evaluación:** Español  

---

## Tabla de Contenidos

1. [Definiciones Principales](#definiciones-principales)
2. [Escala de Puntuación](#escala-de-puntuación)
3. [Metodología de Evaluación](#metodología-de-evaluación)
4. [Algoritmo de Puntuación](#algoritmo-de-puntuación)
5. [Textos de Referencia por Dimensión](#textos-de-referencia-por-dimensión)
6. [Umbrales Progresivos](#umbrales-progresivos)
7. [Criterios de Ranking](#criterios-de-ranking)
8. [Especificaciones Técnicas](#especificaciones-técnicas)

---

## Definiciones Principales

### Interacción
- **Definición:** Una interacción = 1 pregunta del candidato + 1 respuesta del bot
- **Unidad de medida:** Cada turno de conversación cuenta como una interacción completa

### Dimensiones de Evaluación
El sistema evalúa 5 dimensiones independientes:

1. **Cultural Alignment (Alineación Cultural)** - `cultural_alignment`
2. **Growth Mindset (Mentalidad de Crecimiento)** - `growth_mindset`
3. **Engagement Depth (Profundidad de Compromiso)** - `engagement_depth`
4. **Role Understanding (Comprensión del Rol)** - `role_understanding`
5. **Strategic Thinking (Pensamiento Estratégico)** - `strategic_thinking`

### Principios Fundamentales
- **Monotonicidad:** Las puntuaciones solo aumentan, nunca disminuyen
- **Aditividad:** Cada interacción añade puntos a las puntuaciones acumuladas
- **Multi-dimensionalidad:** Una sola interacción puede puntuar en múltiples dimensiones simultáneamente
- **Contexto Completo:** Se requieren múltiples interacciones para alcanzar puntuaciones máximas

---

## Escala de Puntuación

### Rango por Dimensión
- **Escala:** 1.0 a 5.0 puntos por dimensión
- **Puntuación inicial:** 0.0 (se mapea a 1.0 en la escala final)
- **Puntuación máxima:** 5.0 (requiere contexto completo)

### Mapeo a Escala Final
```
Puntuación Final = 1 + (Puntuación Normalizada × 4)
```

Donde:
- `Puntuación Normalizada` = valor entre 0.0 y 1.0
- El rango resultante es 1.0 a 5.0

---

## Metodología de Evaluación

### Sistema Basado en Embeddings (Similitud Semántica)

**Tecnología:** Embeddings vectoriales (OpenAI text-embedding-3-small o equivalente)

**Ventajas:**
- Entiende variaciones lingüísticas automáticamente
- Captura sinónimos y conceptos relacionados
- No requiere stemming manual
- Evalúa significado, no palabras literales

**Proceso:**
1. Cada dimensión tiene un "texto de referencia" que define su espacio semántico
2. Las preguntas y respuestas se convierten en embeddings
3. Se calcula la similitud coseno entre el texto del candidato y cada referencia
4. La similitud se convierte en puntos de puntuación

### Ponderación Pregunta vs. Respuesta

**Regla:** Las preguntas tienen 3× más peso que las respuestas

**Fórmula:**
```
Puntos Totales = (Similitud Pregunta × 3) + (Similitud Respuesta × 1)
```

**Razonamiento:** Las preguntas revelan el pensamiento proactivo del candidato, mientras que las respuestas reflejan comprensión de la información proporcionada.

### Umbral de Similitud

**Umbral suave:** 0.15 - 0.20

- **Similitud < 0.15:** Contribución = 0 puntos (sin relación relevante)
- **Similitud ≥ 0.15:** Contribución calculada normalmente

**Razonamiento:** Filtra coincidencias aleatorias mientras permite contenido relevante con similitud moderada.

---

## Algoritmo de Puntuación

### Paso 1: Puntuación por Interacción (por Dimensión)

```javascript
// 1. Calcular similitud
similitud_pregunta = cosineSimilarity(embedding_pregunta, embedding_referencia_dimension)
similitud_respuesta = cosineSimilarity(embedding_respuesta, embedding_referencia_dimension)

// 2. Aplicar umbral mínimo
if (similitud_pregunta < 0.15) similitud_pregunta = 0
if (similitud_respuesta < 0.15) similitud_respuesta = 0

// 3. Calcular puntos ponderados
puntos_totales = (similitud_pregunta × 3) + (similitud_respuesta × 1)

// 4. Convertir a puntuación de interacción (tope 0.5)
puntuacion_interaccion = min(0.5, (puntos_totales / 2) × 0.5)
```

**Límite por interacción:** Máximo 0.5 puntos por dimensión por interacción

**Objetivo:** Se requieren aproximadamente 20 interacciones con calidad perfecta para alcanzar 5.0 en una misma dimensión.

### Paso 2: Acumulación

```javascript
// Sumar todas las puntuaciones de interacción por dimensión
puntuacion_acumulada = Σ(puntuacion_interaccion) para todas las interacciones
```

**Propiedad:** Solo aumenta, nunca disminuye (monotónica)

### Paso 3: Normalización con Umbrales Progresivos

```javascript
// 1. Calcular puntuación normalizada
puntuacion_normalizada = min(
    umbral_progresivo(conteo_interacciones),
    puntuacion_acumulada × 0.5
)

// 2. Mapear a escala 1-5
puntuacion_final = 1 + (puntuacion_normalizada × 4)
```

**Factor de escalado:** 0.5 (10.0 puntos acumulados = 5.0 normalizado = 5.0 final)

---

## Textos de Referencia por Dimensión

### 1. Cultural Alignment (Alineación Cultural)

```
Interés en valores de la empresa, cultura organizacional, ambiente de trabajo, 
dinámica de equipo, colaboración entre colegas, misión y visión corporativa, 
principios éticos, relaciones interpersonales, ambiente laboral positivo, 
sentido de pertenencia, valores compartidos, trabajo en equipo, respeto mutuo, 
comunicación abierta, diversidad e inclusión, compromiso organizacional, 
identidad cultural, bienestar laboral, cultura de confianza, ética empresarial
```

### 2. Growth Mindset (Mentalidad de Crecimiento)

```
Interés en aprendizaje continuo, desarrollo profesional, crecimiento personal, 
oportunidades de capacitación, programas de formación, mentoría y coaching, 
progreso de carrera, mejora continua, adquisición de nuevas habilidades, 
desarrollo de competencias, evolución profesional, plan de carrera, 
capacitación técnica, aprendizaje autónomo, desarrollo de talento, 
oportunidades de crecimiento, formación especializada, actualización profesional, 
expansión de conocimientos, curiosidad por aprender
```

### 3. Engagement Depth (Profundidad de Compromiso)

```
Profundidad de las preguntas, calidad de seguimiento, nivel de curiosidad genuina, 
detalle en las consultas, interés auténtico por comprender, interacción significativa, 
exploración exhaustiva de temas, comprensión profunda, diálogo constructivo, 
preguntas reflexivas, búsqueda de clarificación, seguimiento de respuestas anteriores, 
curiosidad intelectual, compromiso con la conversación, atención al detalle, 
preguntas de seguimiento relevantes, profundización en temas, interés sostenido, 
exploración meticulosa, diálogo profundo
```

### 4. Role Understanding (Comprensión del Rol)

```
Claridad sobre responsabilidades del puesto, expectativas del rol, alcance del cargo, 
entregables esperados, criterios de éxito, objetivos del puesto, funciones principales, 
competencias requeridas, impacto del rol en la organización, requisitos técnicos, 
objetivos de desempeño, métricas de éxito, alcance funcional, áreas de responsabilidad, 
expectativas de resultados, propósito del cargo, contribución esperada, 
responsabilidades clave, logros esperados, definición del rol
```

### 5. Strategic Thinking (Pensamiento Estratégico)

```
Comprensión de impacto empresarial, visión a largo plazo, enfoque estratégico, 
resolución de problemas complejos, objetivos organizacionales, desafíos del negocio, 
soluciones innovadoras, mejora de procesos, pensamiento sistémico, impacto estratégico, 
visión de futuro, planificación estratégica, análisis de impacto, pensamiento holístico, 
objetivos corporativos, desafíos estratégicos, soluciones estratégicas, 
mejora continua de procesos, visión organizacional, pensamiento de alto nivel
```

---

## Umbrales Progresivos

Los umbrales progresivos limitan la puntuación máxima según el número de interacciones, asegurando que se requiera contexto completo para alcanzar puntuaciones altas.

| Interacciones | Puntuación Máxima | Interpretación |
|--------------|-------------------|-----------------|
| 1-2 | 1.5 | Etapa muy temprana, contexto limitado |
| 3-4 | 2.0 | Construyendo comprensión básica |
| 5-7 | 2.5 | Comprensión inicial establecida |
| 8-10 | 3.0 | Buena participación, contexto en desarrollo |
| 11-14 | 3.5 | Participación sólida, contexto establecido |
| 15-19 | 4.5 | Acercándose a contexto completo |
| 20+ | 5.0 | Contexto completo alcanzado |

**Nota:** Estos umbrales se aplican a la `puntuacion_normalizada` (0.0-1.0) antes de mapear a la escala 1-5.

---

## Criterios de Ranking

### Puntuación General (Overall Score)

```
Puntuación General = (Σ Puntuaciones por Dimensión) / 5
```

Promedio simple de las 5 dimensiones.

### Ranking de Candidatos

**Criterio principal:** Puntuación general (promedio de 5 dimensiones)

**Criterio secundario:** Número de interacciones (desempate/refuerzo)

**Candidatos de alto potencial:**
- Alta puntuación general (≥ 4.0)
- Alto número de interacciones (≥ 10)

**Candidatos extraordinarios:**
- Puntuación general ≥ 4.5
- Interacciones ≥ 15
- Puntuación ≥ 4.0 en todas las dimensiones

### "Contexto Completo" Definido

Un candidato con "contexto completo" cumple:
- Puntuación ≥ 4.0 en todas las dimensiones
- Mínimo 15 interacciones
- Exploración significativa de todos los temas relevantes

---

## Especificaciones Técnicas

### Modelo de Embeddings
- **Modelo recomendado:** OpenAI `text-embedding-3-small`
- **Dimensión del vector:** 1536 (o según el modelo)
- **Idioma:** Español
- **Métrica de similitud:** Coseno (Cosine Similarity)

### Fórmula de Similitud Coseno

```javascript
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### Estructura de Datos

**Entrada:**
- `chatinput` (texto de pregunta) desde tabla `conversations`
- `bot_response` (texto de respuesta) desde tabla `conversations`
- `session_id` (identificador de sesión)
- `vacante` (vacante aplicada)

**Procesamiento:**
- Embeddings generados para preguntas y respuestas
- Similitudes calculadas contra 5 referencias de dimensión
- Puntuaciones acumuladas por `(session_id, vacante)`

**Salida:**
- `cultural_alignment` (DECIMAL 3,2)
- `growth_mindset` (DECIMAL 3,2)
- `engagement_depth` (DECIMAL 3,2)
- `role_understanding` (DECIMAL 3,2)
- `strategic_thinking` (DECIMAL 3,2)
- `overall_score` (DECIMAL 3,2) = promedio de las 5 dimensiones
- `interactions` (INTEGER) = conteo de interacciones

### Factor de Escalado

**Factor de normalización:** 0.5

```
Puntuación Normalizada = Puntuación Acumulada × 0.5
```

Esto significa que con el tope de 0.5 por interacción:
- 20 interacciones perfectas = 10.0 acumulado = 5.0 normalizado = 5.0 final

### Parámetros de Calibración

| Parámetro | Valor | Propósito |
|-----------|-------|-----------|
| Peso de pregunta | 3× | Prioriza preguntas sobre respuestas |
| Peso de respuesta | 1× | Considera comprensión de respuestas |
| Tope por interacción | 0.5 | Previene puntuación máxima con pocas interacciones |
| Umbral de similitud | 0.15 | Filtra coincidencias irrelevantes |
| Factor de escalado | 0.5 | Convierte puntos acumulados a escala 0-1 |
| Interacciones objetivo | 20 | Interacciones necesarias para contexto completo |

---

## Ejemplos de Cálculo

### Ejemplo 1: Interacción de Alta Calidad

**Entrada:**
- Pregunta: "¿Cuál es la cultura de la empresa y qué oportunidades de desarrollo profesional ofrecen?"
- Respuesta: "Nuestra cultura se basa en valores de colaboración y ofrecemos programas de capacitación"

**Cálculo:**
- Similitud pregunta vs. Cultural: 0.65 → puntos: 0.65 × 3 = 1.95
- Similitud pregunta vs. Growth: 0.60 → puntos: 0.60 × 3 = 1.80
- Similitud respuesta vs. Cultural: 0.55 → puntos: 0.55 × 1 = 0.55
- Similitud respuesta vs. Growth: 0.50 → puntos: 0.50 × 1 = 0.50

**Cultural Alignment:**
- Puntos totales: 1.95 + 0.55 = 2.50
- Puntuación interacción: min(0.5, (2.50/2) × 0.5) = 0.5 ✅

**Growth Mindset:**
- Puntos totales: 1.80 + 0.50 = 2.30
- Puntuación interacción: min(0.5, (2.30/2) × 0.5) = 0.5 ✅

### Ejemplo 2: Interacción de Baja Calidad

**Entrada:**
- Pregunta: "hola"
- Respuesta: "Hola, ¿en qué puedo ayudarte?"

**Cálculo:**
- Todas las similitudes < 0.15 → 0 puntos
- Puntuación interacción en todas las dimensiones: 0.0

### Ejemplo 3: Acumulación y Normalización

**Candidato con 15 interacciones:**
- Cultural Alignment acumulado: 6.0 puntos
- Interacciones: 15
- Umbral progresivo: 4.5 (para 15 interacciones)
- Normalizado: min(4.5, 6.0 × 0.5) = min(4.5, 3.0) = 3.0
- Final: 1 + (3.0 × 4) = 13.0 → **ERROR** (debe ser: 1 + (0.75 × 4) = 4.0)

**Corrección:**
- El umbral progresivo debe aplicarse a la escala 0-1, no a puntos acumulados
- Puntuación normalizada (0-1): 6.0 × 0.5 = 3.0 ❌ (debe ser entre 0-1)

**Revisión de fórmula:**
```
Puntuación Normalizada (0-1) = min(
    umbral_progresivo_normalizado,  // ej: 0.875 para 15 interacciones
    puntuacion_acumulada × 0.05     // factor que produce rango 0-1
)
```

Si 20 interacciones perfectas = 10.0 acumulado → debe dar 1.0 normalizado:
- Factor = 1.0 / 10.0 = 0.1

**Fórmula corregida:**
```
Puntuación Normalizada = min(umbral_progresivo, puntuacion_acumulada × 0.1)
Puntuación Final = 1 + (Puntuación Normalizada × 4)
```

---

## Revisión de Umbrales Progresivos (Normalizados 0-1)

| Interacciones | Umbral Normalizado (0-1) | Puntuación Máxima Final |
|--------------|---------------------------|-------------------------|
| 1-2 | 0.125 | 1.5 |
| 3-4 | 0.25 | 2.0 |
| 5-7 | 0.375 | 2.5 |
| 8-10 | 0.5 | 3.0 |
| 11-14 | 0.625 | 3.5 |
| 15-19 | 0.875 | 4.5 |
| 20+ | 1.0 | 5.0 |

**Factor de conversión:** 0.1 (10.0 acumulado → 1.0 normalizado)

---


## Implementation Mapping

| Id | Regla | Referencia | Nodo |
|----|--------------|---------------------------|-------------------------|
| 1 | Cálculo Similitud Coseno  | Explícito | Calculate Similarities |
| 2 | Umbral Mínimo 0.15 | Explícito | Calculate Similarities |
| 3 | Ponderación de puntaje (P×3, R×1) | Explícito | Calculate Interaction Scores |
| 4 | Max 0.5 por Interacción | Explícito | Calculate Interaction Scores |
| 5 | Puntaje Aditivo | Explícito | Format & Normalize Scores |
| 6 | Propiedad Monotónica | Implícito | Format & Normalize Scores |
| 7 | Umbral Progresivo | Explícito | Format & Normalize Scores |
| 8 | Formula de Normalización | Explícito | Format & Normalize Scores |
| 9 | Escala de Evaluación | Explícito | Format & Normalize Scores |
| 10 | Evaluación 5 Dimensiones | Explícito | Calculate Similarities |
| 11 | Consistencia con Database | Explícito | Update Scores |

---

## Changelog

- **v1.0 (2025-01-29):** Versión inicial del sistema de evaluación basado en embeddings

---

## Notas de Implementación

1. Los textos de referencia deben convertirse en embeddings una vez y almacenarse
2. Cada pregunta y respuesta deben convertirse en embeddings en tiempo real
3. El cálculo de similitud debe realizarse para las 5 dimensiones en paralelo
4. Las puntuaciones deben acumularse por `(session_id, vacante)`
5. La normalización debe aplicarse cuando se actualiza `candidate_scores`

---

**Fin del Documento**
