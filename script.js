//You can edit ALL of the code here
const template = document.getElementById("episode-card");
const container = document.getElementById("episodes");
const searchBox = document.getElementById("search");
const searchCount = document.getElementById("search-count");
const episodeSelect = document.getElementById("episode-select");

const state = { episodes: [], searchTerm: "", selectId: "all" };

function setup() {
  state.episodes = getAllEpisodes();
  populateSelect();
  makePageForEpisodes(state.episodes);
}

function getEpisodeCode(episode) {
  return
    "S" +
    (episode.season > 9 ? "" : "0") +
    episode.season +
    "E" +
    (episode.number > 9 ? "" : "0") +
    episode.number;
}

function createEpisodeCard(episode) {
  const card = template.content.cloneNode(true);
  const episodeCode = getEpisodeCode(episode);

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

function populateSelect() {
  state.episodes.foreach(function (episode) {
    const option = document.createElement("option");
    option.value = episode.id
    option.textContent = `$getEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.append(option);
  });
}

window.onload = setup;
