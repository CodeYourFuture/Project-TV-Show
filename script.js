const root = document.getElementById("root");
const searchInput = document.getElementById("q");
const filmBox = document.getElementById("film-box");
const status = document.getElementById("status");

const select = document.createElement("select");
const episodeSelect = document.createElement("select");

const option = document.createElement("option");
option.textContent = " Choose a show";
option.value = "";

select.append(option);

const episodeOption = document.createElement("option");
episodeOption.textContent = "Choose an episode";
episodeOption.value = "";

episodeSelect.append(episodeOption);

filmBox.append(select, episodeSelect);

const state = {
  episodes: [],
  searchTerm: "",
  episodeCache: {},
};

fetchShows().then((shows) => {
  shows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  for (const show of shows) {
    const option = document.createElement("option");

    option.textContent = show.name;
    option.value = show.id;

    select.append(option);
  }
});


select.addEventListener("change", function () {
  const showId = select.value;

  if (showId === "") {
    root.innerHTML = "";
    return;
  }
  state.searchTerm = "";
  searchInput.value = "";
  episodeSelect.value = "";

  if (state.episodeCache[showId]) {
    state.episodes = state.episodeCache[showId];

    populateEpisodeSelect(state.episodes);

    renderEpisodes(state.episodes);
    return;
  }

  status.textContent = "Loading episodes...";

  fetchEpisode(showId)
    .then((episodes) => {
      state.episodeCache[showId] = episodes;
      state.episodes = episodes;

      populateEpisodeSelect(episodes);

      status.textContent = "";
      renderEpisodes(episodes);
    })

    .catch((error) => {
      console.log(error);
      status.textContent = "Sorry, we couldn't load the episodes.";
    });
});

function populateEpisodeSelect(episodes) {
  episodeSelect.innerHTML = "";
  
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Choose an episode";
  defaultOption.value = "";

  episodeSelect.append(defaultOption);

  for (const episode of episodes) {
    const opt = document.createElement("option");

    opt.textContent = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;
  
  opt.value = episode.id;

  episodeSelect.append(opt);
  }
}

function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("tv-show-card")
    .content.cloneNode(true);

  const title = episodeCard.querySelector("h3");
  title.textContent = `${episode.name} - S${String(episode.season).padStart(
    2,
    "0",
  )}E${String(episode.number).padStart(2, "0")}`;

  const image = episodeCard.querySelector("img");
  image.src = episode.image.medium;
  image.alt = episode.name;

  const summary = episodeCard.querySelector("p");
  summary.innerHTML = episode.summary;

  const link = episodeCard.querySelector("a");
  link.href = episode.url;
  link.textContent = "Source";
  link.target = "_blank";

  return episodeCard;
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
  const episodeCards = list.map(createEpisodeCard);
  root.append(...episodeCards);
  updateCount(list);
}

function handleSearch() {
  const term = searchInput.value.toLowerCase();
  state.searchTerm = term;

  if (term === "") {
    renderEpisodes(state.episodes);
    return;
  }

  const filteredEpisodes = state.episodes.filter(function (episode) {
    const name = episode.name.toLowerCase();

    return name.indexOf(state.searchTerm) !== -1;
  });

  renderEpisodes(filteredEpisodes);
}

searchInput.addEventListener("keyup", function () {
  handleSearch();
});

episodeSelect.addEventListener("change", function () {
  const episodeId = episodeSelect.value;

  if (episodeId === "") {
    renderEpisodes(state.episodes);
    return;
  }

  const episode = state.episodes.find((ep) => String(ep.id) === episodeId,);
  
  renderEpisodes(episode ? [episode] : []);
});