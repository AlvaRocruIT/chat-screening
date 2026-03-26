// Elementos del DOM
const app = document.getElementById("app");
const start = document.getElementById("start-screen");
const chat = document.getElementById("chat-screen");
const input = document.getElementById("chat-input");
const btn = document.getElementById("send-btn");
const messages = document.getElementById("messages");

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
