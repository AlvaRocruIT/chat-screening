// --- Question Router Node ---

// 1️⃣ Obtener input del nodo anterior
let questionText = $('Carry Text')?.item?.json?.text || '';
let vacante = $('Carry Text')?.item?.json?.vacante || null;

// 2️⃣ Normalizar texto
questionText = questionText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// 3️⃣ Definir keywords
const companyKeywords = ['empresa', 'organización', 'cultura', 'negocio'];
const roleKeywords = ['rol', 'función', 'puesto', 'responsabilidad', 'tarea'];

// 4️⃣ Función de scoring simple
function countKeywords(text, keywords) {
    return keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
}

const companyScore = countKeywords(questionText, companyKeywords);
const roleScore = countKeywords(questionText, roleKeywords);

// 5️⃣ Determinar questionType
let questionType = 'company'; // fallback default

if (vacante) {
    questionType = 'role';
} else if (companyScore > 0 && roleScore > 0) {
    questionType = 'mixed';
} else if (roleScore > 0) {
    questionType = 'role';
} else if (companyScore > 0) {
    questionType = 'company';
}

// 6️⃣ Output estandarizado
return [
    {
        json: {
            question: questionText,
            vacante: vacante,
            questionType: questionType
        }
    }
];
