let allEpisodes = [];
const episodeCache = {}; // showId -> episodes array
let showsList = [];

function setup() {
  const rootElem = document.getElementById("shows-list");
  rootElem.textContent = "Loading shows...";

  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load shows");
      }
      return response.json();
    })
    .then((shows) => {
      // Sort alphabetically, case-insensitive
      showsList = shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
      makeShowsPage(showsList);
      setupShowSelector(showsList);
      setupShowSearch();
      setupBackButton();
      setupSearch();
      setupEpisodeSelector();
    })
    .catch(() => {
      rootElem.textContent = "Sorry, we could not load the shows list.";
    });
}

function makeShowsPage(shows) {
  const showsListElem = document.getElementById("shows-list");

  showsListElem.innerHTML = "";

  for (const show of shows) {
    showsListElem.append(makeShowCard(show));
  }
}

function makeShowCard(show) {
  const card = document.createElement("article");

  const title = document.createElement("h2");
  title.textContent = show.name;

  const image = document.createElement("img");
  image.src = show.image ? show.image.medium : "";
  image.alt = show.name;

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "";

  const genres = document.createElement("p");
  genres.textContent = `Genres: ${show.genres.join(", ")}`;

  const status = document.createElement("p");
  status.textContent = `Status: ${show.status}`;

  const rating = document.createElement("p");
  rating.textContent = `Rating: ${show.rating.average || "N/A"}`;

  const runtime = document.createElement("p");
  runtime.textContent = `Runtime: ${show.runtime || "N/A"} minutes`;

  card.append(title, image, summary, genres, status, rating, runtime);

  title.addEventListener("click", () => {
    showEpisodes(show.id);
  });

  return card;
}

function showEpisodes(showId) {
  const showsPage = document.getElementById("shows-page");
  const episodesPage = document.getElementById("episodes-page");

  showsPage.hidden = true;
  episodesPage.hidden = false;

  loadShow(showId);
}

function setupBackButton() {
  const backButton = document.getElementById("back-toback");
  const showsPage = document.getElementById("shows-page");
  const episodesPage = document.getElementById("episodes-page");

  backButton.addEventListener("click", () => {
    episodesPage.hidden = true;
    showsPage.hidden = false;
  });
}

function setupShowSearch() {
  const searchInput = document.getElementById("show-search");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    const matches = showsList.filter((show) => {
      return (
        show.name.toLowerCase().includes(term) ||
        show.genres.join(" ").toLowerCase().includes(term) ||
        show.summary.toLowerCase().includes(term)
      );
    });

    makeShowsPage(matches);
  });
}

function setupShowSelector(shows) {
  const showSelectElem = document.getElementById("show-select");

  showSelectElem.innerHTML = '<option value="">Choose a TV show...</option>';

  shows.forEach((show) => {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelectElem.append(option);
  });

  showSelectElem.addEventListener("change", () => {
    if (showSelectElem.value !== "") {
      showEpisodes(showSelectElem.value);
    }
  });
}

function loadShow(showId) {
  const rootElem = document.getElementById("root");

  // Reset search box on show switch
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  // Use cache if we've already fetched this show's episodes
  if (episodeCache[showId] !== undefined) {
    allEpisodes = episodeCache[showId];
    finishLoadingShow();
    return;
  }

  rootElem.textContent = "Loading episodes...";
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }
      return response.json();
    })
    .then((episodes) => {
      episodeCache[showId] = episodes; // cache it
      allEpisodes = episodes;
      finishLoadingShow();
    })
    .catch(() => {
      rootElem.textContent = "Sorry, we could not load the episodes.";
    });
}

function finishLoadingShow() {
  makePageForEpisodes(allEpisodes);
  updateEpisodeSelector(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  for (const episode of episodeList) {
    rootElem.append(makeEpisodeCard(episode));
  }
  rootElem.append(makeCredit());
}

function makeEpisodeCard(episode) {
  const card = document.createElement("section");
  card.id = `episode-${episode.id}`;
  const title = document.createElement("h2");
  title.textContent = episode.name;
  const code = document.createElement("p");
  code.textContent = formatEpisodeCode(episode);
  const image = document.createElement("img");
  image.src = episode.image ? episode.image.medium : "";
  image.alt = episode.name;
  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";
  card.append(title, code, image, summary);
  return card;
}

function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}`;
}

function makeCredit() {
  const credit = document.createElement("p");
  credit.innerHTML =
    'Data originally from <a href="https://www.tvmaze.com" target="_blank">TVMaze.com</a>';
  return credit;
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const countDisplay = document.getElementById("search-count");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    const matches = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(term) ||
        (episode.summary && episode.summary.toLowerCase().includes(term))
      );
    });

    makePageForEpisodes(matches);
    countDisplay.textContent = `${matches.length} / ${allEpisodes.length} episodes`;
  });
}

function setupEpisodeSelector() {
  const selectElem = document.getElementById("episode-select");

  selectElem.addEventListener("change", () => {
    const target = document.getElementById(`episode-${selectElem.value}`);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
}

function updateEpisodeSelector(episodes) {
  const selectElem = document.getElementById("episode-select");

  selectElem.innerHTML = '<option value="">Jump to episode...</option>';

  episodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;

    selectElem.append(option);
  });
}

window.onload = setup;
