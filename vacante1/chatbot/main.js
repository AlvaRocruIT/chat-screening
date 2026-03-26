// Elementos del DOM
//▶️ App shells
const app = document.getElementById("app");
const startScreen = document.getElementById("start-screen");
const chatScreen = document.getElementById("chat-screen");
const messages = document.getElementById("messages");
//▶️ Modal login
const loginOverlay = document.getElementById("loginOverlay");
const acceptBtn = document.getElementById("acceptBtn");
const backBtn = document.getElementById("backBtn");
//▶️ Inputs/botones (usa selectores por contenedor para evitar choques)
const startInput = document.querySelector("#start-screen textarea");
const startSendBtn = document.querySelector("#start-screen button");
const chatInput = document.querySelector("#chat-screen textarea");
const chatSendBtn = document.querySelector("#chat-screen button");

// UPDATE THESE URLs to match your current backend
const API_URL = "https://chatbot-backend-d5xj.onrender.com/chat";

function getVacanteIdFromPath() {
  const map = {
    'vacante1': 1,
    'vacante2': 2,
    'vacante3': 3
  };

  const key =
    new URLSearchParams(location.search).get("vacante") ||
    "vacante1";

  return map[key] || 1;
}

function getVacanteName() {
  const vacanteId = getVacanteIdFromPath();

  const vacanteMap = {
    1: 'Jefe/a Comercial - Talca',
    2: 'Analista de Compensaciones - Las Condes',
    3: 'Jefe/a de Transformación Digital'
  };

  return vacanteMap[vacanteId] || 'Vacante';
}

const payload = { 
  message: input, 
  session_id: sessionId,  
  vacante_id: getVacanteIdFromPath(), 
  user_name: localStorage.getItem("userName"),
  user_email: localStorage.getItem("userEmail")
};

function getPreferredEndpoint() {
  const params = new URLSearchParams(window.location.search);
  const env = (params.get("env") || params.get("mode") || "").toLowerCase();
  return env === "test" ? TEST_URL : PROD_URL;
}

function bindEnterToSend(textareaEl, sendFn) {
  if (!textareaEl) return;
  textareaEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendFn();
    }
  });
}

async function postToEndpoint(endpoint, payload, timeoutMs = 45000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: "cors",
    });
    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (_) {}
    return { response, data, raw };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Click botón
btn.addEventListener("click", sendMessage);

// Enter para enviar
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Cambio de escena (solo la primera vez)
  if (!app.classList.contains("chat-mode")) {
    start.style.display = "none";
    chat.classList.remove("hidden");
    app.classList.add("chat-mode");
  }

  addMessage(text, "user");
  input.value = "";

  // 👉 aquí después puedes conectar backend
  // sendToBackend(text);
}
// FUNCIONES------
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;

  messages.appendChild(div);

  // Auto scroll
  messages.scrollTop = messages.scrollHeight;
}
