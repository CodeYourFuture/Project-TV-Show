const grid = document.getElementById("grid");
const showSelect = document.getElementById("show-select");
const searchInput = document.getElementById("search-input");
const select = document.getElementById("episode-select");
const article = document.getElementsByTagName("article");
const backLink = document.getElementById("back-link");

const SHOWS_URL = "https://api.tvmaze.com/shows";
const PLACEHOLDER_IMAGE =
  "https://placehold.co/250x140?text=No+image+available";

let currentEpisodes = [];
let currentShowId = null;
let currentShows = [];

const episodeCache = new Map();

async function setup() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("showId")) {
    const showId = params.get("showId");

    if (isValidShowId(showId)) {
      currentShowId = showId;

      // load specific show list
      setupSearch();
      setupEpisodeSelector();
      setupShowSelector();

      await fetch(SHOWS_URL)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          return response.json();
        })
        .then((shows) => {
          const sortedShows = shows.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
          );

          if (sortedShows.length) {
            populateShowSelect(sortedShows);
            showControls();

            grid.classList.add("episodes-grid");

            loadShow(currentShowId);
          }
        })
        .catch((err) => {
          displayError(err.message);
        });
    } else {
      displayError(`Bad showId passed in: "${showId}"`);
      return;
    }
  } else {
    // display show search
    await fetch(SHOWS_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
      .then((shows) => {
        const sortedShows = shows.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );

        currentShows = sortedShows;

        showSelect.classList.remove("controls-hidden");

        populateShowSelect(currentShows);
        grid.classList.add("shows-grid");
        setupShowSearch();

        showSelect.addEventListener("change", () => {
          window.location.href = `/?showId=${showSelect.value}`;
        });

        loadShowFinder(sortedShows);
      })
      .catch((err) => {
        displayError(err.message);
      });
  }
}

function loadShowFinder(shows) {
  const template = document.getElementById("show-card");

  grid.innerHTML = "";

  for (const show of shows) {
    const clone = template.content.cloneNode(true);
    const article = clone.querySelector("article");
    const button = clone.querySelector("button");

    article.classList.add("article-horizontal");

    // Give each card a stable id so the episode selector can scroll to it
    const card = clone.querySelector(".show-card") || clone.firstElementChild;
    if (card) card.id = `show-${show.id}`;

    clone.querySelector(".title").textContent = show.name;

    clone.querySelector(".thumb").src =
      show.image && show.image.medium ? show.image.medium : PLACEHOLDER_IMAGE;
    clone.querySelector(".description").innerHTML = show.summary;

    clone.querySelector(".rating").innerText =
      `Rated: ${show.rating?.average ?? "Rating unavailable"}`;

    clone.querySelector(".genres").innerText =
      `Genres: ${show.genres.join(" | ")} `;

    clone.querySelector(".status").innerText =
      `Status: ${show.status === "Running" ? "Running ✓" : "Ended χ"} `;

    clone.querySelector(".runtime").innerText =
      `Duration: ${show.runtime ? `${show.runtime}m` : "Duration unavaliable"} `;

    button.addEventListener("click", () => {
      window.location.href = `/?showId=${show.id}`;
    });

    grid.appendChild(clone);
  }
}

function setupShowSearch() {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();

    const filtered = term
      ? currentShows.filter((show) => {
        const name = show.name.toLowerCase();
        const summary = (show.summary || "").toLowerCase();
        const genres = (show.genres || []).join(" ").toLowerCase();
        return (
          name.includes(term) ||
          summary.includes(term) ||
          genres.includes(term)
        );
      })
      : currentShows;

    loadShowFinder(filtered);
  });
}
function showControls() {
  showSelect.classList.remove("controls-hidden");
  searchInput.classList.remove("controls-hidden");
  select.classList.remove("controls-hidden");
  backLink.classList.remove("controls-hidden");
}

function isValidShowId(value) {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

function populateShowSelect(shows) {
  showSelect.innerHTML = "";
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function setupShowSelector() {
  showSelect.addEventListener("change", () => {
    loadShow(Number(showSelect.value));
  });
}

function loadShow(showId) {
  currentShowId = showId;
  showSelect.value = showId;
  searchInput.value = "";

  if (episodeCache.has(showId)) {
    currentEpisodes = episodeCache.get(showId);
    render(currentEpisodes);
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    })
    .then((episodeList) => {
      episodeCache.set(showId, episodeList);
      if (currentShowId === showId) {
        currentEpisodes = episodeList;
        render(currentEpisodes);
      }
    })
    .catch((err) => {
      displayError(err.message);
    });
}

function displayError(errorMessage) {
  grid.innerHTML = "";

  const template = document.getElementById("error");
  const clone = template.content.cloneNode(true);
  clone.querySelector(".error-message").textContent = errorMessage;

  document.body.appendChild(clone);
}

function render(episodeList) {
  const template = document.getElementById("episode-card");

  grid.innerHTML = "";

  if (episodeList == undefined || episodeList.length === 0) return;

  for (const episode of episodeList) {
    const clone = template.content.cloneNode(true);

    // Give each card a stable id so the episode selector can scroll to it
    const card =
      clone.querySelector(".episode-card") || clone.firstElementChild;
    if (card) card.id = `episode-${episode.id}`;

    clone.querySelector(".title").textContent =
      episode.name +
      " - S" +
      String(episode.season).padStart(2, "0") +
      "E" +
      String(episode.number).padStart(2, "0");

    clone.querySelector(".thumb").src =
      episode.image && episode.image.medium
        ? episode.image.medium
        : PLACEHOLDER_IMAGE;
    clone.querySelector(".description").innerText = episode.summary;

    grid.appendChild(clone);
  }

  updateMatchCount(episodeList.length, currentEpisodes.length);
  populateEpisodeSelectOptions(episodeList);
}

function updateMatchCount(shown, total) {
  const rootElem = document.getElementById("root");
  rootElem.textContent =
    shown === total
      ? `Got ${total} episode(s)`
      : `Displaying ${shown}/${total} episode(s)`;
}

// --- Search ---

function setupSearch() {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();

    const filtered = term
      ? currentEpisodes.filter((episode) => {
        const name = episode.name.toLowerCase();
        const summary = (episode.summary || "").toLowerCase();
        return name.includes(term) || summary.includes(term);
      })
      : currentEpisodes;

    render(filtered);
  });
}

// --- Episode selector ---

function setupEpisodeSelector() {
  select.addEventListener("change", () => {
    const selectedId = select.value;
    if (!selectedId) return;

    searchInput.value = "";

    const target = document.getElementById(`episode-${selectedId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function populateEpisodeSelectOptions(episodeList) {
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Jump to episode...";
  select.appendChild(placeholder);

  if (episodeList == undefined || episodeList.length === 0) return;

  for (const episode of episodeList) {
    const code =
      "S" +
      String(episode.season).padStart(2, "0") +
      "E" +
      String(episode.number).padStart(2, "0");
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${code} - ${episode.name}`;
    select.appendChild(option);
  }
}

window.onload = setup;
