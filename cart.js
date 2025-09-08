// cart.js
const VAT_RATE = 0.15; // 15% VAT

let cart = JSON.parse(localStorage.getItem('callOrbitCart')) || [];

// Save cart
function saveCart() {
    localStorage.setItem('callOrbitCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(item) {
    const existingIndex = cart.findIndex(
        i => i.plan === item.plan && i.numberType === item.numberType && i.area === item.area
    );
    if (existingIndex > -1) {
        cart[existingIndex].quantity += item.quantity;
    } else {
        cart.push(item);
    }
    saveCart();
}

// Remove item
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

// Calculate total including VAT
function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
}

// Render cart for any page
function renderCart(cartContainerId, totalContainerId) {
    const container = document.getElementById(cartContainerId);
    const totalEl = document.getElementById(totalContainerId);
    if (!container || !totalEl) return;

    container.innerHTML = '';
    cart.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
      <span>
        <strong>${item.plan}</strong> (${item.numberType}${item.area ? ' - ' + item.area : ''}) x ${item.quantity}
        <div class="cart-details">
          ${item.forward ? 'Forwarding: ' + item.forward : ''}
          ${item.recurring ? 'Monthly Subscription Included' : ''}
          VAT Included
        </div>
      </span>
      <span>$${(item.price * item.quantity).toFixed(2)} <button class="remove-btn" data-index="${i}">x</button></span>
    `;
        container.appendChild(div);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            removeFromCart(parseInt(e.target.dataset.index));
            renderCart(cartContainerId, totalContainerId);
        });
    });

    totalEl.textContent = '$' + calculateTotal();
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
}

// For PayPal buttons
function renderPayPal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (cart.length === 0) return;

    paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: calculateTotal() } }] }),
        onApprove: (data, actions) => actions.order.capture().then(details => {
            alert('Transaction completed by ' + details.payer.name.given_name);
            clearCart();
            renderCart('cart-items', 'cart-total');
        })
    }).render('#' + containerId);
}
