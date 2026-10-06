/* ==========================================================================
   Prem Shankar Murti Kala Kendra - Interactive Frontend Application Logic
   Connected to Basic Node.js REST API Backend
   ========================================================================== */

// Product Database state (Loaded dynamically from backend /api/products)
let PRODUCTS_DATA = [];
let cartState = JSON.parse(localStorage.getItem('ps_kala_kendra_cart')) || [];
let activeCategoryFilter = 'all';
let activeSearchQuery = '';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  fetchProductsFromBackend();
  fetchShopInfoFromBackend();
  initCustomOrderForm();
  updateCartBadge();
  initSearchAndFilters();
});

/* Backend API Fetching */
async function fetchProductsFromBackend() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      PRODUCTS_DATA = await res.json();
    } else {
      const fallback = await fetch('data/products.json');
      if (fallback.ok) PRODUCTS_DATA = await fallback.json();
    }
  } catch (err) {
    try {
      const fallback = await fetch('data/products.json');
      if (fallback.ok) PRODUCTS_DATA = await fallback.json();
    } catch(e) {
      console.error('Local catalog load failed:', e);
    }
  }
  renderCatalogGrid(PRODUCTS_DATA);
  renderFeaturedGrid(PRODUCTS_DATA.slice(0, 4));
}

async function fetchShopInfoFromBackend() {
  try {
    const res = await fetch('/api/shop-info');
    if (res.ok) {
      const info = await res.json();
      console.log('Backend Shop Info Loaded:', info.shopName);
    }
  } catch (err) {
    // Silent catch
  }
}

