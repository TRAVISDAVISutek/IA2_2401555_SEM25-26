/*
 Name: Travis Davis ID#: 2401555
 Assignment: Internal Assessment #2 - Greenova Pantry - Ready-to-Cook Meal Kits
 */

// =========================================================================
// 1. Data Consistency
// =========================================================================

const products =
[
    // MAIN DISH PRICES
    { id: 'kit101', name: 'Curry Goat Kit', price: 4500.00 },
    { id: 'kit102', name: 'Curry Chicken Kit', price: 3000.00 },
    { id: 'kit103', name: 'Curry Beef Kit', price: 3500.00 },
    { id: 'kit104', name: 'Fried Chicken Kit', price: 3000.00 },
    { id: 'kit105', name: 'Stew Beef Kit', price: 2500.00 },
    { id: 'kit106', name: 'Brown Stew Chicken Kit', price: 3000.00 },
    { id: 'kit107', name: 'Jerk Chicken Kit', price: 3200.00 },
    { id: 'kit108', name: 'Oxtail Meal Kit', price: 4500.00 },
    { id: 'kit109', name: 'Escovitch Fish Kit', price: 4500.00 },

    //SIDE DISH PRICES
    { id: 'kit201', name: 'Rice & Peas Kit', price: 1000.00 },
    { id: 'kit202', name: 'White Rice Kit', price: 1000.00 },
    { id: 'kit203', name: 'Mashed Potatoes Kit', price: 1000.00 },
    { id: 'kit204', name: 'Dumplings Kit', price: 1000.00 }
];

// Rates & Discount Constants
const SHIPPING_RATE = 1000.00;
const TAX_RATE = 0.15; // 15% Tax
const MIN_ORDER_FOR_DISCOUNT = 10000.00;
const AUTOMATIC_DISCOUNT_RATE = 0.05; // 5% Discount

// Shopping Cart State (holds items currently added by user)
let cart = [];
let discountAmount = 0.00;

// =========================================================================
// 2. Views
// =========================================================================

const views =
{
    home: document.getElementById('home-view'),
    cart: document.getElementById('cart-view'),
    checkout: document.getElementById('checkout-view'),
    login: document.getElementById('login-view'),
    about: document.getElementById('about-view'),
    register: document.getElementById('register-view'), 
};

const navLinks =
{
    home: document.getElementById('nav-home'),
    cart: document.getElementById('nav-cart'),
    login: document.getElementById('nav-login'),
    about: document.getElementById('nav-about'),
};

// Function to hide all views and show only the target view
function showView(viewName)
{
    // Hide all views
    Object.values(views).forEach(view =>
    {
        if (view)
        {
            view.classList.add('hidden-view');
        }
    });

    // Remove active class from all links
    Object.values(navLinks).forEach(link =>
    {
        if (link)
        {
            link.classList.remove('active');
        }
    });

    // Show the target view
    const targetView = views[viewName];
    if (targetView)
    {
        targetView.classList.remove('hidden-view');
    }

    // Set active class on the corresponding link
    const targetLink = navLinks[viewName];
    if (targetLink)
    {
        targetLink.classList.add('active');
    }

    if (viewName === 'cart')
    {
        renderCart();
    }
    if (viewName === 'checkout')
    {
        calculateAndRenderSummary(false); 
        toggleCheckoutFields();
    }
}

document.addEventListener('DOMContentLoaded', () =>
{
    showView('home');
});


// =========================================================================
// 3. CART (ADD, REMOVE, RENDER)
// =========================================================================

// Event listener for all "Add to Cart" buttons
document.getElementById('product-list').addEventListener('click', (e) =>
{
    if (e.target.classList.contains('add-to-cart-btn'))
    {
        const productId = e.target.getAttribute('data-id');
        addItemToCart(productId);
    }
});

function addItemToCart(productId)
{
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem)
    {
        existingItem.quantity += 1;
    }
    else
    {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartCount();
    // Update cart view 
    if (!views.cart.classList.contains('hidden-view'))
    {
        renderCart();
    }
    alert(`${product.name} added to cart!`);
}

function removeItemFromCart(productId)
{
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1)
    {
        const item = cart[itemIndex];
        if (item.quantity > 1)
        {
            item.quantity -= 1;
        }
        else
        {
            // Remove the item entirely if quantity is 1
            cart.splice(itemIndex, 1);
        }
    }
    updateCartCount();
    renderCart(); 
}

