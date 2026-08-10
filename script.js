//You can edit ALL of the code here

const episodeGrid = document.getElementById("film-grid");
const singleFilmContainer = document.querySelector(".single-film-grid");
const filterDisplay = document.querySelector(".filter-display");
const searchArea = document.querySelector(".search-area");
const filmSelect = document.getElementById("film-select");
const searchInput = document.getElementById("film-search");
const exitButton = document.querySelector(".exit");
const showSelect = document.getElementById("show-select");
const API_URL = "https://api.tvmaze.com/shows/82/episodes";

let cachedShows = null;
let cachedEpisodes = {};
let filmsCache = null;
let filmsPromise = null;

function showMessage(message, duration = 3000) {
  const existingMessage = document.querySelector(".app-message");
  if (existingMessage) existingMessage.remove();

  const messageBox = document.createElement("div");
  messageBox.className = "app-message";
  messageBox.textContent = message;
  document.body.appendChild(messageBox);

  setTimeout(() => {
    messageBox.remove();
  }, duration);
}

async function fetchShows() {
  if (cachedShows) return cachedShows;
  const response = await fetch("https://api.tvmaze.com/shows");
  const data = await response.json();
  data.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  cachedShows = data;
  return cachedShows;
}

function populateShowSelect(shows) {
  showSelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show";
  showSelect.append(defaultOption);
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.append(option);
  });
}

async function fetchEpisodesForShow(showId) {
  const DYNAMIC_EPISODE_URL = `https://api.tvmaze.com/shows/${showId}/episodes`;

  if (cachedEpisodes[showId]) return cachedEpisodes[showId];
  const response = await fetch(DYNAMIC_EPISODE_URL);
  const data = await response.json();
  // Always return an array, handel shows with no episodes.
  const episodes = Array.isArray(data) ? data : [];
  cachedEpisodes[showId] = episodes;
  return cachedEpisodes[showId];
}

async function fetchFilms() {
  if (filmsCache) return filmsCache;

  if (!filmsPromise) {
    filmsPromise = fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        filmsCache = data;
        return filmsCache;
      });
  }
  return filmsPromise;
}

// track state of changes
const state = {
  searchQuery: "",
  episodes: [],
  selectedEpisode: {},
};

async function setup() {
  const shows = await fetchShows();
  populateShowSelect(shows);
  showMessage("Loading films...", 1000);

  try {
    const fetchedFilms = await fetchFilms();
    state.episodes = fetchedFilms;
    renderEpisodes();
    populateEpisodeSelect();

    const loadingMessage = document.querySelector(".app-message");
    if (loadingMessage) {
      loadingMessage.remove();
    }

    showMessage("Films loaded", 1500);
  } catch (error) {
    console.error("Failed to load films:", error);
    showMessage("Sorry, we could not load the films right now.");
  }
}

// formats episode and season numbers to show 2 digits
const formatEpisodeCode = (prefix, value) =>
  `${prefix}${String(value).padStart(2, "0")}`;

const createEpisodeCard = (film) => {
  const { name, season, number, image, summary } = film;

  const medium = image?.medium || "https://placehold.co/210x295?text=No+Image";

  const filmCard = document
    .getElementById("film-card-template")
    .content.cloneNode(true);

  const title = filmCard.querySelector("h3");
  title.innerText = `${name} - ${formatEpisodeCode(
    "S",
    season
  )}${formatEpisodeCode("E", number)}`;

  const filmImage = filmCard.querySelector("img");
  filmImage.src = medium;
  filmImage.alt = `${name} episode image`;

  const filmSummary = filmCard.querySelector("p");
  filmSummary.innerHTML = summary;

  return filmCard;
};

const renderEpisodes = () => {
  const rootElem = document.getElementById("film-grid");
  rootElem.innerHTML = "";

  const { searchQuery: query, episodes: films } = state;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredFilms = films.filter((film) => {
    const name = film.name?.toLowerCase() || "";
    const summary = film.summary?.toLowerCase() || "";

    return name.includes(normalizedQuery) || summary.includes(normalizedQuery);
  });

  const episodeList = normalizedQuery === "" ? films : filteredFilms;

  if (normalizedQuery === "") {
    filterDisplay.innerText = "";
  } else {
    filterDisplay.innerText = `Displaying ${episodeList.length}/${films.length}`;
  }
  // If search returns no results

  const filmCards = episodeList.map(createEpisodeCard);
  rootElem.append(...filmCards);
};

// populate each option for film select
const populateOption = (film) => {
  const option = document.createElement("option");
  const { id, season, number, name } = film;
  const seasonEpisodeDetails = `${formatEpisodeCode(
    "S",
    season
  )}${formatEpisodeCode("E", number)}`;
  option.value = String(id);
  option.textContent = `${seasonEpisodeDetails} - ${name}`;
  return option;
};
// populate film select
const populateEpisodeSelect = () => {
  filmSelect.innerHTML = '<option value="">Select a film</option>';
  const populateOptions = state.episodes.map(populateOption);
  filmSelect.append(...populateOptions);
};
// display single film when select option is chosen
const displaySelectedEpisode = () => {
  const singleFilmContent = document.querySelector(".show-single-film");
  // get film card
  const chosenFilm = createEpisodeCard(state.selectedEpisode);
  // clear single film grid before adding a film
  singleFilmContent.innerHTML = "";
  // reset state.selectedFilm to empty object
  state.selectedEpisode = {};
  singleFilmContent.append(chosenFilm);
  // show the single selected film
  singleFilmContainer.classList.remove("hidden");
  // hide search area and film grid
  searchArea.classList.add("hidden");
  episodeGrid.classList.add("hidden");
};

// EVENT LISTENERS

showSelect.addEventListener("change", async (e) => {
  const showId = e.target.value;
  if (!showId) return;

  const episodes = await fetchEpisodesForShow(showId);
  state.episodes = episodes;
  populateEpisodeSelect();
  renderEpisodes();
});

//event listener for search input
searchInput.addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  renderEpisodes();
});

//event listener for select
filmSelect.addEventListener("change", (e) => {
  if (!e.target.value) return;
  state.selectedEpisode = state.episodes.find(
    (film) => film.id === Number(e.target.value.trim())
  );
  // reset select
  e.target.value = "";
  displaySelectedEpisode();
});

// event listener to exit single film grid
exitButton.addEventListener("click", (e) => {
  // hide the single film grid
  singleFilmContainer.classList.add("hidden");
  // show search area and film grid
  searchArea.classList.remove("hidden");
  episodeGrid.classList.remove("hidden");
});

window.onload = setup;
