// -----------------------------------------------------
// STATE
// -----------------------------------------------------
const state = {
  allShows: [],
  selectedShowId: "",
  allEpisodes: [],

  showSearchTerm: "",
  episodeSearchTerm: "",
  selectedEpisodeId: "all",

  currentView: "shows",

  cache: {},
};

// -----------------------------------------------------
// ENDPOINT
// -----------------------------------------------------
const showsEndpoint = "https://api.tvmaze.com/shows";

// -----------------------------------------------------
// DOM ELEMENTS
// -----------------------------------------------------
const episodeSearchInput = document.getElementById("episode-search");
const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");
const showTemplate = document.getElementById("show-card");
const episodeTemplate = document.getElementById("episode-card");
const showsView = document.getElementById("shows-view");
const episodesView = document.getElementById("episodes-view");
const showsContainer = document.getElementById("shows-container");
const episodesContainer = document.getElementById("episodes-container");
const showSearchInput = document.getElementById("show-search");
const backToShowsBtn = document.getElementById("back-to-shows-btn");
const showCountDisplay = document.getElementById("show-count-result");
const episodeCountDisplay = document.getElementById("episode-count-result");
// -----------------------------------------------------
// SETUP & FETCH WITH CACHE
// -----------------------------------------------------

async function fetchWithCache(url) {
  if (state.cache[url]) {
    return state.cache[url];
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const data = await response.json();
  state.cache[url] = data;
  return data;
}

async function fetchShows() {
  const shows = await fetchWithCache(showsEndpoint);
  // Sort shows alphabetically
  return shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

async function fetchEpisodesForShow(showId) {
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  return await fetchWithCache(url);
}

async function selectShow(showId) {
  state.selectedShowId = String(showId);
  showSelect.value = String(showId);

  state.currentView = "episodes";
  showsView.hidden = true;
  episodesView.hidden = false;

  // Reset search and episode dropdown state
  state.episodeSearchTerm = "";
  episodeSearchInput.value = "";
  state.selectedEpisodeId = "all";
  episodeSelect.value = "all";

  episodesContainer.textContent = "Loading episodes...";

  try {
    state.allEpisodes = await fetchEpisodesForShow(showId);
    populateEpisodeSelect(state.allEpisodes);
    renderEpisodes();
  } catch (error) {
    episodesContainer.textContent = "Error loading episodes";
  }
}

async function setup() {
  try {
    showsContainer.textContent = "Loading shows...";

    showsView.hidden = false;
    episodesView.hidden = true;

    state.allShows = await fetchShows();
    populateShowSelect(state.allShows);
    renderShows();
  } catch (error) {
    showsContainer.textContent = "Error loading page";
  }
}

// -----------------------------------------------------
// SHOW & EPISODE DROPDOWNS
// -----------------------------------------------------
function populateShowSelect(shows) {
  const optionsHtml = shows
    .map((show) => `<option value="${show.id}">${show.name}</option>`)
    .join("");

  showSelect.innerHTML =
    '<option value="all">Show all shows</option>' + optionsHtml;
}

function populateEpisodeSelect(episodes) {
  const optionsHtml = episodes
    .map((episode) => {
      const episodeCode = makeEpisodeCode(episode.season, episode.number);
      const optionText = `${episodeCode} - ${episode.name}`;
      return `<option value="${episode.id}">${optionText}</option>`;
    })
    .join("");

  episodeSelect.innerHTML =
    '<option value="all">Show all episodes</option>' + optionsHtml;
}

// -----------------------------------------------------
// RENDER SHOWS
// -----------------------------------------------------
function renderShows() {
  const searchTerm = state.showSearchTerm.toLowerCase();

  const filteredShows = state.allShows.filter((show) => {
    const showName = show.name ? show.name.toLowerCase() : "";
    const showSummary = show.summary ? show.summary.toLowerCase() : "";
    const showGenres = show.genres.join(" ").toLowerCase();

    return (
      showName.includes(searchTerm) ||
      showSummary.includes(searchTerm) ||
      showGenres.includes(searchTerm)
    );
  });

  showsContainer.innerHTML = "";

  const showCards = filteredShows.map(createShowCard);

  showsContainer.append(...showCards);

  showCountDisplay.textContent = `${filteredShows.length}/${state.allShows.length}`;
}
// -----------------------------------------------------
// FILTER & RENDER EPISODES
// -----------------------------------------------------

function renderEpisodes() {
  const episodeSearchTerm = state.episodeSearchTerm.toLowerCase();

  const filteredEpisodes = state.allEpisodes.filter((episode) => {
    if (
      state.selectedEpisodeId !== "all" &&
      String(episode.id) !== state.selectedEpisodeId
    ) {
      return false;
    }
    const episodeName = episode.name ? episode.name.toLowerCase() : "";
    const episodeSummary = episode.summary ? episode.summary.toLowerCase() : "";

    return (
      episodeName.includes(episodeSearchTerm) ||
      episodeSummary.includes(episodeSearchTerm)
    );
  });
  makePageForEpisodes(filteredEpisodes);
}

// -----------------------------------------------------
// SHOW GENERATION
// -----------------------------------------------------
function createShowCard(show) {
  const card = showTemplate.content.cloneNode(true);

  const showNameBtn = card.querySelector("[data-show-name]");
  showNameBtn.textContent = show.name;
  showNameBtn.dataset.showId = show.id;

  const image = card.querySelector("img");

  const hasImg = show.image?.medium;
  image.src = hasImg ? show.image.medium : "";
  image.alt = hasImg
    ? `Scene from ${show.name}`
    : `No images available for ${show.name}`;

  card.querySelector("[data-show-summary]").innerHTML = show.summary
    ? show.summary.replace(/<p>/gi, "").replace(/<\/p>/gi, "")
    : "No summary available";

  card.querySelector("[data-show-genres]").textContent =
    `Genres: ${show.genres.length > 0 ? show.genres.join(", ") : "No genres listed"}`;

  card.querySelector("[data-show-status]").textContent =
    `Status: ${show.status || "N/A"}`;

  card.querySelector("[data-show-rating]").textContent =
    `Rating: ${show.rating?.average || "N/A"} `;

  const runtimeText = show.runtime ? `${show.runtime} minutes` : "N/A";
  card.querySelector("[data-show-runtime]").textContent =
    `Runtime: ${runtimeText}`;

  return card;
}

// -----------------------------------------------------
// CARD GENERATION
// -----------------------------------------------------

// EPISODE CODE
function makeEpisodeCode(season, episodeNumber) {
  season = String(season).padStart(2, "0");
  episodeNumber = String(episodeNumber).padStart(2, "0");
  return "S" + season + "E" + episodeNumber;
}

function createEpisodeCard(episode) {
  const card = episodeTemplate.content.cloneNode(true);

  card.querySelector("h2").textContent = episode.name;

  const episodeNumber = makeEpisodeCode(episode.season, episode.number);
  card.querySelector("[data-episode-number]").textContent = episodeNumber;

  const image = card.querySelector("img");
  const hasImg = episode.image?.medium;

  image.src = hasImg ? episode.image.medium : "";
  image.alt = hasImg
    ? `Scene from ${episodeNumber}, ${episode.name}`
    : `No images available for ${episode.name}`;

  card.querySelector("[data-summary]").innerHTML = episode.summary
    ? episode.summary.replace(/<p>/gi, "").replace(/<\/p>/gi, "")
    : "No summary available.";

  return card;
}

// -----------------------------------------------------
// PAGE DISPLAY
// -----------------------------------------------------

function makePageForEpisodes(episodeList) {
  episodesContainer.innerHTML = "";

  const episodeCards = episodeList.map(createEpisodeCard);
  episodesContainer.append(...episodeCards);

  episodeCountDisplay.textContent = `${episodeList.length}/${state.allEpisodes.length}`;
}

// -----------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------

showsContainer.addEventListener("click", (event) => {
  const showId = event.target.dataset.showId;

  if (showId) {
    selectShow(showId);
  }
});

backToShowsBtn.addEventListener("click", () => {
  state.currentView = "shows";
  showSelect.value = "all";

  episodesView.hidden = true;
  showsView.hidden = false;
});
episodeSearchInput.addEventListener("input", (event) => {
  state.episodeSearchTerm = event.target.value;

  state.selectedEpisodeId = "all";
  episodeSelect.value = "all";

  renderEpisodes();
});

showSelect.addEventListener("change", (event) => {
  const selectedShow = event.target.value;

  if (selectedShow === "all") {
    state.currentView = "shows";
    episodeView.hidden = true;
    showsView.hidden = false;
  } else {
    selectShow(selectedShow);
  }
});

episodeSelect.addEventListener("change", (event) => {
  state.selectedEpisodeId = event.target.value;

  state.episodeSearchTerm = "";
  episodeSearchInput.value = "";

  renderEpisodes();
});

showSearchInput.addEventListener("input", (event) => {
  state.showSearchTerm = event.target.value;

  renderShows();
});
// -----------------------------------------------------
// START APPLICATION
// -----------------------------------------------------
window.onload = setup;
