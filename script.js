// Level 500, required build only
// Shows listing home page, shows select dropdown, click-through to episodes,
// back link, show search, episode search and selector

const cache = {};
let allShows = [];
let allEpisodes = [];

async function fetchWithCache(url) {
  if (cache[url]) {
    return cache[url];
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  const data = await response.json();
  cache[url] = data;
  return data;
}

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const status = document.createElement("p");
  status.id = "status";
  rootElem.appendChild(status);

  const showsView = document.createElement("div");
  showsView.id = "shows-view";
  rootElem.appendChild(showsView);

  const episodesView = document.createElement("div");
  episodesView.id = "episodes-view";
  episodesView.hidden = true;
  rootElem.appendChild(episodesView);

  const footer = document.createElement("footer");
  footer.innerHTML =
    'Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>';
  rootElem.appendChild(footer);

  await loadShows();
}

// ---------- SHOWS LISTING ----------

async function loadShows() {
  const status = document.getElementById("status");
  status.textContent = "Loading shows, please wait...";
  try {
    const shows = await fetchWithCache("https://api.tvmaze.com/shows");
    allShows = shows
      .slice()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    status.textContent = "";
    renderShowsView();
  } catch (error) {
    status.textContent = "Something went wrong loading shows. Please try refreshing the page.";
    console.error(error);
  }
}

function renderShowsView() {
  const showsView = document.getElementById("shows-view");
  showsView.innerHTML = "";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "show-search";
  searchInput.placeholder = "Search shows by name, genre or summary...";
  searchInput.addEventListener("input", handleShowSearch);
  showsView.appendChild(searchInput);

  const showSelector = document.createElement("select");
  showSelector.id = "show-selector";
  showSelector.addEventListener("change", (event) => {
    const showId = Number(event.target.value);
    if (!showId) return;
    const show = allShows.find((s) => s.id === showId);
    if (show) loadEpisodesForShow(show);
  });
  showsView.appendChild(showSelector);
  populateShowSelector(allShows);

  const count = document.createElement("p");
  count.id = "shows-count";
  showsView.appendChild(count);

  const list = document.createElement("div");
  list.id = "shows-list";
  showsView.appendChild(list);

  renderShowCards(allShows);
}

function populateShowSelector(shows) {
  const selector = document.getElementById("show-selector");
  if (!selector) return;
  const alphabetical = shows
    .slice()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  selector.innerHTML = '<option value="">Jump to a show...</option>';
  alphabetical.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  });
}

function handleShowSearch(event) {
  const term = event.target.value.trim().toLowerCase();
  const filtered = allShows.filter((show) => {
    const name = show.name.toLowerCase();
    const summary = (show.summary || "").toLowerCase();
    return name.includes(term) || summary.includes(term);
  });
  renderShowCards(term === "" ? allShows : filtered);
}

function renderShowCards(shows) {
  const list = document.getElementById("shows-list");
  list.innerHTML = "";
  document.getElementById("shows-count").textContent = `${shows.length} show(s) found`;

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "show-card";

    const name = document.createElement("h2");
    name.textContent = show.name;
    name.className = "show-link";
    name.addEventListener("click", () => loadEpisodesForShow(show));
    card.appendChild(name);

    if (show.image && show.image.medium) {
      const img = document.createElement("img");
      img.src = show.image.medium;
      img.alt = show.name;
      card.appendChild(img);
    }

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ") || "N/A"}`;
    card.appendChild(genres);

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status || "N/A"}`;
    card.appendChild(status);

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${show.rating && show.rating.average ? show.rating.average : "N/A"}`;
    card.appendChild(rating);

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime || "N/A"} min`;
    card.appendChild(runtime);

    const summary = document.createElement("div");
    summary.innerHTML = show.summary || "";
    card.appendChild(summary);

    list.appendChild(card);
  });
}

// ---------- EPISODES VIEW ----------

async function loadEpisodesForShow(show) {
  const status = document.getElementById("status");
  status.textContent = "Loading episodes, please wait...";
  try {
    allEpisodes = await fetchWithCache(`https://api.tvmaze.com/shows/${show.id}/episodes`);
    status.textContent = "";
    renderEpisodesView(show);
    document.getElementById("shows-view").hidden = true;
    document.getElementById("episodes-view").hidden = false;
  } catch (error) {
    status.textContent = "Something went wrong loading episodes. Please try again.";
    console.error(error);
  }
}

function renderEpisodesView(show) {
  const episodesView = document.getElementById("episodes-view");
  episodesView.innerHTML = "";

  const backLink = document.createElement("a");
  backLink.href = "#";
  backLink.id = "back-to-shows";
  backLink.textContent = "← Back to shows";
  backLink.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("episodes-view").hidden = true;
    document.getElementById("shows-view").hidden = false;
  });
  episodesView.appendChild(backLink);

  const heading = document.createElement("h2");
  heading.textContent = show.name;
  episodesView.appendChild(heading);

  episodesView.appendChild(createControls());
  episodesView.appendChild(createEpisodesContainer());

  renderEpisodes(allEpisodes);
  populateSelector(allEpisodes);
}

function createControls() {
  const controls = document.createElement("div");
  controls.id = "controls";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes by name or summary...";
  searchInput.addEventListener("input", handleSearch);

  const matchCount = document.createElement("p");
  matchCount.id = "match-count";

  const selector = document.createElement("select");
  selector.id = "episode-selector";
  selector.addEventListener("change", handleSelect);

  controls.appendChild(searchInput);
  controls.appendChild(matchCount);
  controls.appendChild(selector);

  return controls;
}

function createEpisodesContainer() {
  const container = document.createElement("div");
  container.id = "episodes-container";
  return container;
}

function handleSearch(event) {
  const term = event.target.value.trim().toLowerCase();
  const filtered = allEpisodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    return name.includes(term) || summary.includes(term);
  });
  renderEpisodes(term === "" ? allEpisodes : filtered);
}

function handleSelect(event) {
  const id = event.target.value;
  if (!id) return;
  const target = document.getElementById(`episode-${id}`);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderEpisodes(episodeList) {
  const container = document.getElementById("episodes-container");
  container.innerHTML = "";

  const matchCount = document.getElementById("match-count");
  matchCount.textContent = `${episodeList.length} episode(s) found`;

  episodeList.forEach((episode) => {
    container.appendChild(createEpisodeCard(episode));
  });
}

function populateSelector(episodeList) {
  const selector = document.getElementById("episode-selector");
  selector.innerHTML = '<option value="">Jump to episode...</option>';

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;
  card.appendChild(title);

  if (episode.image && episode.image.medium) {
    const img = document.createElement("img");
    img.src = episode.image.medium;
    img.alt = episode.name;
    card.appendChild(img);
  }

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";
  card.appendChild(summary);

  return card;
}

function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;
