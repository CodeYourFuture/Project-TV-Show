let allShows = [];
let allEpisodes = [];
const episodeCache = new Map();

function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

async function fetchEpisodes(showId) {
  const rootElem = document.getElementById("root");
  const episodeCount = document.getElementById("episode-count");

  rootElem.textContent = "Loading episodes...";
  episodeCount.textContent = "";

  try {
    let episodes;

    if (episodeCache.has(showId)) {
      episodes = episodeCache.get(showId);
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch episodes");
      }

      episodes = await response.json();

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

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });

    episodeCount.textContent = `Showing ${filteredEpisodes.length} episodes`;

    makePageForEpisodes(filteredEpisodes);
  });
}

function setupEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

  episodeSelector.innerHTML = "";

  allEpisodes.forEach(function (episode) {
    const option = document.createElement("option");

    const episodeCode = getEpisodeCode(episode);

    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelector.appendChild(option);
  });

  episodeSelector.onchange = function (event) {
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

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "Loading shows...";

  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Failed to fetch shows");
    }

    allShows = await response.json();

    allShows.sort(function (showA, showB) {
      return showA.name.localeCompare(showB.name, undefined, {
        sensitivity: "base",
      });
    });

    const showSelector = document.getElementById("show-selector");

    allShows.forEach(function (show) {
      const option = document.createElement("option");

      option.value = show.id;
      option.textContent = show.name;

      showSelector.appendChild(option);
    });

    setupSearch();

    showSelector.addEventListener("change", function (event) {
      fetchEpisodes(event.target.value);
    });

    rootElem.textContent = "Select a show to view its episodes.";
  } catch (error) {
    rootElem.textContent =
      "Sorry, we could not load the shows. Please try again later.";

    console.error(error);
  }
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  episodeList.forEach(function (episode) {
    const episodeBox = document.createElement("div");

    episodeBox.className = "episode";

    const episodeCode = getEpisodeCode(episode);

    episodeBox.id = episodeCode;

    episodeBox.innerHTML = `
      <h2>${episode.name}

  <p>${episodeCode}</p></h2>

      <img src="${episode.image.medium}" alt="${episode.name}">

      <p>Season ${episode.season}, Episode ${episode.number}</p>

      <p>${episode.summary}</p>

      <p>Air date: ${episode.airdate}</p>

      <p>Runtime: ${episode.runtime} minutes</p>

      <a href="${episode.url}" target="_blank">
        View episode
      </a>
    `;

    rootElem.appendChild(episodeBox);
  });
}

window.onload = setup;