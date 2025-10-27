const db = new PouchDB('personas');
const form = document.getElementById('personForm');
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const emailInput = document.getElementById('email');
const list = document.getElementById('personList');
const spinner = document.getElementById('spinner');


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.log('SW fallo:', err));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const persona = {
    _id: new Date().toISOString(),
    name: nameInput.value.trim(),
    age: ageInput.value.trim(),
    email: emailInput.value.trim()
  };

  if (!persona.name || !persona.age || !persona.email) {
    alert('Por favor completa todos los campos.');
    return;
  }

  try {
    await db.put(persona);
    form.reset();
    renderPersonas();
  } catch (err) {
    console.error('Error al guardar persona:', err);
  }
});


async function renderPersonas() {
  list.innerHTML = '';
  const result = await db.allDocs({ include_docs: true, descending: true });
  result.rows.forEach(row => {
    const p = row.doc;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-content">
        <strong>${p.name}</strong><br>
        Edad: ${p.age}<br>
        Email: ${p.email}
      </div>
      <button class="delete-btn" data-id="${p._id}" data-rev="${p._rev}">🗑️</button>
    `;
    list.appendChild(card);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', deletePerson);
  });
}

async function deletePerson(e) {
  const id = e.target.dataset.id;
  const rev = e.target.dataset.rev;

  if (!confirm('¿Deseas eliminar esta persona?')) return;

  spinner.classList.remove('hidden');

  try {
    await db.remove(id, rev);
    setTimeout(() => { 
      spinner.classList.add('hidden');
      renderPersonas();
    }, 800);
  } catch (err) {
    spinner.classList.add('hidden');
    console.error('Error al eliminar:', err);
  }
}

renderPersonas();