function deleteItemFromCart(productId)
{
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
}

function updateCartCount()
{
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = `(${count})`;
    document.getElementById('nav-cart').querySelector('span').textContent = `(${count})`;
}

// =========================================================================
// 4. RENDERING FUNCTIONS
// =========================================================================

const cartContainer = document.getElementById('cart-items-container');

function renderCart()
{
    cartContainer.innerHTML = '';

    if (cart.length === 0)
    {
        cartContainer.innerHTML = '<p style="text-align: center; margin-top: 20px;">Your cart is empty.</p>';
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('cart-summary').style.display = 'none';
        return;
    }

    document.getElementById('checkout-btn').disabled = false;
    document.getElementById('cart-summary').style.display = 'block';

    cart.forEach(item =>
    {
        const itemTotal = item.price * item.quantity;
        const cartItemHTML = `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-details">
                    <strong>${item.name}</strong>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="remove-btn" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="add-btn" data-id="${item.id}">+</button>
                    <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                    <button class="delete-btn" data-id="${item.id}" style="background-color: #e74c3c;">X</button>
                </div>
            </div>
        `;
        cartContainer.innerHTML += cartItemHTML;
    });

    calculateAndRenderSummary(true);
}

cartContainer.addEventListener('click', (e) =>
{
    const productId = e.target.getAttribute('data-id');
    if (e.target.classList.contains('add-btn'))
    {
        addItemToCart(productId);
    }
    else if (e.target.classList.contains('remove-btn'))
    {
        removeItemFromCart(productId);
    }
    else if (e.target.classList.contains('delete-btn'))
    {
        deleteItemFromCart(productId);
    }
});


// =========================================================================
// 5. SUMMARY AND TOTALS
// =========================================================================

function calculateAndRenderSummary(isCartView)
{
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // --- DISCOUNT ---
    let appliedDiscount = discountAmount;

    if (subtotal >= MIN_ORDER_FOR_DISCOUNT)
    {
        const autoDiscount = subtotal * AUTOMATIC_DISCOUNT_RATE;
        appliedDiscount = Math.max(autoDiscount, discountAmount);
    }

    const subtotalAfterDiscount = subtotal - appliedDiscount;

    // Discount message
    const couponMessage = document.getElementById('coupon-message');
    if (couponMessage)
    {
        if (subtotal >= MIN_ORDER_FOR_DISCOUNT)
        {
            couponMessage.textContent = `Automatic 5% discount applied! Savings of $${appliedDiscount.toFixed(2)}`;
            couponMessage.style.color = 'blue';
        }
        else
        {
            couponMessage.textContent = '';
        }
    }


    // --- SHIPPING CALCULATION ---
    let shippingCost = 0.00;

    if (subtotal > 0)
    {
        if (!isCartView)
        {
            // CHECKOUT VIEW
            const deliveryRadio = document.getElementById('co-delivery');
            if (deliveryRadio && deliveryRadio.checked)
            {
                shippingCost = SHIPPING_RATE;
            }
        }
        else
        {
            // CART VIEW
            shippingCost = SHIPPING_RATE;
        }
    }

    const taxAmount = (subtotalAfterDiscount + shippingCost) * TAX_RATE;
    const finalTotal = subtotalAfterDiscount + shippingCost + taxAmount;

    // --- RENDERING ---

    if (isCartView)
    {
        // CART VIEW
        document.getElementById('cart-sub-total').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-discount').textContent = `-$${appliedDiscount.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `$${taxAmount.toFixed(2)}`;
        document.getElementById('cart-final-total').textContent = `$${finalTotal.toFixed(2)}`;
    }
    else
    {
        // CHECKOUT VIEW
        document.getElementById('co-sub-total').textContent = `$${subtotal.toFixed(2)}`;
        const taxDiscountAmount = taxAmount - appliedDiscount;
        document.getElementById('co-tax-discount').textContent = `$${taxDiscountAmount.toFixed(2)}`;
        document.getElementById('co-shipping-cost').textContent = `$${shippingCost.toFixed(2)}`;
        document.getElementById('co-final-total').textContent = `$${finalTotal.toFixed(2)}`;
    }

    return finalTotal;
}


// =========================================================================
// 6. CHECKOUT 
// =========================================================================

const deliveryGroup = document.getElementById('delivery-group');
const pickupGroup = document.getElementById('pickup-group');
const deliveryRadio = document.getElementById('co-delivery');
const pickupRadio = document.getElementById('co-pickup');

