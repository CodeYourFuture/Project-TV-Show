//You can edit ALL of the code here

//This content is from https://www.tvmaze.com/
//specifically: https://api.tvmaze.com/shows/82/episodes

const allEpisodes = getAllEpisodes();

function setup() {
  renderFilms(allEpisodes);
}

// formats episode and season numbers to show 2 digits
const formatEpisodeCode = (prefix, value) =>
  `${prefix}${String(value).padStart(2, "0")}`;

const createFilmCard = (film) => {
  const {
    name,
    season,
    number,
    image: { medium },
    summary,
  } = film;
  const filmCard = document.getElementById("film-card").content.cloneNode(true);
  const title = filmCard.querySelector("h2");
  title.innerText = `${name} - ${formatEpisodeCode(
    "S",
    season
  )}${formatEpisodeCode("E", number)}`;

  const filmImage = filmCard.querySelector("img");
  filmImage.src = medium;
  filmImage.alt = "image from film";

  const filmSummary = filmCard.querySelector("p");
  filmSummary.innerHTML = summary;

  return filmCard;
};

const inputSearch = document.getElementById("input-search");
const countSearch = document.getElementById("count-search");

inputSearch.addEventListener("input", function () {
  const inputSearchValueLowerCase = inputSearch.value.toLowerCase();
  const searchedEpisodes = allEpisodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(inputSearchValueLowerCase) ||
      episode.summary.toLowerCase().includes(inputSearchValueLowerCase)
    );
  });
  renderFilms(searchedEpisodes);
  countSearch.innerText = `Displaying ${searchedEpisodes.length} of 73 episodes`;
});

const renderFilms = (data) => {
  const rootElem = document.getElementById("film-grid");
  rootElem.innerHTML = "";
  const filmCards = data.map(createFilmCard);
  rootElem.append(...filmCards);
};

window.onload = setup;
