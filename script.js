//You can edit ALL of the code here

const tvShows = getAllEpisodes();

function createTvShowCard(tvShow) {
  const tvShowCard = document
    .getElementById("tv-show-card")
    .content.cloneNode(true);

  tvShowCard.querySelector("h3").textContent = `${tvShow.name} - S${String(
    tvShow.season,
  ).padStart(2, "0")}E${String(tvShow.number).padStart(2, "0")}`;
  const image = tvShowCard.querySelector("img");
  image.src = tvShow.image.medium;
  image.alt = tvShow.name;
  tvShowCard.querySelector("p").innerHTML = tvShow.summary;

  return tvShowCard;
}

const tvShowCards = tvShows.map(createTvShowCard);

root.append(...tvShowCards);


/*
const root = document.getElementById("root"); use map()

//film.forEach((film) => {
  const filmCard = document.createElement("section");

  const title = document.createElement("h1");
  const summary = document.createElement("p");

  summary.textContent = tvShow.summary;
  title.textContent = tvShow.name;
  filmCard.appendChild(title);
  filmCard.appendChild(summary);

  root.appendChild(filmCard);
  */

//});

/*function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

window.onload = setup;*/
