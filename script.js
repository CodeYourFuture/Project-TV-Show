//You can edit ALL of the code here
let allEpisodes = [];

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  makeEpisodeSelect(getAllEpisodes);
  updateMatchCount(allEpisodes.length, allEpisodes.length);

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", handleSearch);

  const episodeSelect = document.getElementById("episode-select");

  episodeSelect.addEventListener("change", handleSelect);
}

function makeEpisodeCode(season, number) {
  const seasonText = String(season).padStart(2, "0");
  const numberText = String(number).padStart(2, "0");
  return `S${seasonText}E${numberText}`;
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();

  const matchingEpisodes = allEpisodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    return name.includes(searchTerm) || summary.includes(searchTerm);
  });

  makePageForEpisodes(MatchingEpisodes);
  updateMatchCount(matchingEpisodes.length, allEpisodes.length);

  document.getElementById("episode-select").value = "all";
}

function updateMatchCount(matching, total) {
  const matchCount = document.getElementById("match-count");
  matchCount.textContent = `Displaying ${matching}/${total} episodes`;
}

function makeEpisodeSelect(episodeList) {
  const episodeSelect = document.getElementById("episode-select");

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Show all episodes";
  episodeSelect.append(allOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${makeEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    episodeSelect.append(option);
  });
}

function handleSelect(event) {
  const selectedValue = event.target.value;

  // Clear the search box so the page and the controls agree
  document.getElementById("search-input").value = "";

  if (selectedValue === "all") {
    makePageForEpisodes(allEpisodes);
    updateMatchCount(allEpisodes.length, allEpisodes.length);
    return;
  }

  const selectedEpisodes = allEpisodes.filter(
    (episode) => String(episode.id) === selectedValue,
  );
  makePageForEpisodes(selectedEpisodes);
  updateMatchCount(selectedEpisodes.length, allEpisodes.length);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const cards = episodeList.map(makeEpisodeCard);
  rootElem.append(...cards);
}

function makeEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${makeEpisodeCode(episode.season, episode.number)}`;
  card.append(title);

  if (episode.image) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Image from ${episode.name}`;
    card.append(image);
  }

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "<p>No summary available.</p>";
  card.append(summary);

  return card;
}

window.onload = setup;