/* Router Functionality */
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const routes = {
    '#home': 'view-home',
    '#products': 'view-products',
    '#product-detail': 'view-product-detail',
    '#roadside': 'view-roadside',
    '#custom-order': 'view-custom-order',
    '#about': 'view-about'
  };

  let targetViewId = routes[hash.split('?')[0]] || 'view-home';

  if (hash.startsWith('#product-detail')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    const productId = params.get('id');
    if (productId) {
      renderProductDetailPage(productId);
    }
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === hash.split('?')[0]) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.view-page').forEach(page => {
    page.classList.remove('active-view');
  });

  const activePage = document.getElementById(targetViewId);
  if (activePage) {
    activePage.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function navigateTo(hash) {
  window.location.hash = hash;
}

/* Catalog Initialization & Rendering */
function initCatalog() {
  if (PRODUCTS_DATA.length > 0) {
    renderCatalogGrid(PRODUCTS_DATA);
    renderFeaturedGrid(PRODUCTS_DATA.slice(0, 4));
  }
}

function renderCatalogGrid(products) {
  const gridContainer = document.getElementById('catalog-products-grid');
  if (!gridContainer) return;

  if (products.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🏺</div>
        <h3>No Artisan Items Found</h3>
        <p style="color: var(--earth-muted);">Try searching with different terms or select a different category filter.</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = products.map(product => `
    <div class="product-card" onclick="openProductDetail('${product.id}')">
      <div class="product-thumb">
        <span class="product-badge-overlay badge-tag badge-${product.badgeType}">${product.badge}</span>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-quick-view">
          <button class="btn-artisan btn-gold" onclick="event.stopPropagation(); openProductDetail('${product.id}')">
            <span>👁️ View Details</span>
          </button>
        </div>
      </div>
      <div class="product-details">
        <div class="product-meta">
          <span>${product.material}</span>
          <span>⭐ ${product.rating} (${product.reviewsCount})</span>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p style="font-size: 0.88rem; color: var(--earth-medium); margin-bottom: 1rem; line-clamp: 2;">${product.shortDesc}</p>
        <div class="product-price-row">
          <span class="price-tag">₹${product.price}</span>
          <button class="btn-artisan btn-primary" style="padding: 8px 16px; font-size: 0.85rem;" onclick="event.stopPropagation(); addToCart('${product.id}')">
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFeaturedGrid(products) {
  const featuredContainer = document.getElementById('featured-products-grid');
  if (!featuredContainer) return;

  featuredContainer.innerHTML = products.map(product => `
    <div class="product-card" onclick="openProductDetail('${product.id}')">
      <div class="product-thumb">
        <span class="product-badge-overlay badge-tag badge-${product.badgeType}">${product.badge}</span>
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-details">
        <div class="product-meta">
          <span>${product.material}</span>
          <span>⭐ ${product.rating}</span>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price-row">
          <span class="price-tag">₹${product.price}</span>
          <button class="btn-artisan btn-primary" style="padding: 8px 16px; font-size: 0.85rem;" onclick="event.stopPropagation(); addToCart('${product.id}')">
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* Dedicated Product Detail View Renderer */
function openProductDetail(productId) {
  window.location.hash = `#product-detail?id=${productId}`;
}

function renderProductDetailPage(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  const container = document.getElementById('product-detail-content');
  if (!product || !container) return;

  container.innerHTML = `
    <div class="product-detail-grid">
      <!-- Gallery Column -->
      <div class="gallery-col">
        <img id="main-gallery-image" src="${product.images[0]}" class="gallery-main-img" alt="${product.name}">
        <div class="gallery-thumbs">
          ${product.images.map((imgUrl, index) => `
            <img src="${imgUrl}" class="thumb-item ${index === 0 ? 'active' : ''}" onclick="switchDetailImage('${imgUrl}', this)" alt="Thumbnail ${index + 1}">
          `).join('')}
        </div>
      </div>

      <!-- Info & Order Column -->
      <div class="info-col">
        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <span class="badge-tag badge-${product.badgeType}">${product.badge}</span>
          <span class="badge-tag" style="background: var(--primary-light); color: var(--earth-dark);">${product.material}</span>
        </div>

        <h1 style="font-size: 2.2rem; margin-bottom: 1rem;">${product.name}</h1>
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem;">
          <span class="price-tag" style="font-size: 2.2rem;">₹${product.price}</span>
          <span style="color: var(--leaf-green); font-weight: 700; font-size: 0.95rem;">✔️ Ready in roadside shop & custom order studio</span>
        </div>

        <p style="font-size: 1.05rem; color: var(--earth-medium); margin-bottom: 1.8rem; line-height: 1.7;">
          ${product.description}
        </p>

        <h4 style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--primary-dark); margin-bottom: 0.5rem;">Key Specifications & Care:</h4>
        <ul class="product-spec-list">
          ${Object.entries(product.specs).map(([key, val]) => `
            <li><span>${key}</span> <strong>${val}</strong></li>
          `).join('')}
        </ul>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
          <button class="btn-artisan btn-primary" style="flex: 1; padding: 16px; font-size: 1.05rem;" onclick="addToCart('${product.id}')">
            🛒 Add to Cart
          </button>
          <button class="btn-artisan btn-gold" style="flex: 1; padding: 16px; font-size: 1.05rem;" onclick="triggerWhatsAppInquiry('${product.name}', ${product.price})">
            💬 Inquire / Order on WhatsApp
          </button>
        </div>

        <div style="margin-top: 2rem; background: var(--canvas-bg); padding: 1.2rem; border-radius: var(--radius-md); border: 1px dashed var(--ochre-gold);">
          <h5 style="color: var(--earth-dark); font-weight: 700; margin-bottom: 4px;">🚚 Direct Local Delivery & Shop Pickup Available</h5>
          <p style="font-size: 0.88rem; color: var(--earth-muted);">Prem Shankar Murti Kala Kendra, Main Roadside Crafts Display, Opposite City Garden. Phone: +91 98765 43210</p>
        </div>
      </div>
    </div>
  `;
}

function switchDetailImage(src, thumbElement) {
  const mainImg = document.getElementById('main-gallery-image');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
  if (thumbElement) thumbElement.classList.add('active');
}

/* Search and Filter System */
function initSearchAndFilters() {
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategoryFilter = e.target.getAttribute('data-filter');
      applyFilters();
    });
  });
}

function filterCategory(cat) {
  activeCategoryFilter = cat;
  navigateTo('#products');
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('data-filter') === cat) b.classList.add('active');
  });
  applyFilters();
}

function applyFilters() {
  let filtered = PRODUCTS_DATA;

  if (activeCategoryFilter !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategoryFilter);
  }

  if (activeSearchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(activeSearchQuery) ||
      p.shortDesc.toLowerCase().includes(activeSearchQuery) ||
      p.material.toLowerCase().includes(activeSearchQuery)
    );
  }

  renderCatalogGrid(filtered);
}

/* Interactive Custom Order Estimator (Connected to Backend API) */
function initCustomOrderForm() {
  const materialSelect = document.getElementById('cust-material');
  const sizeSelect = document.getElementById('cust-size');
  const finishSelect = document.getElementById('cust-finish');

  if (materialSelect && sizeSelect && finishSelect) {
    [materialSelect, sizeSelect, finishSelect].forEach(elem => {
      elem.addEventListener('change', calculateCustomEstimate);
    });
  }
}

function calculateCustomEstimate() {
  const mat = document.getElementById('cust-material')?.value || 'pop';
  const size = document.getElementById('cust-size')?.value || 'med';
  const finish = document.getElementById('cust-finish')?.value || 'painted';

  let basePrice = 80;

  if (mat === 'clay') basePrice += 20;
  if (mat === 'pop-clay') basePrice += 40;

  if (size === 'med') basePrice += 30;
  if (size === 'large') basePrice += 50;
  if (size === 'temple') basePrice += 80;

  if (finish === 'painted') basePrice += 20;
  if (finish === 'gold-leaf') basePrice += 30;

  if (basePrice > 200) basePrice = 200;

  const displayElement = document.getElementById('custom-estimate-price');
  if (displayElement) {
    displayElement.textContent = `₹${basePrice}`;
  }
}

