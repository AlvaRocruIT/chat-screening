document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('videoModal');
  var video = document.getElementById('introVideo');
  var closeBtn = document.querySelector('.modal-close');
  var playBtn = document.getElementById('overlayPlay');

  var closeTimeoutId = null;

  function startCloseTimer() {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(closeModal, 40 * 1000);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    try { if (video) video.pause(); } catch (_) {}
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
  }

  function playWithSound() {
    if (!video) return;
    video.muted = false;
    video.controls = true;
    var p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        if (playBtn) playBtn.style.display = 'none';
        startCloseTimer();
      }).catch(function () {
        if (playBtn) playBtn.style.display = 'block';
      });
    } else {
      if (playBtn) playBtn.style.display = 'none';
      startCloseTimer();
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
      playWithSound();
    });
  }

  if (video) {
    video.addEventListener('ended', closeModal);
    // If user presses native play, ensure sound and timer
    video.addEventListener('play', function () {
      video.muted = false;
      video.controls = true;
      if (playBtn) playBtn.style.display = 'none';
      startCloseTimer();
    });
  }

  // Start paused, show overlay, do not autoplay
  if (modal) modal.classList.add('open');
  if (video) {
    video.pause();
    video.controls = false; // only show after play
  }
});
