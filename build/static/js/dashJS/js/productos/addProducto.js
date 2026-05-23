document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;

    // Se ejecuta solo si estás en /dash-detallePedido/
    if (path === "/dash-addProduct/") {

        const talla = await obtenerTallas();

        // console.log("LAS tallaaaaaaaaa:", talla);

        await cargarFiltrosProducto();
        addImg();
        validarInputsDePrecio();
        inicializarNameDescriptionDraft();
        activarSelectorTallaColor();
        await inicializarAgregarTallas();
        inicializarSelectorDeColor();
        inicializarAgregarColores();
        inicializarBotonesEliminarColor();

    } else {
        console.log("🟡 No estás en /dash-addProduct/");
    }
});

// ✅ Este será TU ARRAY como en la imagen
const productDraft = [
  {
    category: null,
    season: null,
    colors: [],
    promotions: [],
    images: [],
    tallas: [],
    name: "",
    description: "",
    price: null,
    stock: 0,
  }
];

let metodoInventario = "tallas"; // "tallas" | "colores

function logDraft(titulo = "📦 PRODUCT DRAFT") {
  console.group(titulo);
  console.log(productDraft);
  console.groupEnd();
}

// const baseUrl = document.body.dataset.apiUrl;
async function obtenerTemporadas() {
    try {
        const response = await fetch(`${baseUrl}/get/seasons/`);
        if (!response.ok) throw new Error("Error al obtener temporadas");

        const data = await response.json();
        return data.results; // Devuelve la lista de temporadas
    } catch (error) {
        console.error("Error cargando temporadas:", error);
        return [];
    }
}

