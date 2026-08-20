/*
  TV Show Project - Level 500

  The main change at this level is that we now have two pages/views:

  1. A list of all TV shows
  2. The episodes for the selected show

  The data is fetched from TVMaze.
*/

const state = {
  // All shows returned by the API
  shows: [],

  // Episodes for the show we are currently looking at
  currentEpisodes: [],

  // ID of the current show
  currentShowId: null,

  // Current episode search text
  searchTerm: "",

  // Current show search text
  showSearchTerm: "",

  /*
    Keep episode data here after it has been fetched.

    This means if we visit a show again, we use the data
    we already downloaded instead of fetching it again.
  */
  episodeCache: {},
};

// --------------------------------------------------
// GENERAL FUNCTIONS
// --------------------------------------------------

/* Add a leading zero to seasons and episodes when needed */
const paddedSeason = (season) => season.toString().padStart(2, "0");

const paddedEpisode = (episode) => episode.toString().padStart(2, "0");

/* Create the S01E01 style code used for episodes */
function getEpisodeCode(episode) {
  return `S${paddedSeason(episode.season)}E${paddedEpisode(episode.number)}`;
}

/* Create the title shown on an episode card */
function getEpisodeCardTitle(episode) {
  return `${episode.name} - ${getEpisodeCode(episode)}`;
}

/* Create the title used in the episode dropdown */
function getEpisodeSelectorTitle(episode) {
  return `${getEpisodeCode(episode)} - ${episode.name}`;
}

/*
  TVMaze summaries contain HTML tags.

  Remove the tags so that only the text is displayed.
*/
function cleanSummary(summary) {
  return (summary || "").replace(/<[^>]*>/g, "");
}

// --------------------------------------------------
// START THE APP
// --------------------------------------------------

async function setup() {
  setupFooter();

  // Start by showing the shows page
  showShowsPage();

  try {
    // Get all the shows before displaying them
    await fetchShows();
  } catch (error) {
    showError("Sorry, we couldn't load the TV shows.");
  }
}

// --------------------------------------------------
// SHOWS
// --------------------------------------------------

async function fetchShows() {
  // Get the list of shows from the TVMaze API
  const response = await fetch("https://api.tvmaze.com/shows");

  if (!response.ok) {
    throw new Error("Failed to load shows");
  }

  state.shows = await response.json();

  // Sort the shows alphabetically
  state.shows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  renderShows(state.shows);

  document.getElementById("show-count").textContent =
    `Showing ${state.shows.length} shows.`;
}

// Display the shows on the front page
function renderShows(shows) {
  const showsRoot = document.getElementById("shows-root");

  // Clear the old cards before rendering the new list
  showsRoot.innerHTML = "";

  shows.forEach((show) => {
    const card = document.createElement("article");

    card.className = "show-card";

    // Use the medium image if the show has one
    const image = show.image?.medium
      ? `<img src="${show.image.medium}" alt="${show.name}">`
      : "";

    // Some shows do not have genres, so use a message instead
    const genres = show.genres.length
      ? show.genres.join(", ")
      : "No genres listed";

    // Some shows do not have a rating
    const rating = show.rating?.average ? show.rating.average : "No rating";

    // Build the contents of the show card
    card.innerHTML = `
      ${image}

      <div class="show-info">
        <h2>
          <a href="#" data-show-id="${show.id}">
            ${show.name}
          </a>
        </h2>

        <p class="show-summary">
          ${cleanSummary(show.summary)}
        </p>

        <p><strong>Genres:</strong> ${genres}</p>

        <p><strong>Status:</strong> ${show.status}</p>

        <p><strong>Rating:</strong> ${rating}</p>

        <p><strong>Runtime:</strong> ${show.runtime || "Unknown"} minutes</p>
      </div>
    `;

    showsRoot.appendChild(card);
  });

  // Add click events to the show names
  document.querySelectorAll("[data-show-id]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const showId = Number(event.target.dataset.showId);

      selectShow(showId);
    });
  });
}

// --------------------------------------------------
// SHOW SEARCH
// --------------------------------------------------

