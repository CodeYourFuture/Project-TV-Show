//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  const template = document.getElementById("episode-template");
  const paddedSeason = (season) => season.toString().padStart(2, "0");
  const paddedEpisode = (episode) => episode.toString().padStart(2, "0");
  episodeList.forEach((episode) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector("h3").textContent = `${episode.name} - S${paddedSeason(episode.season)}E${paddedEpisode(episode.number)}`;
    clone.querySelector("img").src = episode.image.medium;
    clone.querySelector("p").textContent = episode.summary;
    rootElem.appendChild(clone);
  });
}


window.onload = setup;