async function obtenerCategorias() {
    try {
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/get/categories/`);
        if (!response.ok) throw new Error("Error al obtener categorias");

        const data = await response.json();
        return data.results; // Devuelve la lista de temporadas
    } catch (error) {
        console.error("Error cargando temporadas:", error);
        return [];
    }
}

async function obtenerTallas() {
    try {
        const baseUrl = document.body.dataset.apiUrl;
        const response = await fetch(`${baseUrl}/get/sizes/`);
        if (!response.ok) throw new Error("Error al obtener las tallas");

        const data = await response.json();
        return data.results; // Devuelve la lista de temporadas
    } catch (error) {
        console.error("Error cargando temporadas:", error);
        return [];
    }
}

async function cargarFiltrosProducto() {
  const seasonSelect = document.querySelector(".seasonSelect");
  const categorySelect = document.querySelector(".categorySelect");

  if (!seasonSelect || !categorySelect) {
    console.warn("No se encontraron los elementos <select> para temporadas o categorías.");
    return;
  }

  // Obtener datos
  const temporadas = await obtenerTemporadas();
  const categorias = await obtenerCategorias();

  // Limpiar selects
  seasonSelect.innerHTML = '<option value="">Selecciona temporada</option>';
  categorySelect.innerHTML = '<option value="">Selecciona categoría</option>';

  // Llenar temporadas
  temporadas.forEach(temp => {
    const option = document.createElement("option");
    option.value = temp.id;
    option.textContent = temp.name || `Temporada ${temp.id}`;
    seasonSelect.appendChild(option);
  });

  // Llenar categorías
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name || `Categoría ${cat.id}`;
    categorySelect.appendChild(option);
  });

  // ✅ IMPORTANTE: evitar duplicar listeners si la función se llama más de 1 vez
  seasonSelect.onchange = () => {
    const id = seasonSelect.value ? Number(seasonSelect.value) : null;
    console.log("🟡 Temporada seleccionada:", { id });
    updateDraft("season", id); // 🔥 guarda en el array
  };

  categorySelect.onchange = () => {
    const id = categorySelect.value ? Number(categorySelect.value) : null;
    console.log("🔵 Categoría seleccionada:", { id });
    updateDraft("category", id); // 🔥 guarda en el array
  };

  // ✅ Guardar estado inicial (si ya hay valores por defecto)
  updateDraft("season", seasonSelect.value ? Number(seasonSelect.value) : null);
  updateDraft("category", categorySelect.value ? Number(categorySelect.value) : null);
}

function updateDraft(field, value) {
  productDraft[0][field] = value;

  console.group("🧩 DRAFT ACTUALIZADO");
  console.log(`✅ ${field}:`, value);
  console.log("📦 productDraft:", productDraft);
  console.groupEnd();
}

// function addImg() {
//     const fileInput = document.querySelector(".product-image");
//     const previewContainer = document.querySelector(".image-preview");
//     const warningMessage = document.getElementById("image-warning");

//     let uploadedImg = [];
//     let imagenesUrls = [];

//     if (!fileInput || !previewContainer) {
//         console.warn("⚠️ No se encontró el input o el contenedor de previsualización.");
//         return;
//     }

//     fileInput.addEventListener("change", function () {
//         if (!fileInput.files.length) return;

//         let newFiles = Array.from(fileInput.files);
//         let totalImages = uploadedImg.length + newFiles.length;

//         if (totalImages > 6) {
//             warningMessage.textContent = "Solo puedes subir hasta 6 imágenes.";
//             setTimeout(() => warningMessage.textContent = "", 3000);
//             newFiles = newFiles.slice(0, 6 - uploadedImg.length);
//         }

//         newFiles.forEach(file => {
//             const reader = new FileReader();

//             reader.onload = function (e) {
//                 const base64 = e.target.result;

//                 uploadedImg.push(file);
//                 imagenesUrls.push({ url: base64 });

//                 const imageWrapper = document.createElement("div");
//                 imageWrapper.classList.add("position-relative", "m-1");
//                 imageWrapper.style.display = "inline-block";

//                 const img = document.createElement("img");
//                 img.src = base64;
//                 img.classList.add("img-thumbnail");
//                 img.style.width = "100px";
//                 img.style.height = "100px";

//                 const closeButton = document.createElement("button");
//                 closeButton.innerHTML = "&times;";
//                 closeButton.classList.add("btn", "btn-danger", "btn-sm", "position-absolute");
//                 closeButton.style.top = "5px";
//                 closeButton.style.right = "5px";

//                 closeButton.addEventListener("click", function () {
//                     imageWrapper.remove();
//                     const index = uploadedImg.indexOf(file);
//                     if (index !== -1) {
//                         uploadedImg.splice(index, 1);
//                         imagenesUrls.splice(index, 1);
//                     }
//                     mostrarArchivosConsola();
//                 });

//                 imageWrapper.appendChild(img);
//                 imageWrapper.appendChild(closeButton);
//                 previewContainer.appendChild(imageWrapper);

//                 mostrarArchivosConsola();
//             };

//             reader.readAsDataURL(file);
//         });

//         fileInput.value = "";
//     });

//     function mostrarArchivosConsola() {
//         //console.clear();
//         console.log("imagenes:", imagenesUrls);
//     }
// }

function addImg() {
    const fileInput = document.querySelector(".product-image");
    const previewContainer = document.querySelector(".image-preview");
    const warningMessage = document.getElementById("image-warning");

    let uploadedImg = [];

    if (!fileInput || !previewContainer) {
        console.warn("⚠️ No se encontró el input o el contenedor.");
        return;
    }

    fileInput.onchange = function () {
        if (!fileInput.files.length) return;

        let newFiles = Array.from(fileInput.files);
        let totalImages = uploadedImg.length + newFiles.length;

        if (totalImages > 6) {
            warningMessage.textContent = "Solo puedes subir hasta 6 imágenes.";
            setTimeout(() => warningMessage.textContent = "", 3000);
            newFiles = newFiles.slice(0, 6 - uploadedImg.length);
        }

        newFiles.forEach(file => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const base64 = e.target.result;

                uploadedImg.push(file);

                // 🔥 Guardar directamente en el array global
                productDraft[0].images.push({ url: base64 });
                validarBotonCrear();

                const imageWrapper = document.createElement("div");
                imageWrapper.classList.add("position-relative", "m-1");
                imageWrapper.style.display = "inline-block";

                const img = document.createElement("img");
                img.src = base64;
                img.classList.add("img-thumbnail");
                img.style.width = "100px";
                img.style.height = "100px";

                const closeButton = document.createElement("button");
                closeButton.innerHTML = "&times;";
                closeButton.classList.add("btn", "btn-danger", "btn-sm", "position-absolute");
                closeButton.style.top = "5px";
                closeButton.style.right = "5px";

                closeButton.addEventListener("click", function () {
                    imageWrapper.remove();

                    const index = uploadedImg.indexOf(file);
                    if (index !== -1) {
                        uploadedImg.splice(index, 1);
                        productDraft[0].images.splice(index, 1); // 🔥 eliminar del array global
                    }

                    console.group("🖼️ IMÁGENES ACTUALIZADAS");
                    console.log(productDraft);
                    console.groupEnd();
                });

                imageWrapper.appendChild(img);
                imageWrapper.appendChild(closeButton);
                previewContainer.appendChild(imageWrapper);

                console.group("🖼️ IMÁGENES ACTUALIZADAS");
                console.log(productDraft);
                console.groupEnd();
            };

            reader.readAsDataURL(file);
        });

        fileInput.value = "";
    };
}

// function activarSelectorTallaColor() {
//     const btnTalla = document.querySelector(".metodo_codigo");
//     const btnColor = document.querySelector(".metodo_automatico");
//     const cardTallas = document.getElementById("cardTallas");
//     const cardColores = document.getElementById("cardColores");
//     const tbodyTallas = document.querySelector("#cardTallas tbody");
//     const tbodyColores = document.querySelector(".tbodyColores");

//     if (!btnTalla || !btnColor || !cardTallas || !cardColores) {
//         console.warn("⚠️ Elementos necesarios no encontrados");
//         return;
//     }

//     btnTalla.addEventListener("click", function () {
//         btnTalla.classList.add("active");
//         btnColor.classList.remove("active");
//         cardTallas.classList.remove("d-none");
//         cardColores.classList.add("d-none");

//         // Limpiar colores
//         if (tbodyColores) tbodyColores.innerHTML = "";
//         coloresUsados?.clear?.();

//         // Resetear contadores
//         actualizarTotalInventarioColores();
//         actualizarTotalInventarioTallas();

//         // Simular “limpiar consola” de colores
//         console.log("🔄 Cambio a modo TALLAS");
//         console.log("🧹 Limpiando resumen de colores...");
//         console.log("----------------------------");
//     });

//     btnColor.addEventListener("click", function () {
//         btnColor.classList.add("active");
//         btnTalla.classList.remove("active");
//         cardColores.classList.remove("d-none");
//         cardTallas.classList.add("d-none");

//         // Limpiar tallas
//         if (tbodyTallas) tbodyTallas.innerHTML = "";
//         tallasUsadas?.clear?.();

//         // Resetear contadores
//         actualizarTotalInventarioTallas();
//         actualizarTotalInventarioColores();

//         // Simular “limpiar consola” de tallas
//         console.log("🔄 Cambio a modo COLORES");
//         console.log("🧹 Limpiando resumen de tallas...");
//         console.log("----------------------------");
//     });
// }

function activarSelectorTallaColor() {
  const btnTalla = document.querySelector(".metodo_codigo");
  const btnColor = document.querySelector(".metodo_automatico");
  const cardTallas = document.getElementById("cardTallas");
  const cardColores = document.getElementById("cardColores");
  const tbodyTallas = document.querySelector("#cardTallas tbody");
  const tbodyColores = document.querySelector(".tbodyColores");

  if (!btnTalla || !btnColor || !cardTallas || !cardColores) {
    console.warn("⚠️ Elementos necesarios no encontrados");
    return;
  }

  btnTalla.addEventListener("click", function () {
    metodoInventario = "tallas";

    btnTalla.classList.add("active");
    btnColor.classList.remove("active");
    cardTallas.classList.remove("d-none");
    cardColores.classList.add("d-none");

    // 🧹 Limpiar UI de colores
    if (tbodyColores) tbodyColores.innerHTML = "";
    coloresUsados?.clear?.();

    // ✅ Draft: colores vacío
    productDraft[0].colors = [];

    // ✅ Draft: recalcular stock desde tallas (si hay tallas cargadas)
    syncTallasToDraft(); // si no hay tallas, stock queda 0

    actualizarTotalInventarioColores();
    actualizarTotalInventarioTallas();

    console.log("🔄 Cambio a modo TALLAS");
    logDraft("🧩 DRAFT (modo TALLAS)");
  });

  btnColor.addEventListener("click", function () {
    metodoInventario = "colores";

    btnColor.classList.add("active");
    btnTalla.classList.remove("active");
    cardColores.classList.remove("d-none");
    cardTallas.classList.add("d-none");

    // 🧹 Limpiar UI de tallas
    if (tbodyTallas) tbodyTallas.innerHTML = "";
    tallasUsadas?.clear?.();

    // ✅ Draft: tallas vacío
    productDraft[0].tallas = [];

    // ✅ IMPORTANTE: también limpia coloresUsados si estás reiniciando el modo
    // (opcional, pero recomendable para evitar inconsistencias)
    coloresUsados?.clear?.();

    // ✅ Draft: recalcular stock desde colores (si hay colores cargados)
    syncColoresToDraft(); // si no hay colores, stock queda 0

    actualizarTotalInventarioTallas();
    actualizarTotalInventarioColores();

    console.log("🔄 Cambio a modo COLORES");
    logDraft("🧩 DRAFT (modo COLORES)");
  });
}

function syncTallasToDraft() {
  const filas = document.querySelectorAll("#tbodyTallas tr");
  const tallas = [];
  let stockTotal = 0;

  filas.forEach(fila => {
    const idTalla = Number(fila.getAttribute("data-id-talla"));
    const inputCantidad = fila.querySelector(".cantidadTabla");
    const stock = parseInt(inputCantidad?.value, 10) || 0;

    if (!Number.isFinite(idTalla)) return;
    if (stock < 0) return;

    stockTotal += stock;
    tallas.push({ talla: idTalla, stock });
  });

  // ✅ modo tallas: actualiza draft
  productDraft[0].tallas = tallas;
  validarBotonCrear();
  productDraft[0].colors = [];      // 🔥 vacía colores
  productDraft[0].stock = stockTotal;

  console.log("📦 Stock total (tallas):", stockTotal);
  console.log("📏 Tallas:", tallas);
  console.log("🎨 Colores:", productDraft[0].colors);

  logDraft("✅ DRAFT ACTUALIZADO (modo TALLAS)");
}

// function validarInputsDePrecio() {
//     const inputs = document.querySelectorAll(".precioInput");

//     inputs.forEach(input => {
//         // Permitir solo números y punto (.)
//         input.addEventListener("input", (e) => {
//             e.target.value = e.target.value
//                 .replace(/[^\d.]/g, "")      // Elimina todo excepto números y punto
//                 .replace(/^0+(\d)/, "$1")   // Elimina ceros iniciales (opcional)
//                 .replace(/(\..*?)\..*/g, "$1"); // Evita más de un punto
//         });

//         // Formatear a 2 decimales al salir
//         input.addEventListener("blur", (e) => {
//             let valor = parseFloat(e.target.value);
//             if (!isNaN(valor)) {
//                 const valorFormateado = valor.toFixed(2);
//                 e.target.value = valorFormateado;
//                 console.log("💰 Precio ingresado:", valorFormateado);
//             } else {
//                 e.target.value = "";
//                 console.log("❌ Entrada inválida");
//             }
//         });
//     });
// }

function validarInputsDePrecio() {
  const inputs = document.querySelectorAll(".precioInput");

  inputs.forEach(input => {
    // Permitir solo números y punto
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value
        .replace(/[^\d.]/g, "")
        .replace(/^0+(\d)/, "$1")
        .replace(/(\..*?)\..*/g, "$1");
    });

    // Formatear a 2 decimales al salir
    input.addEventListener("blur", (e) => {
      let valor = parseFloat(e.target.value);

      if (!isNaN(valor)) {
        const valorFormateado = Number(valor.toFixed(2));
        e.target.value = valorFormateado.toFixed(2);

        // ✅ Guardar en tu array
        productDraft[0].price = valorFormateado;
        validarBotonCrear();

        console.log("💰 Precio guardado en draft:", valorFormateado);
        console.log("📦 productDraft:", productDraft);
      } else {
        e.target.value = "";
        productDraft[0].price = null;

        console.log("❌ Entrada inválida, price=null");
        console.log("📦 productDraft:", productDraft);
      }
    });
  });
}

function inicializarNameDescriptionDraft() {
  const nameInput = document.getElementById("nameProduct");
  const descInput = document.getElementById("descripProduct");

  if (!nameInput || !descInput) {
    console.warn("⚠️ No se encontraron nameProduct o descripProduct");
    return;
  }

  // ✅ Guardar nombre en tiempo real
  nameInput.addEventListener("input", () => {
    productDraft[0].name = nameInput.value.trim();
    validarBotonCrear();
    console.log("📝 Name actualizado:", productDraft[0].name);
    console.log("📦 productDraft:", productDraft);
  });

  // ✅ Guardar descripción en tiempo real
  descInput.addEventListener("input", () => {
    productDraft[0].description = descInput.value.trim();
    validarBotonCrear();
    console.log("🧾 Description actualizado:", productDraft[0].description);
    console.log("📦 productDraft:", productDraft);
  });
}

let tallasDisponibles = []; // Se llena desde la API
let tallasUsadas = new Set(); // Para evitar repetir

async function inicializarAgregarTallas() {
    tallasDisponibles = await obtenerTallas(); // Debe devolver [{id, cNombreTalla}, ...]

    const btnAgregar = document.getElementById("btnAgregarTalla");
    const tbody = document.getElementById("tbodyTallas");

    if (!btnAgregar || !tbody) return;

    btnAgregar.addEventListener("click", () => {
        const restantes = tallasDisponibles.filter(t => !tallasUsadas.has(t.id));
        if (restantes.length === 0) {
            alert("Ya se han agregado todas las tallas disponibles.");
            return;
        }

        const talla = restantes[0];
        tallasUsadas.add(talla.id);

        const inputPrincipal = document.querySelector(".precioInput");
        let precioBase = parseFloat(inputPrincipal?.value);
        precioBase = !isNaN(precioBase) ? precioBase.toFixed(2) : "";

        const fila = document.createElement("tr");
        fila.setAttribute("data-id-talla", talla.id); // 👈 Guardamos el id

        fila.innerHTML = `
            <td>${talla.cNombreTalla}</td>
            <td>
                <div class="input-group">
                    <span class="input-group-text">PEN</span>
                    <input type="text" class="form-control precioTabla" placeholder="0.00" value="${precioBase}">
                </div>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <input type="text" class="form-control cantidadTabla" placeholder="0">
                    <button type="button" class="btn btn-danger btn-sm btnEliminarFila" title="Eliminar">
                        &times;
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(fila);

        // Event: actualizar total y resumen cuando cambie cantidad
        const inputCantidad = fila.querySelector(".cantidadTabla");
        inputCantidad.addEventListener("input", () => {
            actualizarTotalInventarioTallas();
            syncTallasToDraft(); // 👈 Mostrar resumen cada vez que cambia
        });

        // Event: eliminar fila
        const btnEliminar = fila.querySelector(".btnEliminarFila");
        btnEliminar.addEventListener("click", () => {
            fila.remove();
            tallasUsadas.delete(talla.id);
            actualizarTotalInventarioTallas();
            syncTallasToDraft(); // 👈 Mostrar resumen cada vez que se elimina
        });

        actualizarTotalInventarioTallas();
        syncTallasToDraft(); // 👈 Mostrar resumen al agregar
    });
}