function toggleCheckoutFields()
{
    if (deliveryRadio.checked)
    {
        deliveryGroup.classList.remove('hidden-field');
        pickupGroup.classList.add('hidden-field');
    }
    else if (pickupRadio.checked)
    {
        deliveryGroup.classList.add('hidden-field');
        pickupGroup.classList.remove('hidden-field');
    }
}

// Attach event listeners to the radio buttons
function handleShippingChange()
{
    toggleCheckoutFields();
    calculateAndRenderSummary(false); 
}
if (deliveryRadio) deliveryRadio.addEventListener('change', handleShippingChange);
if (pickupRadio) pickupRadio.addEventListener('change', handleShippingChange);


document.getElementById('checkout-form').addEventListener('submit', function (e)
{
    e.preventDefault();

    if (cart.length === 0)
    {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }

    // Form Validation 
    const fullName = document.getElementById('co-name').value;
    const paymentAmount = document.getElementById('co-payment-amount').value;

    if (!fullName || !paymentAmount)
    {
        alert("Please fill in all required fields (Full Name and Payment Amount).");
        return;
    }

    // --- Shipping/Pickup Validation ---

    const deliveryRadio = document.getElementById('co-delivery');
    const pickupRadio = document.getElementById('co-pickup');

    if (deliveryRadio && deliveryRadio.checked)
    {
        // Validation for Delivery
        const address = document.getElementById('co-address').value.trim();
        if (!address)
        {
            alert("Please provide a Delivery Address.");
            return; 
        }
    }
    else if (pickupRadio && pickupRadio.checked)
    {
        // Validation for Pickup
        const pickupLocation = document.getElementById('co-pickup-location').value;
        if (!pickupLocation)
        {
            alert("Please select a Pickup Location.");
            return; 
        }
    }

    // --- Order Validation ---

    // Order Submission
    const orderTotal = calculateAndRenderSummary(false);

    alert(`✅ Order confirmed! Your total charged is $${orderTotal.toFixed(2)}. Thank you for your purchase!`);


    // Reset CartState
    cart = [];
    updateCartCount();
    showView('home');
});


// =========================================================================
// 7. LOGIN/REGISTRATION
// =========================================================================

document.getElementById('login-form').addEventListener('submit', function (e)
{
    e.preventDefault();
    alert('Login successful! Welcome back.');
    showView('home');
});

document.getElementById('register-form').addEventListener('submit', function (e)
{
    e.preventDefault();
    alert('Registration successful! Please log in.');
    showView('login'); // Registration redirects to login
});

// Initial View Setup (Button Event Listeners)

document.getElementById('nav-home').addEventListener('click', (e) =>
{
    e.preventDefault();
    showView('home');
});

document.getElementById('nav-cart').addEventListener('click', (e) =>
{
    e.preventDefault();
    showView('cart');
});

document.getElementById('nav-login').addEventListener('click', (e) =>
{
    e.preventDefault();
    showView('login');
});

document.getElementById('nav-about').addEventListener('click', (e) =>
{
    e.preventDefault();
    showView('about');
});


document.getElementById('checkout-btn').addEventListener('click', () => showView('checkout'));
document.getElementById('checkout-cancel-btn').addEventListener('click', () => showView('cart'));

document.getElementById('toggle-to-register').addEventListener('click', (e) =>
{
    e.preventDefault(); // Stop the page from jumping
    document.getElementById('login-view').classList.add('hidden-view'); // Hide Login View
    document.getElementById('register-view').classList.remove('hidden-view'); // Show Register View
});

document.getElementById('toggle-to-login').addEventListener('click', (e) =>
{
    e.preventDefault(); // Stop the page from jumping
    document.getElementById('register-view').classList.add('hidden-view'); // Hide Register View
    document.getElementById('login-view').classList.remove('hidden-view'); // Show Login View
});


// =========================================================================
// 8. CART (CLEAR ALL FUNCTION)
// =========================================================================

document.getElementById('clear-all-btn').addEventListener('click', function ()
{
    // 1. User Confirmation
    const confirmation = confirm("Are you sure you want to clear all items from your cart?");

    if (confirmation)
    {
        // 2. Reset the cart state
        cart = [];

        // 3. Update the cart count (navigation header)
        updateCartCount();

        renderCart();

        alert("Your shopping cart has been cleared!");
    }
});