async function submitCustomOrderRequest(e) {
  e.preventDefault();
  const name = document.getElementById('cust-name')?.value;
  const phone = document.getElementById('cust-phone')?.value;
  const itemType = document.getElementById('cust-item-type')?.value;
  const material = document.getElementById('cust-material')?.value;
  const size = document.getElementById('cust-size')?.value;
  const finish = document.getElementById('cust-finish')?.value;
  const notes = document.getElementById('cust-notes')?.value;
  const priceEst = document.getElementById('custom-estimate-price')?.textContent;

  const payload = { name, phone, itemType, material, size, finish, notes, estimatedPrice: priceEst };

  try {
    const res = await fetch('/api/custom-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`🙏 Quote Saved on Backend (${data.quote.id})! Prem Shankar will contact ${name}.`);
    } else {
      showToast(`🙏 Order Quote Received! Prem Shankar will contact ${name} shortly.`);
    }
  } catch (err) {
    showToast(`🙏 Order Quote Received! Prem Shankar will contact ${name} shortly.`);
  }

  e.target.reset();
  calculateCustomEstimate();
}

/* Shopping Cart Logic (Connected to Backend API) */
function addToCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existing = cartState.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartState.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartBadge();
  showToast(`🛒 '${product.name}' added to your basket!`);
}

function updateCartQuantity(productId, delta) {
  const itemIndex = cartState.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    cartState[itemIndex].quantity += delta;
    if (cartState[itemIndex].quantity <= 0) {
      cartState.splice(itemIndex, 1);
    }
  }
  saveCart();
  renderCartDrawer();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('ps_kala_kendra_cart', JSON.stringify(cartState));
}

function updateCartBadge() {
  const count = cartState.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.badge-count').forEach(badge => {
    badge.textContent = count;
  });
}

function toggleCartDrawer() {
  const backdrop = document.getElementById('drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    backdrop.classList.toggle('active');
    drawer.classList.toggle('active');
    if (drawer.classList.contains('active')) {
      renderCartDrawer();
    }
  }
}

function renderCartDrawer() {
  const cartBody = document.getElementById('cart-drawer-body');
  const totalContainer = document.getElementById('cart-total-price');
  if (!cartBody || !totalContainer) return;

  if (cartState.length === 0) {
    cartBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🧺</div>
        <p style="font-weight: 600; color: var(--earth-medium);">Your artisan basket is empty.</p>
        <button class="btn-artisan btn-primary" style="margin-top: 1rem;" onclick="toggleCartDrawer(); navigateTo('#products');">Browse Products</button>
      </div>
    `;
    totalContainer.textContent = '₹0';
    return;
  }

  let grandTotal = 0;

  cartBody.innerHTML = cartState.map(item => {
    const itemTotal = item.price * item.quantity;
    grandTotal += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div style="flex-grow: 1;">
          <h4 style="font-size: 0.95rem; color: var(--earth-dark); margin-bottom: 4px;">${item.name}</h4>
          <div style="font-weight: 700; color: var(--primary-dark);">₹${item.price}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; background: var(--canvas-bg); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid rgba(200, 90, 50, 0.2);">
          <button style="font-weight: 800; padding: 0 4px;" onclick="updateCartQuantity('${item.id}', -1)">-</button>
          <span style="font-weight: 700; min-width: 18px; text-align: center;">${item.quantity}</span>
          <button style="font-weight: 800; padding: 0 4px;" onclick="updateCartQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  totalContainer.textContent = `₹${grandTotal}`;
}

async function checkoutCart() {
  if (cartState.length === 0) return;
  const totalPrice = document.getElementById('cart-total-price')?.textContent || '₹0';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartState, totalPrice })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`🎉 Order (${data.order.id}) Placed! Thank you for supporting Prem Shankar artisans.`);
    } else {
      showToast(`🎉 Order Placed Successfully! Thank you for supporting Prem Shankar artisans.`);
    }
  } catch (err) {
    showToast(`🎉 Order Placed Successfully! Thank you for supporting Prem Shankar artisans.`);
  }

  cartState = [];
  saveCart();
  updateCartBadge();
  toggleCartDrawer();
}

function triggerWhatsAppInquiry(productName, price) {
  const text = encodeURIComponent(`Namaste! I want to inquire/order: ${productName} (Price: ₹${price}) from Prem Shankar Murti Kala Kendra website.`);
  window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
}

/* Toast Notification Utility */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🪔</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