function actualizarTotalInventarioTallas() {
    const cantidades = document.querySelectorAll(".cantidadTabla");
    let total = 0;

    cantidades.forEach(input => {
        const valor = parseInt(input.value);
        if (!isNaN(valor)) total += valor;
    });

    const spanTotal = document.getElementById("totalInventarioTalla");
    spanTotal.textContent = `Total de inventario en la tienda: ${total} disponible`;
}

// ✅ Función que muestra resumen de tallas en consola
function mostrarResumenTallas() {
    const filas = document.querySelectorAll("#tbodyTallas tr");
    const resultado = [];
    const colores = [];
    let stockTotal = 0;

    filas.forEach(fila => {
        const idTalla = fila.getAttribute("data-id-talla");
        const inputCantidad = fila.querySelector(".cantidadTabla");
        const stock = parseInt(inputCantidad?.value) || 0;
        stockTotal += stock;

        resultado.push({
            talla: parseInt(idTalla),
            stock: stock
        });
    });

    console.log("📦 Stock total:", stockTotal);
    console.log("📏 Tallas:", resultado);
    console.log("📏 Colores:", colores);
}

function inicializarSelectorDeColor() {
    const colorSpans = document.querySelectorAll(".color-selector");

    colorSpans.forEach(spanColor => {
        const grupo = spanColor.closest(".input-group");
        const inputColor = grupo.querySelector("input.form-control");

        // Crear input color único y oculto
        const selector = document.createElement("input");
        selector.type = "color";
        selector.style.position = "fixed";
        selector.style.left = "50%";
        selector.style.top = "50%";
        selector.style.transform = "translate(-50%, -50%)";
        selector.style.opacity = 0;
        selector.style.pointerEvents = "none";
        selector.style.zIndex = "9999";
        document.body.appendChild(selector);

        // Al hacer clic en el span
        spanColor.addEventListener("click", () => {
            selector.value = inputColor.value || "#ffffff"; // Valor actual o blanco por defecto
            selector.click();
        });

        // Cuando se selecciona el color
        selector.addEventListener("input", () => {
            const colorHex = selector.value;
            spanColor.textContent = colorHex;
            spanColor.style.backgroundColor = colorHex;
            spanColor.style.color = getContrasteTextColor(colorHex);
            inputColor.value = colorHex;

            // ✅ NUEVO: actualizar también el atributo en la fila
            const fila = spanColor.closest("tr");
            if (fila) {
                fila.setAttribute("data-color", colorHex);
            }
        });
    });

    function getContrasteTextColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminancia > 186 ? "#000" : "#fff";
    }
}

