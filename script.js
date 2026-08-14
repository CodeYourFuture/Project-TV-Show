let allShows = [];
let allEpisodes = [];
const episodeCache = {}; // Cache episodes by showId to satisfy Requirement 6
const episodeFetchPromises = {};

function setup() {
  showLoadingMessage("Loading shows, please wait...");
  fetchShows();
}

// -----------------------------------------------------------------------------
// 1. FETCH & INITIALIZE SHOWS
// -----------------------------------------------------------------------------

function fetchShows() {
  if (window.showsFetchPromise) {
    window.showsFetchPromise.then((shows) => {
      initialiseShows(shows);
    });
    return;
  }

  window.showsFetchPromise = fetch("https://api.tvmaze.com/shows").then(
    (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return response.json();
    },
  );

  window.showsFetchPromise
    .then((shows) => {
      initialiseShows(shows);
    })
    .catch((error) => {
      console.error("Failed to load shows:", error);

      showErrorMessage(
        "Sorry, we couldn't load the show list. Please try again later.",
      );
    });
}

function initialiseShows(shows) {
  allShows = shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    }),
  );

  removeStatusMessages();

  createControls();
  createShowsListing();
  createAttribution();

  showShowsListing();
}

function createShowsListing() {
  const rootElem = document.getElementById("root");

  let showsContainer = document.getElementById("shows-container");

  if (!showsContainer) {
    showsContainer = document.createElement("div");
    showsContainer.id = "shows-container";
    showsContainer.className = "shows-container";

    rootElem.appendChild(showsContainer);
  }

  renderShows(allShows);
}

