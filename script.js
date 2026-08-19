const TVMAZE_SHOWS_URL = "https://api.tvmaze.com/shows";
let allShows = [];
let allEpisodes = [];
let currentShow = null;

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
  rating.textContent = `Rating: ${show.rating?.average ?? "N/A"}`;
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

function getEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const heading = document.createElement("h3");
  heading.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
  card.appendChild(heading);

  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "";
  image.alt = `Image for ${episode.name}`;
  card.appendChild(image);

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";
  card.appendChild(summary);

  return card;
}

function makePageForEpisodes(episodeList) {
  const episodesListElem = document.getElementById("episodes-list");
  episodesListElem.textContent = "";

  const count = document.getElementById("episode-search-count");
  count.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  episodeList.forEach((episode) => {
    episodesListElem.appendChild(createEpisodeCard(episode));
  });
}

function filterEpisodes(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  return allEpisodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    return name.includes(term) || summary.includes(term);
  });
}

function setupSearch() {
  const input = document.getElementById("search-input");
  input.value = "";
  // Clone+replace to strip any old listener before adding a fresh one
  const freshInput = input.cloneNode(true);
  input.replaceWith(freshInput);
  freshInput.addEventListener("input", () => {
    makePageForEpisodes(filterEpisodes(freshInput.value));
  });
}

function setupEpisodeSelector() {
  const select = document.getElementById("episode-selector");
  select.textContent = "";

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Choose an episode";
  select.appendChild(allOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    select.appendChild(option);
  });

  const freshSelect = select.cloneNode(true);
  select.replaceWith(freshSelect);
  freshSelect.addEventListener("change", () => {
    if (!freshSelect.value) {
      makePageForEpisodes(allEpisodes);
    } else {
      const chosen = allEpisodes.filter((ep) => String(ep.id) === freshSelect.value);
      makePageForEpisodes(chosen);
    }
  });
}

function setupShowSelector() {
  const select = document.getElementById("show-selector");

  if (select.dataset.populated !== "true") {
    allShows.forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      select.appendChild(option);
    });
    select.dataset.populated = "true";

    select.addEventListener("change", () => {
      const chosen = allShows.find((s) => String(s.id) === select.value);
      if (chosen) showEpisodesView(chosen);
    });
  }

  if (currentShow) {
    select.value = currentShow.id;
  }
}

async function showEpisodesView(show) {
  currentShow = show;

  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";

  if (!episodeCache[show.id]) {
    const episodesUrl = `https://api.tvmaze.com/shows/${show.id}/episodes`;
    episodeCache[show.id] = await fetch(episodesUrl).then((r) => r.json());
  }

  allEpisodes = episodeCache[show.id];
  makePageForEpisodes(allEpisodes);
  setupShowSelector();
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