const VAT_RATE = 0.15; // 15% VAT

const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal') || null;
const cartVATEl = document.getElementById('cart-vat') || null;
const cartTotalEl = document.getElementById('cart-total');
const cartWrapper = document.getElementById('cart-wrapper');
const cartButton = document.getElementById('cart-button');
const cartClose = document.getElementById('cart-close');

let cart = JSON.parse(localStorage.getItem('callOrbitCart')) || [];

// Packages
const packages = {
    Basic: { minutes: 100, price: 50, onboarding: 20 },
    Plus: { minutes: 500, price: 100, onboarding: 30 },
    Pro: { minutes: 1000, price: 200, onboarding: 50 },
    Max: { minutes: 2500, price: 400, onboarding: 75 },
};

// Training / onboarding fee
const trainingFee = 50;

// Add item to cart
function addToCart(planName, country = '', numberType = '', area = '', includeTraining = false, forward = '') {
    const pkg = packages[planName];
    const price = pkg.price + pkg.onboarding;
    const trainingPrice = includeTraining ? trainingFee : 0;

    // Avoid duplicates: same plan + country + type + area + forwarding
    const existingIndex = cart.findIndex(item =>
        item.plan === planName &&
        item.country === country &&
        item.numberType === numberType &&
        item.area === area &&
        item.forward === forward
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            plan: planName,
            country,
            numberType,
            area,
            price,
            trainingPrice,
            forward,
            quantity: 1,
            recurring: true
        });
    }

    updateCart();
}

// Update cart display
function updateCart() {
    cartItemsEl.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, i) => {
        const itemTotal = item.price + (item.trainingPrice || 0);
        subtotal += itemTotal * item.quantity;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML =
            `<span>
                <strong>${item.plan} Plan</strong> (${item.country}${item.numberType ? ' - ' + item.numberType : ''}${item.area ? ' - ' + item.area : ''})
                <div class="cart-details">
                    ${item.forward ? 'Forwarding: ' + item.forward + '<br>' : ''}
                    Recurring Monthly Subscription<br>
                    ${item.trainingPrice ? 'Training: $' + item.trainingPrice.toFixed(2) + '<br>' : ''}
                </div>
            </span>
            <span>$${itemTotal.toFixed(2)}
                <button class="remove-btn" data-index="${i}">x</button>
            </span>`;
        cartItemsEl.appendChild(div);
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            cart.splice(idx, 1);
            updateCart();
        });
    });

    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    if (cartSubtotalEl) cartSubtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (cartVATEl) cartVATEl.textContent = '$' + vat.toFixed(2);
    cartTotalEl.textContent = '$' + total.toFixed(2);

    cartButton.textContent = `Cart 🛒 (${cart.length} items - $${total.toFixed(2)})`;

    localStorage.setItem('callOrbitCart', JSON.stringify(cart));

    renderPayPal(total.toFixed(2));
}

// Cart open/close
cartButton.addEventListener('click', () => cartWrapper.classList.toggle('active'));
cartClose.addEventListener('click', () => cartWrapper.classList.remove('active'));

// Dynamically render plans for pages that have #plans-container
const plansContainerEl = document.getElementById('plans-container');
if (plansContainerEl) {
    function generatePlans() {
        plansContainerEl.innerHTML = '';
        Object.keys(packages).forEach(plan => {
            const pkg = packages[plan];
            const div = document.createElement('div');
            div.className = 'plan';
            div.innerHTML =
                `<h3>${plan}</h3>
                <div class="price">$${(pkg.price + pkg.onboarding).toFixed(2)}</div>
                <div class="minutes">${pkg.minutes} Minutes, Monthly Subscription</div>
                <div class="overage">Onboarding: $${pkg.onboarding}</div>
                <button class="buy-now">Add to Cart</button>`;

            div.querySelector('button').addEventListener('click', () => {
                const country = document.getElementById('country')?.value || '';
                const numberType = document.getElementById('number-type')?.value || '';
                const area = numberType === 'local' ? document.getElementById('area')?.value : '';
                const forward = document.getElementById('forward')?.value || '';
                addToCart(plan, country, numberType, area, true, forward);
            });

            plansContainerEl.appendChild(div);
        });
    }

    generatePlans();
    document.getElementById('country')?.addEventListener('change', generatePlans);
    document.getElementById('number-type')?.addEventListener('change', generatePlans);
}

// PayPal integration
function renderPayPal(total) {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    if (cart.length === 0) return;

    paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({
            purchase_units: [{ amount: { value: total } }]
        }),
        onApprove: (data, actions) => actions.order.capture().then(details => {
            alert('Transaction completed by ' + details.payer.name.given_name);
            cart = [];
            updateCart();
        })
    }).render('#paypal-button-container');
}

// Listen for cart updates in other tabs
window.addEventListener("storage", e => {
    if (e.key === 'callOrbitCart') {
        cart = JSON.parse(e.newValue) || [];
        updateCart();
    }
});

// Initial render
updateCart();
