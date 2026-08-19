/*
For each episode, at least the following must be displayed:
- The name of the episode
- The season number
- The episode number
- The medium-sized image for the episode
- The summary text of the episode
*/

const paddedSeason = (season) => season.toString().padStart(2, "0");

const paddedEpisode = (episode) => episode.toString().padStart(2, "0");

function getEpisodeCode(episode) {
  return `S${paddedSeason(episode.season)}E${paddedEpisode(episode.number)}`;
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

/*
  State for the application.
*/
const state = {
  shows: [],
  currentShowId: null,
  currentEpisodes: [],
  searchTerm: "",

  /*
    Stores episode requests that have already been made.

    Example:
    episodeCache[82] = episodes for show 82
    episodeCache[169] = episodes for show 169

    This makes sure the same episode URL is never fetched twice.
  */
  episodeCache: {},
};

/*
  Set up the application.
*/
async function setup() {
  setupFooter();

  try {
    await fetchShows();
  } catch (error) {
    showError("Sorry, we couldn't load the TV shows. Please try again later.");
  }
}

/*
  Fetch the list of TV shows.

  This URL is fetched only once when the page loads.
*/
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");

  if (!response.ok) {
    throw new Error("Failed to load shows");
  }

  state.shows = await response.json();

  /*
    Sort shows alphabetically, ignoring case.
  */
  state.shows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  populateShowSelector();

  document.getElementById("status").textContent =
    "Select a show to view its episodes.";

  setupShowSelector();
}

/*
  Add all shows to the show selector.
*/
function populateShowSelector() {
  const showSelect = document.getElementById("show-select");

  state.shows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelect.appendChild(option);
  });
}

/*
  Listen for show changes.
*/
function setupShowSelector() {
  const showSelect = document.getElementById("show-select");

  showSelect.addEventListener("change", async (event) => {
    const selectedShowId = Number(event.target.value);

    /*
      User selected the placeholder.
    */
    if (!selectedShowId) {
      resetEpisodes();
      return;
    }

    await loadShowEpisodes(selectedShowId);
  });
}

/*
  Load episodes for the selected show.
*/
async function loadShowEpisodes(showId) {
  const status = document.getElementById("status");

  state.currentShowId = showId;
  state.searchTerm = "";

  document.getElementById("search-input").value = "";

  /*
    Reset the episode selector whenever the show changes.
  */
  resetEpisodeSelector();

  status.textContent = "Loading episodes, please wait...";

  try {
    /*
      Check whether this show's episode data has already
      been fetched during this visit.
    */
    if (!state.episodeCache[showId]) {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );

      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      state.episodeCache[showId] = await response.json();
    }

    /*
      Use cached data if this show has already been loaded.
    */
    state.currentEpisodes = state.episodeCache[showId];

    populateEpisodeSelector(state.currentEpisodes);
    makePageForEpisodes(state.currentEpisodes);

    updateEpisodeCount(state.currentEpisodes, state.currentEpisodes);

    status.textContent = "";
  } catch (error) {
    state.currentEpisodes = [];

    document.getElementById("root").innerHTML = "";

    document.getElementById("episode-count").textContent = "";

    status.textContent =
      "Sorry, we couldn't load the episodes. Please try again later.";
  }
}

/*
  Create an episode card.
*/
function createEpisodeElement(episode) {
  const template = document.getElementById("episode-template");
  const episodeElement = template.content.cloneNode(true);

  episodeElement.querySelector(".episode").id = `episode-${episode.id}`;

  episodeElement.querySelector(".title").textContent =
    getEpisodeCardTitle(episode);

  const image = episodeElement.querySelector("img");

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

/*
  Display a list of episodes.
*/
function makePageForEpisodes(episodeList) {
  const rootElement = document.getElementById("root");

  rootElement.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeElement = createEpisodeElement(episode);
    rootElement.appendChild(episodeElement);
  });
}

/*
  Search episodes by name or summary.
*/
function searchEpisodes(searchTerm, episodeList) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return episodeList.filter((episode) => {
    const episodeName = episode.name.toLowerCase();
    const episodeSummary = cleanSummary(episode.summary).toLowerCase();

    return (
      episodeName.includes(normalizedSearchTerm) ||
      episodeSummary.includes(normalizedSearchTerm)
    );
  });
}

/*
  Set up episode searching.
*/
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;

    const filteredEpisodes = searchEpisodes(
      state.searchTerm,
      state.currentEpisodes,
    );

    makePageForEpisodes(filteredEpisodes);

    updateEpisodeCount(filteredEpisodes, state.currentEpisodes);
  });
}

/*
  Update the episode counter.
*/
function updateEpisodeCount(filteredEpisodes, allEpisodes) {
  const episodeCount = document.getElementById("episode-count");

  if (!allEpisodes.length) {
    episodeCount.textContent = "";
    return;
  }

  episodeCount.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes.`;
}

/*
  Populate the episode selector.
*/
function populateEpisodeSelector(episodeList) {
  const episodeSelect = document.getElementById("episode-select");

  resetEpisodeSelector();

  episodeList.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent = getEpisodeSelectorTitle(episode);

    episodeSelect.appendChild(option);
  });

  /*
    Add the change event only once.
  */
  if (!episodeSelect.dataset.listenerAdded) {
    episodeSelect.addEventListener("change", handleEpisodeSelection);
    episodeSelect.dataset.listenerAdded = "true";
  }
}

/*
  Handle an episode being selected.
*/
function handleEpisodeSelection(event) {
  const selectedEpisodeId = Number(event.target.value);

  if (!selectedEpisodeId) {
    return;
  }

  const selectedEpisode = state.currentEpisodes.find(
    (episode) => episode.id === selectedEpisodeId,
  );

  if (!selectedEpisode) {
    return;
  }

  /*
    Clear the search so the selected episode is visible.
  */
  state.searchTerm = "";

  document.getElementById("search-input").value = "";

  makePageForEpisodes(state.currentEpisodes);

  updateEpisodeCount(state.currentEpisodes, state.currentEpisodes);

  scrollToEpisode(selectedEpisode);
}

/*
  Scroll to a selected episode.
*/
function scrollToEpisode(episode) {
  const episodeElement = document.getElementById(`episode-${episode.id}`);

  if (episodeElement) {
    episodeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/*
  Reset the episode selector.
*/
function resetEpisodeSelector() {
  const episodeSelect = document.getElementById("episode-select");

  episodeSelect.innerHTML =
    '<option value="">Select an episode</option>';
}

/*
  Reset the episode area when no show is selected.
*/
function resetEpisodes() {
  state.currentShowId = null;
  state.currentEpisodes = [];
  state.searchTerm = "";

  document.getElementById("search-input").value = "";
  document.getElementById("root").innerHTML = "";
  document.getElementById("episode-count").textContent = "";

  resetEpisodeSelector();

  document.getElementById("status").textContent =
    "Select a show to view its episodes.";
}

/*
  Display an error message to the user.
*/
function showError(message) {
  document.getElementById("status").textContent = message;
  document.getElementById("root").innerHTML = "";
}

/*
  Set up footer.
*/
function setupFooter() {
  const footer = document.querySelector("footer");

  footer.innerHTML =
    '&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>';
}

setupSearch();

window.onload = setup;