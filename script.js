//You can edit ALL of the code here

const filmGrid = document.getElementById('film-grid');
const singleFilmContainer = document.querySelector('.single-film-grid');
const filterDisplay = document.querySelector('.filter-display');
const searchArea = document.querySelector('.search-area');
const filmSelect = document.getElementById('film-select');
const searchInput = document.getElementById('film-search');
const exitButton = document.querySelector('.exit');
const API_URL = 'https://api.tvmaze.com/shows/82/episodes';

let filmsCache = null;
let filmsPromise = null;

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
        console.log(filmsCache, '<---- filmsCache');
        return filmsCache;
      });
  }
  console.log(filmsCache, '<---- filmsPromise');
  return filmsPromise;
}

// track state of changes
const state = {
  query: '',
  films: [],
  selectedFilm: {},
};

async function setup() {
  showMessage('Loading films...', 1000);

  try {
    const fetchedFilms = await fetchFilms();
    state.films = fetchedFilms;
    console.log('Downloaded films:', fetchedFilms);
    renderFilms();
    populateFilmSelect();

    const loadingMessage = document.querySelector('.app-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }

    showMessage('Films loaded', 1500);
  } catch (error) {
    console.error('Failed to load films:', error);
    showMessage('Sorry, we could not load the films right now.');
  }
}

// formats episode and season numbers to show 2 digits
const formatEpisodeCode = (prefix, value) =>
  `${prefix}${String(value).padStart(2, '0')}`;

const createFilmCard = (film) => {
  const {
    name,
    season,
    number,
    image: { medium },
    summary,
  } = film;
  const filmCard = document
    .getElementById('film-card-template')
    .content.cloneNode(true);
  const title = filmCard.querySelector('h3');
  title.innerText = `${name} - ${formatEpisodeCode('S', season)}${formatEpisodeCode('E', number)}`;

  const filmImage = filmCard.querySelector('img');
  filmImage.src = medium;
  filmImage.alt = 'image from film';

  const filmSummary = filmCard.querySelector('p');
  filmSummary.innerHTML = summary;

  return filmCard;
};

const renderFilms = () => {
  const rootElem = document.getElementById('film-grid');
  rootElem.innerHTML = '';

  const { query, films } = state;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredFilms = films.filter((film) => {
    const name = film.name?.toLowerCase() || '';
    const summary = film.summary?.toLowerCase() || '';

    return name.includes(normalizedQuery) || summary.includes(normalizedQuery);
  });

  const episodeList = normalizedQuery === '' ? films : filteredFilms;

  if (normalizedQuery === '') {
    filterDisplay.innerText = '';
  } else {
    filterDisplay.innerText = `Displaying ${episodeList.length}/${films.length}`;
  }

  const filmCards = episodeList.map(createFilmCard);
  rootElem.append(...filmCards);
};

// populate each option for film select
const populateOption = (film) => {
  const option = document.createElement('option');
  const { id, season, number, name } = film;
  const seasonEpisodeDetails = `${formatEpisodeCode('S', season)}${formatEpisodeCode('E', number)}`;
  option.value = String(id);
  option.textContent = `${seasonEpisodeDetails} - ${name}`;
  return option;
};
// populate film select
const populateFilmSelect = () => {
  filmSelect.innerHTML = '<option value="">Select a film</option>';
  const populateOptions = state.films.map(populateOption);
  filmSelect.append(...populateOptions);
};
// display single film when select option is chosen
const displaySelectedFilm = () => {
  const singleFilmContent = document.querySelector('.show-single-film');
  // get film card
  const chosenFilm = createFilmCard(state.selectedFilm);
  // clear single film grid before adding a film
  singleFilmContent.innerHTML = '';
  // reset state.selectedFilm to empty object
  state.selectedFilm = {};
  singleFilmContent.append(chosenFilm);
  // show the single selected film
  singleFilmContainer.classList.remove('hidden');
  // hide search area and film grid
  searchArea.classList.add('hidden');
  filmGrid.classList.add('hidden');
};

// EVENT LISTENERS
//event listener for search input
searchInput.addEventListener('input', (e) => {
  state.query = e.target.value;
  renderFilms();
});

//event listener for select
filmSelect.addEventListener('change', (e) => {
  if (!e.target.value) return;
  state.selectedFilm = state.films.find(
    (film) => film.id === Number(e.target.value.trim())
  );
  // reset select
  e.target.value = '';
  displaySelectedFilm();
});

// event listener to exit single film grid
exitButton.addEventListener('click', (e) => {
  // hide the single film grid
  singleFilmContainer.classList.add('hidden');
  // show search area and film grid
  searchArea.classList.remove('hidden');
  filmGrid.classList.remove('hidden');
});

window.onload = setup;
