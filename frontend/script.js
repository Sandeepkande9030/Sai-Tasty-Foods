
// ========================================
// DJANGO BACKEND URL
// ========================================

const API_BASE_URL =
    "https://backend-dl8i.vercel.app";
// ================================
// CART
// ================================

// Get existing cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================================
// ADD TO CART
// ================================

function addToCart(name, price) {

    // Check login status
    let isLoggedIn = localStorage.getItem("isLoggedIn");

    // If user is not logged in
    if (isLoggedIn !== "true") {

        alert("Please login first to add items to cart.");

        window.location.href = "login.html";

        return;
    }

    console.log("Add to Cart clicked:", name, price);

    // Check whether item already exists
    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {

        // Increase quantity
        existingItem.quantity++;

    } else {

        // Add new item
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }

    // Save cart
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show message
    alert(name + " added to cart");

    // Display cart
    displayCart();
}

// ================================
// DISPLAY CART
// ================================

function displayCart() {

    let cartItems = document.getElementById("cartItems");
    let totalPrice = document.getElementById("totalPrice");

    // We are on Home page
    if (!cartItems) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        let itemTotal = item.price * item.quantity;

        total += itemTotal;

        cartItems.innerHTML += `

    <div class="cart-item"> 

        <div> 
            <h3>${item.name}</h3> 
            <p>₹${item.price} × ${item.quantity}</p> 
        </div> 

        <div class="quantity"> 

            <button onclick="decreaseQuantity(${index})"> 
                - 
            </button> 

            <span>${item.quantity}</span> 

            <button onclick="increaseQuantity(${index})"> 
                + 
            </button> 

        </div> 

        <div> 
            <strong>₹${itemTotal}</strong> 
        </div> 

        <button class="remove-btn" 
                onclick="removeItem(${index})"> 
            Remove 
        </button> 

    </div>

`;
    });

    totalPrice.innerText = "₹" + total;
}


// ================================
// INCREASE QUANTITY
// ================================

function increaseQuantity(index) {

    cart[index].quantity++;

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


// ================================
// DECREASE QUANTITY
// ================================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


// ================================
// REMOVE ITEM
// ================================

function removeItem(index) {

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));


    displayCart();
}


// ================================
// CHECKOUT
// ================================

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty");

        return;
    }

    alert("Proceeding to Buy");

}


// ================================
// LOAD CART
// ================================

displayCart();
// =================================
// CART COUNT
// =================================

function updateCartCount() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let totalItems = 0;

    cart.forEach(function(item) {
        totalItems += item.quantity;
    });

    let cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

updateCartCount();

/// =====================================
// LOGIN USER - DJANGO + MYSQL
// =====================================

let loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        let email =
            document.getElementById("loginEmail").value.trim();

        let password =
            document.getElementById("loginPassword").value;

        let loginMessage =
            document.getElementById("loginMessage");


        // Check empty fields
        if (!email || !password) {

            loginMessage.textContent =
                "Please enter email and password.";

            loginMessage.style.color = "red";

            return;
        }


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/login/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            // Login successful
            if (response.ok) {

                loginMessage.textContent =
                    data.message;

                loginMessage.style.color =
                    "green";


                // Save logged-in user
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(data.user)
                );


                // Save login status
                localStorage.setItem(
                    "isLoggedIn",
                    "true"
                );


                // Go to home page
                setTimeout(function() {

                    window.location.href =
                        "index.html";

                }, 1000);


            } else {

                loginMessage.textContent =
                    data.error || "Invalid email or password.";

                loginMessage.style.color =
                    "red";
            }


        } catch (error) {

            console.error("Login Error:", error);

            loginMessage.textContent =
                "Unable to connect to Django server.";

            loginMessage.style.color =
                "red";
        }

    });

}
// ================================
// USER ACCOUNT + CART VISIBILITY
// ================================

function showUserAccount() {

    let isLoggedIn = localStorage.getItem("isLoggedIn");

    let user = JSON.parse(localStorage.getItem("currentUser"));

    let loginLink = document.getElementById("loginLink");

    let userAccount = document.getElementById("userAccount");

    let cartLink = document.getElementById("cartLink");

    let userName = document.getElementById("userName");

    let menuUserName = document.getElementById("menuUserName");


    // ================================
    // USER IS LOGGED IN
    // ================================

    if (isLoggedIn === "true" && user) {

        // Hide Login
        if (loginLink) {
            loginLink.style.display = "none";
        }

        // Show User Account
        if (userAccount) {
            userAccount.style.display = "block";
        }

        // Show Cart
        if (cartLink) {
            cartLink.style.display = "inline-block";
        }

        // Show user's name
        if (userName) {
            userName.textContent = user.name;
        }

        if (menuUserName) {
            menuUserName.textContent = user.name;
        }

    }

    // ================================
    // USER IS NOT LOGGED IN
    // ================================

    else {

        // Show Login
        if (loginLink) {
            loginLink.style.display = "block";
        }

        // Hide User Account
        if (userAccount) {
            userAccount.style.display = "none";
        }

        // Hide Cart
        if (cartLink) {
            cartLink.style.display = "none";
        }

    }
}


// ================================
// OPEN / CLOSE USER MENU
// ================================

function toggleUserMenu() {

    let userMenu = document.getElementById("userMenu");

    if (userMenu) {
        userMenu.classList.toggle("show");
    }
}

// ================================
// LOGOUT
// ================================

function logoutUser() {

    // Remove login status
    localStorage.removeItem("isLoggedIn");

    // Remove logged-in user
    localStorage.removeItem("currentUser");

    // Go back to home page
    window.location.href = "index.html";
}


// ================================
// LOAD USER ACCOUNT
// ================================

showUserAccount();
    
// =====================================
// REGISTER USER - DJANGO + MYSQL
// =====================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const registerMessage = document.getElementById("registerMessage");

        // Check password
        if (password !== confirmPassword) {
            registerMessage.textContent = "Passwords do not match.";
            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/register/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                registerMessage.textContent = data.message;

                // Clear form
                registerForm.reset();

                // After successful registration
                setTimeout(function() {
                    window.location.href = "login.html";
                }, 1500);

            } else {

                registerMessage.textContent =
                    data.error || "Registration failed.";

            }

        } catch (error) {

            console.error("Registration Error:", error);

            registerMessage.textContent =
                "Unable to connect to server.";

        }

    });

}