let coloresUsados = new Set(); // opcional

function inicializarAgregarColores() {
    const tablaColores = document.querySelector(".tbodyColores");
    const btnAgregar = document.getElementById("btnAgregarColor");
    const inputPrecioBase = document.querySelector(".precioInput");

    if (!tablaColores || !btnAgregar || !inputPrecioBase) return;

    btnAgregar.addEventListener("click", () => {
        const precioBase = parseFloat(inputPrecioBase.value) || 0;
        const precioFormateado = precioBase.toFixed(2);

        const fila = document.createElement("tr");
        const colorDefault = "#ffffff";

        fila.setAttribute("data-color", colorDefault); // 👈 Guardar color como atributo inicial

        fila.innerHTML = `
            <td>
                <div class="input-group">
                    <span class="input-group-text color-selector" style="cursor: pointer;">${colorDefault}</span>
                    <input type="text" class="form-control inputColorHex" placeholder="#ffffff" value="${colorDefault}">
                </div>
            </td>
            <td>
                <div class="input-group">
                    <span class="input-group-text">PEN</span>
                    <input type="text" class="form-control precioTabla" placeholder="0.00" value="${precioFormateado}">
                </div>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <input type="text" class="form-control cantidadTabla" placeholder="0">
                    <button type="button" class="btn btn-danger btn-sm btnEliminarColor" title="Eliminar fila">
                        &times;
                    </button>
                </div>
            </td>
        `;

        tablaColores.appendChild(fila);

        // Actualizar color seleccionado (si se cambia)
        const colorInput = fila.querySelector(".inputColorHex");
        const spanColor = fila.querySelector(".color-selector");

        colorInput.addEventListener("input", () => {
            const color = colorInput.value;
            spanColor.textContent = color;
            fila.setAttribute("data-color", color); // 👈 actualizar atributo con color
        });

        // Evento cantidad
        const inputCantidad = fila.querySelector(".cantidadTabla");
        inputCantidad.addEventListener("input", () => {
            actualizarTotalInventarioColores();
            syncColoresToDraft(); // 🔥
        });

        // Eliminar
        const btnEliminar = fila.querySelector(".btnEliminarColor");
        btnEliminar.addEventListener("click", () => {
            fila.remove();
            actualizarTotalInventarioColores();
            syncColoresToDraft(); // 🔥
        });

        inicializarSelectorDeColor?.();
        actualizarTotalInventarioColores();
        syncColoresToDraft();
    });
}

