const API_BASE = "https://api.tvmaze.com";

/* =========================
   DOM ELEMENTS
========================= */

const showsView = document.querySelector("#shows-view");
const episodesView = document.querySelector("#episodes-view");

const showsRoot = document.querySelector("#shows-root");
const showSearch = document.querySelector("#show-search");
const showSelect = document.querySelector("#show-select");
const showStatus = document.querySelector("#show-status");

const backToShows = document.querySelector("#back-to-shows");
const episodeSelect = document.querySelector("#episode-select");
const siteSearch = document.querySelector("#site-search");
const searchCount = document.querySelector("#search-count");
const root = document.querySelector("#root");

const episodeTemplate =
  document.querySelector("#episode-template");


/* =========================
   APPLICATION STATE
========================= */

let allShows = [];
let currentShow = null;
let currentEpisodes = [];


/*
  Every API request is stored by URL.

  The cache stores the Promise immediately.
  This means:
  - A URL is fetched only once.
  - If another part of the application asks
    for the same URL while it is still loading,
    it receives the same Promise.
  - Returning to a previously viewed show
    does not fetch its episodes again.
*/
const requestCache = new Map();


/* =========================
   HELPERS
========================= */

function stripHtml(html = "") {
  const div = document.createElement("div");

  div.innerHTML = html;

  return div.textContent || div.innerText || "";
}


function escapeHtml(text = "") {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


function getImage(
  image,
  fallback =
    "https://via.placeholder.com/300x450?text=No+Image"
) {
  return (
    image?.medium ||
    image?.original ||
    fallback
  );
}


/* =========================
   API REQUEST CACHE
========================= */

function fetchJson(url) {
  /*
    If this exact URL has already been requested,
    return the existing Promise instead of making
    another network request.
  */
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }

  const request = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status}`
      );
    }

    return response.json();
  });

  /*
    Store the Promise immediately.

    This prevents duplicate requests even if
    fetchJson() is called again before the
    first request has finished.
  */
  requestCache.set(url, request);

  return request;
}


/* =========================
   LOAD SHOWS
========================= */

async function loadShows() {
  showStatus.textContent =
    "Loading shows, please wait...";

  try {
    const url = `${API_BASE}/shows`;

    allShows = await fetchJson(url);

    populateShowSelector(allShows);

    showStatus.textContent =
      `Displaying ${allShows.length}/${allShows.length} shows`;

    renderShows(allShows);
  } catch (error) {
    console.error(error);

    showStatus.textContent =
      "Unable to load shows. Please try again later.";

    showsRoot.innerHTML = `
      <p class="error-message">
        There was a problem loading the shows.
      </p>
    `;
  }
}


/* =========================
   SHOW SELECTOR
========================= */

function populateShowSelector(shows) {
  showSelect.innerHTML = `
    <option value="">All Shows</option>
  `;

  const sortedShows = [...shows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    })
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");

    option.value = String(show.id);
    option.textContent = show.name;

    showSelect.appendChild(option);
  });
}

/* =========================
   FILTER SHOWS
========================= */

function filterShows() {
  const searchTerm = showSearch.value
    .trim()
    .toLowerCase();

  const selectedShowId =
    showSelect.value;

  let filteredShows = allShows;


  /*
    Filter by show selector.
  */

  if (selectedShowId) {
    filteredShows = filteredShows.filter(
      (show) =>
        String(show.id) === selectedShowId
    );
  }


  /*
    Filter by:
    - show name
    - genres
    - summary
  */

  if (searchTerm) {
    filteredShows = filteredShows.filter(
      (show) => {
        const name =
          show.name?.toLowerCase() || "";

        const genres =
          show.genres
            ?.join(" ")
            .toLowerCase() || "";

        const summary =
          stripHtml(show.summary)
            .toLowerCase();

        return (
          name.includes(searchTerm) ||
          genres.includes(searchTerm) ||
          summary.includes(searchTerm)
        );
      }
    );
  }


  renderShows(filteredShows);

  showStatus.textContent =
    `Displaying ${filteredShows.length}/${allShows.length} shows`;
}


/* =========================
   RENDER SHOWS
========================= */

function renderShows(shows) {
  showsRoot.innerHTML = "";

  if (shows.length === 0) {
    showsRoot.innerHTML = `
      <p class="error-message">
        No shows found.
      </p>
    `;

    return;
  }

  shows.forEach((show) => {
    const article =
      document.createElement("article");

    article.className = "show-card";


    const image = getImage(show.image);

    const summary =
      stripHtml(show.summary) ||
      "No summary available.";

    const genres =
      show.genres?.length
        ? show.genres.join(", ")
        : "N/A";

    const status =
      show.status || "N/A";

    const rating =
      show.rating?.average ?? "N/A";

    const runtime =
      show.runtime ?? "N/A";


    article.innerHTML = `
      <img
        src="${image}"
        alt="${escapeHtml(show.name)} poster"
        loading="lazy"
      />

      <div class="show-content">

        <h2>
          <button
            class="show-title"
            type="button"
          >
            ${escapeHtml(show.name)}
          </button>
        </h2>

        <p class="show-summary">
          ${escapeHtml(summary)}
        </p>

        <div class="show-details">

          <p>
            <strong>Genres:</strong>
            ${escapeHtml(genres)}
          </p>

          <p>
            <strong>Status:</strong>
            ${escapeHtml(status)}
          </p>

          <p>
            <strong>Rating:</strong>
            ${rating}
          </p>

          <p>
            <strong>Runtime:</strong>
            ${runtime} minutes
          </p>

        </div>

      </div>
    `;


    const title =
      article.querySelector(".show-title");


    title.addEventListener("click", () => {
      openShow(show);
    });


    showsRoot.appendChild(article);
  });
}


/* =========================
   OPEN SHOW
========================= */

async function openShow(show) {
  currentShow = show;

  showsView.hidden = true;
  episodesView.hidden = false;


  /*
    Reset episode controls when opening
    a different show.
  */

  siteSearch.value = "";
  episodeSelect.value = "";

  root.innerHTML = `
    <p>
      Loading episodes, please wait...
    </p>
  `;

  searchCount.textContent =
    "Loading episodes...";


  try {
    const episodes =
      await getEpisodes(show.id);

    currentEpisodes = episodes;

    populateEpisodeSelector(
      episodes
    );

    renderEpisodes(episodes);

    updateEpisodeCount(
      episodes.length
    );
  } catch (error) {
    console.error(error);

    root.innerHTML = `
      <p class="error-message">
        Unable to load episodes for
        ${escapeHtml(show.name)}.
      </p>
    `;

    searchCount.textContent =
      "Unable to load episodes.";
  }
}


/* =========================
   GET EPISODES
========================= */

function getEpisodes(showId) {
  const url =
    `${API_BASE}/shows/${showId}/episodes`;

  /*
    fetchJson() handles all caching.

    The same URL will never be fetched
    more than once during this visit.
  */

  return fetchJson(url);
}


/* =========================
   EPISODE SELECTOR
========================= */

function populateEpisodeSelector(
  episodes
) {
  episodeSelect.innerHTML = `
    <option value="">
      Select an episode
    </option>
  `;

  episodes.forEach((episode) => {
    const option =
      document.createElement("option");

    option.value =
      String(episode.id);

    option.textContent =
      `S${String(episode.season).padStart(
        2,
        "0"
      )}E${String(episode.number).padStart(
        2,
        "0"
      )} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });
}


