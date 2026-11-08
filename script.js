const SHOWS_URL = "https://api.tvmaze.com/shows";

let allShows = [];
let allEpisodes = [];
let selectedShowId = null;

// cache so we never fetch the same episodes URL twice during a visit
const episodeCache = {};

// views
const showsView = document.getElementById("shows-view");
const episodesView = document.getElementById("episodes-view");

// shows listing
const showsContainer = document.getElementById("shows-container");
const showTemplate = document.getElementById("show-card");

// episodes listing
const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");
const searchInput = document.getElementById("search");
const cardContainer = document.getElementById("card-container");
const countDisplay = document.getElementById("count-result");
const template = document.getElementById("episode-card");

async function setup() {
  showShowsView();
  await loadShows();

  showSelect.addEventListener("change", () => {
    if (showSelect.value) {
      openShow(showSelect.value);
    }
  });

  searchInput.addEventListener("input", () => {
    renderEpisodes();
  });

  episodeSelect.addEventListener("change", () => {
    if (episodeSelect.value === "") {
      renderEpisodes();
    } else {
      renderEpisodes([allEpisodes[Number(episodeSelect.value)]]);
    }
  });
}

// ---------- view switching ----------

function showShowsView() {
  showsView.hidden = false;
  episodesView.hidden = true;
}

function showEpisodesView() {
  showsView.hidden = true;
  episodesView.hidden = false;
}

// ---------- shows ----------

// fetch the list of all shows (only called once)
async function loadShows() {
  showsContainer.innerHTML = "<p>Loading shows...</p>";
  showSelect.innerHTML = "<option>Loading shows...</option>";

  try {
    const response = await fetch(SHOWS_URL);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    allShows = await response.json();

    // alphabetical, case-insensitive
    allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    populateShowSelect();
    renderShows();
  } catch (error) {
    console.error(error);
    showSelect.innerHTML = "<option>Could not load shows</option>";
    showsContainer.innerHTML =
      "<p>Sorry, something went wrong loading the shows. Please try again later.</p>";
  }
}

function populateShowSelect() {
  showSelect.innerHTML = "";

  for (const show of allShows) {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.append(option);
  }
}

function createShowCard(show) {
  const card = showTemplate.content.cloneNode(true);

  const nameButton = card.querySelector("[data-show-name]");
  nameButton.textContent = show.name;
  nameButton.addEventListener("click", () => {
    openShow(show.id);
  });

  const image = card.querySelector("img");
  if (show.image) {
    image.src = show.image.medium;
    image.alt = `Poster for ${show.name}`;
  }

  card.querySelector("[data-summary]").innerHTML = show.summary ?? "";

  card.querySelector("[data-genres]").textContent =
    show.genres.length > 0 ? show.genres.join(" | ") : "N/A";

  card.querySelector("[data-status]").textContent = show.status ?? "N/A";

  card.querySelector("[data-rating]").textContent =
    show.rating?.average ?? "N/A";

  card.querySelector("[data-runtime]").textContent = show.runtime
    ? `${show.runtime} min`
    : "N/A";

  return card;
}

function renderShows() {
  showsContainer.innerHTML = "";

  const showCards = allShows.map(createShowCard);
  showsContainer.append(...showCards);
}

// called when a show name is clicked (or picked in the dropdown)
function openShow(showId) {
  selectedShowId = String(showId);
  showSelect.value = selectedShowId;
  searchInput.value = "";

  showEpisodesView();
  loadEpisodes(showId);
}

// ---------- episodes ----------

// fetch episodes for a given show, using the cache if we already have them
async function loadEpisodes(showId) {
  showLoadingMessage();

  if (Object.hasOwn(episodeCache, showId)) {
    allEpisodes = episodeCache[showId];
    populateEpisodeSelect();
    renderEpisodes();
    return;
  }

  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    allEpisodes = data;
    episodeCache[showId] = data;

    populateEpisodeSelect();
    renderEpisodes();
  } catch (error) {
    console.error(error);
    showErrorMessage();
  }
}

function showLoadingMessage() {
  cardContainer.innerHTML = "<p>loading episodes, please wait...</p>";
}

function showErrorMessage() {
  cardContainer.innerHTML =
    "<p>Sorry, something went wrong loading the episodes. Please try again later.</p>";
}

// create episode code of the season and the episode number
function makeEpisodeCode(season, episodeNumber) {
  season = String(season).padStart(2, "0");
  episodeNumber = String(episodeNumber).padStart(2, "0");

  return "S" + season + "E" + episodeNumber;
}

// render the episodes by cloning the template in the html and populating it with data
function createEpisodeCard(episode) {
  const card = template.content.cloneNode(true);
  card.querySelector("h2").textContent = episode.name;

  const episodeNumber = makeEpisodeCode(episode.season, episode.number);
  card.querySelector("[data-episode-number]").textContent = episodeNumber;

  const image = card.querySelector("img");
  if (episode.image) {
    image.src = episode.image.medium;
    image.alt = `Scene from ${episodeNumber}, ${episode.name}`;
  }

  card.querySelector("[data-summary]").innerHTML = episode.summary ?? "";

  return card;
}

// populate the episode dropdown for whichever show is currently loaded
function populateEpisodeSelect() {
  episodeSelect.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = "Select an episode";
  episodeSelect.append(firstOption);

  allEpisodes.forEach((episode, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${makeEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    episodeSelect.append(option);
  });
}

// filter the currently loaded show's episodes and render them
function renderEpisodes(episodeList = allEpisodes) {
  const searchValue = searchInput.value.toLowerCase();

  const filteredEpisodes = episodeList.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchValue) ||
      (episode.summary ?? "").toLowerCase().includes(searchValue),
  );

  cardContainer.innerHTML = "";

  const episodeCards = filteredEpisodes.map(createEpisodeCard);
  cardContainer.append(...episodeCards);

  countDisplay.textContent = `${filteredEpisodes.length}/${allEpisodes.length}`;
}

window.onload = setup;
