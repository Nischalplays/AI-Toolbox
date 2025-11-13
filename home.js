/*********************************
 AI Toolbox – HOME.JS (stable icon + favorites + trending + modal + pricing)
**********************************/

// ====== PREVENTING DEFAULT RIGHT CLICK =========
document.body.addEventListener("contextmenu", (e) => {
  e.preventDefault();
})

// ===== DOM =====
const container = document.getElementById("toolContainer");
const searchInput = document.getElementById("searchInput");
const categoryBar = document.getElementById("filter-btns");
const sortBar = document.getElementById("sort-content");
const filterBtn = document.getElementById("filter")
const filterWin = document.getElementById("filter-win");

// MODAL
const modal = document.getElementById("toolModal");
const modalClose = document.getElementById("modalClose");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalTags = document.getElementById("modalTags");
const modalFav = document.getElementById("modalFav");
const modalVisit = document.getElementById("modalVisit");
const modalSortBtns = sortBar.querySelectorAll(".sort-btn");

// ===== DATA =====
const tools = window.AI_TOOLS;
let activeCategory = "All";
let favorites = [];
let sortEventAdded = false;
let filterWinOpen = false;
let defaultSet = false;

/* ===============================
   THEME
================================ */
let theme = "light";

// Load theme from storage
chrome.storage.local.get(["theme"], res => {
  theme = res.theme || "light";
  applyTheme();
});

// Toggle theme
document.getElementById("themeToggle").onclick = () => {
  theme = theme === "light" ? "dark" : "light";
  chrome.storage.local.set({ theme });
  applyTheme();
};

function applyTheme() {
  document.body.className = theme;
  const btn = document.getElementById("themeToggle");
  btn.textContent = theme === "light" ? "🌙" : "☀️";
}

function sortEvent() {
  if (sortEventAdded != false) return;

  modalSortBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const prevActive = sortBar.querySelector(".active");
      let currentActive = btn.classList.contains("active");
      prevActive.classList.remove("active");
      btn.classList.add("active");
      sortTool(btn.id, currentActive);
    })
  })
  sortEventAdded = true;
}

function filterEvent() {
  filterBtn.addEventListener("click", () => {
    if (filterWinOpen) {
      filterWin.classList.remove("active");
      filterWinOpen = false
    }
    else {
      filterWin.classList.add("active");
      filterWinOpen = true;
    }
  })
}

