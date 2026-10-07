
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

async function addToCart(name, price) {

    // ================================
    // CHECK LOGIN
    // ================================

    let isLoggedIn =
        localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {

        alert("Please login first to add items to cart.");

        window.location.href = "login.html";

        return;
    }


    // ================================
    // FIND FOOD ITEM
    // ================================

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/all-food-items/`
        );

        const data = await response.json();

        console.log(
            "All food items:",
            data
        );


        if (!data.success) {

            alert(
                "Unable to find food information."
            );

            return;
        }


        // ================================
        // FIND EXACT FOOD
        // ================================

        const foodItem =
            data.food_items.find(function(food) {

                return (
                    food.name.toLowerCase() ===
                    name.toLowerCase() &&
                    Number(food.price) ===
                    Number(price)
                );

            });


        // ================================
        // FOOD NOT FOUND
        // ================================

        if (!foodItem) {

            alert(
                "Food information not found for " +
                name
            );

            return;
        }


        // ================================
        // CHECK AVAILABILITY
        // ================================

        if (foodItem.is_available === false) {

            alert(
                name +
                " is currently unavailable."
            );

            return;
        }


        // ================================
        // GET RESTAURANT ID
        // ================================

        const restaurantId =
            foodItem.restaurant_id;


        if (!restaurantId) {

            alert(
                "Restaurant information is missing for " +
                name
            );

            return;
        }


        console.log(
            "Food:",
            foodItem.name
        );

        console.log(
            "Restaurant:",
            foodItem.restaurant_name
        );

        console.log(
            "Restaurant ID:",
            restaurantId
        );


        // ================================
        // CHECK EXISTING ITEM
        // ================================

        let existingItem =
            cart.find(function(item) {

                return (
                    item.name === foodItem.name &&
                    Number(item.restaurant_id) ===
                    Number(restaurantId)
                );

            });


        // ================================
        // INCREASE QUANTITY
        // ================================

        if (existingItem) {

            existingItem.quantity++;

        }


        // ================================
        // ADD NEW ITEM
        // ================================

        else {

            cart.push({

                name: foodItem.name,

                price: Number(foodItem.price),

                quantity: 1,

                restaurant_id: restaurantId

            });

        }


        // ================================
        // SAVE CART
        // ================================

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        // ================================
        // UPDATE CART
        // ================================

        updateCartCount();

        displayCart();


        alert(
            foodItem.name +
            " added to cart"
        );


    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        alert(
            "Unable to get food information."
        );

    }

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

async function checkout() {

    // ======================================
    // CHECK CART
    // ======================================

    if (cart.length === 0) {

        alert("Your cart is empty");

        return;
    }


    // ======================================
    // CHECK LOGIN
    // ======================================

    let isLoggedIn =
        localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    // ======================================
    // GET RESTAURANT IDS
    // ======================================

    let restaurantIds = [];


    cart.forEach(function(item) {

        let restaurantId =
            item.restaurant_id ||
            item.restaurantId;


        if (restaurantId) {

            if (
                !restaurantIds.includes(
                    Number(restaurantId)
                )
            ) {

                restaurantIds.push(
                    Number(restaurantId)
                );

            }

        }

    });


    // ======================================
    // CHECK RESTAURANT INFORMATION
    // ======================================

    if (restaurantIds.length === 0) {

        alert(
            "Restaurant information is missing."
        );

        return;
    }


    // ======================================
    // ONLY ONE RESTAURANT ALLOWED
    // ======================================

    if (restaurantIds.length > 1) {

        alert(
            "Please select food items from one restaurant."
        );

        return;
    }


    // ======================================
    // CHECK FOOD AVAILABILITY
    // ======================================

    try {

        const restaurantId =
            restaurantIds[0];


        for (let item of cart) {

            const itemRestaurantId =
                item.restaurant_id ||
                item.restaurantId;


            // ================================
            // SAFETY CHECK
            // ================================

            if (
                Number(itemRestaurantId) !==
                Number(restaurantId)
            ) {

                alert(
                    "Please select food items from one restaurant."
                );

                return;
            }


            // ================================
            // GET RESTAURANT FOOD ITEMS
            // ================================

            const response =
                await fetch(
                    API_BASE_URL +
                    "/api/restaurant-food-items/?restaurant_id=" +
                    restaurantId
                );


            const data =
                await response.json();


            if (!data.success) {

                alert(
                    "Unable to check food availability."
                );

                return;
            }


            // ================================
            // FIND FOOD ITEM
            // ================================

            const foodItem =
                data.food_items.find(
                    function(food) {

                        return (
                            food.name ===
                            item.name
                        );

                    }
                );


            // ================================
            // FOOD NOT FOUND
            // ================================

            if (!foodItem) {

                alert(
                    item.name +
                    " is no longer available."
                );

                return;
            }


            // ================================
            // FOOD UNAVAILABLE
            // ================================

            if (
                foodItem.is_available === false
            ) {

                alert(
                    item.name +
                    " is currently unavailable. " +
                    "Please remove it from your cart."
                );

                return;
            }

        }


        // ======================================
        // ALL ITEMS AVAILABLE
        // ======================================

        window.location.href =
            "address.html";


    } catch (error) {

        console.error(
            "CHECK AVAILABILITY ERROR:",
            error
        );

        alert(
            "Unable to check food availability. " +
            "Please try again."
        );

        return;
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
            const phone =
                document.getElementById("registerPhone").value.trim();
            const email =
                document.getElementById("registerEmail").value.trim();

            const password =
                document.getElementById("registerPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const registerMessage =
                document.getElementById("registerMessage");
            // ================================
            // CHECK PHONE NUMBER
            // ================================

            if (!/^[0-9]{10}$/.test(phone)) {

                registerMessage.textContent =
                    "Please enter a valid 10 digit phone number.";

                registerMessage.style.color = "red";

                return;
            }


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
                            phone: phone,
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
// =====================================
// DELIVERY ADDRESS + PLACE ORDER
// =====================================

const addressForm =
    document.getElementById("addressForm");

if (addressForm) {

    addressForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ================================
            // CHECK CART
            // ================================

            if (cart.length === 0) {

                alert("Your cart is empty.");

                window.location.href =
                    "cart.html";

                return;
            }


            // ================================
            // CHECK LOGIN
            // ================================

            const isLoggedIn =
                localStorage.getItem("isLoggedIn");

            if (isLoggedIn !== "true") {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }


            // ================================
            // GET ADDRESS DETAILS
            // ================================

            const deliveryName =
                document
                    .getElementById("deliveryName")
                    .value
                    .trim();

            const deliveryPhone =
                document
                    .getElementById("deliveryPhone")
                    .value
                    .trim();

            const deliveryHouse =
                document
                    .getElementById("deliveryHouse")
                    .value
                    .trim();

            const deliveryArea =
                document
                    .getElementById("deliveryArea")
                    .value
                    .trim();

            const deliveryCity =
                document
                    .getElementById("deliveryCity")
                    .value
                    .trim();

            const deliveryState =
                document
                    .getElementById("deliveryState")
                    .value
                    .trim();

            const deliveryPincode =
                document
                    .getElementById("deliveryPincode")
                    .value
                    .trim();

            const deliveryLandmark =
                document
                    .getElementById("deliveryLandmark")
                    .value
                    .trim();


            // ================================
            // CHECK PHONE
            // ================================

            if (!/^[0-9]{10}$/.test(deliveryPhone)) {

                alert(
                    "Please enter a valid 10 digit phone number."
                );

                return;
            }


            // ================================
            // CHECK PINCODE
            // ================================

            if (!/^[0-9]{6}$/.test(deliveryPincode)) {

                alert(
                    "Please enter a valid 6 digit pincode."
                );

                return;
            }


            // ================================
            // GET CURRENT USER
            // ================================

            const currentUser =
                JSON.parse(
                    localStorage.getItem(
                        "currentUser"
                    ) || "null"
                );


            if (!currentUser) {

                alert(
                    "User information not found. Please login again."
                );

                window.location.href =
                    "login.html";

                return;
            }


            // =========================================
            // CHECK CART RESTAURANT
            // =========================================

            const restaurantIds = [];

            cart.forEach(function(item) {

                const restaurantId =
                    item.restaurant_id ||
                    item.restaurantId;

                if (!restaurantId) {
                    return;
                }

                if (!restaurantIds.includes(Number(restaurantId))) {

                    restaurantIds.push(
                        Number(restaurantId)
                    );

                }

            });


            // =========================================
            // CHECK RESTAURANT INFORMATION
            // =========================================

            if (restaurantIds.length === 0) {

                alert(
                    "Restaurant information is missing."
                );

                return;
            }


            // =========================================
            // ONLY ONE RESTAURANT ALLOWED
            // =========================================

            if (restaurantIds.length > 1) {

                alert(
                    "Please select food items from one restaurant."
                );

                window.location.href =
                    "cart.html";

                return;
            }


            // =========================================
            // ONE RESTAURANT - PLACE ONE ORDER
            // =========================================

            const restaurantId =
                restaurantIds[0];


            // =========================================
            // CALCULATE TOTAL
            // =========================================

            let totalAmount = 0;

            cart.forEach(function(item) {

                totalAmount +=
                    Number(item.price) *
                    Number(item.quantity);

            });


            // =========================================
            // CREATE ORDER DATA
            // =========================================

            const orderData = {

                customer_name:
                    deliveryName,

                customer_email:
                    currentUser.email,

                restaurant_id:
                    restaurantId,

                items:
                    cart,

                total_amount:
                    totalAmount,

                delivery_phone:
                    deliveryPhone,

                delivery_house:
                    deliveryHouse,

                delivery_area:
                    deliveryArea,

                delivery_city:
                    deliveryCity,

                delivery_state:
                    deliveryState,

                delivery_pincode:
                    deliveryPincode,

                delivery_landmark:
                    deliveryLandmark

            };


            console.log(
                "Final Order:",
                orderData
            );


            // =========================================
            // SEND ONE ORDER TO DJANGO
            // =========================================

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

                            body:
                                JSON.stringify(orderData)
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Order Response:",
                    data
                );


                // =========================================
                // CHECK RESULT
                // =========================================

                if (
                    !response.ok ||
                    data.success !== true
                ) {

                    alert(
                        data.message ||
                        "Unable to place order."
                    );

                    return;
                }


                // =========================================
                // ORDER SUCCESS
                // =========================================

                alert(
                    "Order placed successfully!"
                );


                localStorage.removeItem(
                    "cart"
                );

                cart = [];


                window.location.href =
                    "orders.html";


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
    );
}
