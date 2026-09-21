// ================================
// DJANGO BACKEND
// ================================

const API_URL = "https://backend-dl8i.vercel.app";

// ================================
// CART
// ================================

// Get existing cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================================
// ADD TO CART
// ================================

function addToCart(name, price) {

    console.log("Add to Cart clicked:", name, price);

    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }

    // Save cart
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();

    alert(name + " added to cart");

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
// =========================
// REGISTER FUNCTION
// =========================

let registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        let name = document.getElementById("registerName").value;
        let email = document.getElementById("registerEmail").value;
        let password = document.getElementById("registerPassword").value;
        let confirmPassword = document.getElementById("confirmPassword").value;

        let registerMessage =
            document.getElementById("registerMessage");

        // Check password
        if (password !== confirmPassword) {

            registerMessage.textContent =
                "Passwords do not match!";

            registerMessage.style.color = "red";

            return;
        }

        registerMessage.textContent =
            "Creating account...";

        registerMessage.style.color = "black";

        try {

            let response = await fetch(
                API_URL + "/api/register/",
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

            let data = await response.json();

            if (data.success) {

                registerMessage.textContent =
                    "Account created successfully!";

                registerMessage.style.color = "green";

                setTimeout(function() {

                    window.location.href = "login.html";

                }, 1000);

            } else {

                registerMessage.textContent =
                    data.message;

                registerMessage.style.color = "red";
            }

        } catch (error) {

            console.error("Register Error:", error);

            registerMessage.textContent =
                "Unable to connect to Django server";

            registerMessage.style.color = "red";
        }

    });

}
/* =========================
   LOGIN FUNCTION
========================= */

let loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        let email = document.getElementById("loginEmail").value;
        let password = document.getElementById("loginPassword").value;

        let loginMessage = document.getElementById("loginMessage");

        loginMessage.textContent = "Logging in...";
        loginMessage.style.color = "black";

        try {

            let response = await fetch(
                API_URL + "/api/login/",
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

            let data = await response.json();

            if (data.success) {

                loginMessage.textContent =
                    "Login successful";

                loginMessage.style.color = "green";

                // Save user information
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                // Save login status
                localStorage.setItem(
                    "isLoggedIn",
                    "true"
                );

                // Go to home page
                setTimeout(function() {

                    window.location.href = "index.html";

                }, 1000);

            } else {

                loginMessage.textContent =
                    data.message;

                loginMessage.style.color = "red";
            }

        } catch (error) {

            console.error("Login Error:", error);

            loginMessage.textContent =
                "Unable to connect to Django server";

            loginMessage.style.color = "red";
        }

    });

}

// ================================
// USER ACCOUNT
// ================================

function showUserAccount() {

    let isLoggedIn = localStorage.getItem("isLoggedIn");

    let user = JSON.parse(localStorage.getItem("user"));

    let loginLink = document.getElementById("loginLink");

    let userAccount = document.getElementById("userAccount");

    let userName = document.getElementById("userName");

    let menuUserName = document.getElementById("menuUserName");

    let cartLink = document.getElementById("cartLink");

    let adminLink = document.getElementById("adminLink");


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

        // Show user's name
        if (userName) {
            userName.textContent = user.name;
        }

        if (menuUserName) {
            menuUserName.textContent = user.name;
        }

        // Show Cart
        if (cartLink) {
            cartLink.style.display = "inline-block";
        }

        // Keep Admin hidden
        if (adminLink) {
            adminLink.style.display = "none";
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

        // Hide Admin
        if (adminLink) {
            adminLink.style.display = "none";
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

    // Go back to home page
    window.location.href = "index.html";
}


// ================================
// LOAD USER ACCOUNT
// ================================

showUserAccount();
// ================================
// SHOW CART ONLY AFTER LOGIN
// ================================

function showCartOnlyAfterLogin() {

    let cartLink = document.getElementById("cartLink");

    if (!cartLink) {
        return;
    }

    let isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {

        cartLink.style.display = "inline-block";

    } else {

        cartLink.style.display = "none";

    }
}

showCartOnlyAfterLogin();



