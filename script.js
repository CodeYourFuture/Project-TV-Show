// You can edit ALL of the code here
let allEpisodes = [];
let allShows = [];
const episodesCache = {}; // Requirement 6: Cache fetched shows to prevent duplicate API calls

async function setup() {
  addTvmazeAttribution();
  showLoading();

  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const showsData = await response.json();

    // Alphabetical sort (case-insensitive)
    allShows = showsData.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    const rootElem = document.getElementById("root");
    rootElem.innerHTML = "";

    createControls();

    // Load first show automatically
    if (allShows.length > 0) {
      await loadEpisodesForShow(allShows[0].id);
    }
  } catch (error) {
    showError("Failed to load show data. Please try again later.");
  }
}

function showLoading() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading data, please wait...</p>
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

  const controlsContainer = document.createElement("div");
  controlsContainer.className = "controls-container";

  // Show Select Dropdown
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  // Episode Select Dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  // Search Input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  // Count Display
  const countDisplay = document.createElement("span");
  countDisplay.id = "search-count";

  controlsContainer.appendChild(showSelect);
  controlsContainer.appendChild(episodeSelect);
  controlsContainer.appendChild(searchInput);
  controlsContainer.appendChild(countDisplay);

  rootElem.parentNode.insertBefore(controlsContainer, rootElem);

  // Event Listeners
  showSelect.addEventListener("change", handleShowSelect);
  episodeSelect.addEventListener("change", handleSelect);
  searchInput.addEventListener("input", handleSearch);

  populateShowDropdown();
}

function populateShowDropdown() {
  const showSelect = document.getElementById("show-select");
  if (!showSelect) return;

  showSelect.innerHTML = "";

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function populateEpisodeDropdown(episodes) {
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

async function loadEpisodesForShow(showId) {
  showLoading();

  try {
    // Requirement 6: Check cache first to avoid re-fetching
    if (episodesCache[showId]) {
      allEpisodes = episodesCache[showId];
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      allEpisodes = await response.json();
      episodesCache[showId] = allEpisodes; // Save to cache
    }

    const rootElem = document.getElementById("root");
    rootElem.innerHTML = "";

    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";

    populateEpisodeDropdown(allEpisodes);
    makePageForEpisodes(allEpisodes);
  } catch (error) {
    showError("Failed to load episode data. Please try again later.");
  }
}

async function handleShowSelect(event) {
  const selectedShowId = event.target.value;
  if (selectedShowId) {
    await loadEpisodesForShow(selectedShowId);
  }
}

// Search Handler
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();

  const episodeSelect = document.getElementById("episode-select");
  if (episodeSelect) episodeSelect.value = "ALL";

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const nameMatches = episode.name.toLowerCase().includes(searchTerm);
    const summaryMatches = episode.summary
      ? episode.summary.toLowerCase().includes(searchTerm)
      : false;

    return nameMatches || summaryMatches;
  });

  makePageForEpisodes(filteredEpisodes);
}

// Episode Dropdown Handler
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
