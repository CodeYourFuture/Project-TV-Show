let allShows = [];
let allEpisodes = [];

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

function removeHtml(htmlText) {
  const temporaryElement = document.createElement("div");
  temporaryElement.innerHTML = htmlText || "";

  return temporaryElement.textContent || "";
}

function createShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";

  if (show.image) {
    const image = document.createElement("img");
    image.src = show.image.medium;
    image.alt = `Poster for ${show.name}`;
    card.appendChild(image);
  }

  const titleButton = document.createElement("button");
  titleButton.className = "show-title";
  titleButton.textContent = show.name;

  titleButton.addEventListener("click", function () {
    showEpisodes(show);
  });

  const details = document.createElement("div");
  details.className = "show-details";

  const genres = document.createElement("p");
  genres.innerHTML =
    `<strong>Genres:</strong> ${(show.genres || []).join(", ") || "Not available"}`;

  const status = document.createElement("p");
  status.innerHTML =
    `<strong>Status:</strong> ${show.status || "Not available"}`;

  const rating = document.createElement("p");
  rating.innerHTML =
    `<strong>Rating:</strong> ${show.rating?.average ?? "Not rated"}`;

  const runtime = document.createElement("p");
  runtime.innerHTML =
    `<strong>Runtime:</strong> ${
      show.runtime ? `${show.runtime} minutes` : "Not available"
    }`;

  const summary = document.createElement("p");
  summary.className = "show-summary";
  summary.textContent =
    removeHtml(show.summary) || "No summary available.";

  details.appendChild(titleButton);
  details.appendChild(genres);
  details.appendChild(status);
  details.appendChild(rating);
  details.appendChild(runtime);
  details.appendChild(summary);

  card.appendChild(details);

  return card;
}

function displayShows(showList) {
  const rootElem = document.getElementById("root");
  const statusText = document.getElementById("status-text");

  rootElem.className = "shows-grid";
  rootElem.textContent = "";

  statusText.textContent =
    `Displaying ${showList.length} / ${allShows.length} shows`;

  showList.forEach((show) => {
    rootElem.appendChild(createShowCard(show));
  });
}

function showShowsPage() {
  const backButton = document.getElementById("back-to-shows");
  const controls = document.getElementById("controls");

  backButton.hidden = true;

  controls.innerHTML = `
    <label for="show-selector">Select show:</label>

    <select id="show-selector">
      <option value="">Choose a show</option>
    </select>

    <label for="show-search">Search shows:</label>

    <input
      id="show-search"
      type="search"
      placeholder="Search by name, genre or summary"
    />
  `;

  const showSelector = document.getElementById("show-selector");

  allShows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelector.appendChild(option);
  });

  showSelector.addEventListener("change", function () {
    if (showSelector.value === "") {
      return;
    }

    const selectedShow = allShows.find(
      (show) => show.id === Number(showSelector.value)
    );

    if (selectedShow) {
      showEpisodes(selectedShow);
    }
  });

  displayShows(allShows);

  const showSearch = document.getElementById("show-search");

  showSearch.addEventListener("input", function () {
    const searchTerm = showSearch.value.toLowerCase().trim();

    const filteredShows = allShows.filter((show) => {
      const showName = show.name.toLowerCase();

      const showGenres = (show.genres || [])
        .join(" ")
        .toLowerCase();

      const showSummary = removeHtml(show.summary)
        .toLowerCase();

      return (
        showName.includes(searchTerm) ||
        showGenres.includes(searchTerm) ||
        showSummary.includes(searchTerm)
      );
    });

    displayShows(filteredShows);
  });
}

function getEpisodeCode(episode) {
  const seasonNumber = String(episode.season).padStart(2, "0");
  const episodeNumber = String(episode.number).padStart(2, "0");

  return `S${seasonNumber}E${episodeNumber}`;
}

function createEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;

  const heading = document.createElement("h2");
  heading.textContent =
    `${getEpisodeCode(episode)} - ${episode.name}`;

  card.appendChild(heading);

  if (episode.image) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Image for ${episode.name}`;

    card.appendChild(image);
  }

  const summary = document.createElement("p");
  summary.textContent =
    removeHtml(episode.summary) || "No summary available.";

  card.appendChild(summary);

  return card;
}

function displayEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const statusText = document.getElementById("status-text");

  rootElem.className = "episodes-grid";
  rootElem.textContent = "";

  statusText.textContent =
    `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  episodeList.forEach((episode) => {
    rootElem.appendChild(createEpisodeCard(episode));
  });
}

function updateEpisodeSelector() {
  const selector = document.getElementById("episode-selector");

  selector.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose an episode";

  selector.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent =
      `${getEpisodeCode(episode)} - ${episode.name}`;

    selector.appendChild(option);
  });
}

function setupEpisodeControls() {
  const searchInput =
    document.getElementById("episode-search");

  const episodeSelector =
    document.getElementById("episode-selector");

  searchInput.addEventListener("input", function () {
    const searchTerm =
      searchInput.value.toLowerCase().trim();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const episodeName =
        episode.name.toLowerCase();

      const episodeSummary =
        removeHtml(episode.summary).toLowerCase();

      return (
        episodeName.includes(searchTerm) ||
        episodeSummary.includes(searchTerm)
      );
    });

    displayEpisodes(filteredEpisodes);
  });

  episodeSelector.addEventListener("change", function () {
    if (episodeSelector.value === "") {
      return;
    }

    searchInput.value = "";

    displayEpisodes(allEpisodes);

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

async function showEpisodes(show) {
  const controls = document.getElementById("controls");
  const rootElem = document.getElementById("root");
  const statusText = document.getElementById("status-text");
  const backButton = document.getElementById("back-to-shows");

  backButton.hidden = false;

  controls.innerHTML = `
    <div class="episode-controls">
      <h2>${show.name} Episodes</h2>

      <label for="episode-search">
        Search episodes:
      </label>

      <input
        id="episode-search"
        type="search"
        placeholder="Search by name or summary"
      />

      <label for="episode-selector">
        Select episode:
      </label>

      <select id="episode-selector">
        <option value="">
          Choose an episode
        </option>
      </select>
    </div>
  `;

  rootElem.textContent = "";
  statusText.textContent = "Loading episodes...";

  try {
    const url =
      `https://api.tvmaze.com/shows/${show.id}/episodes`;

    allEpisodes = await fetchJsonOnce(url);

    updateEpisodeSelector();
    setupEpisodeControls();
    displayEpisodes(allEpisodes);
  } catch (error) {
    statusText.textContent =
      "Unable to load episodes.";

    rootElem.textContent =
      "Sorry, we could not load the episodes.";
  }
}

async function setup() {
  const rootElem = document.getElementById("root");
  const statusText = document.getElementById("status-text");
  const backButton = document.getElementById("back-to-shows");

  statusText.textContent = "Loading TV shows...";
  rootElem.textContent = "Please wait...";

  backButton.addEventListener("click", function () {
    showShowsPage();
  });

  try {
    allShows = await fetchJsonOnce(
      "https://api.tvmaze.com/shows"
    );

    allShows.sort((showA, showB) =>
      showA.name.localeCompare(showB.name, undefined, {
        sensitivity: "base",
      })
    );

    showShowsPage();
  } catch (error) {
    statusText.textContent =
      "Unable to load TV shows.";

    rootElem.textContent =
      "Sorry, we could not load the TV shows.";
  }
}

window.onload = setup;