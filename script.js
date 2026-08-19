const TVMAZE_SHOWS_URL = "https://api.tvmaze.com/shows";
let allShows = [];

function createShowCard(show) {
  const card = document.createElement("div");
  card.className = "show-card";
  const heading = document.createElement("h2");
  heading.textContent = show.name;
  heading.style.cursor = "pointer";
  heading.addEventListener("click", () => showEpisodesView(show));
  card.appendChild(heading);
  const image = document.createElement("img");
  image.src = show.image ? show.image.medium : "";
  image.alt = `Image for ${show.name}`;
  card.appendChild(image);
  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "";
  card.appendChild(summary);
  const genres = document.createElement("p");
  genres.textContent = `Genres: ${show.genres.join(", ")}`;
  card.appendChild(genres);
  const status = document.createElement("p");
  status.textContent = `Status: ${show.status}`;
  card.appendChild(status);
  const rating = document.createElement("p");
  rating.textContent = `Rating: ${show.rating.average ?? "N/A"}`;
  card.appendChild(rating);
  const runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${show.runtime ?? "N/A"} min`;
  card.appendChild(runtime);
  return card;
}

function makePageForShows(showList) {
  const showsListElem = document.getElementById("shows-list");
  showsListElem.textContent = "";

  const count = document.getElementById("show-search-count");
  count.textContent = `Displaying ${showList.length} / ${allShows.length} shows`;

  showList.forEach((show) => {
    showsListElem.appendChild(createShowCard(show));
  });
}

function filterShows(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  return allShows.filter((show) => {
    const name = show.name.toLowerCase();
    const genres = show.genres.join(" ").toLowerCase();
    const summary = (show.summary || "").toLowerCase();
    return name.includes(term) || genres.includes(term) || summary.includes(term);
  });
}

function setupShowSearch() {
  const input = document.getElementById("show-search-input");
  input.addEventListener("input", () => {
    makePageForShows(filterShows(input.value));
  });
}

const episodeCache = {}; // showId -> episodes array

async function showEpisodesView(show) {
  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";

  const oldSearch = document.getElementById("search-input");
  if (oldSearch) oldSearch.closest("div").remove();

  const oldSelector = document.getElementById("episode-selector");
  if (oldSelector) oldSelector.closest("div").remove();

  if (!episodeCache[show.id]) {
    const episodesUrl = `https://api.tvmaze.com/shows/${show.id}/episodes`;
    episodeCache[show.id] = await fetch(episodesUrl).then((r) => r.json());
  }

  allEpisodes = episodeCache[show.id];
  makePageForEpisodes(allEpisodes);
  setupSearch();
  setupEpisodeSelector();
}

function showShowsView() {
  document.getElementById("episodes-view").style.display = "none";
  document.getElementById("shows-view").style.display = "block";
}

async function setup() {
  const showsListElem = document.getElementById("shows-list");
  showsListElem.textContent = "Loading shows...";
  try {
    allShows = await fetch(TVMAZE_SHOWS_URL).then((r) => r.json());
    allShows.sort((a, b) => a.name.localeCompare(b.name));
    makePageForShows(allShows);
    setupShowSearch();
  } catch (error) {
    showsListElem.textContent = "Sorry, we could not load the shows. Please try again later.";
  }
  document.getElementById("back-to-shows").addEventListener("click", (e) => {
    e.preventDefault();
    showShowsView();
  });
}

window.onload = setup;