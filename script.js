//You can edit ALL of the code here

function setup() {
  const rootElem = document.getElementById("root");
  // Show a loading message as we are now loading data async.
  rooElem.innerHTML = "<p class ='Loading-message'>loading episodes, please wait ..</p>";

  // Create the search and filter controls
  const controls = document.createElement("div");

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";

  const episodeSelect = document.createElement("select");

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Episodes";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach(function (episode) {
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${season}E${number} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });

  const results = document.createElement("p");
  results.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

  controls.appendChild(searchInput);
  controls.appendChild(episodeSelect);
  controls.appendChild(results);

  document.body.insertBefore(controls, rootElem);

  makePageForEpisodes(allEpisodes);

  // Filter episodes while typing
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);

    results.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;

    episodeSelect.value = "";
  });

  // Show the selected episode
  episodeSelect.addEventListener("change", function () {
    if (episodeSelect.value === "") {
      makePageForEpisodes(allEpisodes);

      results.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

      return;
    }

    const selectedEpisode = allEpisodes.filter(function (episode) {
      return episode.id == episodeSelect.value;
    });

    makePageForEpisodes(selectedEpisode);

    results.textContent = `Displaying ${selectedEpisode.length}/${allEpisodes.length} episodes`;

    searchInput.value = "";
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear previous episodes before displaying new ones
  rootElem.innerHTML = "";

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
