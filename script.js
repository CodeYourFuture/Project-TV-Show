//You can edit ALL of the code here
// GLOBAL EPISODE STORAGE (replaces getAllEpisodes)
let allEpisodes = [];
let allShows = [];
const episodeCache = {};

function showShowsView() {
  const showsView = document.getElementById("shows-view");
  const episodesView = document.getElementById("episodes-view");
  if (showsView) showsView.style.display = "block";
  if (episodesView) episodesView.style.display = "none";

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.placeholder = "Search shows by name, genre, or summary...";
    searchInput.value = "";
  }
}

function showEpisodesView() {
  const showsView = document.getElementById("shows-view");
  const episodesView = document.getElementById("episodes-view");
  if (showsView) showsView.style.display = "none";
  if (episodesView) episodesView.style.display = "block";

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.placeholder = "Search episodes...";
    searchInput.value = "";
  }
}
// MAIN SETUP
async function setup() {
  allShows = await fetchShows();

  allShows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  // Fetch shows first
  if (allShows.length === 0) return;

  createShowSelectElement();
  createSelectElement();
  SetupSearchBar();

  EventChange();
  handleSearchInput();

  makePageForShows(allShows);
  showShowsView();
}

async function fetchShows() {
  const rootElem = document.getElementById("root");

  //Container for Shows view
  let showsView = document.getElementById("shows-view");
  if (!showsView) {
    showsView = document.createElement("div");
    showsView.id = "shows-view";

    //1. DEFINE showsHeader FIRST
    const showsHeader = document.createElement("div");
    showsHeader.id = "show-header";
    showsHeader.innerHTML = `<span id ="show-search-count"></span>`;

    //2. DEFINE showsGrid SECOND
    const showsGrid = document.createElement("div");
    showsGrid.id = "shows-grid";

    showsView.append(showsHeader, showsGrid);
    rootElem.appendChild(showsView);
  }

  let episodesView = document.getElementById("episodes-view");
  //container for Episode View
  if (!episodesView) {
    episodesView = document.createElement("div");
    episodesView.id = "episodes-view";
    episodesView.classList.add("hidden"); // Start with episodes hidden
    rootElem.appendChild(episodesView);
  }
  //fetch shows from TVMaze API

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    rootElem.innerHTML =
      "<p>Failed to load shows. Please refresh and try again.</p>";
    console.error("Fetch shows error:", error);
    return [];
  }
}

// Fetch episodes from TVMaze API
async function fetchEpisodes(showId) {
  if (!showId) {
    console.error("fetchEpisodes was called without a showId");
    return [];
  }

  if (episodeCache[showId]) {
    return episodeCache[showId];
  }

  const episodesView = document.getElementById("episodes-view");
  if (episodesView) {
    episodesView.innerHTML = "<p>Loading episodes...</p>";
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    episodeCache[showId] = data;
    return data;
  } catch (error) {
    if (episodesView)
      episodesView.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
  console.error("Fetch error:", error);
  return [];
}
//commit trying//

// Format SxxExx
function formatEpisodeCode(season, episode) {
  const formattedSeason = String(season).padStart(2, "0");
  const formattedNumber = String(episode).padStart(2, "0");
  return `S${formattedSeason}E${formattedNumber}`;
}

//makePageForShows

function makePageForShows(showsList) {
  const showsGrid = document.getElementById("shows-grid");
  if (!showsGrid) return;

  showsGrid.innerHTML = "";

  showsList.forEach((show) => {
    const showCard = document.createElement("section");
    showCard.classList.add("show-card");

    // NEW HTML STRUCTURE FOR HORIZONTAL FLEXBOX LAYOUT
    showCard.innerHTML = `
      <h2>${show.name}</h2>
      <div class="show-card-content">
        <img src="${show.image ? show.image.medium : ""}" alt="${show.name}" />
        <div class="show-card-summary">${show.summary || ""}</div>
        <div class="show-card-meta">
          <p><strong>Rated:</strong> ${show.rating?.average || "N/A"}</p>
          <p><strong>Genres:</strong> ${(show.genres || []).join(" | ")}</p>
          <p><strong>Status:</strong> ${show.status || "N/A"}</p>
          <p><strong>Runtime:</strong> ${show.runtime || "N/A"} min</p>
        </div>
      </div>
      `;

    // When clicking a show card, switch views and load its episodes
    showCard.addEventListener("click", async () => {
      showEpisodesView();
      await handleShowChange(show.id);
    });

    showsGrid.appendChild(showCard);
  });
}

// Create show dropdown
function createShowSelectElement() {
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // LISTEN FOR SHOW SELECTION CHANGE
  showSelect.addEventListener("change", async (event) => {
    const selectedShowId = event.target.value;
    await handleShowChange(selectedShowId);
  });

  const rootElem = document.getElementById("root");
  document.body.insertBefore(showSelect, rootElem);
  return showSelect;
}

// Create dropdown
function createSelectElement() {
  const createSelect = document.createElement("select");
  createSelect.id = "episode-select";
  const rootElem = document.getElementById("root");
  document.body.insertBefore(createSelect, rootElem);
  return createSelect;
}

// Create dropdown options
function createOptionElements() {
  const createSelect = document.getElementById("episode-select");

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Show all episodes";
  createSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    let option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    createSelect.appendChild(option);
  });
}

