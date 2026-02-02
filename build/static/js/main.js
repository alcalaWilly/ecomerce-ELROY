/*=============== SHOW MENU ===============*/

// console.log('Archivo main.js cargado correctamente.');
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

/*===== MENU SHOW =====*/
/* Validate if constant exists */
const navMenu = document.getElementById('nav-menu'),
  navToggle = document.getElementById('nav-toggle'),
  navClose = document.getElementById('nav-close')

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add('show-menu')
  })
}

if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove('show-menu')
  })
}


/*=============== SHOW CART ===============*/
const cart = document.getElementById('cart'),
  cartShop = document.getElementById('cart-shop'),
  cartClose = document.getElementById('cart-close');

/*===== CART SHOW =====*/
/* Validate if constant exists */
if (cartShop) {
  cartShop.addEventListener("click", () => {
    cart.classList.toggle('show-cart');

    // Si el carrito se muestra, deshabilita el scroll de la página principal
    if (cart.classList.contains('show-cart')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = ''; // Restaura el scroll si se cierra
    }
  });
}

/*===== CART HIDDEN =====*/
/* Validate if constant exists */
if (cartClose) {
  cartClose.addEventListener("click", () => {
    cart.classList.remove('show-cart');

    // Restaura el scroll de la página principal al cerrar el carrito
    document.body.style.overflow = '';
  });
}
// 
const inputSearch = document.getElementById('searchProduct');
const contentCart = document.querySelector('.contentCart-search');
const openSearch = document.getElementById('cart-search');
const closeSearch = document.getElementById('search-close');
const modalSearch = document.getElementById('modal-search');

let allProducts = []; // productos cargados 1 sola vez




