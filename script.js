const BASE_URL = "https://rickandmortyapi.com/api/character";

const filterForm = document.getElementById("filter-form");
const messageEl = document.getElementById("message");
const tableWrapper = document.getElementById("table-wrapper");
const resultsBody = document.getElementById("results-body");
const paginationEl = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfoEl = document.getElementById("page-info");

let currentParams = new URLSearchParams();
let currentPage = 1;

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = type || "";
}

function clearMessage() {
  messageEl.textContent = "";
  messageEl.className = "";
}

function clearResults() {
  resultsBody.innerHTML = "";
  tableWrapper.classList.add("hidden");
  paginationEl.classList.add("hidden");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No se encontraron personajes con esos criterios.");
    }
    throw new Error(`Error al consultar la API (status ${response.status}).`);
  }
  return response.json();
}

function renderTable(characters) {
  if (characters.length > 0) {
    tableWrapper.classList.remove("hidden");
  }

  characters.forEach((character) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${character.image}" alt="${character.name}" loading="lazy"></td>
      <td>${character.name}</td>
      <td>${character.status}</td>
      <td>${character.species}</td>
      <td>${character.type || "-"}</td>
      <td>${character.gender}</td>
      <td>${character.origin?.name || "-"}</td>
      <td>${character.location?.name || "-"}</td>
    `;
    resultsBody.appendChild(row);
  });
}

function renderPagination(info) {
  prevPageBtn.disabled = !info.prev;
  nextPageBtn.disabled = !info.next;
  pageInfoEl.textContent = `Página ${currentPage} de ${info.pages}`;
  paginationEl.classList.remove("hidden");
}

prevPageBtn.addEventListener("click", () => {
  currentPage -= 1;
  loadPage();
});

nextPageBtn.addEventListener("click", () => {
  currentPage += 1;
  loadPage();
});

async function loadPage() {
  clearMessage();
  clearResults();
  showMessage("Cargando personajes...", "info");

  const params = new URLSearchParams(currentParams);
  params.set("page", currentPage);
  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const data = await fetchJson(url);
    showMessage(`${data.info.count} personaje(s) encontrado(s).`, "info");
    renderTable(data.results);
    renderPagination(data.info);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(filterForm);
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (value.trim() !== "") {
      params.append(key, value.trim());
    }
  }

  currentParams = params;
  currentPage = 1;
  loadPage();
});
