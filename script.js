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
     const image = document.createElement("img");
     image.src = episode.image.medium;
     image.alt = episode.name;
     const summary = document.createElement("div");
     summary.innerHTML = episode.summary;

     title.textContent = `${episode.name}-${episodeCode}`;
     
     const link = document.createElement("a");
     link.href = episode.url;
     link.textContent = "View on TVMaze";
     link.target = "_blank";
     link.rel = "noopener noreferrer";

    
     
    
     
     card.appendChild(title);
      card.appendChild(image);
      card.appendChild(summary);
      card.appendChild(link);
      rootElem.appendChild(card);
   });
  }



window.onload = setup;
