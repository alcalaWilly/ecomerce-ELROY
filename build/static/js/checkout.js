

async function cargarProvincias() {
    try {
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/api/orders/countries/`);
        const provincias = await response.json();

        const select = document.getElementById('regionOr');

        provincias.forEach(provincia => {
            const option = document.createElement('option');
            option.value = provincia.value;
            option.textContent = provincia.label;

            // Aquí seleccionamos Lima por defecto
            if (provincia.value === "Lima") {
                option.selected = true;
            }

            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando provincias:', error);
    }
}

// Llamar la función al cargar la página
window.addEventListener('DOMContentLoaded', cargarProvincias);

let timeout = null;
let lastPath = window.location.pathname;

let shippingIdSeleccionado = 1;
let couponAplicado = null;

// metodo de envío
async function fetchShippingOptions() {
    try {
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/api/shipping/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener las opciones de envío");
        }

        const data = await response.json();
        console.log("Opciones de envío:", data);

        const shippingContainer = document.getElementById("shipping-options-container");
        shippingContainer.innerHTML = ""; // Limpiar opciones existentes

        data.results.forEach(option => {
            const shippingDiv = document.createElement("div");
            shippingDiv.classList.add("checkout__envio-contenido");

            shippingDiv.innerHTML = `
                    <div class="checkout__envio-check">
                        <input class="checkbox-envio" type="checkbox" name="shipping" value="${option.id}" ${option.id === 1 ? 'checked' : ''}>
                        <div class="checkout__envio-description">
                            <span>${option.name.toUpperCase()}</span>
                            <span>${option.time_to_delivery}</span>
                        </div>
                    </div>
                    <div>
                        <span>S/ ${option.price}</span>
                    </div>
                `;

            shippingContainer.appendChild(shippingDiv);
        });

        // Agregar comportamiento de selección única
        document.querySelectorAll(".checkbox-envio").forEach(checkbox => {
            checkbox.addEventListener("change", async (event) => {
                document.querySelectorAll(".checkbox-envio").forEach(cb => {
                    cb.checked = false;
                });
                event.target.checked = true;

                shippingIdSeleccionado = parseInt(event.target.value); // 👈 actualizar shipping seleccionado
                await actualizarResumenPago(shippingIdSeleccionado, couponAplicado); // mantener el cupón si existe
            });
        });

    } catch (error) {
        console.error("Error en fetchShippingOptions:", error);
    }
}

// Ejecutar la función cuando cargue la página
document.addEventListener("DOMContentLoaded", fetchShippingOptions);


// Función para manejar la aplicación del cupón
document.getElementById('applyCouponButton').addEventListener('click', async (event) => {
    event.preventDefault();

    const couponCodeInput = document.getElementById('coupon_code');
    const couponCode = couponCodeInput.value.trim();
    const responseSpan = document.querySelector('.responseCupon');

    if (couponCode) {
        const data = await fetchPaymentTotal(shippingIdSeleccionado, couponCode); // usar el ID actual

        if (data.error) {
            responseSpan.textContent = `Cupón no válido: ${data.error}`;
            responseSpan.style.color = 'red';
            couponAplicado = null; // limpiar cupón si es inválido
        } else if (data.coupon_applied) {
            responseSpan.textContent = data.message || '¡Cupón aplicado con éxito!';
            responseSpan.style.color = 'green';
            couponAplicado = couponCode; // guardar cupón aplicado
            await actualizarResumenPago(shippingIdSeleccionado, couponAplicado);
        } else if (data.warning) {
            responseSpan.textContent = data.warning;
            responseSpan.style.color = 'orange';
            couponAplicado = null;
        } else {
            responseSpan.textContent = 'Cupón no aplicado. Verifica los datos.';
            responseSpan.style.color = 'red';
            couponAplicado = null;
        }
    } else {
        responseSpan.textContent = 'Por favor, ingresa un código de cupón válido.';
        responseSpan.style.color = 'red';
    }
});



// Función que realiza la petición a la API para obtener el resumen de pago con el cupón aplicado
// async function fetchPaymentTotal(shippingId = 1, couponCode = null) {
//     try {
//         const token = localStorage.getItem("access_token");
//         // Si el cupón está vacío, no se agrega a la URL
//         const baseUrl = document.body.dataset.apiUrl;
//         //para invitados--
//         if (!token) {
//             payload.checkout_data = buildGuestCheckoutPayload();
//         }
//         //--
//         const url = couponCode
//             ? `${baseUrl}/api/payment/get-payment-total?shipping_id=${shippingId}&coupon_code=${couponCode}`
//             : `${baseUrl}/api/payment/get-payment-total?shipping_id=${shippingId}`;

//         // Solo agregar Authorization si existe token
//         if (token) {
//             headers["Authorization"] = `Bearer ${token}`;
//         }
//         //para que usen los invitados
//         const response = await fetch(url, {
//             method: "POST",
//             headers,
//             body: JSON.stringify(payload)
//         });

//         // const response = await fetch(url, {
//         //     method: "GET",
//         //     headers: {
//         //         "Authorization": `Bearer ${token}`,
//         //         "Content-Type": "application/json"
//         //     }
//         // });

//         if (!response.ok) {
//             throw new Error("Error al obtener el total de pago");
//         }

//         const data = await response.json();
//         console.log("Respuesta de API:", data);
//         return data;
//     } catch (error) {
//         console.error("Error en fetchPaymentTotal:", error);
//         return null;
//     }
// }

async function fetchPaymentTotal(shippingId = 1, couponCode = null) {
    try {
        const token = localStorage.getItem("access_token");
        const baseUrl = document.body.dataset.apiUrl;

        const headers = {
            "Content-Type": "application/json"
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const payload = {
            shipping_id: shippingId,
            coupon_code: couponCode || null
        };

        // Invitado: enviar checkout_data al backend
        if (!token) {
            payload.checkout_data = buildGuestCheckoutPayload();
        }

        const response = await fetch(`${baseUrl}/api/payment/get-payment-total`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Error al obtener el total de pago");
        }

        const data = await response.json();
        console.log("Respuesta de API:", data);
        return data;

    } catch (error) {
        console.error("Error en fetchPaymentTotal:", error);
        return null;
    }
}

async function checkAndLoadCheckout() {
    if (timeout) clearTimeout(timeout);

    if (window.location.pathname === "/shop/checkouts/") {
        timeout = setTimeout(async () => {
            const checkoutData = JSON.parse(localStorage.getItem("checkout_data")) || [];
            console.log("Datos de checkout recibidos:", checkoutData);
            const cartContainer = document.getElementById("product-container");

            cartContainer.innerHTML = "";

            let totalItems = 0;

            checkoutData.forEach(item => {
                const { product, quantity, talla } = item;
                totalItems += quantity;

                const productDiv = document.createElement("div");
                productDiv.classList.add("product");

                const img = document.createElement("img");
                img.src = product.imagenes?.[0]?.cRutaImagen || "{% static 'img/new-4.png' %}";
                img.alt = product.name;
                productDiv.appendChild(img);

                const productInfo = document.createElement("div");
                productInfo.classList.add("product-info");

                const quantitySpan = document.createElement("span");
                quantitySpan.classList.add("quantity");
                quantitySpan.textContent = quantity;
                productInfo.appendChild(quantitySpan);

                const nameParagraph = document.createElement("p");
                nameParagraph.classList.add("product-name");
                nameParagraph.textContent = product.name;
                productInfo.appendChild(nameParagraph);

                const descriptionParagraph = document.createElement("p");
                descriptionParagraph.classList.add("product-description");
                descriptionParagraph.textContent = talla;
                productInfo.appendChild(descriptionParagraph);

                productDiv.appendChild(productInfo);

                const priceSpan = document.createElement("span");
                priceSpan.classList.add("product-price");
                priceSpan.textContent = `S/ ${product.price}`;
                productDiv.appendChild(priceSpan);

                cartContainer.appendChild(productDiv);
            });

            // Llamada inicial a la API para obtener el resumen de pago con el ID 1 = shipping por defecto
            await actualizarResumenPago(1);

            // Agregar evento de cambio para actualizar el total según el envío seleccionado
            document.querySelectorAll(".checkbox-envio").forEach(checkbox => {
                checkbox.addEventListener("change", async (event) => {
                    const shippingId = parseInt(event.target.value);
                    await actualizarResumenPago(shippingId);
                });
            });
        }, 100);
    }
}

//para leer checkout_data
function getCheckoutData() {
    return JSON.parse(localStorage.getItem("checkout_data")) || [];
}

function buildGuestCheckoutPayload() {
    const checkoutData = getCheckoutData();

    return checkoutData.map(item => ({
        product_id: item.product?.id,
        count: item.quantity,
        talla: item.talla || null,
        color: item.color || null
    }));
}
// Función para actualizar el resumen de pago, incluyendo el total de artículos
// async function actualizarResumenPago(shippingId, couponCode = null) {
//     try {
//         // Obtener el total de artículos del carrito
//         const totalItems = await fetchCartItemsAndUpdateSubtotal();

//         // Llamar a la API para obtener el resumen de pago (con cupón si se aplica)
//         const cartTotal = await fetchPaymentTotal(shippingId, couponCode);

//         if (cartTotal) {
//             // Mostrar el total de artículos en el resumen
//             document.getElementById("subtotal-items").textContent = totalItems;

//             // Mostrar el precio original
//             document.getElementById("subtotal-amount").textContent = `S/ ${cartTotal.original_price}`;

//             // Mostrar el costo de envío
//             document.getElementById("shipping-cost").textContent = `S/ ${cartTotal.shipping_cost}`;

//             // Mostrar el total final (solo subtotal + envío)
//             document.getElementById("total-amount").textContent = `S/ ${cartTotal.total_price}`;

//             // 👇 Nuevo: también actualizar el total en el "checkout-toggle"
//             // Actualizar el precio en el "checkout-toggle"
//             const priceDetalle = document.getElementById("priceDetalle");
//             if (priceDetalle) {
//                 priceDetalle.textContent = `${cartTotal.total_price} PEN`;
//             }
//         }
//     } catch (error) {
//         console.error("Error en actualizarResumenPago:", error);
//     }
// }

// Función para actualizar el resumen de pago, incluyendo el total de artículos
async function actualizarResumenPago(shippingId, couponCode = null) {
    try {
        const totalItems = await fetchCartItemsAndUpdateSubtotal();
        const cartTotal = await fetchPaymentTotal(shippingId, couponCode);

        if (cartTotal) {
            document.getElementById("subtotal-items").textContent = totalItems;
            document.getElementById("subtotal-amount").textContent = `S/ ${cartTotal.original_price}`;
            document.getElementById("shipping-cost").textContent = `S/ ${cartTotal.shipping_cost}`;
            document.getElementById("total-amount").textContent = `S/ ${cartTotal.total_price}`;

            const priceDetalle = document.getElementById("priceDetalle");
            if (priceDetalle) {
                priceDetalle.textContent = `${cartTotal.total_price} PEN`;
            }
        }
    } catch (error) {
        console.error("Error en actualizarResumenPago:", error);
    }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", checkAndLoadCheckout);

//para invitados-cart
function getCheckoutTotalItems() {
    const checkoutData = getCheckoutData();
    return checkoutData.reduce((total, item) => total + (item.quantity || 0), 0);
}

// Función que obtiene el total de artículos del carrito
// async function fetchCartItemsAndUpdateSubtotal() {
//     try {
//         const token = localStorage.getItem("access_token"); // Obtener el token desde localStorage

//         // carrito-Invitado: usar checkout_data
//         if (!token) {
//             return getCheckoutTotalItems();
//         }
//         //autentificados
//         const baseUrl = document.body.dataset.apiUrl;
//         const response = await fetch(`${baseUrl}/api/cart/cart-items`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         });

//         if (!response.ok) {
//             throw new Error("Error al obtener los artículos del carrito");
//         }

//         const data = await response.json();

//         // Sumar el total de 'count' de los productos en el carrito
//         const totalItems = data.cart.reduce((total, item) => total + item.count, 0);

//         // Devolver el total de artículos
//         return totalItems;

//     } catch (error) {
//         console.error("Error al obtener el total de artículos del carrito:", error);
//         return 0; // Si hay error, retornar 0
//     }
// }

async function fetchCartItemsAndUpdateSubtotal() {
    try {
        const token = localStorage.getItem("access_token");

        // Invitado: usar checkout_data
        if (!token) {
            return getCheckoutTotalItems();
        }

        // Autenticado: usar carrito backend
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/api/cart/cart-items`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener los artículos del carrito");
        }

        const data = await response.json();
        return data.cart.reduce((total, item) => total + item.count, 0);

    } catch (error) {
        console.error("Error al obtener el total de artículos del carrito:", error);
        return 0;
    }
}

