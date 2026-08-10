let allEpisodes = [];
let allShows = [];
const cache = {}; // Rule 6: In-memory cache to prevent duplicate fetches

async function setup() {
  addTvmazeAttribution();
  showLoading("Loading shows, please wait...");

  try {
    // 1. Fetch all shows on page load (cached)
    allShows = await fetchWithCache("https://api.tvmaze.com/shows");

    // Rule 5: Sort shows alphabetically, case-insensitive
    allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    // Clear root and create UI controls
    const rootElem = document.getElementById("root");
    rootElem.innerHTML = "";
    createControls();

    // Select the first show in the list by default
    if (allShows.length > 0) {
      const showSelect = document.getElementById("show-select");
      showSelect.value = allShows[0].id;
      await loadEpisodesForShow(allShows[0].id);
    }
  } catch (error) {
    showError("Failed to load TV shows. Please try again later.");
  }
}

// Helper function to handle cached fetches (Rule 6)
async function fetchWithCache(url) {
  if (cache[url]) {
    return cache[url];
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  cache[url] = data;
  return data;
}

// Fetch and load episodes for a selected show ID
async function loadEpisodesForShow(showId) {
  showLoading("Loading episodes, please wait...");

  try {
    const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
    allEpisodes = await fetchWithCache(url);

    // Reset controls
    populateEpisodeSelect(allEpisodes);
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";

    makePageForEpisodes(allEpisodes);
  } catch (error) {
    showError("Failed to load episode data. Please try again later.");
  }
}

function showLoading(message = "Loading, please wait...") {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

function showError(message) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `
    <div class="error-container">
      <h3>Something went wrong</h3>
      <p>${message}</p>
    </div>
  `;
}

function createControls() {
  const rootElem = document.getElementById("root");

  // Prevent duplicate control bars on re-render
  if (document.querySelector(".controls-container")) return;

  const controlsContainer = document.createElement("div");
  controlsContainer.className = "controls-container";

  // 1. Show Select Dropdown
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // 2. Episode Select Dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  // 3. Search Input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  // 4. Count Display
  const countDisplay = document.createElement("span");
  countDisplay.id = "search-count";

  controlsContainer.appendChild(showSelect);
  controlsContainer.appendChild(episodeSelect);
  controlsContainer.appendChild(searchInput);
  controlsContainer.appendChild(countDisplay);

  rootElem.parentNode.insertBefore(controlsContainer, rootElem);

  // Event Listeners
  showSelect.addEventListener("change", handleShowChange);
  episodeSelect.addEventListener("change", handleSelect);
  searchInput.addEventListener("input", handleSearch);
}

// Handler when user selects a different TV show
async function handleShowChange(event) {
  const showId = event.target.value;
  if (showId) {
    await loadEpisodesForShow(showId);
  }
}

// Populates/Updates the episode dropdown options
function populateEpisodeSelect(episodes) {
  const episodeSelect = document.getElementById("episode-select");
  if (!episodeSelect) return;

  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "All Episodes";
  episodeSelect.appendChild(defaultOption);

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    const code = formatEpisodeCode(episode.season, episode.number);
    option.textContent = `${code} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

function handleSelect(event) {
  const selectedId = event.target.value;
  const searchInput = document.getElementById("search-input");

  if (searchInput) searchInput.value = "";

  if (selectedId === "ALL") {
    makePageForEpisodes(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes.filter(
      (episode) => String(episode.id) === String(selectedId),
    );
    makePageForEpisodes(selectedEpisode);
  }
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const episodeSelect = document.getElementById("episode-select");

  if (episodeSelect) episodeSelect.value = "ALL";

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const nameMatches = episode.name.toLowerCase().includes(searchTerm);
    const summaryMatches = (episode.summary || "")
      .toLowerCase()
      .includes(searchTerm);

    return nameMatches || summaryMatches;
  });

  makePageForEpisodes(filteredEpisodes);
}

function updateSearchCount(matchCount, totalCount) {
  const countDisplay = document.getElementById("search-count");
  if (countDisplay) {
    countDisplay.textContent = `Displaying ${matchCount}/${totalCount} episodes`;
  }
}

function formatEpisodeCode(season, number) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  if (episodeList.length === 0) {
    rootElem.innerHTML = "<p>No episodes found matching your criteria.</p>";
    updateSearchCount(0, allEpisodes.length);
    return;
  }

  const container = document.createElement("div");
  container.className = "episodes-container";

  episodeList.forEach((episode) => {
    const card = document.createElement("section");
    card.className = "episode-card";

    const title = document.createElement("h3");
    const code = formatEpisodeCode(episode.season, episode.number);
    title.textContent = `${episode.name} - ${code}`;
    card.appendChild(title);

    if (episode.image && episode.image.medium) {
      const img = document.createElement("img");
      img.src = episode.image.medium;
      img.alt = episode.name;
      card.appendChild(img);
    }

    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "<p>No summary available.</p>";
    card.appendChild(summary);

    container.appendChild(card);
  });

  rootElem.appendChild(container);
  updateSearchCount(episodeList.length, allEpisodes.length);
}

function addTvmazeAttribution() {
  if (document.getElementById("tvmaze-attribution")) return;

  const footer = document.createElement("footer");
  footer.id = "tvmaze-attribution";
  footer.innerHTML = `
    <p>Data provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a></p>
  `;
  document.body.appendChild(footer);
}

window.onload = setup;
