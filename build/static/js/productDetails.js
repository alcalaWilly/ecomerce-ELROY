let currentProductData = null; // 

// if (window.location.pathname === "/shop/details/") {
//     function getProductIdFromURL() {
//         const urlParams = new URLSearchParams(window.location.search);
//         return urlParams.get('id');

//     }


//     const productId = getProductIdFromURL();
//     // Solicitar datos del producto y tallas y colores en una sola llamada
//     fetchProductDetailsAndVariants(productId)
//         .then(({ productData, sizes, colors }) => {
//             console.log("Detalles del producto:", productData);

//             currentProductData = productData;

//             if (productData.product && productData.product.imagenes && productData.product.imagenes.length > 0) {
//                 console.log("Imágenes recibidas:", productData.product.imagenes);
//                 renderizarImagenes(productData.product.imagenes);
//             } else {
//                 console.warn("No hay imágenes disponibles.");
//             }

//             addDetalle(productData.product, sizes, colors);

//             console.log("ID CATEGORIAAA", productData.product.category)
//             // 🔥 PASAMOS LA CATEGORÍA directamente
//             loadRelatedProducts(productData.product.category, productData.product.id);
//         })
//         .catch(error => console.error("Error en la solicitud del producto:", error));

// }

// // Función optimizada que hace solo una llamada a la API
// async function fetchProductDetailsAndVariants(productId) {
//     try {
//         const baseUrl = document.body.dataset.apiUrl;
//         const response = await fetch(`${baseUrl}/product/${productId}`);

//         if (!response.ok) {
//             throw new Error("Error al obtener el producto");
//         }

//         const data = await response.json();

//         // Obtener las tallas y colores del producto
//         const sizesData = data.tallas || []; // Extraer tallas del JSON
//         const colors = data.colores || [];   // Asegúrate de que tu API tenga este campo

//         // Mantener id y cNombreTalla en cada talla
//         const sizes = sizesData.map(talla => ({
//             id: talla.id,  // ID del stock de talla
//             cNombreTalla: talla.talla.cNombreTalla // Nombre de la talla
//         }));

//         return { productData: data, sizes, colors };
//     } catch (error) {
//         console.error("Error obteniendo detalles, tallas o colores:", error);
//         return { productData: {}, sizes: [], colors: [] };
//     }
// }


// function renderizarImagenes(imagenes) {
//     const thumbnailsContainer = document.getElementById("image-thumbnails");
//     const mainImage = document.getElementById("MainProductImg");
//     const loader = document.getElementById("loader"); // Elemento de carga

//     if (!thumbnailsContainer || !mainImage || !loader) {
//         console.error("No se encontraron los elementos en el DOM.");
//         return;
//     }

//     loader.style.display = "block";
//     thumbnailsContainer.innerHTML = "";

//     if (imagenes.length === 0) {
//         loader.style.display = "none";
//         return;
//     }

//     mainImage.src = imagenes[0].cRutaImagen;

//     let imagesLoaded = 0;

//     imagenes.forEach((imagen, index) => {
//         // Creamos el contenedor
//         const wrapper = document.createElement("div");
//         wrapper.classList.add("thumbnail-wrapper");

//         const imgElement = document.createElement("img");
//         imgElement.src = imagen.cRutaImagen;
//         imgElement.alt = `Imagen ${index + 1}`;
//         imgElement.classList.add("list__img", "image__sector-show");

//         // Si es la primera imagen, marcar como seleccionada
//         if (index === 0) {
//             wrapper.classList.add("selected-thumbnail");
//         }

//         imgElement.addEventListener("click", () => {
//             mainImage.src = imagen.cRutaImagen;

//             // Quitar la clase a todos los wrappers
//             document.querySelectorAll(".thumbnail-wrapper").forEach(w => {
//                 w.classList.remove("selected-thumbnail");
//             });

//             // Agregar la clase al wrapper clickeado
//             wrapper.classList.add("selected-thumbnail");
//         });

