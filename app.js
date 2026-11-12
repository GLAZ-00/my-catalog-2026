// Αγορά - πλήρως λειτουργικό client-side demo
// Λειτουργεί με localStorage. Έτοιμο για GitHub Pages.

let categories = [];
let allAds = [];
let currentUser = null;
let currentAdImages = [];
let carouselIndex = 0;
let selectedImages = [];

// Φόρτωση δεδομένων
async function init() {
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    categories = data.categories;
    const stored = localStorage.getItem('ads');
    allAds = stored ? JSON.parse(stored) : data.sampleAds;
    const user = localStorage.getItem('currentUser');
    if (user) {
      currentUser = JSON.parse(user);
      updateAuthUI();
    }
    renderCategories();
    renderAds(allAds);
    populateCategorySelect();
  } catch (e) {
    console.error(e);
    alert('Σφάλμα φόρτωσης δεδομένων');
  }
}

function saveAds() {
  localStorage.setItem('ads', JSON.stringify(allAds));
}

function saveUser() {
  if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  else localStorage.removeItem('currentUser');
}

function updateAuthUI() {
  const authBtns = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  if (currentUser) {
    authBtns.style.display = 'none';
    userMenu.style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
  } else {
    authBtns.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

function renderCategories() {
  const container = document.getElementById('categories');
  container.innerHTML = `<div class="cat-btn active" onclick="filterCategory('all')">Όλα</div>`;
  categories.forEach(cat => {
        container.innerHTML += `<div class="cat-btn" onclick="filterCategory('${cat.id}')">${cat.name}</div>`;

  });
}

function filterCategory(catId) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  if (catId === 'all') {
    renderAds(allAds);
  } else {
    const filtered = allAds.filter(ad => ad.category === catId);
    renderAds(filtered);
  }
}

function searchAds() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allAds.filter(ad => 
    ad.title.toLowerCase().includes(q) || 
    ad.description.toLowerCase().includes(q)
  );
  renderAds(filtered);
}