function actualizarTotalInventarioColores() {
    const cantidades = document.querySelectorAll("#cardColores .cantidadTabla");
    let total = 0;

    cantidades.forEach(input => {
        const valor = parseInt(input.value);
        if (!isNaN(valor)) total += valor;
    });

    const spanTotal = document.getElementById("totalInventarioColor");
    if (spanTotal) {
        spanTotal.textContent = `Total de inventario en la tienda: ${total} disponible`;
    }
}

// ✅ Mostrar resumen de colores por consola
function mostrarResumenColores() {
    const filas = document.querySelectorAll("#cardColores tbody tr");
    const resultado = [];
    const tallas = [];
    let stockTotal = 0;

    filas.forEach(fila => {
        const color = fila.getAttribute("data-color") || "#000000";
        const inputCantidad = fila.querySelector(".cantidadTabla");
        const stock = parseInt(inputCantidad?.value) || 0;
        stockTotal += stock;

        resultado.push({ color, stock });
    });

    console.log("🎨 Stock total colores:", stockTotal);
    console.log("🎨 Colores:", resultado);
    console.log("🎨 tallas:", tallas);
}

function syncColoresToDraft() {
  const filas = document.querySelectorAll("#cardColores tbody tr");
  const colores = [];
  let stockTotal = 0;

  filas.forEach(fila => {
    const color = (fila.getAttribute("data-color") || "#000000").trim();
    const inputCantidad = fila.querySelector(".cantidadTabla");
    const stock = parseInt(inputCantidad?.value, 10) || 0;

    if (stock < 0) return;

    stockTotal += stock;
    colores.push({ color, stock });
  });

  // ✅ Modo colores: actualiza draft
  productDraft[0].colors = colores;
  validarBotonCrear();
  productDraft[0].tallas = [];   // 🔥 vacía tallas
  productDraft[0].stock = stockTotal;

  console.log("🎨 Stock total (colores):", stockTotal);
  console.log("🎨 Colores:", colores);
  console.log("📏 Tallas:", productDraft[0].tallas);

  console.group("🧩 DRAFT ACTUALIZADO (modo COLORES)");
  console.log(productDraft);
  console.groupEnd();
}

