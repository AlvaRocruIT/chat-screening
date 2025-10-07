const questionType = $('Question router node').item.json.questionType;
const question = $('Question router node').item.json.question;
const mergedData = $('Merge').all();

console.log('Question type:', questionType);
console.log('Question:', question);
console.log('Merged data length:', mergedData.length);

// Extract processed data from merge
let chunks = [];
let qa = [];
let vacante = {};

// Debug: Log what we're getting from merge
mergedData.forEach((item, index) => {
  console.log(`Merge item ${index}:`, Object.keys(item.json));
  
  if (index === 0) {
    // First item should be vacante data
    vacante = item.json;
    console.log('Vacante data:', vacante);
  } else if (index === 1) {
    // Second item should be processed chunks
    chunks = item.json.topChunks || [];
    console.log('Chunks data:', chunks.length, 'chunks');
  } else if (index === 2) {
    // Third item should be processed Q&A
    qa = item.json.replies || [];
    console.log('QA data:', qa.length, 'replies');
  }
});

let context = '';
let dataSource = '';

if (questionType === 'role') {
  // For role questions, use vacante data
  context = `[VACANTE]
id: ${vacante.id || ''}
titulo: ${vacante.title || ''}
ubicacion: ${vacante.location || ''}
tipo: ${vacante.employment_type || ''}
seniority: ${vacante.seniority || ''}
resumen: ${vacante.summary || ''}
funciones:
${(vacante.functions || []).map(f => '- ' + f).join('\n')}
requisitos:
${(vacante.requirements || []).map(r => '- ' + r).join('\n')}
nota_cultura: ${vacante.culture_note || ''}`;
  dataSource = 'vacante';
  
} else if (questionType === 'company') {
  // For company questions, prefer chunks, fallback to Q&A
  if (chunks.length > 0) {
    // FILTER CHUNKS BASED ON QUESTION RELEVANCE
    const relevantChunks = chunks.filter(chunk => {
      const chunkText = chunk.text?.toLowerCase() || '';
      const questionLower = question.toLowerCase();
      
      // Check for exact keyword matches
      const keywords = ['proposito', 'principios', 'valores', 'mision', 'vision', 'cultura'];
      const hasKeyword = keywords.some(keyword => 
        questionLower.includes(keyword) && chunkText.includes(keyword)
      );
      
      // Check for general relevance
      const hasRelevance = chunkText.includes(questionLower) || 
                          questionLower.split(' ').some(word => 
                            word.length > 3 && chunkText.includes(word)
                          );
      
      return hasKeyword || hasRelevance;
    });
    
    // Use filtered chunks or fallback to all chunks
    const chunksToUse = relevantChunks.length > 0 ? relevantChunks : chunks;
    
    context = `[EXTRACTOS PDF]
${chunksToUse.map((c, i) => `P${i+1} (${c.source}): ${c.text}`).join('\n\n')}`;
    dataSource = 'chunks_filtered';
  } else if (qa.length > 0) {
    context = `[Q&A]
${qa.map((q, i) => `Q${i+1}: ${q.q}
A${i+1}: ${q.a}`).join('\n\n')}`;
    dataSource = 'qa';
  } else {
    context = `[VACANTE]
id: ${vacante.id || ''}
titulo: ${vacante.title || ''}
ubicacion: ${vacante.location || ''}
tipo: ${vacante.employment_type || ''}
seniority: ${vacante.seniority || ''}
resumen: ${vacante.summary || ''}
funciones:
${(vacante.functions || []).map(f => '- ' + f).join('\n')}
requisitos:
${(vacante.requirements || []).map(r => '- ' + r).join('\n')}
nota_cultura: ${vacante.culture_note || ''}`;
    dataSource = 'vacante_fallback';
  }
};

console.log('Final context length:', context.length);
console.log('Data source:', dataSource);

// Ensure we always return something
if (!context.trim()) {
  context = `[VACANTE]
id: ${vacante.id || 'N/A'}
titulo: ${vacante.title || 'N/A'}
ubicacion: ${vacante.location || 'N/A'}
tipo: ${vacante.employment_type || 'N/A'}
seniority: ${vacante.seniority || 'N/A'}
resumen: ${vacante.summary || 'N/A'}
funciones: N/A
requisitos: N/A
nota_cultura: N/A`;
  dataSource = 'fallback';
}

return [{ 
  json: { 
    compiledContext: context, 
    questionType,
    dataSource
  } 
}];
