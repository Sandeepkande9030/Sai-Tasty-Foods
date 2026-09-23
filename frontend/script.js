
/// ========================================
// DJANGO BACKEND URL
// ========================================

const API_BASE_URL = "https://backend-dl8i.vercel.app";
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


/// =========================
// CHECKOUT / PLACE ORDER
// =========================

async function checkout() {

    // Check cart
    if (cart.length === 0) {

        alert("Your cart is empty");

        return;
    }


    // =========================
    // CHECK LOGIN
    // =========================

    let isLoggedIn =
        localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    // =========================
    // GET CURRENT USER
    // =========================

    let currentUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    if (!currentUser) {

        alert("User information not found.");

        return;
    }


    // =========================
    // CHECK RESTAURANT
    // =========================

    let restaurantId =
        cart[0].restaurantId;


    if (!restaurantId) {

        alert(
            "Restaurant information is missing. Please add the food again from the restaurant page."
        );

        return;
    }


    // =========================
    // MAKE SURE ALL ITEMS
    // ARE FROM SAME RESTAURANT
    // =========================

    let sameRestaurant =
        cart.every(function(item) {

            return item.restaurantId == restaurantId;

        });


    if (!sameRestaurant) {

        alert(
            "Please order items from one restaurant at a time."
        );

        return;
    }


    // =========================
    // CALCULATE TOTAL
    // =========================

    let totalAmount = 0;


    cart.forEach(function(item) {

        totalAmount +=
            Number(item.price) *
            Number(item.quantity);

    });


    // =========================
    // SEND ORDER TO DJANGO
    // =========================

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/place-order/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        customer_name:
                            currentUser.name,

                        customer_email:
                            currentUser.email,

                        restaurant_id:
                            restaurantId,

                        items:
                            cart,

                        total_amount:
                            totalAmount

                    })

                }
            );


        const data =
            await response.json();


        // =========================
        // ORDER SUCCESS
        // =========================

        if (data.success) {

            alert(
                "Order placed successfully!"
            );


            // Clear cart
            localStorage.removeItem("cart");


            // Update global cart
            cart = [];


            // Go to home
            window.location.href =
                "index.html";

        }


        // =========================
        // ORDER FAILED
        // =========================

        else {

            alert(
                data.message ||
                "Unable to place order."
            );

        }


    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

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


// =====================================
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


            // ================================
            // LOGIN SUCCESS
            // ================================

            if (data.success === true) {

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

                // ================================
                // LOGIN FAILED
                // ================================

                loginMessage.textContent =
                    data.message || "Login failed.";

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

    let user = JSON.parse(localStorage.getItem("currentUser") || "null");
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

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById("registerName").value.trim();

            const email =
                document.getElementById("registerEmail").value.trim();

            const password =
                document.getElementById("registerPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const registerMessage =
                document.getElementById("registerMessage");


            // ================================
            // CHECK PASSWORD
            // ================================

            if (password !== confirmPassword) {

                registerMessage.textContent =
                    "Passwords do not match.";

                registerMessage.style.color = "red";

                return;
            }


            // ================================
            // SEND REGISTRATION TO DJANGO
            // ================================

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


                const data =
                    await response.json();


                // ================================
                // REGISTRATION SUCCESS
                // ================================

                if (response.ok && data.success === true) {

                    registerMessage.textContent =
                        data.message;

                    registerMessage.style.color =
                        "green";


                    // Save email for OTP verification
                    localStorage.setItem(
                        "verificationEmail",
                        data.email
                    );


                    // Clear registration form
                    registerForm.reset();


                    // Go to OTP verification page
                    setTimeout(function() {

                        window.location.href =
                            "verify-otp.html";

                    }, 1500);

                }

                // ================================
                // REGISTRATION FAILED
                // ================================

                else {

                    registerMessage.textContent =
                        data.message ||
                        "Registration failed.";

                    registerMessage.style.color =
                        "red";
                }


            } catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );

                registerMessage.textContent =
                    "Unable to connect to server.";

                registerMessage.style.color =
                    "red";
            }

        }
    );

}

// =====================================
// VERIFY OTP - DJANGO + MYSQL
// =====================================

const verifyOtpForm = document.getElementById("verifyOtpForm");

