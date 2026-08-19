let allShows = [];
let allEpisodes = [];
const episodeCache = {}; // Cache completed episodes by showId
const episodeFetchPromises = {}; // Cache in-progress episode requests too
let currentShow = null;

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

  // Only create one request for the shows URL during this visit.
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

    // -------------------------------------------------------------------------
    // Show name
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Image
    // -------------------------------------------------------------------------

    const image = document.createElement("img");
    image.className = "show-image";

    if (show.image && show.image.medium) {
      image.src = show.image.medium;
      image.alt = `${show.name} poster`;
    } else {
      image.alt = "No image available";
      image.classList.add("no-image");
    }

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------

    const summary = document.createElement("div");
    summary.className = "show-summary";

    summary.innerHTML = show.summary || "No summary available.";

    // -------------------------------------------------------------------------
    // Genres
    // -------------------------------------------------------------------------

    const genres = document.createElement("p");
    genres.className = "show-detail";

    genres.innerHTML = `
      <strong>Genres:</strong>
      ${show.genres && show.genres.length > 0 ? show.genres.join(", ") : "N/A"}
    `;

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------

    const status = document.createElement("p");
    status.className = "show-detail";

    status.innerHTML = `
      <strong>Status:</strong>
      ${show.status || "N/A"}
    `;

    // -------------------------------------------------------------------------
    // Rating
    // -------------------------------------------------------------------------

    const rating = document.createElement("p");
    rating.className = "show-detail";

    const ratingValue =
      show.rating && show.rating.average ? show.rating.average : "N/A";

    rating.innerHTML = `
      <strong>Rating:</strong>
      ${ratingValue}
    `;

    // -------------------------------------------------------------------------
    // Runtime
    // -------------------------------------------------------------------------

    const runtime = document.createElement("p");
    runtime.className = "show-detail";

    runtime.innerHTML = `
      <strong>Runtime:</strong>
      ${show.runtime ? `${show.runtime} minutes` : "N/A"}
    `;

    // -------------------------------------------------------------------------
    // Add everything to card
    // -------------------------------------------------------------------------

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
// SHOW SEARCH
// Searches name, genres and summary.
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// 2. FETCH & CACHE EPISODES
// -----------------------------------------------------------------------------

function loadEpisodesForShow(showId) {
  // ---------------------------------------------------------------------------
  // If episodes have already been fetched, use the cache.
  // No second fetch is performed.
  // ---------------------------------------------------------------------------

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];

    currentShow = allShows.find((show) => show.id === showId) || null;

    const showSelect = document.getElementById("show-select");

    if (showSelect) {
      showSelect.value = showId;
    }

    populateEpisodeDropdown();
    makePageForEpisodes(allEpisodes);
    showEpisodesListing();

    return;
  }

  // ---------------------------------------------------------------------------
  // If a request is already in progress, use that same Promise.
  // This prevents two fetches of the same URL.
  // ---------------------------------------------------------------------------

  if (episodeFetchPromises[showId]) {
    showLoadingMessage("Loading episodes, please wait...");

    episodeFetchPromises[showId]
      .then((episodes) => {
        allEpisodes = episodes;

        currentShow = allShows.find((show) => show.id === showId) || null;

        removeStatusMessages();

        populateEpisodeDropdown();
        makePageForEpisodes(allEpisodes);
        showEpisodesListing();
      })
      .catch((error) => {
        console.error("Failed to load episodes:", error);

        showErrorMessage("Sorry, we couldn't load the episodes for this show.");
      });

    return;
  }

  showLoadingMessage("Loading episodes, please wait...");

  // ---------------------------------------------------------------------------
  // Store the Promise immediately.
  // Therefore subsequent clicks reuse it.
  // ---------------------------------------------------------------------------

  episodeFetchPromises[showId] = fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return response.json();
    })
    .then((episodes) => {
      // Cache the response so this URL is never fetched again.
      episodeCache[showId] = episodes;

      return episodes;
    });

  episodeFetchPromises[showId]
    .then((episodes) => {
      allEpisodes = episodes;

      currentShow = allShows.find((show) => show.id === showId) || null;

      removeStatusMessages();

      populateEpisodeDropdown();
      makePageForEpisodes(allEpisodes);
      showEpisodesListing();
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

  // ---------------------------------------------------------------------------
  // SHOW CONTROLS
  // ---------------------------------------------------------------------------

  let showControls = document.getElementById("show-controls");

  if (!showControls) {
    showControls = document.createElement("div");

    showControls.id = "show-controls";
    showControls.className = "controls-container";

    rootElem.appendChild(showControls);
  }

  showControls.innerHTML = "";
  // ---------------------------------------------------------------------------
  // SHOW SEARCH
  // ---------------------------------------------------------------------------

  const showSearchInput = document.createElement("input");

  showSearchInput.type = "text";

  showSearchInput.id = "show-search-input";

  showSearchInput.placeholder = "Search shows by name, genre or summary...";

  showSearchInput.addEventListener("input", (event) => {
    searchShows(event.target.value);
  });

  const showCountLabel = document.createElement("span");

  showCountLabel.id = "show-search-count";

  showCountLabel.textContent = `Displaying ${allShows.length}/${allShows.length} show(s)`;

  // ---------------------------------------------------------------------------
  // SHOW SELECTOR
  // ---------------------------------------------------------------------------

  const showSelect = document.createElement("select");

  showSelect.id = "show-select";

  const defaultShowOption = document.createElement("option");

  defaultShowOption.value = "";

  defaultShowOption.textContent = "Select a show...";

  showSelect.appendChild(defaultShowOption);

  allShows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;

    option.textContent = show.name;

    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", (event) => {
    const showId = event.target.value;

    if (showId) {
      loadEpisodesForShow(showId);
    }
  });

  showControls.appendChild(showSearchInput);

  showControls.appendChild(showSelect);

  showControls.appendChild(showCountLabel);

  // ---------------------------------------------------------------------------
  // EPISODE CONTROLS
  // ---------------------------------------------------------------------------

  let episodeControls = document.getElementById("episode-controls");

  if (!episodeControls) {
    episodeControls = document.createElement("div");

    episodeControls.id = "episode-controls";

    episodeControls.className = "controls-container";

    rootElem.appendChild(episodeControls);
  }

  episodeControls.innerHTML = "";

  // ---------------------------------------------------------------------------
  // Back to shows
  // ---------------------------------------------------------------------------

  const backLink = document.createElement("a");

  backLink.href = "#";

  backLink.id = "back-to-shows";

  backLink.textContent = "← Back to shows";

  backLink.addEventListener("click", (event) => {
    event.preventDefault();

    showShowsListing();
  });

  // ---------------------------------------------------------------------------
  // Current show name
  // ---------------------------------------------------------------------------

  const currentShowName = document.createElement("span");

  currentShowName.id = "current-show-name";

  currentShowName.className = "current-show-name";

  // ---------------------------------------------------------------------------
  // Episode selector
  // ---------------------------------------------------------------------------

  const episodeSelect = document.createElement("select");

  episodeSelect.id = "episode-select";

  episodeSelect.addEventListener("change", (event) => {
    const selectedId = event.target.value;

    if (selectedId === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.filter(
        (episode) => episode.id.toString() === selectedId,
      );

      makePageForEpisodes(selectedEpisode);
    }
  });

  // ---------------------------------------------------------------------------
  // Episode search
  // ---------------------------------------------------------------------------

  const searchInput = document.createElement("input");

  searchInput.type = "text";

  searchInput.id = "search-input";

  searchInput.placeholder = "Search episodes...";

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();

    episodeSelect.value = "ALL";

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);

      const summaryMatch = episode.summary
        ? stripHtml(episode.summary).toLowerCase().includes(searchTerm)
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