// Observador de cambios de ruta
const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        checkAndLoadCheckout();
    }
});

// PARA LA TARGETA

function getToken() {
    return localStorage.getItem("access_token");
}

// PARA PAGAR, CREAR ORDEN
// document.addEventListener("DOMContentLoaded", function () {
//     // Obtener el clientToken desde el localStorage
//     const clientToken = localStorage.getItem('braintree_client_token');

//     // Obtener los valores del localStorage y asignarlos a los campos del formulario
//     if (clientToken) {
//         const fields = [
//             { id: "emailOr", key: "email" },
//             { id: "nombreOr", key: "last_name" },
//             { id: "apellidoOr", key: "first_name" },
//             { id: "dniOr", key: "ruc" },
//             { id: "direcionOr", key: "direccion" },
//             { id: "ciudadOr", key: "ciudad" },
//             { id: "regionOr", key: "region" },
//             { id: "cod-postalOr", key: "cod_postal" },
//             { id: "telefonoOr", key: "telefono" }
//         ];

//         // Recorrer los campos y asignar los valores desde localStorage (si están presentes)
//         fields.forEach(field => {
//             const value = localStorage.getItem(field.key);  // Obtener el valor del localStorage
//             const inputElement = document.getElementById(field.id);  // Obtener el input

//             // Si el valor existe, no es undefined, y no es vacío, asignarlo al input
//             if (value && value !== "undefined" && value !== "null" && value.trim() !== "") {
//                 inputElement.value = value;
//             } else {
//                 inputElement.value = '';  // Dejar vacío si no hay valor válido
//             }
//         });