if (verifyOtpForm) {

    verifyOtpForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const otp = document.getElementById("otp").value.trim();

        const otpMessage =
            document.getElementById("otpMessage");

        // Get email saved during registration
        const email =
            localStorage.getItem("verificationEmail");

        // Check email
        if (!email) {

            otpMessage.textContent =
                "Email information not found. Please register again.";

            otpMessage.style.color = "red";

            return;
        }

        // Check OTP
        if (!otp) {

            otpMessage.textContent =
                "Please enter the OTP.";

            otpMessage.style.color = "red";

            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/verify-otp/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        otp: otp
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {

                otpMessage.textContent =
                    data.message;

                otpMessage.style.color =
                    "green";

                // Remove saved verification email
                localStorage.removeItem(
                    "verificationEmail"
                );

                // Go to login page
                setTimeout(function() {

                    window.location.href =
                        "login.html";

                }, 1500);

            } else {

                otpMessage.textContent =
                    data.message || "Invalid OTP.";

                otpMessage.style.color =
                    "red";
            }

        } catch (error) {

            console.error(
                "OTP Verification Error:",
                error
            );

            otpMessage.textContent =
                "Unable to connect to Django server.";

            otpMessage.style.color =
                "red";
        }

    });

}
// =====================================
// RESEND OTP
// =====================================

const resendOtpBtn =
    document.getElementById("resendOtpBtn");

if (resendOtpBtn) {

    resendOtpBtn.addEventListener("click", async function() {

        const email =
            localStorage.getItem("verificationEmail");

        const resendOtpMessage =
            document.getElementById("resendOtpMessage");

        if (!email) {

            resendOtpMessage.textContent =
                "Email information not found. Please register again.";

            resendOtpMessage.style.color = "red";

            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/resend-otp/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            const data = await response.json();

            if (data.success === true) {

                resendOtpMessage.textContent =
                    "New OTP generated successfully. Check Django terminal.";

                resendOtpMessage.style.color =
                    "green";

            } else {

                resendOtpMessage.textContent =
                    data.message || "Unable to resend OTP.";

                resendOtpMessage.style.color =
                    "red";
            }

        } catch (error) {

            console.error(
                "Resend OTP Error:",
                error
            );

            resendOtpMessage.textContent =
                "Unable to connect to Django server.";

            resendOtpMessage.style.color =
                "red";
        }

    });

}

// =========================
// FORGOT PASSWORD
// =========================

let forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            let email =
                document.getElementById("forgotEmail").value.trim();

            let forgotMessage =
                document.getElementById("forgotMessage");

            if (!email) {

                forgotMessage.textContent =
                    "Please enter your email.";

                forgotMessage.style.color = "red";

                return;
            }

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/forgot-password/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email
                        })
                    }
                );

                const data = await response.json();

                if (data.success === true) {

                    // Save email for next step
                    localStorage.setItem(
                        "resetEmail",
                        email
                    );

                    forgotMessage.textContent =
                        "OTP sent to your email.";

                    forgotMessage.style.color = "green";

                    // Go to OTP page
                    setTimeout(function() {

                        window.location.href =
                            "reset-password.html";

                    }, 1000);

                } else {

                    forgotMessage.textContent =
                        data.message;

                    forgotMessage.style.color = "red";
                }

            } catch (error) {

                console.error(
                    "Forgot Password Error:",
                    error
                );

                forgotMessage.textContent =
                    "Unable to connect to Django server.";

                forgotMessage.style.color = "red";
            }
        }
    );
}
// =========================
// RESET PASSWORD
// =========================

let resetPasswordForm =
    document.getElementById("resetPasswordForm");

if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            let otp =
                document.getElementById("resetOtp").value.trim();

            let newPassword =
                document.getElementById("newPassword").value;

            let confirmPassword =
                document.getElementById("confirmPassword").value;

            let resetMessage =
                document.getElementById("resetMessage");

            // Get email saved during forgot password
            let email =
                localStorage.getItem("resetEmail");

            // Check email
            if (!email) {

                resetMessage.textContent =
                    "Please start the forgot password process again.";

                resetMessage.style.color = "red";

                return;
            }

            // Check OTP
            if (!otp) {

                resetMessage.textContent =
                    "Please enter the OTP.";

                resetMessage.style.color = "red";

                return;
            }

            // Check password
            if (!newPassword) {

                resetMessage.textContent =
                    "Please enter a new password.";

                resetMessage.style.color = "red";

                return;
            }

            // Check confirm password
            if (newPassword !== confirmPassword) {

                resetMessage.textContent =
                    "Passwords do not match.";

                resetMessage.style.color = "red";

                return;
            }

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/reset-password/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            otp: otp,
                            new_password: newPassword
                        })
                    }
                );

                const data = await response.json();

                if (data.success === true) {

                    resetMessage.textContent =
                        "Password reset successfully.";

                    resetMessage.style.color = "green";

                    // Remove saved reset email
                    localStorage.removeItem("resetEmail");

                    // Go back to login
                    setTimeout(function() {

                        window.location.href =
                            "login.html";

                    }, 1500);

                } else {

                    resetMessage.textContent =
                        data.message;

                    resetMessage.style.color = "red";
                }

            } catch (error) {

                console.error(
                    "Reset Password Error:",
                    error
                );

                resetMessage.textContent =
                    "Unable to connect to Django server.";

                resetMessage.style.color = "red";
            }
        }
    );
}