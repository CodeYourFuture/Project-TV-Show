// GET ELEMENTS FROM HTML

const rootElem = document.getElementById("root");
const searchInput = document.querySelector("#search-input");
const episodeCount = document.querySelector("#episode-count");
const episodeSelector = document.querySelector("#episode-selector");
const showAllButton = document.querySelector("#show-all-button");
const showSelector = document.querySelector("#show-selector");
const backToShowsButton = document.querySelector("#back-to-shows");

let allEpisodes = [];
let allShows = [];
let cachedEpisodes = {};
let viewingShows = true;

// SHOW SELECTOR

showSelector.addEventListener("change", function () {
  const selectedShowId = showSelector.value;
  loadEpisodes(selectedShowId);
});

// SETUP

async function setup() {
  const allShowUrl = "https://api.tvmaze.com/shows";

  rootElem.textContent = "Loading shows...";

  // FETCH ALL SHOWS

  try {
    const response = await fetch(allShowUrl);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    allShows = await response.json();

    // SORT SHOWS ALPHABETICALLY

    allShows.sort((show1, show2) => {
      if (show1.name.toLowerCase() > show2.name.toLowerCase()) {
        return 1;
      } else if (show1.name.toLowerCase() < show2.name.toLowerCase()) {
        return -1;
      }

      return 0;
    });

    createShowSelector(allShows);

    // SHOW ALL SHOWS WHEN THE WEBSITE LOADS

    makePageForShows(allShows);
  } catch (error) {
    console.error(error.message);

    rootElem.textContent =
      "Sorry, we couldn't load the shows. Please try again.";
  }

  makeFooter();
}

// LOAD EPISODES

async function loadEpisodes(showId) {
  viewingShows = false;

  const showUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;

  // CHECK IF EPISODES HAVE ALREADY BEEN FETCHED

  if (cachedEpisodes[showId]) {
    allEpisodes = cachedEpisodes[showId];
  } else {
    // FETCH EPISODES

    try {
      const response = await fetch(showUrl);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      allEpisodes = await response.json();

      // SAVE EPISODES SO THEY ARE NOT FETCHED AGAIN

      cachedEpisodes[showId] = allEpisodes;
    } catch (error) {
      console.error(error.message);

      rootElem.textContent =
        "Sorry, we couldn't load the episodes. Please try again.";

      return;
    }
  }

  // DISPLAY EPISODES

  makePageForEpisodes(allEpisodes);
  createEpisodeSelector(allEpisodes);
}

// CREATE SHOW SELECTOR

function createShowSelector(showList) {
  showSelector.innerHTML = "";

  for (const show of showList) {
    const optionElement = document.createElement("option");

    optionElement.textContent = show.name;
    optionElement.value = show.id;

    showSelector.append(optionElement);
  }
}

// CREATE EPISODE SELECTOR

function createEpisodeSelector(episodeList) {
  episodeSelector.innerHTML = "";

  for (const episode of episodeList) {
    const optionElement = document.createElement("option");

    const episodeCode = `S${String(episode.season).padStart(
      2,
      "0",
    )}E${String(episode.number).padStart(2, "0")}`;

    optionElement.textContent = `${episodeCode} - ${episode.name}`;
    optionElement.value = episode.id;

    episodeSelector.append(optionElement);
  }
}

// EPISODE SELECTOR

episodeSelector.addEventListener("change", function (event) {
  const selectedEpisodeID = event.target.value;

  const selectedEpisode = allEpisodes.find(
    (episode) => episode.id === Number(selectedEpisodeID),
  );

  const selectedCard = document.getElementById(`episode-${selectedEpisode.id}`);

  const allCards = document.querySelectorAll("#root section");

  allCards.forEach(function (card) {
    card.style.display = "none";
  });

  selectedCard.style.display = "block";

  const selectedEpisodes = [selectedEpisode];

  episodeCount.textContent = `Displaying ${selectedEpisodes.length}/${allEpisodes.length} episodes`;
});

// SHOW ALL EPISODES

