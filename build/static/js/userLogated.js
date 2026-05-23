// document.addEventListener("DOMContentLoaded", async () => {
//     const path = window.location.pathname;

//     if (path.startsWith("/perfil/") || path === "/perfil/") {
//         console.log("🟢 Estás en /perfil/");

//         document.querySelectorAll('.sidebar-list-item').forEach(item => {
//             item.addEventListener('click', function (e) {
//                 e.preventDefault();

//                 document.querySelectorAll('.sidebar-list-item').forEach(i => i.classList.remove('active'));
//                 this.classList.add('active');

//                 const url = this.getAttribute('data-url');
//                 fetch(url)
//                     .then(response => {
//                         if (!response.ok) throw new Error('Network response was not ok');
//                         return response.text();
//                     })
//                     .then(html => {
//                         document.getElementById('main-content').innerHTML = html;

//                         if (url.includes("pedidos")) {
//                             cargarPedidos();
//                         }

//                         if (url.includes("detallePedido")) {
//                             const urlParams = new URLSearchParams(window.location.search);
//                             const transactionId = urlParams.get("transaction_id");
//                             cargarDetallePedido(transactionId);
//                         }

//                         if (url.includes("perfilUser")) {
//                             // Esperar a que el HTML ya haya sido cargado en #main-content
//                             setTimeout(() => {
//                                 const logoutButton = document.getElementById("closeSesion");

//                                 if (logoutButton) {
//                                     const logoutUrl = logoutButton.dataset.logoutUrl;

//                                     logoutButton.addEventListener("click", function (e) {
//                                         e.preventDefault();

//                                         fetch(logoutUrl, {
//                                             method: "POST",
//                                             credentials: "same-origin",
//                                             headers: {
//                                                 "X-Requested-With": "XMLHttpRequest",
//                                                 "Content-Type": "application/json",
//                                                 // Opcional: CSRF token si lo necesitas
//                                             }
//                                         })
//                                             .then(resp => {
//                                                 if (!resp.ok) throw new Error("Logout falló");
//                                                 return resp.json();
//                                             })
//                                             .then(() => {
//                                                 localStorage.clear();
//                                                 window.location.replace("/"); // o reemplaza con {% url 'index' %}
//                                             })
//                                             .catch(err => {
//                                                 console.error(err);
//                                                 alert("No se pudo cerrar sesión. Intenta de nuevo.");
//                                             });
//                                     });
//                                 }

//                             }, 100); // espera pequeña para asegurar que el DOM esté ya en el contenedor
//                         }


//                     })
//                     .catch(err => console.error('❌ Error al cargar el contenido:', err));
//             });
//         });

//         cargarPedidos();
//     } else {
//         console.log("🟡 No estás en /perfil/");
//     }
// });

document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;

    if (path.startsWith("/perfil/") || path === "/perfil/") {
        console.log("🟢 Estás en /perfil/");

        document.querySelectorAll('.sidebar-list-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();

                const url = this.getAttribute('data-url');

                // Si no tiene data-url (ej: cerrar sesión), no hacer nada
                if (!url) return;

                document.querySelectorAll('.sidebar-list-item')
                    .forEach(i => i.classList.remove('active'));

                this.classList.add('active');

                fetch(url, {
                    credentials: "same-origin"
                })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(html => {
                    document.getElementById('main-content').innerHTML = html;

                    if (url.includes("pedidos")) {
                        cargarPedidos();
                    }

                    if (url.includes("detallePedido")) {
                        const urlParams = new URLSearchParams(window.location.search);
                        const transactionId = urlParams.get("transaction_id");
                        cargarDetallePedido(transactionId);
                    }
                })
                .catch(err => console.error('❌ Error al cargar el contenido:', err));
            });
        });

        cargarPedidos();
    } else {
        console.log("🟡 No estás en /perfil/");
    }
});


async function obtenerUserId() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ No hay token disponible.");
        return null;
    }

    try {
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/auth/users/me/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("❌ Error en la solicitud: " + response.status);
        }

        const data = await response.json();
        const userId = data.id;
        console.log("🆔 ID del usuario:", userId);
        return userId;
    } catch (error) {
        console.error("❌ Error al obtener el ID del usuario:", error);
        return null;
    }
}

