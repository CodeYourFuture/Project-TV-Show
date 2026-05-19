//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}


function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;
  episodeList.forEach(ep => {
    rootElem.insertAdjacentHTML("beforeend", `<article><h1>${ep.season}-${ep.number}: ${ep.name}</h1>${ep.summary}</article>`);
  })
}


window.onload = setup;
