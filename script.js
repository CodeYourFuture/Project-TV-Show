let allEpisodes = [];

async function setup() {
  addTvmazeAttribution();
  showLoading();

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allEpisodes = await response.json();

    // Clear loading message and build UI
    const rootElem = document.getElementById("root");
    rootElem.innerHTML = "";

    createControls();
    makePageForEpisodes(allEpisodes);
  } catch (error) {
    showError("Failed to load episode data. Please try again later.");
  }
}

function showLoading() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading episodes, please wait...</p>
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

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "All Episodes";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    const code = formatEpisodeCode(episode.season, episode.number);
    option.textContent = `${code} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes...";

  const countDisplay = document.createElement("span");
  countDisplay.id = "search-count";

  controlsContainer.appendChild(episodeSelect);
  controlsContainer.appendChild(searchInput);
  controlsContainer.appendChild(countDisplay);

  rootElem.parentNode.insertBefore(controlsContainer, rootElem);

  searchInput.addEventListener("input", handleSearch);
  episodeSelect.addEventListener("change", handleSelect);
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