async function fetchProducts() {
  try {
    // const response = await fetch('http://127.0.0.1:8000/get-products/');
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/get-products/`);
    const data = await response.json();
    allProducts = data.products;
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.classList.add('cardImg-search');
  const baseUrl = document.body.dataset.apiUrl;
  const imageUrl = product.imagenes.length > 0
    ? `${baseUrl}${product.imagenes[0].cRutaImagen}`
    : 'https://via.placeholder.com/250x200.png?text=Sin+Imagen';

  card.innerHTML = `
    <img class="cardImg-search" src="${imageUrl}" alt="${product.name}">
    <span class="new__title">${product.name}</span>
    <span class="new__price">s/. ${product.price}</span>
  `;

  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    window.location.href = `/shop/details/?id=${product.id}`;
  });

  return card;
}


function filterAndRenderProducts(searchText) {
  contentCart.innerHTML = '';

  if (searchText.trim() === '') {
    modalSearch.style.height = '30%';
    return;
  }

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  filtered.slice(0, 10).forEach(product => {
    const card = createProductCard(product);
    contentCart.appendChild(card);
  });

  modalSearch.style.height = filtered.length > 0 ? '90%' : '30%';
}

// Abre modal
openSearch.addEventListener('click', async () => {
  if (allProducts.length === 0) await fetchProducts(); // Cargar solo una vez

  const hasContent = contentCart.children.length > 0;
  modalSearch.style.height = hasContent ? '90%' : '30%';
  modalSearch.classList.add('activeModal');
  document.body.style.overflow = 'hidden';
});

// Cierra modal
closeSearch.addEventListener('click', () => {
  modalSearch.classList.remove('activeModal');
  setTimeout(() => {
    document.body.style.overflow = '';
    modalSearch.style.height = '';
    inputSearch.value = ''; // Limpia el input
    contentCart.innerHTML = ''; // Limpia resultados
  }, 400);
});

// Escucha el input
inputSearch.addEventListener('input', () => {
  const text = inputSearch.value;
  filterAndRenderProducts(text);
});


async function loadCategoryImages() {
  try {
    // const response = await fetch('http://127.0.0.1:8000/get/category-images/');
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/get/category-images/`);
    const data = await response.json();

    const container = document.getElementById('categoryCardsContainer');
    container.innerHTML = '';  // Limpiamos el contenido previo

    data.results.forEach(category => {
      const card = document.createElement('div');
      card.classList.add('MemoriesCard');

      card.innerHTML = `
              <img src="${category.image}" alt="Memories-img" />
              <a href="shop?category=${category.category}">
                  <div class="content">
                      <h3>${category.caption}</h3>
                  </div>
              </a>
          `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('❌ Error al cargar categorías:', error);
  }
}

// Llamamos a la función cuando cargue el DOM
document.addEventListener('DOMContentLoaded', loadCategoryImages);

/*=============== SHOW LOGIN ===============*/
const login = document.getElementById('login'),
loginShop = document.getElementById('login-button')
loginCheckout = document.getElementById('login-checkout'),
loginClose = document.getElementById('login-close');

const createCount = document.getElementById('crear'),
createShop = document.getElementById('createCount-button'),
createClose = document.getElementById('loginCount-close'),
createBack = document.getElementById('loginCount-volver'); // Nuevo botón de volver

/*===== LOGIN SHOW =====*/
if (loginShop) {
  loginShop.addEventListener("click", () => {
    login.classList.add('show-login');
  });
}
if (loginCheckout) {
  loginCheckout.addEventListener("click", () => {
    login.classList.add('show-login');
  });
}


/*===== LOGIN HIDDEN =====*/
if (loginClose) {
  loginClose.addEventListener("click", () => {
    login.classList.remove('show-login');
  });
}

/*=============== SHOW CREATE ACCOUNT ===============*/
if (createShop) {
  createShop.addEventListener("click", () => {
    login.classList.remove('show-login'); // Oculta el login
    createCount.classList.add('show-login'); // Muestra el formulario de crear cuenta
  });
}

/*===== CREATE ACCOUNT HIDDEN =====*/
if (createClose) {
  createClose.addEventListener("click", () => {
    createCount.classList.remove('show-login');
  });
};

/*===== VOLVER AL LOGIN DESDE CREAR =====*/
if (createBack) {
  createBack.addEventListener("click", () => {
    createCount.classList.remove('show-login'); // Oculta crear cuenta
    login.classList.add('show-login'); // Muestra login nuevamente
  });
}


/*=============== HOME SWIPER ===============*/
// 🔹 Función para inicializar Swiper
// 🔹 Función para obtener los datos y generar los slides
async function loadSwiperSlides() {
  // const API_CARRUSEL = "http://127.0.0.1:8000/carrusel-productos/";
  const baseUrl = document.body.dataset.apiUrl;
  const API_CARRUSEL = `${baseUrl}/carrusel-productos/`;
  const SWIPER_WRAPPER = document.querySelector(".swiper-wrapper");

  try {
    const response = await fetch(API_CARRUSEL);
    const data = await response.json();

    SWIPER_WRAPPER.innerHTML = ""; // 🔹 Vacía los slides actuales

    for (let item of data.results) {
      const baseUrl = document.body.dataset.apiUrl;
      const productData = await fetch(`${baseUrl}/product/${item.producto}`);
      const product = await productData.json();

      // 🔹 Obtener la primera imagen disponible

      const productImage = product.product.imagenes.length > 0
        ? `${baseUrl}${product.product.imagenes[0].cRutaImagen}`
        : "assets/img/default-image.png"; // Imagen por defecto si no hay

      // 🔹 Crear un slide dinámicamente
      const slide = document.createElement("section");
      slide.classList.add("swiper-slide");
      slide.innerHTML = `
        <div class="home__content grid">
            <div class="home__group">
                <img src="${productImage}" alt="${product.product.name}" class="home__img img lazy">
                <div class="home__indicator"></div>

                <div class="home__details-img">
                    <h4 class="home__details-title">${product.product.name}</h4>
                    <span class="home__details-subtitle">#${item.numTendencia}</span>
                </div>
            </div>
            <div class="home__data">
                <h3 class="home__subtitle">${item.numTendencia}</h3>
                <h1 class="home__title">${item.titleTendencia}</h1>
                <p class="home__description">${product.product.description}</p>

                <div class="home__buttons">
                    <a href="/shop/details/?id=${product.product.id}" class="button__more">Shop Now</a>
                </div>
            </div>
        </div>
      `;

      // 🔹 Agregar el slide al Swiper wrapper
      SWIPER_WRAPPER.appendChild(slide);
    }
  } catch (error) {
    console.error("Error al cargar el carrusel:", error);
  }
}

// 🔹 Función para inicializar Swiper
function initSwiper() {
  var homeSwiper = new Swiper(".home-swiper", {
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 1700,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  // 🔹 Forzar reinicio del autoplay después de interactuar
  homeSwiper.on("touchEnd", () => homeSwiper.autoplay.start());
  homeSwiper.on("slideChange", () => homeSwiper.autoplay.start());
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
  const header = document.getElementById('header');
  const menu = document.getElementById('nav-menu');
  const logoBlanco = document.getElementById('logoBlanco');
  const logoNegro = document.getElementById('logoNegro');
  const links = Array.from({ length: 9 }, (_, i) => document.getElementById(`link${i + 1}`)).filter(el => el);

  if (window.scrollY >= 500) {
    header?.classList.add('scroll-header');
    menu?.classList.add('scroll-menu');
    links.forEach(link => link.classList.add('scroll-menu'));
    logoBlanco?.classList.add('hidden');
    logoNegro?.classList.remove('hidden');
  } else {
    header?.classList.remove('scroll-header');
    menu?.classList.remove('scroll-menu');
    links.forEach(link => link.classList.remove('scroll-menu'));
    logoBlanco?.classList.remove('hidden');
    logoNegro?.classList.add('hidden');
  }
}

window.addEventListener('scroll', scrollHeader);
/*

/*=============== SHOW SCROLL UP ===============*/

function scrollUp() {
  const scrollUp = document.getElementById('scroll-up');
  const scrollWatsapp = document.getElementById('scroll-whatsapp');

  if (this.scrollY >= 350) {
    scrollUp.classList.add('show-scrollup');
    scrollWatsapp.classList.add('show-scrollupWatsapp');
  } else {
    scrollUp.classList.remove('show-scrollup')
    scrollWatsapp.classList.remove('show-scrollupWatsapp')
  }
}

window.addEventListener('scroll', scrollUp)
// PAGINA DE NOSOTROS ()

//name
window.sr = ScrollReveal()
sr.reveal('.about__name', {
  duration: 1000,
  viewFactor: 0.1,
  origin: 'bottom',
  distance: '100px',
  delay: 100,
  easing: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
})
//title
sr.reveal('.about__title', {
  duration: 1000,
  viewFactor: 0.1,
  origin: 'bottom',
  distance: '100px',
  delay: 200,
  easing: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
})
//about__subtitle
sr.reveal('.about__subtitle', {
  duration: 1000,
  viewFactor: 0.1,
  origin: 'bottom',
  distance: '100px',
  delay: 300,
  easing: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
})

//about__paragraph
sr.reveal('.about__paragraph', {
  duration: 1000,
  viewFactor: 0.1,
  origin: 'bottom',
  distance: '100px',
  delay: 400,
  easing: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
})

//animation images
sr.reveal('.about__images', {
  duration: 1000,
  viewFactor: 0.1,
  origin: 'bottom',
  distance: '100px',
  delay: 700,
  easing: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
})

// }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // Código para la funcionalidad del acordeón
  const accordionItems = document.querySelectorAll('.details__description-product');
  if (accordionItems.length > 0) {
    accordionItems.forEach((item) => {
      const accordationHeader = item.querySelector('.productDetail__header');

      if (accordationHeader) {
        accordationHeader.addEventListener('click', () => {
          const openItem = document.querySelector('.accordion-open');

          toggleItem(item);
          if (openItem && openItem !== item) {
            toggleItem(openItem);
          }
        });
      } else {
        console.log('No se encontró .productDetail__header dentro de', item);
      }
    });
  }

  // Función para alternar el acordeón
  const toggleItem = (item) => {
    const accordationContent = item.querySelector('.productDetail__content');

    if (item.classList.contains('accordion-open')) {
      accordationContent.removeAttribute('style');
      item.classList.remove('accordion-open');
    } else {
      accordationContent.style.height = accordationContent.scrollHeight + 'px';
      item.classList.add('accordion-open');
    }
  };


  const toggleButton = document.getElementById('toggleButton');
  const aside = document.getElementById('filterAside');
  const mainContent = document.getElementById('mainContent');
  const filterIcon = document.querySelector('.listFilterIcon'); // Selecciona el ícono para rotarlo

  const toggleSortBy = document.getElementById('toggleSortBy');
  const mainOrder = document.getElementById('menuFilterterOrder');
  const listSortBy = document.querySelector('.listSortBy');
  const arrowOrder = document.getElementById('arrowOrder');

  if (toggleSortBy && mainOrder) {
    // Agregar evento al botón y a la flecha
    const toggleContainer = () => {
      if (listSortBy) {
        listSortBy.classList.toggle('rotated');
        mainOrder.classList.toggle('show-order');
      }
    };

    // Abrir o cerrar al hacer clic en toggleSortBy o arrowOrder
    toggleSortBy.addEventListener('click', toggleContainer);
    arrowOrder.addEventListener('click', toggleContainer);

    // Cerrar al hacer clic fuera del contenedor
    document.addEventListener('click', (event) => {
      const isClickInside = mainOrder.contains(event.target) || toggleSortBy.contains(event.target) || arrowOrder.contains(event.target);
      if (!isClickInside && mainOrder.classList.contains('show-order')) {
        // Si el clic está fuera, cerrar el contenedor
        listSortBy.classList.remove('rotated');
        mainOrder.classList.remove('show-order');
      }
    });
  }

  if (toggleButton && aside && mainContent) {

    toggleButton.addEventListener('click', () => {

      // Evita múltiples clics mientras la animación está en curso
      if (aside.classList.contains('transitioning')) return;

      // Añade la clase 'transitioning' para evitar interrupciones
      aside.classList.add('transitioning');

      // Alterna las clases 'hidden' y 'active'
      aside.classList.toggle('hidden');
      mainContent.classList.toggle('active');

      // Rotación del ícono si está presente
      if (filterIcon) {
        filterIcon.classList.toggle('rotated');
      }

      // Remueve la clase 'transitioning' al terminar la animación
      const transitionDuration = parseFloat(getComputedStyle(aside).transitionDuration) * 600; // Convierte segundos a milisegundos
      setTimeout(() => {
        aside.classList.remove('transitioning');
      }, transitionDuration);
    });
  } else {
    console.warn('Uno o más elementos necesarios no están presentes: toggleButton, aside, o mainContent.');
  }

  if (window.location.pathname === "/shop/") {


    let listElements = document.querySelectorAll('.list__button-filter--click');

    listElements.forEach(listElement => {
      // Define el menú relacionado con el botón
      let menu = listElement.nextElementSibling;

      // Asegúrate de que estén abiertos al cargar la página
      menu.style.height = `${menu.scrollHeight}px`;

      // Agregar el evento de clic
      listElement.addEventListener('click', () => {
        listElement.classList.toggle('arrow');

        // Alternar entre abierto y cerrado
        if (menu.style.height === `${menu.scrollHeight}px`) {
          menu.style.height = '0'; // Cerrar
        } else {
          menu.style.height = `${menu.scrollHeight}px`; // Abrir
        }
      });
    });


    console.log('estamos en shop');
    const baseUrl = document.body.dataset.apiUrl;
    const apiUrl = `${baseUrl}/api/season/`;
    const filterContent = document.querySelector(".list-filter");

    console.log("Contenido de filterContent:", filterContent); // Depuración
    // Realizar la solicitud a la API
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los datos de la API");
        }
        // console.log(response.json());
        return response.json();
      })
      .then((data) => {

        console.log("Datos obtenidos de la API:", data); // Depuración
        const seasons = data.seasons;
        console.log(seasons)
        renderCategories(seasons, filterContent);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }



  const toggleButtonDetalle = document.getElementById('checkout-toggle');
  const productsPanel = document.querySelector('.checkout__products');
  const closeButton = document.querySelector('.cart__closeDetalle'); // aquí usamos la clase

  toggleButtonDetalle.addEventListener('click', () => {
    productsPanel.classList.toggle('active');

    if (productsPanel.classList.contains('active')) {
      document.body.style.overflow = 'hidden'; // Bloquear scroll del body
    } else {
      document.body.style.overflow = ''; // Restaurar scroll
    }
  });

  closeButton.addEventListener('click', () => {
    productsPanel.classList.remove('active'); // Cierra el panel
    document.body.style.overflow = ''; // Restaurar scroll del body
  });


});