//         // Inicializar el formulario de pago de Braintree (Drop-in UI)
//         braintree.dropin.create({
//             authorization: clientToken,
//             container: "#dropin-container"  // Aquí se genera el formulario de pago
//         }, function (err, instance) {
//             if (err) {
//                 console.error("Error al crear Drop-in UI:", err);
//                 return;
//             }

//             console.log("Drop-in UI cargado con éxito.");

//             // Seleccionamos el botón de pago, el texto y el spinner
//             const payButton = document.getElementById('pay-button'); // Botón de pago
//             const loadingSpinner = payButton.querySelector('.loading-spinner'); // Spinner dentro del botón
//             const textPagar = payButton.querySelector('.textPagar'); // Texto "Pagar ahora" dentro del botón

//             if (payButton && loadingSpinner && textPagar) {
//                 payButton.addEventListener('click', function (event) {
//                     // Prevenir clics múltiples
//                     event.preventDefault();

//                     // Ocultar el texto "Pagar ahora" y mostrar el spinner
//                     textPagar.style.display = 'none'; // Ocultar el texto
//                     loadingSpinner.style.display = 'block'; // Mostrar el spinner

//                     // Deshabilitar el botón
//                     payButton.style.pointerEvents = 'none'; // Deshabilitar el div completo
//                      // Obtener el código de cupón ingresado
//                     const couponCode = document.getElementById('coupon_code').value.trim();
//                     // Obtener los datos del formulario
//                     let formData = {
//                         full_name: document.getElementById("nombreOr").value + " " + document.getElementById("apellidoOr").value,
//                         address_line_1: document.getElementById("direcionOr").value,
//                         address_line_2: "actualizar",
//                         city: document.getElementById("ciudadOr").value,
//                         state_province_region: document.getElementById("regionOr").value,
//                         postal_zip_code: document.getElementById("cod-postalOr").value,
//                         country_region: "USA",
//                         telephone_number: document.getElementById("telefonoOr").value,
//                         shipping_id: document.querySelector('.checkbox-envio:checked')?.value || null,
//                         // coupon_name: document.getElementById('coupon_code').value.trim()
//                         coupon_name: couponCode  
//                     };

