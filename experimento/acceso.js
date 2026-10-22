async function sendAccess(action, values) {
  const response = await fetch('api/index.php?action=' + action, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
  return result;
}
const note = document.getElementById('form-note');
note.textContent = 'Inicia sesión o crea una cuenta para guardar tus cuentos favoritos y tu avance de lectura.';
lucide.createIcons();
const tabs = [document.getElementById('login-tab'), document.getElementById('register-tab')];
const panels = [document.getElementById('login-panel'), document.getElementById('register-panel')];
tabs.forEach((tab, index) => tab.addEventListener('click', () => {
  tabs.forEach((item, i) => { item.setAttribute('aria-selected', String(i === index)); item.classList.toggle('bg-[#087f83]', i === index); item.classList.toggle('text-white', i === index); item.classList.toggle('text-[#075985]', i !== index); });
  panels.forEach((panel, i) => { panel.hidden = i !== index; panel.classList.toggle('hidden', i !== index); });
}));
document.getElementById('login-panel').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await sendAccess('login', Object.fromEntries(new FormData(form)));
    note.textContent = '¡Hola, ' + result.user.name + '! Ya puedes guardar favoritos y avances.';
    note.className = 'mt-5 rounded-2xl bg-[#e5f5ef] p-3 text-center text-sm font-bold text-[#075985]';
  } catch (error) {
    note.textContent = error.message;
    note.className = 'mt-5 rounded-2xl bg-[#fff1dc] p-3 text-center text-sm font-bold text-[#73512e]';
  } finally { button.disabled = false; }
});
document.getElementById('register-panel').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(form));
    const result = await sendAccess('register', { name: values.name, email: values.email, password: values.password, accountType: 'familia' });
    note.textContent = '¡Bienvenida, ' + result.user.name + '! Tu cuenta ya está lista.';
    note.className = 'mt-5 rounded-2xl bg-[#e5f5ef] p-3 text-center text-sm font-bold text-[#075985]';
  } catch (error) {
    note.textContent = error.message;
    note.className = 'mt-5 rounded-2xl bg-[#fff1dc] p-3 text-center text-sm font-bold text-[#73512e]';
  } finally { button.disabled = false; }
});
