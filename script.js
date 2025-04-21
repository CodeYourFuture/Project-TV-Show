//You can edit ALL of the code here
function setup() {
  //fetchEpisodes();
  fetchAllShows(); // [level 500] fetchEpisodes()
  document.getElementById("controls").style.display = "none"; // [level 500]
  container.style.display = "none"; // [level 500]
}

// for episodes
let episodes = [];

let allShows = []; // for shows
let episodesCache = {}; // for store in cache

// getting elements from DOM
const container = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const selectEl = document.getElementById("episode-select");
const statusMessage = document.getElementById("status-message");
const backToShowsBtn = document.getElementById("back-to-shows");
const showListSection = document.getElementById("shows-listing");
const showSearchInput = document.getElementById("show-search"); // [level 500]

function showStatus(message) {
  statusMessage.textContent = message;
}

function clearStatus() {
  statusMessage.textContent = "";
}

async function fetchAllShows() {
  // [level 500]
  try {
    showStatus("Loading shows...");
    const res = await fetch("https://api.tvmaze.com/shows");
    const data = await res.json();
    allShows = data.sort((a, b) => a.name.localeCompare(b.name));
    clearStatus();
    renderShowsList(allShows); //[level 500]
  } catch (err) {
    showStatus("Failed to load shows. Try refreshing.");
  }
}

function renderShowsList(shows) {
  // [level 500]
  showListSection.innerHTML = "";
  shows.forEach((show) => {
    const article = document.createElement("article");
    article.className = "show-card";

    const title = document.createElement("h2");
    title.className = "clickable";
    title.dataset.id = show.id;
    title.textContent = show.name;

    const img = document.createElement("img");
    img.src = show.image?.medium || "";
    img.alt = show.name;

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ")}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status}`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${show.rating.average}`;

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime} mins`;

    const summary = document.createElement("section");
    summary.innerHTML = show.summary;

    article.append(title, img, genres, status, rating, runtime, summary);
    showListSection.appendChild(article);

    title.addEventListener("click", () => {
      handleShowChange(show.id); // [level 500]
      showListSection.style.display = "none"; // [level 500]
      showSearchInput.style.display = "none"; // [level 500]
      container.style.display = "block"; // [level 500]
      document.getElementById("controls").style.display = "flex"; // [level 500]
    });
  });
}

async function handleShowChange(showId) {
  if (!showId) return;
  if (episodesCache[showId]) {
    episodes = episodesCache[showId];
  } else {
    try {
      showStatus("Loading episodes...");
      const res = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`
      );
      const data = await res.json();
      episodesCache[showId] = data;
      episodes = data;
      clearStatus();
    } catch (err) {
      showStatus("Failed to load episodes.");
    }
  }

  selectEl.innerHTML = '<option value="">Select an episode</option>';
  populateSelect();
  searchInput.value = "";
  renderEpisodes(episodes);
}

function populateSelect() {
  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${formatEpisodeCode(ep.season, ep.number)} - ${
      ep.name
    }`;
    selectEl.appendChild(option);
  });
}

function renderEpisodes(list) {
  container.innerHTML = "";
  list.forEach((ep) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.classList.add("episode");

    const title = document.createElement("h2");
    title.textContent = `${ep.name} (${formatEpisodeCode(
      ep.season,
      ep.number
    )})`;

    const img = document.createElement("img");
    img.src = ep.image?.medium || "";
    img.alt = ep.name;

    const summary = document.createElement("div");
    summary.innerHTML = ep.summary;

    episodeDiv.append(title, img, summary);
    container.appendChild(episodeDiv);
  });
}

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0"
  )}`;
}

function handleSelect() {
  const selectedId = selectEl.value;
  if (!selectedId) {
    renderEpisodes(episodes);
  } else {
    const ep = episodes.find((e) => e.id == selectedId);
    if (ep) renderEpisodes([ep]);
  }
}

function handleSearch() {
  const term = searchInput.value.toLowerCase();
  const filtered = episodes.filter(
    (ep) =>
      ep.name.toLowerCase().includes(term) ||
      ep.summary.toLowerCase().includes(term)
  );
  renderEpisodes(filtered);
}

function handleShowSearch() {
  // [level 500]
  const term = showSearchInput.value.toLowerCase();
  const filtered = allShows.filter(
    (show) =>
      show.name.toLowerCase().includes(term) ||
      show.genres.join(",").toLowerCase().includes(term) ||
      show.summary.toLowerCase().includes(term)
  );
  renderShowsList(filtered);
}

function goBackToShows() {
  // [level 500]
  container.style.display = "none";
  document.getElementById("controls").style.display = "none";
  showListSection.style.display = "grid";
  showSearchInput.style.display = "block";
  showSearchInput.value = "";
  renderShowsList(allShows);
}

selectEl.addEventListener("change", handleSelect);
searchInput.addEventListener("input", handleSearch);
showSearchInput.addEventListener("input", handleShowSearch); // [level 500]
backToShowsBtn.addEventListener("click", goBackToShows); // [level 500]

window.onload = setup;
