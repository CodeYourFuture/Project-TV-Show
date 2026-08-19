let allEpisodes = [];
let allShows = [];

// Stores API results so the same URL is never fetched twice
const apiCache = new Map();

function fetchJsonOnce(url) {
  if (!apiCache.has(url)) {
    const request = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load data from ${url}`);
      }
      return response.json();
    });

    apiCache.set(url, request);
  }

  return apiCache.get(url);
}

// ---------- Episode helpers ----------

function getEpisodeCode(episode) {
  const seasonNumber = String(episode.season).padStart(2, "0");
  const episodeNumber = String(episode.number).padStart(2, "0");
  return `S${seasonNumber}E${episodeNumber}`;
}

function createEpisodeCard(episode) {
  const episodeCode = getEpisodeCode(episode);

  const card = document.createElement("div");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;

  const heading = document.createElement("h2");
  heading.textContent = `${episodeCode} - ${episode.name}`;
  card.appendChild(heading);

  if (episode.image) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Image for ${episode.name}`;
    card.appendChild(image);
  }

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "No summary available.";
  card.appendChild(summary);

  return card;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  const counter = document.createElement("p");
  counter.textContent = `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;
  rootElem.appendChild(counter);

  const attribution = document.createElement("p");
  attribution.innerHTML = `Data originally from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>`;
  rootElem.appendChild(attribution);

  episodeList.forEach((episode) => {
    rootElem.appendChild(createEpisodeCard(episode));
  });
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = (episode.summary || "").toLowerCase();
      return episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm);
    });

    makePageForEpisodes(filteredEpisodes);
  });
}

function setupEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", function () {
    if (episodeSelector.value === "") return;

    const searchInput = document.getElementById("search-input");
    searchInput.value = "";

    makePageForEpisodes(allEpisodes);

    const selectedEpisode = document.getElementById(`episode-${episodeSelector.value}`);
    if (selectedEpisode) {
      selectedEpisode.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function createEpisodeControls() {
  const rootElem = document.getElementById("root");
  const controls = document.createElement("div");
  controls.id = "episode-controls";

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "search-input");
  searchLabel.textContent = "Search episodes: ";

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";

  const episodeLabel = document.createElement("label");
  episodeLabel.setAttribute("for", "episode-selector");
  episodeLabel.textContent = "Select episode: ";

  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";

  const episodeDefault = document.createElement("option");
  episodeDefault.value = "";
  episodeDefault.textContent = "Choose an episode";
  episodeSelector.appendChild(episodeDefault);

  controls.append(searchLabel, searchInput, episodeLabel, episodeSelector);
  rootElem.parentNode.insertBefore(controls, rootElem);
}

// ---------- Shows listing ----------

function createShowCard(show) {
  const card = document.createElement("div");
  card.className = "show-card";

  const heading = document.createElement("h2");
  heading.textContent = show.name;
  heading.style.cursor = "pointer";
  heading.addEventListener("click", () => showEpisodesView(show));
  card.appendChild(heading);

  if (show.image) {
    const image = document.createElement("img");
    image.src = show.image.medium;
    image.alt = `Image for ${show.name}`;
    card.appendChild(image);
  }

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "No summary available.";
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

// ---------- View switching ----------

async function showEpisodesView(show) {
  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";

  const rootElem = document.getElementById("root");
  const oldControls = document.getElementById("episode-controls");
  if (oldControls) oldControls.remove();

  rootElem.textContent = "Loading episodes...";

  try {
    const episodeUrl = `https://api.tvmaze.com/shows/${show.id}/episodes`;
    allEpisodes = await fetchJsonOnce(episodeUrl);

    rootElem.textContent = "";
    createEpisodeControls();
    setupSearch();
    setupEpisodeSelector();
    makePageForEpisodes(allEpisodes);
  } catch (error) {
    rootElem.textContent = "Sorry, we could not load the episodes. Please try again later.";
  }
}

function showShowsView() {
  document.getElementById("episodes-view").style.display = "none";
  document.getElementById("shows-view").style.display = "block";
}

// ---------- Setup ----------

async function setup() {
  const showsListElem = document.getElementById("shows-list");
  showsListElem.textContent = "Loading shows...";

  try {
    allShows = await fetchJsonOnce("https://api.tvmaze.com/shows");
    allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

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