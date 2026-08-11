//You can edit ALL of the code here
const state = {
  episodes: [],
  searchTerm: "",
  selectedEpisode: null,
  cachedEpisodes: {},
};

const elements = {};
// Fetch shows from the TVMaze
function fetchShows() {
  return fetch("https://api.tvmaze.com/shows").then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

// Fetch episodes from the TVMaze API
function fetchEpisodes() {
  return fetch("https://api.tvmaze.com/shows/82/episodes").then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

// Setup function to initialize the application
function setup() {
  elements.searchInput = document.getElementById("episode-search");
  elements.episodeSelect = document.getElementById("episode-selector");
  elements.episodeCount = document.getElementById("episode-count");
  elements.root = document.getElementById("root");

  elements.root.innerHTML = `<div class="loading">Loading episodes...</div>`;

  //Shows
  fetchShows()
    .then((shows) => {
      state.shows = shows;

      state.shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );

      createShowOptions();
      setupShowSelector();
    })
    .catch((error) => {
      console.error("Failed to load shows:", error);
    });

  fetchEpisodes()
    .then((episodes) => {
      state.episodes = episodes;
      createEpisodeOptions();
      setupSearch();
      setupSelector();
      render();
    })
    .catch((error) => {
      elements.root.innerHTML = `<div class="error">Failed to load episodes.</div>`;
      console.error(error);
    });
}
// create options for the shows selector dropdown
function createShowOptions() {
  const showSelect = document.getElementById("show-selector");

  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Show";
  showSelect.appendChild(defaultOption);

  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

// Create options for the episode selector dropdown
function createEpisodeOptions() {
  elements.episodeSelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All Episodes";
  elements.episodeSelect.appendChild(allOption);
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
function setupSearch() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = elements.searchInput.value.toLowerCase();
    state.selectedEpisode = null;
    elements.episodeSelect.value = "";
    render();
  });
}

// Setup Event listener for Shows
function setupShowSelector() {
  const showSelect = document.getElementById("show-selector");
  showSelect.addEventListener("change", async (event) => {
    const showId = event.target.value;

    if (state.cachedEpisodes[showId]) {
      state.episodes = state.cachedEpisodes[showId];
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      const episodes = await response.json();
      state.cachedEpisodes[showId] = episodes;
      state.episodes = episodes;
    }

    state.searchTerm = "";
    state.selectedEpisode = null;
    elements.searchInput.value = "";
    elements.episodeSelect.value = "";

    createEpisodeOptions();
    render();
  });
}

// Setup episode selector event listener
function setupSelector() {
  elements.episodeSelect.addEventListener("change", (event) => {
    state.selectedEpisode =
      event.target.value === "" ? null : Number(event.target.value);
    state.searchTerm = "";
    elements.searchInput.value = "";
    render();
  });
}

// Get the episodes to be displayed based on search term or selected episode
function getDisplayedEpisodes() {
  const displayedEpisodes =
    state.selectedEpisode !== null
      ? [state.episodes.find((e) => e.id === state.selectedEpisode)]
      : state.episodes.filter(
          (episode) =>
            episode.name.toLowerCase().includes(state.searchTerm) ||
            episode.summary?.toLowerCase().includes(state.searchTerm),
        );
  return displayedEpisodes;
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
