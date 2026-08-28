let allEpisodes = [];
// create a variable allShows to store all shows arrays
let allShows = [];
const episodesCache = {}; // create episodes object, so we never re-fetch a show

const SHOWS_URL = "https://api.tvmaze.com/shows";
const episodesUrl = (showId) =>
  `https://api.tvmaze.com/shows/${showId}/episodes`;

async function setup() {
  const showsView = document.getElementById("showsView");
  const episodesView = document.getElementById("episodesView");
  const showsStatus = document.getElementById("showsStatus");
  const showSearch = document.getElementById("showSearch");
  const showSelector = document.getElementById("showSelector");
  const backToShows = document.getElementById("backToShows");
  const searchInput = document.getElementById("searchInput");
  const episodesSelector = document.getElementById("episodeSelector");

  try {
    // 1. Fetch the list of shows ONCE, ever
    const showsResponse = await fetch(SHOWS_URL);
    if (!showsResponse.ok) throw new Error("Failed to load shows");
    allShows = await showsResponse.json();

    // Alphabetical, case-insensitive
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    showsStatus.textContent = "";

    // Populate the show selector
    populateShowSelector(allShows);

    // Display all shows
    displayShows(allShows);
    showMatchCount(allShows.length, allShows.length);

    // Show selector functionality
    showSelector.addEventListener("change", () => {
      const selectedShow = allShows.find(
        (show) => String(show.id) === showSelector.value,
      );

      if (selectedShow) {
        loadShow(selectedShow);
      }
    });

    // Search functionality for shows
    showSearch.addEventListener("input", () => {
      const query = showSearch.value.toLowerCase();

      const filteredShows = allShows.filter((show) => {
        const name = (show.name || "").toLowerCase();
        const genres = (show.genres || []).join(" ").toLowerCase();
        const summary = (show.summary || "").toLowerCase();

        return (
          name.includes(query) ||
          genres.includes(query) ||
          summary.includes(query)
        );
      });

      displayShows(filteredShows);
      showMatchCount(filteredShows.length, allShows.length);
    });

    // Return to shows listing
    backToShows.addEventListener("click", () => {
      episodesView.hidden = true;
      showsView.hidden = false;
    });

    // Search functionality for episodes
    searchInput.addEventListener("input", () => {
      episodesSelector.value = "all";

      const query = searchInput.value.toLowerCase();

      const filteredEpisodes = allEpisodes.filter((episode) => {
        const name = (episode.name || "").toLowerCase();
        const summary = (episode.summary || "").toLowerCase();

        return name.includes(query) || summary.includes(query);
      });

      makePageForEpisodes(filteredEpisodes);
      showEpisodeMatchCount(filteredEpisodes.length, allEpisodes.length);
    });

    // Dropdown functionality
    episodesSelector.addEventListener("change", () => {
      const selectedId = episodesSelector.value;

      // Show all episodes
      if (selectedId === "all") {
        searchInput.value = "";
        makePageForEpisodes(allEpisodes);
        showEpisodeMatchCount(allEpisodes.length, allEpisodes.length);
        return;
      }

      // Show selected episode
      searchInput.value = "";

      const singleEpisode = allEpisodes.filter(
        (episode) => String(episode.id) === selectedId,
      );

      makePageForEpisodes(singleEpisode);
      showEpisodeMatchCount(singleEpisode.length, allEpisodes.length);
    });
  } catch (error) {
    showsStatus.textContent =
      "Sorry, we could not load the shows. Please try again later.";
    showsView.innerHTML =
      "<p>Sorry, we could not load the shows. Please try again later.</p>";
  }
}

// Populate the show selector
function populateShowSelector(showList) {
  const selector = document.getElementById("showSelector");

  selector.innerHTML = "";

  for (const show of showList) {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    selector.appendChild(option);
  }
}

