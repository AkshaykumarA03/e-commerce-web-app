// ==================== CART MANAGEMENT ====================
let cart = [];

// Initialize cart from localStorage
function initCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartCount();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Add product to cart
function addToCart(event) {
  const button = event.target;
  const productCard = button.closest('.product-card');
  
  const productName = productCard.querySelector('h3').textContent;
  const productPrice = parseInt(productCard.querySelector('.price').textContent.replace('₹', ''));
  const productImage = productCard.querySelector('img').src;
  
  // Check if product already exists in cart
  const existingProduct = cart.find(item => item.name === productName);
  
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: Date.now(),
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1
    });
  }
  
  saveCart();
  
  // Show success notification
  showNotification(`${productName} added to cart!`);
  
  // Animate button
  button.textContent = '✓ Added!';
  button.style.background = '#28a745';
  setTimeout(() => {
    button.textContent = 'Add to Cart';
  }, 1500);
}

// Update cart count badge
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector('.cart-count');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// ==================== CART MODAL ====================
function openCart() {
  const modal = document.querySelector('.cart-modal');
  modal.style.display = 'flex';
  renderCart();
}

function closeCart() {
  const modal = document.querySelector('.cart-modal');
  modal.style.display = 'none';
}

function renderCart() {
  const cartItems = document.querySelector('.cart-items');
  const cartTotal = document.querySelector('.cart-total-amount');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = '₹0';
    return;
  }
  
  let total = 0;
  cartItems.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>₹${item.price} × ${item.quantity}</p>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
      </div>
    `;
  }).join('');
  
  cartTotal.textContent = '₹' + total;
}

// Update product quantity
function updateQuantity(id, change) {
  const product = cart.find(item => item.id === id);
  if (product) {
    product.quantity += change;
    if (product.quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
      renderCart();
    }
  }
}

// Remove product from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  showNotification('Product removed from cart');
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty!');
    return;
  }
  
  showNotification('Proceeding to checkout...');
  setTimeout(() => {
    alert('Thank you for your order!\nTotal Items: ' + cart.reduce((sum, item) => sum + item.quantity, 0) + '\nTotal Amount: ₹' + cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    cart = [];
    saveCart();
    closeCart();
  }, 1000);
}

// ==================== SEARCH & FILTER ====================
const searchInput = document.querySelector('.filters input[type="text"]');
const categorySelect = document.querySelector('.filters select');

if (searchInput) {
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterProducts(searchTerm, categorySelect.value);
  });
}

if (categorySelect) {
  categorySelect.addEventListener('change', function() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    filterProducts(searchTerm, this.value);
  });
}

function filterProducts(searchTerm, category) {
  const products = document.querySelectorAll('.product-card');
  let visibleCount = 0;
  
  products.forEach(product => {
    const productName = product.querySelector('h3').textContent.toLowerCase();
    const productDesc = product.querySelector('.description').textContent.toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
                         productName.includes(searchTerm) || 
                         productDesc.includes(searchTerm);
    
    // For category filtering (you can expand this based on your data structure)
    const matchesCategory = category === '' || 
                           (category === 'protein' && (productName.includes('protein') || productName.includes('whey') || productName.includes('plant') || productName.includes('mass'))) ||
                           (category === 'creatine' && productName.includes('creatine')) ||
                           (category === 'bcaa' && productName.includes('bcaa'));
    
    if (matchesSearch && matchesCategory) {
      product.style.display = 'block';
      product.style.animation = 'fadeIn 0.3s ease-in';
      visibleCount++;
    } else {
      product.style.display = 'none';
    }
  });
  
  // Show "no results" message
  const sections = document.querySelectorAll('.category-section');
  sections.forEach(section => {
    const visibleProducts = section.querySelectorAll('.product-card[style="display: block"]').length;
    let noResults = section.querySelector('.no-results');
    
    if (visibleProducts === 0) {
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No products found matching your search.';
        section.appendChild(noResults);
      }
      noResults.style.display = 'block';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  });
}

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// ==================== LAZY LOADING ====================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = '0';
        setTimeout(() => {
          img.style.opacity = '1';
          img.style.transition = 'opacity 0.3s ease-in';
        }, 100);
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('.product-image-container img').forEach(img => {
    imageObserver.observe(img);
  });
}

// ==================== PRODUCT INTERACTIONS ====================
document.addEventListener('DOMContentLoaded', function() {
  // Add to cart button listeners
  const addButtons = document.querySelectorAll('.add-btn');
  addButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });
  
  // Close cart modal on background click
  const modal = document.querySelector('.cart-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeCart();
      }
    });
  }
  
  // Initialize cart
  initCart();
  
  // Add keyboard shortcut for cart (Ctrl/Cmd + C)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      const modal = document.querySelector('.cart-modal');
      if (modal && modal.style.display === 'none' || modal.style.display === '') {
        openCart();
      }
    }
  });
});

// ==================== ANIMATION STYLES ====================
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;
document.head.appendChild(style);

// ==================== UTILITY FUNCTIONS ====================
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// Log cart updates (for debugging)
function logCart() {
  console.log('Current Cart:', cart);
  console.log('Total Items:', getCartItemCount());
  console.log('Total Amount: ₹' + getCartTotal());
}
