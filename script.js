//You can edit ALL of the code here
const state = {
  episodes: [],
  shows: [],
  searchTermEpisode: "",
  searchTermShow: "",
  selectedEpisode: null,
  selectedShow: null,
  cachedEpisodes: {},
};

const elements = {};

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

// Fetch shows from the TVMaze

function fetchEpisodes(showId) {
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then(checkStatus)
    .then((response) => response.json());
}

function fetchShows() {
  return fetch("https://api.tvmaze.com/shows")
    .then(checkStatus)
    .then((response) => response.json());
}

// Setup function to initialize the application
function setup() {
  elements.episodeSearchInput = document.getElementById("episode-search");
  elements.showSearchInput = document.getElementById("show-search");
  elements.episodeSelect = document.getElementById("episode-selector");
  elements.showSelect = document.getElementById("show-selector");
  elements.episodeCount = document.getElementById("episode-count");
  elements.showSelectorLabel = document.querySelector(
    'label[for="show-selector"]',
  );
  elements.selectedShow = document.getElementById("selected-show");
  elements.episodeList = document.getElementById("episode-list");
  elements.showList = document.getElementById("show-list");

  elements.showsView = document.getElementById("shows-view");
  elements.episodesView = document.getElementById("episodes-view");
  elements.backToShows = document.getElementById("back-to-shows");
  elements.episodesView.style.display = "none";

  elements.showList.innerHTML = `<div class="loading">Loading shows...</div>`;

  //Shows
  fetchShows()
    .then((shows) => {
      state.shows = shows;
      state.shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
      elements.showSearchInput.addEventListener("input", handleShowSearch);
      elements.episodeSearchInput.addEventListener(
        "input",
        handleEpisodeSearch,
      );
      elements.episodeSelect.addEventListener("change", handleEpisodeSelection);
      elements.showSelect.addEventListener("change", handleShowSelection);
      elements.backToShows.addEventListener("click", handleBackToShows);
      renderShows();
    })
    .catch((error) => {
      console.error("Failed to load shows:", error);
    });
}

// Create options for the episode selector dropdown
function createEpisodeOptions() {
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "---All Episodes---";
  elements.episodeSelect.replaceChildren(allOption);
  state.episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number,
    )} - ${episode.name}`;

    elements.episodeSelect.appendChild(option);
  });
}

// create options for the shows selector dropdown
function createShowOptions(filteredShowList) {
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "---Select Show---";
  elements.showSelect.replaceChildren(defaultOption);
  filteredShowList.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    elements.showSelect.appendChild(option);
  });
}

// Setup search input event listener
function handleEpisodeSearch(event) {
  state.searchTermEpisode = event.target.value.toLowerCase();
  state.selectedEpisode = null;
  elements.episodeSelect.value = "";
  renderEpisodes();
}

function handleShowSearch(event) {
  state.searchTermShow = event.target.value.toLowerCase();
  state.selectedShow = null;
  elements.showSelect.value = "";
  renderShows();
}

// Setup episode selector event listener
function handleEpisodeSelection(event) {
  state.selectedEpisode =
    event.target.value === "" ? null : Number(event.target.value);
  state.searchTermEpisode = "";
  elements.episodeSearchInput.value = "";
  renderEpisodes();
}

// Setup episode selector event listener
function handleShowSelection(event) {
  state.selectedShow =
    event.target.value === "" ? null : Number(event.target.value);
  renderShows();
}

// Setup Event listener for Shows
function selectShow(showId) {
  switchToEpisodesView();
  state.selectedShow = Number(showId);

  if (state.cachedEpisodes[state.selectedShow]) {
    state.episodes = state.cachedEpisodes[state.selectedShow];
    createEpisodeOptions();
    renderEpisodes();
    return;
  }

  fetchEpisodes(state.selectedShow)
    .then((episodes) => {
      state.episodes = episodes;
      state.cachedEpisodes[state.selectedShow] = episodes;
      createEpisodeOptions();
      renderEpisodes();
    })
    .catch((error) => {
      elements.episodeList.textContent =
        "Error loading episodes. Please try again.";
      console.error("Failed to load episodes:", error);
    });
}

function handleBackToShows() {
  switchToShowsView();
  renderShows();
}

// Get the episodes to be displayed based on search term or selected episode
function getDisplayedEpisodes() {
  if (state.selectedEpisode !== null) {
    return [
      state.episodes.find((episode) => episode.id === state.selectedEpisode),
    ];
  }
  if (state.selectedShow === null) {
    return [];
  }
  if (state.searchTermEpisode !== "") {
    return state.episodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(state.searchTermEpisode) ||
        episode.summary?.toLowerCase().includes(state.searchTermEpisode),
    );
  }
  return state.episodes;
}

function getDisplayedShows() {
  let displayedShows;
  if (state.selectedShow !== null) {
    displayedShows = [
      state.shows.find((show) => show.id === state.selectedShow),
    ];
  } else {
    displayedShows = state.shows.filter(
      (show) =>
        show.name.toLowerCase().includes(state.searchTermShow) ||
        show.summary?.toLowerCase().includes(state.searchTermShow) ||
        show.genres.includes(state.searchTermShow),
    );
    createShowOptions(displayedShows);
    elements.showSelectorLabel.textContent = `Found ${displayedShows.length} shows`;
  }
  return displayedShows;
}

// Render the episodes to the DOM
function renderEpisodes() {
  const selectedShow = findSelectedShowName();

  elements.selectedShow.textContent = selectedShow ? selectedShow.name : "";

  const displayedEpisodes = getDisplayedEpisodes();
  elements.episodeCount.textContent = `Displaying ${displayedEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = displayedEpisodes.map(createEpisodeCard);
  elements.episodeList.replaceChildren(...cards);
}

