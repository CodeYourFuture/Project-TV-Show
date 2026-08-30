function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response;
}
function loadEpisodes(showId) {
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then(checkStatus)
    .then((response) => response.json());
}

function loadShows() {
  return fetch("https://api.tvmaze.com/shows")
    .then(checkStatus)
    .then((response) => response.json());
}

const state = {
  episodes: [],
  shows: [],
  episodesByShow: {},
  searchTerm: "",
  selectedEpisode: null,
  selectedShow: null,
};

const elements = {};

function setup() {
  elements.searchInput = document.getElementById("search-input");
  elements.episodeSelect = document.getElementById("episode-select");
  elements.episodeCount = document.getElementById("episode-count");
  elements.episodesList = document.getElementById("episodes-list");

  // the two control sections
  elements.showControls = document.getElementById("show-controls");
  elements.episodeControls = document.getElementById("episode-controls");

  // front page should show show-controls and hide episode-controls
  elements.showControls.style.display = "block";
  elements.episodeControls.style.display = "none";

  //show font page
  elements.showsList = document.getElementById("shows-list");
  elements.backToShows = document.getElementById("back-to-shows");
  elements.backToEpisodes = document.getElementById("back-to-episodes");
  elements.showsList.style.display = "block";
  elements.episodesList.style.display = "none";
  elements.backToShows.style.display = "none";

  elements.backToEpisodes.addEventListener("click", () => {
    state.selectedEpisode = null;
    elements.episodeSelect.value = "";
    state.searchTerm = "";
    elements.searchInput.value = "";
    renderEpisodes();
  });

  elements.backToShows.addEventListener("click", () => {
    // show front page controls
    elements.showControls.style.display = "block";

    // hide episode controls
    elements.episodeControls.style.display = "none";

    // show shows list
    elements.showsList.style.display = "block";

    // hide episodes list
    elements.episodesList.style.display = "none";

    // hide back button
    elements.backToShows.style.display = "none";

    // reset episode search
    elements.searchInput.value = "";
    state.searchTerm = "";
    state.selectedEpisode = null;
    elements.episodeSelect.value = "";

    // reset genre search
    elements.genreSearch.value = "";
    elements.genreCount.textContent = `Found ${state.shows.length} shows`;

    // reset dropdown to first show
    updateGenreShowOptions(state.shows);

    // show all shows again
    renderShows(state.shows);
  });

  elements.genreSearch = document.getElementById("genre-search");
  elements.genreCount = document.getElementById("genre-count");
  elements.genreShowSelect = document.getElementById("genre-show-select");

  elements.genreSearch.addEventListener("input", filterShows);
  elements.genreShowSelect.addEventListener("change", selectFilteredShow);

  elements.showsList.textContent = "Loading shows...";

  loadShows()
    .then((shows) => {
      state.shows = shows;

      state.shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );

      createEpisodeOptions();

      elements.genreCount.textContent = `Found ${state.shows.length} shows`;

      updateGenreShowOptions(state.shows);

      renderShows(state.shows);

      elements.searchInput.addEventListener("input", searchEpisodes);
      elements.episodeSelect.addEventListener("change", jumpToEpisode);
      renderEpisodes();
    })
    .catch(() => {
      elements.episodesList.textContent =
        "Error loading episodes. Please try again.";
    });
}

function filterShows(event) {
  const term = event.target.value.toLowerCase().trim();

  const filteredShows = state.shows.filter((show) => {
    return (
      show.name.toLowerCase().includes(term) ||
      show.genres.join(" ").toLowerCase().includes(term) ||
      show.summary?.toLowerCase().includes(term)
    );
  });

  elements.genreCount.textContent = `Found ${filteredShows.length} shows`;

  updateGenreShowOptions(filteredShows);

  renderShows(filteredShows);
}

// Open the selected show from the genre dropdown
function selectFilteredShow(event) {
  const showId = event.target.value;

  if (showId === "") {
    elements.genreSearch.value = "";

    elements.genreCount.textContent = `Found ${state.shows.length} shows`;

    updateGenreShowOptions(state.shows);

    renderShows(state.shows);

    return;
  }

  const selected = state.shows.filter((show) => show.id === Number(showId));

  elements.genreCount.textContent = `Found ${selected.length} shows`;

  renderShows(selected);
}
function searchEpisodes(event) {
  state.searchTerm = event.target.value.toLowerCase();
  state.selectedEpisode = null;
  elements.episodeSelect.value = "";
  renderEpisodes();
}

function jumpToEpisode(event) {
  state.selectedEpisode =
    event.target.value === "" ? null : Number(event.target.value);
  state.searchTerm = "";
  elements.searchInput.value = "";
  renderEpisodes();
}

