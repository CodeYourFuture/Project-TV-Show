let allShows = [];
let allEpisodes = [];

const SHOWS_URL = "https://api.tvmaze.com/shows";
const episodeCache = {};

// Helper function to display messages to the user in the UI
function displayStatusMessage(message, isError = false) {
  const statusContainer =
    document.getElementById("status-message") || createStatusContainer();
  statusContainer.textContent = message;
  statusContainer.style.color = isError ? "red" : "black";
}

function createStatusContainer() {
  const container = document.createElement("div");
  container.id = "status-message";
  container.style.padding = "1rem";
  container.style.fontSize = "1.2rem";
  container.style.textAlign = "center";

  document.body.prepend(container);
  return container;
}

// Fetch shows ONCE on page load
async function setup() {
  displayStatusMessage("Loading shows, please wait...");

  const backBtn = document.getElementById("back-to-shows-btn");
  if (backBtn) {
    backBtn.addEventListener("click", showShowsListingView);
  }

  try {
    const response = await fetch(SHOWS_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    allShows = await response.json();

    // Sort shows alphabetically, case-insensitive
    allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      })
    );

    displayStatusMessage("");
    showShowsListingView();
  } catch (error) {
    displayStatusMessage(
      "Failed to load shows. Please check your internet connection and try refreshing the page.",
      true
    );
  }
}

// View Controller: Shows Listing
function showShowsListingView() {
  const backBtn = document.getElementById("back-to-shows-btn");
  if (backBtn) backBtn.style.display = "none";

  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // Shows controls container (Dropdown + Search)
  const controlsContainer = document.createElement("div");
  controlsContainer.className = "shows-controls-container";

  // Quick Dropdown Selector
  const showSelectLabel = document.createElement("label");
  showSelectLabel.htmlFor = "show-select";
  showSelectLabel.textContent = "Jump to show: ";

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

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

  showSelect.addEventListener("change", async function () {
    const selectedShowId = showSelect.value;
    if (!selectedShowId) return;

    const selectedShow = allShows.find(
      (show) => String(show.id) === String(selectedShowId)
    );
    if (selectedShow) {
      await selectShow(selectedShow);
    }
  });

  // Search input
  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "show-search-input";
  searchLabel.textContent = " Search shows: ";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "show-search-input";
  searchInput.placeholder = "Filter by name, genre, or summary...";

  const resultCount = document.createElement("p");
  resultCount.className = "show-result-count";

  controlsContainer.appendChild(showSelectLabel);
  controlsContainer.appendChild(showSelect);
  controlsContainer.appendChild(searchLabel);
  controlsContainer.appendChild(searchInput);
  controlsContainer.appendChild(resultCount);

  rootElem.appendChild(controlsContainer);

  // Cards Container
  const showsContainer = document.createElement("div");
  showsContainer.className = "shows-container";
  rootElem.appendChild(showsContainer);

  function renderShows(showsList) {
    showsContainer.innerHTML = "";
    resultCount.textContent = `${showsList.length} ${
      showsList.length === 1 ? "show" : "shows"
    } found`;

    showsList.forEach((show) => {
      const card = document.createElement("div");
      card.className = "show-card";

      // Title
      const title = document.createElement("h2");
      title.className = "show-title";
      title.textContent = show.name;
      title.style.cursor = "pointer";
      title.addEventListener("click", () => selectShow(show));

      // Body layout (Image + Info + Summary)
      const contentWrapper = document.createElement("div");
      contentWrapper.className = "show-card-body";

      const img = document.createElement("img");
      img.className = "show-image";
      img.src = show.image ? show.image.medium : "";
      img.alt = show.name;
      img.style.cursor = "pointer";
      img.addEventListener("click", () => selectShow(show));

      const summary = document.createElement("div");
      summary.className = "show-summary";
      summary.innerHTML = show.summary || "No summary available.";

      const details = document.createElement("div");
      details.className = "show-details";
      details.innerHTML = `
        <p><strong>Rated:</strong> ${show.rating?.average || "N/A"}</p>
        <p><strong>Genres:</strong> ${show.genres ? show.genres.join(", ") : "N/A"}</p>
        <p><strong>Status:</strong> ${show.status}</p>
        <p><strong>Runtime:</strong> ${show.runtime ? show.runtime + " mins" : "N/A"}</p>
      `;

      contentWrapper.appendChild(img);
      contentWrapper.appendChild(summary);
      contentWrapper.appendChild(details);

      card.appendChild(title);
      card.appendChild(contentWrapper);

      showsContainer.appendChild(card);
    });
  }

  // Initial render
  renderShows(allShows);

  // Live free-text search (names, genres, summaries)
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase();

    const filteredShows = allShows.filter((show) => {
      const nameMatch = show.name.toLowerCase().includes(query);
      const summaryMatch = (show.summary || "").toLowerCase().includes(query);
      const genreMatch = show.genres.some((genre) =>
        genre.toLowerCase().includes(query)
      );

      return nameMatch || summaryMatch || genreMatch;
    });

    renderShows(filteredShows);
  });
}