//LOS CLICK PARA ORDENAR
function setupOrderListeners() {
  const orderLinks = document.querySelectorAll('.order-link'); // Seleccionamos todos los enlaces con la clase .order-link

  orderLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Evitar el redireccionamiento predeterminado del enlace

      // Obtener los valores de 'data-sortby' y 'data-order' de los atributos del enlace
      const sortBy = link.getAttribute('data-sortby');
      const order = link.getAttribute('data-order');

      // Imprimir los valores obtenidos en la consola
      console.log('Clicked link: sortBy =', sortBy, ', order =', order);

      // Llamar a la función para aplicar el orden seleccionado
      applyOrder(sortBy, order);
    });
  });
}

async function applyOrder(sortBy, order) {
  const baseUrl = document.body.dataset.apiUrl;
  const apiUrl = `${baseUrl}/get-products/`;

  // Obtenemos los filtros adicionales si existen
  const newFilter = document.querySelector('.menuA[data-new="true"]');
  const promotionsFilter = document.querySelector('.menuA[data-promotions="true"]');

  let params = new URLSearchParams();

  if (sortBy) params.set('sortBy', sortBy);
  if (order) params.set('order', order);

  if (newFilter && newFilter.getAttribute('data-new') === 'true') {
    console.log('Adding new filter');
    params.set('new', 'true');
  }

  if (promotionsFilter && promotionsFilter.getAttribute('data-promotions') === 'true') {
    console.log('Adding promotions filter');
    params.set('promotions', 'true');
  }

  console.log('Requesting API with URL:', `${apiUrl}?${params.toString()}`);

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta de product ordenado:', data);
      displayFilteredProducts(data.products);
    } else {
      console.error('Error al aplicar el orden:', response.statusText);
    }
  } catch (error) {
    console.error('Error al conectar con la API:', error);
  }
}

function renderCategories(seasons, filterContent) {
  // Función auxiliar para limpiar y agregar elementos a un contenedor
  function populateFilter(container, items, itemRenderer) {
    container.innerHTML = ""; // Limpiar contenido previo
    items.forEach((item) => {
      const li = document.createElement("li");
      li.classList.add("list__inside");
      li.innerHTML = itemRenderer(item); // Generar el contenido del elemento
      container.appendChild(li);
    });

    // Asegurar que el contenedor esté abierto por defecto
    container.style.height = `${container.scrollHeight}px`;
    container.classList.add("arrow");
  }

  // Seleccionar el contenedor de la sección "Season"
  const seasonFilter = filterContent.querySelector(
    ".list-filter .list__item-filter:first-child .list__show"
  );

  // Renderizar temporadas (Seasons)
  populateFilter(seasonFilter, seasons, (season) => `
      <label class="labelFilter">
        <input type="checkbox" class="nav__link-filter season-checkbox caja" data-id="${season.id}">
        <span class="nav__linkFilter nav__linkFilter--inside caja">${season.name}</span>
      </label>
  `);

  // Seleccionar el contenedor de la sección "Product Type"
  const productTypeFilter = filterContent.querySelector(
    ".list-filter .list__item-filter:nth-child(2) .list__show"
  );

  // Verificar si hay temporadas y renderizar sus categorías
  if (seasons.length > 0) {
    const categories = seasons[0].categories; // Cambia si necesitas recorrer todas las estaciones
    populateFilter(productTypeFilter, categories, (category) => `
        <label class="labelFilter">
          <input type="checkbox" class="category-checkbox caja" data-id="${category.id}">
          <span class="nav__linkFilter nav__linkFilter--inside caja">${category.name}</span>
        </label>
    `);
  }

  // Escuchar cambios en los checkboxes para aplicar filtros dinámicos
  setupFilterListeners();
}

