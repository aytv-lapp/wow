/* Mundo de Letras - interacciones */

// Datos de los cuentos (vista previa en el modal)
const books = {
  cloud:  { icon: "☁️",   title: "El viaje de la nube",        category: "Aventura", text: "Una nube curiosa recorre el cielo y descubre que cada lugar guarda una historia lista para imaginar." },
  forest: { icon: "🦊",   title: "Lola y el bosque brillante", category: "Animales", text: "Lola sigue pequeñas luces por el bosque y encuentra amistades que iluminan el camino." },
  abc:    { icon: "A B C", title: "La aventura del abecedario", category: "Fantasía", text: "Las letras se escapan de un libro mágico y necesitan ayuda para volver a formar palabras." },
  rocket: { icon: "🚀",   title: "El cohete de los sueños",    category: "Aprende",  text: "Un pequeño cohete aprende que la curiosidad y los libros pueden llevarlo muy lejos." }
};
const API = "api/index.php";
const storySlugs = { cloud: "el-viaje-de-la-nube", forest: "lola-y-el-bosque-brillante", abc: "la-aventura-del-abecedario", rocket: "el-cohete-de-los-suenos" };
let currentBook = null;
let currentUser = null;

async function api(action, data) {
  const response = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    credentials: "same-origin",
    body: data ? JSON.stringify(data) : undefined
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No se pudo completar la solicitud.");
  return result;
}

async function loadStories() {
  try {
    const { stories } = await api("stories");
    const bySlug = Object.fromEntries(stories.map((story) => [story.slug, story]));
    document.querySelectorAll("[data-book]").forEach((button) => {
      const story = bySlug[storySlugs[button.dataset.book]];
      if (!story) return;
      const card = button.closest(".library-card");
      const category = (story.categories || "").split(",")[0] || "Cuento";
      button.dataset.storyId = story.story_id;
      books[button.dataset.book] = { id: Number(story.story_id), icon: story.cover_emoji || books[button.dataset.book].icon,
        title: story.title, category, text: story.story_text || story.summary || "Este cuento aún no tiene contenido." };
      card.querySelector("h3").textContent = story.title;
      card.dataset.category = category;
      card.querySelector("p").textContent = category;
      card.querySelector(".book-cover").textContent = story.cover_emoji || "📖";
    });
  } catch (error) {
    console.error("No fue posible cargar los cuentos desde MySQL:", error.message);
  }
}

async function loadCurrentUser() {
  try {
    const { user } = await api("me");
    currentUser = user;
    const link = document.querySelector('header a[href="acceso.html"]');
    if (link && user) link.textContent = `Hola, ${user.name}`;
  } catch (error) { console.error(error); }
}

// Utilidades para abrir y cerrar modales
const openModal = (modal) => {
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
};
const closeModal = (modal) => {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
};

// Menú móvil y enlace activo
function initNavigation() {
  const mobileMenu = document.getElementById("mobile-menu");
  const menuToggle = document.getElementById("menu-toggle");

  if (!mobileMenu || !menuToggle) return;

  const links = [...document.querySelectorAll("header nav a")];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const setActiveLink = (target) => {
    links.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href === target || (!target && href === currentPage);
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  setActiveLink(window.location.hash || (currentPage === "index.html" ? "#inicio" : currentPage));

  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden", isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  document.querySelectorAll("header nav a").forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) setActiveLink(href);
      mobileMenu.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("hashchange", () => setActiveLink(window.location.hash || "#inicio"));

  const sectionLinks = new Set(links.map((link) => link.getAttribute("href")));
  const sections = [...document.querySelectorAll("main section[id]")]
    .filter((section) => sectionLinks.has(`#${section.id}`));
  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveLink(`#${visible.target.id}`);
    }, { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }
}

// Paneles de funciones
function initFeaturePanels() {
  const panels = document.querySelectorAll(".feature-panel");
  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      panels.forEach((p) => p.classList.add("hidden"));
      document.querySelectorAll("[data-panel]").forEach((tab) => {
        tab.setAttribute("aria-pressed", String(tab === button));
      });
      document.getElementById(button.dataset.panel).classList.remove("hidden");
    });
  });
}