//         imgElement.onload = () => {
//             imagesLoaded++;
//             if (imagesLoaded === imagenes.length) {
//                 loader.style.display = "none";
//             }
//         };

//         imgElement.onerror = () => {
//             console.error(`Error al cargar la imagen: ${imagen.cRutaImagen}`);
//             imagesLoaded++;
//             if (imagesLoaded === imagenes.length) {
//                 loader.style.display = "none";
//             }
//         };

//         // Meter la imagen dentro del contenedor
//         wrapper.appendChild(imgElement);
//         thumbnailsContainer.appendChild(wrapper);
//     });
// }


// function addDetalle(datos, sizes, colors) {
//     const titleElement = document.querySelector(".details__title");
//     const priceElement = document.querySelector(".details__price");
//     const discountElement = document.querySelector(".details__descount");
//     const sizeContainer = document.querySelector(".details__size-selected");
//     const descriptionElement = document.querySelector(".detail__description");

//     if (!titleElement || !priceElement || !discountElement || !sizeContainer || !descriptionElement) {
//         console.error("Algunos elementos no existen en el DOM.");
//         return;
//     }

//     titleElement.textContent = datos.name || "Producto sin nombre";

//     const originalPrice = parseFloat(datos.price);
//     let finalPrice = originalPrice;

//     const promo = datos.promotions && datos.promotions.length > 0 ? datos.promotions[0] : null;

//     if (promo && promo.code === "") {
//         const discountValue = parseFloat(promo.discount_percentage);
//         if (promo.money) {
//             // Descuento directo en dinero
//             finalPrice = Math.max(originalPrice - discountValue, 0);
//         } else {
//             // Descuento en porcentaje
//             finalPrice = originalPrice * (1 - discountValue / 100);
//         }

//         priceElement.textContent = `$${finalPrice.toFixed(2)}`;
//         discountElement.textContent = `$${originalPrice.toFixed(2)}`;
//         discountElement.style.display = "inline";
//     } else {
//         // No hay promoción válida o el code está lleno → no aplicar descuento
//         priceElement.textContent = `$${originalPrice.toFixed(2)}`;
//         discountElement.style.display = "none";
//     }

//     renderSizesAndColors({ sizes, colors }, sizeContainer, datos.id);

//     descriptionElement.textContent = datos.description || "No hay descripción disponible.";
// }


// // Función para convertir color hexadecimal a RGB
// function hexToRgb(hex) {
//     // Eliminar el signo '#' del comienzo si está presente
//     hex = hex.replace(/^#/, '');

//     // Convertir el valor hexadecimal a RGB
//     const bigint = parseInt(hex, 16);
//     const r = (bigint >> 16) & 255;
//     const g = (bigint >> 8) & 255;
//     const b = bigint & 255;

//     return { r, g, b };
// }

// // Función para renderizar tallas o colores
// function renderSizesAndColors({ sizes, colors }, container, productId) {
//     container.innerHTML = "";

//     const titleElement = document.querySelector(".details__size-Size");
//     const selectionMessage = document.createElement("span");
//     selectionMessage.classList.add("selection-message");
//     const messageSpan = document.querySelector(".meage-sizeColor");
//     container.appendChild(selectionMessage);

//     let selectedSizeId = null;
//     let selectedColor = null;

//     if (sizes.length > 0) {
//         sizes.forEach((size) => {
//             const sizeElement = document.createElement("div");
//             sizeElement.classList.add("selectSize-size");

//             sizeElement.innerHTML = `
//           <a class="typeSize" 
//              href="javascript:void(0);" 
//              data-size-id="${size.id}" 
//              data-product-id="${productId}">
//             ${size.cNombreTalla}
//           </a>`;

//             sizeElement.addEventListener("click", (event) => {
//                 if (event.target.tagName === "A") event.preventDefault();
//                 selectedSizeId = size.id;
//                 selectedColor = null;

//                 document.querySelectorAll(".selectSize-size").forEach(el => {
//                     el.classList.remove("selected-size");
//                 });