showAllButton.addEventListener("click", function () {
  makePageForEpisodes(allEpisodes);
});

// SEARCH

searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value;

  if (viewingShows) {
    const matchingShows = searchShows(searchTerm, allShows);

    makePageForShows(matchingShows);
  } else {
    const matchingEpisodes = searchEpisodes(searchTerm, allEpisodes);

    makePageForEpisodes(matchingEpisodes);
  }
});

// SEARCH SHOWS

function searchShows(searchTerm, shows) {
  const term = searchTerm.toLowerCase();

  return shows.filter((show) => {
    const name = show.name.toLowerCase();
    const genres = show.genres.join(" ").toLowerCase();
    const summary = (show.summary || "").toLowerCase();

    return (
      name.includes(term) || genres.includes(term) || summary.includes(term)
    );
  });
}

// SEARCH EPISODES

function searchEpisodes(searchTerm, episodes) {
  const term = searchTerm.toLowerCase();

  return episodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();

    return name.includes(term) || summary.includes(term);
  });
}

// DISPLAY SHOWS

function makePageForShows(showList) {
  rootElem.innerHTML = "";

  viewingShows = true;

  episodeCount.textContent = `Displaying ${showList.length}/${allShows.length} shows`;

  if (showList.length === 0) {
    rootElem.textContent = "Sorry, no show matched your search...";
    return;
  }

  const showCards = showList.map(createShowCard);

  rootElem.append(...showCards);
}

// CREATE SHOW CARD

function createShowCard(show) {
  const card = document.getElementById("show-card").content.cloneNode(true);

  const showTitle = card.querySelector(".show-title");

  showTitle.textContent = show.name;

  card.querySelector(".show-image").src = show.image?.medium || "";

  card.querySelector(".show-image").alt = show.name;

  card.querySelector(".show-summary").innerHTML =
    show.summary || "No summary available.";

  card.querySelector(".show-genres").textContent =
    show.genres.join(", ") || "No genres available";

  card.querySelector(".show-status").textContent = show.status || "Unknown";

  card.querySelector(".show-rating").textContent =
    show.rating?.average ?? "No rating";

  card.querySelector(".show-runtime").textContent = show.runtime ?? "Unknown";

  // CLICK SHOW NAME TO LOAD EPISODES

  showTitle.addEventListener("click", function () {
    loadEpisodes(show.id);
  });

  return card;
}

// DISPLAY EPISODES

function makePageForEpisodes(episodeList) {
  rootElem.innerHTML = "";

  viewingShows = false;

  episodeCount.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;

  if (episodeList.length === 0) {
    rootElem.textContent = "Sorry, no episode matched your search...";
    return;
  }

  const episodeCards = episodeList.map(createEpisodeCard);

  rootElem.append(...episodeCards);
}

// CREATE EPISODE CARD

function createEpisodeCard(episode) {
  const card = document.getElementById("episode-card").content.cloneNode(true);

  const episodeCode = `S${String(episode.season).padStart(
    2,
    "0",
  )}E${String(episode.number).padStart(2, "0")}`;

  card.querySelector("h3").textContent = `${episode.name} - ${episodeCode}`;

  card.querySelector("img").src = episode.image?.medium || "";

  card.querySelector("summary").innerHTML = episode.summary || "";

  card.querySelector("#episode-image").alt = episode.name;

  card.querySelector("section").id = `episode-${episode.id}`;

  return card;
}

// BACK TO SHOWS

backToShowsButton.addEventListener("click", function () {
  viewingShows = true;

  searchInput.value = "";

  makePageForShows(allShows);
});

// FOOTER

function makeFooter() {
  const attribution = document.createElement("p");
  const tvMazeLink = document.createElement("a");

  tvMazeLink.href = "https://tvmaze.com/";
  tvMazeLink.textContent = "TVMaze.com";

  attribution.append("Data originally sourced from ", tvMazeLink);

  const footer = document.createElement("footer");

  footer.append(attribution);

  document.body.append(footer);
}

window.onload = setup;
