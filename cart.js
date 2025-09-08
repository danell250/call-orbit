const VAT_RATE = 0.15; // 15% VAT

const cartItemsEl = document.getElementById('cart-items');
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

// Training
const trainingFee = 50;

// Add to cart
function addToCart(planName, country, numberType, area = '', includeTraining = false, forward = '') {
    const pkg = packages[planName];
    const price = pkg.price + pkg.onboarding;
    const trainingPrice = includeTraining ? trainingFee : 0;

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

    updateCart();
}

// Update cart display
function updateCart() {
    cartItemsEl.innerHTML = '';
    let total = 0;

    cart.forEach((item, i) => {
        const itemTotal = item.price + (item.trainingPrice || 0);
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML =
            '<span><strong>' + item.plan + ' Plan</strong> (Country: ' + item.country + ', Type: ' + item.numberType +
            (item.area ? ' - ' + item.area : '') + ')<div class="cart-details">Onboarding Included' +
            (item.trainingPrice ? '<br>Training: $' + item.trainingPrice.toFixed(2) : '') +
            '<br>Recurring Monthly Subscription<br>VAT Included</div></span>' +
            '<span>$' + ((itemTotal) * (1 + VAT_RATE)).toFixed(2) +
            '<button class="remove-btn" data-index="' + i + '">x</button></span>';

        cartItemsEl.appendChild(div);
    });

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            cart.splice(idx, 1);
            updateCart();
        });
    });

    // Update totals
    const totalWithVAT = cart.reduce((sum, item) => sum + (item.price + (item.trainingPrice || 0)) * (1 + VAT_RATE), 0);
    cartTotalEl.textContent = '$' + totalWithVAT.toFixed(2);
    cartButton.textContent = 'Cart 🛒 (' + cart.length + ' items - $' + totalWithVAT.toFixed(2) + ')';

    localStorage.setItem('callOrbitCart', JSON.stringify(cart));
}

// Cart open/close
cartButton.addEventListener('click', () => cartWrapper.classList.toggle('active'));
cartClose.addEventListener('click', () => cartWrapper.classList.remove('active'));

// Dynamically render plans
const plansContainerEl = document.getElementById('plans-container');
function generatePlans() {
    plansContainerEl.innerHTML = '';
    Object.keys(packages).forEach(plan => {
        const pkg = packages[plan];
        const div = document.createElement('div');
        div.className = 'plan';
        div.innerHTML =
            '<h3>' + plan + '</h3>' +
            '<div class="price">$' + (pkg.price + pkg.onboarding).toFixed(2) + '</div>' +
            '<div class="minutes">' + pkg.minutes + ' Minutes, Monthly Subscription</div>' +
            '<div class="overage">Onboarding: $' + pkg.onboarding + '</div>' +
            '<button class="buy-now">Add to Cart</button>';

        div.querySelector('button').addEventListener('click', () => {
            const country = document.getElementById('country')?.value || 'US';
            const numberType = document.getElementById('number-type')?.value || 'local';
            const area = numberType === 'local' ? document.getElementById('area')?.value : '';
            addToCart(plan, country, numberType, area, true);
        });

        plansContainerEl.appendChild(div);
    });
}

generatePlans();

// PayPal integration
paypal.Buttons({
    createOrder: function (data, actions) {
        const total = cart.reduce((sum, item) => sum + (item.price + (item.trainingPrice || 0)) * (1 + VAT_RATE), 0).toFixed(2);
        return actions.order.create({
            purchase_units: [{ amount: { value: total } }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
            cart = [];
            updateCart();
        });
    }
}).render('#paypal-button-container');

updateCart();