//                 sizeElement.classList.add("selected-size");

//                 messageSpan.innerHTML = `Talla seleccionada: <span class="styled-size">${size.cNombreTalla}</span>, quedan pocos!`;
//             });

//             container.appendChild(sizeElement);
//         });

//         document.getElementById("addToCartButton").addEventListener("click", () => {
//             if (selectedSizeId) {
//                 console.log("productId",productId, "selectedSizeId",selectedSizeId)
//                 // addToCart(productId, selectedSizeId, null);
//             } else {
//                 messageSpan.innerHTML = `<span class="alerTalla">¡Por favor, selecciona una talla antes de agregar al carrito!</span>`;
//             }
//         });
//     }

//     else if (colors.length > 0) {
//         colors.forEach((color) => {
//             const rgbColor = hexToRgb(color.color);
//             const colorElement = document.createElement("div");
//             colorElement.classList.add("color-circle");
//             colorElement.style.backgroundColor = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;

//             colorElement.addEventListener("click", () => {
//                 selectedColor = color.color;
//                 messageSpan.innerHTML = `
//               Color seleccionado: <span class="styled-color">${color.color}</span>
//               <div class="color-rectangle" style="background-color: ${color.color};"></div>
//             `;
//             });

//             container.appendChild(colorElement);
//         });

//         document.getElementById("addToCartButton").addEventListener("click", () => {
//             if (selectedColor) {
//                 addToCart(productId, null, selectedColor);
//             } else {
//                 messageSpan.innerHTML = `<span class="alerTalla">¡Por favor, selecciona un color antes de agregar al carrito!</span>`;
//             }
//         });
//     }

//     else {
//         titleElement.textContent = "Opciones";
//         container.innerHTML = "<p>Sin tallas ni colores disponibles</p>";
//     }
// }



// async function loadRelatedProducts(categoryId, currentProductId) {
//     try {
//         if (!categoryId) {
//             console.error('No se recibió una categoría válida.');
//             return;
//         }

//         console.log("Categoría del producto actual:", categoryId);
//         const baseUrl = document.body.dataset.apiUrl;
//         const response = await fetch(`${baseUrl}/get-products/`);
//         const data = await response.json();

//         const swiperWrapper = document.querySelector('#related-products .new-wrapper');
//         swiperWrapper.innerHTML = '';

//         const relatedProducts = data.products.filter(product =>
//             product.category === categoryId && product.id !== currentProductId
//         );

//         const productsToShow = relatedProducts.slice(0, 6);

//         if (productsToShow.length === 0) {
//             console.log('No hay productos relacionados para esta categoría.');
//             return;
//         }

//         productsToShow.forEach(product => {
//             const productElement = createProductElementRelated(product);
//             swiperWrapper.appendChild(productElement);
//             addEventListeners(product, productElement);
//         });

//         initSwipers();
//     } catch (error) {
//         console.error('Error al cargar productos relacionados:', error);
//     }
// }

// function createProductElementRelated(product) {
//     const productElement = document.createElement("div");
//     productElement.classList.add("new__content", "swiper-slide");

//     // Obtener imágenes de manera segura
//     const image1 = product.imagenes?.[0]?.cRutaImagen || "/media/photos/default.jpg";
//     const image2 = product.imagenes?.[1]?.cRutaImagen || "/media/photos/default.jpg";

//     // Obtener tallas disponibles
//     const sizes = product.tallas?.map(talla => `<button class="size-option">${talla.talla.cNombreTalla}</button>`).join("") || "<span>Sin tallas disponibles</span>";

