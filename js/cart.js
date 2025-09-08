// cart.js
const VAT_RATE = 0.15;

const countries = ["US", "GB", "CA", "AU", "DE", "FR", "IN", "ZA", "BR", "MX", "JP", "IT", "ES", "NL", "CH", "SE", "SG", "IE", "NZ", "NO", "PT", "BE", "KR", "TR", "TH", "PH", "TW", "PL", "RO", "HU"];
const countryNames = { US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia", DE: "Germany", FR: "France", IN: "India", ZA: "South Africa", BR: "Brazil", MX: "Mexico", JP: "Japan", IT: "Italy", ES: "Spain", NL: "Netherlands", CH: "Switzerland", SE: "Sweden", SG: "Singapore", IE: "Ireland", NZ: "New Zealand", NO: "Norway", PT: "Portugal", BE: "Belgium", KR: "South Korea", TR: "Turkey", TH: "Thailand", PH: "Philippines", TW: "Taiwan", PL: "Poland", RO: "Romania", HU: "Hungary" };

const localAreas = {
    US: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
    GB: ["London", "Manchester", "Birmingham"],
    CA: ["Toronto", "Vancouver", "Montreal"],
    AU: ["Sydney", "Melbourne", "Brisbane"],
    DE: ["Berlin", "Munich", "Hamburg"],
    FR: ["Paris", "Lyon", "Marseille"],
    IN: ["Mumbai", "Delhi", "Bangalore"],
    ZA: ["Johannesburg", "Cape Town", "Durban"],
    BR: ["Sao Paulo", "Rio de Janeiro", "Brasilia"],
    MX: ["Mexico City", "Guadalajara", "Monterrey"],
    JP: ["Tokyo", "Osaka", "Nagoya"],
    IT: ["Rome", "Milan", "Naples"],
    ES: ["Madrid", "Barcelona", "Valencia"],
    NL: ["Amsterdam", "Rotterdam", "The Hague"],
    CH: ["Zurich", "Geneva"],
    SE: ["Stockholm", "Gothenburg"],
    SG: ["Singapore"],
    IE: ["Dublin", "Cork"],
    NZ: ["Auckland", "Wellington"],
    NO: ["Oslo", "Bergen"],
    PT: ["Lisbon", "Porto"],
    BE: ["Brussels", "Antwerp"],
    KR: ["Seoul", "Busan"],
    TR: ["Istanbul", "Ankara"],
    TH: ["Bangkok", "Chiang Mai"],
    PH: ["Manila", "Cebu"],
    TW: ["Taipei", "Kaohsiung"],
    PL: ["Warsaw", "Krakow"],
    RO: ["Bucharest", "Cluj"],
    HU: ["Budapest", "Debrecen"]
};

const packages = { Basic: 100, Plus: 500, Pro: 1000, Max: 2500 };
const countryData = {
    US: { tollFree: 0.05, local: 0.03, national: 0.04 },
    GB: { tollFree: 0.06, local: 0.04, national: 0.05 },
    CA: { tollFree: 0.05, local: 0.03, national: 0.04 },
    AU: { tollFree: 0.06, local: 0.04, national: 0.05 },
    DE: { tollFree: 0.07, local: 0.05, national: 0.06 },
    FR: { tollFree: 0.07, local: 0.05, national: 0.06 },
    IN: { tollFree: 0.04, local: 0.02, national: 0.03 },
    ZA: { tollFree: 0.05, local: 0.03, national: 0.04 },
    BR: { tollFree: 0.06, local: 0.04, national: 0.05 },
    MX: { tollFree: 0.05, local: 0.03, national: 0.04 },
    JP: { tollFree: 0.08, local: 0.06, national: 0.07 },
    IT: { tollFree: 0.07, local: 0.05, national: 0.06 },
    ES: { tollFree: 0.07, local: 0.05, national: 0.06 },
    NL: { tollFree: 0.06, local: 0.04, national: 0.05 },
    CH: { tollFree: 0.08, local: 0.06, national: 0.07 },
    SE: { tollFree: 0.06, local: 0.04, national: 0.05 },
    SG: { tollFree: 0.07, local: 0.05, national: 0.06 },
    IE: { tollFree: 0.06, local: 0.04, national: 0.05 },
    NZ: { tollFree: 0.06, local: 0.04, national: 0.05 },
    NO: { tollFree: 0.07, local: 0.05, national: 0.06 },
    PT: { tollFree: 0.07, local: 0.05, national: 0.06 },
    BE: { tollFree: 0.07, local: 0.05, national: 0.06 },
    KR: { tollFree: 0.08, local: 0.06, national: 0.07 },
    TR: { tollFree: 0.06, local: 0.04, national: 0.05 },
    TH: { tollFree: 0.05, local: 0.03, national: 0.04 },
    PH: { tollFree: 0.04, local: 0.02, national: 0.03 },
    TW: { tollFree: 0.07, local: 0.05, national: 0.06 },
    PL: { tollFree: 0.06, local: 0.04, national: 0.05 },
    RO: { tollFree: 0.06, local: 0.04, national: 0.05 },
    HU: { tollFree: 0.06, local: 0.04, national: 0.05 }
};

// DOM elements
const countrySelectEl = document.getElementById('country');
const plansContainerEl = document.getElementById('plans-container');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartVATEl = document.getElementById('cart-vat');
const cartTotalEl = document.getElementById('cart-total');
const cartWrapper = document.getElementById('cart-wrapper');
const cartButton = document.getElementById('cart-button');
const cartClose = document.getElementById('cart-close');

let cart = JSON.parse(localStorage.getItem('callOrbitCart')) || [];

// Populate country dropdown
countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = countryNames[c];
    countrySelectEl.appendChild(opt);
});

