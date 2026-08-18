// You can edit ALL of the code here
const showsControls = document.querySelector(".shows-controls");
const episodeGrid = document.getElementById("film-grid");
const singleEpisodeContainer = document.querySelector(".single-film-grid");
const filterDisplay = document.querySelector(".filter-display");
const searchArea = document.querySelector(".search-area");
const episodeSelect = document.getElementById("film-select");
const showSelect = document.getElementById("show-select");
const searchInput = document.getElementById("film-search");
const exitButton = document.querySelector(".exit");
const API_SHOW_URL = "https://api.tvmaze.com/shows";

let showsCache = null;
let showsPromise = null;
const episodesCache = new Map();
const episodesPromises = new Map();

const state = {
  query: "",
  episodes: [],
  shows: [],
  selectedShowId: 124,
  selectedEpisode: {},
};

function showMessage(message, duration = 3000) {
  const existingMessage = document.querySelector(".app-message");
  if (existingMessage) existingMessage.remove();

  const messageBox = document.createElement("div");
  messageBox.className = "app-message";
  messageBox.textContent = message;
  document.body.appendChild(messageBox);

  setTimeout(() => {
    messageBox.remove();
  }, duration);
}

function clearMessage() {
  document.querySelector(".app-message")?.remove();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function fetchShows() {
  if (showsCache) return showsCache;

  if (!showsPromise) {
    showsPromise = fetchJson(API_SHOW_URL).then((data) => {
      showsCache = data;
      return showsCache;
    });
  }

  return showsPromise;
}
function createShowCard(show) {
  const card = document.createElement("section");
  card.className = "show-card";
  card.innerHTML = `
    <h3>${show.name}</h3>
    <img src="${show.image?.medium || ""}" alt=" ${show.name}">
    <p>${show.summary || ""}</p>
    <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
    <p><strong>Status:</strong> ${show.status}</p>
    <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
    <p><strong>Runtime:</strong> ${show.runtime} minutes</p>
  `;
  card.addEventListener("click", () => {
    showEpisodesView(show.id);
  });
  return card;
}

function renderShowsListing() {
  const showsContainer = document.querySelector(".shows-listing");
  showsContainer.innerHTML = "";
  state.shows.forEach((show) => {
    const card = createShowCard(show);
    showsContainer.append(card);
  });
}

function showEpisodesView(showId) {
  document.querySelector(".shows-listing").classList.add("hidden");
  showsControls.classList.add("hidden");

  searchArea.classList.remove("hidden");
  episodeGrid.classList.remove("hidden");
  singleEpisodeContainer.classList.add("hidden");

  document.querySelector(".back-to-shows").classList.remove("hidden");

  state.selectedShowId = showId;
  loadEpisodes(showId);
}
function renderFilteredShows(filteredShows) {
  const showsContainer = document.querySelector(".shows-listing");
  showsContainer.innerHTML = "";

  filteredShows.forEach((show) => {
    const card = createShowCard(show);
    showsContainer.append(card);
  });
}

async function fetchEpisodes(showId = state.selectedShowId) {
  if (episodesCache.has(showId)) {
    return episodesCache.get(showId);
  }

  if (!episodesPromises.has(showId)) {
    const promise = fetchJson(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    ).then((data) => {
      episodesCache.set(showId, data);
      return data;
    });

    episodesPromises.set(showId, promise);
  }

  return episodesPromises.get(showId);
}

async function setup() {
  showMessage("Loading shows...", 1000);

  try {
    const fetchedShows = await fetchShows();
    state.shows = fetchedShows;
    showsControls.classList.remove("hidden");

    renderShowsListing();
    searchArea.classList.add("hidden");
    episodeGrid.classList.add("hidden");
    singleEpisodeContainer.classList.add("hidden");

    populateShowSelect();
    clearMessage();
    showMessage("Shows loaded", 1500);
  } catch (error) {
    console.error("Failed to load shows:", error);
    showMessage("Sorry, we could not load the shows right now.");
  }
}

async function loadEpisodes(showId = state.selectedShowId) {
  showMessage("Loading episodes...", 1000);
  try {
    const fetchedEpisodes = await fetchEpisodes(showId);
    state.episodes = fetchedEpisodes;
    renderEpisodes();
    populateEpisodeSelect();
    clearMessage();
    showMessage("Episodes loaded", 1500);
  } catch (error) {
    console.error("Failed to load episodes:", error);
    showMessage("Sorry, we could not load the episodes right now.");
  }
}

function populateShowOption(show) {
  const option = document.createElement("option");
  const { id, name } = show;
  option.value = String(id);
  option.textContent = name;
  return option;
}

function populateShowSelect() {
  const sortedShows = state.shows
    .map(({ id, name }) => ({ id, name }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

  showSelect.innerHTML = '<option value="">Select a show</option>';
  showSelect.append(...sortedShows.map(populateShowOption));

  if (sortedShows.length > 0) {
    const firstShowId = sortedShows[0].id;
    state.selectedShowId = firstShowId;
    showSelect.value = state.selectedShowId;
  }
}

function formatEpisodeCode(prefix, value) {
  return `${prefix}${String(value).padStart(2, "0")}`;
}

function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("film-card-template")
    .content.cloneNode(true);

  const title = episodeCard.querySelector("h3");
  const episodeImage = episodeCard.querySelector("img");
  const episodeSummary = episodeCard.querySelector("p");

  title.innerText = `${episode.name} - ${formatEpisodeCode(
    "S",
    episode.season
  )}${formatEpisodeCode("E", episode.number)}`;
  episodeImage.src = episode.image?.medium || "";
  episodeImage.alt = episode.name || "episode image";
  episodeSummary.innerHTML = episode.summary || "";

  return episodeCard;
}

function renderEpisodes() {
  const rootElem = episodeGrid;
  rootElem.innerHTML = "";

  const { query, episodes } = state;
  const normalisedQuery = query.trim().toLowerCase();

  const filteredEpisodes = episodes.filter((episode) => {
    const name = episode.name?.toLowerCase() || "";
    const summary = episode.summary?.toLowerCase() || "";
    return name.includes(normalisedQuery) || summary.includes(normalisedQuery);
  });

  const episodeList = normalisedQuery === "" ? episodes : filteredEpisodes;

  filterDisplay.innerText = `Displaying ${episodeList.length}/${episodes.length}`;

  rootElem.append(...episodeList.map(createEpisodeCard));
}

function populateEpisodeOption(episode) {
  const option = document.createElement("option");
  const { id, season, number, name } = episode;
  const seasonEpisodeDetails = `${formatEpisodeCode(
    "S",
    season
  )}${formatEpisodeCode("E", number)}`;
  option.value = String(id);
  option.textContent = `${seasonEpisodeDetails} - ${name}`;
  return option;
}

function populateEpisodeSelect() {
  episodeSelect.innerHTML = '<option value="">Select an episode</option>';
  episodeSelect.append(...state.episodes.map(populateEpisodeOption));
}

function displaySelectedEpisode() {
  const singleEpisodeContent = document.querySelector(".show-single-film");
  const chosenEpisode = createEpisodeCard(state.selectedEpisode);

  singleEpisodeContent.innerHTML = "";
  state.selectedEpisode = {};
  singleEpisodeContent.append(chosenEpisode);

  singleEpisodeContainer.classList.remove("hidden");
  searchArea.classList.add("hidden");
  episodeGrid.classList.add("hidden");
}

// EVENT HANDLERS
searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderEpisodes();
});