//     productElement.innerHTML = `
//         <a href="/shop/details/?id=${product.id}">
//             <div class="new__tag">New</div> <!-- Se elimina el porcentaje de descuento -->
//             <img src="${image1}" alt="${product.name}" class="new__img">
//             <img src="${image2}" alt="${product.name}" class="new__img2">
//             <h3 class="new__title">${product.name}</h3>
//             <div class="new__prices">
//                 <span class="new__price">S/${product.price}</span>
//             </div>
//             <div>
//                 <a href="javascript:void(0);" class="button new__button add-to-cart" data-product-id="${product.id}" id="toggleSize-${product.id}" aria-expanded="false" aria-controls="selectSize-${product.id}">
//                     <i class="bx bx-cart-alt new__icon"></i>
//                 </a>
//                 <div class="selectSize" id="selectSize-${product.id}" hidden>
//                     <div>
//                         <i class="bx bx-x cart__close" id="closeSize-${product.id}"></i>
//                     </div>
//                     <div>
//                         <span class="selectSize-title">Seleccionar Talla</span>
//                         <div class="selectSize-all" id="sizeContainer-${product.id}">
//                             ${sizes}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </a>
//     `;

//     return productElement;
// }

// function initSwipers() {
//     const sections = document.querySelectorAll(".new.section");

//     sections.forEach((section, index) => {
//         const swiperContainer = section.querySelector(".mySwiper");
//         const wrapper = section.querySelector(".new-wrapper");

//         if (!swiperContainer || !wrapper) {
//             console.warn(`Sección ${index + 1} no tiene un Swiper o wrapper válido.`);
//             return;
//         }

//         if (window.innerWidth > 767) {
//             if (!swipers[index]) {
//                 swipers[index] = new Swiper(swiperContainer, {
//                     watchSlidesProgress: true,
//                     slidesPerView: "auto",
//                     spaceBetween: 0, // Ajusta el espacio entre productos
//                     freeMode: true,
//                 });
//             }
//             wrapper.style.display = "flex"; // Diseño para Swiper en pantallas grandes
//             wrapper.style.gridTemplateColumns = ""; // Resetear estilos de grid
//         } else {
//             destroySwiperIfInitialized(index);
//             wrapper.style.display = "grid";
//             wrapper.style.gridTemplateColumns = "repeat(2, 1fr)"; // Siempre 2 columnas
//         }
//     });
// }

// // Función para destruir Swiper si ya está inicializado
// function destroySwiperIfInitialized(index) {
//     if (swipers[index]) {
//         swipers[index].destroy(true, true);
//         swipers[index] = null;
//     }
// }

if (window.location.pathname === "/shop/details/") {
  initDetailsPage();
}


function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

async function fetchProductDetailsAndVariants(productId) {
  try {
    const baseUrl = document.body?.dataset?.apiUrl || window.location.origin;
    const response = await fetch(`${baseUrl}/product/${productId}`);
    if (!response.ok) throw new Error("Error al obtener el producto");

    const data = await response.json();

    // Tu API viene así: { product, tallas, colores }
    const product = data.product ?? {};
    const tallasRaw = data.tallas ?? [];
    const colores = data.colores ?? [];

    // Tallas normalizadas (lo que tú quieres usar en UI)
    const tallas = tallasRaw.map(t => ({
      talla_id: t.talla?.id ?? null,                 // ✅ id real de la talla
      talla_nombre: t.talla?.cNombreTalla ?? "",     // ✅ nombre
      stock: t.stock ?? 0,
      stock_row_id: t.id ?? null                     // ✅ por si lo necesitas luego
    }));

    // ✅ Retorno limpio (sin anidar productData)
    return { product, tallas, colores };

  } catch (error) {
    console.error("Error obteniendo detalles:", error);
    return { product: {}, tallas: [], colores: [] };
  }
}

async function initDetailsPage() {
  try {
    const productId = getProductIdFromURL();
    if (!productId) return console.warn("⚠️ No se encontró id en la URL.");

    const data = await fetchProductDetailsAndVariants(productId);
    console.log("DATOOOOS-descripción:",data)
    // ✅ UI: imágenes (máx 4)
    renderizarImagenes(data.product?.imagenes || []);
    // ✅+ detalles (UI)
    addDetalle(data);
    // ✅Tallas (UI)
    const container = document.querySelector(".details__size-selected"); // ✅ tu HTML
    renderSizesAndColors(
      { tallas: data.tallas, colores: data.colores },
      container,
      data.product.id
    );
    // ✅ NUEVO: relacionados (con la nueva forma de data)
    loadRelatedProducts(data.product?.category, data.product?.id);

  } catch (error) {
    console.error("❌ Error en initDetailsPage:", error);
  }
}

