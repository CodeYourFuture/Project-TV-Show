// -----------------------------------------------------
// STATE
// -----------------------------------------------------

const state = {
  viewMode: "shows", // "shows" or "episodes"
  shows: [],
  episodes: [],
  selectedShowId: "",
  searchTerm: "",
  selectedEpisodeCode: "",
  isLoading: true,
  error: null,
  episodeCache: {},
};

// -----------------------------------------------------
// DOM ELEMENTS
// -----------------------------------------------------
const episodeSelector = document.getElementById("episode-selector");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const showSelector = document.getElementById("show-selector");
const backToShowsBtn = document.getElementById("back-to-shows-btn");
const selectedShowTitle = document.getElementById("selected-show-title");

// -----------------------------------------------------
// FETCH API DATA
// -----------------------------------------------------

const fetchAllShows = async () => {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} (${response.statusText})`);
  }
  return await response.json();
};

const fetchAllEpisodes = async (showId) => {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} (${response.statusText})`);
  }
  return await response.json();
};

// -----------------------------------------------------
// HELPER: implement episode code function
// -----------------------------------------------------
function getEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

// -----------------------------------------------------
// MAKE ONE SHOW CARD
// -----------------------------------------------------
function displayShowCard(show) {
  const card = document.getElementById("show-card").content.cloneNode(true);

  const titleElem = card.querySelector(".show-title");
  titleElem.textContent = show.name;
  titleElem.dataset.showId = show.id;

  titleElem.addEventListener("click", () => {
    selectShow(show.id);
  });

  const imgElem = card.querySelector(".show-img");
  imgElem.src = show.image?.medium || "";
  imgElem.alt = `${show.name} cover image`;

  card.querySelector(".show-summary").textContent = (show.summary || "").replace(
    /<[^>]*>/g,
    "",
  );

  card.querySelector(".show-rating").textContent = show.rating?.average || "N/A";
  card.querySelector(".show-genres").textContent = show.genres?.join(" | ") || "N/A";
  card.querySelector(".show-status").textContent = show.status || "N/A";
  card.querySelector(".show-runtime").textContent = show.runtime || "N/A";

  return card;
}

// -----------------------------------------------------
// MAKE ONE EPISODE CARD
// -----------------------------------------------------
function displayEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);
  const episodeCode = getEpisodeCode(episode);

  card.querySelector("section").id = episodeCode;
  card.querySelector("h3").innerText = `${episode.name} - ${episodeCode}`;
  card.querySelector("img").src = episode.image?.medium || ""; // set default empty string if no image
  card.querySelector("img").alt =
    `Scene from season ${episode.season} episode ${episode.number}, ${episode.name}`;

  // use regex to remove tags from summary  value in db and set default empty string if no summary
  card.querySelector("p").innerText = (episode.summary || "").replace(
    /<[^>]*>/g,
    "",
  );

  return card;
}

// -----------------------------------------------------
// RENDER
// -----------------------------------------------------
function render() {
  const cardsContainer = document.getElementById("cards-container");
  const countElem = document.getElementById("episode-count");

  cardsContainer.textContent = "";

  if (state.error) {
    countElem.textContent = "Error loading data";
    const errorElem = document.createElement("div");
    errorElem.className = "status-message error";
    errorElem.innerHTML = `
      <p>⚠️ Failed to load data: ${state.error}.</p>
    `;
    cardsContainer.append(errorElem);
    return;
  }

  if (state.isLoading) {
    countElem.textContent = "Loading data...";
    const loadingElem = document.createElement("div");
    loadingElem.className = "status-message loading";
    loadingElem.innerHTML = `
      <p>⌛ Loading data, please wait...</p>
    `;
    cardsContainer.append(loadingElem);
    return;
  }

  if (state.viewMode === "shows") {
    cardsContainer.classList.remove("episodes-grid");
    showSelector.style.display = "inline-block";
    backToShowsBtn.style.display = "none";
    episodeSelector.style.display = "none";
    selectedShowTitle.style.display = "none";
    searchInput.placeholder = "Search for a show...";

    let filteredShows = state.shows;

    if (state.searchTerm) {
      const searchTerm = state.searchTerm.toLowerCase();
      filteredShows = state.shows.filter((show) => {
        const name = show.name.toLowerCase();
        const summary = (show.summary || "")
          .replace(/<[^>]*>/g, "")
          .toLowerCase();
        const genres = (show.genres || []).join(" ").toLowerCase();

        return (
          name.includes(searchTerm) ||
          summary.includes(searchTerm) ||
          genres.includes(searchTerm)
        );
      });
    }

    const showCards = filteredShows.map(displayShowCard);
    cardsContainer.append(...showCards);
    countElem.textContent = `Displaying ${filteredShows.length} of ${state.shows.length} shows`;
    return;
  }

  cardsContainer.classList.add("episodes-grid");
  showSelector.style.display = "none";
  backToShowsBtn.style.display = "inline-block";
  episodeSelector.style.display = "inline-block";
  searchInput.placeholder = "Search for an episode...";

  const currentShow = state.shows.find(
    (show) => String(show.id) === String(state.selectedShowId),
  );
  if (currentShow) {
    selectedShowTitle.textContent = currentShow.name;
    selectedShowTitle.style.display = "block";
  }

  let filteredEpisodes = state.episodes;

  if (state.selectedEpisodeCode) {
    filteredEpisodes = state.episodes.filter(
      (episode) => getEpisodeCode(episode) === state.selectedEpisodeCode,
    );
  } else if (state.searchTerm) {
    const searchTerm = state.searchTerm.toLowerCase();
    filteredEpisodes = state.episodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = (episode.summary || "").toLowerCase();

      return (
        episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm)
      );
    });
  }

  const episodeCards = filteredEpisodes.map(displayEpisodeCard);
  cardsContainer.append(...episodeCards);
  countElem.textContent = `Displaying ${filteredEpisodes.length} of ${state.episodes.length} episodes`;
}

