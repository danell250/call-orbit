// cart.js

// Initialize / normalize cart
let cart = JSON.parse(localStorage.getItem('callOrbitCart')) || [];
cart = cart.map(item => ({
    plan: item.plan || 'Unknown Plan',
    type: item.type || 'Subscription Package',
    price: item.price ? parseFloat(item.price) : 0,
    setup: item.setup || 0,
    training: item.training || 0,
    monthly: item.monthly || 0,
    country: item.country || 'US',
    quantity: item.quantity || 1,
    recurring: item.recurring !== undefined ? item.recurring : true
}));

function renderCart() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    cartItemsEl.innerHTML = '';
    let total = 0;

    cart.forEach((item, i) => {
        total += (item.price || 0) * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
      <div>
        <strong>${item.plan}</strong> - ${item.type} x ${item.quantity}
        <div style="font-size:0.9em;color:#374151;margin-top:5px;">
          Setup Fee: $${item.setup.toFixed(2)} <br>
          Training Fee: $${item.training.toFixed(2)} <br>
          Monthly Fee: $${item.monthly.toFixed(2)}
        </div>
      </div>
      <span>$${(item.price * item.quantity).toFixed(2)} 
        <button class="remove-btn" data-index="${i}">x</button>
      </span>
    `;
        cartItemsEl.appendChild(div);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            cart.splice(idx, 1);
            renderCart();
        });
    });

    cartTotalEl.textContent = '$' + total.toFixed(2);
    updateCartButton();
    localStorage.setItem('callOrbitCart', JSON.stringify(cart));
    renderPayPal();
}

function updateCartButton() {
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0).toFixed(2);
    document.getElementById('cart-button').textContent = `Cart 🛒 (${cart.length} items - $${total})`;
}

document.getElementById('cart-button').addEventListener('click', () => document.getElementById('cart-wrapper').classList.toggle('active'));
document.getElementById('cart-close').addEventListener('click', () => document.getElementById('cart-wrapper').classList.remove('active'));

// Add to cart buttons
document.querySelectorAll('.buy-now').forEach(btn => {
    btn.addEventListener('click', () => {
        const planDiv = btn.closest('.plan');
        const planName = planDiv.querySelector('h3').textContent;
        const setup = parseFloat(planDiv.dataset.setup);
        const training = parseFloat(planDiv.dataset.training);
        const monthly = parseFloat(planDiv.dataset.monthly);

        // One cart entry instead of 3
        const totalPrice = setup + training + monthly;

        cart.push({
            plan: planName,
            type: "Subscription Package",
            price: totalPrice,
            setup,
            training,
            monthly,
            country: 'US',
            quantity: 1,
            recurring: true
        });

        renderCart();
    });
});

function renderPayPal() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0).toFixed(2);
    paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: total } }] }),
        onApprove: (data, actions) => actions.order.capture().then(details => {
            alert('Payment completed by ' + details.payer.name.given_name);
            cart = [];
            renderCart();
        })
    }).render('#paypal-button-container');
}

// Sync cart across tabs
window.addEventListener("storage", e => {
    if (e.key === 'callOrbitCart') {
        cart = JSON.parse(e.newValue) || [];
        renderCart();
    }
});

renderCart();