function setupShowSearch() {
  const searchInput = document.getElementById("show-search");

  searchInput.addEventListener("input", (event) => {
    // Store the search text in state so it can be used by the app
    state.showSearchTerm = event.target.value.toLowerCase().trim();

    /*
      Search through the show name, genres and summary.

      This means the user can search for a show using
      more than just its name.
    */
    const filteredShows = state.shows.filter((show) => {
      const name = show.name.toLowerCase();

      const genres = show.genres.join(" ").toLowerCase();

      const summary = cleanSummary(show.summary).toLowerCase();

      return (
        name.includes(state.showSearchTerm) ||
        genres.includes(state.showSearchTerm) ||
        summary.includes(state.showSearchTerm)
      );
    });

    // Display only the shows which match the search
    renderShows(filteredShows);

    document.getElementById("show-count").textContent =
      `Showing ${filteredShows.length}/${state.shows.length} shows.`;
  });
}

// --------------------------------------------------
// SELECT A SHOW
// --------------------------------------------------

async function selectShow(showId) {
  // Find the selected show in the shows already stored in state
  const show = state.shows.find((show) => show.id === showId);

  if (!show) {
    return;
  }

  state.currentShowId = showId;

  // Clear the old episode search
  state.searchTerm = "";
  document.getElementById("search-input").value = "";

  // Show the episodes page
  showEpisodesPage();

  // Put the selected show in the dropdown
  document.getElementById("show-select").value = showId;

  await loadShowEpisodes(showId);
}

// --------------------------------------------------
// LOAD EPISODES
// --------------------------------------------------

async function loadShowEpisodes(showId) {
  const status = document.getElementById("status");

  status.textContent = "Loading episodes, please wait...";

  resetEpisodeSelector();

  try {
    /*
      Check the cache first.

      If we have already loaded this show during this visit,
      don't fetch it again.
    */
    if (!state.episodeCache[showId]) {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );

      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      // Save the episodes so we do not have to fetch them again
      state.episodeCache[showId] = await response.json();
    }

    // Use the cached episodes
    state.currentEpisodes = state.episodeCache[showId];

    // Fill the dropdown with the episodes
    populateEpisodeSelector(state.currentEpisodes);

    // Display all the episodes
    makePageForEpisodes(state.currentEpisodes);

    // Show the number of episodes being displayed
    updateEpisodeCount(state.currentEpisodes, state.currentEpisodes);

    status.textContent = "";
  } catch (error) {
    // If the request fails, clear the episode page
    state.currentEpisodes = [];

    document.getElementById("root").innerHTML = "";

    status.textContent =
      "Sorry, we couldn't load the episodes. Please try again later.";
  }
}

// --------------------------------------------------
// SHOW DROPDOWN
// --------------------------------------------------

function setupShowSelector() {
  const showSelect = document.getElementById("show-select");

  /*
    Add all shows to the dropdown.

    The shows are already sorted in fetchShows().
  */
  state.shows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelect.appendChild(option);
  });

  // When a different show is selected, load its episodes
  showSelect.addEventListener("change", (event) => {
    const showId = Number(event.target.value);

    if (!showId) {
      return;
    }

    selectShow(showId);
  });
}

// --------------------------------------------------
// EPISODE CARDS
// --------------------------------------------------

function createEpisodeElement(episode) {
  // Use the HTML template instead of creating every element from scratch
  const template = document.getElementById("episode-template");

  const episodeElement = template.content.cloneNode(true);

  // Give each episode an ID so we can scroll to it later
  episodeElement.querySelector(".episode").id = `episode-${episode.id}`;

  episodeElement.querySelector(".title").textContent =
    getEpisodeCardTitle(episode);

  const image = episodeElement.querySelector("img");

  // If there is no image, remove the empty image element
  if (episode.image && episode.image.medium) {
    image.src = episode.image.medium;
    image.alt = `${episode.name} poster`;
  } else {
    image.remove();
  }

  episodeElement.querySelector(".synopsis").textContent = cleanSummary(
    episode.summary,
  );

  return episodeElement;
}

function makePageForEpisodes(episodeList) {
  const rootElement = document.getElementById("root");

  // Clear the previous episodes before displaying the new list
  rootElement.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeElement = createEpisodeElement(episode);

    rootElement.appendChild(episodeElement);
  });
}

// --------------------------------------------------
// EPISODE SEARCH
// --------------------------------------------------