/* ===============================
   SVG fallback icon
================================ */
const FALLBACK_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
       <rect width="100%" height="100%" rx="16" ry="16" fill="#e6e9ef"/>
       <text x="50%" y="55%" text-anchor="middle"
             font-family="Arial" font-size="44"
             font-weight="700" fill="#4a5568">AI</text>
     </svg>`
  );

/* ===============================
   Build category list
================================ */
const categories = ["All", "🔥 Trending", "⭐ Favorites"];

tools.forEach(t => {
  t.tags.forEach(tag => {
    if (!categories.includes(tag)) categories.push(tag);
  });
});

/* ===============================
   Save favorites
================================ */
function saveFavorites() {
  chrome.storage.local.set({ favorites });
}

/* ===============================
   Render Categories
================================ */
function renderCategories() {
  categoryBar.innerHTML = "";

  const LABELS = {
    "🔥 Trending": { cls: "trending" },
    "⭐ Favorites": { cls: "favorites" }
  };

  categories.forEach(c => {
    const btn = document.createElement("div");
    btn.textContent = c;
    btn.classList.add("category-btn");

    if (LABELS[c]) btn.classList.add(LABELS[c].cls);
    if (c === activeCategory) btn.classList.add("active");

    btn.onclick = () => {
      activeCategory = c;
      renderCategories();
      filterCategory();
    };

    categoryBar.appendChild(btn);
  });
}

/* ===============================
   STABLE ICON HANDLER
================================ */
function buildIcon(tool) {
  const img = document.createElement("img");
  img.className = "tool-icon";

  const sources = [];

  if (tool.icon && tool.icon.startsWith("http")) {
    sources.push(tool.icon);
  }

  const SAFE_FAVICON_DOMAINS = [
    "openai.com",
    "claude.ai",
    "gemini.google.com",
    "perplexity.ai",
    "midjourney.com",
    "bing.com",
    "fotor.com",
    "vanceai.com",
    "topazlabs.com",
    "replit.com",
    "github.com"
  ];

  try {
    const origin = new URL(tool.url).origin;
    if (SAFE_FAVICON_DOMAINS.some(d => origin.includes(d))) {
      sources.push(`${origin}/favicon.ico`);
    }
  } catch (e) { }

  sources.push(FALLBACK_ICON);

  let i = 0;
  function tryNext() {
    if (i >= sources.length) {
      img.src = FALLBACK_ICON;
      return;
    }
    img.src = sources[i++];
  }

  img.onerror = () => tryNext();
  tryNext();

  return img;
}

/* ===============================
   OPEN MODAL
================================ */
function openToolModal(tool, card) {
  modalTitle.textContent = tool.name;
  modalIcon.src = tool.icon || FALLBACK_ICON;

  modalTags.innerHTML = "";
  // TAGS
  tool.tags.forEach(tag => {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = tag;
    modalTags.appendChild(t);
  });

  // PRICING
  const pricing = tool.pricing || "free";
  const modalPrice = document.createElement("span");
  modalPrice.className = `pricing tag ${pricing}`;
  modalPrice.textContent = pricing;
  modalTags.appendChild(modalPrice);

  // Favorite state
  const isFav = favorites.includes(tool.name);
  modalFav.textContent = isFav ? "★ Remove Favorite" : "☆ Add Favorite";

  modalFav.onclick = () => {
    favCard(card);
    modalFav.textContent = favorites.includes(tool.name) ? "★ Remove Favorite" : "☆ Add Favorite";
  };

  modalVisit.onclick = () => {
    window.open(tool.url, "_blank");
  };

  modal.classList.remove("hidden");
}

/* MODAL CLOSE */
modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

/* ===============================
   Create Card
================================ */

function createToolCard(tool) {
  const card = document.createElement("div");
  card.className = "tool-card";

  if (tool.trending) card.classList.add("trending");

  // ICON
  const img = buildIcon(tool);

  // TEXT BOX
  const textBox = document.createElement("div");
  textBox.className = "tool-text";

  const title = document.createElement("div");
  title.className = "tool-title";
  title.textContent = tool.name;

  // TAGS
  const tagsBox = document.createElement("div");
  tagsBox.className = "tags";

  tool.tags.forEach(tag => {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = tag;
    tagsBox.appendChild(t);
  });

  // PRICING (auto default → free)
  const pricing = tool.pricing || "free";
  const price = document.createElement("span");
  price.className = `tag pricing ${pricing}`;
  price.textContent = pricing;
  tagsBox.appendChild(price);

  // FAVORITE BUTTON
  const favBtn = document.createElement("div");
  favBtn.className = "fav-btn";
  const isFav = favorites.includes(tool.name);
  favBtn.textContent = isFav ? "⭐" : "☆";
  if (isFav) favBtn.classList.add("active");

  favBtn.onclick = (e) => {
    e.stopPropagation();
    favCard(card)
  }

  textBox.appendChild(title);
  textBox.appendChild(tagsBox);

  card.appendChild(img);
  card.appendChild(textBox);
  card.appendChild(favBtn);

  // Click → modal
  card.onmousedown = (event) => {
    if (event.target.closest('.fav-btn')) return;
    if (event.button === 0) {
      openToolModal(tool, card)
    }
    else if (event.button === 2) {
      favCard(card);
    }
  };

  container.appendChild(card);
}


/* ===============================
   Render Tools
================================ */
function renderTools() {
  container.innerHTML = "";
  filterEvent();
  sortEvent();

  const q = searchInput.value.toLowerCase();

  const filtered = tools.filter(tool => {
    const matchesText =
      tool.name.toLowerCase().includes(q) ||
      tool.tags.some(t => t.toLowerCase().includes(q));

    if (activeCategory === "⭐ Favorites") {
      return favorites.includes(tool.name) && matchesText;
    }

    if (activeCategory === "🔥 Trending") {
      return tool.trending && matchesText;
    }

    const matchesCategory =
      activeCategory === "All" || tool.tags.includes(activeCategory);

    return matchesText && matchesCategory;
  });

  filtered.forEach(tool => {
    createToolCard(tool);
  });
  const defaultCards = Array.from(container.children);
}

// ======== Fav Crad ========

function favCard(card) {
  const cardTitle = card.querySelector('.tool-title');
  const favBtn = card.querySelector('.fav-btn');
  const currentCategory = categoryBar
    .querySelector(".active")
    .textContent
    .toLowerCase();

  let isFav = favBtn.classList.contains("active");

  if (isFav) {
    favorites = favorites.filter(f => f !== cardTitle.textContent);
    favBtn.textContent = "☆";
    favBtn.classList.remove("active");

    console.log("hello")
    if (currentCategory.includes("favorites") || currentCategory.includes("favourites")) {
      card.remove();
    }
  }
  else {
    favorites.push(cardTitle.textContent);
    favBtn.textContent = "⭐";
    favBtn.classList.add("active");
  }
  console.log(currentCategory)
  saveFavorites();
}

/* ============================
    Sort TOOL
==============================*/

function sortTool(id, currentActive) {
  if (currentActive) return;

  const cards = Array.from(container.children);
  console.log(activeCategory);

  if (id === "ascending") {
    cards.sort((a, b) =>
      a.querySelector(".tool-title").textContent.trim().localeCompare(
        b.querySelector(".tool-title").textContent.trim()
      )
    );
  } else if (id === "descending") {
    cards.sort((a, b) =>
      b.querySelector(".tool-title").textContent.trim().localeCompare(
        a.querySelector(".tool-title").textContent.trim()
      )
    );
  } else if (id === "default") {
    const defaultOrder = tools.map(t => t.name);
    cards.sort((a, b) => {
      const nameA = a.querySelector(".tool-title").textContent.trim();
      const nameB = b.querySelector(".tool-title").textContent.trim();
      return defaultOrder.indexOf(nameA) - defaultOrder.indexOf(nameB);
    });
  }

  cards.forEach(card => container.appendChild(card));
}

/* ============================
    FILTER TOOL
==============================*/
function filterTools() {
  const q = searchInput.value.toLowerCase();

  document.querySelectorAll(".tool-card").forEach(card => {
    const title = card.querySelector(".tool-title").textContent.toLowerCase();
    const tags = Array.from(card.querySelectorAll(".tag")).map(t => t.textContent.toLowerCase());

    const matches = title.includes(q) || tags.some(tag => tag.includes(q));

    card.style.display = matches ? "" : "none";
  })
}

function filterCategory(){
  document.querySelectorAll(".tool-card").forEach(card =>{
    // const title = card.querySelector(".tool-title").textContent.trim();
    const tags = Array.from(card.querySelectorAll(".tag")).map(t=> t.textContent.toLowerCase().trim());

    let matches = tags.some(tag => tag.includes(activeCategory));
    const categroyName = activeCategory.toLowerCase().replace(/[^a-z]/g, "");
    console.log(categroyName);

    if(categroyName === "all"){
      card.style.display = "";
      return;
    }
    else if(categroyName === "trending"){
      matches = card.classList.contains("trending");
    }
    else if(categroyName === "favorites"){
      const fav_btn = card.querySelector(".fav-btn");
      matches = fav_btn.classList.contains("active");
    }

    card.style.display =  matches ? "" : "none";
  })
}

/* ===============================
   SEARCH
================================ */
searchInput.addEventListener("input", filterTools);

/* ===============================
   INIT
================================ */
chrome.storage.local.get(["favorites"], res => {
  favorites = res.favorites || [];
  renderCategories();
  renderTools();
});