episodeSelect.addEventListener("change", (event) => {
  const selectedValue = event.target.value.trim();
  if (!selectedValue) return;

  state.selectedEpisode =
    state.episodes.find((episode) => episode.id === Number(selectedValue)) ||
    {};
  event.target.value = "";
  displaySelectedEpisode();
});
exitButton.addEventListener("click", () => {
  singleEpisodeContainer.classList.add("hidden");
  searchArea.classList.remove("hidden");
  episodeGrid.classList.remove("hidden");
});
const showSearchInput = document.getElementById("show-search");

showSearchInput.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase().trim();

  const filteredShows = state.shows.filter((show) => {
    const name = show.name.toLowerCase();
    const summary = show.summary?.toLowerCase() || "";
    const genres = show.genres.join(" ").toLowerCase();
    return (
      name.includes(query) || summary.includes(query) || genres.includes(query)
    );
  });

  renderFilteredShows(filteredShows);
});

showSelect.addEventListener("change", async (event) => {
  const selectedValue = event.target.value.trim();
  if (!selectedValue) return;

  showEpisodesView(Number(selectedValue));
});

document.querySelector(".back-to-shows").addEventListener("click", () => {
  // show shows page
  document.querySelector(".shows-listing").classList.remove("hidden");
  showsControls.classList.remove("hidden");

  // hide episodes page
  searchArea.classList.add("hidden");
  episodeGrid.classList.add("hidden");
  singleEpisodeContainer.classList.add("hidden");

  // hide back button
  document.querySelector(".back-to-shows").classList.add("hidden");
});

window.onload = setup;
