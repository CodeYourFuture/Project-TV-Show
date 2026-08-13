// You can edit ALL of the code here

// LEVEL 400: Store the TV shows URL
const showsUrl = "https://api.tvmaze.com/shows";

// LEVEL 400: Cache episode requests so the same URL is never fetched twice
const episodeCache = {};

// LEVEL 500: Store all TV shows after the first fetch
let allShows = [];

function setup() {
  const rootElem = document.getElementById("root");

  // Show a loading message as we are now loading data async.
  rootElem.innerHTML =
    "<p class='Loading-message'>Loading episodes, please wait...</p>";

  // LEVEL 400: Fetch all TV shows from TVMaze
  fetch(showsUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return response.json();
    })
    .then(function (shows) {
      // LEVEL 400: Sort TV shows alphabetically, ignoring capital letters
      shows.sort(function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });

     
     
      // LEVEL 400: Fetch episodes when the user selects another show
      showSelector.addEventListener("change", function () {
        const showId = showSelector.value;

        fetchEpisodes(showId);
      });
    })
    .catch(function (error) {
      //  Show an error if the TV shows cannot be loaded
      showError(error);
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

  // LEVEL 400: Remove the previous show's controls
  removeEpisodeControls();

  // Show a loading message while episodes are loading
  rootElem.innerHTML =
    "<p class='Loading-message'>Loading episodes, please wait...</p>";

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

  removeEpisodeControls();

  // Clear the loading message before rendering the application layout
  rootElem.innerHTML = "";

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
    option.textContent = `S${season}E${number} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });

  const results = document.createElement("p");
  results.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;

  controls.appendChild(searchLabel);
  controls.appendChild(searchInput);
  controls.appendChild(episodeLabel);
  controls.appendChild(episodeSelect);
  controls.appendChild(results);

  document.body.insertBefore(controls, rootElem);

  makePageForEpisodes(allEpisodes);

  // Filter episodes while typing
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        (episode.summary || "").toLowerCase().includes(searchTerm)
      );
    });

    makePageForEpisodes(filteredEpisodes);

    results.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;

    episodeSelect.value = "";
  });

  // Show the selected episode
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
}

// LEVEL 400: Remove the previous episode controls when changing shows
function removeEpisodeControls() {
  const oldControls = document.getElementById("episode-controls");

  if (oldControls) {
    oldControls.remove();
  }
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
