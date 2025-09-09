// cart.js
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartPopup = document.getElementById('cart-popup');
const cartItemsEl = document.getElementById('cart-items');
const cartIcon = document.getElementById('cart-icon');
const closeBtn = document.querySelector('.close-cart');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function calculateTotals() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (item.monthly || 0) + (item.setup || 0) + (item.training || 0);
    });
    const vat = +(subtotal * 0.15).toFixed(2);
    const total = +(subtotal + vat).toFixed(2);
    return { subtotal, vat, total };
}

function updateCart() {
    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = '';

    cart.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                Monthly: $${item.monthly || 0} | Setup: $${item.setup || 0} | Training: $${item.training || 0}
            </div>
            <button class="remove-btn" data-index="${i}">Remove</button>
        `;
        cartItemsEl.appendChild(div);
    });

    const totals = calculateTotals();
    document.getElementById('cart-subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('cart-vat').textContent = `$${totals.vat.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${totals.total.toFixed(2)}`;

    if (cart.length > 0) {
        if (cartPopup) cartPopup.style.display = 'block';
    } else {
        if (cartPopup) cartPopup.style.display = 'none';
    }

    saveCart();
    renderPaypal(totals.total);
}

function renderPaypal(total) {
    const paypalContainer = document.getElementById('paypal-buttons-global');
    if (!paypalContainer || paypalContainer.dataset.rendered === 'true') return;

    if (window.paypal) {
        paypal.Buttons({
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: total.toFixed(2) },
                        description: 'CallOrbit Plans'
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function () {
                    alert('Transaction completed successfully!');
                    cart = [];
                    updateCart();
                });
            }
        }).render('#paypal-buttons-global');

        paypalContainer.dataset.rendered = 'true';
    }
}

// Add to Cart buttons
document.querySelectorAll('.buy-now').forEach(btn => {
    btn.addEventListener('click', e => {
        const plan = e.target.closest('.plan');
        if (!plan) return;

        cart.push({
            name: plan.querySelector('h3')?.textContent || 'Unknown Plan',
            monthly: parseFloat(plan.dataset.monthly) || 0,
            setup: parseFloat(plan.dataset.setup) || 0,
            training: parseFloat(plan.dataset.training) || 0
        });
        updateCart();
    });
});

// Remove from cart
if (cartItemsEl) {
    cartItemsEl.addEventListener('click', e => {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            if (!isNaN(index)) {
                cart.splice(index, 1);
                updateCart();
            }
        }
    });
}

// Close cart popup
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        if (cartPopup) cartPopup.style.display = 'none';
    });
}

// Toggle popup when clicking cart icon
if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        if (!cartPopup) return;
        cartPopup.style.display = (cartPopup.style.display === 'block') ? 'none' : (cart.length > 0 ? 'block' : 'none');
    });
}

// Initialize cart on page load
updateCart();
