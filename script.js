//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function createTvCard(episode) {
  const template = document.getElementById("tv-show-card");
  const card = template.content.cloneNode(true);

  card.querySelector("h3").textContent =
    `${episode.name} – S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  card.querySelector("p").innerHTML = episode.summary;

  const img = card.querySelector("img");
  img.src = episode.image.medium;
  img.alt = episode.name;

  const link = card.querySelector("a");
  link.href = episode.url;
  link.textContent = "View on TVMaze";
  link.target = "_blank";

  return card;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    rootElem.appendChild(createTvCard(episode));
  });
}

window.onload = setup;
