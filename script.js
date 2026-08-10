// You can edit ALL of the code here

const filmGrid = document.getElementById('film-grid');
const showGrid = document.getElementById('show-grid');
const singleFilmContainer = document.querySelector('.single-film-grid');
const filterDisplay = document.querySelector('.filter-display');
const showFilterDisplay = document.querySelector('.show-filter-display');
const searchArea = document.querySelector('.search-area');
const filmSelect = document.getElementById('film-select');
const showSelect = document.getElementById('show-select');
const searchInput = document.getElementById('film-search');
const showSearchInput = document.getElementById('show-search');
const filmControls = document.getElementById('film-controls');
const showControls = document.getElementById('show-controls');
const returnToShowsButton = document.querySelector('.return-to-shows');
const returnToFilmsButton = document.querySelector('.exit');
const API_SHOW_URL = 'https://api.tvmaze.com/shows';

let showsCache = null;
let showsPromise = null;
const filmsCache = new Map();
const filmsPromises = new Map();

const state = {
  filmQuery: '',
  films: [],
  filteredFilms: [],
  showQuery: '',
  shows: [],
  filteredShows: [],
  episodeId: 1,
  selectedFilm: {},
};

async function setup() {
  showMessage('Loading shows...', 1000);

  try {
    const fetchedShows = await fetchShows();
    // sort shows alphabetically by show name on fetching
    if (!fetchedShows) return;
    const sortedShows = fetchedShows
      .map((show) => show)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    state.shows = sortedShows;
    renderFilms();
    renderShows();
    populateShowSelect();
    clearMessage();
    showMessage('Shows loaded', 1500);
  } catch (error) {
    console.error('Failed to load shows:', error);
    showMessage('Sorry, we could not load the shows right now.');
  }
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

function createShowCard(show) {
  const showCard = document
    .getElementById('show-card-template')
    .content.cloneNode(true);

  const showTitle = showCard.querySelector('h2');
  showTitle.dataset.showId = show.id;
  showTitle.innerText = `${show.name}`;
  showTitle.addEventListener('click', () => {
    const normalisedId = showTitle.dataset.showId.trim();
    state.episodeId = Number(normalisedId);
    showFilmsView();
    getFilms(state.episodeId);
  });

  const showImage = showCard.querySelector('img');
  showImage.src = show.image?.medium || '';
  showImage.alt = show.name || 'image from show';

  const showSummary = showCard.querySelector('.show-summary');
  showSummary.innerHTML = show.summary || '';

  const showRating = showCard.querySelector('.show-ratings');
  showRating.innerText = show.rating.average;

  const showGenres = showCard.querySelector('.show-genres');
  showGenres.innerText = show.genres.join(' | ');

  const showStatus = showCard.querySelector('.show-status');
  showStatus.innerText = show.status;

  const showRunTime = showCard.querySelector('.show-runtime');
  showRunTime.innerText = show.runtime;

  return showCard;
}

function populateShowOption(show) {
  const option = document.createElement('option');
  const { id, name } = show;
  option.value = String(id);
  option.textContent = name;
  return option;
}

function populateShowSelect() {
  // clear showSelect before populating it
  showSelect.innerHTML = '';
  const showsToDisplay = state.showQuery.trim()
    ? state.filteredShows
    : state.shows;

  showSelect.append(...showsToDisplay.map(populateShowOption));
}

function renderShows() {
  const showDisplayElem = showGrid;
  showDisplayElem.innerHTML = '';

  const { showQuery, shows } = state;
  const normalisedQuery = showQuery.trim().toLowerCase();

  state.filteredShows = shows.filter((show) => {
    const name = show.name?.toLowerCase() || '';
    const summary = show.summary?.toLowerCase() || '';
    const genres = show.genres?.join(',').toLowerCase() || '';
    return (
      name.includes(normalisedQuery) ||
      summary.includes(normalisedQuery) ||
      genres.includes(normalisedQuery)
    );
  });

  const showList = normalisedQuery === '' ? shows : state.filteredShows;

  document.querySelector('.show-label').innerText =
    `Found ${showList.length} shows`;
  populateShowSelect();
  showDisplayElem.append(...showList.map(createShowCard));
}

function setShowControlsEnabled(isEnabled) {
  showSelect.disabled = !isEnabled;
  showSearchInput.disabled = !isEnabled;
  showControls.classList.toggle('hidden', !isEnabled);
}

function showShowsView() {
  showGrid.classList.remove('hidden');
  filmGrid.classList.add('hidden');
  singleFilmContainer.classList.add('hidden');
  filmControls.classList.add('hidden');
  returnToShowsButton.classList.add('hidden');
  searchArea.classList.remove('hidden');
  setShowControlsEnabled(true);
}

async function fetchFilms(showId = state.episodeId) {
  if (filmsCache.has(showId)) {
    return filmsCache.get(showId);
  }

  if (!filmsPromises.has(showId)) {
    const promise = fetchJson(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    ).then((data) => {
      const normalisedData = Array.isArray(data) ? data : [];
      filmsCache.set(showId, normalisedData);
      return normalisedData;
    });

    filmsPromises.set(showId, promise);
  }

  return filmsPromises.get(showId);
}

function createFilmCard(film) {
  const filmCard = document
    .getElementById('film-card-template')
    .content.cloneNode(true);
  const title = filmCard.querySelector('h3');
  const filmImage = filmCard.querySelector('img');
  const filmSummary = filmCard.querySelector('p');

  title.innerText = `${film.name} - ${formatFilmEpisodeCode('S', film.season)}${formatFilmEpisodeCode('E', film.number)}`;
  filmImage.src = film.image?.medium || '';
  filmImage.alt = film.name || 'image from film';
  filmSummary.innerHTML = film.summary || '';

  return filmCard;
}

function populateFilmOption(film) {
  const option = document.createElement('option');
  const { id, season, number, name } = film;
  const seasonEpisodeDetails = `${formatFilmEpisodeCode('S', season)}${formatFilmEpisodeCode('E', number)}`;
  option.value = String(id);
  option.textContent = `${seasonEpisodeDetails} - ${name}`;
  return option;
}

async function getFilms(showId = state.episodeId) {
  showMessage('Loading films...', 1000);
  try {
    const fetchedFilms = await fetchFilms(showId);
    state.films = Array.isArray(fetchedFilms) ? fetchedFilms : [];
    renderFilms();
    populateFilmSelect();
    clearMessage();
    if (state.films.length === 0) {
      showMessage('No episodes available for this show.', 2000);
    } else {
      showMessage('Films loaded', 1500);
    }
  } catch (error) {
    console.error('Failed to load films:', error);
    showMessage('Sorry, we could not load the films right now.');
  }
}

function formatFilmEpisodeCode(prefix, value) {
  return `${prefix}${String(value).padStart(2, '0')}`;
}

function populateFilmSelect() {
  filmSelect.innerHTML = '<option value="">Select a film</option>';
  filmSelect.append(...state.films.map(populateFilmOption));
}

function displaySelectedFilm() {
  const singleFilmContent = document.querySelector('.show-single-film');
  const chosenFilm = createFilmCard(state.selectedFilm);

  singleFilmContent.innerHTML = '';
  state.selectedFilm = {};
  singleFilmContent.append(chosenFilm);

  showSingleFilmView();
}

function renderFilms() {
  const rootElem = filmGrid;
  rootElem.innerHTML = '';

  const filmsToRender = Array.isArray(state.films) ? state.films : [];
  const { filmQuery } = state;
  const normalisedQuery = filmQuery.trim().toLowerCase();

  state.filteredFilms = filmsToRender.filter((film) => {
    const name = film.name?.toLowerCase() || '';
    const summary = film.summary?.toLowerCase() || '';
    return name.includes(normalisedQuery) || summary.includes(normalisedQuery);
  });

  const episodeList =
    normalisedQuery === '' ? filmsToRender : state.filteredFilms;

  filterDisplay.innerText = `Displaying ${episodeList.length}/${filmsToRender.length}`;

  rootElem.append(...episodeList.map(createFilmCard));
}

function showSingleFilmView() {
  showGrid.classList.add('hidden');
  filmGrid.classList.add('hidden');
  singleFilmContainer.classList.remove('hidden');
  filmControls.classList.add('hidden');
  returnToShowsButton.classList.add('hidden');
  searchArea.classList.add('hidden');
}

function showFilmsView() {
  showGrid.classList.add('hidden');
  filmGrid.classList.remove('hidden');
  singleFilmContainer.classList.add('hidden');
  filmControls.classList.remove('hidden');
  returnToShowsButton.classList.remove('hidden');
  searchArea.classList.remove('hidden');
  setShowControlsEnabled(false);
}

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

// EVENT HANDLERS
searchInput.addEventListener('input', (event) => {
  state.filmQuery = event.target.value;
  renderFilms();
});

showSearchInput.addEventListener('input', (event) => {
  state.showQuery = event.target.value;
  renderShows();
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
});

returnToFilmsButton.addEventListener('click', showFilmsView);

returnToShowsButton.addEventListener('click', showShowsView);

window.onload = () => {
  showShowsView();
  setup();
};
