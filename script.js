let currentEpisodes = [];

// Stores episodes we have already fetched
const episodeCache = new Map();

function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}`;
}

// Add shows to the show selector
function populateShowSelector(shows) {
  const showSelector = document.getElementById("show-selector");

  showSelector.innerHTML = "";

  shows.forEach(function (show) {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelector.appendChild(option);
  });
}

// Display shows on the shows page
function makePageForShows(showList) {
  const showsList = document.getElementById("shows-list");

  showsList.innerHTML = "";

  showList.forEach(function (show) {
    const showBox = document.createElement("div");

    showBox.className = "show";

    showBox.innerHTML = `
      <h2>${show.name}</h2>

      <img
        src="${show.image ? show.image.medium : ""}"
        alt="${show.name}"
      >

      <p>${show.summary || ""}</p>

      <p>Genres: ${show.genres.join(", ")}</p>

      <p>Status: ${show.status}</p>

      <p>Rating: ${show.rating.average || "N/A"}</p>

      <p>Runtime: ${show.runtime || "N/A"} minutes</p>
    `;

    showBox.addEventListener("click", async function () {
      const showSelector = document.getElementById("show-selector");
      const showsPage = document.getElementById("shows-page");
      const episodesPage = document.getElementById("episodes-page");
      const rootElem = document.getElementById("root");
      const episodeCount = document.getElementById("episode-count");

      showSelector.value = show.id;

      showsPage.hidden = true;
      episodesPage.hidden = false;

      rootElem.textContent = "Loading episodes...";
      episodeCount.textContent = "";

      try {
        currentEpisodes = await fetchEpisodes(show.id);

        populateEpisodeSelector(currentEpisodes);
        makePageForEpisodes(currentEpisodes);

        episodeCount.textContent =
          `Showing ${currentEpisodes.length} episodes`;
      } catch (error) {
        rootElem.textContent =
          "Sorry, we could not load the episodes. Please try again later.";

        console.error(error);
      }
    });

    showsList.appendChild(showBox);
  });
}

// Fetch episodes for a show
async function fetchEpisodes(showId) {
  // Check if we have already fetched this show's episodes
  if (episodeCache.has(showId)) {
    return episodeCache.get(showId);
  }

  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch episodes");
  }

  const episodes = await response.json();

  // Save the episodes so we don't fetch them again
  episodeCache.set(showId, episodes);

  return episodes;
}

// Add episodes to the episode selector
function populateEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");

  episodeSelector.innerHTML = "";

  episodes.forEach(function (episode) {
    const option = document.createElement("option");

    const episodeCode = getEpisodeCode(episode);

    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelector.appendChild(option);
  });
}

// Display episodes on the page
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  episodeList.forEach(function (episode) {
    const episodeBox = document.createElement("div");

    episodeBox.className = "episode";

    const episodeCode = getEpisodeCode(episode);

    episodeBox.id = episodeCode;

    episodeBox.innerHTML = `
      <h2>${episode.name}</h2>

      <p>${episodeCode}</p>

      <img src="${episode.image.medium}" alt="${episode.name}">

      <p>Season ${episode.season}, Episode ${episode.number}</p>

      <p>${episode.summary || ""}</p>

      <p>Air date: ${episode.airdate}</p>

      <p>Runtime: ${episode.runtime} minutes</p>

      <a href="${episode.url}" target="_blank">
        View episode
      </a>
    `;

    rootElem.appendChild(episodeBox);
  });
}

async function setup() {
  const showsPage = document.getElementById("shows-page");
  const episodesPage = document.getElementById("episodes-page");
  const showsList = document.getElementById("shows-list");
  const showSearch = document.getElementById("show-search");
  const showSelector = document.getElementById("show-selector");
  const backToShows = document.getElementById("back-to-shows");

  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");
  const rootElem = document.getElementById("root");

  rootElem.textContent = "Loading shows...";

  try {
    // Fetch all shows
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Failed to fetch shows");
    }

    const shows = await response.json();

    // Sort shows alphabetically
    shows.sort(function (a, b) {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });

    // Populate the Level 400 show selector
    populateShowSelector(shows);

    // Display shows
    makePageForShows(shows);

    // Show selector
    showSelector.addEventListener("change", async function (event) {
      const showId = event.target.value;

      showsPage.hidden = true;
      episodesPage.hidden = false;

      rootElem.textContent = "Loading episodes...";
      episodeCount.textContent = "";
      searchInput.value = "";

      try {
        currentEpisodes = await fetchEpisodes(showId);

        populateEpisodeSelector(currentEpisodes);
        makePageForEpisodes(currentEpisodes);

        episodeCount.textContent =
          `Showing ${currentEpisodes.length} episodes`;
      } catch (error) {
        rootElem.textContent =
          "Sorry, we could not load the episodes. Please try again later.";

        console.error(error);
      }
    });

    // Show search
    showSearch.addEventListener("input", function (event) {
      const searchTerm = event.target.value.toLowerCase();

      const filteredShows = shows.filter(function (show) {
        return (
          show.name.toLowerCase().includes(searchTerm) ||
          show.genres.join(" ").toLowerCase().includes(searchTerm) ||
          (show.summary || "").toLowerCase().includes(searchTerm)
        );
      });

      makePageForShows(filteredShows);
    });

    // Back to shows
    backToShows.addEventListener("click", function () {
      showsPage.hidden = false;
      episodesPage.hidden = true;

      searchInput.value = "";
      episodeCount.textContent = "";
      rootElem.innerHTML = "";
    });

    // Episode selector
    episodeSelector.addEventListener("change", function (event) {
      searchInput.value = "";

      episodeCount.textContent =
        `Showing ${currentEpisodes.length} episodes`;

      makePageForEpisodes(currentEpisodes);

      const selectedEpisode = document.getElementById(event.target.value);

      if (selectedEpisode) {
        selectedEpisode.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });

    // Episode search
    searchInput.addEventListener("input", function (event) {
      const searchTerm = event.target.value.toLowerCase();

      const filteredEpisodes = currentEpisodes.filter(function (episode) {
        return (
          episode.name.toLowerCase().includes(searchTerm) ||
          (episode.summary || "").toLowerCase().includes(searchTerm)
        );
      });

      episodeCount.textContent =
        `Showing ${filteredEpisodes.length} episodes`;

      makePageForEpisodes(filteredEpisodes);
    });
  } catch (error) {
    showsList.textContent =
      "Sorry, we could not load the shows. Please try again later.";

    console.error(error);
  }
}

window.onload = setup;