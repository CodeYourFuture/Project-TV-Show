let state = {
  currentView: "SHOWS",
  shows: [],
  episodes: [],
  episodesCache: {},
  selectedShowId: "",
  selectedEpisodeId: "ALL",
  searchTerm: "",
};

async function setup() {
  document
    .getElementById("show-select")
    .addEventListener("change", handleShowSelectChange);
  document
    .getElementById("episode-select")
    .addEventListener("change", handleEpisodeSelectChange);
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearchInput);
  document
    .getElementById("back-to-shows-btn")
    .addEventListener("click", navigateToShowsView);

  try {
    showLoading(true);
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Failed to fetch shows (HTTP Status ${response.status})`);
    }

    const rawShows = await response.json();

    state.shows = rawShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    populateShowDropdown(state.shows);
    render();
  } catch (error) {
    showError(`Error loading shows: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

async function loadEpisodesForShow(showId) {
  showLoading(true);
  hideError();

  try {
    const showIdStr = showId.toString();

    if (state.episodesCache[showIdStr]) {
      state.episodes = state.episodesCache[showIdStr];
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showIdStr}/episodes`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch episodes (HTTP Status ${response.status})`,
        );
      }
      const fetchedEpisodes = await response.json();
      state.episodesCache[showIdStr] = fetchedEpisodes;
      state.episodes = fetchedEpisodes;
    }

    state.selectedShowId = showIdStr;
    state.selectedEpisodeId = "ALL";
    state.searchTerm = "";
    state.currentView = "EPISODES";

    document.getElementById("show-select").value = state.selectedShowId;
    document.getElementById("search-input").value = "";

    populateEpisodeDropdown(state.episodes);
    render();
  } catch (error) {
    showError(`Error loading episodes: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

function navigateToShowsView() {
  state.currentView = "SHOWS";
  state.selectedShowId = "";
  state.selectedEpisodeId = "ALL";
  state.searchTerm = "";

  document.getElementById("show-select").value = "";
  document.getElementById("search-input").value = "";

  render();
}

async function handleShowSelectChange(event) {
  const showId = event.target.value;
  if (!showId) {
    navigateToShowsView();
  } else {
    await loadEpisodesForShow(showId);
  }
}

function handleEpisodeSelectChange(event) {
  state.selectedEpisodeId = event.target.value;
  render();
}

function handleSearchInput(event) {
  state.searchTerm = event.target.value.toLowerCase();
  render();
}

function getFilteredShows() {
  return state.shows.filter((show) => {
    const nameMatch = show.name
      ? show.name.toLowerCase().includes(state.searchTerm)
      : false;
    const summaryMatch = show.summary
      ? show.summary.toLowerCase().includes(state.searchTerm)
      : false;
    const genreMatch = show.genres
      ? show.genres.some((genre) =>
          genre.toLowerCase().includes(state.searchTerm),
        )
      : false;

    return nameMatch || summaryMatch || genreMatch;
  });
}

function getFilteredEpisodes() {
  return state.episodes.filter((episode) => {
    const matchesSelect =
      state.selectedEpisodeId === "ALL" ||
      episode.id.toString() === state.selectedEpisodeId;

    const titleMatch = episode.name
      ? episode.name.toLowerCase().includes(state.searchTerm)
      : false;
    const summaryMatch = episode.summary
      ? episode.summary.toLowerCase().includes(state.searchTerm)
      : false;

    return matchesSelect && (titleMatch || summaryMatch);
  });
}

function render() {
  const showsRoot = document.getElementById("shows-root");
  const episodesRoot = document.getElementById("episodes-root");
  const backBtn = document.getElementById("back-to-shows-btn");
  const episodeSelectElem = document.getElementById("episode-select");
  const searchInput = document.getElementById("search-input");
  const matchCountElem = document.getElementById("match-count");

  if (state.currentView === "SHOWS") {
    showsRoot.hidden = false;
    episodesRoot.hidden = true;
    backBtn.hidden = true;
    episodeSelectElem.hidden = true;
    searchInput.placeholder = "Search shows...";

    const filteredShows = getFilteredShows();
    showsRoot.innerHTML = "";
    const showNodes = filteredShows.map(createShowCard);
    showsRoot.append(...showNodes);

    matchCountElem.textContent = `Displaying ${filteredShows.length}/${state.shows.length} show(s)`;
  } else {
    showsRoot.hidden = true;
    episodesRoot.hidden = false;
    backBtn.hidden = false;
    episodeSelectElem.hidden = false;
    searchInput.placeholder = "Search episodes...";

    const filteredEpisodes = getFilteredEpisodes();
    episodesRoot.innerHTML = "";
    const episodeNodes = filteredEpisodes.map(createEpisodeCard);
    episodesRoot.append(...episodeNodes);

    matchCountElem.textContent = `Displaying ${filteredEpisodes.length}/${state.episodes.length} episode(s)`;
  }
}

function createShowCard(show) {
  const template = document.getElementById("show-template");
  const cardNode = template.content.cloneNode(true);

  const titleElem = cardNode.querySelector(".show-title");
  titleElem.textContent = show.name;
  titleElem.addEventListener("click", () => loadEpisodesForShow(show.id));

  const imgElem = cardNode.querySelector(".show-image");
  imgElem.src = show.image?.medium || "";
  imgElem.alt = show.name || "Show poster";
  imgElem.addEventListener("click", () => loadEpisodesForShow(show.id));

  cardNode.querySelector(".show-summary").innerHTML = show.summary || "";
  cardNode.querySelector(".show-rating").textContent =
    show.rating?.average || "N/A";
  cardNode.querySelector(".show-genres").textContent = show.genres
    ? show.genres.join(", ")
    : "N/A";
  cardNode.querySelector(".show-status").textContent = show.status || "N/A";
  cardNode.querySelector(".show-runtime").textContent = show.runtime
    ? `${show.runtime} mins`
    : "N/A";

  return cardNode;
}

function createEpisodeCard(episode) {
  const template = document.getElementById("episode-template");
  const cardNode = template.content.cloneNode(true);

  const episodeCode = getEpisodeCode(episode);

  cardNode.querySelector(".episode-title").textContent =
    `${episode.name} - ${episodeCode}`;
  cardNode.querySelector(".episode-image").src = episode.image?.medium || "";
  cardNode.querySelector(".episode-image").alt =
    episode.name || "Episode image";
  cardNode.querySelector(".episode-summary").innerHTML = episode.summary || "";

  return cardNode;
}

function populateShowDropdown(shows) {
  const showSelectElem = document.getElementById("show-select");
  showSelectElem.innerHTML = `<option value="">Select a show...</option>`;

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelectElem.appendChild(option);
  });
}

function populateEpisodeDropdown(episodes) {
  const episodeSelectElem = document.getElementById("episode-select");
  episodeSelectElem.innerHTML = `<option value="ALL">All Episodes</option>`;

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    episodeSelectElem.appendChild(option);
  });
}

function getEpisodeCode(episode) {
  const season = episode.season.toString().padStart(2, "0");
  const number = episode.number.toString().padStart(2, "0");
  return `S${season}E${number}`;
}

function showLoading(isLoading) {
  const loadingElem = document.getElementById("loading-indicator");
  loadingElem.hidden = !isLoading;
}

function showError(message) {
  const errorElem = document.getElementById("error-message");
  errorElem.textContent = message;
  errorElem.hidden = false;
}

function hideError() {
  const errorElem = document.getElementById("error-message");
  errorElem.hidden = true;
}

window.onload = setup;
