//You can edit ALL of the code here

const filmGrid = document.getElementById('film-grid');
const singleFilmContainer = document.querySelector('.single-film-grid');
const filterDisplay = document.querySelector('.filter-display');
const searchArea = document.querySelector('.search-area');
const filmSelect = document.getElementById('film-select');
const searchInput = document.getElementById('film-search');
const exitButton = document.querySelector('.exit');
const allEpisodes = getAllEpisodes();

// track state of changes - eg input searches
const state = {
  query: '',
  films: allEpisodes,
  selectedFilm: {},
};

function setup() {
  renderFilms();
  populateFilmSelect();
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
  // clear film grid before repopulating it
  rootElem.innerHTML = '';

  // input query searches
  const { query, films } = state;
  const filmSearch = films.filter((film) => {
    return (
      film.name.toLowerCase().includes(query) ||
      film.summary.toLowerCase().includes(query)
    );
  });

  let episodeList;

  // check if film list is filtered or not
  if (state.query === '') {
    episodeList = films;
    filterDisplay.innerText = '';
  } else {
    episodeList = filmSearch;
    filterDisplay.innerText = `Displaying ${filmSearch.length}/${films.length}`;
  }
  // create film cards and append to film-grid
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
  const populateOptions = allEpisodes.map(populateOption);
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
  state.query = e.target.value.toLowerCase();
  renderFilms();
});

//event listener for select
filmSelect.addEventListener('change', (e) => {
  if (!e.target.value) return;
  state.selectedFilm = allEpisodes.filter(
    (film) => film.id === Number(e.target.value.trim())
  )[0];
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
