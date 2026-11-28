const SHOWS_URL = "https://api.tvmaze.com/shows";
const resetButton = document.getElementById("reset-button");
const backToShowsButton = document.getElementById("back-to-shows");

const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");
const showSearchInput = document.getElementById("show-search");
const searchInput = document.getElementById("episode-search");
const showsContainer = document.getElementById("shows-container");
const cardContainer = document.getElementById("card-container");
const countContainer = document.getElementById("count-container");

const showTemplate = document.getElementById("show-card");
const episodeTemplate = document.getElementById("episode-card");

let shows = [];
let episodes = [];
let selectedShowId = null;

const episodeCache = Object.create(null);

// Set initial visibility
episodeSelect.style.display = "none";
searchInput.style.display = "none";

// Load shows when the page starts
async function setup() {
  await loadShows();

  // Select a show
  showSelect.addEventListener("change", function () {
    selectedShowId = showSelect.value;

    episodes = [];
    episodeSelect.value = "";
    searchInput.value = "";
    cardContainer.innerHTML = "";

    if (selectedShowId) {
      showsContainer.style.display = "none";
      episodeSelect.style.display = "block";
      searchInput.style.display = "block";

      loadEpisodes(selectedShowId);
    } else {
      showsContainer.style.display = "grid";
      episodeSelect.style.display = "none";
      searchInput.style.display = "none";
      renderShows();
    }
  });

// Search shows
  showSearchInput.addEventListener("input", function () {
    if (!selectedShowId) {
      renderShows();
    }
  });

  // Search episodes

  searchInput.addEventListener("input", function () {
    episodeSelect.value = "";
    renderEpisodes();
  });

 // Select one episode
  episodeSelect.addEventListener("change", function () {
    if (episodeSelect.value ==="") {
      renderEpisodes();
      return;
    }

    const episodeIndex = Number(episodeSelect.value);
    const episode = episodes[episodeIndex];

    if(episode) {
      renderEpisodes([episode]);
    }
  });

  //reset button and episode selection
// Reset search and episode selection
  resetButton.addEventListener("click", function (event) {
    event.preventDefault();

    showSearchInput.value = "";
    searchInput.value = "";
    episodeSelect.value = "";

    if (selectedShowId) {
      renderEpisodes();
    } else {
      renderShows();
    }
  });
// Return to the show list
  backToShowsButton.addEventListener("click", function () {
    selectedShowId = null;
    episodes = [];

    showSelect.value = "";
    episodeSelect.innerHTML =
      '<option value="">Select an episode</option>';

    showSearchInput.value = "";
    searchInput.value = "";

    cardContainer.innerHTML = "";
    countContainer.textContent = "";

    episodeSelect.style.display = "none";
    searchInput.style.display = "none";

    showsContainer.style.display = "grid";
    renderShows();
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

    shows = await response.json();


    shows.sort(function (a, b) {
      return a.name.localeCompare(
        b.name,
        undefined,
        { sensitivity: "base" }
      );
    });

    populateShowSelect();
    renderShows();
  } catch (error) {
    console.error(error);
    showSelect.innerHTML = "<option>Could not load shows</option>";
    countContainer.textContent = "Sorry, there was an error loading the shows.";
  }
}

// Populate  shows into the dropdown
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
// use the list of shows to display the shows
// create show cards
// put show cards in shows container
// call this on page load or when reset shows is pressed

//Display show cards using the HTML template/ Display show cards using the HTML template
function renderShows() {
  const searchTerm = showSearchInput.value.trim().toLowerCase();

  const filteredShows = shows.filter(function (show) {
    const name = (show.name || "").toLowerCase();
    const summary = (show.summary || "")
      .replace(/<[^>]*>/g, "")
      .toLowerCase();

    return (
      name.includes(searchTerm) ||
      summary.includes(searchTerm)
    );
  });

  showsContainer.innerHTML = "";
  countContainer.textContent =
    `Showing ${filteredShows.length} show(s)`;

  for (const show of filteredShows) {
    const card = showTemplate.content.cloneNode(true);

    // Show name
    const title = card.querySelector('[data-show="name"]');
    title.textContent = show.name || "Unknown show";

    title.addEventListener("click", function () {
      showSelect.value = String(show.id);
      showSelect.dispatchEvent(new Event("change"));
    });

    // Show image
    const image = card.querySelector('[data-show="image"]');

    if (show.image?.medium) {
      image.src = show.image.medium;
      image.alt = `Poster for ${show.name}`;
    } else {
      image.removeAttribute("src");
      image.alt = `No poster available for ${show.name}`;
    }

    // Show summary without HTML tags
    card.querySelector('[data-show="summary"]').textContent =
      show.summary
        ? show.summary.replace(/<[^>]*>/g, "")
        : "No summary available.";

    // Show details
    card.querySelector('[data-show="genres"]').textContent =
      show.genres?.join(", ") || "N/A";

    card.querySelector('[data-show="status"]').textContent =
      show.status || "N/A";

    card.querySelector('[data-show="rating"]').textContent =
      show.rating?.average ?? "N/A";

    card.querySelector('[data-show="runtime"]').textContent =
      show.runtime ?? "N/A";

    showsContainer.append(card);
  }
}

// Fetch episodes for a selected show
async function loadEpisodes(showId) {
  cardContainer.textContent = "Loading episodes...";
  countContainer.textContent = "";

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

    // Ignore stale responses if another show was selected
    if (String(selectedShowId) !== String(showId)) {
      return;
    }

    episodes = data;
    episodeCache[showId] = data;

    populateEpisodeSelect();
    renderEpisodes();
  } catch (error) {
    console.error(error);

    if (String(selectedShowId) === String(showId)) {
      cardContainer.textContent =
        "Sorry, there was an error loading the episodes.";
    }
  }
}

// Populate the episode dropdown
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
    option.textContent =
      `${makeEpisodeCode(episode.season, episode.number)} - ${episode.name}`;

    episodeSelect.append(option);
  }
}

// Search and display episodes
function renderEpisodes(episodeList = episodes) {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredEpisodes = episodeList.filter(function (episode) {
    const name = (episode.name || "").toLowerCase();
    const summary = (episode.summary || "")
      .replace(/<[^>]*>/g, "")
      .toLowerCase();

    return (
      name.includes(searchTerm) ||
      summary.includes(searchTerm)
    );
  });

  cardContainer.innerHTML = "";
  countContainer.textContent =
    `Showing ${filteredEpisodes.length} episode(s)`;

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

  // Summary is HTML supplied by TVMaze, so display it as text
  card.querySelector('[data-episode="summary"]').textContent =
    episode.summary
      ? episode.summary.replace(/<[^>]*>/g, "")
      : "No summary available.";

  const image = card.querySelector('[data-episode="image"]');

  if (episode.image?.medium) {
    image.src = episode.image.medium;
    image.alt = `Scene from ${episode.name}`;
  } else {
    image.removeAttribute("src");
    image.alt = `No image available for ${episode.name}`;
  }

  cardContainer.append(card);
}

// Create S01E01 episode codes
function makeEpisodeCode(season, episodeNumber) {
  const seasonCode = String(season ?? 0).padStart(2, "0");
  const episodeCode = String(episodeNumber ?? 0).padStart(2, "0");

  return `S${seasonCode}E${episodeCode}`;
}

window.addEventListener("DOMContentLoaded", setup);