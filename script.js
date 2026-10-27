// Product data stored as an array of objects
const products = [
    {
        id: 1,
        name: "Cloud Headphones",
        category: "Tech",
        price: 1499,
        image: "https://placehold.co/400x300/e7eddb/252720?text=Headphones"
    },
    {
        id: 2,
        name: "Pocket Speaker",
        category: "Tech",
        price: 999,
        image: "https://placehold.co/400x300/e7eddb/252720?text=Speaker"
    },
    {
        id: 3,
        name: "Everyday Tote",
        category: "Style",
        price: 599,
        image: "https://placehold.co/400x300/f5e7e2/252720?text=Tote+Bag"
    },
    {
        id: 4,
        name: "Classic Watch",
        category: "Style",
        price: 1799,
        image: "https://placehold.co/400x300/f5e7e2/252720?text=Watch"
    },
    {
        id: 5,
        name: "Desk Lamp",
        category: "Lifestyle",
        price: 799,
        image: "https://placehold.co/400x300/e7eddb/252720?text=Desk+Lamp"
    },
    {
        id: 6,
        name: "Travel Bottle",
        category: "Lifestyle",
        price: 399,
        image: "https://placehold.co/400x300/e7eddb/252720?text=Bottle"
    }
];

// Cart stores product IDs as keys and quantities as values
let cart = {};
let couponApplied = false;

// Selecting HTML elements using the DOM
const productList = document.querySelector("#product-list");
const cartItems = document.querySelector("#cart-items");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const sortSelect = document.querySelector("#sort");
const message = document.querySelector("#message");

// Display products after searching, filtering and sorting
function displayProducts() {
    const search = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;

    // filter() keeps products matching the search and category
    let filteredProducts = products.filter(function(product) {
        const matchesName = product.name.toLowerCase().includes(search);
        const matchesCategory =
            category === "All" || product.category === category;

        return matchesName && matchesCategory;
    });

    // sort() changes the order of the filtered products
    if (sort === "low") {
        filteredProducts.sort(function(a, b) {
            return a.price - b.price;
        });
    } else if (sort === "high") {
        filteredProducts.sort(function(a, b) {
            return b.price - a.price;
        });
    } else if (sort === "name") {
        filteredProducts.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    }

    // map() creates the HTML for each product
    // join("") combines all product HTML strings
    productList.innerHTML = filteredProducts.map(function(product) {
        return `
            <div class="product-card">
                <img class="product-image"
                    src="${product.image}" alt="${product.name}">

                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>

                <div class="product-bottom">
                    <span class="price">₹${product.price}</span>

                    <button onclick="addToCart(${product.id})">
                        Add to bag +
                    </button>
                </div>
            </div>
        `;
    }).join("");

    // Display a message when no products match
    if (filteredProducts.length === 0) {
        productList.innerHTML =
            '<p class="empty-message">No matching products found.</p>';
    }

    document.querySelector("#product-count").textContent =
        filteredProducts.length + " products";
}

// Add a product or increase its quantity
function addToCart(id) {
    if (cart[id]) {
        cart[id]++;
    } else {
        cart[id] = 1;
    }

    couponApplied = false;
    message.textContent = "";
    renderCart();
}

// Increase or decrease quantity
function changeQuantity(id, change) {
    cart[id] = cart[id] + change;

    // Remove the item if its quantity reaches zero
    if (cart[id] <= 0) {
        delete cart[id];
    }

    couponApplied = false;
    message.textContent = "";
    renderCart();
}

// Remove an item completely
function removeItem(id) {
    delete cart[id];

    couponApplied = false;
    message.textContent = "";
    renderCart();
}

// Calculate prices and display cart items
function renderCart() {
    // Object.entries() converts cart into key-value pairs
    const entries = Object.entries(cart);

    // map() generates the HTML for each cart item
    cartItems.innerHTML = entries.map(function([id, quantity]) {
        const product = products.find(function(item) {
            return item.id === Number(id);
        });

        return `
            <div class="cart-item">
                <div>
                    <h3>${product.name}</h3>
                    <p>₹${product.price} each</p>
                </div>

                <div class="quantity">
                    <button onclick="changeQuantity(${id}, -1)">−</button>
                    <span>${quantity}</span>
                    <button onclick="changeQuantity(${id}, 1)">+</button>
                </div>

                <strong>₹${product.price * quantity}</strong>

                <button class="remove-btn"
                    onclick="removeItem(${id})">
                    Remove
                </button>
            </div>
        `;
    }).join("");

    // Show an empty-cart message
    if (entries.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-message">Your bag is waiting for something nice.</p>';
    }

    // reduce() calculates the total price of all cart items
    const subtotal = entries.reduce(function(sum, entry) {
        const id = Number(entry[0]);
        const quantity = entry[1];

        const product = products.find(function(item) {
            return item.id === id;
        });

        return sum + product.price * quantity;
    }, 0);

    // Calculate the coupon discount
    let discount = 0;

    if (couponApplied) {
        discount = subtotal * 0.10;
    }

    const total = subtotal - discount;

    // Update HTML using textContent
    document.querySelector("#subtotal").textContent = subtotal;
    document.querySelector("#discount").textContent = discount;
    document.querySelector("#total").textContent = total;

    // forEach() updates the total quantity in the header
    let itemCount = 0;

    entries.forEach(function(entry) {
        itemCount = itemCount + entry[1];
    });

    document.querySelector("#cart-count").textContent = itemCount;
}

// Apply the NOVA10 coupon for a 10% discount
function applyCoupon() {
    const coupon = document.querySelector("#coupon").value
        .trim().toUpperCase();

    if (Object.keys(cart).length === 0) {
        couponApplied = false;
        message.textContent = "Add something to your bag first.";
    } else if (coupon === "NOVA10") {
        couponApplied = true;
        message.textContent = "Your 10% discount is applied.";
    } else {
        couponApplied = false;
        message.textContent = "That coupon code is not valid.";
    }

    renderCart();
}

// Demo checkout UI; no real order or payment is processed
function checkout() {
    if (Object.keys(cart).length === 0) {
        message.textContent = "Your shopping bag is empty.";
        return;
    }

    const total = document.querySelector("#total").textContent;

    alert("Thanks for shopping with Nova Cart!\nYour total is ₹" + total);

    // Clear the cart after the demo checkout
    cart = {};
    couponApplied = false;

    document.querySelector("#coupon").value = "";
    message.textContent = "";

    renderCart();
}

// Event listeners for searching, filtering and sorting
searchInput.addEventListener("input", displayProducts);
categorySelect.addEventListener("change", displayProducts);
sortSelect.addEventListener("change", displayProducts);

document.querySelector("#apply-coupon")
    .addEventListener("click", applyCoupon);

document.querySelector("#checkout-btn")
    .addEventListener("click", checkout);

// Initial display when the page loads
displayProducts();
renderCart();
