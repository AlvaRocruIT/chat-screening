const startScreen = document.getElementById("start-screen");
const chatScreen = document.getElementById("chat-screen");

const btnStart = document.getElementById("btn-start");
const inputStart = document.getElementById("input-start");

const messages = document.getElementById("messages");

btnStart.addEventListener("click", function () {
  const text = inputStart.value.trim();
  if (!text) return;

  startScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  addMessage(text, "user");
  inputStart.value = "";
});

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  messages.appendChild(div);
}
