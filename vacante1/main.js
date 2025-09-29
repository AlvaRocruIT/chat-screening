// vacante1/main.js
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('videoModal');
  var video = document.getElementById('introVideo');
  var closeBtn = document.querySelector('.modal-close');
  var playBtn = document.getElementById('playWithSound');

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    try { if (video) video.pause(); } catch (_) {}
  }

  // Require user gesture to play with sound
  function startWithSound() {
    if (!video) return;
    video.muted = false;
    var p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        if (playBtn) playBtn.style.display = 'none';
      }).catch(function () {
        if (playBtn) playBtn.style.display = 'block';
      });
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      startWithSound();
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (playBtn) playBtn.style.display = 'none';
    });
    video.addEventListener('pause', function () {
      if (playBtn && video.currentTime === 0) playBtn.style.display = 'block';
    });
    video.addEventListener('ended', closeModal);
  }

  // Auto-cierre a los 40s desde apertura del modal
  setTimeout(closeModal, 40 * 1000);

  // Abre el modal al cargar, sin intentar reproducir automáticamente
  if (modal) modal.classList.add('open');
});
