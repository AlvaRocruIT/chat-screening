<script>
  const bannerModal = document.getElementById('bannerModal');
  const closeBtn = document.getElementById('closeBanner');

  // Mostrar banner al cargar la página
  window.addEventListener('load', () => {
    bannerModal.style.display = 'flex';
  });

  // Cerrar banner al hacer click en la X
  closeBtn.addEventListener('click', () => {
    bannerModal.style.display = 'none';
  });
</script>
