/* 
For each episode, at least following must be displayed:
The name of the episode
The season number
The episode number
The medium-sized image for the episode
The summary text of the episode
 */

//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const template = document.getElementById("episode-template");
  const paddedSeason = (season) => season.toString().padStart(2, "0");
  const paddedEpisode = (episode) => episode.toString().padStart(2, "0");
  const episodeSynopsis = (summary) => summary.replace(/<[^>]*>/g, ""); // Remove HTML tags from summary
  const footer = document.querySelector("footer");
  footer.innerHTML = `&copy; TV. All rights reserved. <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`; // Add copyright notice with link to TVMaze.com
  episodeList.forEach((episode) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector("h3").textContent =
      `${episode.name} - S${paddedSeason(episode.season)}E${paddedEpisode(episode.number)}`;
    clone.querySelector("img").src = episode.image.medium;
    clone.querySelector(".synopsis").textContent = episodeSynopsis(
      episode.summary,
    );
    rootElem.appendChild(clone);
  });
}

window.onload = setup;
