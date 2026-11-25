//You can edit ALL of the code here
const template = document.getElementById("episode-card");

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeCards = episodeList.map(createEpisodeCard);

  document.body.append(...episodeCards);
}

function createEpisodeCard(episode) {
  const card = template.content.cloneNode(true);

  const episodeCode =
    "S" +
    (episode.season > 9 ? "" : "0") +
    episode.season +
    "E" +
    (episode.number > 9 ? "" : "0") +
    episode.number;

  card.querySelector("h3").textContent = episode.name + " - " + episodeCode;
  card.querySelector(".episode-image").src = episode.image.medium;
  card.querySelector(".season-number").textContent = `Season ${episode.season}`;
  card.querySelector(".episode-number").textContent =
    `Episode ${episode.number}`;
  card.querySelector(".episode-summary").innerHTML =
    `Summary: ${episode.summary}`;
  return card;
}

window.onload = setup;
