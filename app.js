import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const statusEl = document.getElementById('status');
const listEl = document.getElementById('list');
const formEl = document.getElementById('add-form');
const clearBtn = document.getElementById('clear-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfoEl = document.getElementById('user-info');

if (!window.FIREBASE_CONFIG) {
  statusEl.textContent = 'Configuration Firebase manquante. Voir README.';
  throw new Error('FIREBASE_CONFIG manquant.');
}

const app = initializeApp(window.FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const itemsRef = collection(db, 'shoppingItems');
let currentUser = null;

function setFormEnabled(enabled) {
  for (const el of formEl.querySelectorAll('input,button')) {
    el.disabled = !enabled;
  }
  clearBtn.disabled = !enabled;
}

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
    meta.textContent = `${item.quantity || '1'} • Ajouté ${fmtDate(item.createdAt)}`;

    main.append(title, meta);
    li.append(check, main);
    listEl.append(li);
  }
}

async function loadItems() {
  if (!currentUser) {
    listEl.innerHTML = '';
    statusEl.textContent = 'Connectez-vous pour voir vos articles.';
    return;
  }

  statusEl.textContent = 'Chargement...';
  const q = query(itemsRef, where('uid', '==', currentUser.uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render(items);
}

async function addItem(event) {
  event.preventDefault();
  if (!currentUser) return;

  const product = document.getElementById('product').value.trim();
  if (!product) return;

  const quantity = document.getElementById('quantity').value.trim() || '1';
  await addDoc(itemsRef, {
    uid: currentUser.uid,
    product,
    quantity,
    bought: false,
    createdAt: new Date().toISOString()
  });

  formEl.reset();
  document.getElementById('product').focus();
  await loadItems();
}

async function toggleItem(id, bought) {
  if (!currentUser) return;
  await updateDoc(doc(db, 'shoppingItems', id), { bought });
  await loadItems();
}

async function clearBought() {
  if (!currentUser) return;
  const q = query(itemsRef, where('uid', '==', currentUser.uid));
  const snap = await getDocs(q);
  const jobs = snap.docs
    .filter((d) => d.data().bought === true)
    .map((d) => deleteDoc(doc(db, 'shoppingItems', d.id)));

  await Promise.all(jobs);
  await loadItems();
}

async function login() {
  await signInWithPopup(auth, provider);
}

async function logout() {
  await signOut(auth);
}

function applyAuthUi(user) {
  const isLoggedIn = Boolean(user);
  setFormEnabled(isLoggedIn);
  loginBtn.hidden = isLoggedIn;
  logoutBtn.hidden = !isLoggedIn;
  userInfoEl.textContent = isLoggedIn
    ? `Connecté : ${user.displayName || user.email || 'Utilisateur'}`
    : 'Non connecté';
}

formEl.addEventListener('submit', (event) => {
  addItem(event).catch((error) => {
    statusEl.textContent = `Erreur: ${error.message}`;
  });
});
clearBtn.addEventListener('click', () => {
  clearBought().catch((error) => {
    statusEl.textContent = `Erreur: ${error.message}`;
  });
});
loginBtn.addEventListener('click', () => {
  login().catch((error) => {
    statusEl.textContent = `Erreur connexion: ${error.message}`;
  });
});
logoutBtn.addEventListener('click', () => {
  logout().catch((error) => {
    statusEl.textContent = `Erreur déconnexion: ${error.message}`;
  });
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  applyAuthUi(user);
  loadItems().catch((error) => {
    statusEl.textContent = `Erreur: ${error.message}`;
  });
});

setFormEnabled(false);
