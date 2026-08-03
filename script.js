//You can edit ALL of the code here
const allEpisodes = getAllEpisodes();

console.log(allEpisodes);

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
   episodeList.forEach(function (episode) {
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;
    
    const card = document.createElement("article");
     const title = document.createElement("h2");
     const code = document.createElement("p");
     const image = document.createElement("img");
     image.src = episode.image.medium;
     image.alt = episode.name;

     title.textContent = episode.name;
     code.textContent = episodeCode;
     
    card.appendChild(code);
     card.appendChild(title);
     rootElem.appendChild(card);
   });
  }



window.onload = setup;