function inicializarBotonesEliminarColor() {
    const botones = document.querySelectorAll(".btnEliminarColor");

    botones.forEach(btn => {
        btn.removeEventListener("click", eliminarFila); // Evitar duplicación
        btn.addEventListener("click", eliminarFila);
    });

    function eliminarFila(e) {
        const fila = e.target.closest("tr");
        if (fila) fila.remove();
    }
}

function validarBotonCrear() {
  const btn = document.getElementById("addProducto");
  if (!btn) return;

  const draft = productDraft[0];

  const valido =
    draft.name &&
    draft.description &&
    draft.category &&
    draft.season &&
    draft.price &&
    draft.images.length > 0 &&
    draft.stock > 0;

  btn.disabled = !valido;
}

function getFinalPayload() {
  const draft = productDraft[0];

  // ✅ validaciones mínimas
  if (!draft.name) throw new Error("Falta el nombre.");
  if (!draft.description) throw new Error("Falta la descripción.");
  if (!draft.category) throw new Error("Falta la categoría.");
  if (!draft.season) throw new Error("Falta la temporada.");
  if (draft.price === null || draft.price <= 0) throw new Error("Precio inválido.");
  if (!draft.images || draft.images.length === 0) throw new Error("Sube al menos 1 imagen.");
  if (draft.stock <= 0) throw new Error("El stock debe ser mayor a 0.");

  // ✅ regla: o tallas o colores (no ambos)
  const tieneTallas = draft.tallas && draft.tallas.length > 0;
  const tieneColores = draft.colors && draft.colors.length > 0;
  if (tieneTallas && tieneColores) throw new Error("No puede haber tallas y colores a la vez.");
  if (!tieneTallas && !tieneColores) throw new Error("Debes agregar tallas o colores.");

  // ✅ payload final (objeto)
  const payload = {
    category: draft.category,
    colors: draft.colors || [],
    description: draft.description,
    imagenes: draft.images || [],
    name: draft.name,
    price: draft.price,
    promotions: draft.promotions || [],
    season: draft.season,
    stock: draft.stock,
    tallas: draft.tallas || [],
  };

  // ✅ si quieres ver “lo final” en consola:
  console.group("✅ PAYLOAD FINAL");
  console.log(payload);
  console.groupEnd();

  return payload;
}