function renderizarImagenes(imagenes) {
  const thumbnailsContainer = document.getElementById("image-thumbnails");
  const mainImage = document.getElementById("MainProductImg");
  const loader = document.getElementById("loader");

  if (!thumbnailsContainer || !mainImage || !loader) {
    console.error("No se encontraron los elementos en el DOM.");
    return;
  }

  // ✅ máximo 4
  const imgs = (imagenes || []).slice(0, 4);

  loader.style.display = "block";
  thumbnailsContainer.innerHTML = "";

  if (imgs.length === 0) {
    loader.style.display = "none";
    mainImage.removeAttribute("src"); // opcional: dejar vacío
    return;
  }

  // Main por defecto
  mainImage.src = imgs[0].cRutaImagen;

  let imagesLoaded = 0;

  imgs.forEach((imagen, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("thumbnail-wrapper");

    const imgElement = document.createElement("img");
    imgElement.src = imagen.cRutaImagen;
    imgElement.alt = `Imagen ${index + 1}`;
    imgElement.classList.add("list__img", "image__sector-show");

    if (index === 0) wrapper.classList.add("selected-thumbnail");

    imgElement.addEventListener("click", () => {
      mainImage.src = imagen.cRutaImagen;

      document.querySelectorAll(".thumbnail-wrapper").forEach(w => {
        w.classList.remove("selected-thumbnail");
      });

      wrapper.classList.add("selected-thumbnail");
    });

    const done = () => {
      imagesLoaded++;
      if (imagesLoaded === imgs.length) {
        loader.style.display = "none";
      }
    };

    imgElement.onload = done;
    imgElement.onerror = () => {
      console.error(`Error al cargar la imagen: ${imagen.cRutaImagen}`);
      done();
    };

    wrapper.appendChild(imgElement);
    thumbnailsContainer.appendChild(wrapper);
  });
}

