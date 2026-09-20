
// =========================
// ADMIN LOGIN
// =========================

function adminLogin() {

    let username =
        document.getElementById("adminUsername").value;

    let password =
        document.getElementById("adminPassword").value;


    if (username === "admin" && password === "admin123") {

        localStorage.setItem(
            "adminLoggedIn",
            "true"
        );

        window.location.href = "admin.html";

    } else {

        document.getElementById("adminMessage").textContent =
            "Invalid admin username or password";

    }
}


// =========================
// CHECK ADMIN LOGIN
// =========================

if (
    window.location.pathname.includes("admin.html") ||
    window.location.pathname.includes("users.html")
) {

    let adminLoggedIn =
        localStorage.getItem("adminLoggedIn");


    if (adminLoggedIn !== "true") {

        window.location.href =
            "admin-login.html";

    }
}


// =========================
// GET ALL USERS
// =========================

let users =
    JSON.parse(
        localStorage.getItem("users")
    ) || [];



// GET USERS FROM DJANGO + MYSQL
fetch("https://backend-dl8i.vercel.app/api/users/")
    .then(response => response.json())
    .then(data => {

        if (data.success) {

            let users = data.users;

            // ==============================
            // SHOW USER COUNT ON DASHBOARD
            // ==============================

            let totalUsers = document.getElementById("totalUsers");

            if (totalUsers) {
                totalUsers.textContent = users.length;
            }


            // ==============================
            // SHOW USERS IN USERS PAGE
            // ==============================

            let userTable = document.getElementById("userTable");

            if (userTable) {

                userTable.innerHTML = "";

                if (users.length > 0) {

                    users.forEach(function(user, index) {

                        userTable.innerHTML += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>Active</td>
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

        } else {

            console.log("Unable to get users");

        }

    })
    .catch(error => {

        console.error(
            "Error connecting to Django:",
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
        "admin-login.html";
}

