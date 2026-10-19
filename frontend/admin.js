
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
            localStorage.setItem(
                "adminToken",
                data.token
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
                            ${user.phone || "Not provided"}
                        </td>

                        <td>
                            ${user.status || "Inactive"}
                        </td>

                    </tr>

                `;

            });

        } else {

            userTable.innerHTML = `

                <tr>

                    <td colspan="5">
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

    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminData");
    localStorage.removeItem("adminToken");

    window.location.href = "admin.html";
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
                            📍 ${restaurant.location}
                        </p>
                        <p>
                            <strong>FSSAI Lic No:</strong><br>
                            ${restaurant.fssai_number || "Not available"}
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

// =========================
// PRINT USERS
// =========================

function printUsers() {

    const now = new Date();

    const date =
        now.toLocaleDateString("en-IN");

    const time =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",

            }
        );

    document.getElementById("printDate").textContent =
        "Date: " + date;

    document.getElementById("printTime").textContent =
        "Time: " + time;

    window.print();

}

 // =========================
 // SHOW ADD RESTAURANT FORM
 // =========================

function showAddRestaurantForm() {

    const form = document.getElementById("addRestaurantForm");

    if (form) {
        form.style.display = "block";
    }

}


// =========================
// HIDE ADD RESTAURANT FORM
// =========================

function hideAddRestaurantForm() {

    const form = document.getElementById("addRestaurantForm");

    if (form) {
        form.style.display = "none";
    }

}


// =========================
// ADD RESTAURANT
// =========================

async function addRestaurant() {


const message = document.getElementById("restaurantMessage");

const restaurant = {
    name: document.getElementById("restaurantName").value.trim(),
    image: document.getElementById("restaurantImage").value.trim(),
    cuisine: document.getElementById("restaurantCuisine").value.trim(),
    rating: document.getElementById("restaurantRating").value,
    location: document.getElementById("restaurantLocation").value.trim(),
    email: document.getElementById("restaurantEmail").value.trim(),
    password: document.getElementById("restaurantPassword").value,
    description: document.getElementById("restaurantDescription").value.trim()
};

// Check required fields
if (
    !restaurant.name ||
    !restaurant.image ||
    !restaurant.cuisine ||
    !restaurant.rating ||
    !restaurant.location ||
    !restaurant.email ||
    !restaurant.password ||
    !restaurant.description
) {
    message.textContent = "Please fill in all fields.";
    return;
}

message.style.color = "#d32f2f";
message.textContent = "Saving restaurant...";

try {

    const response = await fetch(
        "https://backend-dl8i.vercel.app/api/add-restaurant/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(restaurant)
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Unable to add restaurant."
        );
    }

    message.style.color = "green";
    message.textContent = "Restaurant added successfully!";

    // Clear the form
    document.getElementById("restaurantName").value = "";
    document.getElementById("restaurantImage").value = "";
    document.getElementById("restaurantCuisine").value = "";
    document.getElementById("restaurantRating").value = "";
    document.getElementById("restaurantLocation").value = "";
    document.getElementById("restaurantEmail").value = "";
    document.getElementById("restaurantPassword").value = "";
    document.getElementById("restaurantDescription").value = "";

    // Refresh the admin restaurant list
    if (typeof loadAdminRestaurants === "function") {
        await loadAdminRestaurants();
    }

    // Refresh the dashboard restaurant count
    if (typeof loadRestaurantCount === "function") {
        await loadRestaurantCount();
    }

    // Hide the form after a successful save
    if (typeof hideAddRestaurantForm === "function") {
        hideAddRestaurantForm();
    }

} catch (error) {

    console.error("Add restaurant error:", error);

    message.style.color = "#d32f2f";
    message.textContent =
        error.message || "Unable to connect to the server.";
}


}

// ===============================
// LOAD RESTAURANT PERMISSIONS
// ===============================

