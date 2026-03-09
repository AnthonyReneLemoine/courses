import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const formEl = document.getElementById('add-form');
const clearBtn = document.getElementById('clear-btn');

if (!window.FIREBASE_CONFIG) {
  statusEl.textContent = 'Configuration Firebase manquante. Voir README.';
  throw new Error('FIREBASE_CONFIG manquant.');
}

const app = initializeApp(window.FIREBASE_CONFIG);
const db = getFirestore(app);
const itemsRef = collection(db, 'shoppingItems');

function fmtDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function render(items) {
  listEl.innerHTML = '';

  if (!items.length) {
    statusEl.textContent = 'Liste vide.';
    return;
  }

  statusEl.textContent = `${items.length} article(s)`;

  for (const item of items) {
    const li = document.createElement('li');
    li.className = `item ${item.bought ? 'done' : ''}`;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'item-check';
    check.checked = Boolean(item.bought);
    check.addEventListener('change', () => toggleItem(item.id, check.checked));

    const main = document.createElement('div');
    main.className = 'item-main';

    const title = document.createElement('p');
    title.className = 'item-title';
    title.textContent = item.product;

    const meta = document.createElement('p');
    meta.className = 'item-meta';
    meta.textContent = `${item.quantity || '1'} • ${item.store || 'Autre'} • Ajouté ${fmtDate(item.createdAt)}`;

    main.append(title, meta);
    li.append(check, main);
    listEl.append(li);
  }
}

async function loadItems() {
  statusEl.textContent = 'Chargement...';
  const q = query(itemsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render(items);
}

async function addItem(event) {
  event.preventDefault();

  const product = document.getElementById('product').value.trim();
  if (!product) return;

  const quantity = document.getElementById('quantity').value.trim() || '1';
  const store = document.getElementById('store').value;

  await addDoc(itemsRef, {
    product,
    quantity,
    store,
    bought: false,
    createdAt: new Date().toISOString()
  });

  formEl.reset();
  document.getElementById('product').focus();
  await loadItems();
}

async function toggleItem(id, bought) {
  await updateDoc(doc(db, 'shoppingItems', id), { bought });
  await loadItems();
}

async function clearBought() {
  const q = query(itemsRef);
  const snap = await getDocs(q);
  const jobs = snap.docs
    .filter((d) => d.data().bought === true)
    .map((d) => deleteDoc(doc(db, 'shoppingItems', d.id)));

  await Promise.all(jobs);
  await loadItems();
}

formEl.addEventListener('submit', addItem);
clearBtn.addEventListener('click', clearBought);

loadItems().catch((error) => {
  statusEl.textContent = `Erreur: ${error.message}`;
});