async function cargarPedidos() {
    const token = localStorage.getItem("access_token");
    if (!token) return console.error("❌ Token no encontrado");

    try {
        const userId = await obtenerUserId();
        if (!userId) return;
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/api/orders/user/${userId}/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("❌ Error al obtener pedidos");

        const pedidos = await response.json();
        const tbody = document.querySelector(".tbl tbody");
        tbody.innerHTML = "";

        for (const pedido of pedidos) {
            for (const item of pedido.items) {
                const tr = document.createElement("tr");
                tr.classList.add("filaTransaction");
                tr.dataset.transactionId = pedido.transaction_id;
                const baseUrl = document.body.dataset.apiUrl;
                const productoData = await fetch(`${baseUrl}/product/${item.product}`).then(res => res.json());
                const imagenUrl = productoData.product.imagenes?.[0]?.cRutaImagen || "/static/images/no-image.png";

                let nombreTalla = "";
                if (item.talla && !isNaN(item.talla)) {
                    nombreTalla = await obtenerNombreTalla(item.talla);
                } else if (item.talla) {
                    nombreTalla = item.talla;
                }

                // Puedes estilizar los estados aquí si lo deseas (ej. colores)
                const estadoTexto = formatearEstado(pedido.status);

                tr.innerHTML = `
                <td>${pedido.transaction_id}</td>
                <td>${estadoTexto}</td>
                <td>
                    <div class="productoTd">
                        <img src="${imagenUrl}" alt="Imagen del producto" style="width: 50px; height: 50px; object-fit: cover;">
                        <div class="descriptionTd">
                            <span>${item.name}</span>
                            <div class="talla-color">
                                ${nombreTalla ? `<span>${nombreTalla}</span>` : ""}
                                ${item.color ? `<div style="display:inline-block;width:10px;height:10px;background:${item.color};border-radius:50%;margin-left:6px;"></div>` : ""}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${item.count}</td>
                <td>${parseFloat(item.price).toFixed(2)} PEN</td>
            `;


                tr.addEventListener("click", async () => {
                    const url = `/pedidos_detalle/?transaction_id=${pedido.transaction_id}`;
                    const res = await fetch(url);
                    const html = await res.text();

                    document.getElementById("main-content").innerHTML = html;
                    cargarDetallePedido(pedido.transaction_id);
                });

                tbody.appendChild(tr);
            }
        }
    } catch (err) {
        console.error("❌ Error al cargar pedidos:", err);
    }
}

function formatearEstado(estado) {
    const estados = {
        not_processed: { texto: "Pagado", clase: "estado-pendiente" },
        processed: { texto: "Empaquetado", clase: "estado-procesado" },
        shipped: { texto: "En camino", clase: "estado-enviado" },
        delivered: { texto: "Entregado", clase: "estado-entregado" },
        cancelled: { texto: "Cancelado", clase: "estado-cancelado" }
    };

    const data = estados[estado] || { texto: estado, clase: "estado-desconocido" };

    return `<div class="estado-box ${data.clase}">${data.texto}</div>`;
}
async function obtenerNombreTalla(tallaId) {
    try {
        const baseUrl = document.body.dataset.apiUrl;
        const res = await fetch(`${baseUrl}/get/sizes/`);
        if (!res.ok) throw new Error("No se pudo cargar tallas");

        const data = await res.json();
        const tallaObj = data.results.find(t => t.id == tallaId);
        return tallaObj ? tallaObj.cNombreTalla : tallaId;
    } catch (err) {
        console.error("Error obteniendo talla:", err);
        return tallaId;
    }
}

function actualizarStepper(estado) {
    const pasos = [
        { estado: "not_processed", clase: "step-pagado" },
        { estado: "processed", clase: "step-empaquetado" },
        { estado: "shipped", clase: "step-camino" },
        { estado: "delivered", clase: "step-entregado" }
    ];

    const pasoActivo = pasos.findIndex(p => p.estado === estado);

    pasos.forEach((paso, index) => {
        const step = document.querySelector(`.${paso.clase}`);
        if (!step) return;

        step.classList.remove("active", "completed");

        if (index < pasoActivo) {
            step.classList.add("completed");
        } else if (index === pasoActivo) {
            step.classList.add("active");
        }
    });
}