async function loadRestaurantPermissions() {

    const table = document.getElementById(
        "restaurantPermissionsTable"
    );

    if (!table) return;

    try {

        const response = await fetch(
            "https://backend-dl8i.vercel.app/api/restaurants/"
        );

        if (!response.ok) {
            throw new Error("Unable to fetch restaurants");
        }

        const data = await response.json();

        const restaurants = Array.isArray(data)
            ? data
            : data.restaurants || data.data || [];

        if (!restaurants.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">No restaurants found</td>
                </tr>
            `;

            return;
        }

        table.innerHTML = restaurants.map(restaurant => `
            <tr>
                <td>${restaurant.name}</td>
               
                <td>
                    <label>
                        <input
                            type="checkbox"
                            ${restaurant.is_visible ? "checked" : ""}
                            onchange="updateRestaurantVisibility(${restaurant.id}, this)"
                        >
                        <span>${restaurant.is_visible ? "Active" : "Inactive"}</span>
                    </label>
                </td>
                
                <td>
                    <label>
                        <input
                            type="checkbox"
                            ${restaurant.can_add_food_items ? "checked" : ""}
                            onchange="updateRestaurantFoodPermission(${restaurant.id}, this)"
                        >
                        <span>${restaurant.can_add_food_items ? "Active" : "Inactive"}</span>
                    </label>
                </td>

                <td>
                    ${
                        ({
                            1: "restaurant_1_sai_tasty_restaurant.pdf",
                            2: "restaurant_2_spice_garden.pdf",
                            3: "restaurant_3_food_palace.pdf"
                        })[restaurant.id]
                            ? `<a
                                href="restaurant-licenses/${({
                                    1: "restaurant_1_sai_tasty_restaurant.pdf",
                                    2: "restaurant_2_spice_garden.pdf",
                                    3: "restaurant_3_food_palace.pdf"
                                })[restaurant.id]}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="license-details-button"
                            >View PDF</a>`
                            : `<span>Not added</span>`
                    }
                </td>


                <td>
                    <button
                        type="button"
                        class="delete-restaurant-button"
                        onclick="deleteRestaurantPermission(
                            ${restaurant.id},
                            this.dataset.name
                        )"
                        data-name="${String(restaurant.name).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (error) {

        console.error(
            "Error loading restaurant permissions:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load restaurants.
                    Check the backend connection.
                </td>
            </tr>
        `;
    }
}


// ===============================
// UPDATE PERMISSION LABEL
// ===============================

function updatePermissionLabel(checkbox) {

    const label = checkbox.parentElement.querySelector("span");

    if (label) {
        label.textContent = checkbox.checked
            ? "Active"
            : "Inactive";
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadRestaurantPermissions
);



async function deleteRestaurantPermission(restaurantId, restaurantName) {
    const confirmed = confirm(
        `Are you sure you want to delete "${restaurantName}"?`
    );

    if (!confirmed) {
        return;
    }

    const message = document.getElementById("permissionsMessage");

    if (message) {
        message.style.color = "#333333";
        message.textContent = "Deleting restaurant...";
    }

    try {
        const response = await fetch(
            `https://backend-dl8i.vercel.app/api/delete-restaurant/${restaurantId}/`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to delete restaurant."
            );
        }

        if (message) {
            message.style.color = "green";
            message.textContent = data.message;
        }

        // Refresh the table after successful deletion
        await loadRestaurantPermissions();

        // Refresh restaurant count if available
        if (typeof loadRestaurantCount === "function") {
            await loadRestaurantCount();
        }

    } catch (error) {
        console.error("DELETE RESTAURANT ERROR:", error);

        if (message) {
            message.style.color = "red";
            message.textContent = error.message;
        } else {
            alert(error.message);
        }
    }
}

