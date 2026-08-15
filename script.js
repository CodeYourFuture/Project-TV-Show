let allEpisodes = [];

function getEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}`;
}

function setup() {
  const episodeCount = document.getElementById("episode-count");

  // Tell the user that the episodes are loading
  episodeCount.textContent = "Loading episodes...";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      return response.json();
    })
    .then(function (data) {
      // Store the fetched episodes
      allEpisodes = data;

      // Display all episodes
      makePageForEpisodes(allEpisodes);

      // Display episode count
      episodeCount.textContent = `Showing ${allEpisodes.length} episodes`;

      // Set up search and dropdown
      setupSearch();
      setupEpisodeSelector();
    })
    .catch(function (error) {
      console.error(error);

      // Tell the user that something went wrong
      episodeCount.textContent =
        "Sorry, we couldn't load the episodes. Please try again later.";
    });
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

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

function setupEpisodeSelector() {
  const episodeSelector = document.getElementById("episode-selector");
  const searchInput = document.getElementById("search-input");
  const episodeCount = document.getElementById("episode-count");

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
        <p>${episodeCode}</p>
      </h2>

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
