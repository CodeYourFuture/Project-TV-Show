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

    // Default View: Show all shows on start (Level 500)
    showShowsListingView();
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

// ==========================================
// VIEW SWITCHING LOGIC
// ==========================================
function showShowsListingView() {
  const showsContainer = document.getElementById("shows-container");
  const episodesContainer = document.getElementById("episodes-container");

  if (showsContainer) showsContainer.style.display = "grid";
  if (episodesContainer) episodesContainer.style.display = "none";

  // Toggle visible controls
  const backBtn = document.getElementById("back-to-shows-btn");
  const showSearchInput = document.getElementById("show-search-input");
  const searchInput = document.getElementById("search-input");
  const episodeSelect = document.getElementById("episode-select");
  const showSelect = document.getElementById("show-select");

  if (backBtn) backBtn.style.display = "none";
  if (showSearchInput) {
    showSearchInput.style.display = "inline-block";
    showSearchInput.value = "";
  }
  if (searchInput) searchInput.style.display = "none";
  if (episodeSelect) episodeSelect.style.display = "none";
  if (showSelect) showSelect.value = "";

  makePageForShows(allShows);
}

function showEpisodesView() {
  const showsContainer = document.getElementById("shows-container");
  const episodesContainer = document.getElementById("episodes-container");

  if (showsContainer) showsContainer.style.display = "none";
  if (episodesContainer) episodesContainer.style.display = "block";

  // Toggle visible controls
  const backBtn = document.getElementById("back-to-shows-btn");
  const showSearchInput = document.getElementById("show-search-input");
  const searchInput = document.getElementById("search-input");
  const episodeSelect = document.getElementById("episode-select");

  if (backBtn) backBtn.style.display = "inline-block";
  if (showSearchInput) showSearchInput.style.display = "none";
  if (searchInput) searchInput.style.display = "inline-block";
  if (episodeSelect) episodeSelect.style.display = "inline-block";
}

// ==========================================
// CONTROLS CREATION & DROPDOWNS
// ==========================================
function createControls() {
  const rootElem = document.getElementById("root");

  const controlsContainer = document.createElement("div");
  controlsContainer.className = "controls-container";

  // Back to Shows Button (Requirement 3)
  const backBtn = document.createElement("button");
  backBtn.id = "back-to-shows-btn";
  backBtn.textContent = "← Back to All Shows";
  backBtn.addEventListener("click", showShowsListingView);

  // Show Select Dropdown
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  // Episode Select Dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  // Free-text Show Search Input (Requirement 4)
  const showSearchInput = document.createElement("input");
  showSearchInput.type = "text";
  showSearchInput.id = "show-search-input";
  showSearchInput.placeholder = "Search shows...";

  // Episode Search Input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  // Count Display
  const countDisplay = document.createElement("span");
  countDisplay.id = "search-count";

  controlsContainer.appendChild(backBtn);
  controlsContainer.appendChild(showSelect);
  controlsContainer.appendChild(episodeSelect);
  controlsContainer.appendChild(showSearchInput);
  controlsContainer.appendChild(searchInput);
  controlsContainer.appendChild(countDisplay);

  // Main Display Containers
  const showsContainer = document.createElement("div");
  showsContainer.id = "shows-container";

  const episodesContainer = document.createElement("div");
  episodesContainer.id = "episodes-container";

  rootElem.parentNode.insertBefore(controlsContainer, rootElem);
  rootElem.appendChild(showsContainer);
  rootElem.appendChild(episodesContainer);

  // Event Listeners
  showSelect.addEventListener("change", handleShowSelect);
  episodeSelect.addEventListener("change", handleSelect);
  showSearchInput.addEventListener("input", handleShowSearch);
  searchInput.addEventListener("input", handleSearch);

  populateShowDropdown();
}

