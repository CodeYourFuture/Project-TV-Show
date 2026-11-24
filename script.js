//You can edit ALL of the code here
const template = document.getElementById("episode-card");

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  //const rootElem = document.getElementById("root");

  const episodeCards = episodeList.map(createEpisodeCard);

  document.body.append(...episodeCards);

  //rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}

function createEpisodeCard(episode){
  const card = template.content.cloneNode(true);
  card.querySelector("h3").textContent = episode.name;
  card.querySelector(".season-number").textContent = episode.season;
  console.log(card.querySelector(".season-number").textContent);
  card.querySelector(".episode-number").textContent = episode.number;
  card.querySelector(".episode-summary").textContent = episode.summary;
  return card;
}

window.onload = setup;
