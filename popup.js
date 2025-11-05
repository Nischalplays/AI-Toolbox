const tools = window.AI_TOOLS;
const searchBox = document.getElementById("searchBox");
const list = document.getElementById("toolList");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
const pageSize = 8;   // ❗ change this to control how many per page
let filteredTools = tools;

function renderPage() {
  list.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const end   = start + pageSize;

  const pageItems = filteredTools.slice(start, end);

  pageItems.forEach(tool => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.textContent = tool.name;
    title.className = "title";

    const tags = document.createElement("div");
    tags.className = "tags";
    tool.tags.forEach(tag => {
      const t = document.createElement("span");
      t.className = "tag";
      t.textContent = tag;
      tags.appendChild(t);
    });

    card.appendChild(title);
    card.appendChild(tags);

    card.addEventListener("click", () => {
      window.open(tool.url, "_blank");
    });

    list.appendChild(card);
  });

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredTools.length / pageSize);
  pageInfo.textContent = `${currentPage} / ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function applySearch() {
  const q = searchBox.value.toLowerCase();
  filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  );

  currentPage = 1;
  renderPage();
}

searchBox.addEventListener("input", applySearch);

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredTools.length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// Initial
renderPage();
document.getElementById("openFull").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("home.html") });
});
