// You can edit ALL of the code here

// LEVEL 400: Store the TV shows URL
const showsUrl = "https://api.tvmaze.com/shows";

// LEVEL 400: Cache episode requests so the same URL is never fetched twice
const episodeCache = {};

// LEVEL 500: Store all TV shows after the first fetch
let allShows = [];

function setup() {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML =
    "<p class='Loading-message'>Loading TV shows, please wait...</p>";

  // LEVEL 500: Fetch all TV shows
  fetch(showsUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return response.json();
    })
    .then(function (shows) {
      // LEVEL 500: Store all shows for searching and navigation
      allShows = shows;

      // LEVEL 400: Sort TV shows alphabetically, ignoring capital letters
      allShows.sort(function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });

      // LEVEL 500: Display the shows listing
      displayShows(allShows);
    })
    .catch(function (error) {
      showError(error);
    });
}
function displayShows(shows) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  // Create navigation
  const navigation = document.createElement("nav");

  const showsLink = document.createElement("a");
  showsLink.href = "#";
  showsLink.textContent = "Shows";

  navigation.appendChild(showsLink);

  // Create heading
  const heading = document.createElement("h1");
  heading.textContent = "All TV Shows";

  // Create search input
  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "showSearch";
  searchLabel.textContent = "Search shows:";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "showSearch";
  searchInput.placeholder = "Search by name, genre or summary...";

  // Create results count
  const results = document.createElement("p");
  results.textContent = `Displaying ${shows.length}/${allShows.length} shows`;

  // Create show container
  const showContainer = document.createElement("div");
  showContainer.id = "shows-list";

  rootElem.appendChild(navigation);
  rootElem.appendChild(heading);
  rootElem.appendChild(searchLabel);
  rootElem.appendChild(searchInput);
  rootElem.appendChild(results);
  rootElem.appendChild(showContainer);

  makePageForShows(shows);

  // LEVEL 500: Search shows while typing
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredShows = allShows.filter(function (show) {
      const showGenres = show.genres.join(" ").toLowerCase();
      const showSummary = (show.summary || "").toLowerCase();
      const showName = show.name.toLowerCase();

      return (
        showName.includes(searchTerm) ||
        showGenres.includes(searchTerm) ||
        showSummary.includes(searchTerm)
      );
    });

    results.textContent = `Displaying ${filteredShows.length}/${allShows.length} shows`;

    makePageForShows(filteredShows);
  });

  // LEVEL 400: Show selected episode
  episodeSelect.addEventListener("change", function () {
    if (episodeSelect.value === "") {
      makePageForEpisodes(allEpisodes);

      results.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

      return;
    }

    const selectedEpisode = allEpisodes.filter(function (episode) {
      return episode.id === Number(episodeSelect.value);
    });

    makePageForEpisodes(selectedEpisode);

    results.textContent = `Displaying ${selectedEpisode.length}/${allEpisodes.length} episodes`;

    searchInput.value = "";
  });

  // LEVEL 500: Allow user to return to the shows listing
  showsLink.addEventListener("click", function (event) {
    event.preventDefault();

    displayShows(allShows);
  });
}
   function makePageForShows(showList) {
  const showContainer = document.getElementById("shows-list");

  showContainer.innerHTML = "";

  showList.forEach(function (show) {
    const card = document.createElement("article");

    const title = document.createElement("h2");

    // LEVEL 500: Make the show name clickable
    const titleLink = document.createElement("a");
    titleLink.href = "#";
    titleLink.textContent = show.name;

    title.appendChild(titleLink);

    const image = document.createElement("img");

    if (show.image) {
      image.src = show.image.medium;
    }

    image.alt = show.name;

    const summary = document.createElement("div");
    summary.innerHTML = show.summary || "";

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ")}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status}`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${(show.rating && show.rating.average) || "N/A"}`;

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime || "N/A"} minutes`;

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);
    card.appendChild(genres);
    card.appendChild(status);
    card.appendChild(rating);
    card.appendChild(runtime);

    showContainer.appendChild(card);

    // LEVEL 500: Fetch episodes when the show name is clicked
    titleLink.addEventListener("click", function (event) {
      event.preventDefault();

      fetchEpisodes(show.id);
    });
  });
}  
  

// LEVEL 400: Fetch episodes for the selected TV show
function fetchEpisodes(showId) {
  const rootElem = document.getElementById("root");
  const episodesUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;

  // LEVEL 400: Use the cached request if this URL has already been fetched
  if (Object.prototype.hasOwnProperty.call(episodeCache, episodesUrl)) {
    episodeCache[episodesUrl]
      .then(function (episodes) {
        displayEpisodes(episodes);
      })
      .catch(function (error) {
        showError(error);
      });

    return;
  }
  // Show loading message
  const loadingMessage = document.createElement("p");
  loadingMessage.className = "Loading-message";
  loadingMessage.textContent = "Loading episodes, please wait...";

  rootElem.appendChild(loadingMessage);

  // LEVEL 400: Store the fetch promise immediately so this URL is only fetched once
  episodeCache[episodesUrl] = fetch(episodesUrl).then(function (response) {
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return response.json();
  });

  episodeCache[episodesUrl]
    .then(function (episodes) {
      displayEpisodes(episodes);
    })
    .catch(function (error) {
      showError(error);
    });
}

// LEVEL 400: Display the search and episode selector for the selected show
function displayEpisodes(allEpisodes) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = "";

  // LEVEL 500: Navigation back to shows
  const backLink = document.createElement("a");
  backLink.href = "#";
  backLink.textContent = " Back to all shows";

  rootElem.appendChild(backLink);

  const heading = document.createElement("h1");
  heading.textContent = "Episodes";

  rootElem.appendChild(heading);

  // Create the search and filter controls
  const controls = document.createElement("div");
  controls.id = "episode-controls";

  const searchLabel = document.createElement("label");
  searchLabel.htmlFor = "searchInput";
  searchLabel.textContent = "Search episodes:";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "searchInput";
  searchInput.placeholder = "Search episodes...";

  const episodeLabel = document.createElement("label");
  episodeLabel.htmlFor = "episodeSelector";
  episodeLabel.textContent = "Choose an episode:";

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episodeSelector";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Episodes";

  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach(function (episode) {
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    const option = document.createElement("option");

    option.value = episode.id;
    option.textContent =
      `S${season}E${number} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });

  const results = document.createElement("p");

  results.textContent =
    `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);
  controls.appendChild(episodeLabel);
  controls.appendChild(episodeSelect);
  controls.appendChild(results);

  rootElem.appendChild(controls);

  const episodeContainer = document.createElement("div");
  episodeContainer.id = "episodes-list";

  rootElem.appendChild(episodeContainer);

  makePageForEpisodes(allEpisodes);
  // LEVEL 400: Search episodes while typing
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        (episode.summary || "").toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);

    results.textContent =
      `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;

    episodeSelect.value = "";
  });

  

  // LEVEL 500: Return to shows
  backLink.addEventListener("click", function (event) {
    event.preventDefault();

    displayShows(allShows);
  });
}



// Show an error message that the user can see
function showError(error) {
  const rootElem = document.getElementById("root");

  rootElem.innerHTML = `
    <div class="error-container">
      <h3>Oops! Something went wrong.</h3>

      <p>
        We couldn't load the episodes right now.
        Please try refreshing the page.
      </p>

      <p class="error-details">
        Error details: ${error.message}
      </p>
    </div>
  `;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear previous episodes before displaying new ones
  rootElem.innerHTML = "";

  episodeList.forEach(function (episode) {
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    const episodeCode = `S${season}E${number}`;

    const card = document.createElement("article");
    const title = document.createElement("h2");
    const image = document.createElement("img");

    //  Some episodes may not have an image
    if (episode.image) {
      image.src = episode.image.medium;
    }

    image.alt = episode.name;

    const summary = document.createElement("div");
    summary.innerHTML = episode.summary || "";

    title.textContent = `${episode.name} - ${episodeCode}`;

    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVMaze";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);
    card.appendChild(link);

    rootElem.appendChild(card);
  });
}

window.onload = setup;
