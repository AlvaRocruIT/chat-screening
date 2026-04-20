const problemBullets = [
  "Punto uno: Solo una parte del talento de alto desempeño refleja alto potencial futuro]",
  "Punto dos: Usamos herramientas para evaluar trayectoria en perfiles que aún no la tienen",
  "Punto tres: Estamos dejando fuera talento con alta capacidad y que no logra diferenciarse en esquemas tradicionales"
];

const architectureComponents = [
  { title: "Interaz conversational", description: "En lenguaje natural, con memoria contextuaql y adaptado a tu estilo comunicacional", icon: "💬" },
  { title: "Captura de interacciones", description: "Seguimiento de comportamientos en tiempo real", icon: "📊" },
  { title: "Extracción de features", description: "Motor de reconocimiento de patrones en cadenas conversacionales", icon: "🔍" },
  { title: "Scoring y ranking", description: "Evaluación Multi-dimensional preswentado en esquema de ranking", icon: "⚡" },
  { title: "Recruiter Output", description: "Entrega de información estructurada para apoyar la toma de decisiones", icon: "📋" }
];

const signals = [
  "Reformulación de preguntas",
  "Profundidad progresiva",
  "Solicitudes de clarificación",
  "Presición en la comunicación",
  "Evolución en el foco de la conversación"
];

const detectedPatterns = [
  "Patrones de intención de desarrollo",
  "Patrones de curiosidad intelectual",
  "Patrones evolución del entendimiento sobre el desafío"
];

const chatMessages = [
  { role: "candidate", text: "¡Hola! ¿bajo qué meétricas me van a medir?" },
  { role: "system", text: "[Tus métricas de impacto para este desafío serán : 🏋🏻💼📋" },
  { role: "candidate", text: "Genial! ¿Y qué desafíos individuales esperan de un colaborador excepcional en este rol al cabo de un año?" },
  { role: "system", text: "¡Excelente pregunta! Nos encantaría que de aquí al próximo año seas capaz de 📈🚀🏆" }
];

const currentStateItems = [
  "MVP funcional de interfaz y reportería",
  "Hipótesis basada en enfoques de psicología comportmental",
  "Capacidades de escalar hacia un entorno de desarrollo operacional"
];

const whyNowItems = [
  { n: 1, title: "Interfaces conversacionales más avanzadas", detail: "Permiten interacciones más naturales y profundas"},
  { n: 2, title: "Mejor capacidad de análisis de lenguaje", detail: "Hoy es viable estructurar y analizar conversaciones automatizadas y customizadas"},
  { n: 3, title: "Necesidad aun no resuelta", detail: "Las primeras etapas del funnel siguen operando con inciertidumbre"}
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
