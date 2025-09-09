// cart.js - Shared cart for Pricing and Orders pages

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("sharedCart")) || [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem("sharedCart", JSON.stringify(cart));
}

// Update cart badge in navbar
function updateCartBadge() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCount.textContent = totalQuantity;
    }
}

// Render cart dropdown or page
function renderCart() {
    const cartItemsEl = document.getElementById("cart-items");
    const cartTotalEl = document.getElementById("cart-total");

    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        const totalItemPrice = (item.monthly + item.setup + (item.training || 0)) * item.quantity;
        subtotal += totalItemPrice;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
            <strong>${item.name}</strong>
            <span>Monthly: $${item.monthly.toFixed(2)}</span>
            <span>Setup: $${item.setup.toFixed(2)}</span>
            ${item.training ? `<span>Training: $${item.training.toFixed(2)}</span>` : ""}
            <span>Quantity: <input type="number" min="1" value="${item.quantity}" 
                onchange="updateQuantity('${item.name}', this.value)" /></span>
            <button onclick="removeFromCart('${item.name}')">Remove</button>
        `;
        cartItemsEl.appendChild(li);
    });

    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    cartTotalEl.innerHTML = `
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>VAT (15%): $${vat.toFixed(2)}</p>
        <p><strong>Total: $${total.toFixed(2)}</strong></p>
    `;

    updateCartBadge();
}

// Add item to cart
function addToCart(name, monthly, setup, training = 0) {
    let existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, monthly, setup, training, quantity: 1 });
    }
    saveCart();
    renderCart();
}

// Remove item from cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    renderCart();
}

// Update quantity of an item
function updateQuantity(name, quantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = Math.max(1, parseInt(quantity));
    }
    saveCart();
    renderCart();
}

// Initialize PayPal checkout
function initPayPal() {
    const paypalContainer = document.getElementById("paypal-button-container");
    if (!paypalContainer) return;

    paypal.Buttons({
        createOrder: function (data, actions) {
            let subtotal = cart.reduce((sum, item) =>
                sum + (item.monthly + item.setup + (item.training || 0)) * item.quantity, 0
            );
            let vat = subtotal * 0.15;
            let total = (subtotal + vat).toFixed(2);

            return actions.order.create({
                purchase_units: [{
                    amount: { value: total }
                }]
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                alert("Transaction completed by " + details.payer.name.given_name);
                cart = [];
                saveCart();
                renderCart();
            });
        }
    }).render("#paypal-button-container");
}

// Attach add-to-cart buttons on Pricing page
document.addEventListener("DOMContentLoaded", () => {
    // Buttons with class 'buy-now' on Pricing page
    document.querySelectorAll('.buy-now').forEach(btn => {
        btn.addEventListener('click', e => {
            const planEl = e.target.closest('.plan');
            const name = planEl.querySelector('h3').textContent;
            const monthly = parseFloat(planEl.dataset.monthly);
            const setup = parseFloat(planEl.dataset.setup);
            const training = parseFloat(planEl.dataset.training);

            // Optional: confirm training
            const includeTraining = confirm(`Include training for ${name}?`);
            addToCart(name, monthly, setup, includeTraining ? training : 0);

            // Open cart dropdown
            const dropdown = document.getElementById('cart-dropdown');
            if (dropdown) dropdown.style.display = 'block';
        });
    });

    // Toggle cart dropdown
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            const dropdown = document.getElementById('cart-dropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    }

    renderCart();
    initPayPal();
});