function setupFilterListeners() {
  const baseUrl = document.body.dataset.apiUrl;
  // 1️⃣ Declarar elementos y URLs
  const seasonCheckboxes = document.querySelectorAll(".season-checkbox");
  const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
  const orderLinks = document.querySelectorAll(".order-link");

  const minPriceRange = document.getElementById("minPrice");
  const maxPriceRange = document.getElementById("maxPrice");
  const minPriceInput = document.getElementById("minPriceInput");
  const maxPriceInput = document.getElementById("maxPriceInput");

  // const apiUrlSort = "http://127.0.0.1:8000/get-products/";
  const apiUrlSort = `${baseUrl}/get-products/`;
  const apiUrlFilter = `${baseUrl}/by/search`;

  let currentSortBy = null;
  let currentOrder = null;
  let filterNew = false;
  let filterPromotions = false;

  // 2️⃣ Funciones auxiliares
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async function handleFilterChange() {
    const selectedSeasons = Array.from(seasonCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.getAttribute("data-id")));

    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.getAttribute("data-id")));

    const minPrice = parseInt(minPriceInput.value) || 0;
    const maxPrice = parseInt(maxPriceInput.value) || 9999999;


    console.log("maxPrice", maxPrice)
    const requestBody = {
      seasons: selectedSeasons.length > 0 ? selectedSeasons : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      min_price: minPrice,
      max_price: maxPrice,
    };

    if (selectedSeasons.length === 0 && selectedCategories.length === 0) {
      console.log("No filtros seleccionados de categoría/temporada...");

      if (minPrice !== 0 || maxPrice !== 9999999) {
        console.log("Filtrando solo por precios...");
        // Filtrar solo por precios (y si hay orden también aplicarlo)
        // Continúa hacia abajo y que haga el fetch normalmente
      } else if (currentSortBy || filterNew || filterPromotions) {
        console.log("Aplicando solo orden sin filtros de temporada/categoría...");
        await applyOrderOnly();
        return;
      } else {
        console.log("Cargando todos los productos...");
        loadAllProducts();
        return;
      }
    }


    async function applyOrderOnly() {
      try {
        let url = `${apiUrlSort}?`;
        if (currentSortBy && currentOrder) url += `sortBy=${currentSortBy}&order=${currentOrder}&`;
        if (filterNew) url += "new=true&";
        if (filterPromotions) url += "promotions=true&";

        const response = await fetch(url);
        if (!response.ok) {
          console.error("Error al ordenar productos:", response.statusText);
          return;
        }

        const data = await response.json();
        displayFilteredProducts(data.products);
      } catch (error) {
        console.error("Error conexión API:", error);
      }
    }


    try {
      const responseFilter = await fetch(apiUrlFilter, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!responseFilter.ok) {
        console.error("Error al aplicar filtros:", responseFilter.statusText);
        return;
      }

      let filteredProducts = (await responseFilter.json()).filtered_products;

      filteredProducts = filteredProducts.filter(product => {
        const price = parseFloat(product.price);
        return price >= minPrice && price <= maxPrice;
      });

      if (currentSortBy || filterNew || filterPromotions) {
        let url = `${apiUrlSort}?`;
        if (currentSortBy && currentOrder) url += `sortBy=${currentSortBy}&order=${currentOrder}&`;
        if (filterNew) url += "new=true&";
        if (filterPromotions) url += "promotions=true&";

        const responseSort = await fetch(url);
        if (!responseSort.ok) {
          console.error("Error al ordenar productos:", responseSort.statusText);
          return;
        }

        const sortedProducts = (await responseSort.json()).products;
        filteredProducts = sortedProducts.filter(p =>
          filteredProducts.some(fp => fp.id === p.id)
        );
      }

      // Cargar promociones completas si existen
      filteredProducts = await Promise.all(
        filteredProducts.map(async (product) => {
          if (product.promotions.length > 0) {
            try {
              const baseUrl = document.body.dataset.apiUrl;
              const promoRes = await fetch(`${baseUrl}/product/${product.id}`);
              if (promoRes.ok) {
                const details = await promoRes.json();
                product.promotions = details.product.promotions.length > 0
                  ? details.product.promotions
                  : product.promotions;
              }
            } catch (error) {
              console.error(`Error promociones ${product.id}:`, error);
            }
          }
          return product;
        })
      );

      console.log("Productos filtrados finales:", filteredProducts);
      displayFilteredProducts(filteredProducts);
    } catch (error) {
      console.error("Error conexión API:", error);
    }
  }

  function handleOrderClick(event) {
    event.preventDefault();
    const el = event.target;
    currentSortBy = el.getAttribute("data-sortby") || null;
    currentOrder = el.getAttribute("data-order") || null;
    filterNew = el.getAttribute("data-new") === "true";
    filterPromotions = el.getAttribute("data-promotions") === "true";

    handleFilterChange();
  }

  function updateActiveState() {
    document.querySelectorAll(".season-checkbox, .category-checkbox").forEach(checkbox => {
      const label = checkbox.nextElementSibling;
      label.classList.toggle("active", checkbox.checked);
    });
  }

  function updateSlider() {
    const minVal = parseInt(minPriceRange.value);
    const maxVal = parseInt(maxPriceRange.value);

    if (minVal >= maxVal) minPriceRange.value = maxVal - 1;

    minPriceInput.value = minPriceRange.value;
    maxPriceInput.value = maxPriceRange.value;
    debouncedFilterChange();
  }

  function updateInputs() {
    const minVal = parseInt(minPriceInput.value);
    const maxVal = parseInt(maxPriceInput.value);

    if (minVal >= maxVal) minPriceInput.value = maxVal - 1;

    minPriceRange.value = minPriceInput.value;
    maxPriceRange.value = maxPriceInput.value;
    debouncedFilterChange();
  }

  // 3️⃣ Asignar listeners
  const debouncedFilterChange = debounce(handleFilterChange, 300);

  seasonCheckboxes.forEach(cb => {
    cb.addEventListener("change", debouncedFilterChange);
    cb.addEventListener("change", updateActiveState);
  });

  categoryCheckboxes.forEach(cb => {
    cb.addEventListener("change", debouncedFilterChange);
    cb.addEventListener("change", updateActiveState);
  });

  orderLinks.forEach(link => link.addEventListener("click", handleOrderClick));

  minPriceRange.addEventListener("input", updateSlider);
  maxPriceRange.addEventListener("input", updateSlider);
  minPriceInput.addEventListener("input", updateInputs);
  maxPriceInput.addEventListener("input", updateInputs);

  // 4️⃣ Aplicar filtros si hay parámetros en la URL
  const selectedCategoryParam = getQueryParam("category");
  if (selectedCategoryParam) {
    const categoryId = parseInt(selectedCategoryParam);

    categoryCheckboxes.forEach((checkbox) => {
      if (parseInt(checkbox.getAttribute("data-id")) === categoryId) {
        checkbox.checked = true;

        // Simula evento "change" para que dispare el filtrado correctamente
        checkbox.dispatchEvent(new Event('change'));
      }
    });

    updateActiveState(); // (esto puede mantenerse si quieres, pero no es tan crítico ahora)
  }


  if (getQueryParam("new") === "true") filterNew = true;
  if (getQueryParam("promotions") === "true") filterPromotions = true;

  if (filterNew || filterPromotions) {
    handleFilterChange();
  }
}


function displayFilteredProducts(products) {
  console.log("DATOS QUE SE OPTIENEN: ", products);
  const container = document.querySelector('.Memories_wrappert'); // Seleccionamos el contenedor
  container.innerHTML = ''; // Limpiamos los productos existentes

  // Iteramos por cada producto filtrado
  products.forEach(product => {
    const productElement = createAllProductElement(product);
    container.appendChild(productElement);
  });
}


async function loadAllProducts() {
  try {
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/get-products/`);
    const data = await response.json();

    const container = document.querySelector('.Memories_wrappert'); // Seleccionamos el contenedor
    const products = data.products; // Cargamos todos los productos

    container.innerHTML = ''; // Limpiamos los productos existentes

    // Iteramos por cada producto
    products.forEach(product => {
      const productElement = createAllProductElement(product);
      container.appendChild(productElement);
    });

  } catch (error) {
    console.error('Error al cargar todos los productos:', error);
  }
}


function createAllProductElement(product) {
  const productElement = document.createElement("div");
  productElement.classList.add("MemoriesCard");

  // Verificar si el producto tiene promociones
  const hasPromotions = product.promotions && product.promotions.length > 0;
  const promotion = hasPromotions ? product.promotions[0] : null;

  // Validar que el precio es un número
  let price = parseFloat(product.price);
  if (isNaN(price)) {
    console.error(`Precio inválido para el producto ${product.name}:`, product.price);
    price = 0; // Asignar un valor por defecto para evitar NaN
  }

  // Variables para manejar el descuento
  let showAsNew = true; // Se mostrará como "New" por defecto
  let discountPercentage = 0;
  let discountedPrice = price;

  if (promotion) {
    let promoDiscount = parseFloat(promotion.discount_percentage);

    // Aplicar descuento solo si el código está vacío
    if (promotion.code === "" && !isNaN(promoDiscount)) {
      discountPercentage = promoDiscount;
      discountedPrice = price - (price * (discountPercentage / 100));
      showAsNew = false; // NO se muestra como "New" porque tiene descuento aplicado
    }
  }

  // Asegurarse de que los precios no sean NaN
  const displayedPrice = isNaN(discountedPrice) ? price : discountedPrice;
  const originalPrice = isNaN(price) ? "N/A" : `S/${price.toFixed(2)}`;

  productElement.innerHTML = `
      <a href="/shop/details/?id=${product.id}">
          ${showAsNew ? '<div class="new__tag">New</div>' : `<div class="new__tag">${discountPercentage}% OFF</div>`}
          <div class="imgBlusa">
              <img class="new__img" src="${product.imagenes[0]?.cRutaImagen}" alt="${product.name}" />
              <img class="new__img2" src="${product.imagenes[1]?.cRutaImagen}" alt="${product.name}" />
          </div>
          <h3 class="new__title">${product.name}</h3>
          <div class="new__prices">
              <span class="new__price">S/${displayedPrice.toFixed(2)}</span>
              ${showAsNew ? "" : `<span class="new__descount">${originalPrice}</span>`}
          </div>
          <div>
              <a href="javascript:void(0);" class="button new__buttont toggle-size" data-product-id="${product.id}" aria-expanded="false" aria-controls="selectSize">
                  <i class="bx bx-cart-alt new__icon"></i>
              </a>
              <div class="selectedSize" id="selectedSize-${product.id}" hidden>
                  <div>
                      <i class="bx bx-x cart__close" id="closeSize-${product.id}"></i>
                  </div>
                  <div>
                      <span class="selectSize-title">Cargando...</span>
                      <div class="selectSize-all"></div>
                  </div>
              </div>
          </div>
      </a>
  `;

  const toggleButton = productElement.querySelector(".toggle-size");
  const selectSizeDiv = productElement.querySelector(`#selectedSize-${product.id}`);
  const closeButton = productElement.querySelector(`#closeSize-${product.id}`);
  const sizeContainer = selectSizeDiv.querySelector(".selectSize-all");

  toggleButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const isHidden = selectSizeDiv.hidden;

    if (isHidden) {
      selectSizeDiv.hidden = false;
      selectSizeDiv.classList.add("show");
      selectSizeDiv.classList.remove("hide");
      toggleButton.setAttribute("aria-expanded", "true");

      if (sizeContainer.childElementCount === 0) {
        // Obtener tallas y colores por separado
        const [tallas, colores] = await Promise.all([
          fetchSizes(product.id),
          fetchColors(product.id)
        ]);

        console.log("TALLAS: ", tallas);
        console.log("COLORES: ", colores);

        // Crear el objeto combinado
        const data = { sizes: tallas, colors: colores };

        console.log("🔍 DATA COMPLETA: ", data);

        renderSizeAndColors(data, sizeContainer, product.id);
      }
    }
  });

  closeButton.addEventListener("click", () => {
    selectSizeDiv.classList.add("hide");
    selectSizeDiv.classList.remove("show");
    toggleButton.setAttribute("aria-expanded", "false");
    setTimeout(() => {
      selectSizeDiv.hidden = true;
    }, 300);
  });

  return productElement;
}

