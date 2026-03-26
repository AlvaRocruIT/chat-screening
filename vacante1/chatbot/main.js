// Elementos del DOM
const app = document.getElementById("app");
const start = document.getElementById("start-screen");
const chat = document.getElementById("chat-screen");
const input = document.getElementById("chat-input");
const btn = document.getElementById("send-btn");
const messages = document.getElementById("messages");

// UPDATE THESE URLs to match your current backend
const PROD_URL = "https://chatbot-backend-d5xj.onrender.com/chat";
const TEST_URL = "https://chatbot-backend-d5xj.onrender.com/chat";

btn.onclick = () => {
  const text = input.value.trim();
  if (!text) return;

  /* 🔥 CAMBIO DE ESCENA REAL */
  start.style.display = "none";
  chat.classList.remove("hidden");
  app.classList.add("chat-mode");

  addMessage(text, "user");
  input.value = "";
};

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
}
