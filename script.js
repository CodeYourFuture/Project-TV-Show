//You can edit ALL of the code here

const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const episodeSelect = document.getElementById("episode-select");
const matchCount = document.getElementById("match-count");

let allEpisodes = [];

const EPISODES_URL = "https://api.tvmaze.com/shows/82/episodes";

function setup() {
  rootElem.textContent = "Loading episodes, please wait...";

  fetch(EPISODES_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      return response.json();
    })
    .then((episodes) => {
      allEpisodes = episodes;
      makePageForEpisodes(allEpisodes);
      makeEpisodeSelect(allEpisodes);
      updateMatchCount(allEpisodes.length, allEpisodes.length);

      searchInput.addEventListener("input", handleSearch);
      episodeSelect.addEventListener("change", handleSelect);
    })
    .catch((error) => {
      rootElem.textContent =
        "Sorry, something went wrong loading the episodes. Please try again later.";
      console.error(error);
    });
}

function makeEpisodeCode(season, number) {
  const seasonText = String(season).padStart(2, "0");
  const numberText = String(number).padStart(2, "0");
  return `S${seasonText}E${numberText}`;
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();

  const matchingEpisodes = allEpisodes.filter((episode) => {
    const name = (episode.name || "").toLowerCase();
    const summary = stripHtml(episode.summary || "").toLowerCase();
    return name.includes(searchTerm) || summary.includes(searchTerm);
  });

  makePageForEpisodes(matchingEpisodes);
  updateMatchCount(matchingEpisodes.length, allEpisodes.length);

  document.getElementById("episode-select").value = "all";
}

function updateMatchCount(matching, total) {
  const matchCount = document.getElementById("match-count");
  matchCount.textContent = `Displaying ${matching}/${total} episodes`;
}

function makeEpisodeSelect(episodeList) {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.replaceChildren();

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

function stripHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent || "";
}

function makeEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";

  const title = document.createElement("h2");
  title.textContent = `${episode.name || "Untitled episode"} - ${makeEpisodeCode(episode.season, episode.number)}`;
  card.append(title);

  if (episode.image?.medium) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Image from ${episode.name || "this episode"}`;
    card.append(image);
  }

  const summary = document.createElement("div");
  summary.textContent =
    stripHtml(episode.summary || "") || "No summary available.";
  card.append(summary);

  return card;
}

window.onload = setup;
