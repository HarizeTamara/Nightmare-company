// Seleciona todos os heart-switch inputs
const hearts = document.querySelectorAll('.heart-switch input[type="checkbox"]');

// Função para aplicar tema baseado no localStorage
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark';

  document.body.classList.toggle('dark', isDark);

  // Atualiza todos os checkboxes com base no tema salvo
  hearts.forEach(input => {
    input.checked = isDark;
  });
}

// Quando um checkbox for alterado
hearts.forEach(input => {
  input.addEventListener('change', () => {
    const anyChecked = Array.from(hearts).some(i => i.checked);

    document.body.classList.toggle('dark', anyChecked);
    localStorage.setItem('theme', anyChecked ? 'dark' : 'light');
  });
});

// Aplica o tema salvo ao carregar a página
window.addEventListener('DOMContentLoaded', applySavedTheme);