// Controller logic for show selection
async function selectShow(show) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const backBtn = document.getElementById("back-to-shows-btn");
  if (backBtn) backBtn.style.display = "inline-block";

  await loadEpisodesForShow(show, rootElem);
}

// Episode fetching with caching
async function loadEpisodesForShow(show, containerElem) {
  const showId = show.id;

  if (episodeCache[showId]) {
    allEpisodes = episodeCache[showId];
    makePageForEpisodes(allEpisodes, show, containerElem);
    return;
  }

  displayStatusMessage(`Loading episodes for ${show.name}, please wait...`);

  try {
    const episodesUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
    const response = await fetch(episodesUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const episodes = await response.json();
    episodeCache[showId] = episodes;
    allEpisodes = episodes;

    displayStatusMessage("");
    makePageForEpisodes(allEpisodes, show, containerElem);
  } catch (error) {
    console.error(error);
    displayStatusMessage(`Failed to load episodes for ${show.name}.`, true);
  }
}

// Render Episode View
function makePageForEpisodes(episodeList, show, episodeArea) {
  episodeArea.innerHTML = "";

  const showTitle = document.createElement("h1");
  showTitle.textContent = show.name;
  episodeArea.appendChild(showTitle);

  // Episode Search Bar
  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";

  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "search-input";
  searchLabel.textContent = "Search episodes: ";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search by episode name or summary...";

  const resultCount = document.createElement("p");
  resultCount.className = "result-count";
  resultCount.textContent = `${episodeList.length} episodes found`;

  searchContainer.appendChild(searchLabel);
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(resultCount);

  episodeArea.appendChild(searchContainer);

  // Jump-to Episode Dropdown
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Jump to an episode...";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const seasonPad = String(episode.season).padStart(2, "0");
    const episodePad = String(episode.number).padStart(2, "0");
    const episodeCode = `S${seasonPad}E${episodePad}`;

    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  episodeArea.appendChild(episodeSelect);

  // Episodes List Container
  const container = document.createElement("div");
  container.className = "episodes-container";

  function displayEpisodes(episodes) {
    container.innerHTML = "";
    resultCount.textContent = `${episodes.length} ${
      episodes.length === 1 ? "episode" : "episodes"
    } found`;

    episodes.forEach((episode) => {
      const card = document.createElement("div");
      card.className = "episode-card";
      card.id = `episode-${episode.id}`;

      const seasonPad = String(episode.season).padStart(2, "0");
      const episodePad = String(episode.number).padStart(2, "0");
      const episodeCode = `S${seasonPad}E${episodePad}`;

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
  }

  episodeArea.appendChild(container);
  displayEpisodes(episodeList);

  // Episode Search Listener
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = (episode.summary || "").toLowerCase();

      return (
        episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm)
      );
    });

    displayEpisodes(filteredEpisodes);
  });

  // Episode Dropdown Listener
  episodeSelect.addEventListener("change", function () {
    const selectedEpisodeId = episodeSelect.value;
    searchInput.value = "";

    if (!selectedEpisodeId) {
      displayEpisodes(allEpisodes);
      return;
    }

    const selectedEpisode = allEpisodes.find(
      (episode) => String(episode.id) === String(selectedEpisodeId)
    );

    if (selectedEpisode) {
      displayEpisodes([selectedEpisode]);
    }
  });

  // TVMaze Footer
  const footer = document.createElement("footer");
  footer.className = "tvmaze-attribution";
  footer.innerHTML = `Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>`;
  episodeArea.appendChild(footer);
}

window.onload = setup;
