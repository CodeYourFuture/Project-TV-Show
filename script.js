let allEpisodes = [];
let allShows = [];
const cache = {}; // Rule 6: In-memory cache to prevent duplicate fetches
let currentView = "shows"; // State flag: "shows" or "episodes"

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

    createControls();
    renderShowsListing(allShows);
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
    throw new Error(`HTTP error status: ${response.status}`);
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

    currentView = "episodes";
    updateViewControls();

    const showSelect = document.getElementById("show-select");
    if (showSelect) showSelect.value = showId;

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
  if (document.querySelector(".controls-container")) return;

  const controlsContainer = document.createElement("nav");
  controlsContainer.className = "controls-container";
  controlsContainer.setAttribute("aria-label", "Search and view controls");

  // Navigation Back Link
  const backBtn = document.createElement("button");
  backBtn.id = "back-to-shows-btn";
  backBtn.className = "nav-btn hidden";
  backBtn.textContent = "◄ Back to Shows";
  backBtn.addEventListener("click", () => {
    currentView = "shows";
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";
    const showSelect = document.getElementById("show-select");
    if (showSelect) showSelect.value = "";
    updateViewControls();
    renderShowsListing(allShows);
  });

  // 1. Show Select Dropdown
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.setAttribute("aria-label", "Select a TV Show");

  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "Select a Show...";
  showSelect.appendChild(defaultShowOption);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // 2. Episode Select Dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.setAttribute("aria-label", "Select an Episode");

  // 3. Search Input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search shows...";
  searchInput.setAttribute("aria-label", "Search shows or episodes");

  // 4. Count Display
  const countDisplay = document.createElement("span");
  countDisplay.id = "search-count";
  countDisplay.setAttribute("aria-live", "polite");

  controlsContainer.appendChild(backBtn);
  controlsContainer.appendChild(showSelect);
  controlsContainer.appendChild(episodeSelect);
  controlsContainer.appendChild(searchInput);
  controlsContainer.appendChild(countDisplay);

  const rootElem = document.getElementById("root");
  rootElem.parentNode.insertBefore(controlsContainer, rootElem);

  // Event Listeners
  showSelect.addEventListener("change", handleShowChange);
  episodeSelect.addEventListener("change", handleSelect);
  searchInput.addEventListener("input", handleSearch);
}

function updateViewControls() {
  const backBtn = document.getElementById("back-to-shows-btn");
  const episodeSelect = document.getElementById("episode-select");
  const searchInput = document.getElementById("search-input");

  if (currentView === "shows") {
    if (backBtn) backBtn.classList.add("hidden");
    if (episodeSelect) episodeSelect.classList.add("hidden");
    if (searchInput)
      searchInput.placeholder = "Search shows (name, genre, summary)...";
  } else {
    if (backBtn) backBtn.classList.remove("hidden");
    if (episodeSelect) episodeSelect.classList.remove("hidden");
    if (searchInput) searchInput.placeholder = "Search episodes...";
  }
}

// Render Shows Page (2 Columns Grid)
function renderShowsListing(showsList) {
  currentView = "shows";
  updateViewControls();

  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  if (showsList.length === 0) {
    rootElem.innerHTML = "<p>No shows found matching your search criteria.</p>";
    updateSearchCount(0, allShows.length, "shows");
    return;
  }

  const container = document.createElement("div");
  container.className = "shows-container";

  showsList.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";

    // Header Title
    const title = document.createElement("h2");
    title.textContent = show.name;
    title.addEventListener("click", () => loadEpisodesForShow(show.id));

    // Body Container (Image + Summary)
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "show-card-body";

    // Media / Image Section
    const mediaDiv = document.createElement("div");
    mediaDiv.className = "show-card-media";
    if (show.image && show.image.medium) {
      const img = document.createElement("img");
      img.src = show.image.medium;
      img.alt = show.name;
      mediaDiv.appendChild(img);
    }
    mediaDiv.addEventListener("click", () => loadEpisodesForShow(show.id));

    // Summary Section
    const contentDiv = document.createElement("div");
    contentDiv.className = "show-card-content";
    const summary = document.createElement("div");
    summary.className = "show-card-summary";
    summary.innerHTML = show.summary || "<p>No summary available.</p>";
    contentDiv.appendChild(summary);

    bodyDiv.appendChild(mediaDiv);
    bodyDiv.appendChild(contentDiv);

    // Footer Metadata Section
    const metaDiv = document.createElement("div");
    metaDiv.className = "show-card-meta";
    metaDiv.innerHTML = `
      <p><strong>Rated:</strong> ${show.rating && show.rating.average ? show.rating.average : "N/A"}</p>
      <p><strong>Genres:</strong> ${show.genres && show.genres.length > 0 ? show.genres.join(", ") : "N/A"}</p>
      <p><strong>Status:</strong> ${show.status || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime ? show.runtime + " min" : "N/A"}</p>
    `;

    card.appendChild(title);
    card.appendChild(bodyDiv);
    card.appendChild(metaDiv);

    container.appendChild(card);
  });

  rootElem.appendChild(container);
  updateSearchCount(showsList.length, allShows.length, "shows");
}

async function handleShowChange(event) {
  const showId = event.target.value;
  if (showId) {
    await loadEpisodesForShow(showId);
  } else {
    renderShowsListing(allShows);
  }
}

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

  if (currentView === "shows") {
    const filteredShows = allShows.filter((show) => {
      const nameMatch = show.name.toLowerCase().includes(searchTerm);
      const summaryMatch = (show.summary || "")
        .toLowerCase()
        .includes(searchTerm);
      const genreMatch = show.genres
        ? show.genres.some((g) => g.toLowerCase().includes(searchTerm))
        : false;

      return nameMatch || summaryMatch || genreMatch;
    });

    renderShowsListing(filteredShows);
  } else {
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
}

function updateSearchCount(matchCount, totalCount, type = "episodes") {
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

// Render Episodes Page
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  if (episodeList.length === 0) {
    rootElem.innerHTML = "<p>No episodes found matching your criteria.</p>";
    updateSearchCount(0, allEpisodes.length, "episodes");
    return;
  }

  const container = document.createElement("div");
  container.className = "episodes-container";

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    // Card Header
    const header = document.createElement("div");
    header.className = "episode-header";
    const title = document.createElement("h3");
    const code = formatEpisodeCode(episode.season, episode.number);
    title.textContent = `${episode.name} - ${code}`;
    header.appendChild(title);
    card.appendChild(header);

    // Episode Image
    if (episode.image && episode.image.medium) {
      const img = document.createElement("img");
      img.src = episode.image.medium;
      img.alt = episode.name;
      card.appendChild(img);
    }

    // Episode Summary
    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "<p>No summary available.</p>";
    card.appendChild(summary);

    container.appendChild(card);
  });

  rootElem.appendChild(container);
  updateSearchCount(episodeList.length, allEpisodes.length, "episodes");
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
