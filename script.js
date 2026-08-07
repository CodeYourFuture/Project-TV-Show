//You can edit ALL of the code here

console.log("to display?");

const tvShow = getOneEpisode();

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
