//You can edit ALL of the code here

//This content is from https://www.tvmaze.com/
//specifically: https://api.tvmaze.com/shows/82/episodes

const filmGrid = document.getElementById('film-grid');
const allEpisodes = getAllEpisodes();

const formatEpisodeCode = (prefix, value) => {
  return `${prefix}${String(value).padStart(2, 0)}`;
};

const createFilmCard = ({
  name,
  number,
  season,
  summary,
  image: { medium },
}) => {
  const filmCardTemplate = document
    .getElementById('film-card')
    .content.cloneNode(true);
  const filmTitle = filmCardTemplate.querySelector('h2');
  filmTitle.innerText = `${name} - ${formatEpisodeCode('S', season)}${formatEpisodeCode('E', number)}`;

  const filmImage = filmCardTemplate.querySelector('img');
  filmImage.src = medium;
  filmImage.alt = 'image from film';

  const filmSummary = filmCardTemplate.querySelector('.summary');
  filmSummary.innerHTML = summary;

  return filmCardTemplate;
};

function setup() {
  render();
}

const render = () => {
  const filmCards = allEpisodes.map(createFilmCard);
  console.log(filmCards);
  filmGrid.innerHTML = '';
  filmGrid.append(...filmCards);
};

window.onload = setup;