// Display all shows
function displayShows(showList) {
  const showsRoot = document.getElementById("showsRoot");
  showsRoot.innerHTML = "";

  if (showList.length === 0) {
    showsRoot.textContent = "No shows found.";
    return;
  }

  for (const show of showList) {
    const card = document.createElement("article");
    card.className = "show-card";

    // Create clickable show name
    const heading = document.createElement("h2");
    const showLink = document.createElement("button");

    showLink.textContent = show.name;
    showLink.className = "show-name";
    showLink.addEventListener("click", () => loadShow(show));

    heading.appendChild(showLink);
    card.appendChild(heading);

    // Create show image
    const image = document.createElement("img");
    image.src = show.image
      ? show.image.medium
      : "https://via.placeholder.com/210x295?text=No+Image";
    image.alt = show.name;
    card.appendChild(image);

    // Create show summary
    const summary = document.createElement("div");
    summary.className = "summary";
    summary.innerHTML = show.summary || "No summary available.";
    card.appendChild(summary);

    // Display genres
    const genres = document.createElement("p");
    genres.textContent = `Genres: ${
      show.genres.length > 0 ? show.genres.join(", ") : "Not available"
    }`;
    card.appendChild(genres);

    // Display status
    const status = document.createElement("p");
    status.textContent = `Status: ${show.status || "Not available"}`;
    card.appendChild(status);

    // Display rating
    const rating = document.createElement("p");
    rating.textContent = `Rating: ${
      show.rating && show.rating.average ? show.rating.average : "Not available"
    }`;
    card.appendChild(rating);

    // Display runtime
    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime || "Not available"} minutes`;
    card.appendChild(runtime);

    showsRoot.appendChild(card);
  }
}

// Fetch (or reuse cached) episodes for a show, then render them
async function loadShow(show) {
  const showsView = document.getElementById("showsView");
  const episodesView = document.getElementById("episodesView");
  const selectedShowName = document.getElementById("selectedShowName");
  const statusMessage = document.getElementById("statusMessage");
  const searchInput = document.getElementById("searchInput");
  const episodesSelector = document.getElementById("episodeSelector");

  selectedShowName.textContent = show.name;
  showsView.hidden = true;
  episodesView.hidden = false;
  searchInput.value = "";
  episodesSelector.value = "all";
  statusMessage.textContent = "Loading episodes, please wait...";

  try {
    // Use cached episodes so the same URL is never fetched twice
    if (!episodesCache[show.id]) {
      const response = await fetch(episodesUrl(show.id));
      if (!response.ok) throw new Error("Failed to load episodes");
      episodesCache[show.id] = await response.json();
    }

    allEpisodes = episodesCache[show.id];

    makePageForEpisodes(allEpisodes);
    showEpisodeMatchCount(allEpisodes.length, allEpisodes.length);
    populateEpisodeSelector(allEpisodes);

    statusMessage.textContent = "";
  } catch (error) {
    statusMessage.textContent =
      "Sorry, we could not load the episodes. Please try again later.";
  }
}

// Populate the episode selector
function populateEpisodeSelector(episodes) {
  const selector = document.getElementById("episodeSelector");

  // Clear old options
  selector.innerHTML = "";

  // Add the "All episodes" option first
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Episodes";
  selector.appendChild(allOption);

  // Add each episode
  episodes.forEach(({ id, name, season, number }) => {
    const option = document.createElement("option");

    const seasonCode = String(season).padStart(2, "0");
    const numberCode = String(number).padStart(2, "0");
    const episodeCode = `S${seasonCode}E${numberCode}`;

    option.value = id;
    option.textContent = `${episodeCode} - ${name}`;
    selector.appendChild(option);
  });
}

// Display episode count
function showEpisodeMatchCount(matchCount, totalCount) {
  const matchCountElem = document.getElementById("matchCount");

  if (matchCountElem) {
    matchCountElem.textContent = `Displaying ${matchCount}/${totalCount}`;
  }
}

// Display show count
function showMatchCount(matchCount, totalCount) {
  const matchCountElem = document.getElementById("showMatchCount");

  if (matchCountElem) {
    matchCountElem.textContent = `Displaying ${matchCount}/${totalCount} shows`;
  }
}

// Display episodes on the page
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("episodesRoot");

  if (!rootElem) {
    return;
  }

  // Clear the existing episodes
  rootElem.innerHTML = "";

  // Display a message if no episodes match
  if (episodeList.length === 0) {
    rootElem.textContent = "No episodes found.";
    return;
  }

  // Loop through every episode
  for (const episode of episodeList) {
    const card = document.createElement("article");
    card.className = "episode-card";

    // Create episode code
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    // Create heading
    const heading = document.createElement("h3");
    heading.textContent = `${episode.name} - ${episodeCode}`;
    card.appendChild(heading);

    // Create image
    const image = document.createElement("img");
    image.src = episode.image
      ? episode.image.medium
      : "https://via.placeholder.com/210x295?text=No+Image";
    image.alt = episode.name;
    card.appendChild(image);

    // Create summary
    const summary = document.createElement("div");
    summary.className = "summary";
    summary.innerHTML = episode.summary || "No summary available.";
    card.appendChild(summary);

    // Create TVMaze link
    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "link";
    link.textContent = "View on TVMaze";
    card.appendChild(link);

    // Add card to page
    rootElem.appendChild(card);
  }
}

window.addEventListener("load", setup);
