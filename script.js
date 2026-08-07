//You can edit ALL of the code here

console.log("to display?");

const tvShow = getOneEpisode();

 const tvShowCard = document
.getElementById("tv-show-card")
.content.cloneNode(true);

//console.log(tvShowCard);

 tvShowCard.querySelector("h3").textContent = tvShow.name;
 const image = tvShowCard.querySelector("img");
 image.src = tvShow.image.medium;
 image.alt = tvShow.name;
 tvShowCard.querySelector("p").textContent = tvShow.summary;

  root.appendChild(tvShowCard);

/*
const root = document.getElementById("root");

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