function renderAds(ads) {
  const grid = document.getElementById('adsGrid');
  const sorted = [...ads].sort((a, b) => (b.vip ? 1 : 0) - (a.vip ? 1 : 0));
  grid.innerHTML = '';
  sorted.forEach(ad => {
    const mainImg = ad.images[ad.mainImage || 0] || ad.images[0];
    const card = document.createElement('div');
    card.className = `ad-card ${ad.vip ? 'vip' : ''}`;
    card.onclick = () => openAd(ad.id);
    card.innerHTML = `
            <img src="${mainImg}" alt="${ad.title}" onerror="this.src='https://placeholder.com'">
      <div class="ad-info">
        <div class="ad-price">${ad.price} ${ad.currency}</div>
        <div class="ad-title">${ad.title}</div>
        <div class="ad-loc">${ad.location} · ${ad.date}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openAd(id) {
  const ad = allAds.find(a => a.id === id);
  if (!ad) return;
  currentAdImages = ad.images;
  carouselIndex = ad.mainImage || 0;
  updateCarousel();
  document.getElementById('adDetails').innerHTML = `
    <h2>${ad.title}</h2>
    <div style="font-size:28px; font-weight:700; color:#002f34; margin:12px 0;">${ad.price} ${ad.currency}</div>
    <p style="margin-bottom:16px;">${ad.description}</p>
    <div style="color:#406367;">Κατηγορία: ${getCategoryName(ad.category)} → ${ad.subcategory}</div>
    <div style="color:#406367;">Τοποθεσία: ${ad.location}</div>
    <div style="color:#406367; margin-top:8px;">Δημοσιεύτηκε: ${ad.date}</div>
    ${ad.vip ? '<div style="margin-top:12px; color:#b8860b; font-weight:700;">★ VIP αγγελία</div>' : ''}
  `;
  openModal('adModal');
}

function getCategoryName(id) {
  const cat = categories.find(c => c.id === id);
  return cat ? cat.name : id;
}

function updateCarousel() {
  const main = document.getElementById('carouselMain');
  const thumbs = document.getElementById('carouselThumbs');
  main.src = currentAdImages[carouselIndex];
  thumbs.innerHTML = '';
  currentAdImages.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = img;
    t.className = i === carouselIndex ? 'active' : '';
    t.onclick = () => { carouselIndex = i; updateCarousel(); };
    thumbs.appendChild(t);
  });
}

function carouselPrev() {
  carouselIndex = (carouselIndex - 1 + currentAdImages.length) % currentAdImages.length;
  updateCarousel();
}
function carouselNext() {
  carouselIndex = (carouselIndex + 1) % currentAdImages.length;
  updateCarousel();
}

// Auth
function register(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    alert('Υπάρχει ήδη χρήστης με αυτό το email');
    return;
  }
  const user = { id: Date.now().toString(), name, email, phone, password };
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = user;
  saveUser();
  updateAuthUI();
  closeModal('registerModal');
  alert('Η εγγραφή ολοκληρώθηκε!');
}

function login(e) {
  e.preventDefault();
  const login = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => (u.email === login || u.phone === login) && u.password === password);
  if (user) {
    currentUser = user;
    saveUser();
    updateAuthUI();
    closeModal('loginModal');
  } else {
    alert('Λάθος email/τηλέφωνο ή κωδικός');
  }
}

function logout() {
  currentUser = null;
  saveUser();
  updateAuthUI();
  showHome();
}

// Post Ad
function populateCategorySelect() {
  const sel = document.getElementById('adCategory');
  sel.innerHTML = '<option value="">Επιλέξτε κατηγορία</option>';
  categories.forEach(cat => {
       sel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
  // Αρχικοποίηση υποκατηγοριών
  updateSubcategories();
}

function updateSubcategories() {
  const catId = document.getElementById('adCategory').value;
  const subSel = document.getElementById('adSubcategory');
  subSel.innerHTML = '<option value="">Επιλέξτε υποκατηγορία</option>';
  const cat = categories.find(c => c.id === catId);
  if (cat && cat.subcategories) {
    cat.subcategories.forEach(sub => {
            subSel.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
  }
}

function previewImages(e) {
  selectedImages = [];
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = '';
  const files = Array.from(e.target.files).slice(0, 5);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      selectedImages.push(ev.target.result);
      const img = document.createElement('img');
      img.src = ev.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function postAd(e) {
  e.preventDefault();
  if (!currentUser) {
    alert('Πρέπει να συνδεθείτε πρώτα');
    return;
  }
  if (selectedImages.length === 0) {
    alert('Προσθέστε τουλάχιστον μία φωτογραφία');
    return;
  }
  const catVal = document.getElementById('adCategory').value;
  const subVal = document.getElementById('adSubcategory').value;
  if (!catVal || !subVal) {
    alert('Επιλέξτε κατηγορία και υποκατηγορία');
    return;
  }
  const ad = {
    id: 'ad' + Date.now(),
    title: document.getElementById('adTitle').value,
    price: Number(document.getElementById('adPrice').value),
    currency: 'EUR',
    category: catVal,
    subcategory: subVal,
    description: document.getElementById('adDescription').value,
    location: document.getElementById('adLocation').value,
    images: selectedImages,
    mainImage: 0,
    vip: document.getElementById('adVip').checked,
    date: new Date().toISOString().split('T')[0],
    userId: currentUser.id
  };
  allAds.unshift(ad);
  saveAds();
  selectedImages = [];
  document.getElementById('postAdForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
  closeModal('postAdModal');
  renderAds(allAds);
  alert('Η αγγελία δημοσιεύτηκε!');
}

// Cabinet
function showCabinet() {
  if (!currentUser) return;
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('cabinetView').classList.add('active');
  renderMyAds();
}

function showHome() {
  document.getElementById('cabinetView').classList.remove('active');
  document.getElementById('homeView').style.display = 'block';
  renderAds(allAds);
}

function renderMyAds() {
  const container = document.getElementById('myAds');
  const my = allAds.filter(ad => ad.userId === currentUser.id);
  container.innerHTML = '';
  if (my.length === 0) {
    container.innerHTML = '<p>Δεν έχετε αγγελίες ακόμα</p>';
    return;
  }
  my.forEach(ad => {
    const mainImg = ad.images[0];
    const card = document.createElement('div');
    card.className = 'ad-card';
    card.innerHTML = `
      <img src="${mainImg}" alt="">
      <div class="ad-info">
        <div class="ad-price">${ad.price} EUR</div>
        <div class="ad-title">${ad.title}</div>
        <button class="btn-danger" style="margin-top:8px; padding:6px 12px; font-size:13px;" onclick="event.stopPropagation(); deleteAd('${ad.id}')">Διαγραφή</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function deleteAd(id) {
  if (confirm('Διαγραφή αγγελίας;')) {
    allAds = allAds.filter(a => a.id !== id);
    saveAds();
    renderMyAds();
  }
}

// Modal helpers
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Init
document.addEventListener('DOMContentLoaded', init);

// Close modal on outside click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('active');
  });
});