function renderShows(shows) {
  const container = document.getElementById("shows-container");

  if (!container) return;

  container.innerHTML = "";

  if (shows.length === 0) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.textContent = "No shows found.";

    container.appendChild(message);
    return;
  }

  shows.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";

    // Show name
    const title = document.createElement("h2");
    title.className = "show-title";

    const titleLink = document.createElement("a");

    titleLink.href = "#";
    titleLink.textContent = show.name;

    titleLink.addEventListener("click", (event) => {
      event.preventDefault();

      loadEpisodesForShow(show.id);
    });

    title.appendChild(titleLink);

    // Image
    const image = document.createElement("img");
    image.className = "show-image";

    if (show.image && show.image.medium) {
      image.src = show.image.medium;
      image.alt = `${show.name} poster`;
    } else {
      image.alt = "No image available";
      image.classList.add("no-image");
    }

    function searchShows(searchTerm) {
      const term = searchTerm.toLowerCase().trim();

      const filteredShows = allShows.filter((show) => {
        const nameMatch = show.name.toLowerCase().includes(term);

        const genreMatch = show.genres
          ? show.genres.some((genre) => genre.toLowerCase().includes(term))
          : false;

        const summaryMatch = show.summary
          ? stripHtml(show.summary).toLowerCase().includes(term)
          : false;

        return nameMatch || genreMatch || summaryMatch;
      });

      renderShows(filteredShows);

      const countLabel = document.getElementById("show-search-count");

      if (countLabel) {
        countLabel.textContent = `Displaying ${filteredShows.length}/${allShows.length} show(s)`;
      }
    }

    function stripHtml(html) {
      const temp = document.createElement("div");

      temp.innerHTML = html;

      return temp.textContent || temp.innerText || "";
    }

    // Summary
    const summary = document.createElement("div");
    summary.className = "show-summary";
    summary.innerHTML = show.summary || "No summary available.";

    // Genres
    const genres = document.createElement("p");
    genres.className = "show-detail";

    genres.innerHTML = `
      <strong>Genres:</strong>
      ${show.genres && show.genres.length > 0 ? show.genres.join(", ") : "N/A"}
    `;

    // Status
    const status = document.createElement("p");
    status.className = "show-detail";

    status.innerHTML = `
      <strong>Status:</strong>
      ${show.status || "N/A"}
    `;

    // Rating
    const rating = document.createElement("p");
    rating.className = "show-detail";

    const ratingValue =
      show.rating && show.rating.average ? show.rating.average : "N/A";

    rating.innerHTML = `
      <strong>Rating:</strong>
      ${ratingValue}
    `;

    // Runtime
    const runtime = document.createElement("p");
    runtime.className = "show-detail";

    runtime.innerHTML = `
      <strong>Runtime:</strong>
      ${show.runtime ? `${show.runtime} minutes` : "N/A"}
    `;

    // Add everything to card
    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);
    card.appendChild(genres);
    card.appendChild(status);
    card.appendChild(rating);
    card.appendChild(runtime);

    container.appendChild(card);
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

  // ------------------------------------------------------------
  // SHOW CONTROLS
  // ------------------------------------------------------------

  let showControls = document.getElementById("show-controls");

  if (!showControls) {
    showControls = document.createElement("div");
    showControls.id = "show-controls";
    showControls.className = "controls-container";

    rootElem.appendChild(showControls);
  }

  showControls.innerHTML = "";

  const showSearchInput = document.createElement("input");

  showSearchInput.type = "text";
  showSearchInput.id = "show-search-input";
  showSearchInput.placeholder =
    "Search shows by name, genre or summary...";

  showSearchInput.addEventListener("input", (event) => {
    searchShows(event.target.value);
  });

  const showCountLabel = document.createElement("span");

  showCountLabel.id = "show-search-count";

  showCountLabel.textContent =
    `Displaying ${allShows.length}/${allShows.length} show(s)`;

  showControls.appendChild(showSearchInput);
  showControls.appendChild(showCountLabel);

  // ------------------------------------------------------------
  // EPISODE CONTROLS
  // ------------------------------------------------------------

  let episodeControls =
    document.getElementById("episode-controls");

  if (!episodeControls) {
    episodeControls = document.createElement("div");
    episodeControls.id = "episode-controls";
    episodeControls.className = "controls-container";

    rootElem.appendChild(episodeControls);
  }

  episodeControls.innerHTML = "";

  // Back to shows link
  const backLink = document.createElement("a");

  backLink.href = "#";
  backLink.id = "back-to-shows";
  backLink.textContent = "← Back to shows";

  backLink.addEventListener("click", (event) => {
    event.preventDefault();

    showShowsListing();
  });

  // Current show name
  const currentShowName = document.createElement("span");

  currentShowName.id = "current-show-name";
  currentShowName.className = "current-show-name";

  // Episode selector
  const episodeSelect = document.createElement("select");

  episodeSelect.id = "episode-select";

  episodeSelect.addEventListener("change", (event) => {
    const selectedId = event.target.value;

    if (selectedId === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.filter(
        (episode) =>
          episode.id.toString() === selectedId
      );

      makePageForEpisodes(selectedEpisode);
    }
  });

  // Episode search
  const searchInput = document.createElement("input");

  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value
      .toLowerCase()
      .trim();

    episodeSelect.value = "ALL";

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name
        .toLowerCase()
        .includes(searchTerm);

      const summaryMatch = episode.summary
        ? stripHtml(episode.summary)
            .toLowerCase()
            .includes(searchTerm)
        : false;

      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);function createControls() {
  const rootElem = document.getElementById("root");

  // ------------------------------------------------------------
  // SHOW CONTROLS
  // ------------------------------------------------------------

  let showControls = document.getElementById("show-controls");

  if (!showControls) {
    showControls = document.createElement("div");
    showControls.id = "show-controls";
    showControls.className = "controls-container";

    rootElem.appendChild(showControls);
  }

  showControls.innerHTML = "";

  const showSearchInput = document.createElement("input");

  showSearchInput.type = "text";
  showSearchInput.id = "show-search-input";
  showSearchInput.placeholder =
    "Search shows by name, genre or summary...";

  showSearchInput.addEventListener("input", (event) => {
    searchShows(event.target.value);
  });

  const showCountLabel = document.createElement("span");

  showCountLabel.id = "show-search-count";

  showCountLabel.textContent =
    `Displaying ${allShows.length}/${allShows.length} show(s)`;

  showControls.appendChild(showSearchInput);
  showControls.appendChild(showCountLabel);

  // ------------------------------------------------------------
  // EPISODE CONTROLS
  // ------------------------------------------------------------

  let episodeControls =
    document.getElementById("episode-controls");

  if (!episodeControls) {
    episodeControls = document.createElement("div");
    episodeControls.id = "episode-controls";
    episodeControls.className = "controls-container";

    rootElem.appendChild(episodeControls);
  }

  episodeControls.innerHTML = "";

  // Back to shows link
  const backLink = document.createElement("a");

  backLink.href = "#";
  backLink.id = "back-to-shows";
  backLink.textContent = "← Back to shows";

  backLink.addEventListener("click", (event) => {
    event.preventDefault();

    showShowsListing();
  });

  // Current show name
  const currentShowName = document.createElement("span");

  currentShowName.id = "current-show-name";
  currentShowName.className = "current-show-name";

  // Episode selector
  const episodeSelect = document.createElement("select");

  episodeSelect.id = "episode-select";

  episodeSelect.addEventListener("change", (event) => {
    const selectedId = event.target.value;

    if (selectedId === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.filter(
        (episode) =>
          episode.id.toString() === selectedId
      );

      makePageForEpisodes(selectedEpisode);
    }
  });

  // Episode search
  const searchInput = document.createElement("input");

  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value
      .toLowerCase()
      .trim();

    episodeSelect.value = "ALL";

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name
        .toLowerCase()
        .includes(searchTerm);

      const summaryMatch = episode.summary
        ? stripHtml(episode.summary)
            .toLowerCase()
            .includes(searchTerm)
        : false;

      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);
  });

  const countLabel = document.createElement("span");

  countLabel.id = "search-count";

  episodeControls.appendChild(backLink);
  episodeControls.appendChild(currentShowName);
  episodeControls.appendChild(episodeSelect);
  episodeControls.appendChild(searchInput);
  episodeControls.appendChild(countLabel);
}
  });

  const countLabel = document.createElement("span");

  countLabel.id = "search-count";

  episodeControls.appendChild(backLink);
  episodeControls.appendChild(currentShowName);
  episodeControls.appendChild(episodeSelect);
  episodeControls.appendChild(searchInput);
  episodeControls.appendChild(countLabel);
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
