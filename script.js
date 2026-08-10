// Global State & Cache
let allShows = [];
let allEpisodes = [];
const showsCache = {}; // Cache episodes by show ID to enforce the single-fetch rule

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p class="loading-state">Loading shows, please wait...</p>`;

  // Wire event listeners once on load
  const showSelect = document.getElementById("show-select");
  const searchInput = document.getElementById("search-input");
  const episodeSelect = document.getElementById("episode-select");

  if (showSelect) showSelect.addEventListener("change", handleShowSelect);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (episodeSelect) episodeSelect.addEventListener("change", handleSelect);

  try {
    // 1. Fetch shows list
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Failed to load shows (${response.status})`);
    }

    const rawShows = await response.json();

    // 2. Sort shows alphabetically (case-insensitive)
    allShows = rawShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "accent" }),
    );

    // 3. Populate Show Dropdown
    populateShowDropdown(allShows);

    // 4. Load initial show (e.g., Game of Thrones - ID 82, or the first show in list)
    const defaultShowId = allShows.find((show) => show.id === 82)
      ? 82
      : allShows[0].id;

    showSelect.value = defaultShowId;
    await loadEpisodesForShow(defaultShowId);
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-banner">
        <h2>Unable to load shows</h2>
        <p>Error: ${error.message}. Please check your connection and refresh.</p>
      </div>
    `;
  }
}

// Populate Show Selector
function populateShowDropdown(shows) {
  const select = document.getElementById("show-select");
  if (!select) return;

  select.innerHTML = ""; // Clear options

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.appendChild(option);
  });
}

// Fetch or retrieve episodes from cache
async function loadEpisodesForShow(showId) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p class="loading-state">Loading episodes...</p>`;

  // Reset controls
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  try {
    // Check if show episodes are already cached
    if (showsCache[showId]) {
      allEpisodes = showsCache[showId];
    } else {
      // Fetch ONCE and cache
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      if (!response.ok) {
        throw new Error(`Failed to load episodes (${response.status})`);
      }
      allEpisodes = await response.json();
      showsCache[showId] = allEpisodes; // Cache in memory
    }

    // Populate episode controls & display UI
    populateSelectDropdown(allEpisodes);
    makePageForEpisodes(allEpisodes);
    updateSearchCount(allEpisodes.length, allEpisodes.length);
  } catch (error) {
    rootElem.innerHTML = `
      <div class="error-banner">
        <h2>Unable to load episodes</h2>
        <p>Error: ${error.message}. Please try selecting another show.</p>
      </div>
    `;
  }
}

// Show Select Handler
async function handleShowSelect(event) {
  const selectedShowId = event.target.value;
  if (!selectedShowId) return;
  await loadEpisodesForShow(selectedShowId);
}

// Populate Episode Selector
function populateSelectDropdown(episodes) {
  const select = document.getElementById("episode-select");
  if (!select) return;

  select.innerHTML = '<option value="ALL">All episodes</option>';

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    const code = formatEpisodeCode(episode.season, episode.number);
    option.textContent = `${code} - ${episode.name}`;
    select.appendChild(option);
  });
}

// Live Search Handler
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
  updateSearchCount(filteredEpisodes.length, allEpisodes.length);
}

// Episode Dropdown Selector Handler
function handleSelect(event) {
  const selectedId = event.target.value;

  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  if (selectedId === "ALL") {
    makePageForEpisodes(allEpisodes);
    updateSearchCount(allEpisodes.length, allEpisodes.length);
  } else {
    const selectedEpisode = allEpisodes.filter(
      (episode) => String(episode.id) === String(selectedId),
    );
    makePageForEpisodes(selectedEpisode);
    updateSearchCount(selectedEpisode.length, allEpisodes.length);
  }
}

// Update Search Counter
function updateSearchCount(matchCount, totalCount) {
  const countDisplay = document.getElementById("search-count");
  if (countDisplay) {
    countDisplay.textContent = `Displaying ${matchCount}/${totalCount} episodes`;
  }
}

// Helper: Format S01E01
function formatEpisodeCode(season, number) {
  const paddedSeason = String(season).padStart(2, "0");
  const paddedNumber = String(number).padStart(2, "0");
  return `S${paddedSeason}E${paddedNumber}`;
}

// Render Episodes Page
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
  addTvmazeAttribution();
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
