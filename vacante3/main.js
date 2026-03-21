document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('videoModal');
  var video = document.getElementById('introVideo');
  var closeBtn = document.querySelector('.modal-close');
  var playBtn = document.getElementById('overlayPlay');
  var errorBox = document.getElementById('videoError');

  var closeTimeoutId = null;

  function showError() {
    if (errorBox) errorBox.style.display = 'block';
    if (playBtn) playBtn.style.display = 'block';
  }
  function hideError() {
    if (errorBox) errorBox.style.display = 'none';
  }
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

  function attemptPlayWithSound() {
    if (!video) return;
    hideError();
    video.muted = false;
    try { video.load(); } catch (_) {}

    var playPromise;
    try { playPromise = video.play(); }
    catch { showError(); return; }

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        if (playBtn) playBtn.style.display = 'none';
        video.controls = true;
        startCloseTimer();
      }).catch(function () {
        var onCanPlay = function () {
          video.removeEventListener('canplay', onCanPlay);
          try {
            video.play().then(function () {
              if (playBtn) playBtn.style.display = 'none';
              video.controls = true;
              startCloseTimer();
            }).catch(showError);
          } catch { showError(); }
        };
        video.addEventListener('canplay', onCanPlay, { once: true });
      });
    } else {
      if (playBtn) playBtn.style.display = 'none';
      video.controls = true;
      startCloseTimer();
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  if (playBtn) playBtn.addEventListener('click', function (e) { e.stopPropagation(); attemptPlayWithSound(); });

  if (video) {
    video.addEventListener('error', showError);
    video.addEventListener('stalled', showError);
    video.addEventListener('abort', showError);
    video.addEventListener('emptied', showError);
    video.addEventListener('play', function () { hideError(); if (playBtn) playBtn.style.display = 'none'; });
    video.addEventListener('ended', closeModal);
  }

  if (modal) modal.classList.add('open');
  if (video) {
    try { video.pause(); } catch {}
    video.controls = false;
    hideError();
    if (playBtn) playBtn.style.display = 'block';
  }
});
