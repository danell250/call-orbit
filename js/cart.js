document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const cartPopup = document.getElementById('cart-popup');
    const cartItemsEl = document.getElementById('cart-items');
    const cartIcon = document.getElementById('cart-icon');
    const closeBtn = document.querySelector('.close-cart');

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCart() {
        if (!cartPopup || !cartItemsEl) return;

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

        const subtotalEl = document.getElementById('cart-subtotal');
        const vatEl = document.getElementById('cart-vat');
        const totalEl = document.getElementById('cart-total');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (vatEl) vatEl.textContent = `$${vat.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

        cartPopup.style.display = cart.length > 0 ? 'block' : 'none';

        saveCart();

        // Render PayPal button if container exists
        const paypalContainer = document.getElementById('paypal-buttons-global');
        if (paypalContainer && typeof paypal !== 'undefined') {
            paypalContainer.innerHTML = ''; // reset
            paypal.Buttons({
                createOrder: (data, actions) => actions.order.create({
                    purchase_units: [{ amount: { value: total.toFixed(2) }, description: 'CallOrbit Plans' }]
                }),
                onApprove: (data, actions) => actions.order.capture().then(() => {
                    alert('Transaction completed successfully!');
                    cart = [];
                    updateCart();
                })
            }).render('#paypal-buttons-global');
        }
    }

    // Add to Cart buttons
    document.querySelectorAll('.buy-now').forEach(btn => {
        btn.addEventListener('click', e => {
            const plan = e.target.closest('.plan');
            if (!plan) return;

            cart.push({
                name: plan.querySelector('h3')?.textContent || 'Plan',
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
                const index = e.target.dataset.index;
                cart.splice(index, 1);
                updateCart();
            }
        });
    }

    // Close cart popup
    if (closeBtn && cartPopup) {
        closeBtn.addEventListener('click', () => {
            cartPopup.style.display = 'none';
        });
    }

    // Toggle popup when clicking cart icon
    if (cartIcon && cartPopup) {
        cartIcon.addEventListener('click', () => {
            cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : (cart.length > 0 ? 'block' : 'none');
        });
    }

    // Initialize cart
    updateCart();
});