/* =========================
   FILTER EPISODES
========================= */

function filterEpisodes() {
  const searchTerm =
    siteSearch.value
      .trim()
      .toLowerCase();

  const selectedEpisodeId =
    episodeSelect.value;

  let filteredEpisodes =
    currentEpisodes;


  /*
    Filter by episode selector.
  */

  if (selectedEpisodeId) {
    filteredEpisodes =
      filteredEpisodes.filter(
        (episode) =>
          String(episode.id) ===
          selectedEpisodeId
      );
  }


  /*
    Filter by:
    - episode name
    - episode summary
  */

  if (searchTerm) {
    filteredEpisodes =
      filteredEpisodes.filter(
        (episode) => {
          const name =
            episode.name?.toLowerCase() ||
            "";

          const summary =
            stripHtml(
              episode.summary
            ).toLowerCase();

          return (
            name.includes(searchTerm) ||
            summary.includes(searchTerm)
          );
        }
      );
  }


  renderEpisodes(
    filteredEpisodes
  );

  updateEpisodeCount(
    filteredEpisodes.length
  );
}


/* =========================
   EPISODE COUNT
========================= */

function updateEpisodeCount(count) {
  const total =
    currentEpisodes.length;

  searchCount.textContent =
    `Displaying ${count}/${total} episodes`;
}


/* =========================
   RENDER EPISODES
========================= */

function renderEpisodes(
  episodes
) {
  root.innerHTML = "";

  if (episodes.length === 0) {
    root.innerHTML = `
      <p class="error-message">
        No episodes found.
      </p>
    `;

    return;
  }


  episodes.forEach((episode) => {
    const fragment =
      episodeTemplate.content
        .cloneNode(true);


    const article =
      fragment.querySelector(".card");

    const title =
      fragment.querySelector(".title");

    const image =
      fragment.querySelector("img");

    const content =
      fragment.querySelector(".content");


    title.textContent =
      `S${String(episode.season).padStart(
        2,
        "0"
      )}E${String(episode.number).padStart(
        2,
        "0"
      )} - ${episode.name}`;


    image.src =
      getImage(episode.image);

    image.alt =
      `${episode.name} episode image`;


    const summary =
      stripHtml(
        episode.summary
      ) ||
      "No summary available.";


    content.innerHTML =
      `<p>${escapeHtml(summary)}</p>`;


    root.appendChild(fragment);
  });
}


/* =========================
   BACK TO SHOWS
========================= */

function showShowsView() {
  episodesView.hidden = true;
  showsView.hidden = false;
}


/* =========================
   EVENT LISTENERS
========================= */


/*
  Show text search
*/

showSearch.addEventListener(
  "input",
  filterShows
);


/*
  Show selector
*/

showSelect.addEventListener(
  "change",
  filterShows
);


/*
  Episode text search
*/

siteSearch.addEventListener(
  "input",
  filterEpisodes
);


/*
  Episode selector
*/

episodeSelect.addEventListener(
  "change",
  filterEpisodes
);


/*
  Back to shows
*/

backToShows.addEventListener(
  "click",
  showShowsView
);


/* =========================
   INITIALISE APP
========================= */

loadShows();