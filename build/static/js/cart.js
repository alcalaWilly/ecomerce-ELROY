function getApiBaseUrl() {
  return document.body.dataset.apiUrl || window.location.origin;
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function normaliseCartItem(item) {
  return {
    product_id: Number(item.product_id),
    quantity: Number(item.quantity ?? 1),
    size_id:
      item.size_id !== undefined && item.size_id !== null && item.size_id !== ""
        ? String(item.size_id)
        : null,
    color:
      item.color !== undefined && item.color !== null && String(item.color).trim() !== ""
        ? String(item.color).trim().toLowerCase()
        : null,
  };
}

function buildCartKey(item) {
  const normalised = normaliseCartItem(item);
  return `${normalised.product_id}__${normalised.size_id ?? "no_size"}__${normalised.color ?? "no_color"}`;
}

function getLocalCart() {
  const raw = JSON.parse(localStorage.getItem("cart")) || [];
  return raw.map(normaliseCartItem);
}

function saveLocalCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function consolidateLocalCart(cart) {
  const map = new Map();

  for (const rawItem of cart) {
    const item = normaliseCartItem(rawItem);
    const key = buildCartKey(item);

    if (map.has(key)) {
      map.get(key).quantity += item.quantity;
    } else {
      map.set(key, { ...item });
    }
  }

  return Array.from(map.values());
}

// ==============================
// OPTIONAL: ENRICH LOCAL CART FOR UI
// ==============================
let sizesCache = null;

async function getAllSizes() {
    if (sizesCache) return sizesCache;

    const baseUrl = document.body.dataset.apiUrl;

    try {
        const response = await fetch(`${baseUrl}/get/sizes/`);
        if (!response.ok) throw new Error("No se pudieron obtener las tallas.");

        const data = await response.json();
        sizesCache = data.results || [];
        return sizesCache;
    } catch (error) {
        console.error("Error obteniendo tallas:", error);
        return [];
    }
}

async function enrichLocalCart(cart) {
    const baseUrl = getApiBaseUrl();
    const consolidated = consolidateLocalCart(cart);
    const allSizes = await getAllSizes();

    const uniqueProductIds = [...new Set(consolidated.map((item) => item.product_id))];

    const productResponses = await Promise.all(
        uniqueProductIds.map(async (id) => {
            try {
                const response = await fetch(`${baseUrl}/product/${id}`);
                if (!response.ok) return null;
                return await response.json();
            } catch (error) {
                console.error(`Error obteniendo producto ${id}:`, error);
                return null;
            }
        })
    );

    const productMap = {};
    for (const data of productResponses) {
        if (data?.product?.id) {
            productMap[Number(data.product.id)] = data;
        }
    }

    return consolidated.map((item) => {
        const details = productMap[item.product_id];
        const product = details?.product || null;
        const sizeInfo = resolveSizeInfoFromList(allSizes, item.size_id);

        return {
            product_id: item.product_id,
            quantity: item.quantity,
            size_id: sizeInfo.size_id,
            talla: sizeInfo.talla,
            color: item.color,
            product: product
        };
    });
}

function resolveSizeInfoFromList(sizes, rawSizeId) {
    if (rawSizeId === null || rawSizeId === undefined || rawSizeId === "") {
        return {
            talla: null,
            size_id: null
        };
    }

    const sizeId = String(rawSizeId);

    const tallaEncontrada = sizes.find(
        (size) => Number(size.id) === Number(rawSizeId)
    );

    return {
        talla: tallaEncontrada?.cNombreTalla ?? null,
        size_id: sizeId
    };
}

async function consolidateCartData(cartData) {
    const allSizes = await getAllSizes();

    const consolidatedCart = cartData.reduce((acc, item) => {
        const productId = item.product?.id;
        const sizeId = item.talla ?? null;
        const color = item.color ?? null;

        const key = `${productId}_${sizeId ?? "no_size"}_${color ?? "no_color"}`;

        if (acc[key]) {
            acc[key].quantity += Number(item.count || 1);
        } else {
            acc[key] = {
                ...item,
                quantity: Number(item.count || 1)
            };
        }

        return acc;
    }, {});

    const consolidatedArray = Object.values(consolidatedCart);

    return consolidatedArray.map(item => {
        const sizeInfo = resolveSizeInfoFromList(allSizes, item.talla);

        return {
            product_id: item.product?.id ?? null,
            product: item.product,
            quantity: Number(item.quantity || item.count || 1),
            talla: sizeInfo.talla,
            size_id: sizeInfo.size_id,
            color: item.color ?? null
        };
    });
}
// ==============================
// BACKEND
// ==============================

// async function addToServerCart(productId, sizeId = null, color = null) {
//   const accessToken = getAccessToken();
//   const baseUrl = getApiBaseUrl();

//   const payload = {
//     product_id: Number(productId),
//     ...(sizeId !== null && sizeId !== undefined && sizeId !== "" && {
//       talla_id: Number(sizeId),
//     }),
//     ...(color && { color: String(color).trim().toLowerCase() }),
//   };

//   const response = await fetch(`${baseUrl}/api/cart/add-item`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${accessToken}`,
//     },
//     body: JSON.stringify(payload),
//   });

//   const result = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     throw new Error(result.detail || "No se pudo agregar el producto.");
//   }

//   return result;
// }

async function addToServerCart(productId, sizeId = null, color = null) {
  const accessToken = getAccessToken();
  const baseUrl = getApiBaseUrl();

  const payload = {
    product_id: Number(productId),
    ...(sizeId !== null && sizeId !== undefined && sizeId !== "" && {
      talla_id: Number(sizeId),
    }),
    ...(color && { color: String(color).trim().toLowerCase() }),
  };

  const response = await fetch(`${baseUrl}/api/cart/add-item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.detail || "No se pudo agregar el producto.");
  }

  return result;
}

async function syncCartWithBackend(cartData) {
  if (!cartData?.length) return;

  try {
    for (const item of cartData) {
      const quantity = Number(item.quantity || 1);

      for (let i = 0; i < quantity; i++) {
        await addToServerCart(
          item.product_id,
          item.size_id ?? null,
          item.color ?? null
        );
      }
    }

    localStorage.removeItem("cart");
    console.log("✅ Carrito local sincronizado con backend.");
  } catch (error) {
    console.error("❌ Error en syncCartWithBackend:", error);
    throw error;
  }
}

// ==============================
// GUEST CART
// ==============================

function addToGuestCart(productId, sizeId = null, color = null) {
  const cart = getLocalCart();

  const newItem = normaliseCartItem({
    product_id: productId,
    quantity: 1,
    size_id: sizeId,
    color,
  });

  const existingIndex = cart.findIndex(
    (item) =>
      item.product_id === newItem.product_id &&
      item.size_id === newItem.size_id &&
      item.color === newItem.color
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push(newItem);
  }

  const consolidated = consolidateLocalCart(cart);
  saveLocalCart(consolidated);

  return consolidated;
}

// ==============================
// MAIN
// ==============================

async function addToCart(productId, sizeId = null, colorRGB = null) {
  console.log("Producto agregado:", { productId, sizeId, colorRGB });

  document.dispatchEvent(new CustomEvent("cart:open"));

  const accessToken = getAccessToken();

  try {
    if (accessToken) {
      // Usuario autenticado
      await addToServerCart(productId, sizeId, colorRGB);

      updateCartCount();
      await loadCartItems();
      showMessage("Producto agregado al carrito.", "success");
      return;
    }

    // Usuario invitado
    const guestCart = addToGuestCart(productId, sizeId, colorRGB);

    console.log("Carrito local guardado:", guestCart);

    updateCartCount();
    await loadCartItems();
    showMessage("Producto agregado al carrito (sin iniciar sesión).", "success");
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    showMessage(error.message || "Hubo un error en la solicitud.", "error");
  }
}


async function updateCartCount() {
    const accessToken = localStorage.getItem("access_token");
    let totalItems = 0;

    if (accessToken) {
        // 🟢 Usuario autenticado: Obtener el total desde el backend
        const baseUrl = document.body.dataset.apiUrl;
        const url = `${baseUrl}/api/cart/get-item-total`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Total de productos en el carrito:", result.total_items);
                totalItems = result.total_items;
            } else {
                console.error("Error al obtener el total del carrito:", result);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    } else {
        // 🔴 Usuario no autenticado: Agrupar productos únicos en LocalStorage
        console.warn("Usuario no autenticado. Contando productos en LocalStorage...");
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Crear un Set para filtrar productos únicos por product_id, size_id y color
        const uniqueItems = new Set(cart.map(item => `${item.product_id}_${item.size_id}_${item.color || "no_color"}`));

        // La longitud del Set representa el número de productos únicos, considerando también el color
        totalItems = uniqueItems.size;
    }

    // Actualizar el número de productos en el carrito
    const cartShop = document.getElementById("cart-shop");
    if (cartShop) {
        cartShop.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <i class="bx bx-cart-alt" id="link3"></i>
                ${totalItems > 0 ? `<span class="cart-count">${totalItems}</span>` : ""}
            </div>
        `;
    }
}


async function fetchCartItems() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        console.error("No hay token de acceso disponible.");
        return null;
    }
    const baseUrl = document.body.dataset.apiUrl;
    const url = `${baseUrl}/api/cart/cart-items`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error("Error al obtener los productos del carrito.");
        return await response.json();
    } catch (error) {
        console.error("Error en fetchCartItems:", error);
        return null;
    }
}

