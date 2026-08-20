/*
  The app now has two main parts:
  1. The shows page
  2. The episodes page

  The shows data is fetched once when the page loads.
  Episodes are fetched when a show is selected.
*/

const state = {
  shows: [],
  currentShowId: null,
  currentEpisodes: [],
  searchTerm: "",
  showSearchTerm: "",

  // Keep episode data here so we don't fetch the same URL twice.
  episodeCache: {},
};


// -----------------------------
// General helper functions
// -----------------------------

const paddedSeason = (season) =>
  season.toString().padStart(2, "0");

const paddedEpisode = (episode) =>
  episode.toString().padStart(2, "0");

function getEpisodeCode(episode) {
  return `S${paddedSeason(episode.season)}E${paddedEpisode(
    episode.number,
  )}`;
}

function getEpisodeCardTitle(episode) {
  return `${episode.name} - ${getEpisodeCode(episode)}`;
}

function getEpisodeSelectorTitle(episode) {
  return `${getEpisodeCode(episode)} - ${episode.name}`;
}

function cleanSummary(summary) {
  return (summary || "").replace(/<[^>]*>/g, "");
}


// -----------------------------
// Start the application
// -----------------------------

async function setup() {
  setupFooter();
  setupEpisodeSearch();
  setupEpisodeSelector();
  setupBackButton();
  setupShowSearch();

  try {
    await fetchShows();
  } catch (error) {
    document.getElementById("show-count").textContent =
      "Sorry, we couldn't load the shows.";
  }
}


// -----------------------------
// Fetch all shows
// -----------------------------

async function fetchShows() {
  const response = await fetch(
    "https://api.tvmaze.com/shows",
  );

  if (!response.ok) {
    throw new Error("Failed to load shows");
  }

  state.shows = await response.json();

  // Sort alphabetically, ignoring upper/lower case.
  state.shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    }),
  );

  populateShowSelector();

  displayShows(state.shows);
}


// -----------------------------
// Show search
// -----------------------------

function setupShowSearch() {
  const searchInput = document.getElementById("show-search");

  searchInput.addEventListener("input", (event) => {
    state.showSearchTerm = event.target.value;

    const searchTerm = state.showSearchTerm
      .toLowerCase()
      .trim();

    const filteredShows = state.shows.filter((show) => {
      const name = show.name.toLowerCase();

      const summary = cleanSummary(show.summary).toLowerCase();

      const genres = (show.genres || [])
        .join(" ")
        .toLowerCase();

      return (
        name.includes(searchTerm) ||
        summary.includes(searchTerm) ||
        genres.includes(searchTerm)
      );
    });

    displayShows(filteredShows);
  });
}


// -----------------------------
// Display the shows
// -----------------------------

function displayShows(shows) {
  const showsRoot = document.getElementById("shows-root");
  const showCount = document.getElementById("show-count");

  showsRoot.innerHTML = "";

  showCount.textContent =
    `Displaying ${shows.length}/${state.shows.length} shows`;

  shows.forEach((show) => {
    const card = document.createElement("article");

    card.className = "show-card";

    card.innerHTML = `
      <h2>${show.name}</h2>

      ${
        show.image && show.image.medium
          ? `<img src="${show.image.medium}" alt="${show.name} poster">`
          : ""
      }

      <p>${cleanSummary(show.summary)}</p>

      <p>
        <strong>Genres:</strong>
        ${(show.genres || []).join(", ") || "Not available"}
      </p>

      <p>
        <strong>Status:</strong>
        ${show.status || "Not available"}
      </p>

      <p>
        <strong>Rating:</strong>
        ${
          show.rating && show.rating.average
            ? show.rating.average
            : "Not available"
        }
      </p>

      <p>
        <strong>Runtime:</strong>
        ${show.runtime || "Not available"} minutes
      </p>

      <button class="show-button" data-show-id="${show.id}">
        View episodes
      </button>
    `;

    showsRoot.appendChild(card);
  });

  // Add a click listener to each show button.
  const buttons = document.querySelectorAll(".show-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const showId = Number(button.dataset.showId);

      loadShowEpisodes(showId);
    });
  });
}


// -----------------------------
// Show selector
// -----------------------------

function populateShowSelector() {
  const showSelect = document.getElementById("show-select");

  state.shows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", (event) => {
    const showId = Number(event.target.value);

    if (showId) {
      loadShowEpisodes(showId);
    }
  });
}


// -----------------------------
// Load episodes for a show
// -----------------------------

