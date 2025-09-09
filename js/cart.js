// Persistent Cart with VAT
let cart = JSON.parse(localStorage.getItem("callOrbitCart")) || [];
const VAT_RATE = 0.15; // 15% VAT

// Add a plan to cart
function addPlanToCart(plan) {
    const trainingFee = plan.includeTraining ? plan.training : 0;
    const firstMonthSubtotal = plan.monthly + plan.setup + trainingFee;
    const vat = +(firstMonthSubtotal * VAT_RATE).toFixed(2);
    const totalFirstMonth = +(firstMonthSubtotal + vat).toFixed(2);

    const item = {
        name: plan.name,
        monthly: plan.monthly,
        setup: plan.setup,
        training: trainingFee,
        vat,
        totalFirstMonth
    };

    cart.push(item);
    saveCart();
    renderCart();
}

// Get customer info from form
function getCustomerInfo() {
    return {
        name: document.getElementById("customer-name")?.value || "",
        email: document.getElementById("customer-email")?.value || "",
        phone: document.getElementById("customer-phone")?.value || "",
        company: document.getElementById("customer-company")?.value || ""
    };
}

// Validate customer info
function validateCustomerInfo() {
    const { name, email } = getCustomerInfo();
    if (!name || !email) {
        alert("Please enter your name and email before checkout.");
        return false;
    }
    return true;
}

// Render the cart
function renderCart() {
    const cartItemsEl = document.getElementById("cart-items");
    const cartSubtotalEl = document.getElementById("cart-subtotal");
    const cartVATEl = document.getElementById("cart-vat");
    const cartTotalEl = document.getElementById("cart-total");

    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = "";
    let subtotal = 0;
    let totalVAT = 0;

    cart.forEach((item, i) => {
        subtotal += item.monthly + item.setup + item.training;
        totalVAT += item.vat;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div style="flex:1">
                <strong>${item.name}</strong><br>
                Monthly: $${item.monthly.toFixed(2)}<br>
                Setup: $${item.setup.toFixed(2)}${item.training ? ` + Training: $${item.training.toFixed(2)}` : ""}<br>
                VAT: $${item.vat.toFixed(2)}
            </div>
            <div style="text-align:right">
                $${item.totalFirstMonth.toFixed(2)} 
                <button class="remove-btn" data-index="${i}">x</button>
            </div>
        `;
        cartItemsEl.appendChild(div);
    });

    if (cartSubtotalEl) cartSubtotalEl.textContent = "$" + subtotal.toFixed(2);
    if (cartVATEl) cartVATEl.textContent = "$" + totalVAT.toFixed(2);
    if (cartTotalEl) cartTotalEl.textContent = "$" + (subtotal + totalVAT).toFixed(2);

    // Remove buttons
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const idx = parseInt(e.target.dataset.index);
            cart.splice(idx, 1);
            saveCart();
            renderCart();
        });
    });

    updateCartButton();
    renderPayPal();
}

// Update cart button in navbar
function updateCartButton() {
    const total = cart.reduce((sum, item) => sum + item.totalFirstMonth, 0).toFixed(2);
    const cartButton = document.getElementById("cart-button");
    if (cartButton) cartButton.textContent = `Cart 🛒 (${cart.length} items - $${total})`;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem("callOrbitCart", JSON.stringify(cart));
}

// PayPal integration
function renderPayPal() {
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.totalFirstMonth, 0).toFixed(2);

    paypal.Buttons({
        createOrder: (data, actions) => {
            if (!validateCustomerInfo()) return;
            return actions.order.create({ purchase_units: [{ amount: { value: total } }] });
        },
        onApprove: (data, actions) =>
            actions.order.capture().then(details => {
                alert("Payment completed by " + details.payer.name.given_name);
                cart = [];
                saveCart();
                renderCart();
            })
    }).render("#paypal-button-container");
}

// Toggle cart drawer
const cartButtonEl = document.getElementById("cart-button");
const cartWrapper = document.getElementById("cart-wrapper");
const cartClose = document.getElementById("cart-close");

if (cartButtonEl && cartWrapper) {
    cartButtonEl.addEventListener("click", () => cartWrapper.classList.toggle("active"));
}
if (cartClose && cartWrapper) {
    cartClose.addEventListener("click", () => cartWrapper.classList.remove("active"));
}

// Hook up all Add to Cart buttons
document.querySelectorAll(".buy-now").forEach(btn => {
    btn.addEventListener("click", () => {
        const planDiv = btn.closest(".plan");
        const planName = planDiv.querySelector("h3").textContent;
        const setup = parseFloat(planDiv.dataset.setup);
        const training = parseFloat(planDiv.dataset.training);
        const monthly = parseFloat(planDiv.dataset.monthly);

        addPlanToCart({
            name: planName,
            monthly,
            setup,
            training,
            includeTraining: true
        });
    });
});

// Sync cart across tabs
window.addEventListener("storage", e => {
    if (e.key === "callOrbitCart") {
        cart = JSON.parse(e.newValue) || [];
        renderCart();
    }
});

// Initialize cart on page load
renderCart();
