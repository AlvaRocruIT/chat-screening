const startScreen = document.getElementById('start-screen');
const chatScreen = document.getElementById('chat-screen');

const btnStart = document.getElementById('btn-start');
const inputStart = document.getElementById('input-start');

btnStart.onclick = () => {
  if (!inputStart.value.trim()) return;

  startScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
};
