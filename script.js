//You can edit ALL of the code here

//This content is from https://www.tvmaze.com/
//specifically: https://api.tvmaze.com/shows/82/episodes

const filmGrid = document.getElementById('film-grid');
const allEpisodes = getAllEpisodes();

// formats episode and season numbers to show 2 digits
const formatEpisodeCode = (prefix, value) =>
  `${prefix}${String(value).padStart(2, "0")}`;

const createFilmCard = (film) => {
  const filmCard = document.getElementById("film-card").content.cloneNode(true);
  // Use class selectors instead of tag selectors for title
  const title = filmCard.querySelector(".title");
  title.innerText = `${film.name} - ${formatEpisodeCode(
    "S",
    film.season
  )}${formatEpisodeCode("E", film.number)}`;

  const filmImage = filmCard.querySelector("img");
  filmImage.src = film.image.medium;
  filmImage.alt = "image from film";
  //Use class selectors instead of tag selectors for summary
  const filmSummary = filmCard.querySelector(".summary");
  filmSummary.innerHTML = film.summary;
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

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("film-grid");
  const filmCards = episodeList.map(createFilmCard);
  // Clearing the rootElem(the page )before appending the film cards,so if we rerender the cards again we delete first then append.
  rootElem.innerHTML = "";
  rootElem.append(...filmCards);
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
