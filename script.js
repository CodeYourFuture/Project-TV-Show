//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function createTvCard(episode) {
  const template = document.getElementById("tv-show-card");
  const card = template.content.cloneNode(true);

  card.querySelector("h3").textContent = episode.name;
  card.querySelector("p").innerHTML = episode.summary;

  const img = card.querySelector("img");
  img.src = episode.image.medium;
  img.alt = episode.name;
  return card;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  
  episodeList.forEach((episode) => {
    rootElem.appendChild(createTvCard(episode));
  });
}

window.onload = setup;
