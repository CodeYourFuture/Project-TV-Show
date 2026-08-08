//You can edit ALL of the code here


function setup() {
  const tvShows = getAllEpisodes();
  const tvShowCards = tvShows.map(createTvShowCard);
  
  root.append(...tvShowCards);
}

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

window.onload = setup;

/*
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}
*/