// -----------------------------------------------------------------------------
// EPISODE SELECTOR
// -----------------------------------------------------------------------------

function populateEpisodeDropdown() {
  const episodeSelect = document.getElementById("episode-select");

  const searchInput = document.getElementById("search-input");

  if (!episodeSelect) return;

  episodeSelect.innerHTML = "";

  // Reset episode search when changing shows.
  if (searchInput) {
    searchInput.value = "";
  }

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

  episodeSelect.value = "ALL";
}

// -----------------------------------------------------------------------------
// Helper to construct S01E01 episode codes
// -----------------------------------------------------------------------------

function getEpisodeCode(episode) {
  const seasonPad = String(episode.season).padStart(2, "0");

  const episodePad = String(episode.number).padStart(2, "0");

  return `S${seasonPad}E${episodePad}`;
}

// -----------------------------------------------------------------------------
// 4. RENDERING & VIEW SWITCHING
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

    if (episode.image && episode.image.medium) {
      img.src = episode.image.medium;
    }

    img.alt = episode.name;

    const summary = document.createElement("div");

    summary.className = "episode-summary";

    summary.innerHTML = episode.summary || "No summary available.";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);

    container.appendChild(card);
  });

  // ---------------------------------------------------------------------------
  // Attribution
  // ---------------------------------------------------------------------------

  let footer = document.querySelector(".tvmaze-attribution");

  if (!footer) {
    footer = document.createElement("footer");

    footer.className = "tvmaze-attribution";

    footer.innerHTML = `Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>`;

    rootElem.appendChild(footer);
  }
}

// -----------------------------------------------------------------------------
// SHOWS VIEW
// -----------------------------------------------------------------------------

function showShowsListing() {
  removeStatusMessages();

  const showControls = document.getElementById("show-controls");

  const episodeControls = document.getElementById("episode-controls");

  const showsContainer = document.getElementById("shows-container");

  const episodesContainer = document.getElementById("episodes-container");

  if (showControls) {
    showControls.style.display = "";
  }

  if (showsContainer) {
    showsContainer.style.display = "";
  }

  if (episodeControls) {
    episodeControls.style.display = "none";
  }

  if (episodesContainer) {
    episodesContainer.style.display = "none";
  }
}

// -----------------------------------------------------------------------------
// EPISODES VIEW
// -----------------------------------------------------------------------------

function showEpisodesListing() {
  removeStatusMessages();

  const showControls = document.getElementById("show-controls");

  const episodeControls = document.getElementById("episode-controls");

  const showsContainer = document.getElementById("shows-container");

  const episodesContainer = document.getElementById("episodes-container");

  const currentShowName = document.getElementById("current-show-name");

  if (showControls) {
    showControls.style.display = "none";
  }

  if (showsContainer) {
    showsContainer.style.display = "none";
  }

  if (episodeControls) {
    episodeControls.style.display = "";
  }

  if (episodesContainer) {
    episodesContainer.style.display = "";
  }

  if (currentShowName) {
    currentShowName.textContent = currentShow ? ` ${currentShow.name}` : "";
  }
}

// -----------------------------------------------------------------------------
// 5. STATUS HANDLING
// -----------------------------------------------------------------------------

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

  if (loadingMessage) {
    loadingMessage.remove();
  }

  if (errorMessage) {
    errorMessage.remove();
  }
}

window.onload = setup;
