// vacante1/main.js
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('videoModal');
  var video = document.getElementById('introVideo');
  var closeBtn = document.querySelector('.modal-close');

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    try {
      if (video) {
        video.pause();
      }
    } catch (_) {}
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    try {
      if (video) {
        video.currentTime = 0;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(function () {});
        }
      }
    } catch (_) {}
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (video) {
    video.addEventListener('ended', closeModal);
  }

  // Auto-cierre a los 40s
  var AUTO_CLOSE_MS = 40 * 1000;
  setTimeout(closeModal, AUTO_CLOSE_MS);

  // Abre el modal al cargar
  openModal();
});
