// Seleciona todos os heart-switch inputs
const hearts = document.querySelectorAll('.heart-switch input[type="checkbox"]');

hearts.forEach(input => {
  input.addEventListener('change', () => {
    // Se qualquer checkbox estiver marcado, adiciona .dark no body
    const anyChecked = Array.from(hearts).some(i => i.checked);
    document.body.classList.toggle('dark', anyChecked);
  });
});

// dispara uma vez ao carregar a página, pra respeitar checkboxes já marcados
window.addEventListener('DOMContentLoaded', () => {
  const anyChecked = Array.from(hearts).some(i => i.checked);
  document.body.classList.toggle('dark', anyChecked);
});
