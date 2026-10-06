
// =========================
// ADMIN LOGIN
// =========================

function adminLogin() {

    const email =
        document.getElementById("adminUsername").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const message =
        document.getElementById("adminMessage");


    if (!email || !password) {

        message.textContent =
            "Please enter email and password";

        return;
    }


    message.textContent =
        "Logging in...";


    fetch("https://backend-dl8i.vercel.app/api/admin-login/", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            password: password
        })

    })

    .then(function(response) {

        return response.json();

    })

    .then(function(data) {

        if (data.success) {

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );

            localStorage.setItem(
                "adminData",
                JSON.stringify(data.admin)
            );

            window.location.href =
                "admin-dashboard.html";

        } else {

            message.textContent =
                data.message ||
                "Invalid admin email or password";

        }

    })

    .catch(function(error) {

        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server";

    });

}
// =========================
// CHECK ADMIN LOGIN
// =========================

if (
    window.location.pathname.includes("admin-dashboard.html") ||
    window.location.pathname.includes("users.html") ||
    window.location.pathname.includes("admin-restaurants.html") ||
    window.location.pathname.includes("food-items.html") ||
    window.location.pathname.includes("admin-orders.html") ||
    window.location.pathname.includes("payments.html")
) {

    let adminLoggedIn =
        localStorage.getItem("adminLoggedIn");

    if (adminLoggedIn !== "true") {

        window.location.href =
            "admin.html";
    }
}

// =========================
// GET ALL USERS
// =========================

fetch(
    "https://backend-dl8i.vercel.app/api/users/"
)

.then(function(response) {

    return response.json();

})

.then(function(data) {

    console.log("USERS API RESPONSE:", data);


    if (!data.success) {

        console.error(
            "Unable to get users:",
            data.message
        );

        return;
    }


    const users =
        data.users || [];


    // =========================
    // SHOW USER COUNT
    // =========================

    const totalUsers =
        document.getElementById("totalUsers");

    if (totalUsers) {

        totalUsers.textContent =
            users.length;

    }


    // =========================
    // SHOW USERS IN USERS PAGE
    // =========================

    const userTable =
        document.getElementById("userTable");


    if (userTable) {

        userTable.innerHTML = "";


        if (users.length > 0) {

            users.forEach(function(user, index) {

                userTable.innerHTML += `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${user.name}
                        </td>

                        <td>
                            ${user.email}
                        </td>

                        <td>
                            Active
                        </td>

                    </tr>

                `;

            });

        } else {

            userTable.innerHTML = `

                <tr>

                    <td colspan="4">
                        No registered users found
                    </td>

                </tr>

            `;

        }

    }

})

.catch(function(error) {

    console.error(
        "USERS API ERROR:",
        error
    );

});


// =========================
// ADMIN LOGOUT
// =========================

function adminLogout() {

    localStorage.removeItem(
        "adminLoggedIn"
    );

    window.location.href =
        "admin.html";
}
// =========================
// GET ALL RESTAURANTS
// =========================

function loadAdminRestaurants() {

    const restaurantList =
        document.getElementById("restaurantList");

    if (!restaurantList) {
        return;
    }


    restaurantList.innerHTML =
        "<p>Loading restaurants...</p>";


    fetch(
        "https://backend-dl8i.vercel.app/api/restaurants/"
    )

    .then(function(response) {

        return response.json();

    })

    .then(function(data) {

        if (!data.success) {

            restaurantList.innerHTML =
                "<p>Unable to load restaurants.</p>";

            return;
        }


        const restaurants =
            data.restaurants || [];


        if (restaurants.length === 0) {

            restaurantList.innerHTML = `
                <p>
                    No restaurants found.
                </p>
            `;

            return;
        }


        restaurantList.innerHTML = "";


        restaurants.forEach(function(restaurant) {

            restaurantList.innerHTML += `

                <div class="restaurant-card">

                    <div class="restaurant-card-image">

                        <img
                            src="${restaurant.image}"
                            alt="${restaurant.name}"
                        >

                    </div>


                    <div class="restaurant-card-content">

                        <h3>
                            ${restaurant.name}
                        </h3>

                        <p>
                            ${restaurant.description}
                        </p>

                        <p>
                            🍴 ${restaurant.cuisine}
                        </p>

                        <p>
                            ⭐ ${restaurant.rating}
                        </p>

                        <p>
                            🛵 ${restaurant.delivery_time}
                        </p>

                        <p>
                            📍 ${restaurant.location}
                        </p>

                    </div>

                </div>

            `;

        });

    })

    .catch(function(error) {

        console.error(
            "RESTAURANT LOAD ERROR:",
            error
        );


        restaurantList.innerHTML = `
            <p>
                Unable to connect to server.
            </p>
        `;

    });

}


// =========================
// LOAD RESTAURANTS PAGE
// =========================

if (
    window.location.pathname.includes(
        "admin-restaurants.html"
    )
) {

    loadAdminRestaurants();

}
// =========================
// GET RESTAURANT COUNT
// =========================

function loadRestaurantCount() {

    fetch(
        "https://backend-dl8i.vercel.app/api/restaurants/"
    )

    .then(function(response) {

        return response.json();

    })

    .then(function(data) {

        console.log(
            "RESTAURANTS COUNT RESPONSE:",
            data
        );


        if (!data.success) {

            console.error(
                "Unable to get restaurant count"
            );

            return;
        }


        const restaurants =
            data.restaurants || [];


        const totalRestaurants =
            document.getElementById(
                "totalRestaurants"
            );


        if (totalRestaurants) {

            totalRestaurants.textContent =
                restaurants.length;

        }

    })

    .catch(function(error) {

        console.error(
            "RESTAURANT COUNT ERROR:",
            error
        );

    });

}


// =========================
// LOAD RESTAURANT COUNT
// =========================

loadRestaurantCount();


