const problemBullets = [
  "[Punto uno: Solamente un 15% del talento de alto desempeño, es también de alto potencial]",
  "[Punto dos: Usamos las mismas herramientas para seleccionar talento demostrado, que talento por despegar]",
  "[Punto tres: Estamos perdiendo oportunidades de contar con gente increíble que pasa desapercibida]"
];

const architectureComponents = [
  { title: "Interaz conversational", description: "En lenguaje natural, con memoria contextuaql y adaptado a tu estilo comunicacional", icon: "💬" },
  { title: "Captura de interacciones", description: "Seguimiento de comportamientos en tiempo real", icon: "📊" },
  { title: "Extracción de features", description: "Motor de reconocimiento de patrones en cadenas conversacionales", icon: "🔍" },
  { title: "Scoring y ranking", description: "Evaluación Multi-dimensional preswentado en esquema de ranking", icon: "⚡" },
  { title: "Recruiter Output", description: "Entrega de información estructurada para apoyar la toma de decisiones", icon: "📋" }
];

const signals = [
  "Response latency patterns",
  "Question reformulation",
  "Clarification requests",
  "Technical depth markers",
  "Communication precision"
];

const detectedPatterns = [
  "[Patrones de mentalidad de crecimiento]",
  "[Patrones de curiosidad intelectual]",
  "[Patrones de construcción del desafío]"
];

const chatMessages = [
  { role: "candidate", text: "[¡Hola! ¿bajo qué meétricas me van a medir?]" },
  { role: "system", text: "[Tus métricas de impacto para este desafío serán : A;B;C y D]" },
  { role: "candidate", text: "[Genial! ¿Y qué desafíos individuales esperan de un colaborador excepcional en este rol al cabo de un año?]" },
  { role: "system", text: "[¡Muy buena pregunta!💡 Nos encantaría que de aquí al próximo año seas capaz de...]" }
];

const currentStateItems = [
  "[1er Componente: Creamos un MVP de plataforma para la interfaz del usuario y también para seguimiento y reportería para prefiles de administrador]",
  "[2°  Componente two: Basamos nuestra hipótesis en metodologías basadas en evidencia en psicología comportamental]",
  "[3er Componente: Hemos creado las capcidades para saltar a un entorno de desarrollo, manteniendo estándares de calidad de cara al cliente]"
];

const whyNowItems = [
  { n: 1, title: "[+ Capacidad en interfaces conversacionales]", detail: "Los modelos actuales permiten interacciones más naturales, extensas y contextuales, facilitando la observación de patrones del lenguaje" },
  { n: 2, title: "[+ Capacidad de análisis de texto]", detail: "Hoy es viable estructurar y analizar conversaciones a escala, identificando patrones sin necesidad de instrumentación compleja" },
  { n: 3, title: "[Necesidad no resuelta en recruiting]", detail: "Las primeras etapas del funnel siguen siendo inciertas, en especial perfiles sin experiencia"}
];

function renderProblemBullets() {
  const root = document.getElementById("problemBullets");
  root.innerHTML = problemBullets.map(item => `
    <div class="bullet-item">
      <span class="bullet-dot"></span>
      <p>${item}</p>
    </div>
  `).join("");
}

function renderArchitecture() {
  const root = document.getElementById("architectureFlow");
  root.innerHTML = architectureComponents.map((c, idx) => `
    <article class="arch-item">
      <div class="arch-icon">${c.icon}</div>
      <div>
        <div class="arch-head">
          <span class="arch-index">[${idx + 1}]</span>
          <h4>${c.title}</h4>
        </div>
        <p>${c.description}</p>
      </div>
    </article>
  `).join("");
}

function renderSignals() {
  document.getElementById("signalsList").innerHTML = signals
    .map(s => `<div class="signal-pill">${s}</div>`)
    .join("");

  document.getElementById("detectedPatterns").innerHTML = detectedPatterns
    .map(p => `<li>${p}</li>`)
    .join("");
}

function renderChatExample() {
  const root = document.getElementById("chatExample");
  root.innerHTML = chatMessages
    .map(m => `<div class="msg ${m.role}">${m.text}</div>`)
    .join("");
}

function renderOpportunity() {
  document.getElementById("currentStateList").innerHTML = currentStateItems
    .map(item => `
      <div class="state-item">
        <span class="check">✔</span>
        <span>${item}</span>
      </div>
    `).join("");

  document.getElementById("whyNowGrid").innerHTML = whyNowItems
    .map(item => `
      <article class="why-item">
        <div class="why-num">${item.n}</div>
        <strong>${item.title}</strong>
        <p>${item.detail}</p>
      </article>
    `).join("");
}

function setupActions() {
  const downloadBtn = document.getElementById("downloadPdfBtn");
  downloadBtn?.addEventListener("click", () => window.print());
}

document.addEventListener("DOMContentLoaded", () => {
  renderProblemBullets();
  renderArchitecture();
  renderSignals();
  renderChatExample();
  renderOpportunity();
  setupActions();
});