// Si tu backend quiere array (como la imagen)
function getFinalPayloadArray() {
  const payload = getFinalPayload();
  return [payload];
}


document.getElementById("addProducto")?.addEventListener("click", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("access_token");
  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "No autenticado",
      text: "Debes iniciar sesión primero.",
    });
    return;
  }

  try {
    const draft = productDraft[0];

    const payload = {
      category: draft.category,
      colors: draft.colors || [],
      description: draft.description,
      imagenes: draft.images || [],
      name: draft.name,
      price: draft.price,
      promotions: draft.promotions || [],
      season: draft.season,
      stock: draft.stock,
      tallas: draft.tallas || [],
    };

    const baseUrl = document.body?.dataset?.apiUrl || window.location.origin;

    // 🔄 Loader mientras envía
    Swal.fire({
      title: "Creando producto...",
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const response = await fetch(`${baseUrl}/save_product/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.detail || data?.message || "Error al crear producto.");
    }

    // ✅ Éxito
    await Swal.fire({
      icon: "success",
      title: "Producto creado ✔",
      text: "El producto se guardó correctamente.",
      confirmButtonText: "Aceptar"
    });

    // 🔁 Redirigir después de cerrar el Swal
    window.location.href = "/dash-allProducts/";

  } catch (err) {
    console.error("❌ Error:", err.message);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Ocurrió un error inesperado.",
      confirmButtonText: "Cerrar"
    });
  }
});