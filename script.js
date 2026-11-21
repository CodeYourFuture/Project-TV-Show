//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makeEpisodeCode(season, number) {
  const seasonText = String(season).padStart(2, "0");
  const numberText = String(number).padStart(2, "0");
  return `S${seasonText}E${numberText}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const cards = episodeList.map(makeEpisodeCard);
  rootElem.append(...cards);
}
function makeEpisodeCard(episode) {
  const card = document.createElement("section");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${makeEpisodeCode(episode.season, episode.number)}`;

  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = `Image from ${episode.name}`;

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary;

  card.append(title, image, summary);
  return card;
}

function render(episode) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const cards = episodes.map(makeEpisodeCard);
  root.append(...cards);
}

function setup() {
  const allEpisodes = getAllEpisode();
  render(allEpisodes);
}

window.onload = setup;