//TALLAS Y COLORES

async function fetchSizes(productId) {
  try {
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/product/${productId}`);
    if (!response.ok) {
      console.warn(`⚠ Error ${response.status}: No se pudieron obtener las tallas.`);
      return [];
    }

    const data = await response.json();
    const tallas = data.tallas ?? [];

    return tallas.map(({ id, talla, stock }) => ({
      id: id ?? null,
      cNombreTalla: talla?.cNombreTalla ?? "Sin nombre",
      stock: stock ?? 0
    })).filter(size => size.id !== null);
  } catch (error) {
    console.error("❌ Error en fetchSizes:", error);
    return [];
  }
}

async function fetchColors(productId) {
  try {
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/product/${productId}`);
    if (!response.ok) {
      console.warn(`⚠ Error ${response.status}: No se pudieron obtener los colores.`);
      return [];
    }

    const data = await response.json();
    const colores = data.colores ?? [];

    return colores.map(({ color, stock }) => ({
      color: color || "#000000", // Si el color es null, asigna negro
      stock: stock ?? 0
    }));
  } catch (error) {
    console.error("❌ Error en fetchColors:", error);
    return [];
  }
}


function renderSizeAndColors({ sizes, colors }, container, productId) {
  if (!container) {
    console.error("⚠ Error: El contenedor no existe.");
    return;
  }

  container.innerHTML = ""; // Limpiar contenido previo
  const titleElement = container.closest(".selectedSize")?.querySelector(".selectSize-title");

  if (!titleElement) {
    console.error("⚠ No se encontró el título de selección.");
    return;
  }

  console.log("📌 Tallas procesadas:", sizes);
  console.log("📌 Colores procesados:", colors);
  console.log("🔍 Renderizando ID...", productId);

  let hasSizes = sizes.length > 0;
  let hasColors = colors.length > 0;

  // Renderizar Tallas
  if (hasSizes) {
    titleElement.textContent = "Select Size";
    sizes.forEach((size) => {
      const hasStock = size.stock > 0;
      const displayName = size.cNombreTalla || size.talla?.cNombreTalla || "Talla Desconocida";

      const sizeElement = document.createElement("div");
      sizeElement.classList.add("selectSize-size");
      sizeElement.setAttribute("data-size-id", size.id);
      sizeElement.setAttribute("data-product-id", productId);
      sizeElement.innerHTML = `<a class="typeSize" href="javascript:void(0);">${displayName}</a>`;

      if (hasStock) {
        sizeElement.addEventListener("click", function () {
          const sizeId = sizeElement.getAttribute("data-size-id");

          getSizeId(productId, sizeId).then(sizeIds => {
            if (sizeIds) {
              addToCart(productId, sizeIds, null);
            } else {
              console.warn("No se pudo obtener el `sizeIds`.");
            }
          });
        });
      } else {
        sizeElement.classList.add("disabled");
        sizeElement.querySelector("a").classList.add("no-stock");
        sizeElement.style.pointerEvents = "none";
        sizeElement.style.opacity = "0.5";
      }

      container.appendChild(sizeElement);
    });
  }

  // Renderizar Colores
  if (hasColors) {
    titleElement.textContent = hasSizes ? "Select Size & Color" : "Select Color";

    colors.forEach(({ color, stock }) => {
      const hasStock = stock > 0;

      const colorElement = document.createElement("div");
      colorElement.classList.add("color-circle");
      colorElement.style.backgroundColor = color;

      if (hasStock) {
        colorElement.addEventListener("click", () => {
          addToCart(productId, null, color);
        });
      } else {
        colorElement.classList.add("disabled");
        colorElement.style.pointerEvents = "none";
        colorElement.style.opacity = "0.5";
      }

      container.appendChild(colorElement);
    });
  }

  // Sin tallas ni colores
  if (!hasSizes && !hasColors) {
    titleElement.textContent = "Sin opciones disponibles";
    container.innerHTML = "<p>Sin tallas ni colores disponibles</p>";
    console.warn("🚨 No se encontraron tallas ni colores.");
  }
}


function getSizeId(productId, sizeId) {
  const baseUrl = document.body.dataset.apiUrl;
  return fetch(`${baseUrl}/product/${productId}`)
    .then(response => response.json())
    .then(productData => {
      // Buscar la talla correspondiente
      const selectedTallaStock = productData.tallas.find(t => t.id === Number(sizeId));

      if (selectedTallaStock) {
        // Devuelve el `id` de la talla
        return selectedTallaStock.talla.id;
      } else {
        console.warn("Talla no encontrada");
        return null;
      }
    })
    .catch(error => {
      console.error("Error al obtener los datos del producto:", error);
      return null;
    });
}

