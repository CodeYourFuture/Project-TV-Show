// You can edit ALL of the code here

let allEpisodes = []; // Global array to store all loaded episodes

function setup() {
  showLoadingMessage();

  // Fetch the episodes ONCE when the website loads
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return response.json();
    })
    .then((episodes) => {
      // Store the fetched data
      allEpisodes = episodes;

      // Remove loading message
      const loadingMessage = document.getElementById("loading-message");
      if (loadingMessage) {
        loadingMessage.remove();
      }

      // Build the page using the fetched data
      createControls();
      makePageForEpisodes(allEpisodes);
    })
    .catch((error) => {
      console.error("Failed to load episodes:", error);
      showErrorMessage();
    });
}

// Shows a message while the API request is in progress
function showLoadingMessage() {
  const rootElem = document.getElementById("root");

  const loadingMessage = document.createElement("p");
  loadingMessage.id = "loading-message";
  loadingMessage.textContent = "Loading episodes, please wait...";

  rootElem.appendChild(loadingMessage);
}

// Shows an error message if the API request fails
function showErrorMessage() {
  const rootElem = document.getElementById("root");

  const loadingMessage = document.getElementById("loading-message");
  if (loadingMessage) {
    loadingMessage.remove();
  }

  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.textContent =
    "Sorry, we couldn't load the episodes. Please try again later.";

  rootElem.appendChild(errorMessage);
}

// Builds top controls: Search bar, Count display, and Drop-down selector
function createControls() {
  const rootElem = document.getElementById("root");

  // Header / Controls container
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "controls-container";

  // 1. Episode Select Dropdown
  const selectElem = document.createElement("select");
  selectElem.id = "episode-select";

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Select an episode...";
  selectElem.appendChild(defaultOption);

  // Populate options
  allEpisodes.forEach((episode) => {
    const code = getEpisodeCode(episode);
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${code} - ${episode.name}`;
    selectElem.appendChild(option);
  });

  // Listener for dropdown selection
  selectElem.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    if (selectedId === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      // Bonus requirement approach: Filter display to ONLY show the selected episode
      const selectedEpisode = allEpisodes.filter(
        (ep) => ep.id.toString() === selectedId
      );
      makePageForEpisodes(selectedEpisode);
    }
  });

  // 2. Search Box Input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  // Immediate filtering on key press/input change
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Reset dropdown to default when searching
    selectElem.value = "ALL";

    // Filter episodes where name OR summary contains the search term (case-insensitive)
    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary
        ? episode.summary.toLowerCase().includes(searchTerm)
        : false;
      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);
  });

  // 3. Count Display Label
  const countLabel = document.createElement("span");
  countLabel.id = "search-count";

  // Append controls
  controlsDiv.appendChild(selectElem);
  controlsDiv.appendChild(searchInput);
  controlsDiv.appendChild(countLabel);

  rootElem.appendChild(controlsDiv);
}

// Helper to construct "S01E01" episode codes
function getEpisodeCode(episode) {
  const seasonPad = String(episode.season).padStart(2, "0");
  const episodePad = String(episode.number).padStart(2, "0");
  return `S${seasonPad}E${episodePad}`;
}

// Renders the cards grid and updates match count
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Update or create count text
  const countLabel = document.getElementById("search-count");
  if (countLabel) {
    countLabel.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episode(s)`;
  }

  // Find existing container or create one
  let container = document.getElementById("episodes-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "episodes-container";
    container.className = "episodes-container";
    rootElem.appendChild(container);
  } else {
    container.innerHTML = ""; // Clear existing grid cards
  }

  // Build card elements
  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";
    card.id = `episode-${episode.id}`;

    const episodeCode = getEpisodeCode(episode);

    // Title + Link to TVMaze
    const title = document.createElement("h2");
    title.className = "episode-title";

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${episode.name} - ${episodeCode}`;

    title.appendChild(link);

    // Medium Image
    const img = document.createElement("img");
    img.className = "episode-image";
    img.src = episode.image ? episode.image.medium : "";
    img.alt = episode.name;

    // Summary
    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "No summary available.";

    // Assemble Card
    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);

    container.appendChild(card);
  });

  // Ensure TVMaze Attribution Footer exists
  let footer = document.querySelector(".tvmaze-attribution");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "tvmaze-attribution";
    footer.innerHTML = `Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>`;
    rootElem.appendChild(footer);
  }
}

window.onload = setup;
