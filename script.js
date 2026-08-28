// You can edit ALL of the code here
let allShows = [];
let currentEpisodes = [];
const episodeCache = {};

function setup() {
  showShowsLoading();

  fetchShows()
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );
      renderShowsListing(allShows);
      setupShowSearch();
      setupShowSelectDropdown();
      setupBackButton();
      setupEpisodeSearchListener();
      setupEpisodeSelectorListener();
    })
    .catch(() => {
      showShowsError();
    });
}

// ---------- Fetching ----------

function fetchShows() {
  return fetch("https://api.tvmaze.com/shows").then((response) =>
    response.json(),
  );
}

function fetchEpisodes(showId) {
  if (episodeCache[showId]) {
    return Promise.resolve(episodeCache[showId]);
  }

  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((episodes) => {
      episodeCache[showId] = episodes;
      return episodes;
    });
}

// ---------- Shows listing view ----------

function showShowsLoading() {
  document.getElementById("shows-list").textContent = "Loading shows...";
}

function showShowsError() {
  document.getElementById("shows-list").textContent =
    "Sorry, we could not load the shows. Please try again later.";
}

function renderShowsListing(shows) {
  const listElem = document.getElementById("shows-list");
  listElem.innerHTML = "";

  for (const show of shows) {
    listElem.append(makeShowCard(show));
  }

  document.getElementById("show-search-count").textContent =
    `${shows.length} / ${allShows.length} shows`;
}

function makeShowCard(show) {
  const card = document.createElement("section");
  card.className = "show-card";

  const name = document.createElement("h2");
  name.textContent = show.name;
  name.className = "show-name";
  name.addEventListener("click", () => selectShow(show.id));

  const image = document.createElement("img");
  image.src = show.image ? show.image.medium : "";
  image.alt = show.name;

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "";

  const genres = document.createElement("p");
  genres.textContent = `Genres: ${show.genres && show.genres.length ? show.genres.join(", ") : "N/A"}`;

  const status = document.createElement("p");
  status.textContent = `Status: ${show.status || "N/A"}`;

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${show.rating && show.rating.average ? show.rating.average : "N/A"}`;

  const runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${show.runtime ?? "N/A"} min`;

  card.append(name, image, summary, genres, status, rating, runtime);
  return card;
}

function setupShowSearch() {
  const input = document.getElementById("show-search");

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase();

    const matches = allShows.filter((show) => {
      const genresText = show.genres ? show.genres.join(" ").toLowerCase() : "";
      const summaryText = show.summary ? show.summary.toLowerCase() : "";

      return (
        show.name.toLowerCase().includes(term) ||
        genresText.includes(term) ||
        summaryText.includes(term)
      );
    });

    renderShowsListing(matches);
  });
}

// Level 400's dropdown, kept alongside the Level 500 listing so users
// can either browse/search the full listing OR jump straight to a show.
function setupShowSelectDropdown() {
  const showSelectElem = document.getElementById("show-select");

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelectElem.append(option);
  });

  showSelectElem.addEventListener("change", () => {
    const showId = showSelectElem.value;

    if (showId === "") {
      return;
    }

    selectShow(showId);
  });
}

// ---------- Switching views ----------

function selectShow(showId) {
  showEpisodesView();
  showEpisodesLoading();

  fetchEpisodes(showId)
    .then((episodes) => {
      currentEpisodes = episodes;
      renderEpisodes(currentEpisodes);
      populateEpisodeSelector(currentEpisodes);
      resetEpisodeSearch();
    })
    .catch(() => {
      showEpisodesError();
    });
}

function showEpisodesView() {
  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";
}

function showShowsView() {
  document.getElementById("episodes-view").style.display = "none";
  document.getElementById("shows-view").style.display = "block";
}

function setupBackButton() {
  document.getElementById("back-to-shows").addEventListener("click", () => {
    showShowsView();
  });
}

// ---------- Episodes view ----------

function showEpisodesLoading() {
  document.getElementById("root").textContent = "Loading episodes...";
}

function showEpisodesError() {
  document.getElementById("root").textContent =
    "Sorry, we could not load the episodes. Please try again later.";
}

function renderEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  for (const episode of episodeList) {
    rootElem.append(makeEpisodeCard(episode));
  }

  rootElem.append(makeCredit());
}

function makeEpisodeCard(episode) {
  const card = document.createElement("section");
  card.id = `episode-${episode.id}`;

  const title = document.createElement("h2");
  title.textContent = episode.name;

  const code = document.createElement("p");
  code.textContent = formatEpisodeCode(episode);

  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "";
  image.alt = episode.name;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";

  card.append(title, code, image, summary);
  return card;
}

function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}`;
}

function makeCredit() {
  const credit = document.createElement("p");
  credit.innerHTML =
    'Data originally from <a href="https://www.tvmaze.com" target="_blank">TVMaze.com</a>';
  return credit;
}

// ---------- Episode search & selector ----------
// Listeners are attached ONCE at page load and read from the
// currentEpisodes variable, so they keep working correctly
// no matter how many times you switch shows.

function setupEpisodeSearchListener() {
  const searchInput = document.getElementById("search-input");
  const countDisplay = document.getElementById("search-count");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    const matches = currentEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(term) ||
        (episode.summary && episode.summary.toLowerCase().includes(term))
      );
    });

    renderEpisodes(matches);
    countDisplay.textContent = `${matches.length} / ${currentEpisodes.length} episodes`;
  });
}

function resetEpisodeSearch() {
  document.getElementById("search-input").value = "";
  document.getElementById("search-count").textContent = "";
  document.getElementById("episode-select").value = "";
}

function setupEpisodeSelectorListener() {
  const selectElem = document.getElementById("episode-select");

  selectElem.addEventListener("change", () => {
    const target = document.getElementById(`episode-${selectElem.value}`);

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function populateEpisodeSelector(episodeList) {
  const selectElem = document.getElementById("episode-select");
  selectElem.innerHTML = '<option value="">Jump to episode...</option>';

  for (const episode of episodeList) {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    selectElem.append(option);
  }
}

window.onload = setup;
