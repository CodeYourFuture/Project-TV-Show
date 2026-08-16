let allShows = [];
let allEpisodes = [];

const showCache = new Map();
const episodeCache = new Map();

function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}`;
}

// FETCH SHOWS

async function fetchShows() {
  const showsRoot = document.getElementById("shows-root");

  showsRoot.textContent = "Loading shows...";

  try {
    // Check cache first
    if (showCache.has("shows")) {
      allShows = showCache.get("shows");
    } else {
      const response = await fetch("https://api.tvmaze.com/shows");

      if (!response.ok) {
        throw new Error("Failed to fetch shows");
      }

      allShows = await response.json();

      // Save shows so we never fetch this URL again
      showCache.set("shows", allShows);
    }

    allShows.sort(function (showA, showB) {
      return showA.name.localeCompare(showB.name, undefined, {
        sensitivity: "base",
      });
    });

    makePageForShows(allShows);

    document.getElementById("show-count").textContent =
      `Showing ${allShows.length} shows`;
  } catch (error) {
    showsRoot.textContent =
      "Sorry, we could not load the shows. Please try again later.";

    console.error(error);
  }
}

// DISPLAY SHOWS

function makePageForShows(showList) {
  const showsRoot = document.getElementById("shows-root");

  showsRoot.innerHTML = "";

  showList.forEach(function (show) {
    const showBox = document.createElement("div");

    showBox.className = "show";

    showBox.innerHTML = `
     <img 
    src="${show.image ? show.image.medium : ""}" 
    alt="${show.name}"
  >

  <div class="show-info">
    <h2>
      <a href="#" class="show-name" data-show-id="${show.id}">
        ${show.name}
      </a>
    </h2>

    <p>${show.summary || "No summary available."}</p>

    <p>
      <strong>Genres:</strong>
      ${show.genres.length > 0 ? show.genres.join(", ") : "N/A"}
    </p>

    <p>
      <strong>Status:</strong>
      ${show.status || "N/A"}
    </p>

    <p>
      <strong>Rating:</strong>
      ${show.rating.average || "N/A"}
    </p>

    <p>
      <strong>Runtime:</strong>
      ${show.runtime || "N/A"} minutes
    </p>
  </div>
`;

    showsRoot.appendChild(showBox);
  });

  setupShowLinks();
}

// SHOW SEARCH

function setupShowSearch() {
  const searchInput = document.getElementById("show-search-input");
  const showCount = document.getElementById("show-count");

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value.toLowerCase();

    const filteredShows = allShows.filter(function (show) {
      const name = show.name.toLowerCase();

      const summary = show.summary ? show.summary.toLowerCase() : "";

      const genres = show.genres ? show.genres.join(" ").toLowerCase() : "";

      return (
        name.includes(searchTerm) ||
        summary.includes(searchTerm) ||
        genres.includes(searchTerm)
      );
    });

    showCount.textContent = `Showing ${filteredShows.length} shows`;

    makePageForShows(filteredShows);
  });
}

// SHOW LINKS

function setupShowLinks() {
  const showLinks = document.querySelectorAll(".show-name");

  showLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const showId = event.target.dataset.showId;

      const selectedShow = allShows.find(function (show) {
        return show.id == showId;
      });

      showEpisodes(selectedShow);
    });
  });
}

// SHOW EPISODES

async function showEpisodes(show) {
  const showsView = document.getElementById("shows-view");
  const episodesView = document.getElementById("episodes-view");
  const selectedShowName = document.getElementById("selected-show-name");

  showsView.hidden = true;
  episodesView.hidden = false;

  selectedShowName.textContent = show.name;

  // Clear the old episode search
  document.getElementById("search-input").value = "";

  await fetchEpisodes(show.id);
}

// FETCH EPISODES

async function fetchEpisodes(showId) {
  const rootElem = document.getElementById("root");
  const episodeCount = document.getElementById("episode-count");

  rootElem.textContent = "Loading episodes...";
  episodeCount.textContent = "";

  try {
    let episodes;

    // Check episode cache first
    if (episodeCache.has(showId)) {
      episodes = episodeCache.get(showId);
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch episodes");
      }

      episodes = await response.json();

      // Save episodes so this URL is never fetched again
      episodeCache.set(showId, episodes);
    }

    allEpisodes = episodes;

    makePageForEpisodes(allEpisodes);

    episodeCount.textContent = `Showing ${allEpisodes.length} episodes`;

    setupEpisodeSelector();
  } catch (error) {
    rootElem.textContent =
      "Sorry, we could not load the episodes. Please try again later.";

    console.error(error);
  }
}

// EPISODE SEARCH

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      const name = episode.name.toLowerCase();

      const summary = episode.summary ? episode.summary.toLowerCase() : "";

      return name.includes(searchTerm) || summary.includes(searchTerm);
    });

    episodeCount.textContent = `Showing ${filteredEpisodes.length} episodes`;

    makePageForEpisodes(filteredEpisodes);
  });
}

// EPISODE SELECTOR

function setupEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");

  const searchInput = document.getElementById("search-input");

  const episodeCount = document.getElementById("episode-count");

  episodeSelector.innerHTML = "";

  // Add default option
  const defaultOption = document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent = "Jump to episode";

  episodeSelector.appendChild(defaultOption);

  allEpisodes.forEach(function (episode) {
    const option = document.createElement("option");

    const episodeCode = getEpisodeCode(episode);

    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelector.appendChild(option);
  });

  episodeSelector.onchange = function (event) {
    if (!event.target.value) {
      return;
    }

    searchInput.value = "";

    episodeCount.textContent = `Showing ${allEpisodes.length} episodes`;

    makePageForEpisodes(allEpisodes);

    const selectedEpisode = document.getElementById(event.target.value);

    if (selectedEpisode) {
      selectedEpisode.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
}

// DISPLAY EPISODES

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  episodeList.forEach(function (episode) {
    const episodeBox = document.createElement("div");

    episodeBox.className = "episode";

    const episodeCode = getEpisodeCode(episode);

    episodeBox.id = episodeCode;

    episodeBox.innerHTML = `
       <img
  src="${episode.image ? episode.image.medium : ""}"
  alt="${episode.name}"
>

  <div class="episode-info">
    <h2>${episode.name}</h2>

    <p>${episodeCode}</p>

    <p>
      Season ${episode.season}, Episode ${episode.number}
    </p>

    <p>${episode.summary}</p>

    <p>Air date: ${episode.airdate}</p>

    <p>Runtime: ${episode.runtime} minutes</p>

    <a href="${episode.url}" target="_blank">
      View episode
    </a>
  </div>
`;

    rootElem.appendChild(episodeBox);
  });
}

// BACK TO SHOWS

function setupBackButton() {
  const backButton = document.getElementById("back-to-shows");

  backButton.addEventListener("click", function (event) {
    event.preventDefault();

    const showsView = document.getElementById("shows-view");
    const episodesView = document.getElementById("episodes-view");

    showsView.hidden = false;
    episodesView.hidden = true;

    // Clear episode search
    document.getElementById("search-input").value = "";

    // Reset episode selector
    document.getElementById("episode-selector").value = "";
  });
}

// SETUP

async function setup() {
  setupShowSearch();
  setupSearch();
  setupBackButton();

  await fetchShows();
}

window.onload = setup;
