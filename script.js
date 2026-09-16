const cache = {};
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
  status.textContent = "Loading shows, please wait...";
  rootElem.appendChild(status);

  const showSelector = document.createElement("select");
  showSelector.id = "show-selector";
  showSelector.hidden = true;
  showSelector.addEventListener("change", handleShowChange);
  rootElem.appendChild(showSelector);

  const controls = createControls();
  controls.hidden = true;
  rootElem.appendChild(controls);

  const container = createEpisodesContainer();
  rootElem.appendChild(container);

  const footer = document.createElement("footer");
  footer.innerHTML =
    'Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>';
  rootElem.appendChild(footer);

  try {
    const shows = await fetchWithCache("https://api.tvmaze.com/shows");
    const sortedShows = shows
      .slice()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    sortedShows.forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelector.appendChild(option);
    });

    status.textContent = "";
    showSelector.hidden = false;

    const defaultShow = sortedShows.find((s) => s.id === 82) || sortedShows[0];
    showSelector.value = defaultShow.id;
    await loadEpisodesForShow(defaultShow.id);
    controls.hidden = false;
  } catch (error) {
    status.textContent = "Something went wrong loading shows. Please try refreshing the page.";
    console.error(error);
  }
}

async function handleShowChange(event) {
  const showId = event.target.value;
  const status = document.getElementById("status");
  status.textContent = "Loading episodes, please wait...";
  try {
    await loadEpisodesForShow(showId);
    status.textContent = "";
  } catch (error) {
    status.textContent = "Something went wrong loading episodes. Please try again.";
    console.error(error);
  }
}

async function loadEpisodesForShow(showId) {
  allEpisodes = await fetchWithCache(`https://api.tvmaze.com/shows/${showId}/episodes`);
  document.getElementById("search-input").value = "";
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