// Filtros de la biblioteca
function initLibraryFilters() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll(".library-card");
  const noBooks = document.getElementById("no-books");

  if (!filterButtons.length || !cards.length || !noBooks) return;
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      let count = 0;
      cards.forEach((card) => {
        const show = button.dataset.filter === "all" || card.dataset.category === button.dataset.filter;
        card.classList.toggle("hidden", !show);
        if (show) count++;
      });
      noBooks.classList.toggle("hidden", count > 0);
      filterButtons.forEach((x) => x.setAttribute("aria-pressed", String(x === button)));
    });
  });
}

// Modales (cuento y registro)
function initModals() {
  const bookModal = document.getElementById("book-modal");
  const signupModal = document.getElementById("signup-modal");
  const readingMessage = document.getElementById("reading-message");
  const finishButton = document.getElementById("finish-reading");
  const favoriteButton = document.getElementById("favorite-story");
  const bookError = document.getElementById("book-error");

  document.querySelectorAll("[data-book]").forEach((button) => {
    button.addEventListener("click", () => {
      const book = books[button.dataset.book];
      currentBook = book;
      document.getElementById("preview-icon").textContent = book.icon;
      document.getElementById("preview-title").textContent = book.title;
      document.getElementById("preview-category").textContent = book.category;
      document.getElementById("preview-text").textContent = book.text;
      readingMessage.classList.add("hidden");
      bookError.classList.add("hidden");
      finishButton.classList.add("hidden");
      document.getElementById("start-reading").classList.remove("hidden");
      openModal(bookModal);
    });
  });

  document.getElementById("book-close").addEventListener("click", () => closeModal(bookModal));
  document.getElementById("start-reading").addEventListener("click", async () => {
    readingMessage.classList.remove("hidden");
    finishButton.classList.remove("hidden");
    document.getElementById("start-reading").classList.add("hidden");
    if (!currentUser) {
      bookError.textContent = "Inicia sesión para guardar tu avance de lectura.";
      bookError.classList.remove("hidden");
      return;
    }
    if (!currentBook?.id) return;
    try { await api("progress", { storyId: currentBook.id, progress: 10 }); }
    catch (error) { bookError.textContent = error.message; bookError.classList.remove("hidden"); }
  });
  finishButton.addEventListener("click", async () => {
    if (!currentUser) { window.location.href = "acceso.html"; return; }
    try {
      await api("progress", { storyId: currentBook.id, progress: 100 });
      finishButton.textContent = "¡Cuento terminado! ✓";
      finishButton.disabled = true;
    } catch (error) { bookError.textContent = error.message; bookError.classList.remove("hidden"); }
  });
  favoriteButton.addEventListener("click", async () => {
    if (!currentUser) { window.location.href = "acceso.html"; return; }
    try {
      const result = await api("favorite", { storyId: currentBook.id });
      favoriteButton.textContent = result.favorite ? "♥ En favoritos" : "♡ Guardar favorito";
    } catch (error) { bookError.textContent = error.message; bookError.classList.remove("hidden"); }
  });

  document.getElementById("signup-open").addEventListener("click", () => openModal(signupModal));
  document.getElementById("signup-close").addEventListener("click", () => closeModal(signupModal));

  document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const role = values.role === "educador" ? "educador" : "familia";
    try {
      await api("register", { name: values.name, email: values.email, password: values.password, accountType: role });
      currentUser = { name: values.name, email: values.email };
      document.getElementById("signup-success").classList.remove("hidden");
      form.querySelector("button[type=submit]").disabled = true;
    } catch (error) {
      const success = document.getElementById("signup-success");
      success.textContent = error.message;
      success.classList.remove("hidden");
    }
  });

  // Cerrar al hacer clic fuera o con Escape
  [bookModal, signupModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal(bookModal);
      closeModal(signupModal);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  initNavigation();
  initFeaturePanels();
  initLibraryFilters();
  initModals();
  loadStories();
  loadCurrentUser();
});