//                     console.log("datoos que se enviaaaaaaa:",formData);

//                     // Obtener el nonce con Braintree
//                     instance.requestPaymentMethod(function (err, payload) {
//                         if (err) {
//                             console.error("Error obteniendo el nonce:", err);
//                             // Ocultar spinner y habilitar el botón si ocurre un error
//                             loadingSpinner.style.display = 'none';
//                             textPagar.style.display = 'inline'; // Mostrar el texto de nuevo
//                             payButton.style.pointerEvents = 'auto'; // Habilitar el div
//                             return;
//                         }

//                         console.log("Nonce obtenido:", payload.nonce);
//                         const token = getToken();
//                         // Agregar el nonce al objeto de datos
//                         formData.nonce = payload.nonce;
//                         console.log("DATOS DE COMPRRA-CLIENTE", formData);

//                         // Enviar los datos al backend para procesar el pago
//                         const baseUrl = document.body.dataset.apiUrl;
//                         fetch(`${baseUrl}/api/payment/make-payment`, {
//                             method: "POST",
//                             headers: {
//                                 "Authorization": `Bearer ${token}`,  // El token de autenticación
//                                 "Content-Type": "application/json"
//                             },
//                             body: JSON.stringify({
//                                 nonce: payload.nonce, // ✅ Correcto
//                                 shipping_id: formData.shipping_id,
//                                 coupon_name: formData.coupon_name,
//                                 full_name: formData.full_name,
//                                 address_line_1: formData.address_line_1,
//                                 address_line_2: formData.address_line_2,
//                                 city: formData.city,
//                                 state_province_region: formData.state_province_region,
//                                 postal_zip_code: formData.postal_zip_code,
//                                 country_region: formData.country_region,
//                                 telephone_number: formData.telephone_number
//                             })
//                         }).then(response => response.json())
//                             .then(data => {
//                                 console.log("Respuesta del pago:", data);
//                                 if (data.success) {
//                                     confetti({
//                                         particleCount: 150,
//                                         spread: 70,
//                                         origin: { y: 0.6 }
//                                     });

