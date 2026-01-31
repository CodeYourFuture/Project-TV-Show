// script.js
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  setupSearch(allEpisodes);
  setupEpisodeSelect(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("episodeContainer");
  episodeContainer.innerHTML = "";

  episodeList.forEach(episode => {
      const article = document.createElement("article");
      article.classList.add("article");

      const title = document.createElement("h2");
      title.textContent = `${episode.name} - S${padNumber(episode.season)}E${padNumber(episode.number)}`;
      article.appendChild(title);

      if (episode.image && episode.image.medium) {
          const image = document.createElement("img");
          image.src = episode.image.medium;
          image.alt = episode.name;
          article.appendChild(image);
      }

      const summary = document.createElement("p");
      summary.innerHTML = episode.summary || "No summary available.";
      article.appendChild(summary);

      episodeContainer.appendChild(article);
  });

  displayEpisodeCount(episodeList.length, getAllEpisodes().length)
}

function padNumber(number) {
  return number.toString().padStart(2, '0');
}

function setupSearch(allEpisodes) {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (event) => {
      const searchTerm = event.target.value.toLowerCase();
      const filteredEpisodes = allEpisodes.filter(episode => {
          return episode.name.toLowerCase().includes(searchTerm) ||
                 (episode.summary && episode.summary.toLowerCase().includes(searchTerm));
      });
      makePageForEpisodes(filteredEpisodes);
  });
}

function setupEpisodeSelect(allEpisodes) {
  const episodeSelect = document.getElementById("episodeSelect");
  allEpisodes.forEach(episode => {
      const option = document.createElement("option");
      option.value = episode.id;
      option.textContent = `S${padNumber(episode.season)}E${padNumber(episode.number)} - ${episode.name}`;
      episodeSelect.appendChild(option);
  });

  episodeSelect.addEventListener("change", (event) => {
      const selectedId = parseInt(event.target.value);
      if (selectedId) {
          const selectedEpisode = allEpisodes.find(episode => episode.id === selectedId);
          makePageForEpisodes([selectedEpisode]);
      } else {
          makePageForEpisodes(allEpisodes);
      }
  });
}

function displayEpisodeCount(displayed, total){
  const displayCount = document.getElementById("displayCount");
  displayCount.textContent = `Displaying ${displayed} / ${total} episodes`;
}

window.onload = setup;