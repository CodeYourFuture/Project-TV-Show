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

function getEpisodeTitle(episode) {
  return `${getEpisodeCode(episode)} - ${episode.name}`;
}

function cleanSummary(summary) {
  return summary.replace(/<[^>]*>/g, "");
}

function setup() {
  const allEpisodes = getAllEpisodes();

  setupFooter();
  makePageForEpisodes(allEpisodes);
  setupSearch(allEpisodes);
}

function setupFooter() {
  const footer = document.querySelector("footer");

  footer.innerHTML =
    '&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>';
}

function createEpisodeElement(episode) {
  const template = document.getElementById("episode-template");
  const episodeElement = template.content.cloneNode(true);

  episodeElement.querySelector(".title").textContent =
    getEpisodeTitle(episode);

  episodeElement.querySelector("img").src = episode.image.medium;
  episodeElement.querySelector("img").alt = `${episode.name} poster`;

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

    episodeCount.textContent = `${filteredEpisodes.length} episodes found`;
  }

  updateSearchResults("");

  searchInput.addEventListener("input", (event) => {
    updateSearchResults(event.target.value);
  });
}

window.onload = setup;