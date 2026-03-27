// Elementos del DOM
//▶️ App shells
const app = document.getElementById("app");
const startScreen = document.getElementById("start-screen");
const chatScreen = document.getElementById("chat-screen");
const messages = document.getElementById("messages");
//▶️ Modal login
const loginOverlay = document.getElementById("loginOverlay");
const backBtn = document.getElementById("backBtn");
const acceptBtn = document.getElementById("acceptBtn");
const infoToggleBtn = document.getElementById("infoToggleBtn");
const consentInfoBox = document.getElementById("consentInfoBox");
const loginName = document.getElementById("loginName");
const loginEmail = document.getElementById("loginEmail");
//▶️ Inputs/botones (usa selectores por contenedor para evitar choques)
const startInput = document.getElementById("chat-input-start");
const startSendBtn = document.getElementById("send-btn-start");
const chatInput = document.getElementById("chat-input-chat");
const chatSendBtn = document.getElementById("send-btn-chat");;

const API_URL = "https://chatbot-backend-d5xj.onrender.com/chat";
const nameRegex = /^[\p{L}]+(?:[\s'’\-][\p{L}]+)*$/u;
const emailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]{2,}\.)?[A-Za-z0-9-]{2,}\.[A-Za-z]{2,}$/;

let isSending = false;

function getVacanteIdFromPath() {
  const map = { vacante1: 1, vacante2: 2, vacante3: 3 };
  const key = new URLSearchParams(location.search).get("vacante") || "vacante1";
  return map[key] || 1;
}

function getPreferredEndpoint() {
  return API_URL;
}

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

function buildPayload(messageText) {
  return {
    message: messageText,
    session_id: getOrCreateSessionId(),
    vacante_id: getVacanteIdFromPath(),
    user_name: localStorage.getItem("userName"),
    user_email: localStorage.getItem("userEmail"),
  };
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
    } catch {
      // respuesta no-JSON
    }

    return { response, data, raw };
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractBotText(data, raw) {
  return (
    data?.reply ||
    data?.message ||
    data?.response ||
    data?.output ||
    data?.text ||
    raw ||
    "Sin respuesta del servidor."
  );
}

function addMessage(text, type) {
  if (!messages) return null;
  const bubble = document.createElement("div");
  bubble.className = `msg ${type}`;
  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function showTypingBubble() {
  if (!messages) return null;
  const bubble = document.createElement("div");
  bubble.className = "msg bot typing";
  bubble.setAttribute("aria-label", "El chatbot está escribiendo");
  bubble.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function removeTypingBubble(node) {
  if (node && node.parentNode) node.parentNode.removeChild(node);
}

function enterChatModeIfNeeded() {
  if (!app || !startScreen || !chatScreen) return;
  if (!app.classList.contains("chat-mode")) {
    startScreen.style.display = "none";
    chatScreen.classList.remove("hidden");
    app.classList.add("chat-mode");
  }
}

function getActiveInput() {
  if (!app) return startInput || chatInput;
  return app.classList.contains("chat-mode") ? chatInput : startInput;
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

// ===============================
// Modal logic
// ===============================
async function handleAccept() {
  const name = loginName?.value.trim() || "";
  const email = loginEmail?.value.trim() || "";

  if (!name || !email) {
    alert("Por favor completa ambos campos antes de continuar.");
    return;
  }

  if (!nameRegex.test(name)) {
    alert("Ingresa un nombre válido.");
    return;
  }

  if (!emailRegex.test(email)) {
    alert("Ingresa un correo válido.");
    return;
  }

  // nueva sesión por cada aceptación
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  localStorage.setItem("sessionId", sessionId);
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
  localStorage.removeItem("chatHistory");

  loginOverlay?.setAttribute("hidden", "");
  app?.removeAttribute("aria-hidden");
}

// ===============================
// Chat flow
// ===============================
async function sendMessage() {
  if (isSending) return;

  const activeInput = getActiveInput();
  const text = (activeInput?.value || "").trim();
  if (!text) return;

  enterChatModeIfNeeded();
  addMessage(text, "user");
  activeInput.value = "";

  const payload = buildPayload(text);
  let typingNode = null;

  try {
    isSending = true;
    typingNode = showTypingBubble();

    const { response, data, raw } = await postToEndpoint(getPreferredEndpoint(), payload);
    removeTypingBubble(typingNode);

    if (!response.ok) {
      addMessage(`Error del servidor (${response.status}).`, "bot");
      return;
    }

    const botText = extractBotText(data, raw);
    addMessage(botText, "bot");
  } catch (err) {
    removeTypingBubble(typingNode);
    addMessage("Hubo un problema de conexión. Intenta nuevamente.", "bot");
  } finally {
    isSending = false;
  }
}

    const botText = extractBotText(data, raw);
    addMessage(botText, "bot");
  } catch (err) {
    addMessage("Hubo un problema de conexión. Intenta nuevamente.", "bot");
  } finally {
    isSending = false;
  }
}

// ===============================
// Event bindings
// ===============================
acceptBtn?.addEventListener("click", handleAccept);

backBtn?.addEventListener("click", () => {
  window.location.href = "/chat-screening/vacante1/index.html";
});

loginEmail?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleAccept();
  }
});

infoToggleBtn?.addEventListener("click", () => {
  if (!consentInfoBox) return;
  const isHidden = consentInfoBox.hasAttribute("hidden");

  if (isHidden) {
    consentInfoBox.removeAttribute("hidden");
    infoToggleBtn.setAttribute("aria-expanded", "true");
  } else {
    consentInfoBox.setAttribute("hidden", "");
    infoToggleBtn.setAttribute("aria-expanded", "false");
  }
});

startSendBtn?.addEventListener("click", sendMessage);
chatSendBtn?.addEventListener("click", sendMessage);

bindEnterToSend(startInput, sendMessage);
bindEnterToSend(chatInput, sendMessage);
