//You can edit ALL of the code here
const allEpisodes = getAllEpisodes();

console.log(allEpisodes);

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const title = document.createElement("h2");

  title.textContent = episodeList[0].name;

  rootElem.appendChild(title);
  }



window.onload = setup;
