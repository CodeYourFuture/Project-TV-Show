//You can edit ALL of the code here
// GLOBAL EPISODE STORAGE
let allEpisodes = [];
let allShows = [];
const episodeCache = {};

// Fetch all shows
async function fetchShow() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Failed to fetch shows");
    const data = await response.json();
    return data.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  } catch (error) {
    console.error("Show fetch error:", error);
    return [];
  }
}

// Fetch episodes for a show
async function fetchEpisodes(showId) {
  if (!showId) {
    console.error("fetchEpisodes was called without a showId");
    return [];
  }

  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes...</p>";

  if (episodeCache[showId]) {
    return episodeCache[showId];
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    episodeCache[showId] = data;
    return data;
  } catch (error) {
    rootElem.innerHTML = "<p>Something went wrong. Please try again.</p>";
    console.error("Fetch error:", error);
    return [];
  }
}

// Format SxxExx
function formatEpisodeCode(season, episode) {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(
    2,
    "0"
  )}`;
}

// Create show dropdown
function createShowSelectElement() {
  const showSelect = document.getElementById("show-select");

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  return showSelect;
}

// Create episode dropdown options
function createOptionElements() {
  const createSelect = document.getElementById("episode-select");
  createSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Show all episodes";
  createSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    let option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number
    )} - ${episode.name}`;
    createSelect.appendChild(option);
  });
}

// Episode dropdown change event (FIXED: only one listener)
function EventChange() {
  const createSelect = document.getElementById("episode-select");

  createSelect.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const result = allEpisodes.filter(
        (episode) => episode.id === Number(selectedValue)
      );
      makePageForEpisodes(result);
    }
  });
}

// Search input handler
function handleSearchInput() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();

    const filtered = allEpisodes.filter((episode) => {
      const matchName = episode.name.toLowerCase().includes(searchTerm);
      const matchSummary = episode.summary.toLowerCase().includes(searchTerm);
      const matchCode = formatEpisodeCode(
        episode.season,
        episode.number
      ).toLowerCase().includes(searchTerm);

      return matchName || matchSummary || matchCode;
    });

    makePageForEpisodes(filtered);
  });
}

// Render episodes
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const countElem = document.getElementById("search-count");
  if (countElem) {
    countElem.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;
  }

  const cards = episodeList.map((episode) => createDramaCard(episode));
  rootElem.append(...cards);
}

// Build episode card
function createDramaCard(episode) {
  const card = document.createElement("section");
  card.classList.add("drama-card");

  const episodeCode = formatEpisodeCode(episode.season, episode.number);

  const smallcard = document.createElement("div");
  smallcard.classList.add("small-card");
  smallcard.textContent = `${episode.name} - ${episodeCode}`;
  card.append(smallcard);

  const img = document.createElement("img");
  img.src = episode.image ? episode.image.medium : "";
  card.append(img);

  const summaryElem = document.createElement("div");
  summaryElem.innerHTML = episode.summary;
  card.append(summaryElem);

  return card;
}

// MAIN SETUP
async function setup() {
  // Fetch shows first
  allShows = await fetchShow();
  if (allShows.length === 0) return;

  const showSelect = createShowSelectElement();

  // When user selects a show (LEVEL 400 FIX)
  showSelect.addEventListener("change", async (event) => {
    const showId = event.target.value;

    allEpisodes = await fetchEpisodes(showId);

    createOptionElements(); // rebuild episode selector
    EventChange(); // reattach selector listener
    document.getElementById("search-input").value = ""; // reset search
    makePageForEpisodes(allEpisodes);
  });

  // Load first show automatically
  const initialShowId = allShows[0].id;
  allEpisodes = await fetchEpisodes(initialShowId);

  createOptionElements();
  EventChange();
  handleSearchInput();
  makePageForEpisodes(allEpisodes);
}

window.onload = setup;

