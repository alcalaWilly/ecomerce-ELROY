function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function handleLogout(event) {
    event.preventDefault();
    event.stopPropagation();

    const logoutUrl = this.dataset.logoutUrl;
    const csrftoken = getCookie("csrftoken");

    if (!logoutUrl) {
        console.error("No se encontró data-logout-url");
        return;
    }

    const result = await Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Se cerrará tu sesión actual.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(logoutUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": csrftoken,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No se pudo cerrar sesión");
        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_data");
        sessionStorage.clear();

        await Swal.fire({
            icon: "success",
            title: "Sesión cerrada",
            text: "Tu sesión se cerró correctamente.",
            timer: 1200,
            showConfirmButton: false
        });

        window.location.replace("/");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cerrar la sesión."
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const logoutButtons = document.querySelectorAll("[data-logout-url]");

    logoutButtons.forEach(button => {
        button.addEventListener("click", handleLogout);
    });
});