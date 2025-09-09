let cart = JSON.parse(localStorage.getItem("callOrbitCart")) || [];

const VAT_RATE = 0.15; // 15% VAT – adjust if needed

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

// Render the cart
function renderCart() {
    const cartItemsEl = document.getElementById("cart-items");
    const cartTotalEl = document.getElementById("cart-total");
    cartItemsEl.innerHTML = "";

    let grandTotal = 0;

    cart.forEach((item, i) => {
        grandTotal += item.totalFirstMonth;

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

    cartTotalEl.textContent = "$" + grandTotal.toFixed(2);

    // Hook up remove buttons
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

// Update cart button text
function updateCartButton() {
    const total = cart.reduce((sum, item) => sum + item.totalFirstMonth, 0).toFixed(2);
    document.getElementById("cart-button").textContent = `Cart 🛒 (${cart.length} items - $${total})`;
}

// Save cart
function saveCart() {
    localStorage.setItem("callOrbitCart", JSON.stringify(cart));
}

// PayPal integration
function renderPayPal() {
    const container = document.getElementById("paypal-button-container");
    container.innerHTML = "";
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.totalFirstMonth, 0).toFixed(2);

    paypal.Buttons({
        createOrder: (data, actions) =>
            actions.order.create({
                purchase_units: [{ amount: { value: total } }]
            }),
        onApprove: (data, actions) =>
            actions.order.capture().then(details => {
                alert("Payment completed by " + details.payer.name.given_name);
                cart = [];
                saveCart();
                renderCart();
            })
    }).render("#paypal-button-container");
}

// Event listeners
document.getElementById("cart-button").addEventListener("click", () =>
    document.getElementById("cart-wrapper").classList.toggle("active")
);
document.getElementById("cart-close").addEventListener("click", () =>
    document.getElementById("cart-wrapper").classList.remove("active")
);

// Hook up plan buttons
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
            includeTraining: true // always include, or make optional later
        });
    });
});

// Sync across tabs
window.addEventListener("storage", e => {
    if (e.key === "callOrbitCart") {
        cart = JSON.parse(e.newValue) || [];
        renderCart();
    }
});

renderCart();
