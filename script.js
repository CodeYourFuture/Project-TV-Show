let allShows = [];
let allEpisodes = [];
const episodeCache = {}; // Cache episodes by showId to satisfy Requirement 6

function setup() {
  showLoadingMessage("Loading shows, please wait...");
  fetchShows();
}

// -----------------------------------------------------------------------------
// 1. FETCH & INITIALIZE SHOWS
// -----------------------------------------------------------------------------

function fetchShows() {
  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((shows) => {
      // Sort shows alphabetically (case-insensitive) - Requirement 5
      allShows = shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );

      removeStatusMessages();
      createControls();

      // Automatically load the first show on startup
      if (allShows.length > 0) {
        const showSelect = document.getElementById("show-select");
        showSelect.value = allShows[0].id;
        loadEpisodesForShow(allShows[0].id);
      }
    })
    .catch((error) => {
      console.error("Failed to load shows:", error);
      showErrorMessage("Sorry, we couldn't load the show list. Please try again later.");
    });
}

// -----------------------------------------------------------------------------
// 2. FETCH & CACHE EPISODES
// -----------------------------------------------------------------------------

function loadEpisodesForShow(showId) {
  // Check if data exists in cache before fetching - Requirement 6
  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    populateEpisodeDropdown();
    makePageForEpisodes(allEpisodes);
    return;
  }

  showLoadingMessage("Loading episodes, please wait...");

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((episodes) => {
      // Cache response data
      episodeCache[showId] = episodes;
      allEpisodes = episodes;

      removeStatusMessages();
      populateEpisodeDropdown();
      makePageForEpisodes(allEpisodes);
    })
    .catch((error) => {
      console.error("Failed to load episodes:", error);
      showErrorMessage("Sorry, we couldn't load the episodes for this show.");
    });
}

// -----------------------------------------------------------------------------
// 3. UI CONTROLS & LISTENERS
// -----------------------------------------------------------------------------

function createControls() {
  const rootElem = document.getElementById("root");

  let controlsDiv = document.querySelector(".controls-container");
  if (!controlsDiv) {
    controlsDiv = document.createElement("div");
    controlsDiv.className = "controls-container";
    rootElem.appendChild(controlsDiv);
  } else {
    controlsDiv.innerHTML = "";
  }

  // --- Show Selector Dropdown ---
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", (e) => {
    const showId = e.target.value;
    loadEpisodesForShow(showId);
  });

  // --- Episode Selector Dropdown ---
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  episodeSelect.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    if (selectedId === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.filter(
        (ep) => ep.id.toString() === selectedId
      );
      makePageForEpisodes(selectedEpisode);
    }
  });

  // --- Search Input ---
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    episodeSelect.value = "ALL";

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary
        ? episode.summary.toLowerCase().includes(searchTerm)
        : false;
      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);
  });

  // --- Match Count Display ---
  const countLabel = document.createElement("span");
  countLabel.id = "search-count";

  // Append elements in visual flow
  controlsDiv.appendChild(showSelect);
  controlsDiv.appendChild(episodeSelect);
  controlsDiv.appendChild(searchInput);
  controlsDiv.appendChild(countLabel);
}

function populateEpisodeDropdown() {
  const episodeSelect = document.getElementById("episode-select");
  const searchInput = document.getElementById("search-input");

  if (!episodeSelect) return;

  // Reset controls state when switching shows
  episodeSelect.innerHTML = "";
  if (searchInput) searchInput.value = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Select an episode...";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const code = getEpisodeCode(episode);
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${code} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

// Helper to construct "S01E01" episode codes
function getEpisodeCode(episode) {
  const seasonPad = String(episode.season).padStart(2, "0");
  const episodePad = String(episode.number).padStart(2, "0");
  return `S${seasonPad}E${episodePad}`;
}

// -----------------------------------------------------------------------------
// 4. RENDERING & STATUS HANDLING
// -----------------------------------------------------------------------------

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const countLabel = document.getElementById("search-count");
  if (countLabel) {
    countLabel.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episode(s)`;
  }

  let container = document.getElementById("episodes-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "episodes-container";
    container.className = "episodes-container";
    rootElem.appendChild(container);
  } else {
    container.innerHTML = "";
  }

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";
    card.id = `episode-${episode.id}`;

    const episodeCode = getEpisodeCode(episode);

    const title = document.createElement("h2");
    title.className = "episode-title";

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${episode.name} - ${episodeCode}`;
    title.appendChild(link);

    const img = document.createElement("img");
    img.className = "episode-image";
    img.src = episode.image ? episode.image.medium : "";
    img.alt = episode.name;

    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "No summary available.";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);

    container.appendChild(card);
  });

  let footer = document.querySelector(".tvmaze-attribution");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "tvmaze-attribution";
    footer.innerHTML = `Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>`;
    rootElem.appendChild(footer);
  }
}

function showLoadingMessage(message) {
  removeStatusMessages();
  const rootElem = document.getElementById("root");
  const loadingMessage = document.createElement("p");
  loadingMessage.id = "loading-message";
  loadingMessage.textContent = message;
  rootElem.appendChild(loadingMessage);
}

function showErrorMessage(message) {
  removeStatusMessages();
  const rootElem = document.getElementById("root");
  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.textContent = message;
  rootElem.appendChild(errorMessage);
}

function removeStatusMessages() {
  const loadingMessage = document.getElementById("loading-message");
  const errorMessage = document.getElementById("error-message");
  if (loadingMessage) loadingMessage.remove();
  if (errorMessage) errorMessage.remove();
}

window.onload = setup;