// Render the shows to the DOM
function renderShows() {
  const displayedShows = getDisplayedShows();
  const showCards = displayedShows.map(createShowCard);
  elements.showList.replaceChildren(...showCards);
}

// Create a card element for a show
function createEpisodeCard({ url, name, season, number, image, summary }) {
  const episodeCard = document.createElement("article");

  const title = document.createElement("h2");
  title.textContent = name + ` - ${formatEpisodeCode(season, number)}`;

  const img = document.createElement("img");
  img.src = image?.medium || "";
  img.alt = `${name} episode image`;
  img.width = 210;
  img.height = 118;
  img.loading = "lazy";

  const aElement = document.createElement("a");
  aElement.href = url;
  aElement.textContent = "View on TVMaze";
  aElement.target = "_blank";
  aElement.rel = "noopener noreferrer";

  const summaryElement = document.createElement("div");
  summaryElement.classList.add("summary");
  summaryElement.innerHTML = summary || "No summary available.";
  episodeCard.append(title, img, summaryElement, aElement);

  return episodeCard;
}

// Create a card element for an episode
function createShowCard({
  id,
  name,
  image,
  summary,
  genres,
  status,
  rating,
  runtime,
}) {
  const showCard = document.createElement("article");
  showCard.classList.add("show-card");
  showCard.addEventListener("click", () => {
    selectShow(id);
  });

  const title = document.createElement("h2");
  title.textContent = name;

  const showContent = document.createElement("div");
  showContent.classList.add("show-content");

  const showImage = document.createElement("div");
  showImage.classList.add("show-image");
  const img = document.createElement("img");
  img.src = image?.medium || "";
  img.alt = `${name} show image`;
  img.width = 210;
  img.height = 118;
  img.loading = "lazy";
  showImage.append(img);

  const showSummary = document.createElement("div");
  showSummary.classList.add("show-summary");
  const summaryElement = document.createElement("div");
  summaryElement.classList.add("summary");
  summaryElement.innerHTML = summary || "No summary available.";
  showSummary.append(summaryElement);

  const showDetails = document.createElement("div");
  showDetails.classList.add("show-details");
  const ratingElement = document.createElement("p");
  ratingElement.textContent = `Rated : ${rating.average}`;
  const genresElement = document.createElement("p");
  genresElement.textContent = `Genres : ${genres}`;
  const statusElement = document.createElement("p");
  statusElement.textContent = `Status : ${status}`;
  const runTimeElement = document.createElement("p");
  runTimeElement.textContent = `Runtime : ${runtime}`;
  showDetails.append(
    ratingElement,
    genresElement,
    statusElement,
    runTimeElement,
  );

  showContent.append(showImage, showSummary, showDetails);
  showCard.append(title, showContent);

  return showCard;
}

// Format the episode code as SxxExx
function formatEpisodeCode(season, number) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(number).padStart(2, "0");
  return `S${seasonCode}E${episodeCode}`;
}

function switchToShowsView() {
  elements.showSearchInput.value = "";
  elements.episodeSearchInput.value = "";
  elements.episodeSelect.value = "";

  state.searchTermShow = "";
  state.searchTermEpisode = "";
  state.selectedEpisode = null;
  state.selectedShow = null;
  state.episodes = [];

  elements.episodesView.style.display = "none";
  elements.showsView.style.display = "block";
}

function switchToEpisodesView() {
  elements.showSearchInput.value = "";
  elements.episodeSelect.value = "";

  state.searchTermShow = "";

  elements.showsView.style.display = "none";
  elements.episodesView.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function findSelectedShowName() {
  return state.shows.find((show) => show.id === state.selectedShow);
}

// Initialize the application when the window loads
window.onload = setup;