async function updateRestaurantVisibility(restaurantId, checkbox) {
    console.log("VISIBILITY FUNCTION CALLED:", restaurantId, checkbox.checked);
    const previousValue = !checkbox.checked;
    const label = checkbox.parentElement.querySelector("span");

    checkbox.disabled = true;

    if (label) {
        label.textContent = "Saving...";
    }

    try {
        const response = await fetch(
            "https://backend-dl8i.vercel.app/api/update-restaurant-visibility/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId,
                    is_visible: checkbox.checked
                })
            }
        );

        const data = await response.json();

        console.log("Visibility API status:", response.status);
        console.log("Visibility API response:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to update visibility");
        }

        if (label) {
            label.textContent = checkbox.checked
                ? "Active"
                : "Inactive";
        }

    } catch (error) {
        console.error("VISIBILITY UPDATE ERROR:", error);

        checkbox.checked = previousValue;

        if (label) {
            label.textContent = previousValue
                ? "Active"
                : "Inactive";
        }

        alert(error.message);

    } finally {
        checkbox.disabled = false;
    }
}

async function updateRestaurantFoodPermission(restaurantId, checkbox) {
    const previousChecked = !checkbox.checked;

    try {
        const response = await fetch(
            "https://backend-dl8i.vercel.app/api/update-restaurant-food-permission/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId,
                    can_add_food_items: checkbox.checked
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Permission update failed.");
        }

        checkbox.nextElementSibling.textContent =
            checkbox.checked ? "Active" : "Inactive";

    } catch (error) {
        checkbox.checked = previousChecked;
        checkbox.nextElementSibling.textContent =
            previousChecked ? "Active" : "Inactive";

        alert("Could not update Add Food Items permission: " + error.message);
    }
}

/* =========================
   LOAD ALL FOOD ITEMS
========================= */

function loadFoodItemCount() {

    fetch(
        "https://backend-dl8i.vercel.app/api/all-food-items/"
    )

    .then(function(response) {

        if (!response.ok) {
            throw new Error(
                "Food items API returned status " +
                response.status
            );
        }

        return response.json();

    })

    .then(function(data) {

        console.log(
            "ALL FOOD ITEMS API RESPONSE:",
            data
        );

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load food items"
            );
        }

        const foodItems = data.food_items || [];

        const totalFoodItems =
            document.getElementById("totalFoodItems");

        if (totalFoodItems) {
            totalFoodItems.textContent =
                foodItems.length;
        }

    })

    .catch(function(error) {

        console.error(
            "FOOD ITEMS COUNT ERROR:",
            error
        );

    });

}

loadFoodItemCount();

/* =========================
   LOAD ADMIN DASHBOARD ORDERS
========================= */

async function loadAdminDashboardOrders() {
    const totalOrdersElement =
        document.getElementById("totalOrders");

    const recentOrdersTable =
        document.getElementById("recentOrdersTable");

    // Run only on the admin dashboard.
    if (!totalOrdersElement || !recentOrdersTable) {
        return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
        recentOrdersTable.innerHTML =
            '<tr><td colspan="5">Please log in again to view orders.</td></tr>';
        return;
    }

    try {
        const response = await fetch(
            "https://backend-dl8i.vercel.app/api/admin-all-orders/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token: token
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load dashboard orders."
            );
        }

        const orders = Array.isArray(data.orders)
            ? data.orders
            : [];

        // Update the total orders count.
        totalOrdersElement.textContent =
            data.count ?? orders.length;

        // Show the five most recent orders.
        recentOrdersTable.replaceChildren();

        if (orders.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No orders available";

            row.appendChild(cell);
            recentOrdersTable.appendChild(row);
            return;
        }

        orders.slice(0, 5).forEach(function(order) {
            const row = document.createElement("tr");

            const values = [
                "#" + order.id,
                order.customer_name || "Unknown Customer",
                order.restaurant_name || "Unknown Restaurant",
                "₹" + Number(order.total_amount || 0).toFixed(2),
                order.status || "Pending"
            ];

            values.forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            recentOrdersTable.appendChild(row);
        });

    } catch (error) {
        console.error(
            "ADMIN DASHBOARD ORDERS ERROR:",
            error
        );

        recentOrdersTable.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "Unable to load orders. Please try again.";

        row.appendChild(cell);
        recentOrdersTable.appendChild(row);
    }
}

loadAdminDashboardOrders();


