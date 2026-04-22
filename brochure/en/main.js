const problemBullets = [
  "Point one: Only a portion of high-performing talent reflects high future potential",
  "Point two: We use tools designed to evluate background on profiles that do not yet have one",
  "Point three: We are leaving out high capacity talent that fails to differentiate within traditional frameworks"
];

const architectureComponents = [
  { title: "Conversational interface", description: "In natural language, with contextual memory and adapted to your comunicational style", icon: "💬" },
  { title: "Interaction capture", description: "Traking behaviors in real time", icon: "📊" },
  { title: "Feature extraction", description: "Pattern recognition engine applied to conversational sequences", icon: "🔍" },
  { title: "Scoring & Ranking", description: "Multi-dimensional evaluation presented un a ranking format", icon: "⚡" },
  { title: "Recruiter Output", description: "Delivery of structured information to support decision making", icon: "📋" }
];

const signals = [
  "Question reformulación",
  "Progressive depth",
  "Clarification request",
  "Precision in comunication",
  "Evolution in conversational focus"
];

const detectedPatterns = [
  "Patterns of development intent",
  "Patterns of intellectual curiosity",
  "Patterns in the evolution of understanding regarding the challenge"
];

const chatMessages = [
  { role: "candidate", text: "Hi! Under what metrics will I be evaluated?" },
  { role: "system", text: "Your impact metrics for this challenge will be: 🏋🏻💼📋" },
  { role: "candidate", text: "Great! And what individual challenges would you expect from an exceptional contributor in this role after one year?" },
  { role: "system", text: "¡Excellent question! By next year, we would love for you to be able to 📈🚀🏆" }
];

const currentStateItems = [
  "Functionalm MVP of interface and reporting",
  "Hypothesis based on behavioral psichology approaches",
  "Capability to scale toward an operational development environment"
];

const whyNowItems = [
  { n: 1, title: "More advanced conversational interfaces", detail: "Enable more natural and deeper interactions"},
  { n: 2, title: "Improved language analysis capabilities", detail: "It is now feasible to structure and analyze automated ad customized conversations"},
  { n: 3, title: "An unresolved need", detail: "Early stages of the funnel still operate with uncertainty"}
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
