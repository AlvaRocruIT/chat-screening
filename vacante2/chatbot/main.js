// Elementos del DOM
const inputBox = document.getElementById("userInput");
const currentResponse = document.getElementById("currentResponse");
const historyBox = document.getElementById("historyBox");
const sendBtn = document.getElementById("sendBtn");

// UPDATE THESE URLs to match your new n8n webhook
const PROD_URL = "https://chatbot-backend-d5xj.onrender.com/chat";
const TEST_URL = "https://chatbot-backend-d5xj.onrender.com/chat";

function getVacanteName() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const explicit =
    parts.find((p) => /^vacante[0-9]+$/i.test(p)) ||
    (parts.includes("vacante1") ? "vacante1" : null) ||
    (parts.includes("vacante2") ? "vacante2" : null);
  return (
    new URLSearchParams(location.search).get("vacante") ||
    explicit ||
    "vacante1"
  );
}

function getPreferredEndpoint() {
  const params = new URLSearchParams(window.location.search);
  const env = (params.get("env") || params.get("mode") || "").toLowerCase();
  return env === "test" ? TEST_URL : PROD_URL;
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

document.addEventListener("DOMContentLoaded", () => {
  sendBtn.addEventListener("click", sendMessage);
  document.getElementById("toggleHistoryBtn").addEventListener("click", toggleHistory);

  const infoToggleBtn = document.getElementById("infoToggleBtn");
  if (infoToggleBtn) {
    infoToggleBtn.addEventListener("click", toggleConsentInfo);
  }
  
  historyBox.value = localStorage.getItem("chatHistory") || "";

  inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

function getVacanteName() {
  const vacanteId = getVacanteName();
  const vacanteMap = {
    'vacante1': 'Jefe/a Comercial - Talca',
    'vacante2': 'Analista de Compensaciones - Las Condes'
  };
  return vacanteMap[vacanteId] || 'Jefe/a Comercial - Talca';
}

async function sendMessage() {
  const input = inputBox.value.trim();
  if (!input) {
    currentResponse.value = "¿Podrías escribir una pregunta o comentario?";
    return;
  }

  const previous = localStorage.getItem("chatHistory") || "";
  currentResponse.value = "🤖 Pensando...";
  if (sendBtn) sendBtn.disabled = true;

  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }

  const payload = { 
     message: input, 
     session_id: sessionId,  
     vacante: getVacanteName(),
     user_name: localStorage.getItem("userName"),
     user_email: localStorage.getItem("userEmail")
  };

  let endpoint = getPreferredEndpoint();

  console.log('=== DEBUG - Sending payload ===');
  console.log(payload);
  console.log('Payload as JSON:', JSON.stringify(payload));

  try {

    let { response, data, raw } = await postToEndpoint(endpoint, payload);

    if (!response.ok) {
      const detail = data?.message || raw || `HTTP ${response.status}`;
      throw new Error(detail);
    }

    let reply = data?.response || raw?.trim() || "";
      if (!reply && data) {
      reply = data.response || "";
    }
      if (!reply) {
      reply = "No se recibió respuesta.";
    }

    const updatedHistory =
      previous + `\n👤 Tú: ${input}\n🤖 ChatScreening: ${reply}\n`;
    currentResponse.value = reply.replace(/\\n/g, "\n");
    historyBox.value = updatedHistory;
    localStorage.setItem("chatHistory", updatedHistory);
  } catch (error) {
    const msg = String(error?.message || error || "Error desconocido");
    let hint = "";

    if (msg.includes("webhook") || msg.includes("404")) {
      if (endpoint === PROD_URL) {
        hint =
          "Activa el workflow en n8n (producción). Para pruebas usa ?env=test y pulsa 'Execute workflow' en n8n antes de enviar.";
      } else {
        hint =
          "Pulsa 'Execute workflow' en n8n para habilitar temporalmente el webhook de prueba (?env=test).";
      }
    } else if (msg.includes("AbortError")) {
      hint = "Se agotó el tiempo de espera. El servidor tardó demasiado en responder.";
    }

    const fallback = `Hmm... algo no salió bien 🤔. ${hint}`.trim();
    const updatedHistory =
      previous + `\n👤 Tú: ${input}\n🤖 ChatScreening: ${fallback}\n`;
    currentResponse.value = fallback;
    historyBox.value = updatedHistory;
    localStorage.setItem("chatHistory", updatedHistory);
  } finally {
    inputBox.value = "";
    if (sendBtn) sendBtn.disabled = false;
  }
}

function toggleHistory() {
  const historyBox = document.getElementById("historyBox");
  const btn = document.getElementById("toggleHistoryBtn");
  if (!historyBox || !btn) return;

  const isHidden = !historyBox.classList.contains("show");
  historyBox.classList.toggle("show", isHidden);
  btn.textContent = isHidden ? "Ocultar historial" : "Mostrar historial";
}

function toggleConsentInfo() {
  const consentInfoBox = document.getElementById("consentInfoBox");
  const infoToggleBtn = document.getElementById("infoToggleBtn");
  
  if (!consentInfoBox || !infoToggleBtn) return;

  const isHidden = consentInfoBox.hasAttribute("hidden");
  
  if (isHidden) {
    consentInfoBox.removeAttribute("hidden");
    infoToggleBtn.setAttribute("aria-expanded", "true");
    infoToggleBtn.textContent = "⁉️ ¿Para qué necesitan estos datos? ⁉️";
  } else {
    consentInfoBox.setAttribute("hidden", "");
    infoToggleBtn.setAttribute("aria-expanded", "false");
    infoToggleBtn.textContent = "⁉️ ¿Para qué necesitan estos datos? ⁉️";
  }
}

window.sendMessage = sendMessage;
window.toggleHistory = toggleHistory;
