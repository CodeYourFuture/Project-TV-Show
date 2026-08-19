const root = document.getElementById("root");
const searchInput = document.getElementById("q");

const episodeArr = "https://api.tvmaze.com/shows/82/episodes";
const state = {
  episodes: [],
  searchTerm: "",
};

const fetchEpisode = async() => {
  const response = await fetch(episodeArr);
  return await response.json();
};

fetchEpisode().then((episodes) => {
  state.episodes = episodes;
  renderEpisodes(episodes);
});


function createTvShowCard(tvShow) {
  const tvShowCard = document
    .getElementById("tv-show-card")
    .content.cloneNode(true);

  const title = tvShowCard.querySelector("h3");
  title.textContent = `${tvShow.name} - S${String(tvShow.season).padStart(
    2,
    "0",
  )}E${String(tvShow.number).padStart(2, "0")}`;

  const image = tvShowCard.querySelector("img");
  image.src = tvShow.image.medium;
  image.alt = tvShow.name;

  const summary = tvShowCard.querySelector("p");
  summary.innerHTML = tvShow.summary;

  const link = tvShowCard.querySelector("a");
  link.href = tvShow.url;
  link.textContent = "Source";
  link.target = "_blank";

  return tvShowCard;
}

function updateCount(list) {
  const countElement = document.getElementById("search-count");

  // If search box is empty → show total episodes
  if (state.searchTerm.trim() === "") {
    countElement.textContent = `Total episodes: ${state.episodes.length}`;
    return;
  }

  // If typing → show matching episodes
  countElement.textContent = `Matching episodes: ${list.length}`;
}

function renderEpisodes(list) {
  root.innerHTML = "";
  const tvShowCards = list.map(createTvShowCard);
  root.append(...tvShowCards);
  updateCount(list);
}

function handleSearch() {
  const term = searchInput.value.toLowerCase();
  state.searchTerm = term;

  if (term === "") {
    renderEpisodes(state.episodes);
    return;
  }

  const filteredEpisodes = state.episodes.filter(function (tvshow) {
    const name = tvshow.name.toLowerCase();

    let summary = "";
    if (tvshow.summary) {
      summary = tvshow.summary.toLowerCase();
    }

    return name.indexOf(state.searchTerm.toLowerCase()) !== -1;
  });

  renderEpisodes(filteredEpisodes);
}

searchInput.addEventListener("keyup", function () {
  handleSearch();
});