// ############################################################################# PARA LOS PRODUCTOS DE LA PAGINA INICIAL ###########################
let swipers = [];
async function loadNewProducts() {
  try {
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/get-products/?new=true`);
    const data = await response.json();

    const swiperWrapper = document.querySelector('#new-products .new-wrapper'); // Seleccionamos el contenedor de productos nuevos
    const products = data.products.slice(0, 8); // Limitar a 4 productos

    swiperWrapper.innerHTML = ''; // Limpiar productos existentes

    products.forEach(product => {
      const productElement = createProductElement(product);
      swiperWrapper.appendChild(productElement);
      addEventListeners(product, productElement);
    });

    initSwipers(); // Inicializar el Swiper después de cargar los productos

  } catch (error) {
    console.error('Error al cargar productos nuevos:', error);
  }
}

function createProductElement(product) {
  const productElement = document.createElement("div");
  productElement.classList.add("new__content", "swiper-slide");

  // Obtener imágenes de manera segura
  const image1 = product.imagenes?.[0]?.cRutaImagen || "/media/photos/default.jpg";
  const image2 = product.imagenes?.[1]?.cRutaImagen || "/media/photos/default.jpg";

  // Obtener tallas disponibles
  const sizes = product.tallas?.map(talla => `<button class="size-option">${talla.talla.cNombreTalla}</button>`).join("") || "<span>Sin tallas disponibles</span>";

  productElement.innerHTML = `
        <a href="/shop/details/?id=${product.id}">
            <div class="new__tag">New</div> <!-- Se elimina el porcentaje de descuento -->
            <img src="${image1}" alt="${product.name}" class="new__img">
            <img src="${image2}" alt="${product.name}" class="new__img2">
            <h3 class="new__title">${product.name}</h3>
            <div class="new__prices">
                <span class="new__price">S/${product.price}</span>
            </div>
            <div>
                <a href="javascript:void(0);" class="button new__button add-to-cart" data-product-id="${product.id}" id="toggleSize-${product.id}" aria-expanded="false" aria-controls="selectSize-${product.id}">
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

// Función para cargar productos con descuento desde la API
async function loadDiscountedProducts() {
  try {
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/get-products/?promotions=true`);
    const data = await response.json();

    console.log(data); // Verifica la respuesta completa

    const swiperWrapper = document.querySelector('#discounted-products .new-wrapper');
    const products = data.products.slice(0, 8); // Limitar a 4 productos

    // Verifica la cantidad de productos antes de agregarlos
    if (products.length === 0) {
      console.log('No se encontraron productos con descuento');
    }

    console.log(products.length);
    swiperWrapper.innerHTML = ''; // Limpiar productos existentes

    products.forEach(product => {
      const productElement = createDiscountedProductElement(product);  // Usar la función correcta para productos con descuento
      swiperWrapper.appendChild(productElement);
      addEventListeners(product, productElement);
    });

    initSwipers(); // Inicializar el Swiper después de cargar los productos

  } catch (error) {
    console.error('Error al cargar productos con descuento:', error);
  }
}
// Crear el HTML de cada producto con descuento
function createDiscountedProductElement(product) {
  const productElement = document.createElement("div");
  productElement.classList.add("new__content", "swiper-slide");

  // Calcular el porcentaje de descuento de forma segura
  const discountPercentage = product.promotions?.length > 0 ? parseFloat(product.promotions[0].discount_percentage) : 0;

  // Calcular el precio con descuento
  const discountedPrice = (product.price * (1 - discountPercentage / 100)).toFixed(2);

  // Obtener imágenes de forma segura
  const image1 = product.imagenes?.[0]?.cRutaImagen ? product.imagenes[0].cRutaImagen : "/media/photos/default.jpg";
  const image2 = product.imagenes?.[1]?.cRutaImagen ? product.imagenes[1].cRutaImagen : "/media/photos/default.jpg";

  // Obtener tallas disponibles
  const sizes = product.tallas?.map(talla => `<button class="size-option">${talla.talla.cNombreTalla}</button>`).join("") || "<span>Sin tallas disponibles</span>";

  productElement.innerHTML = `
        <a href="/shop/details/?id=${product.id}">
            <div class="new__tag">${discountPercentage}% OFF</div> <!-- Muestra el porcentaje de descuento -->
            <img src="${image1}" alt="${product.name}" class="new__img">
            <img src="${image2}" alt="${product.name}" class="new__img2">
            <h3 class="new__title">${product.name}</h3>
            <div class="new__prices">
                <span class="new__price">S/${discountedPrice}</span>
                <span class="new__descount">S/${product.price}</span> <!-- Precio original tachado -->
            </div>
            <div>
                <a href="javascript:void(0);" class="button new__button add-to-cart" data-product-id="${product.id}" id="toggleSize-${product.id}" aria-expanded="false" aria-controls="selectSize-${product.id}">
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

//Función para cargar CATEGORIAS desde la API
async function loadCateoryProducts() {
  try {
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/get-products/?with_colors=true`);
    const data = await response.json();

    console.log(data); // Verifica la respuesta completa

    const swiperWrapper = document.querySelector('#accesories .new-wrapper');
    const products = data.products.slice(0, 8); // Limitar a 4 productos

    // Verifica la cantidad de productos antes de agregarlos
    if (products.length === 0) {
      console.log('No se encontraron productos con descuento');
    }

    console.log(products.length);
    swiperWrapper.innerHTML = ''; // Limpiar productos existentes

    products.forEach(product => {
      const productElement = createCategoryProductElement(product);  // Usar la función correcta para productos con descuento
      swiperWrapper.appendChild(productElement);
      addEventListeners(product, productElement);
    });

    initSwipers(); // Inicializar el Swiper después de cargar los productos

  } catch (error) {
    console.error('Error al cargar productos con descuento:', error);
  }
}

// Crear el HTML de cada producto con descuento o nuevo
function createCategoryProductElement(product) {
  const productElement = document.createElement("div");
  productElement.classList.add("new__content", "swiper-slide");

  // Calcular el porcentaje de descuento de forma segura
  const discountPercentage = product.promotions?.length > 0 ? parseFloat(product.promotions[0].discount_percentage) : 0;

  // Calcular el precio con descuento
  const discountedPrice = (product.price * (1 - discountPercentage / 100)).toFixed(2);

  // Obtener imágenes de forma segura
  const image1 = product.imagenes?.[0]?.cRutaImagen || "/media/photos/default.jpg";
  const image2 = product.imagenes?.[1]?.cRutaImagen || "/media/photos/default.jpg";

  // Obtener tallas disponibles
  const sizes = product.tallas?.map(talla => `<button class="size-option">${talla.talla.cNombreTalla}</button>`).join("") || "<span>Sin tallas disponibles</span>";

  productElement.innerHTML = `
        <a href="/shop/details/?id=${product.id}">
            <div class="new__tag">${discountPercentage > 0 ? `${discountPercentage}% OFF` : 'New'}</div> <!-- Muestra descuento o "New" -->
            <img src="${image1}" alt="${product.name}" class="new__img">
            <img src="${image2}" alt="${product.name}" class="new__img2">
            <h3 class="new__title">${product.name}</h3>
            <div class="new__prices">
                <span class="new__price">S/${discountedPrice}</span>
                ${discountPercentage > 0 ? `<span class="new__descount">S/${product.price}</span>` : ""}
            </div>
            <div>
                <a href="javascript:void(0);" class="button new__button add-to-cart" data-product-id="${product.id}" id="toggleSize-${product.id}" aria-expanded="false" aria-controls="selectSize-${product.id}">
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

// Agregar eventos de clic al producto y al carrito
//MUESTRA EL STOCK
// async function addEventListeners(product, productElement) {
//   const toggleButton = productElement.querySelector(`#toggleSize-${product.id}`);
//   const selectSizeDiv = productElement.querySelector(`#selectSize-${product.id}`);
//   const closeButton = productElement.querySelector(`#closeSize-${product.id}`);
//   const sizeContainer = productElement.querySelector(`#sizeContainer-${product.id}`);

//   if (toggleButton) {
//     toggleButton.addEventListener("click", async function (event) {
//       event.preventDefault();

//       // Alternar visibilidad del menú de selección
//       const isHidden = selectSizeDiv.hidden;
//       if (isHidden) {
//         sizeContainer.innerHTML = ""; // Limpiar contenido previo

//         try {
//           // Obtener tallas y colores de forma asíncrona
//           const [sizes, colors] = await Promise.all([
//             fetchSizes(product.id),
//             fetchColors(product.id)
//           ]);

//           if (sizes.length > 0) {
//             // Mostrar tallas si existen
//             sizes.forEach(size => {
//               const sizeElement = document.createElement("div");
//               sizeElement.classList.add("selectSize-size");
//               sizeElement.setAttribute("data-size-id", size.id);
//               sizeElement.setAttribute("data-product-id", product.id);
//               sizeElement.innerHTML = `<a class="typeSize" href="javascript:void(0);">${size.cNombreTalla} (${size.stock} disponibles)</a>`;

//               // Agregar evento de clic para cada talla
//               sizeElement.addEventListener("click", (event) => {
//                 event.preventDefault();

//                 // Obtener IDs desde el contenedor
//                 const sizeId = sizeElement.getAttribute("data-size-id");
//                 const productId = sizeElement.getAttribute("data-product-id");

//                 // Mostrar en consola
//                 console.log("✅ ID Producto:", productId);
//                 console.log("✅ ID Talla:", sizeId);
//               });

//               sizeContainer.appendChild(sizeElement);
//             });
//           } else if (colors.length > 0) {
//             // Mostrar colores si no hay tallas
//             colors.forEach(color => {
//               const colorElement = document.createElement("div");
//               colorElement.classList.add("color-circle");
//               colorElement.style.backgroundColor = color.color;
//               colorElement.innerHTML = `<span>${color.stock} disponibles</span>`;
//               sizeContainer.appendChild(colorElement);
//             });
//           } else {
//             // Si no hay ni tallas ni colores, mostrar mensaje
//             sizeContainer.innerHTML = `<span class="no-options">No sizes or colors available</span>`;
//           }

//           // Mostrar el menú con animación
//           selectSizeDiv.hidden = false;
//           selectSizeDiv.classList.add("show");
//           selectSizeDiv.classList.remove("hide");
//           toggleButton.setAttribute("aria-expanded", "true");

//         } catch (error) {
//           console.error("❌ Error al obtener tallas o colores:", error);
//         }
//       }
//     });
//   } else {
//     console.warn('No se encontró el botón de añadir al carrito.');
//   }

//   if (closeButton) {
//     closeButton.addEventListener("click", function () {
//       selectSizeDiv.classList.add("hide");
//       selectSizeDiv.classList.remove("show");
//       toggleButton.setAttribute("aria-expanded", "false");

//       setTimeout(() => {
//         selectSizeDiv.hidden = true;
//       }, 300);
//     });
//   }
// }


//MUESTRA SOLO TALLA Y COLOR
async function addEventListeners(product, productElement) {
  const toggleButton = productElement.querySelector(`#toggleSize-${product.id}`);
  const selectSizeDiv = productElement.querySelector(`#selectSize-${product.id}`);
  const closeButton = productElement.querySelector(`#closeSize-${product.id}`);
  const sizeContainer = productElement.querySelector(`#sizeContainer-${product.id}`);

  if (toggleButton) {
    toggleButton.addEventListener("click", async function (event) {
      event.preventDefault();

      if (selectSizeDiv.hidden) {
        sizeContainer.innerHTML = ""; // Limpiar contenido previo

        try {
          const [sizes, colors] = await Promise.all([
            fetchSizes(product.id),
            fetchColors(product.id)
          ]);

          if (sizes.length > 0) {
            // Mostrar tallas
            sizes.forEach(size => {
              const sizeElement = document.createElement("div");
              sizeElement.classList.add("selectSize-size");
              sizeElement.setAttribute("data-size-id", size.id);
              sizeElement.setAttribute("data-product-id", product.id);

              const hasStock = size.stock > 0;
              const displayName = size.cNombreTalla || size.talla?.cNombreTalla || "Talla Desconocida";

              sizeElement.innerHTML = `<a class="typeSize" href="javascript:void(0);">${displayName}</a>`;

              if (hasStock) {
                sizeElement.addEventListener("click", function () {
                  const sizeId = sizeElement.getAttribute("data-size-id");
                  const productId = sizeElement.getAttribute("data-product-id");

                  getSizeId(productId, sizeId).then(sizeIds => {
                    if (sizeIds) {
                      addToCart(productId, sizeIds, null);
                    } else {
                      console.warn("No se pudo obtener el `sizeIds`.");
                    }
                  });
                });
              } else {
                sizeElement.classList.add("disabled");
                sizeElement.querySelector("a").classList.add("no-stock");
                sizeElement.style.pointerEvents = "none";
                sizeElement.style.opacity = "0.5";
              }

              sizeContainer.appendChild(sizeElement);
            });
          } else if (colors.length > 0) {
            // Mostrar colores
            colors.forEach((colorObj) => {
              const hasStock = colorObj.stock > 0;
              const rgbColor = hexToRgb(colorObj.color);

              const colorElement = document.createElement("div");
              colorElement.classList.add("color-circle");
              colorElement.style.backgroundColor = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;

              if (hasStock) {
                colorElement.addEventListener("click", () => {
                  addToCart(product.id, null, colorObj.color);
                });
              } else {
                colorElement.classList.add("disabled");
                colorElement.style.pointerEvents = "none";
                colorElement.style.opacity = "0.5";
              }

              sizeContainer.appendChild(colorElement);
            });
          }

          selectSizeDiv.hidden = false;
          selectSizeDiv.classList.add("show");
          selectSizeDiv.classList.remove("hide");
          toggleButton.setAttribute("aria-expanded", "true");

        } catch (error) {
          console.error("❌ Error al obtener tallas o colores:", error);
        }
      }
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", function () {
      selectSizeDiv.classList.add("hide");
      selectSizeDiv.classList.remove("show");
      toggleButton.setAttribute("aria-expanded", "false");

      setTimeout(() => {
        selectSizeDiv.hidden = true;
      }, 300);
    });
  }
}


// Función para inicializar el Swiper
function initSwipers() {
  const sections = document.querySelectorAll(".new.section");

  sections.forEach((section, index) => {
    const swiperContainer = section.querySelector(".mySwiper");
    const wrapper = section.querySelector(".new-wrapper");

    if (!swiperContainer || !wrapper) {
      console.warn(`Sección ${index + 1} no tiene un Swiper o wrapper válido.`);
      return;
    }

    if (window.innerWidth > 767) {
      if (!swipers[index]) {
        swipers[index] = new Swiper(swiperContainer, {
          watchSlidesProgress: true,
          slidesPerView: "auto",
          spaceBetween: 0, // Ajusta el espacio entre productos
          freeMode: true,
        });
      }
      wrapper.style.display = "flex"; // Diseño para Swiper en pantallas grandes
      wrapper.style.gridTemplateColumns = ""; // Resetear estilos de grid
    } else {
      destroySwiperIfInitialized(index);
      wrapper.style.display = "grid";
      wrapper.style.gridTemplateColumns = "repeat(2, 1fr)"; // Siempre 2 columnas
    }
  });
}

// Función para destruir Swiper si ya está inicializado
function destroySwiperIfInitialized(index) {
  if (swipers[index]) {
    swipers[index].destroy(true, true);
    swipers[index] = null;
  }
}

function loadTendencia() {
  const baseUrl = document.body.dataset.apiUrl;
  fetch(`${baseUrl}/get/banerinicio-publico/`)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        const banner = data.results[0];

        // Reemplazar la imagen de fondo en .container-home
        const mainBannerElement = document.querySelector(".container-home");
        if (mainBannerElement) {
          mainBannerElement.style.backgroundImage = `url(${banner.imagen_banner})`;
        }

        // Reemplazar la imagen de fondo en .discount__container
        const discountBannerElement = document.querySelector(".discount__container");
        if (discountBannerElement) {
          discountBannerElement.style.backgroundImage = `url(${banner.imagen_extra})`;
        }

        // Reemplazar la imagen de fondo en .box
        const boxElement = document.querySelector(".box");
        if (boxElement) {
          boxElement.style.backgroundImage = `url(${banner.imagen_banner})`;
        }

        // Actualizar el texto dentro de .subheader__info con el encabezado de la API
        const subheaderElement = document.querySelector(".subheader__info");
        if (subheaderElement) {
          subheaderElement.textContent = banner.encabezado;
        }
      }
    })
    .catch(error => console.error("Error al cargar el banner:", error));
}

function loadBanner() {
  const baseUrl = document.body.dataset.apiUrl;
  fetch(`${baseUrl}/get/banerinicio-publico/`)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        const banner = data.results[0];

        // Reemplazar la imagen de fondo en .container-home
        const mainBannerElement = document.querySelector(".container-home");
        if (mainBannerElement) {
          mainBannerElement.style.backgroundImage = `url(${banner.imagen_banner})`;
        }

        // Reemplazar la imagen de fondo en .discount__container
        const discountBannerElement = document.querySelector(".discount__container");
        if (discountBannerElement) {
          discountBannerElement.style.backgroundImage = `url(${banner.imagen_extra})`;
        }

        // Reemplazar la imagen de fondo en .box
        const boxElement = document.querySelector(".box");
        if (boxElement) {
          boxElement.style.backgroundImage = `url(${banner.imagen_banner})`;
        }

        // Actualizar el texto dentro de .subheader__info con el encabezado de la API
        const subheaderElement = document.querySelector(".subheader__info");
        if (subheaderElement) {
          subheaderElement.textContent = banner.encabezado;
        }
      }
    })
    .catch(error => console.error("Error al cargar el banner:", error));
}


