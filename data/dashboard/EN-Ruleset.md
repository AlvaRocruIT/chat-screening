# Candidate Assessment System - Scoring Ruleset

**Version:** 1.0  
**Last Update:** 2025-11-27  
**Assesment language:** Spanish  

---

## Content Table

1. [Main Definitions](#main-definitions)
2. [Scoring Scale](#scoring-scale)
3. [Evaluation Methodology](#evaluation-methodology)
4. [Scoring Algorythm](#scoring-algorythm)
5. [Reference Texts per Dimension](#reference-texts-per-dimension)
6. [Progressive Tresholds](#progressive-tresholds)
7. [Ranking Criteria] (#ranking-criteria)
8. [Technical-specifications](#technical-specifications)

---

## Masin Definitions

### Interaction
- **Definition:** An interaction = 1 candidate question + 1 bot question
- **Unit of Measure:** Each coversation turn counts as a full interaction
### Evaluation dimensions
Systema evaluates 5 independient dimensions:

1. **Cultural Alignment** - `cultural_alignment`
2. **Growth Mindset** - `growth_mindset`
3. **Engagement Depth** - `engagement_depth`
4. **Role Understanding** - `role_understanding`
5. **Strategic Thinking** - `strategic_thinking`

### Main Principles
- **Monotonicity:** Scoring only increaces, they never decreaces
- **Additivity:** Each interacction adds points to the accumulated scores
- **Multi-dimensionality:** A single interaction can scores simultaneously in multiple dimensions
- **Full Context:** Multiple interactions are required to reach max scores

---

## Scoring Scale

### Range per Dimension
- **Scale:** 1.0 to 5.0 points per dimension
- **Initial scoring:** 0.0 (Gets mapped as 1.0 in final scale)
- **Max Score:** 5.0 (requires full context)

### Final Scale Mapping
```
Final Punctuation = 1 + (Normalized Punctuación × 4)
```

Where:
- `NormalizadaPuntuation` = value between 0.0 y 1.0
- Resultant range is 1.0 to 5.0

---

## Evaluationg Methodology

### Embeddings based System (Semanthic Similarity)

**Technology:** Vectoring embeddings (OpenAI text-embedding-3-small or equivalent)

**Adventages:**
- Catches linguistic variations automatically
- Catches synonims and relatedconcepts
- Does not  requires manual stemming
- Evaluates meaning, not literal words

**Process:**
1. Each dimension has an "reference text" which defines it's semantyc space
2. Questions and answers are converted in embeddings
3. Cosine similaritySe gets calculated from candidate text and each reference
4. Similarity gets converted in score points

### Weighting Question vs. Answer

**Rules:** Questions weights 3× more than answers

**Formula:**
```
Total Score = (Question Similarity × 3) + (Answer Similarity × 1)
```

**Reasoning:** Questions revealscandidate proactive thinking, meanwhile answers reflect system's comprehension of given data.

### Similarity treshold

**Soft Treshold:** 0.15 - 0.20

- **Similarity < 0.15:** Contribution = 0 points (no relevant relation)
- **Similarity ≥ 0.15:** Normally calculated contributión

**Reasoning:** Filters random coincidences so while allowing relevant content with moderate similarity.

---

## Punctuation Algorythm

### Step 1: Scoring per Interaction (per Dimension)

```javascript
// 1. Calculates similarity
question_similarity = cosineSimilarity(embedding_pregunta, embedding_referencia_dimension)
answer_similarity = cosineSimilarity(embedding_respuesta, embedding_referencia_dimension)

// 2. Apply minimal treshold
if (question_similarity < 0.15) question_similarity = 0
if (answer_similarity < 0.15) answer_similarity = 0

// 3. Calculate weighted scores
total_score = (question_similarity × 3) + (answer_similarity × 1)

// 4. Convert to interaction socinrg (max 0.5)
interaction_punctuacion = min(0.5, (total_score / 2) × 0.5)
```

**Limit per interaction:** Max 0.5 points per dimension per interaction

**Objective:** 20 interactions (aprox) perfectly qualified are required to reach 5.0 in a single dimension.

### Step 2: Accumulation

```javascript
// Add every interaction punctuation per dimension
accumulated_punctuation = Σ(interaction_puntuacion) for each interaction
```

**Property:** It only increaces, it never decreaces (monotonic)

### Step 3: Normalization withc Progressive Thresholds

```javascript
// 1. Calculate normalized scores
normalized_scores = min(
    progressive_thresholds(interactions_counts),
    accumulated_score × 0.5
)

// 2. Mapping to 1-5 scale
final_punctuation = 1 + (normalized_punctuation × 4)
```

**Scaling factor:** 0.5 (10.0 accumulated points = 5.0 normalized = 5.0 final)

---

## Reference Texts per Dimension

### 1. Cultural Alignment

```
Interest about organizational values, organizational culture, possitive work environment, 
team dynamics, collaboration between coworkers, Organizational vission and purpose, 
ethical principles, interpersonal relationships,  
sense of belonging, shared values, teamwork, mutual respect, 
open communications, diversity and inclusion, organizational commitment, 
cultural identity, work well-being, trust culture, organizational ethics
```

### 2. Growth Mindset

```
Interest about continuous learning, professional development, personal growth, 
capacitation oportunities, learning programs, mentoring & coaching, 
career progress, continuous improving, new skills acquisition, 
competences development, profesional evolution, career plan, 
technical capacitation, self-managed learning, talent development, 
growth opportunities, specialized capacitation, professional updates, 
knowledge expansion, learning curiosity
```

### 3. Engagement Depth

```
Question depht, quality of following, genuine curiosity, 
detail on prompts, authentical interest on understanding, significative interaction, 
thorough topics research, deep comprehension, constructive dialogue, 
preguntas reflexivas, búsqueda de clarificación, seguimiento de respuestas anteriores, 
intelectual curiosity, conversation commitment, attenrion to detail, 
relevant following questions, thorough research, deep dialogue
```

### 4. Role Understanding 

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
Comprehensionon organizational impact, long term vission, strategic focus, 
complex problems solving, orgnizational objectives, business challenges, 
innovative solutions, process improving, systemic thinking, strategic impact, 
future vission, strategic vission, impact analisys, holystic thinking, 
organizational objectives, strategic challenges, strategic solutions, 
continuous process improvement, organizational vission, high level thinking
```

---

## Progrsesive Thresholds

Progrsesive Thresholds limits max scores acording the number of interactions, ensuring that a full context gets required to reach high scores.

| Interactions | Max Scores | Interpretation |
|--------------|-------------------|-----------------|
| 1-2 | 1.5 | Too early stage, limited context |
| 3-4 | 2.0 | Building basic comprehension |
| 5-7 | 2.5 | Initial comprehnsion stablished|
| 8-10 | 3.0 | Nice participation, context in progress |
| 11-14 | 3.5 | Solid participation, stablished context |
| 15-19 | 4.5 | Close to full context  |
| 20+ | 5.0 | Full context got reached |

**Note:** Those thresholds get applied to `normalized_punctuation` (0.0-1.0) before get mapped to 1-5 scale.

---

## Ranking Criteria

### Overall Score

```
Overall Score = (Σ Score per Dimension) / 5
```

Simple average of the 5 dimensions.

### Candidates Ranking

**Main Criteria:** Overall Score (average of the 5 dimensions)

**Secondary criteria:** Numbers of interactions (tiebreak/reinforcement)

**High potential candidates:**
- High nverall Score (≥ 4.0)
- High numbero of interactions (≥ 10)

**Extraordinary candidates:**
- Overall Score ≥ 4.5
- Interactions ≥ 15
- Scores ≥ 4.0 in all dimensions

### Defined "Full context"

A candidate with "Full context" meets the following criteria:

- scores ≥ 4.0 in all the  dimensions
- Min 15 interacctions
- Significative research of all relevant topics

---

## Technical Specifications

### Embeddings Model
- **Recomended Model:** OpenAI `text-embedding-3-small`
- **Vector Dimension:** 1536 (or wathever the model suggests)
- **Language:** Spanish
- **Similarity metrics:** Cosine Similarity

### Cosine Similarity Formula

```javascript
function cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        normA += vectorA[i] * vectorA[i];
        normB += vectorB[i] * vectorB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### Data structure

**Input:**
- `chatinput` (question text) from table `conversations`
- `bot_response` (answer text) from table `conversations`
- `session_id` (session identifier)
- `vacante` (applied vacancy)

**Processing:**
- Generated embeddings for questions and answers
- Calculated scores vs 5 dimension references
- Accumulated scores for `(session_id, vacante)`

**Output:**
- `cultural_alignment` (DECIMAL 3,2)
- `growth_mindset` (DECIMAL 3,2)
- `engagement_depth` (DECIMAL 3,2)
- `role_understanding` (DECIMAL 3,2)
- `strategic_thinking` (DECIMAL 3,2)
- `overall_score` (DECIMAL 3,2) = 5 dimensions average
- `interactions` (INTEGER) = count of interactions

### Scaling factor

**Normalization factor:** 0.5

```
Normalized Score = Accumilated Score × 0.5
```

This means that with the limit of 0.5 per interaction:
- 20 perfect interactions = 10.0 accumulated = 5.0 normalized = 5.0 final

### Calibration Parameters

| Parameter | Value | Purpose |
|-----------|-------|-----------|
| Question's weight | 3× | Priorize questions over answers |
| Answer weight | 1× | Consider answer comprehension |
| Limit per interaction | 0.5 | Prevents max scoring with low interactions |
| Similarity threshold | 0.15 | Filers irrelevant coincidences |
| Scaling Factor | 0.5 | Convert accumulated scores to 0-1 scale |
| Objective interactions | 20 | Necesary interactions for full context |

---

## Examples of Calculation

### Example 1: High quality Interaction

**Input:**
- Question: "¿What is the organizational culture and what professional development opportunities do you offer?
- Answer: "Our organizational culture focuses on the continuous development of its employees, promoting sales, digital, and leadership skills. They offer diverse development options, such as e-learning training programs, in-person workshops, and specific programs like the Young Professionals and Logistics Training programs, which aim to enhance skills and facilitate growth within the company."

**Calculation:**
- Question similarity vs. Cultural: 0.65 → score: 0.65 × 3 = 1.95
- Question similarity vs. Growth: 0.60 → score: 0.60 × 3 = 1.80
- Question similarity vs. Cultural: 0.55 → score: 0.55 × 1 = 0.55
- Question similarity vs. Growth: 0.50 → score: 0.50 × 1 = 0.50

**Cultural Alignment:**
- Total score: 1.95 + 0.55 = 2.50
- Interaction interaction: min(0.5, (2.50/2) × 0.5) = 0.5 ✅

**Growth Mindset:**
- Total score: 1.80 + 0.50 = 2.30
- Interaction Score: min(0.5, (2.30/2) × 0.5) = 0.5 ✅

### Example 2: Low quality Interaction

**Input:**
- Question: "Hi"
- Answer: "Hi, ¿How can I help you?"

**Calculation:**
- All the similarities < 0.15 → 0 points
- Interaction score in every dimension: 0.0

### Example 3: Accumulation and Normalization

**Candidate with 15 interactions:**
- Cultural Alignment (accumulated): 6.0 points
- Interactions: 15
- Progressive Threshold: 4.5 (For 15 interactions)
- Normalized: min(4.5, 6.0 × 0.5) = min(4.5, 3.0) = 3.0
- Final: 1 + (3.0 × 4) = 13.0 → **ERROR** (should be: 1 + (0.75 × 4) = 4.0)

**Correction:**
- The progressive threshold should get appliedto 0-1 scale, not to accumulated score
- Normalizzed score (0-1): 6.0 × 0.5 = 3.0 ❌ (should be between 0-1)

**Formula review:**
```
Normalized Score (0-1) = min(
    umbral_progresivo_normalizado,  // eg: 0.875 for 15 interactions
    puntuacion_acumulada × 0.05     // factor that produces 0-1 range
)
```

If  perfect 20 interactions = 10.0 accumulated → should result 1.0 normalized:
- Factor = 1.0 / 10.0 = 0.1

**Corrected Formula:**
```
Puntuación Normalizada = min(umbral_progresivo, puntuacion_acumulada × 0.1)
Puntuación Final = 1 + (Puntuación Normalizada × 4)
```

---

## Progressive Thresholds Review (Normalized 0-1)

| Interactions | Normalized Threshold (0-1) | Max Final Score |
|--------------|---------------------------|-------------------------|
| 1-2 | 0.125 | 1.5 |
| 3-4 | 0.25 | 2.0 |
| 5-7 | 0.375 | 2.5 |
| 8-10 | 0.5 | 3.0 |
| 11-14 | 0.625 | 3.5 |
| 15-19 | 0.875 | 4.5 |
| 20+ | 1.0 | 5.0 |

**Conversion Factor:** 0.1 (10.0 accumulated → 1.0 normalized)

---

## Changelog

- **v1.0 (2025-10-29):** Initial Versión of evaluation system based on embeddings (in spanish)
- **v1.0 (2025-11-27):** Same one but translated to english
---

## Implementaction Notes

1. Reference texts should be converted in embeddings and stored ✅
2. Each question and answer should be converted in embeddings in real time 🤔
3. Similarity calculation should get done for the 5 dimentions simultaneously
4. Each punctuation should get stored for `(session_id, vacante)`
5. Normalización should get applied whenever `candidate_scores` is updated

---

**End of the Document**
