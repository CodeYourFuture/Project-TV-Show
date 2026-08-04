//You can edit ALL of the code here

//This content is from https://www.tvmaze.com/
//specifically: https://api.tvmaze.com/shows/82/episodes

const allEpisodes = getAllEpisodes();

function setup() {
  renderFilms();
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
  const filmCard = document.getElementById('film-card').content.cloneNode(true);
  const title = filmCard.querySelector('h2');
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
  const filmCards = allEpisodes.map(createFilmCard);
  rootElem.append(...filmCards);
};

window.onload = setup;
