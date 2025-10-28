// Elementos del DOM
const inputBox = document.getElementById("userInput");
const currentResponse = document.getElementById("currentResponse");
const historyBox = document.getElementById("historyBox");
const sendBtn = document.getElementById("sendBtn");

// UPDATE THESE URLs to match your new n8n webhook
const PROD_URL = "https://alvarovargas.app.n8n.cloud/webhook/ac234336-390d-438a-aad6-284a5290743d/chat?action=sendMessage";
const TEST_URL = "https://alvarovargas.app.n8n.cloud/webhook-test/ac234336-390d-438a-aad6-284a5290743d/chat?action=sendMessage";

function getVacanteIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  console.log('🔍 URL parts:', parts);
  
  const explicit =
     parts.find((p) => /^vacante[0-9]+$/i.test(p)) ||
    (parts.includes("vacante1") ? "vacante1" : null) ||
    (parts.includes("vacante2") ? "vacante2" : null);
  
  const result = (
    new URLSearchParams(location.search).get("vacante") ||
    explicit ||
    "vacante1"
  );
  
  console.log('🎯 Vacante ID detected:', result);
  return result;
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

  historyBox.value = localStorage.getItem("chatHistory") || "";
  historyBox.style.display = "none";

  inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

function getVacanteName() {
  const vacanteId = getVacanteIdFromPath();
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

   const payload = { 
    chatInput: input, 
    vacante: getVacanteName()  // ← Top level, full name
  };
  let endpoint = getPreferredEndpoint();

  try {
    let { response, data, raw } = await postToEndpoint(endpoint, payload);

    if (response.status === 404 && endpoint === PROD_URL) {
      ({ response, data, raw } = await postToEndpoint(TEST_URL, payload));
      endpoint = TEST_URL;
    }

    if (!response.ok) {
      const detail = data?.message || raw || `HTTP ${response.status}`;
      throw new Error(detail);
    }

    const reply =
      (data &&
        (data.respuesta ||
          data.output ||
          data.reply ||
          data.message ||
          data.text)) ||
      raw ||
      "No se recibió respuesta.";

    const updatedHistory =
      previous + `\n👤 Tú: ${input}\n🤖 PartnerBot: ${reply}\n`;
    currentResponse.value = reply;
    historyBox.value = updatedHistory;
    localStorage.setItem("chatHistory", updatedHistory);
  } catch (error) {
    const msg = String(error?.message || error || "Error desconocido");
    let hint = "";

    if (msg.includes("webhook") || msg.includes("404")) {
      if (endpoint === PROD_URL) {
        hint =
          "Activa el workflow en n8n (producción). Para pruebas usa ?env=test y pulsa ‘Execute workflow’ en n8n antes de enviar.";
      } else {
        hint =
          "Pulsa ‘Execute workflow’ en n8n para habilitar temporalmente el webhook de prueba (?env=test).";
      }
    } else if (msg.includes("AbortError")) {
      hint = "Se agotó el tiempo de espera. El servidor tardó demasiado en responder.";
    }

    const fallback = `Hmm... algo no salió bien 🤔. ${hint}`.trim();
    const updatedHistory =
      previous + `\n👤 Tú: ${input}\n🤖 PartnerBot: ${fallback}\n`;
    currentResponse.value = fallback;
    historyBox.value = updatedHistory;
    localStorage.setItem("chatHistory", updatedHistory);
  } finally {
    inputBox.value = "";
    if (sendBtn) sendBtn.disabled = false;
  }
}

function toggleHistory() {
  const btn = document.getElementById("toggleHistoryBtn");
  const isHidden = historyBox.style.display === "none";
  historyBox.style.display = isHidden ? "block" : "none";
  if (btn) btn.textContent = isHidden ? "Ocultar historial" : "Mostrar historial";
}

window.sendMessage = sendMessage;
window.toggleHistory = toggleHistory;