async function fetchCartTotal() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        console.error("No hay token de acceso disponible.");
        return null;
    }
    const baseUrl = document.body.dataset.apiUrl;
    const url = `${baseUrl}/api/cart/get-total`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error("Error al obtener el total del carrito.");
        return await response.json();
    } catch (error) {
        console.error("Error en fetchCartTotal:", error);
        return null;
    }
}

async function loadCartItems() {
    try {
        const accessToken = localStorage.getItem("access_token");
        const cartContainer = document.querySelector(".cart__container");
        const totalElement = document.querySelector(".cart__total");
        const checkoutButtonContainer = document.getElementById("checkout-button-container");

        cartContainer.innerHTML = "";
        checkoutButtonContainer.innerHTML = "";

        let cartData = [];
        let totalCost = 0;

        if (accessToken) {
            // 🔐 Usuario autenticado
            const [cartResponse, totalResponse] = await Promise.all([
                fetchCartItems(),
                fetchCartTotal()
            ]);
            console.log("cartResponse...:", cartResponse);
            // console.log("totalResponse.......:", totalResponse);
            if (!cartResponse || !totalResponse) return;

            cartData = await consolidateCartData(cartResponse.cart);
            totalCost = totalResponse.total_cost;

        } else {
            // 👤 Usuario invitado
            let localCart = JSON.parse(localStorage.getItem("cart")) || [];

            // 👉 CLAVE: enriquecer datos (ahora sí correcto)
            cartData = await enrichLocalCart(localCart);
        }

        // console.log("🟢 Cart final:", cartData);

        // 🔥 Render
        cartData.forEach(item => {
            const product = item.product;

            if (!product) return; // seguridad

            const tallaHTML = item.talla
                ? `<span>Talla:</span> <span>${item.talla}</span>`
                : "";
            // const tallaHTML = item.size_id
            //     ? `<span>Size:</span> <span>${item.talla || item.size_id}</span>`
            //     : "";

            const colorHTML = item.color
                ? `<span>Color:</span> 
                   <span style="
                        background-color: ${item.color};
                        width: 20px;
                        height: 20px;
                        display: inline-block;
                        border-radius: 50%;
                   "></span>`
                : "";

            cartContainer.innerHTML += `
                <article class="cart__card" data-product-id="${product.id}">
                    <div class="cart__box">
                        <img src="${product.imagenes?.[0]?.cRutaImagen || 'assets/img/default.png'}"
                             alt="${product.name}"
                             class="cart__img">
                    </div>

                    <div class="cart__details">
                        <h3 class="cart__title">${product.name}</h3>

                        <div class="cart__size-color">
                            ${tallaHTML} ${colorHTML}
                        </div>

                        <span class="cart__price">s/${product.price}</span>

                        <div class="cart__amount">
                            <div class="cart__amount-content">

                                <span class="cart__amount-box cart__minus"
                                      data-product-id="${product.id}"
                                      data-size-id="${item.size_id}"
                                      data-color="${item.color}">
                                    <i class="bx bx-minus"></i>
                                </span>

                                <span class="cart__amount-number">
                                    ${item.quantity}
                                </span>

                                <span class="cart__amount-box cart__plus"
                                      data-product-id="${product.id}"
                                      data-size-id="${item.size_id}"
                                      data-color="${item.color}">
                                    <i class="bx bx-plus"></i>
                                </span>

                            </div>

                            <i class="bx bx-trash-alt cart__amount-trash"
                               data-product-id="${product.id}"
                               data-size-id="${item.size_id}"
                               data-color="${item.color}">
                            </i>
                        </div>
                    </div>
                </article>
            `;
        });

        // 🔥 Total (solo una vez)
        totalCost = cartData.reduce((acc, item) => {
            return acc + ((item.product?.price || 0) * item.quantity);
        }, 0);

        totalElement.textContent = `s/ ${totalCost.toFixed(2)}`;

        // =========================
        // EVENTOS
        // =========================

        document.querySelectorAll(".cart__plus").forEach(button => {
            button.addEventListener("click", async (event) => {
                const productId = Number(event.currentTarget.dataset.productId);
                const sizeId = event.currentTarget.dataset.sizeId;
                const color = event.currentTarget.dataset.color;

                await updateCartItem(productId, 1, sizeId, color);
            });
        });

        document.querySelectorAll(".cart__minus").forEach(button => {
            button.addEventListener("click", async (event) => {
                const productId = Number(event.currentTarget.dataset.productId);
                const sizeId = event.currentTarget.dataset.sizeId;
                const color = event.currentTarget.dataset.color;

                await updateCartItem(productId, -1, sizeId, color);
            });
        });

        document.querySelectorAll(".cart__amount-trash").forEach(button => {
            button.addEventListener("click", async (event) => {
                const productId = Number(event.currentTarget.dataset.productId);
                const sizeId = event.currentTarget.dataset.sizeId;
                const color = event.currentTarget.dataset.color;

                await removeItemFromCart(productId, sizeId, color);
            });
        });

        // =========================
        // CHECKOUT
        // =========================

        if (cartData.length > 0) {
            checkoutButtonContainer.innerHTML = `
                <a id="cart__button" href="#" class="cart__button">
                    Check Out
                    <div id="loading-spinner" class="loading-spinner"></div>
                </a>
            `;

            const checkoutButton = document.getElementById("cart__button");
            const loadingSpinner = document.getElementById("loading-spinner");

            checkoutButton.addEventListener("click", function (event) {
                event.preventDefault();

                checkoutButton.disabled = true;
                loadingSpinner.style.display = "inline-block";

                localStorage.setItem("checkout_data", JSON.stringify(cartData));

                window.location.href = "/shop/checkouts/";
            });
        }

    } catch (error) {
        console.error("❌ Error en loadCartItems:", error);
    }
}

