let allShows = [];
let allEpisodes = [];
let currentShow = null;

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

/* ---------- Shows listing ---------- */

function createShowCard(show) {
  const card = document.createElement("div");
  card.className = "show-card";
  card.id = `show-${show.id}`;

  const heading = document.createElement("h2");
  heading.textContent = show.name;
  heading.style.cursor = "pointer";
  heading.addEventListener("click", () => showEpisodesView(show));

  const image = document.createElement("img");

  if (show.image) {
    image.src = show.image.medium;
  }

  image.alt = `Image for ${show.name}`;

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "No summary available.";

  const genres = document.createElement("p");
  genres.textContent = `Genres: ${show.genres.join(", ")}`;

  const status = document.createElement("p");
  status.textContent = `Status: ${show.status}`;

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${show.rating?.average ?? "N/A"}`;

  const runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${show.runtime ?? "N/A"} min`;

  card.appendChild(heading);

  if (show.image) {
    card.appendChild(image);
  }

  card.appendChild(summary);
  card.appendChild(genres);
  card.appendChild(status);
  card.appendChild(rating);
  card.appendChild(runtime);

  return card;
}

function makePageForShows(showList) {
  const showsRoot = document.getElementById("shows-root");

  showsRoot.textContent = "";

  const counter = document.createElement("p");
  counter.textContent =
    `Displaying ${showList.length} / ${allShows.length} shows`;

  showsRoot.appendChild(counter);

  showList.forEach((show) => {
    const card = createShowCard(show);
    showsRoot.appendChild(card);
  });
}

function setupShowSearch() {
  const showSearchInput = document.getElementById("show-search-input");

  showSearchInput.addEventListener("input", function () {
    const searchTerm = showSearchInput.value.toLowerCase().trim();

    const filteredShows = allShows.filter((show) => {
      const showName = show.name.toLowerCase();
      const showGenres = show.genres.join(" ").toLowerCase();
      const showSummary = (show.summary || "").toLowerCase();

      return (
        showName.includes(searchTerm) ||
        showGenres.includes(searchTerm) ||
        showSummary.includes(searchTerm)
      );
    });

    makePageForShows(filteredShows);
  });
}

/* ---------- Episodes listing ---------- */

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

  const image = document.createElement("img");

  if (episode.image) {
    image.src = episode.image.medium;
  }

  image.alt = `Image for ${episode.name}`;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "No summary available.";

  card.appendChild(heading);

  if (episode.image) {
    card.appendChild(image);
  }

  card.appendChild(summary);

  return card;
}

function makePageForEpisodes(episodeList) {
  const episodesRoot = document.getElementById("episodes-root");

  episodesRoot.textContent = "";

  const counter = document.createElement("p");
  counter.textContent =
    `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  episodesRoot.appendChild(counter);

  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    episodesRoot.appendChild(card);
  });
}

function updateEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");

  episodeSelector.textContent = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose an episode";

  episodeSelector.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;

    episodeSelector.appendChild(option);
  });
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = (episode.summary || "").toLowerCase();

      return (
        episodeName.includes(searchTerm) ||
        episodeSummary.includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);
  });
}

function setupEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");

  episodeSelector.addEventListener("change", function () {
    if (episodeSelector.value === "") {
      return;
    }

    const searchInput = document.getElementById("search-input");

    searchInput.value = "";

    makePageForEpisodes(allEpisodes);

    const selectedEpisode = document.getElementById(
      `episode-${episodeSelector.value}`
    );

    if (selectedEpisode) {
      selectedEpisode.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
}

async function loadEpisodesForShow(showId) {
  const episodesRoot = document.getElementById("episodes-root");
  const searchInput = document.getElementById("search-input");

  episodesRoot.textContent = "Loading episodes...";
  searchInput.value = "";

  try {
    const episodeUrl =
      `https://api.tvmaze.com/shows/${showId}/episodes`;

    allEpisodes = await fetchJsonOnce(episodeUrl);

    updateEpisodeSelector();
    makePageForEpisodes(allEpisodes);
  } catch (error) {
    episodesRoot.textContent =
      "Sorry, we could not load the episodes. Please try again later.";
  }
}

/* ---------- View switching ---------- */

function showEpisodesView(show) {
  currentShow = show;

  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";

  loadEpisodesForShow(show.id);
}

function showShowsView() {
  document.getElementById("episodes-view").style.display = "none";
  document.getElementById("shows-view").style.display = "block";
}

function createEpisodeControls() {
  const episodesRoot = document.getElementById("episodes-root");

  const controls = document.createElement("div");

  const backLink = document.createElement("a");
  backLink.href = "#";
  backLink.id = "back-to-shows";
  backLink.textContent = "← Back to shows";
  backLink.addEventListener("click", function (e) {
    e.preventDefault();
    showShowsView();
  });

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "search-input");
  searchLabel.textContent = " Search episodes: ";

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";

  const episodeLabel = document.createElement("label");
  episodeLabel.setAttribute("for", "episode-selector");
  episodeLabel.textContent = " Select episode: ";

  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";

  const episodeDefault = document.createElement("option");
  episodeDefault.value = "";
  episodeDefault.textContent = "Choose an episode";

  episodeSelector.appendChild(episodeDefault);

  controls.appendChild(backLink);
  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);
  controls.appendChild(episodeLabel);
  controls.appendChild(episodeSelector);

  episodesRoot.parentNode.insertBefore(controls, episodesRoot);
}

function createShowControls() {
  const showsRoot = document.getElementById("shows-root");

  const controls = document.createElement("div");

  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "show-search-input");
  searchLabel.textContent = "Search shows: ";

  const searchInput = document.createElement("input");
  searchInput.id = "show-search-input";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name, genre, or summary";

  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);

  showsRoot.parentNode.insertBefore(controls, showsRoot);
}

/* ---------- Setup ---------- */

async function setup() {
  createShowControls();
  createEpisodeControls();

  const showsRoot = document.getElementById("shows-root");
  showsRoot.textContent = "Loading TV shows...";

  try {
    allShows = await fetchJsonOnce("https://api.tvmaze.com/shows");

    allShows.sort((showA, showB) =>
      showA.name.localeCompare(showB.name, undefined, {
        sensitivity: "base",
      })
    );

    makePageForShows(allShows);
    setupShowSearch();
    setupSearch();
    setupEpisodeSelector();
  } catch (error) {
    showsRoot.textContent =
      "Sorry, we could not load the TV shows. Please try again later.";
  }
}

window.onload = setup;