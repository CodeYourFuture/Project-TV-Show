//You can edit ALL of the code here
const episodeArr = getAllEpisodes();

const state = {
  episodes: episodeArr,
  searchTerm: "",
};

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

function render() {
  const filteredEpisodes = state.episodes.filter(function (tvshow) {
    return tvshow.name.toLowerCase().includes(state.searchTerm.toLowerCase());
  });
  const tvShowCards = filteredEpisodes.map(createTvShowCard);

  document.getElementById("film-box").append(...tvShowCards);
}

render();

const searchInput = document.querySelector("input");
searchInput.addEventListener("keyup", function () {
  state.searchTerm = searchInput.value;
  document.getElementById("film-box").innerHTML = "";
  render();
});
/*
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
}
*/
