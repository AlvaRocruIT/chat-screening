const problemBullets = [
  "[Problem point one: specific, measurable observation]",
  "[Problem point two: contrasting limitation or gap]",
  "[Problem point three: consequence or missed opportunity]"
];

const architectureComponents = [
  { title: "Conversational Interface", description: "Natural language interaction layer", icon: "💬" },
  { title: "Interaction Capture", description: "Real-time behavioral tracking", icon: "📊" },
  { title: "Feature Extraction", description: "Pattern recognition engine", icon: "🔍" },
  { title: "Scoring Layer", description: "Multi-dimensional evaluation", icon: "⚡" },
  { title: "Recruiter Output", description: "Structured insights delivery", icon: "📋" }
];

const signals = [
  "Response latency patterns",
  "Question reformulation",
  "Clarification requests",
  "Technical depth markers",
  "Communication precision"
];

const detectedPatterns = [
  "[Detected pattern one]",
  "[Detected pattern two]",
  "[Detected pattern three]"
];

const chatMessages = [
  { role: "system", text: "[System prompt or initial question]" },
  { role: "candidate", text: "[Candidate response demonstrating behavior]" },
  { role: "system", text: "[Follow-up probe]" },
  { role: "candidate", text: "[Candidate elaboration with signals]" }
];

const currentStateItems = [
  "[Component one: what's built]",
  "[Component two: what's validated]",
  "[Component three: current capability]"
];

const whyNowItems = [
  { n: 1, title: "[Enabling factor one]", detail: "Brief explanation" },
  { n: 2, title: "[Enabling factor two]", detail: "Brief explanation" },
  { n: 3, title: "[Enabling factor three]", detail: "Brief explanation" }
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