document.addEventListener('DOMContentLoaded', async () => {
  loadBanner();
  loadNewProducts();         // Cargar productos nuevos
  loadDiscountedProducts();  // Cargar productos con descuento
  loadCateoryProducts();
  loadAllProducts();
  await loadSwiperSlides(); // 🔹 Cargar dinámicamente los slides
  initSwiper(); // 🔹 Inicializar Swiper después de cargar los slides

  const envioFree = document.getElementById("envio-free");
  envioFree.classList.add("selected");
  envioFree.querySelector(".checkbox-envio").checked = true;



});

document.querySelectorAll(".checkout__envio-contenido").forEach(item => {
  item.addEventListener("click", () => {
    console.log("ENVIO CLIKEADOOOOOOOO");

    // Remover la clase 'selected' de todos los elementos
    document.querySelectorAll(".checkout__envio-contenido").forEach(el => {
      el.classList.remove("selected");
      el.querySelector(".checkbox-envio").checked = false; // Desmarcar todos
    });

    // Agregar la clase 'selected' al elemento clickeado
    item.classList.add("selected");
    item.querySelector(".checkbox-envio").checked = true; // Marcar checkbox
  });
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  try {
    const response = await fetch("/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": csrfToken,
      },
      body: new URLSearchParams({
        username: email,
        password: password
      })
    });

    const data = await response.json();
    console.log("Data response:", data);  // Verifica el contenido de la respuesta

    if (response.ok) {
      // Guardar en localStorage

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("first_name", data.first_name);
      localStorage.setItem("last_name", data.last_name);
      localStorage.setItem("cod_postal", data.codPostal);
      localStorage.setItem("ciudad", data.ciudad);
      localStorage.setItem("direccion", data.direccion);
      localStorage.setItem("region", data.region);
      localStorage.setItem("ruc", data.ruc);
      localStorage.setItem("telefono", data.telefono);

      // Redirigir al perfil
      window.location.href = "/perfil";
    } else {
      document.getElementById("error-message").innerText = data.error;
      document.getElementById("error-message").style.display = "block";
    }
  } catch (error) {
    document.getElementById("error-message").innerText = "Error de conexión";
    document.getElementById("error-message").style.display = "block";
  }
});



