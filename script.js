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
  return summary.replace(/<[^>]*>/g, "");
}
function setup() {
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      return response.json();
    })
    .then((allEpisodes) => {
      setupFooter();
      makePageForEpisodes(allEpisodes);
      setupSearch(allEpisodes);
      setupEpisodeSelector(allEpisodes);
    })
    .catch(() => {
      document.getElementById("root").textContent =
        "Sorry, we couldn't load the episodes. Please try again later.";
    });
}
/*function setup() {
  const allEpisodes = getAllEpisodes();

  setupFooter();
  makePageForEpisodes(allEpisodes);
  setupSearch(allEpisodes);
  setupEpisodeSelector(allEpisodes);
} */

function setupFooter() {
  const footer = document.querySelector("footer");

  footer.innerHTML =
    '&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>';
}

function createEpisodeElement(episode) {
  const template = document.getElementById("episode-template");
  const episodeElement = template.content.cloneNode(true);

  episodeElement.querySelector(".episode").id = `episode-${episode.id}`;

  episodeElement.querySelector(".title").textContent =
    getEpisodeCardTitle(episode);

  const image = episodeElement.querySelector("img");

  image.src = episode.image.medium;
  image.alt = `${episode.name} poster`;

  episodeElement.querySelector(".synopsis").textContent = cleanSummary(
    episode.summary,
  );

  return episodeElement;
}

function makePageForEpisodes(episodeList) {
  const rootElement = document.getElementById("root");

  rootElement.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeElement = createEpisodeElement(episode);
    rootElement.appendChild(episodeElement);
  });
}

function searchEpisodes(searchTerm, episodeList) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return episodeList.filter((episode) => {
    const episodeName = episode.name.toLowerCase();
    const episodeSummary = episode.summary.toLowerCase();

    return (
      episodeName.includes(normalizedSearchTerm) ||
      episodeSummary.includes(normalizedSearchTerm)
    );
  });
}

function setupSearch(allEpisodes) {
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

  function updateSearchResults(searchTerm) {
    const filteredEpisodes = searchEpisodes(searchTerm, allEpisodes);

    makePageForEpisodes(filteredEpisodes);

    episodeCount.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes.`;
  }

  updateSearchResults("");

  searchInput.addEventListener("input", (event) => {
    updateSearchResults(event.target.value);
  });
}

function setupEpisodeSelector(allEpisodes) {
  const episodeSelect = document.getElementById("episode-select");

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent = getEpisodeSelectorTitle(episode);

    episodeSelect.appendChild(option);
  });

  episodeSelect.addEventListener("change", (event) => {
    const selectedEpisodeId = Number(event.target.value);

    if (!selectedEpisodeId) {
      return;
    }

    const selectedEpisode = allEpisodes.find(
      (episode) => episode.id === selectedEpisodeId,
    );

    const searchInput = document.getElementById("search-input");

    searchInput.value = "";

    makePageForEpisodes(allEpisodes);

    scrollToEpisode(selectedEpisode);
  });
}

function scrollToEpisode(episode) {
  const episodeElement = document.getElementById(`episode-${episode.id}`);

  if (episodeElement) {
    episodeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

window.onload = setup; // refactored
