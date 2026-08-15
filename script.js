function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  const episodeCount = document.getElementById("episode-count");
  episodeCount.textContent = `Showing ${allEpisodes.length} episodes`;

  const searchInput = document.getElementById("search-input");

  const episodeSelector = document.getElementById("episode-selector");

  allEpisodes.forEach(function (episode) {
    const option = document.createElement("option");

    const episodeCode = getEpisodeCode(episode);

    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;

    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", function (event) {
    searchInput.value = "";

    episodeCount.textContent = `Showing ${allEpisodes.length} episodes`;

    makePageForEpisodes(allEpisodes);

    const selectedEpisode = document.getElementById(event.target.value);

    selectedEpisode.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });

    episodeCount.textContent = `Showing ${filteredEpisodes.length} episodes`;

    makePageForEpisodes(filteredEpisodes);
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  episodeList.forEach(function (episode) {
    const episodeBox = document.createElement("div");

    episodeBox.className = "episode";

    const episodeCode = getEpisodeCode(episode);

    episodeBox.id = episodeCode;

    episodeBox.innerHTML = `
      <h2>${episode.name}
      
  <p>${episodeCode}</p></h2>

      <img src="${episode.image.medium}" alt="${episode.name}">

      <p>Season ${episode.season}, Episode ${episode.number}</p>

      <p>${episode.summary}</p>

      <p>Air date: ${episode.airdate}</p>

      <p>Runtime: ${episode.runtime} minutes</p>

      <a href="${episode.url}" target="_blank">
        View episode
      </a>
    `;

    rootElem.appendChild(episodeBox);
  });
}

window.onload = setup;