function getToken() {
    return localStorage.getItem("access_token");
}


async function removeItemFromCart(productId, sizeId = null, color = null) {
    const accessToken = localStorage.getItem("access_token");

    const productIdNum = Number(productId);
    const normalisedSizeId =
        sizeId !== null && sizeId !== undefined && sizeId !== "" && sizeId !== "null"
            ? String(sizeId)
            : null;

    const normalisedColor =
        color !== null && color !== undefined && String(color).trim() !== "" && color !== "null"
            ? String(color).trim().toLowerCase()
            : null;

    // =========================
    // USUARIO INVITADO
    // =========================
    if (!accessToken) {
        try {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];

            const newCart = cart.filter(item => {
                const sameProduct = Number(item.product_id) === productIdNum;
                const sameSize = (item.size_id ?? null) === normalisedSizeId;
                const sameColor = (item.color ?? null) === normalisedColor;

                // eliminar solo la combinación exacta
                return !(sameProduct && sameSize && sameColor);
            });

            localStorage.setItem("cart", JSON.stringify(newCart));

            await loadCartItems();
            await updateCartCount();
        } catch (error) {
            console.error("❌ Error al eliminar del carrito local:", error);
        }
        return;
    }

    // =========================
    // USUARIO AUTENTICADO
    // =========================
    try {
        const baseUrl = document.body.dataset.apiUrl;

        const payload = {
            product_id: productIdNum,
            talla_id: normalisedSizeId !== null ? Number(normalisedSizeId) : null,
            color: normalisedColor
        };

        const response = await fetch(`${baseUrl}/api/cart/remove-item`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            await loadCartItems();
            await updateCartCount();
        } else {
            const data = await response.json().catch(() => ({}));
            console.error("❌ Error al eliminar del servidor:", data);
        }
    } catch (error) {
        console.error("❌ Error en removeItemFromCart:", error);
    }
}

