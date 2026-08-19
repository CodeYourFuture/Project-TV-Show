const TVMAZE_SHOW_ID = 82;
const TVMAZE_EPISODES_URL = `https://api.tvmaze.com/shows/${TVMAZE_SHOW_ID}/episodes`;
const TVMAZE_SITE_URL = "https://www.tvmaze.com/";

let allEpisodes = [];


function getEpisodeCode(episode) {
  const seasonNumber = String(episode.season).padStart(2, "0");
  const episodeNumber = String(episode.number).padStart(2, "0");

  return `S${seasonNumber}E${episodeNumber}`;
}

function createEpisodeCard(episode) {
  const episodeCode = getEpisodeCode(episode);

  const card = document.createElement("div");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;

  const heading = document.createElement("h2");
  heading.textContent = `${episodeCode} - ${episode.name}`;
  card.appendChild(heading);

  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = `Image for ${episode.name}`;
  card.appendChild(image);

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary;
  card.appendChild(summary);

  return card;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.textContent = "";

  const counter = document.createElement("p");
  counter.textContent =
    `Displaying ${episodeList.length} / ${allEpisodes.length} episodes`;

  rootElem.appendChild(counter);

  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    rootElem.appendChild(card);
  });
}

function setupSearch() {
  const rootElem = document.getElementById("root");

  const searchContainer = document.createElement("div");

  const label = document.createElement("label");
  label.setAttribute("for", "search-input");
  label.textContent = "Search episodes: ";

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";

  searchContainer.appendChild(label);
  searchContainer.appendChild(searchInput);

  rootElem.parentNode.insertBefore(searchContainer, rootElem);

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const episodeName = episode.name.toLowerCase();
      const episodeSummary = (episode.summary || "").toLowerCase();

      return (
        episodeName.includes(searchTerm) ||
        episodeSummary.includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);
  });
}

function setupEpisodeSelector() {
  const rootElem = document.getElementById("root");

  const selectorContainer = document.createElement("div");

  const label = document.createElement("label");
  label.setAttribute("for", "episode-selector");
  label.textContent = "Select episode: ";

  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose an episode";
  episodeSelector.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;

    episodeSelector.appendChild(option);
  });

  selectorContainer.appendChild(label);
  selectorContainer.appendChild(episodeSelector);

  rootElem.parentNode.insertBefore(selectorContainer, rootElem);

  episodeSelector.addEventListener("change", function () {
    if (episodeSelector.value === "") {
      return;
    }

    const searchInput = document.getElementById("search-input");
    searchInput.value = "";

    makePageForEpisodes(allEpisodes);

    const selectedEpisode = document.getElementById(
      `episode-${episodeSelector.value}`
    );

    selectedEpisode.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

async function setup() {
  const rootElem = document.getElementById("root");

  rootElem.textContent = "Loading episodes...";

  try {
    const response = await fetch(
      "https://api.tvmaze.com/shows/82/episodes"
    );

    if (!response.ok) {
      throw new Error("Could not load episode data");
    }

    allEpisodes = await response.json();

    rootElem.textContent = "";

    setupSearch();
    setupEpisodeSelector();
    makePageForEpisodes(allEpisodes);
  } catch (error) {
    rootElem.textContent =
      "Sorry, we could not load the episodes. Please try again later.";
  }
}

window.onload = setup;