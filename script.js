//You can edit ALL of the code here
// GLOBAL STORAGE
let allEpisodes = [];
let allShows = [];
const episodeCache = {};
let showCache = null;

// Fetch all shows
async function fetchShow() {
  if (showCache) return showCache;

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Failed to fetch shows");
    const data = await response.json();

    showCache = data.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    return showCache;
  } catch (error) {
    console.error("Show fetch error:", error);
    return [];
  }
}

// Fetch episodes for a show
async function fetchEpisodes(showId) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes...</p>";

  if (episodeCache[showId]) {
    return episodeCache[showId];
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    episodeCache[showId] = data;
    return data;
  } catch (error) {
    rootElem.innerHTML = "<p>Something went wrong. Please try again.</p>";
    console.error("Fetch error:", error);
    return [];
  }
}

// Format SxxExx
function formatEpisodeCode(season, episode) {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(
    2,
    "0"
  )}`;
}

// SHOW LISTING (Level 500)
function renderShowList(shows) {
  const showList = document.getElementById("show-list");
  showList.innerHTML = "";

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.classList.add("show-card");

    card.innerHTML = `
      <h2>${show.name}</h2>
      <img src="${show.image?.medium || ""}">
      <p>${show.summary}</p>
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime} minutes</p>
    `;

    card.addEventListener("click", () => loadEpisodesView(show.id));

    showList.appendChild(card);
  });
}

// SHOW SEARCH (Level 500)
function setupShowSearch() {
  const input = document.getElementById("show-search");

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase().trim();

    const filtered = allShows.filter((show) => {
      const nameMatch = show.name.toLowerCase().includes(term);
      const summaryMatch = show.summary.toLowerCase().includes(term);
      const genreMatch = show.genres.join(" ").toLowerCase().includes(term);
      return nameMatch || summaryMatch || genreMatch;
    });

    renderShowList(filtered);
  });
}

// EPISODE SELECTOR
function createOptionElements() {
  const createSelect = document.getElementById("episode-select");
  createSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Show all episodes";
  createSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    let option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number
    )} - ${episode.name}`;
    createSelect.appendChild(option);
  });
}

// EPISODE SELECTOR EVENT
function EventChange() {
  const createSelect = document.getElementById("episode-select");

  createSelect.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const result = allEpisodes.filter(
        (episode) => episode.id === Number(selectedValue)
      );
      makePageForEpisodes(result);
    }
  });
}

// EPISODE SEARCH
function handleSearchInput() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();

    const filtered = allEpisodes.filter((episode) => {
      const matchName = episode.name.toLowerCase().includes(searchTerm);
      const matchSummary = episode.summary.toLowerCase().includes(searchTerm);
      const matchCode = formatEpisodeCode(
        episode.season,
        episode.number
      ).toLowerCase().includes(searchTerm);

      return matchName || matchSummary || matchCode;
    });

    makePageForEpisodes(filtered);
  });
}

// RENDER EPISODES
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const countElem = document.getElementById("search-count");
  countElem.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;

  const cards = episodeList.map((episode) => createDramaCard(episode));
  rootElem.append(...cards);
}

// EPISODE CARD
function createDramaCard(episode) {
  const card = document.createElement("section");
  card.classList.add("drama-card");

  const episodeCode = formatEpisodeCode(episode.season, episode.number);

  const smallcard = document.createElement("div");
  smallcard.classList.add("small-card");
  smallcard.textContent = `${episode.name} - ${episodeCode}`;
  card.append(smallcard);

  const img = document.createElement("img");
  img.src = episode.image ? episode.image.medium : "";
  card.append(img);

  const summaryElem = document.createElement("div");
  summaryElem.innerHTML = episode.summary;
  card.append(summaryElem);

  return card;
}

// SWITCH TO EPISODES VIEW (Level 500)
async function loadEpisodesView(showId) {
  document.getElementById("show-list").style.display = "none";
  document.getElementById("show-search").style.display = "none";

  document.getElementById("show-select").style.display = "block";
  document.getElementById("episode-select").style.display = "block";
  document.getElementById("search-input").style.display = "block";
  document.getElementById("back-button").style.display = "block";

  allEpisodes = await fetchEpisodes(showId);

  createOptionElements();
  EventChange();
  makePageForEpisodes(allEpisodes);
}

// SWITCH BACK TO SHOWS VIEW (Level 500)
function setupBackButton() {
  const btn = document.getElementById("back-button");

  btn.addEventListener("click", () => {
    document.getElementById("show-list").style.display = "block";
    document.getElementById("show-search").style.display = "block";

    document.getElementById("show-select").style.display = "none";
    document.getElementById("episode-select").style.display = "none";
    document.getElementById("search-input").style.display = "none";
    document.getElementById("back-button").style.display = "none";

    document.getElementById("root").innerHTML = "";
  });
}

// MAIN SETUP
async function setup() {
  allShows = await fetchShow();

  renderShowList(allShows);
  setupShowSearch();
  setupBackButton();
}

window.onload = setup;