//                                     Swal.fire({
//                                         icon: 'success',
//                                         title: '¡Pago procesado con éxito!',
//                                         showConfirmButton: false,
//                                         timer: 2000
//                                     });

//                                     setTimeout(() => {
//                                         const baseUrl = document.body.dataset.apiUrl;
//                                         window.location.href = `${baseUrl}/perfil/`;
//                                     }, 2000); // Espera 2 segundos para que se vea el confeti y el SweetAlert
//                                 }

//                                 else {
//                                     Swal.fire({
//                                         icon: 'error',
//                                         title: 'Hubo un error en el proceso de pago',
//                                         showConfirmButton: true
//                                     });
//                                 }
//                             })
//                             .catch(error => {
//                                 console.error("Error en la transacción:", error);
//                             })
//                             .finally(() => {
//                                 // Ocultar el spinner y habilitar el botón después de la respuesta
//                                 loadingSpinner.style.display = 'none';
//                                 textPagar.style.display = 'inline'; // Mostrar el texto "Pagar ahora"
//                                 payButton.style.pointerEvents = 'auto'; // Habilitar el div
//                             });
//                     });
//                 });
//             }
//         });
//     } else {
//         console.error("No se encontró el token de Braintree.");
//     }
// });

document.addEventListener("DOMContentLoaded", function () {
    const payButton = document.getElementById("pay-button");
    const loadingSpinner = document.querySelector(".loading-spinner");

    if (!payButton) return;

    payButton.addEventListener("click", async function (event) {
        event.preventDefault();

        const baseUrl = document.body.dataset.apiUrl;
        const token = getToken(); // puede ser null

        payButton.disabled = true;
        if (loadingSpinner) loadingSpinner.style.display = "inline-block";

        try {
            const fields = [
                { id: "emailOr", key: "email" },
                { id: "nombreOr", key: "first_name" },
                { id: "apellidoOr", key: "last_name" },
                { id: "dniOr", key: "ruc" },
                { id: "direcionOr", key: "direccion" },
                { id: "ciudadOr", key: "ciudad" },
                { id: "regionOr", key: "region" },
                { id: "cod-postalOr", key: "cod_postal" },
                { id: "telefonoOr", key: "telefono" }
            ];

            const checkoutData = {};

            for (const field of fields) {
                const el = document.getElementById(field.id);
                checkoutData[field.key] = el ? el.value.trim() : "";
            }

            const shippingSelected = document.querySelector(".checkbox-envio:checked")?.value || "";
            const couponCode = document.getElementById("coupon_code")?.value.trim() || "";

            checkoutData.shipping_id = shippingSelected;
            checkoutData.coupon_code = couponCode;

            if (!checkoutData.email || !checkoutData.first_name || !checkoutData.last_name || !checkoutData.direccion) {
                throw new Error("Completa los campos obligatorios");
            }

            if (!checkoutData.shipping_id) {
                throw new Error("Selecciona un método de envío");
            }

            const headers = {
                "Content-Type": "application/json"
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${baseUrl}/api/payment/generate-token`, {
                method: "GET",
                headers
            });

            const data = await response.json();

            if (!response.ok || !data.client_token) {
                throw new Error(data?.error || "No se pudo generar el token de pago");
            }

            sessionStorage.setItem("checkout_data", JSON.stringify(checkoutData));
            sessionStorage.setItem("braintree_client_token", data.client_token);

            window.location.href = `${baseUrl}/shop/pagoOnline/`;

        } catch (error) {
            console.error("Error al preparar checkout:", error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Ocurrió un problema"
            });

            payButton.disabled = false;
            if (loadingSpinner) loadingSpinner.style.display = "none";
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    checkAndLoadCheckout();
    observer.observe(document.body, { childList: true, subtree: true });
});