// Normalize plan names
function normalizePlanName(pkg) {
    return packages.hasOwnProperty(pkg) ? pkg : pkg.split(' ')[0];
}

// Generate plans
function generatePlans() {
    const country = countrySelectEl.value;
    const numberType = document.getElementById('number-type').value;
    const areaContainer = document.getElementById('area-container');
    const areaSelect = document.getElementById('area');

    if (numberType === 'local') {
        areaContainer.style.display = 'block';
        areaSelect.innerHTML = '';
        localAreas[country].forEach(a => {
            const opt = document.createElement('option');
            opt.value = a;
            opt.textContent = a;
            areaSelect.appendChild(opt);
        });
    } else { areaContainer.style.display = 'none'; }

    plansContainerEl.innerHTML = '';
    Object.keys(packages).forEach(pkg => {
        const mins = packages[pkg];
        const rate = countryData[country][numberType];
        const basePrice = +(rate * mins).toFixed(2);
        const setupFee = 15.00; // One-time setup
        const trainingFee = 25.00; // Optional training
        const div = document.createElement('div');
        div.className = 'plan';
        div.innerHTML = `
            <h3>${pkg}</h3>
            <div class="price">Recurring: $${basePrice.toFixed(2)}/month</div>
            <div class="minutes">${mins} Minutes, Monthly Subscription</div>
            <div class="overage">Overage: $${rate.toFixed(3)}/min</div>
            <div class="price">Setup Fee: $${setupFee.toFixed(2)}</div>
            <div><label><input type="checkbox" class="training-option"> Add Training ($${trainingFee.toFixed(2)})</label></div>
            <button class="buy-now">Add to Cart</button>`;
        const btn = div.querySelector('button');
        btn.addEventListener('click', () => {
            const forward = document.getElementById('forward').value || '';
            const area = numberType === 'local' ? areaSelect.value : '';
            const trainingSelected = div.querySelector('.training-option').checked;
            const normalizedPkg = normalizePlanName(pkg);
            let totalPrice = basePrice + setupFee;
            if (trainingSelected) totalPrice += trainingFee;
            cart.push({
                plan: normalizedPkg,
                country,
                numberType,
                area,
                price: totalPrice,
                recurring: basePrice,
                setupFee,
                training: trainingSelected ? trainingFee : 0,
                forward,
                quantity: 1
            });
            updateCart();
        });
        plansContainerEl.appendChild(div);
    });
}

// Update cart display
function updateCart() {
    cartItemsEl.innerHTML = '';
    let subtotal = 0;
    cart.forEach((item, i) => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>
                <strong>${item.plan}</strong> (${item.country} - ${item.numberType}${item.area ? ' - ' + item.area : ''}) x ${item.quantity}
                <div class="cart-details">
                    Forwarding: ${item.forward || 'N/A'}
                    <br>
                    Recurring: $${item.recurring.toFixed(2)} / month
                    <br>
                    Setup Fee: $${item.setupFee.toFixed(2)}
                    ${item.training ? `<br>Training: $${item.training.toFixed(2)}` : ''}
                </div>
            </span>
            <span>$${(item.price * item.quantity).toFixed(2)} <button class="remove-btn" data-index="${i}">x</button></span>
        `;
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
    cartSubtotalEl.textContent = '$' + subtotal.toFixed(2);
    cartVATEl.textContent = '$' + vat.toFixed(2);
    cartTotalEl.textContent = '$' + total.toFixed(2);
    cartButton.textContent = `Cart 🛒 (${cart.length} items - $${total.toFixed(2)})`;
    localStorage.setItem('callOrbitCart', JSON.stringify(cart));
}

// Event listeners
countrySelectEl.addEventListener('change', generatePlans);
document.getElementById('number-type').addEventListener('change', generatePlans);
cartButton.addEventListener('click', () => cartWrapper.classList.toggle('active'));
cartClose.addEventListener('click', () => cartWrapper.classList.remove('active'));

generatePlans();

// PayPal integration
paypal.Buttons({
    createOrder: function (data, actions) {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * (1 + VAT_RATE);
        return actions.order.create({ purchase_units: [{ amount: { value: total.toFixed(2) } }] });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
            cart = [];
            updateCart();
        });
    }
}).render('#paypal-button-container');