function searchEpisodes(searchTerm, episodeList) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  // Check both the episode name and its summary
  return episodeList.filter((episode) => {
    const episodeName = episode.name.toLowerCase();

    const episodeSummary = cleanSummary(episode.summary).toLowerCase();

    return (
      episodeName.includes(normalizedSearchTerm) ||
      episodeSummary.includes(normalizedSearchTerm)
    );
  });
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;

    // Filter the current show's episodes using the search term
    const filteredEpisodes = searchEpisodes(
      state.searchTerm,
      state.currentEpisodes,
    );

    makePageForEpisodes(filteredEpisodes);

    updateEpisodeCount(filteredEpisodes, state.currentEpisodes);
  });
}

// --------------------------------------------------
// EPISODE COUNT
// --------------------------------------------------

function updateEpisodeCount(filteredEpisodes, allEpisodes) {
  const episodeCount = document.getElementById("episode-count");

  if (!allEpisodes.length) {
    episodeCount.textContent = "";
    return;
  }

  // Show filtered episodes compared with the total number
  episodeCount.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes.`;
}

// --------------------------------------------------
// EPISODE DROPDOWN
// --------------------------------------------------

function populateEpisodeSelector(episodeList) {
  const episodeSelect = document.getElementById("episode-select");

  // Start with an empty selector before adding the episodes
  resetEpisodeSelector();

  episodeList.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;

    option.textContent = getEpisodeSelectorTitle(episode);

    episodeSelect.appendChild(option);
  });
}

function setupEpisodeSelector() {
  const episodeSelect = document.getElementById("episode-select");

  episodeSelect.addEventListener("change", (event) => {
    const selectedEpisodeId = Number(event.target.value);

    if (!selectedEpisodeId) {
      return;
    }

    // Find the selected episode in the current episode list
    const selectedEpisode = state.currentEpisodes.find(
      (episode) => episode.id === selectedEpisodeId,
    );

    if (!selectedEpisode) {
      return;
    }

    // Clear search so the selected episode can be seen
    state.searchTerm = "";

    document.getElementById("search-input").value = "";

    // Display all episodes again before scrolling to the selected one
    makePageForEpisodes(state.currentEpisodes);

    updateEpisodeCount(state.currentEpisodes, state.currentEpisodes);

    scrollToEpisode(selectedEpisode);
  });
}

function scrollToEpisode(episode) {
  // Find the episode card using the ID we added when creating it
  const episodeElement = document.getElementById(`episode-${episode.id}`);

  if (episodeElement) {
    // Smoothly scroll the selected episode into view
    episodeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function resetEpisodeSelector() {
  const episodeSelect = document.getElementById("episode-select");

  // Remove the old episode options
  episodeSelect.innerHTML = '<option value="">Select an episode</option>';
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

function showShowsPage() {
  // Show the main shows listing
  document.getElementById("shows-page").style.display = "block";

  // Hide the episodes listing
  document.getElementById("episodes-page").style.display = "none";
}

function showEpisodesPage() {
  // Hide the shows listing
  document.getElementById("shows-page").style.display = "none";

  // Show the episodes listing
  document.getElementById("episodes-page").style.display = "block";
}

function setupNavigation() {
  const homeLink = document.getElementById("home-link");

  homeLink.addEventListener("click", (event) => {
    event.preventDefault();

    // Go back to the main shows listing
    showShowsPage();
  });
}

// --------------------------------------------------
// FOOTER
// --------------------------------------------------

function setupFooter() {
  const footer = document.querySelector("footer");

  // Add the TVMaze link to the footer
  footer.innerHTML =
    '&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>';
}

// --------------------------------------------------
// ERROR MESSAGE
// --------------------------------------------------

function showError(message) {
  // Display the error message
  document.getElementById("status").textContent = message;

  // Clear the shows if they could not be loaded
  document.getElementById("shows-root").innerHTML = "";
}

// --------------------------------------------------
// START EVERYTHING
// --------------------------------------------------

// Set up all the event listeners before the app starts
setupSearch();
setupEpisodeSelector();
setupShowSearch();
setupShowSelector();
setupNavigation();

// Start the application after the page has loaded
window.onload = setup;