const contenedorBotones = document.getElementById('contenedor-botones');
const contenedorToast = document.getElementById('contenedor-toast');

document.getElementById("crearCuenta").addEventListener("click", async function (event) {
  event.preventDefault();

  const first_name = document.getElementById("nombre").value.trim();
  const last_name = document.getElementById("apellidos").value.trim();
  const email = document.getElementById("emailCreate").value.trim();
  const password = document.getElementById("passwordCreate").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const errorMsg = document.getElementById("errorMensaje");

  if (!first_name || !last_name || !email || !password || !phone) {
    errorMsg.innerText = "Todos los campos obligatorios deben completarse.";
    return;
  }

  // Crear el objeto con los datos obligatorios
  const userData = {
    first_name,
    last_name,
    email,
    password,
    phone
  };

  // Agregar datos opcionales si los elementos existen en el DOM
  const optionalFields = ["direccion", "ruc", "ciudad", "region", "codPostal"];
  optionalFields.forEach(field => {
    const element = document.getElementById(field);
    userData[field] = element ? element.value.trim() : "";
  });

  const btn = document.getElementById("crearCuenta");
  btn.disabled = true;

  try {
    console.log("Enviando datos:", userData);
    const baseUrl = document.body.dataset.apiUrl;
    const response = await fetch(`${baseUrl}/api/registro/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
    
    let data = null;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text }; // para ver qué llegó realmente
    }

    //const data = await response.json();

    if (response.ok) {
      swal(
        "¡Éxito!",
        `Bienvenido ${userData.first_name}. Ahora puedes Iniciar Sesión, tu cuenta fue creada con éxito.`,
        "success"
      );
    } else {
      document.getElementById("error-message").innerText = data.error;
      document.getElementById("error-message").style.display = "block";
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    errorMsg.innerText = "Hubo un problema con el registro. Inténtalo nuevamente.";
  } finally {
    btn.disabled = false;
  }

});


// Función para cerrar el toast
const cerrarToast = (id) => {
  document.getElementById(id)?.classList.add('cerrando');
};

// Función para agregar el toast
const agregarToast = ({ tipo, titulo, descripcion, autoCierre }) => {
  const nuevoToast = document.createElement('div');

  nuevoToast.classList.add('toast');
  nuevoToast.classList.add(tipo);
  if (autoCierre) nuevoToast.classList.add('autoCierre');

  const numeroAlAzar = Math.floor(Math.random() * 100);
  const fecha = Date.now();
  const toastId = fecha + numeroAlAzar;
  nuevoToast.id = toastId;

  const iconos = {
    exito: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"
					/>
				</svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
								<path
									d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
								/>
							</svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
              />
            </svg>`,
  };

  const toast = `
      <div class="contenidoCrear">
          <div class="icono">${iconos[tipo]}</div>
          <div class="texto">
              <p class="titulo">${titulo}</p>
              <p class="descripcion"> <span class="checkoutCart-link" id="login-checkout">${descripcion}<i class="bx bx-right-arrow-alt"></i></span></p>
          </div>
      </div>
      <button class="btnCrear-cerrar">
          <div class="icono">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
          </div>
      </button>
  `;

  nuevoToast.innerHTML = toast;
  contenedorToast.appendChild(nuevoToast);
  // Escuchar eventos del login-checkout DENTRO del nuevo toast
  const loginCheckout = nuevoToast.querySelector('#login-checkout');
  if (loginCheckout) {
    loginCheckout.addEventListener("click", () => {
      const login = document.getElementById('login');
      const loginShop = document.getElementById('login-button');
      if (login) login.classList.add('show-login');
      if (loginShop) loginShop.click();

      // 👇 Cierra el toast manualmente
      nuevoToast.classList.add('cerrar');
    });
  }

  // Escuchar animación de cierre
  const handleAnimacionCierre = (e) => {
    if (e.animationName === 'cierre') {
      nuevoToast.removeEventListener('animationend', handleAnimacionCierre);
      nuevoToast.remove();
    }
  };

  nuevoToast.addEventListener('animationend', handleAnimacionCierre);

  // Cierre automático si está habilitado
  if (autoCierre) {
    setTimeout(() => cerrarToast(toastId), 5000);
  }

  nuevoToast.addEventListener('animationend', handleAnimacionCierre);
};


// Evento para cerrar el toast
contenedorToast.addEventListener('click', (e) => {
  if (e.target.closest('button.btnCrear-cerrar')) {
    const toastId = e.target.closest('div.toast').id;
    cerrarToast(toastId);
  }
});


// Función para obtener parámetros de la URL y guardarlos en localStorage

// Ejecutar cuando se cargue la página
document.addEventListener("DOMContentLoaded", saveOAuthUserData);

//##########################3######################################

