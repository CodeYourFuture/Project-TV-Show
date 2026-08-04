//You can edit ALL of the code here

//This content is from https://www.tvmaze.com/
//specifically: https://api.tvmaze.com/shows/82/episodes

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

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

  return filmCard;
};

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("film-grid");
  const filmCards = episodeList.map(createFilmCard);
  // Clearing the rootElem(the page )before appending the film cards,so if we rerender the cards again we delete first then append.
  rootElem.innerHTML = "";
  rootElem.append(...filmCards);
}

window.onload = setup;