async function obtenerPedidoPorTransactionId(transactionId) {
    const token = localStorage.getItem("access_token");
    if (!token || !transactionId) throw new Error("Token o transactionId no disponibles");
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/api/orders/get-order/${transactionId}/`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("❌ Error al obtener el detalle del pedido");
    }

    return await response.json();
}

function actualizarStepper(status) {
    const estados = ["not_processed", "processed", "shipped", "delivered"];
    const steps = document.querySelectorAll(".stepper .step");

    // Paso actual según el status recibido
    const pasoActual = estados.indexOf(status);

    steps.forEach((step, index) => {
        step.classList.remove("active", "completed");

        if (index < pasoActual) {
            step.classList.add("completed");
        } else if (index === pasoActual) {
            step.classList.add("active");
        }
    });
}

async function cargarDetallePedido(transactionId) {
    const token = localStorage.getItem("access_token");
    if (!token || !transactionId) return;

    try {
        const pedido = await obtenerPedidoPorTransactionId(transactionId);

        const tbody = document.querySelector(".tbl tbody");
        const cantidadArticulos = document.querySelector(".cantidadArticulos");
        const nombreEnvio = document.querySelector(".nombreEnvio");
        const subtotalSinDescuento = document.querySelector(".subtotalSinDescuento");
        const precioEnvio = document.querySelector(".precioEnvio");
        const totalGeneral = document.querySelector(".totalGeneral");

        tbody.innerHTML = "";
        let subtotal = 0;
        let totalItems = 0;

        for (const item of pedido.items) {
            const baseUrl = document.body.dataset.apiUrl;
            const productoData = await fetch(`${baseUrl}/product/${item.product}`).then(res => res.json());
            const imagenUrl = productoData.product.imagenes?.[0]?.cRutaImagen || "/static/images/no-image.png";

            let nombreTalla = "";
            if (item.talla && !isNaN(item.talla)) {
                nombreTalla = await obtenerNombreTalla(item.talla);
            } else if (item.talla) {
                nombreTalla = item.talla;
            }

            const totalProducto = parseFloat(item.price) * item.count;
            subtotal += totalProducto;
            totalItems += item.count;

            const tr = document.createElement("tr");
            tr.classList.add("filaTransactionProduct");

            tr.innerHTML = `
                <td>
                    <div class="productoTd">
                        <img src="${imagenUrl}" alt="">
                        <div class="descriptionTd">
                            <span>${item.name}</span>
                            <div class="talla-color">${nombreTalla ? `<span>${nombreTalla}</span>` : ""}</div>
                            <span>${parseFloat(item.price).toFixed(2)} PEN</span>
                        </div>
                    </div>
                </td>
                <td>${item.count}</td>
                <td>${totalProducto.toFixed(2)} PEN</td>
            `;

            tbody.appendChild(tr);
        }

        // Actualizar resumen
        cantidadArticulos.textContent = `${totalItems} artículo${totalItems > 1 ? 's' : ''}`;
        nombreEnvio.textContent = pedido.shipping_name || "Sin envío";
        subtotalSinDescuento.textContent = `${subtotal.toFixed(2)} PEN`;
        precioEnvio.textContent = `${parseFloat(pedido.shipping_price).toFixed(2)} PEN`;
        totalGeneral.textContent = `${parseFloat(pedido.amount).toFixed(2)} PEN`;

        // 🔵 NUEVO: actualiza el stepper visual
        actualizarStepper(pedido.status);

        // 🔵 NUEVO: muestra número y fecha de transacción
        document.querySelector(".numero-transaccion").textContent = pedido.transaction_id;

        const fecha = new Date(pedido.date_issued);
        const opciones = { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" };
        document.querySelector(".fecha-transaccion").textContent = fecha.toLocaleString("es-PE", opciones);


    } catch (err) {
        console.error("❌ Error al cargar el detalle del pedido:", err);
    }
}




