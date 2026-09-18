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
    window.location.pathname.includes("admin.html")
) {

    let adminLoggedIn =
        localStorage.getItem("adminLoggedIn");


    if (adminLoggedIn !== "true") {

        window.location.href =
            "admin-login.html";
    }
}



// =========================
// SHOW USER COUNT
// =========================

let user =
    JSON.parse(
        localStorage.getItem("user")
    );


let totalUsers =
    document.getElementById("totalUsers");


if (totalUsers && user) {

    totalUsers.textContent = "1";
}



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