async function loadShowEpisodes(showId) {
  const status = document.getElementById("status");

  state.currentShowId = showId;
  state.searchTerm = "";

  document.getElementById("search-input").value = "";

  document.getElementById("shows-page").hidden = true;
  document.getElementById("episodes-page").hidden = false;

  const showSelect = document.getElementById("show-select");
  showSelect.value = showId;

  resetEpisodeSelector();

  status.textContent =
    "Loading episodes, please wait...";

  try {
    /*
      If we have already fetched this show's episodes,
      use the saved data instead of fetching again.
    */
    if (!state.episodeCache[showId]) {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );

      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      state.episodeCache[showId] =
        await response.json();
    }

    state.currentEpisodes =
      state.episodeCache[showId];

    populateEpisodeSelector(
      state.currentEpisodes,
    );

    makePageForEpisodes(
      state.currentEpisodes,
    );

    updateEpisodeCount(
      state.currentEpisodes,
      state.currentEpisodes,
    );

    status.textContent = "";
  } catch (error) {
    document.getElementById("root").innerHTML = "";

    status.textContent =
      "Sorry, we couldn't load the episodes. Please try again later.";
  }
}


// -----------------------------
// Create an episode card
// -----------------------------

function createEpisodeElement(episode) {
  const template =
    document.getElementById("episode-template");

  const episodeElement =
    template.content.cloneNode(true);

  episodeElement.querySelector(".episode").id =
    `episode-${episode.id}`;

  episodeElement.querySelector(".title").textContent =
    getEpisodeCardTitle(episode);

  const image =
    episodeElement.querySelector("img");

  if (episode.image && episode.image.medium) {
    image.src = episode.image.medium;
    image.alt = `${episode.name} poster`;
  } else {
    image.remove();
  }

  episodeElement.querySelector(".synopsis").textContent =
    cleanSummary(episode.summary);

  return episodeElement;
}


// -----------------------------
// Display episodes
// -----------------------------

function makePageForEpisodes(episodeList) {
  const rootElement =
    document.getElementById("root");

  rootElement.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeElement =
      createEpisodeElement(episode);

    rootElement.appendChild(episodeElement);
  });
}


// -----------------------------
// Episode search
// -----------------------------

function setupEpisodeSearch() {
  const searchInput =
    document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;

    const filteredEpisodes =
      searchEpisodes(
        state.searchTerm,
        state.currentEpisodes,
      );

    makePageForEpisodes(filteredEpisodes);

    updateEpisodeCount(
      filteredEpisodes,
      state.currentEpisodes,
    );
  });
}

function searchEpisodes(searchTerm, episodeList) {
  const normalizedSearchTerm =
    searchTerm.toLowerCase().trim();

  return episodeList.filter((episode) => {
    const name =
      episode.name.toLowerCase();

    const summary =
      cleanSummary(episode.summary).toLowerCase();

    return (
      name.includes(normalizedSearchTerm) ||
      summary.includes(normalizedSearchTerm)
    );
  });
}


// -----------------------------
// Episode counter
// -----------------------------

function updateEpisodeCount(
  filteredEpisodes,
  allEpisodes,
) {
  const episodeCount =
    document.getElementById("episode-count");

  if (!allEpisodes.length) {
    episodeCount.textContent = "";
    return;
  }

  episodeCount.textContent =
    `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes.`;
}


// -----------------------------
// Episode selector
// -----------------------------

function setupEpisodeSelector() {
  const episodeSelect =
    document.getElementById("episode-select");

  episodeSelect.addEventListener(
    "change",
    (event) => {
      const selectedEpisodeId =
        Number(event.target.value);

      if (!selectedEpisodeId) {
        return;
      }

      const selectedEpisode =
        state.currentEpisodes.find(
          (episode) =>
            episode.id === selectedEpisodeId,
        );

      if (!selectedEpisode) {
        return;
      }

      // Clear the search so the selected episode is visible.
      state.searchTerm = "";

      document.getElementById(
        "search-input",
      ).value = "";

      makePageForEpisodes(
        state.currentEpisodes,
      );

      updateEpisodeCount(
        state.currentEpisodes,
        state.currentEpisodes,
      );

      scrollToEpisode(selectedEpisode);
    },
  );
}

function populateEpisodeSelector(episodeList) {
  const episodeSelect =
    document.getElementById("episode-select");

  resetEpisodeSelector();

  episodeList.forEach((episode) => {
    const option =
      document.createElement("option");

    option.value = episode.id;

    option.textContent =
      getEpisodeSelectorTitle(episode);

    episodeSelect.appendChild(option);
  });
}

function resetEpisodeSelector() {
  const episodeSelect =
    document.getElementById("episode-select");

  episodeSelect.innerHTML =
    '<option value="">Select an episode</option>';
}


// -----------------------------
// Scroll to selected episode
// -----------------------------

function scrollToEpisode(episode) {
  const episodeElement =
    document.getElementById(
      `episode-${episode.id}`,
    );

  if (episodeElement) {
    episodeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}


// -----------------------------
// Back to shows button
// -----------------------------

function setupBackButton() {
  const backButton =
    document.getElementById("back-to-shows");

  backButton.addEventListener("click", () => {
    document.getElementById(
      "episodes-page",
    ).hidden = true;

    document.getElementById(
      "shows-page",
    ).hidden = false;
  });
}


// -----------------------------
// Footer
// -----------------------------

function setupFooter() {
  const footer =
    document.querySelector("footer");

  footer.innerHTML =
    '&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>';
}


window.onload = setup;