// -----------------------------------------------------
// SHOW SELECTOR (dropdown)
// -----------------------------------------------------
function populateShowSelector() {
  // Loop through every show and add it as an <option>
  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;

    showSelector.append(option);
  });
}
// -----------------------------------------------------
// EPISODE SELECTOR (dropdown)
// -----------------------------------------------------

function populateEpisodeSelector() {
  //clear prvious options except the placeholder
  episodeSelector.innerHTML = `
  <option value="placeholder" disabled selected hidden>All episodes or Select...</option>
  <option value="">All episodes or Select...</option>
  `;
  // Loop through every episode and add it as an <option>
  state.episodes.forEach((episode) => {
    const episodeCode = getEpisodeCode(episode);

    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelector.append(option);
  });
}

// -----------------------------------------------------
// REACT TO EVENTS
// -----------------------------------------------------

searchInput.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  const searchTerm = event.target.value;
  state.searchTerm = searchTerm;
  state.selectedEpisodeCode = ""; // Reset selector state

  if (searchTerm) {
    episodeSelector.value = "placeholder"; // Set to hidden placeholder
    clearSearchBtn.style.display = "inline-block";
  } else {
    episodeSelector.value = "placeholder"; // Reset back to default
    clearSearchBtn.style.display = "none";
  }

  //change of state- redo the page
  render();
}

// -----------------------------------------------------
// ADD SHOW SELECTOR LISTENER AND HANDLER
// -----------------------------------------------------

showSelector.addEventListener("change", handleShowSelect);

function handleShowSelect(event) {
  const showId = event.target.value;
  if (showId === "placeholder") return;
  selectShow(showId);
}

async function selectShow(showId) {
  // Update state to episode view mode and set current show
  state.selectedShowId = showId;
  state.viewMode = "episodes";
  showSelector.value = showId;

  // Reset search and selector state
  state.searchTerm = "";
  state.selectedEpisodeCode = "";

  // Reset UI elements
  searchInput.value = "";
  episodeSelector.value = "placeholder";
  clearSearchBtn.style.display = "none";

  // Check if episodes have been fetched yet for this show
  if (state.episodeCache[showId]) {
    state.episodes = state.episodeCache[showId];
    populateEpisodeSelector();
    render();
  } else {
    state.isLoading = true;
    state.error = null;
    render();

    try {
      const episodes = await fetchAllEpisodes(showId);
      // Store episodes in cache
      state.episodeCache[showId] = episodes;
      state.episodes = episodes;
      state.isLoading = false;

      populateEpisodeSelector();
      render();
    } catch (error) {
      state.isLoading = false;
      state.error = error.message || "An unexpected error occurred";
      render();
    }
  }
}

// episode selector
episodeSelector.addEventListener("change", handleEpisodeSelect);

function handleEpisodeSelect(event) {
  const selectedCode = event.target.value;
  if (selectedCode === "placeholder") return;

  state.selectedEpisodeCode = selectedCode;
  state.searchTerm = ""; // Reset search term
  searchInput.value = ""; // Reset search input visually
  clearSearchBtn.style.display = "none";

  render();
}

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  state.searchTerm = "";
  episodeSelector.value = "placeholder"; // Reset dropdown visually
  clearSearchBtn.style.display = "none";
  render();
});

backToShowsBtn.addEventListener("click", () => {
  state.viewMode = "shows";
  state.searchTerm = "";
  state.selectedEpisodeCode = "";
  searchInput.value = "";
  showSelector.value = "placeholder";
  clearSearchBtn.style.display = "none";
  render();
});

// -----------------------------------------------------
// INITIALISE THE PAGE
// -----------------------------------------------------
render(); // Render loading state immediately while fetching

fetchAllShows()
  .then((shows) => {
    // Sort shows alphabetically once and store in state
    state.shows = shows.sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
    populateShowSelector();

    state.viewMode = "shows";
    state.isLoading = false;
    render();
  })
  .catch((error) => {
    state.isLoading = false;
    state.error = error.message || "An unexpected error occurred";
    render();
  });
