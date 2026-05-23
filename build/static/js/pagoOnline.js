document.addEventListener("DOMContentLoaded", function () {
    const baseUrl = document.body.dataset.apiUrl;
    const clientToken = sessionStorage.getItem("braintree_client_token");
    const rawCheckoutData = sessionStorage.getItem("checkout_data");

    if (!clientToken || !rawCheckoutData) {
        sessionStorage.removeItem("checkout_data");
        sessionStorage.removeItem("braintree_client_token");

        Swal.fire({
            icon: "error",
            title: "Checkout no iniciado",
            text: "Vuelve a la página anterior y completa tus datos",
            timer: 1800,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        setTimeout(() => {
            window.location.href = `${baseUrl}/shop/checkout/`;
        }, 1800);

        return;
    }

    let checkoutData = {};

    try {
        checkoutData = JSON.parse(rawCheckoutData);
    } catch (error) {
        console.error("Error parseando checkout_data:", error);

        sessionStorage.removeItem("checkout_data");
        sessionStorage.removeItem("braintree_client_token");

        Swal.fire({
            icon: "error",
            title: "Datos de checkout inválidos",
            timer: 1800,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = `${baseUrl}/shop/checkout/`;
        }, 1800);

        return;
    }

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

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.value = checkoutData[field.key] || "";
        }
    });

    const couponInput = document.getElementById("coupon_code");
    if (couponInput) {
        couponInput.value = checkoutData.coupon_code || "";
    }

    braintree.dropin.create({
        authorization: clientToken,
        container: "#dropin-container"
    }, function (err, instance) {
        if (err) {
            console.error("Error al crear Drop-in UI:", err);
            Swal.fire({
                icon: "error",
                title: "No se pudo cargar el formulario de pago"
            });
            return;
        }

        const payButton = document.getElementById("confirm-pay-button");
        if (!payButton) {
            console.error("No existe #confirm-pay-button");
            return;
        }

        const loadingSpinner = payButton.querySelector(".loading-spinner");
        const textPagar = payButton.querySelector(".textPagar");

        payButton.addEventListener("click", function (event) {
            event.preventDefault();

            const formData = {
                full_name: `${document.getElementById("nombreOr")?.value.trim() || ""} ${document.getElementById("apellidoOr")?.value.trim() || ""}`.trim(),
                email: document.getElementById("emailOr")?.value.trim() || "",
                ruc: document.getElementById("dniOr")?.value.trim() || "",
                address_line_1: document.getElementById("direcionOr")?.value.trim() || "",
                address_line_2: "",
                city: document.getElementById("ciudadOr")?.value.trim() || "",
                state_province_region: document.getElementById("regionOr")?.value.trim() || "",
                postal_zip_code: document.getElementById("cod-postalOr")?.value.trim() || "",
                country_region: "PE",
                telephone_number: document.getElementById("telefonoOr")?.value.trim() || "",
                shipping_id: checkoutData.shipping_id || null,
                coupon_name: document.getElementById("coupon_code")?.value.trim() || ""
            };

            if (!formData.email || !formData.full_name || !formData.address_line_1) {
                Swal.fire({
                    icon: "warning",
                    title: "Faltan datos",
                    text: "Completa la información requerida antes de pagar"
                });
                return;
            }

            if (!formData.shipping_id) {
                Swal.fire({
                    icon: "warning",
                    title: "Falta el envío",
                    text: "No se encontró el método de envío seleccionado"
                });
                return;
            }

            if (textPagar) textPagar.style.display = "none";
            if (loadingSpinner) loadingSpinner.style.display = "inline-block";
            payButton.disabled = true;

            instance.requestPaymentMethod(function (err, payload) {
                if (err) {
                    console.error("Error obteniendo el nonce:", err);

                    if (loadingSpinner) loadingSpinner.style.display = "none";
                    if (textPagar) textPagar.style.display = "inline";
                    payButton.disabled = false;

                    Swal.fire({
                        icon: "error",
                        title: "No se pudo obtener el método de pago"
                    });
                    return;
                }

                const token = getToken();
                const headers = {
                    "Content-Type": "application/json"
                };

                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                fetch(`${baseUrl}/api/payment/make-payment`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        nonce: payload.nonce,
                        shipping_id: formData.shipping_id,
                        coupon_name: formData.coupon_name,
                        full_name: formData.full_name,
                        email: formData.email,
                        ruc: formData.ruc,
                        address_line_1: formData.address_line_1,
                        address_line_2: formData.address_line_2,
                        city: formData.city,
                        state_province_region: formData.state_province_region,
                        postal_zip_code: formData.postal_zip_code,
                        country_region: formData.country_region,
                        telephone_number: formData.telephone_number
                    })
                })
                .then(async response => {
                    const data = await response.json();
                    return { ok: response.ok, data };
                })
                .then(({ ok, data }) => {
                    if (ok && data.success) {
                        Swal.fire({
                            icon: "success",
                            title: "¡Pago procesado con éxito!",
                            timer: 2000,
                            showConfirmButton: false
                        });

                        sessionStorage.removeItem("checkout_data");
                        sessionStorage.removeItem("braintree_client_token");

                        setTimeout(() => {
                            window.location.href = token ? `${baseUrl}/perfil/` : `${baseUrl}/`;
                        }, 2000);
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Hubo un error en el pago",
                            text: data.message || "No se pudo completar la transacción"
                        });
                    }
                })
                .catch(error => {
                    console.error("Error en la transacción:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error de conexión"
                    });
                })
                .finally(() => {
                    if (loadingSpinner) loadingSpinner.style.display = "none";
                    if (textPagar) textPagar.style.display = "inline";
                    payButton.disabled = false;
                });
            });
        });
    });
});