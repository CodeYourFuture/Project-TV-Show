/*
For each episode, at least following must be displayed:
The name of the episode
The season number
The episode number
The medium-sized image for the episode
The summary text of the episode
*/

const paddedSeason = (season) => season.toString().padStart(2, "0");

const paddedEpisode = (episode) => episode.toString().padStart(2, "0");

const episodeSynopsis = (summary) => summary.replace(/<[^>]*>/g, "");

function setup() {
  const allEpisodes = getAllEpisodes();

  setupFooter();
  makePageForEpisodes(allEpisodes);
}

function setupFooter() {
  const footer = document.querySelector("footer");

  footer.innerHTML = `&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`;
}

function createEpisodeElement(episode) {
  const template = document.getElementById("episode-template");
  const clone = template.content.cloneNode(true);

  clone.querySelector(".title").textContent =
    `${episode.name} - S${paddedSeason(episode.season)}E${paddedEpisode(episode.number)}`;

  clone.querySelector("img").src = episode.image.medium;

  clone.querySelector(".synopsis").textContent = episodeSynopsis(
    episode.summary,
  );

  return clone;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  episodeList.forEach((episode) => {
    const episodeElement = createEpisodeElement(episode);
    rootElem.appendChild(episodeElement);
  });
}

window.onload = setup;