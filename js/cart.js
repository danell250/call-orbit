// cart.js
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartPopup = document.getElementById('cart-popup');
const cartItemsEl = document.getElementById('cart-items');
const cartIcon = document.getElementById('cart-icon');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
    cartItemsEl.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, i) => {
        subtotal += item.monthly + item.setup + item.training;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        Monthly: $${item.monthly} | Setup: $${item.setup} | Training: $${item.training}
      </div>
      <button class="remove-btn" data-index="${i}">Remove</button>
    `;
        cartItemsEl.appendChild(div);
    });

    const vat = +(subtotal * 0.15).toFixed(2);
    const total = +(subtotal + vat).toFixed(2);

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-vat').textContent = `$${vat.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    cartPopup.style.display = cart.length > 0 ? 'block' : 'none';

    saveCart();

    // Render PayPal button
    if (document.getElementById('paypal-buttons-global')) {
        paypal.Buttons({
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{ amount: { value: total.toFixed(2) }, description: 'CallOrbit Plans' }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(() => {
                    alert('Transaction completed successfully!');
                    cart = [];
                    updateCart();
                });
            }
        }).render('#paypal-buttons-global');
    }
}

// Add to Cart buttons
document.querySelectorAll('.buy-now').forEach(btn => {
    btn.addEventListener('click', e => {
        const plan = e.target.closest('.plan');
        cart.push({
            name: plan.querySelector('h3').textContent,
            monthly: parseFloat(plan.dataset.monthly),
            setup: parseFloat(plan.dataset.setup),
            training: parseFloat(plan.dataset.training)
        });
        updateCart();
    });
});

// Remove item
cartItemsEl.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
        const index = e.target.dataset.index;
        cart.splice(index, 1);
        updateCart();
    }
});

// Close cart popup
const closeBtn = document.querySelector('.close-cart');
if (closeBtn) closeBtn.addEventListener('click', () => {
    cartPopup.style.display = 'none';
});

// Toggle popup when clicking cart icon
if (cartIcon) cartIcon.addEventListener('click', () => {
    cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : cart.length > 0 ? 'block' : 'none';
});

// Initialize cart on load
updateCart();