function renderSizesAndColors({ tallas = [], colores = [] }, container, productId) {
  if (!container) {
    console.error("❌ No se encontró .details__size-selected en el DOM.");
    return;
  }

  container.innerHTML = "";

  const titleElement = document.querySelector(".details__size-Size");
  const messageSpan = document.querySelector(".meage-sizeColor");

  // tu UI antigua agregaba este span
  const selectionMessage = document.createElement("span");
  selectionMessage.classList.add("selection-message");
  container.appendChild(selectionMessage);

  if (messageSpan) messageSpan.innerHTML = "";

  let selectedSize = null;   // { talla_id, talla_nombre, stock, stock_row_id }
  let selectedColor = null;  // "#FF0000"

  // ✅ 1) TALLAS
  if (Array.isArray(tallas) && tallas.length > 0) {
    if (titleElement) titleElement.textContent = "Size";

    tallas.forEach((size) => {
      const sizeElement = document.createElement("div");
      sizeElement.classList.add("selectSize-size");

      // opcional: si stock 0, deshabilitar visualmente
      if ((size.stock ?? 0) <= 0) sizeElement.classList.add("disabled-size");

      sizeElement.innerHTML = `
        <a class="typeSize"
           href="javascript:void(0);"
           data-stock-row-id="${size.stock_row_id}"
           data-talla-id="${size.talla_id}"
           data-product-id="${productId}">
          ${size.talla_nombre}
        </a>`;

      sizeElement.addEventListener("click", (event) => {
        if (event.target.tagName === "A") event.preventDefault();

        if ((size.stock ?? 0) <= 0) {
          if (messageSpan) messageSpan.innerHTML = `<span class="alerTalla">Talla agotada.</span>`;
          return;
        }

        selectedSize = size;
        selectedColor = null;

        document.querySelectorAll(".selectSize-size").forEach(el => el.classList.remove("selected-size"));
        sizeElement.classList.add("selected-size");

        if (messageSpan) {
          messageSpan.innerHTML =
            `Talla seleccionada: <span class="styled-size">${size.talla_nombre}</span>, quedan ${size.stock}!`;
        }
      });

      container.appendChild(sizeElement);
    });

    const btn = document.getElementById("addToCartButton");
    if (btn) {
      btn.onclick = () => {
        if (!selectedSize) {
          if (messageSpan) {
            messageSpan.innerHTML = `<span class="alerTalla">¡Selecciona una talla antes de agregar al carrito!</span>`;
          }
          return;
        }

        console.log("🛒 Debug addToCart (talla):", {
          productId,
          stock_row_id: selectedSize.stock_row_id,
          talla_id: selectedSize.talla_id
        });

        // ✅ lo que addToCart espera en el parámetro "sizeId"
        addToCart(productId, selectedSize.talla_id, null);
      };
    }

    return; // importante
  }

  // ✅ 2) COLORES
  if (Array.isArray(colores) && colores.length > 0) {
    if (titleElement) titleElement.textContent = "Color";

    colores.forEach((c) => {
      const colorElement = document.createElement("div");
      colorElement.classList.add("color-circle");
      colorElement.style.backgroundColor = c.color;

      // opcional: si stock 0, deshabilitar
      if ((c.stock ?? 0) <= 0) colorElement.classList.add("disabled-color");

      colorElement.addEventListener("click", () => {
        if ((c.stock ?? 0) <= 0) {
          if (messageSpan) messageSpan.innerHTML = `<span class="alerTalla">Color agotado.</span>`;
          return;
        }

        selectedColor = c.color;
        selectedSize = null;

        // marcar seleccionado (opcional, pero útil)
        document.querySelectorAll(".color-circle").forEach(el => el.classList.remove("selected-color"));
        colorElement.classList.add("selected-color");

        if (messageSpan) {
          messageSpan.innerHTML = `
            Color seleccionado: <span class="styled-color">${c.color}</span>, quedan ${c.stock}!
            <div class="color-rectangle" style="background-color: ${c.color};"></div>
          `;
        }
      });

      container.appendChild(colorElement);
    });

    const btn = document.getElementById("addToCartButton");
    if (btn) {
      btn.onclick = () => {
        if (!selectedColor) {
          if (messageSpan) {
            messageSpan.innerHTML = `<span class="alerTalla">¡Selecciona un color antes de agregar al carrito!</span>`;
          }
          return;
        }

        console.log("🛒 Debug addToCart (color):", {
          productId,
          color: selectedColor
        });

        // ✅ lo que addToCart espera en el parámetro "colorRGB"
        addToCart(productId, null, selectedColor);
      };
    }

    return;
  }

  // ✅ 3) NADA
  if (titleElement) titleElement.textContent = "Opciones";
  container.innerHTML = "<p>Sin tallas ni colores disponibles</p>";
}

