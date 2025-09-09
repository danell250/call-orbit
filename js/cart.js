// Unified Cart.js
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Popup elements (Pricing page)
const cartPopup = document.getElementById('cart-popup');
const cartItemsPopup = document.getElementById('cart-items');
const cartIcon = document.getElementById('cart-icon');
const closeBtn = document.querySelector('.close-cart');

// Orders page container
const orderCartEl = document.getElementById('plans-container') || document.getElementById('order-cart');

// Totals elements
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartVatEl = document.getElementById('cart-vat');
const cartTotalEl = document.getElementById('cart-total');

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Calculate totals
function calculateTotals() {
    let subtotal = 0;
    cart.forEach(item => {
        const qty = item.quantity || 1;
        subtotal += ((item.monthly || item.price || 0) + (item.setup || 0) + (item.training || 0)) * qty;
    });
    const vat = +(subtotal * 0.15).toFixed(2);
    const total = +(subtotal + vat).toFixed(2);
    return { subtotal, vat, total };
}

// Render cart items to a container
function renderCartItems(container) {
    if (!container) return;
    container.innerHTML = '';
    cart.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${item.monthly ? `Monthly: $${item.monthly}` : `Price: $${item.price}`} | Setup: $${item.setup || 0} | Training: $${item.training || 0}
                x <input type="number" class="quantity-input" data-index="${i}" value="${item.quantity || 1}" min="1">
            </div>
            <button class="remove-btn" data-index="${i}">Remove</button>
        `;
        container.appendChild(div);
    });
}

// Update cart UI and totals
function updateCart() {
    if (cartItemsPopup) renderCartItems(cartItemsPopup);
    if (orderCartEl) renderCartItems(orderCartEl);

    const totals = calculateTotals();
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (cartVatEl) cartVatEl.textContent = `$${totals.vat.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${totals.total.toFixed(2)}`;

    if (cartPopup) cartPopup.style.display = cart.length > 0 ? 'block' : 'none';

    saveCart();
    renderPaypal(totals.total);
}

// Render PayPal buttons
function renderPaypal(total) {
    const paypalContainer = document.getElementById('paypal-buttons-global') || document.getElementById('paypal-button-container');
    if (!paypalContainer || paypalContainer.dataset.rendered === 'true') return;
    if (window.paypal) {
        paypal.Buttons({
            createOrder: (data, actions) => actions.order.create({
                purchase_units: [{ amount: { value: total.toFixed(2) }, description: 'CallOrbit Plans' }]
            }),
            onApprove: (data, actions) => actions.order.capture().then(() => {
                alert('Transaction completed successfully!');
                cart = [];
                updateCart();
            })
        }).render(paypalContainer);
        paypalContainer.dataset.rendered = 'true';
    }
}

// Add to cart
document.addEventListener('click', e => {
    if (e.target.classList.contains('buy-now')) {
        const plan = e.target.closest('.plan');
        if (!plan) return;
        const name = plan.querySelector('h3')?.textContent || 'Plan';
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({
                name,
                monthly: parseFloat(plan.dataset.monthly) || parseFloat(plan.dataset.price) || 0,
                price: parseFloat(plan.dataset.price) || 0,
                setup: parseFloat(plan.dataset.setup) || 0,
                training: parseFloat(plan.dataset.training) || 0,
                quantity: 1
            });
        }
        updateCart();
        if (cartPopup) cartPopup.style.display = 'block';
    }
});

// Remove from cart
document.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
        const index = parseInt(e.target.dataset.index);
        if (!isNaN(index)) {
            cart.splice(index, 1);
            updateCart();
        }
    }
});

// Update quantity
document.addEventListener('input', e => {
    if (e.target.classList.contains('quantity-input')) {
        const index = parseInt(e.target.dataset.index);
        const val = parseInt(e.target.value);
        if (!isNaN(index) && val > 0) {
            cart[index].quantity = val;
            updateCart();
        }
    }
});

// Cart popup controls
if (closeBtn) closeBtn.addEventListener('click', () => {
    if (cartPopup) cartPopup.style.display = 'none';
});

if (cartIcon) cartIcon.addEventListener('click', () => {
    if (!cartPopup) return;
    cartPopup.style.display = (cartPopup.style.display === 'block') ? 'none' : (cart.length > 0 ? 'block' : 'none');
});

// Initialize cart from localStorage
updateCart();
