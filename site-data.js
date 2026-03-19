(() => {
  const STORAGE_KEY = "moviespot_admin_data_v1";

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Could not read MovieSpot admin data:", error);
      return null;
    }
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const el = byId(id);
    if (el && value !== undefined && value !== null) {
      el.textContent = value;
    }
  }

  function setHref(id, value) {
    const el = byId(id);
    if (el && value) {
      el.href = value;
    }
  }

  function setImage(id, value, altText = "Image") {
    const el = byId(id);
    if (el && value) {
      el.src = value;
      el.alt = altText;
    }
  }

  function parseMetaParts(metaText = "") {
    return metaText
      .split("•")
      .map(part => part.trim())
      .filter(Boolean);
  }

  function parseGenre(metaText = "") {
    const parts = parseMetaParts(metaText);
    return parts.length ? parts[0] : "Unknown";
  }

  function renderPills(metaText = "") {
    const parts = parseMetaParts(metaText);
    return parts.map(part => `<span class="pill">${part}</span>`).join("");
  }

  function renderFeaturedCards(containerId, cards = []) {
    const container = byId(containerId);
    if (!container || !cards.length) return;

    container.innerHTML = cards.map(card => `
      <article class="featured-card">
        <div class="featured-image">
          <img src="${card.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"}" alt="${card.title || "Featured item"}">
        </div>
        <div class="featured-content">
          <div class="meta">
            ${renderPills(card.meta || "")}
          </div>
          <h3>${card.title || "Untitled"}</h3>
          <p>${card.desc || ""}</p>
          <a href="${card.link || "#"}" class="card-link">${card.linkText || "View →"}</a>
        </div>
      </article>
    `).join("");
  }

  function renderLibraryCards(containerId, cards = []) {
    const container = byId(containerId);
    if (!container || !cards.length) return;

    container.innerHTML = cards.map(card => {
      const genre = parseGenre(card.meta || "");
      return `
        <article class="movie-card" data-title="${(card.title || "").replace(/"/g, "&quot;")}" data-genre="${genre.replace(/"/g, "&quot;")}">
          <div class="movie-poster">
            <img src="${card.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"}" alt="${card.title || "Movie"}">
          </div>
          <div class="movie-content">
            <h3>${card.title || "Untitled"}</h3>
            <div class="movie-info">${card.meta || ""}</div>
            <p>${card.desc || ""}</p>
            <div class="mini-watch">
              ${(parseMetaParts(card.meta || "").slice(0, 2).map(item => `<span>${item}</span>`).join(""))}
            </div>
            <a href="${card.link || "#"}" class="card-link">${card.linkText || "View →"}</a>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderGuideCards(containerId, cards = []) {
    const container = byId(containerId);
    if (!container || !cards.length) return;

    container.innerHTML = cards.map(card => `
      <div class="info-box">
        <h3>${card.title || "Guide"}</h3>
        <p>${card.desc || ""}</p>
        <a href="${card.link || "#"}" class="card-link">${card.linkText || "Explore →"}</a>
      </div>
    `).join("");
  }

  function renderGenreLinks(containerId, cards = []) {
    const container = byId(containerId);
    if (!container || !cards.length) return;

    container.innerHTML = cards.map(card => `
      <div class="genre-link-card">
        <h3>${card.title || "Genre"}</h3>
        <p>${card.desc || ""}</p>
        <a href="${card.link || "#"}">Open Page →</a>
      </div>
    `).join("");
  }

  function populateGenreFilter(cards = []) {
    const select = byId("genreFilter");
    if (!select) return;

    const genres = [...new Set(cards.map(card => parseGenre(card.meta || "")).filter(Boolean))].sort();
    select.innerHTML = `<option value="all">All Genres</option>` +
      genres.map(genre => `<option value="${genre}">${genre}</option>`).join("");
  }

  function setupMovieSearchAndFilter() {
    const searchInput = byId("searchInput");
    const genreFilter = byId("genreFilter");
    const movieCards = document.querySelectorAll("#libraryCardsContainer .movie-card");

    if (!searchInput || !genreFilter || !movieCards.length) return;

    function filterMovies() {
      const searchValue = searchInput.value.toLowerCase().trim();
      const selectedGenre = genreFilter.value;

      movieCards.forEach(card => {
        const title = (card.dataset.title || "").toLowerCase();
        const genre = card.dataset.genre || "";
        const matchesSearch = title.includes(searchValue);
        const matchesGenre = selectedGenre === "all" || genre === selectedGenre;

        card.style.display = matchesSearch && matchesGenre ? "flex" : "none";
      });
    }

    searchInput.addEventListener("input", filterMovies);
    genreFilter.addEventListener("change", filterMovies);
    filterMovies();
  }

  function applyGlobal(globalData = {}) {
    setImage("siteLogo", globalData.logo || "logo.png", `${globalData.siteName || "MovieSpot"} Logo`);
    setText("footerText", globalData.footerText || "©️ 2026 MovieSpot. Discover movies and where to watch them.");
  }

  function applyContentPage(pageData) {
    if (!pageData) return;

    setText("heroTagText", pageData.heroTag || "");
    setText("heroTitleText", pageData.heroTitle || "");
    setText("heroDescText", pageData.heroDesc || "");
    setText("primaryBtnText", pageData.primaryBtn || "Browse");
    setText("secondaryBtnText", pageData.secondaryBtn || "Explore");

    setText("featuredSectionTitle", pageData.featuredSectionTitle || "Featured Picks");
    setText("featuredSectionDesc", pageData.featuredSectionDesc || "");

    setText("librarySectionTitle", pageData.librarySectionTitle || "Popular Movies");
    setText("librarySectionDesc", pageData.librarySectionDesc || "");

    setText("guidesSectionTitle", pageData.guidesSectionTitle || "Guides");
    setText("guidesSectionDesc", pageData.guidesSectionDesc || "");

    if (pageData.genreLinks && byId("genreLinksContainer")) {
      renderGenreLinks("genreLinksContainer", pageData.genreLinks);
    }

    renderFeaturedCards("featuredCardsContainer", pageData.featuredCards || []);
    renderLibraryCards("libraryCardsContainer", pageData.libraryCards || []);
    renderGuideCards("guideCardsContainer", pageData.guideCards || []);
    populateGenreFilter(pageData.libraryCards || []);
    setupMovieSearchAndFilter();
  }

  function initMenu() {
    const menuToggle = byId("menuToggle");
    const navLinks = byId("navLinks");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove("show");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        navLinks.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMenu();

    const data = getData();
    if (!data) return;

    applyGlobal(data.global || {});

    const pageKey = document.body.dataset.page;
    if (!pageKey) return;

    const pageData = data.pages && data.pages[pageKey];
    if (!pageData) return;

    if (pageData.type === "content" || pageData.type === "genre") {
      applyContentPage(pageData);
    }
  });
})();