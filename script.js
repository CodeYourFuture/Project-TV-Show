// Helper to format season and episode numbers into "S01E01" format
function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

// Cache episode requests so each episode URL is fetched only once
const episodeCache = {};

function getEpisodesForShow(showId) {
  if (!episodeCache[showId]) {
    episodeCache[showId] = fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load episodes for show ID ${showId}`);
      }

      return response.json();
    });
  }

  return episodeCache[showId];
}

// Creates or gets the .controls container
function getControlsContainer() {
  let controls = document.querySelector(".controls");

  if (!controls) {
    controls = document.createElement("div");
    controls.className = "controls";

    const root = document.getElementById("root");
    root.parentNode.insertBefore(controls, root);
  }

  return controls;
}

async function setup() {
  const controls = getControlsContainer();

  // Create the controls once (Added Back Button)
  controls.innerHTML = `
    <button id="back-to-shows" style="display:none">← Back to Shows</button>
    <select id="show-select"></select>
    <select id="episode-select"></select>
    <input id="search-input" type="text" placeholder="Search..." />
    <span id="search-count">Loading shows...</span>
  `;

  const backToShowsBtn = document.getElementById("back-to-shows");
  const showSelect = document.getElementById("show-select");
  const episodeSelect = document.getElementById("episode-select");
  const searchInput = document.getElementById("search-input");
  const searchCount = document.getElementById("search-count");

  let currentEpisodes = [];
  let currentShowName = "";
  let allShows = [];
  let currentView = "shows"; // View state tracker ("shows" | "episodes")

  try {
    // Fetch all shows
    const showsResponse = await fetch("https://api.tvmaze.com/shows");

    if (!showsResponse.ok) {
      throw new Error("Failed to load shows");
    }

    allShows = await showsResponse.json();

    // Sort alphabetically, ignoring case
    allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      })
    );

    // Populate show dropdown selector
    showSelect.innerHTML = `<option value="">Select a show...</option>`;
    allShows.forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelect.appendChild(option);
    });

    // Renders the main shows front-page view
    function renderShowsView(showsToDisplay) {
      currentView = "shows";
      backToShowsBtn.style.display = "none";
      episodeSelect.style.display = "none";
      showSelect.value = "";
      searchInput.value = "";
      searchInput.placeholder = "Search shows by name, genre, summary...";

      makePageForShows(showsToDisplay, loadShow);
      searchCount.textContent = `Displaying ${showsToDisplay.length}/${allShows.length} shows`;
    }

    // Populate the episode dropdown for the current show
    function populateEpisodeSelect(episodes) {
      episodeSelect.innerHTML = `<option value="ALL">All Episodes</option>`;

      episodes.forEach((episode) => {
        const option = document.createElement("option");
        option.value = episode.id;
        option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
        episodeSelect.appendChild(option);
      });
    }

    // Load episodes for a show
    async function loadShow(showId) {
      searchCount.textContent = "Loading episodes...";

      try {
        const selectedShow = allShows.find(
          (show) => show.id === Number(showId)
        );

        if (!selectedShow) return;

        currentShowName = selectedShow.name;
        currentEpisodes = await getEpisodesForShow(showId);

        currentView = "episodes";
        backToShowsBtn.style.display = "inline-block";
        episodeSelect.style.display = "inline-block";
        showSelect.value = showId;
        searchInput.value = "";
        searchInput.placeholder = "Search episodes...";

        populateEpisodeSelect(currentEpisodes);
        makePageForEpisodes(currentEpisodes, currentShowName);
        searchCount.textContent = `Displaying ${currentEpisodes.length}/${currentEpisodes.length} episodes`;
      } catch (error) {
        searchCount.textContent = "Error loading episodes.";
        console.error(error);
      }
    }

    // Display shows listing on app load
    renderShowsView(allShows);

    // Navigation: Back to shows button
    backToShowsBtn.addEventListener("click", () => {
      renderShowsView(allShows);
    });

    // Show dropdown selector
    showSelect.addEventListener("change", async (event) => {
      if (event.target.value) {
        await loadShow(event.target.value);
      } else {
        renderShowsView(allShows);
      }
    });

    // Dual-purpose search (Shows or Episodes based on view)
    searchInput.addEventListener("input", (event) => {
      const searchTerm = event.target.value.toLowerCase().trim();

      if (currentView === "shows") {
        const filteredShows = allShows.filter((show) => {
          const nameMatch = show.name.toLowerCase().includes(searchTerm);
          const genreMatch = show.genres.some((g) =>
            g.toLowerCase().includes(searchTerm)
          );
          const summaryMatch = show.summary
            ? show.summary.replace(/<[^>]*>/g, "").toLowerCase().includes(searchTerm)
            : false;

          return nameMatch || genreMatch || summaryMatch;
        });

        makePageForShows(filteredShows, loadShow);
        searchCount.textContent = `Displaying ${filteredShows.length}/${allShows.length} shows`;
      } else {
        episodeSelect.value = "ALL";

        const filteredEpisodes = currentEpisodes.filter((episode) => {
          const nameMatch = episode.name.toLowerCase().includes(searchTerm);
          const summaryMatch = episode.summary
            ? episode.summary.replace(/<[^>]*>/g, "").toLowerCase().includes(searchTerm)
            : false;

          return nameMatch || summaryMatch;
        });

        makePageForEpisodes(filteredEpisodes, currentShowName);
        searchCount.textContent = `Displaying ${filteredEpisodes.length}/${currentEpisodes.length} episodes`;
      }
    });

    // Episode dropdown selector
    episodeSelect.addEventListener("change", (event) => {
      const selectedId = event.target.value;
      searchInput.value = "";

      if (selectedId === "ALL") {
        makePageForEpisodes(currentEpisodes, currentShowName);
        searchCount.textContent = `Displaying ${currentEpisodes.length}/${currentEpisodes.length} episodes`;
        return;
      }

      const selectedEpisode = currentEpisodes.find(
        (episode) => episode.id === Number(selectedId)
      );

      if (selectedEpisode) {
        makePageForEpisodes([selectedEpisode], currentShowName);
        searchCount.textContent = `Displaying 1/${currentEpisodes.length} episodes`;
      }
    });
  } catch (error) {
    searchCount.textContent = "Failed to load TV shows.";
    console.error(error);
  }
}

// Render show cards for front page listing
function makePageForShows(showsList, onShowClick) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const container = document.createElement("div");
  container.className = "shows-container";

  showsList.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";

    card.innerHTML = `
      <h2 class="show-title" style="cursor:pointer; color:#0066cc;">${show.name}</h2>
      <img src="${show.image?.medium || ""}" alt="${show.name}">
      <div class="show-summary">${show.summary || "<p>No summary available.</p>"}</div>
      <div class="show-meta">
        <p><strong>Genres:</strong> ${show.genres?.join(" | ") || "N/A"}</p>
        <p><strong>Status:</strong> ${show.status || "N/A"}</p>
        <p><strong>Rating:</strong> ${show.rating?.average ?? "N/A"}</p>
        <p><strong>Runtime:</strong> ${show.runtime ? `${show.runtime} min` : "N/A"}</p>
      </div>
    `;

    card.querySelector(".show-title").addEventListener("click", () => {
      onShowClick(show.id);
    });

    container.appendChild(card);
  });

  rootElem.appendChild(container);
}

// Render episode cards
function makePageForEpisodes(episodeList, showName) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const heading = document.createElement("h1");
  heading.textContent = `${showName} Episodes`;
  rootElem.appendChild(heading);

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  const container = document.createElement("div");
  container.className = "episodes-container";

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    card.innerHTML = `
      <h2>${episode.name} - ${formatEpisodeCode(episode)}</h2>
      <img src="${episode.image?.medium || ""}" alt="${episode.name}">
      <div class="episode-summary">${episode.summary || ""}</div>
      ${
        episode.url
          ? `<a href="${episode.url}" target="_blank" rel="noopener noreferrer">View on TVMaze</a>`
          : ""
      }
    `;

    container.appendChild(card);
  });

  rootElem.appendChild(container);
}

window.onload = setup;
