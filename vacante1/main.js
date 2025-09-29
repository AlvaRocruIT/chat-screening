// vacante1/main.js
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('videoModal');
  var video = document.getElementById('introVideo');
  var closeBtn = document.querySelector('.modal-close');
  var errorBox = document.getElementById('videoError');

  function showError() {
    if (errorBox) errorBox.style.display = 'block';
  }
  function hideError() {
    if (errorBox) errorBox.style.display = 'none';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    try { if (video) video.pause(); } catch (_) {}
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    hideError();
    if (!video) return;
    try {
      video.currentTime = 0;
      var p = video.play();
      if (p && typeof p.then === 'function') {
        p.catch(function () {
          // Autoplay bloqueado: deja controles visibles para que el usuario pulse Play
        });
      }
    } catch (_) {}
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  if (video) {
    ['error','stalled','abort','emptied'].forEach(function (ev) {
      video.addEventListener(ev, showError);
    });
    video.addEventListener('canplay', hideError);
    video.addEventListener('ended', closeModal);
    // Si carga pero se queda negro, intenta reproducir al estar listo
    video.addEventListener('loadeddata', function () {
      if (video.paused) {
        try { video.play().catch(function () {}); } catch (_) {}
      }
    });
  }

  // Auto-cierre a los 40s
  setTimeout(closeModal, 40 * 1000);

  // Abre el modal al cargar
  openModal();
});
