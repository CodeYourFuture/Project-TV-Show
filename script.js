//You can edit ALL of the code here
const template = document.getElementById("episode-card");
const container = document.getElementById("episodes");
const searchBox = document.getElementById("search");
const searchCount = document.getElementById("search-count");

const state = { episodes: [], searchTerm: "" };

function setup() {
  state.episodes = getAllEpisodes();
  makePageForEpisodes(state.episodes);
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

function makePageForEpisodes(episodeList) {
  const episodeCards = episodeList.map(createEpisodeCard);
  container.replaceChildren(...episodeCards);
}

function render() {
  const filteredEpisodes = state.episodes.filter(function (episode) {
    return episode.name.toLowerCase().includes(state.searchTerm.toLowerCase());
  });

  if (state.searchTerm.trim() === "") {
    searchCount.textContent = "";
  } else {
    searchCount.textContent = `Episodes found: ${filteredEpisodes.length}`;
  }

  makePageForEpisodes(filteredEpisodes);
}

searchBox.addEventListener("input", function () {
  state.searchTerm = searchBox.value;
  render();
});

window.onload = setup;