async function updateCartItem(productId, change, sizeId = null, color = null) {
    const accessToken = localStorage.getItem("access_token");

    const productIdNum = Number(productId);
    const normalisedSizeId =
        sizeId !== null && sizeId !== undefined && sizeId !== "" && sizeId !== "null"
            ? String(sizeId)
            : null;

    const normalisedColor =
        color !== null && color !== undefined && String(color).trim() !== "" && color !== "null"
            ? String(color).trim().toLowerCase()
            : null;

    try {
        // Buscar el item exacto usando product + size + color
        const selector = `.cart__amount-box[data-product-id="${productIdNum}"][data-size-id="${normalisedSizeId}"][data-color="${normalisedColor}"]`;
        const clickedElement = document.querySelector(selector);

        let currentCount = 0;

        if (clickedElement) {
            const card = clickedElement.closest(".cart__card");
            const countElement = card?.querySelector(".cart__amount-number");
            currentCount = Number(countElement?.textContent || 0);
        }

        // fallback: si no encontró en DOM, calculamos desde localStorage
        if (!currentCount && !accessToken) {
            const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
            const existingItem = cartItems.find(item =>
                Number(item.product_id) === productIdNum &&
                (item.size_id ?? null) === normalisedSizeId &&
                (item.color ?? null) === normalisedColor
            );
            currentCount = Number(existingItem?.quantity || 0);
        }

        const newCount = currentCount + change;

        // Si llega a 0 o menos, eliminar
        if (newCount < 1) {
            await removeItemFromCart(productIdNum, normalisedSizeId, normalisedColor);
            return;
        }

        // =========================
        // USUARIO AUTENTICADO
        // =========================
        if (accessToken) {
            const baseUrl = document.body.dataset.apiUrl;

            const response = await fetch(`${baseUrl}/api/cart/update-item`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product_id: productIdNum,
                    count: change, // aquí mantengo tu backend tal como lo espera
                    talla_id: normalisedSizeId !== null ? Number(normalisedSizeId) : null,
                    color: normalisedColor
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                await loadCartItems();
                await updateCartCount();
            } else {
                console.error("❌ Error al actualizar en servidor:", data);
            }

            return;
        }

        // =========================
        // USUARIO INVITADO
        // =========================
        let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

        const itemIndex = cartItems.findIndex(item =>
            Number(item.product_id) === productIdNum &&
            (item.size_id ?? null) === normalisedSizeId &&
            (item.color ?? null) === normalisedColor
        );

        if (itemIndex === -1) {
            console.warn("⚠️ Producto no encontrado en carrito local");
            return;
        }

        cartItems[itemIndex].quantity = newCount;

        localStorage.setItem("cart", JSON.stringify(cartItems));

        await loadCartItems();
        await updateCartCount();

    } catch (error) {
        console.error("❌ Error en updateCartItem:", error);
    }
}




function showMessage(message, type = "success") {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}


// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    const accessToken = localStorage.getItem("access_token");
    let cartData = JSON.parse(localStorage.getItem("cart")) || [];

    if (accessToken && cartData.length > 0) {
        // 🔄 1. sincronizar primero
        await syncCartWithBackend(cartData);
    }

    // 🔄 2. luego recién cargar UI
    await updateCartCount();
    await loadCartItems();
});



// Hacer la función accesible globalmente
window.addToCart = addToCart;