function addDetalle({ product, tallas, colores }) {
  const titleElement = document.querySelector(".details__title");
  const priceElement = document.querySelector(".details__price");
  const discountElement = document.querySelector(".details__descount");
  const sizeContainer = document.querySelector(".details__size-selected");
  const descriptionElement = document.querySelector(".detail__description");

  if (!titleElement || !priceElement || !discountElement || !sizeContainer || !descriptionElement) {
    console.error("Algunos elementos no existen en el DOM.");
    return;
  }

  // ✅ Título
  titleElement.textContent = product?.name || "Producto sin nombre";

  // ✅ Precio + promo (si existe)
  const originalPrice = Number(product?.price ?? 0);
  let finalPrice = originalPrice;

  const promo = Array.isArray(product?.promotions) && product.promotions.length > 0
    ? product.promotions[0]
    : null;

  // OJO: en tu código tenías (promo.code === "").
  // Si tu promo válida es cuando code está vacío, lo dejamos igual.
  // Si realmente quieres aplicar promo siempre, quita esa condición.
  const isValidPromo = promo && promo.code === "";

  if (isValidPromo) {
    const discountValue = Number(promo.discount_percentage ?? 0);

    if (promo.money) {
      finalPrice = Math.max(originalPrice - discountValue, 0);
    } else {
      finalPrice = originalPrice * (1 - discountValue / 100);
    }

    priceElement.textContent = `$${finalPrice.toFixed(2)}`;
    discountElement.textContent = `$${originalPrice.toFixed(2)}`;
    discountElement.style.display = "inline";
  } else {
    priceElement.textContent = `$${originalPrice.toFixed(2)}`;
    discountElement.style.display = "none";
  }

  // ✅ Tallas/Colores (usa tu nueva función)
  renderSizesAndColors(
    { tallas: tallas || [], colores: colores || [] },
    sizeContainer,
    product?.id
  );

  // ✅ Descripción
  descriptionElement.textContent = product?.description || "No hay descripción disponible.";
}

async function loadRelatedProducts(categoryId, currentProductId) {
  try {
    if (!categoryId) {
      console.error("No se recibió una categoría válida.");
      return;
    }

    console.log("Categoría del producto actual:", categoryId);

    const baseUrl = document.body?.dataset?.apiUrl || window.location.origin;
    const response = await fetch(`${baseUrl}/get-products/`);
    const data = await response.json();

    const swiperWrapper = document.querySelector("#related-products .new-wrapper");
    if (!swiperWrapper) return console.warn("⚠️ No existe #related-products .new-wrapper");

    swiperWrapper.innerHTML = "";

    const relatedProducts = (data.products || []).filter(p =>
      String(p.category) === String(categoryId) && String(p.id) !== String(currentProductId)
    );

    const productsToShow = relatedProducts.slice(0, 6);

    if (productsToShow.length === 0) {
      console.log("No hay productos relacionados para esta categoría.");
      return;
    }

    productsToShow.forEach(product => {
      const productElement = createProductElementRelated(product);
      swiperWrapper.appendChild(productElement);
      addEventListeners(product, productElement);
    });

    initSwipers();
  } catch (error) {
    console.error("Error al cargar productos relacionados:", error);
  }
}

function createProductElementRelated(product) {
  const productElement = document.createElement("div");
  productElement.classList.add("new__content", "swiper-slide");

  const image1 = product.imagenes?.[0]?.cRutaImagen || "/media/photos/default.jpg";
  const image2 = product.imagenes?.[1]?.cRutaImagen || "/media/photos/default.jpg";

  const sizes =
    product.tallas?.map(t =>
      `<button class="size-option">${t?.talla?.cNombreTalla || ""}</button>`
    ).join("") || "<span>Sin tallas disponibles</span>";

  productElement.innerHTML = `
    <a href="/shop/details/?id=${product.id}">
      <div class="new__tag">New</div>
      <img src="${image1}" alt="${product.name}" class="new__img">
      <img src="${image2}" alt="${product.name}" class="new__img2">
      <h3 class="new__title">${product.name}</h3>
      <div class="new__prices">
        <span class="new__price">S/${product.price}</span>
      </div>
      <div>
        <a href="javascript:void(0);" class="button new__button add-to-cart"
           data-product-id="${product.id}" id="toggleSize-${product.id}"
           aria-expanded="false" aria-controls="selectSize-${product.id}">
          <i class="bx bx-cart-alt new__icon"></i>
        </a>
        <div class="selectSize" id="selectSize-${product.id}" hidden>
          <div>
            <i class="bx bx-x cart__close" id="closeSize-${product.id}"></i>
          </div>
          <div>
            <span class="selectSize-title">Seleccionar Talla</span>
            <div class="selectSize-all" id="sizeContainer-${product.id}">
              ${sizes}
            </div>
          </div>
        </div>
      </div>
    </a>
  `;

  return productElement;
}