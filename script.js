//You can edit ALL of the code here
const state = {
  episodes: [],
  shows: [],
  searchTerm: "",
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
  elements.searchInput = document.getElementById("episode-search");
  elements.showSelect = document.getElementById("show-selector");
  elements.episodeSelect = document.getElementById("episode-selector");
  elements.episodeCount = document.getElementById("episode-count");
  elements.root = document.getElementById("root");
  elements.root.innerHTML = `<div class="loading">Loading shows...</div>`;

  //Shows
  fetchShows()
    .then((shows) => {
      state.shows = shows;
      createShowOptions();
      createEpisodeOptions();
      elements.searchInput.addEventListener("input", setupSearch);
      elements.episodeSelect.addEventListener("change", setupEpisodeSelector);
      elements.showSelect.addEventListener("change", setupShowSelector);
      render();
    })
    .catch((error) => {
      console.error("Failed to load shows:", error);
    });
}

// create options for the shows selector dropdown
function createShowOptions() {
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "---Select Show---";
  elements.showSelect.appendChild(defaultOption);
  state.shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    elements.showSelect.appendChild(option);
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

// Setup search input event listener
function setupSearch(event) {
  state.searchTerm = event.target.value.toLowerCase();
  state.selectedEpisode = null;
  elements.episodeSelect.value = "";
  render();
}

// Setup Event listener for Shows
function setupShowSelector(event) {
  state.searchTerm = "";
  state.selectedEpisode = null;
  elements.searchInput.value = "";
  state.episodes = [];
  state.selectedShow =
    event.target.value === "" ? null : Number(event.target.value);

  if (state.selectedShow === null) {
    createEpisodeOptions();
    render();
    return;
  }

  if (state.cachedEpisodes[state.selectedShow]) {
    state.episodes = state.cachedEpisodes[state.selectedShow];
    createEpisodeOptions();
    render();
    return;
  }

  fetchEpisodes(state.selectedShow)
    .then((episodes) => {
      state.episodes = episodes;
      state.cachedEpisodes[state.selectedShow] = episodes;
      createEpisodeOptions();
      render();
    })
    .catch(() => {
      elements.root.textContent = "Error loading episodes. Please try again.";
      console.error("Failed to load episodes:", error);
    });
}

// Setup episode selector event listener
function setupEpisodeSelector(event) {
  state.selectedEpisode =
    event.target.value === "" ? null : Number(event.target.value);
  state.searchTerm = "";
  elements.searchInput.value = "";
  render();
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
  if (state.searchTerm !== "") {
    return state.episodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(state.searchTerm) ||
        episode.summary?.toLowerCase().includes(state.searchTerm),
    );
  }
  return state.episodes;
}

// Render the episodes to the DOM
function render() {
  const displayedEpisodes = getDisplayedEpisodes();
  elements.episodeCount.textContent = `Displaying ${displayedEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = displayedEpisodes.map(createEpisodeCard);
  elements.root.replaceChildren(...cards);
}

// Create a card element for an episode
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
  summaryElement.innerHTML = summary;
  episodeCard.append(title, img, summaryElement, aElement);

  return episodeCard;
}

// Format the episode code as SxxExx
function formatEpisodeCode(season, number) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(number).padStart(2, "0");
  return `S${seasonCode}E${episodeCode}`;
}

// Initialize the application when the window loads
window.onload = setup;