function openShow(showId) {
  state.selectedShow = showId;

  const selected = state.shows.find((show) => show.id == showId);
  document.getElementById("show-display").value = selected.name;

  elements.genreCount.textContent = `Found 1 show`;
  elements.genreCount.style.display = "none";

  // hide front page controls
  elements.showControls.style.display = "none";

  // show episode controls
  elements.episodeControls.style.display = "flex";

  // hide shows list
  elements.showsList.style.display = "none";

  // show episodes list
  elements.episodesList.style.display = "grid";

  // show back button
  elements.backToShows.style.display = "block";

  if (state.episodesByShow[showId]) {
    state.episodes = state.episodesByShow[showId];
    createEpisodeOptions();
    renderEpisodes();
    return;
  }

  loadEpisodes(showId).then((episodes) => {
    state.episodes = episodes;
    state.episodesByShow[showId] = episodes;
    createEpisodeOptions();
    renderEpisodes();
  });
}
// render function for shows list
function renderShows(shows = state.shows) {
  const cards = shows.map(createShowCard);
  elements.showsList.replaceChildren(...cards);
}
function renderEpisodes() {
  const filteredEpisodes = getFilteredEpisodes();
  elements.episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = filteredEpisodes.map(createEpisodeCard);
  elements.episodesList.replaceChildren(...cards);
  const backBtn = document.getElementById("back-to-episodes");

  if (state.selectedEpisode !== null || filteredEpisodes.length === 1) {
    backBtn.style.display = "block";
  } else {
    backBtn.style.display = "none";
  }
}

function createShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";
  card.dataset.id = show.id;

  const title = document.createElement("h2");
  title.className = "show-title";
  title.textContent = show.name;
  title.addEventListener("click", () => openShow(show.id));
  card.appendChild(title);

  const img = document.createElement("img");
  img.className = "show-img";
  img.src = show.image?.medium || "";
  img.alt = show.name;
  card.appendChild(img);

  const content = document.createElement("div");
  content.className = "show-card-content";

  const summaryP = document.createElement("p");
  summaryP.className = "show-summary";
  summaryP.innerHTML = show.summary || "";
  content.appendChild(summaryP);

  card.appendChild(content);

  const info = document.createElement("div");
  info.className = "show-info-box";
  info.innerHTML = `
    <p><strong>Rating:</strong> ${show.rating?.average ?? "N/A"}</p>
    <p><strong>Genres:</strong> ${show.genres.join(" | ")}</p>
    <p><strong>Status:</strong> ${show.status}</p>
    <p><strong>Runtime:</strong> ${show.runtime ?? "N/A"} min</p>
  `;
  card.appendChild(info);

  return card;
}

function createEpisodeCard({ url, name, season, number, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const code = formatEpisodeCode(season, number);

  const title = document.createElement("h3");
  title.textContent = `${name} - ${code}`;
  card.appendChild(title);

  const img = document.createElement("img");
  img.src = image?.medium || "";
  img.alt = name;
  img.loading = "lazy";
  card.appendChild(img);

  //add episode-body wrapper
  const body = document.createElement("div");
  body.className = "episode-body";

  const summaryP = document.createElement("p");
  summaryP.innerHTML = summary;
  body.appendChild(summaryP);

  card.appendChild(body);

  const credit = document.createElement("a");
  credit.className = "credit";
  credit.href = url;
  credit.target = "_blank";
  credit.textContent = "Click To Watch";
  card.appendChild(credit);

  return card;
}
function getFilteredEpisodes() {
  const { selectedEpisode, searchTerm } = state;

  if (selectedEpisode) {
    return [state.episodes.find((ep) => ep.id === selectedEpisode)];
  }

  if (searchTerm) {
    return state.episodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(searchTerm) ||
        ep.summary?.toLowerCase().includes(searchTerm),
    );
  }

  return state.episodes;
}
function createEpisodeOptions() {
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "--Select Episode--";
  elements.episodeSelect.replaceChildren(allOption);
  state.episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number,
    )} - ${episode.name}`;

    elements.episodeSelect.appendChild(option);
  });
}

function updateGenreShowOptions(shows) {
  elements.genreShowSelect.replaceChildren();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- Select Show --";
  elements.genreShowSelect.appendChild(defaultOption);

  if (shows.length === 0) {
    defaultOption.textContent = "No shows found";
    return;
  }

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    elements.genreShowSelect.appendChild(option);
  });

  const term = elements.genreSearch.value.trim();

  if (term !== "") {
    elements.genreShowSelect.value = shows[0].id;
  } else {
    elements.genreShowSelect.value = "";
  }
}

function formatEpisodeCode(season, number) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(number).padStart(2, "0");

  return `S${seasonCode}E${episodeCode}`;
}

window.onload = setup;