function populateShowDropdown() {
  const showSelect = document.getElementById("show-select");
  if (!showSelect) return;

  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  showSelect.appendChild(defaultOption);

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

// ==========================================
// SHOWS LISTING & SEARCH (Requirement 1 & 4)
// ==========================================
function makePageForShows(showsList) {
  const showsContainer = document.getElementById("shows-container");
  if (!showsContainer) return;

  showsContainer.innerHTML = "";

  if (showsList.length === 0) {
    showsContainer.innerHTML = "<p>No shows found matching your criteria.</p>";
    updateCount(0, allShows.length, "shows");
    return;
  }

  showsList.forEach((show) => {
    const card = document.createElement("section");
    card.className = "show-card";

    // Show Name (Clickable)
    const title = document.createElement("h2");
    title.className = "show-title";
    title.textContent = show.name;
    title.style.cursor = "pointer";
    title.addEventListener("click", () => handleShowClick(show.id));

    // Show Image
    const img = document.createElement("img");
    img.src = show.image
      ? show.image.medium
      : "https://via.placeholder.com/210x295?text=No+Image";
    img.alt = show.name;
    img.style.cursor = "pointer";
    img.addEventListener("click", () => handleShowClick(show.id));

    // Show Info (Genres, Status, Rating, Runtime)
    const info = document.createElement("div");
    info.className = "show-info";
    info.innerHTML = `
      <p><strong>Genres:</strong> ${show.genres ? show.genres.join(", ") : "N/A"}</p>
      <p><strong>Status:</strong> ${show.status || "N/A"}</p>
      <p><strong>Rating:</strong> ${show.rating && show.rating.average ? show.rating.average : "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime ? show.runtime + " mins" : "N/A"}</p>
    `;

    // Show Summary
    const summary = document.createElement("div");
    summary.className = "show-summary";
    summary.innerHTML = show.summary || "<p>No summary available.</p>";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(summary);

    showsContainer.appendChild(card);
  });

  updateCount(showsList.length, allShows.length, "shows");
}

function handleShowSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();

  const filteredShows = allShows.filter((show) => {
    const nameMatches = show.name.toLowerCase().includes(searchTerm);
    const genreMatches = show.genres
      ? show.genres.some((g) => g.toLowerCase().includes(searchTerm))
      : false;
    const summaryMatches = show.summary
      ? show.summary.toLowerCase().includes(searchTerm)
      : false;

    return nameMatches || genreMatches || summaryMatches;
  });

  makePageForShows(filteredShows);
}

async function handleShowClick(showId) {
  const showSelect = document.getElementById("show-select");
  if (showSelect) showSelect.value = showId;
  await loadEpisodesForShow(showId);
}

async function handleShowSelect(event) {
  const selectedShowId = event.target.value;
  if (selectedShowId) {
    await loadEpisodesForShow(selectedShowId);
  } else {
    showShowsListingView();
  }
}

// ==========================================
// EPISODES LISTING & SEARCH
// ==========================================
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

    showEpisodesView();

    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";

    populateEpisodeDropdown(allEpisodes);
    makePageForEpisodes(allEpisodes);
  } catch (error) {
    showError("Failed to load episode data. Please try again later.");
  }
}

// Episode Search Handler
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

function updateCount(matchCount, totalCount, type = "episodes") {
  const countDisplay = document.getElementById("search-count");
  if (countDisplay) {
    countDisplay.textContent = `Displaying ${matchCount}/${totalCount} ${type}`;
  }
}

function formatEpisodeCode(season, number) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

function makePageForEpisodes(episodeList) {
  const episodesContainer = document.getElementById("episodes-container");
  if (!episodesContainer) return;

  episodesContainer.innerHTML = "";

  if (episodeList.length === 0) {
    episodesContainer.innerHTML =
      "<p>No episodes found matching your criteria.</p>";
    updateCount(0, allEpisodes.length, "episodes");
    return;
  }

  const container = document.createElement("div");
  container.className = "episodes-container-grid";

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

  episodesContainer.appendChild(container);

  updateCount(episodeList.length, allEpisodes.length, "episodes");
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
