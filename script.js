const SHOWS_URL = "https://api.tvmaze.com/shows";
const resetButton = document.getElementById("reset-button");
const backToShowsButton = document.getElementById("back-to-shows");

let shows = [];
let episodes = [];
let selectedShowId = null;

const episodeCache = {};

const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");
const searchInput = document.getElementById("episode-search");
const cardContainer = document.getElementById("card-container");
const countContainer = document.getElementById("count-container");

const episodeTemplate = document.getElementById("episode-card");

// Load shows when the page starts
async function setup() {
  await loadShows();

  // Search shows
  showSelect.addEventListener("change", function () {
    selectedShowId = showSelect.value;

    if (selectedShowId) {
      episodeSelect.style.display = "block";
      searchInput.style.display = "block";

      loadEpisodes(selectedShowId);
    }
  });

  searchInput.addEventListener("input", function () {
    renderEpisodes();
  });

  episodeSelect.addEventListener("change", function () {
    const episodeIndex = Number(episodeSelect.value);

    if (episodeSelect.value === "") {
      renderEpisodes();
      return;
    }

    renderEpisodes([episodes[episodeIndex]]);
  });
  //reset button
  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    episodeSelect.value = "";
    if (selectedShowId) {
      renderEpisodes();
    }
  });
  //Back to shows button
  backToShowsButton.addEventListener("click", function () {
    selectedShowId = null;
    episodes = [];
    showSelect.value = "";
    episodeSelect.innerHTML = '<option value="">Select an episode</option>';
    searchInput.value = "";
    cardContainer.innerHTML = "";
    countContainer.textContent = "";
    episodeSelect.style.display = "none";
    searchInput.style.display = "none";
    showSelect.style.display = "block";
  });
}
// Fetch all shows
async function loadShows() {
  showSelect.innerHTML = "<option>Loading shows...</option>";

  try {
    const response = await fetch(SHOWS_URL);

    if (!response.ok) {
      throw new Error(`Failed to load shows: ${response.status}`);
    }

    const data = await response.json();
    shows = data;

    // Sort alphabetically, ignoring upper/lower case
    shows.sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });

    populateShowSelect();
  } catch (error) {
    console.error(error);
    showSelect.innerHTML = "<option>Could not load shows</option>";
    countContainer.textContent = "Sorry, there was an error loading the shows.";
  }
}

// Put shows into the dropdown
function populateShowSelect() {
  showSelect.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = "Select a show";
  showSelect.append(firstOption);

  for (const show of shows) {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelect.append(option);
  }
}

function renderShows() {
  // use the list of shows to display the shows
  // create show cards
  // put show cards in shows container
  // call this on page load or when reset shows is pressed
}

// Fetch episodes for selected show
async function loadEpisodes(showId) {
  cardContainer.textContent = "Loading episodes...";

  // Don't fetch the same show twice
  if (Object.hasOwn(episodeCache, showId)) {
    episodes = episodeCache[showId];

    populateEpisodeSelect();
    renderEpisodes();

    return;
  }

  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load episodes: ${response.status}`);
    }

    const data = await response.json();
    episodes = data;

    // Save episodes so we don't fetch this URL again
    episodeCache[showId] = data;

    populateEpisodeSelect();
    renderEpisodes();
  } catch (error) {
    console.error(error);
    cardContainer.textContent =
      "Sorry, there was an error loading the episodes.";
  }
}

// Put episodes into the episode dropdown
function populateEpisodeSelect() {
  episodeSelect.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = "Select an episode";

  episodeSelect.append(firstOption);

  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];

    const option = document.createElement("option");

    option.value = i;
    option.textContent = `${makeEpisodeCode(episode.season, episode.number)} - ${episode.name}`;

    episodeSelect.append(option);
  }
}

// Search and display episodes
function renderEpisodes(episodeList = episodes) {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredEpisodes = episodeList.filter(function (episode) {
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      (episode.summary || "").toLowerCase().includes(searchTerm)
    );
  });

  cardContainer.innerHTML = "";

  countContainer.textContent = `Showing ${filteredEpisodes.length} episode(s)`;

  for (const episode of filteredEpisodes) {
    makeEpisodeCard(episode);
  }
}

// Create one episode card
function makeEpisodeCard(episode) {
  const card = episodeTemplate.content.cloneNode(true);

  const code = makeEpisodeCode(episode.season, episode.number);

  card.querySelector('[data-episode="title"]').textContent =
    `${code} - ${episode.name}`;

  card.querySelector('[data-episode="summary"]').innerHTML = episode.summary;

  const image = card.querySelector('[data-episode="image"]');

  if (episode.image) {
    image.src = episode.image.medium;
    image.alt = `Scene from ${episode.name}`;
  }

  cardContainer.append(card);
}

// Create S01E01 format
function makeEpisodeCode(season, episodeNumber) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(episodeNumber).padStart(2, "0");

  return `S${seasonCode}E${episodeCode}`;
}

window.onload = setup;