// Step 1: Put handleShowChange here so everyone can use it
async function handleShowChange(showId) {
  showEpisodesView();

  //keep the dropdown menu in sync with the show clicked
  const showSelect = document.getElementById("show-select");
  if (showSelect) {
    showSelect.value = showId;
  }

  //1. Fetch episodes and update our global allEpisodes variable
  allEpisodes = await fetchEpisodes(showId);

  // 2. Reset the search bar input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
  }

  // 3. Rebuild the episode dropdown options for this new show
  const createSelect = document.getElementById("episode-select");
  if (createSelect) {
    createSelect.innerHTML = ""; // Clear old options
    createOptionElements(); // Add new options
  }

  // 4. Draw the new episodes on screen!
  makePageForEpisodes(allEpisodes);
}

// Dropdown change event episode
function EventChange() {
  const createSelect = document.getElementById("episode-select");
  const showSelect = document.getElementById("show-select");

  createSelect.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const result = allEpisodes.filter(
        (episode) => episode.id === Number(selectedValue),
      );
      makePageForEpisodes(result);
    }
  });
}

// Build search bar
function SetupSearchBar() {
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search the episodes...";

  const searchCount = document.createElement("span");
  searchCount.id = "search-count";

  const rootElem = document.getElementById("root");
  document.body.insertBefore(searchInput, rootElem);
  document.body.insertBefore(searchCount, rootElem);
}

// Search input handler
function handleSearchInput() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    const ShowsView = document.getElementById("shows-view");

    //check if we are currently looking at Shows or Episodes
    const isShowingShows = ShowsView && ShowsView.style.display !== "none";
    if (isShowingShows) {
      //Filter Shows
      const filteredShows = allShows.filter((show) => {
        const matchName = (show.name || "").toLowerCase().includes(searchTerm);
        const matchSummary = (show.summary || "")
          .toLowerCase()
          .includes(searchTerm);
        const matchGenres = (show.genres || []).some((genre) =>
          genre.toLowerCase().includes(searchTerm),
        );
        return matchName || matchSummary || matchGenres;
      });
      makePageForShows(filteredShows);
    } else {
      //Filter Episodes
      const filteredEpisodes = allEpisodes.filter((episode) => {
        const matchName = (episode.name || "")
          .toLowerCase()
          .includes(searchTerm);
        const matchSummary = (episode.summary || "")
          .toLowerCase()
          .includes(searchTerm);
        const matchCode = formatEpisodeCode(episode.season, episode.number)
          .toLowerCase()
          .includes(searchTerm);

        return matchName || matchSummary || matchCode;
      });

      makePageForEpisodes(filteredEpisodes);
    }
  });
}

// Render episodes
function makePageForEpisodes(episodeList) {
  const episodesView = document.getElementById("episodes-view");
  if (!episodesView) return;

  //1.Clear previous content so items don't stack
  episodesView.innerHTML = "";

  //2.Update search counter
  const countElem = document.getElementById("search-count");
  if (countElem) {
    countElem.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;
  }

  //3. Create Navigation back button
  const backBtn = document.createElement("button");
  backBtn.id = "Back-to-show-btn";
  backBtn.textContent = "← Back to Shows Listing";
  backBtn.addEventListener("click", () => {
    showShowsView();
  });

  //4. Create single grid and build cards
  const episodesGrid = document.createElement("div");
  episodesGrid.id = "episodes-grid";
  const cards = episodeList.map((episode) => createDramaCard(episode));
  episodesGrid.append(...cards);

  //5. Append button and grid to view
  episodesView.append(backBtn, episodesGrid);
}

// Helper to create child element
function createChildElement(parentElement, tagName, textContent) {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  parentElement.append(element);
  return element;
}

// Build episode card
function createDramaCard(episode) {
  const card = document.createElement("section");
  card.classList.add("drama-card");

  const episodeCode = formatEpisodeCode(episode.season, episode.number);

  const smallcard = document.createElement("div");
  smallcard.classList.add("small-card");
  createChildElement(smallcard, "h3", `${episode.name} - ${episodeCode}`);
  card.append(smallcard);

  const img = document.createElement("img");
  img.src = episode.image ? episode.image.medium : "";
  card.append(img);

  const summaryElem = document.createElement("div");
  summaryElem.innerHTML = episode.summary;
  card.append(summaryElem);

  return card;
}

window.onload = setup;
