// You can edit ALL of the code here

const filmGrid = document.getElementById('film-grid');
const singleFilmContainer = document.querySelector('.single-film-grid');
const filterDisplay = document.querySelector('.filter-display');
const searchArea = document.querySelector('.search-area');
const filmSelect = document.getElementById('film-select');
const showSelect = document.getElementById('show-select');
const searchInput = document.getElementById('film-search');
const exitButton = document.querySelector('.exit');
const API_SHOW_URL = 'https://api.tvmaze.com/shows';

let showsCache = null;
let showsPromise = null;
const filmsCache = new Map();
const filmsPromises = new Map();

const state = {
  query: '',
  films: [],
  shows: [],
  episodeId: 124,
  selectedFilm: {},
};

function showMessage(message, duration = 3000) {
  const existingMessage = document.querySelector('.app-message');
  if (existingMessage) existingMessage.remove();

  const messageBox = document.createElement('div');
  messageBox.className = 'app-message';
  messageBox.textContent = message;
  document.body.appendChild(messageBox);

  setTimeout(() => {
    messageBox.remove();
  }, duration);
}

function clearMessage() {
  document.querySelector('.app-message')?.remove();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function fetchShows() {
  if (showsCache) return showsCache;

  if (!showsPromise) {
    showsPromise = fetchJson(API_SHOW_URL).then((data) => {
      showsCache = data;
      return showsCache;
    });
  }

  return showsPromise;
}

async function fetchFilms(showId = state.episodeId) {
  if (filmsCache.has(showId)) {
    return filmsCache.get(showId);
  }

  if (!filmsPromises.has(showId)) {
    const promise = fetchJson(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    ).then((data) => {
      filmsCache.set(showId, data);
      return data;
    });

    filmsPromises.set(showId, promise);
  }

  return filmsPromises.get(showId);
}

async function setup() {
  showMessage('Loading shows...', 1000);

  try {
    const fetchedShows = await fetchShows();
    state.shows = fetchedShows;
    renderFilms();
    populateShowSelect();
    clearMessage();
    showMessage('Shows loaded', 1500);
  } catch (error) {
    console.error('Failed to load shows:', error);
    showMessage('Sorry, we could not load the shows right now.');
  }
}

async function getFilms(showId = state.episodeId) {
  showMessage('Loading films...', 1000);
  try {
    const fetchedFilms = await fetchFilms(showId);
    state.films = fetchedFilms;
    renderFilms();
    populateFilmSelect();
    clearMessage();
    showMessage('Films loaded', 1500);
  } catch (error) {
    console.error('Failed to load films:', error);
    showMessage('Sorry, we could not load the films right now.');
  }
}

function populateShowOption(show) {
  const option = document.createElement('option');
  const { id, name } = show;
  option.value = String(id);
  option.textContent = name;
  return option;
}

function populateShowSelect() {
  const sortedShows = state.shows
    .map(({ id, name }) => ({ id, name }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

  showSelect.innerHTML = '<option value="">Select a show</option>';
  showSelect.append(...sortedShows.map(populateShowOption));

  // set select to id of first show
  if (sortedShows.length > 0) {
    const firstShowId = sortedShows[0].id;
    state.episodeId = firstShowId;
    showSelect.value = state.episodeId;
    getFilms(state.episodeId);
  }
}

function formatEpisodeCode(prefix, value) {
  return `${prefix}${String(value).padStart(2, '0')}`;
}

function createFilmCard(film) {
  const filmCard = document
    .getElementById('film-card-template')
    .content.cloneNode(true);
  const title = filmCard.querySelector('h3');
  const filmImage = filmCard.querySelector('img');
  const filmSummary = filmCard.querySelector('p');

  title.innerText = `${film.name} - ${formatEpisodeCode('S', film.season)}${formatEpisodeCode('E', film.number)}`;
  filmImage.src = film.image?.medium || '';
  filmImage.alt = film.name || 'image from film';
  filmSummary.innerHTML = film.summary || '';

  return filmCard;
}

function renderFilms() {
  const rootElem = filmGrid;
  rootElem.innerHTML = '';

  const { query, films } = state;
  const normalisedQuery = query.trim().toLowerCase();

  const filteredFilms = films.filter((film) => {
    const name = film.name?.toLowerCase() || '';
    const summary = film.summary?.toLowerCase() || '';
    return name.includes(normalisedQuery) || summary.includes(normalisedQuery);
  });

  const episodeList = normalisedQuery === '' ? films : filteredFilms;

  filterDisplay.innerText = `Displaying ${episodeList.length}/${films.length}`;

  rootElem.append(...episodeList.map(createFilmCard));
}

function populateOption(film) {
  const option = document.createElement('option');
  const { id, season, number, name } = film;
  const seasonEpisodeDetails = `${formatEpisodeCode('S', season)}${formatEpisodeCode('E', number)}`;
  option.value = String(id);
  option.textContent = `${seasonEpisodeDetails} - ${name}`;
  return option;
}

function populateFilmSelect() {
  filmSelect.innerHTML = '<option value="">Select a film</option>';
  filmSelect.append(...state.films.map(populateOption));
}

function displaySelectedFilm() {
  const singleFilmContent = document.querySelector('.show-single-film');
  const chosenFilm = createFilmCard(state.selectedFilm);

  singleFilmContent.innerHTML = '';
  state.selectedFilm = {};
  singleFilmContent.append(chosenFilm);

  singleFilmContainer.classList.remove('hidden');
  searchArea.classList.add('hidden');
  filmGrid.classList.add('hidden');
}

// EVENT HANDLERS
searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderFilms();
});

filmSelect.addEventListener('change', (event) => {
  const selectedValue = event.target.value.trim();
  if (!selectedValue) return;

  state.selectedFilm =
    state.films.find((film) => film.id === Number(selectedValue)) || {};
  event.target.value = '';
  displaySelectedFilm();
});

showSelect.addEventListener('change', async (event) => {
  const selectedValue = event.target.value.trim();
  if (!selectedValue) return;

  state.episodeId = Number(selectedValue);
  await getFilms(state.episodeId);
});

exitButton.addEventListener('click', () => {
  singleFilmContainer.classList.add('hidden');
  searchArea.classList.remove('hidden');
  filmGrid.classList.remove('hidden');
});

window.onload = setup;
