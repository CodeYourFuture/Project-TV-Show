function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

let allShowsCache = null;
const episodeCache = {};

async function getAllShows() {
  if (!allShowsCache) {
    allShowsCache = fetch("https://api.tvmaze.com/shows").then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load shows");
      }
      return response.json();
    });
  }
  return allShowsCache;
}

function getEpisodesForShow(showId) {
  if (!episodeCache[showId]) {
    episodeCache[showId] = fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`,
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load episodes for show ID ${showId}`);
      }
      return response.json();
    });
  }
  return episodeCache[showId];
}
async function setup() {
  const showsRoot = document.getElementById("shows-root");
  const showsControls = document.getElementById("shows-controls");
  const showSearchInput = document.getElementById("show-search-input");
  const showSearchCount = document.getElementById("show-search-count");
  const showSelect = document.getElementById("show-select");
  const episodesRoot = document.getElementById("root");
  const episodesControls = document.getElementById("episodes-controls");
  const backToShows = document.getElementById("back-to-shows");
  const episodeDropdown = document.getElementById("episode-select");
  const searchInput = document.getElementById("search-input");
  const searchCount = document.getElementById("search-count");
  const showsTemplate = document.getElementById("shows-template");
  const episodesTemplate = document.getElementById("episodes-template");
  let currentEpisodes = [];
  let currentShowName = "";
  try {
    const allShows = await getAllShows();
    allShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      }),
    );
    makePageForShows(allShows);
    updateShowCount(allShows.length);
    fillShowDropdown(allShows);
    function updateShowCount(numberOfShows) {
      showSearchCount.textContent = `Displaying ${numberOfShows}/${allShows.length} shows`;
    }
    showSearchInput.addEventListener("input", (event) => {
      const searchTerm = event.target.value.toLowerCase().trim();
      const filteredShows = allShows.filter((show) => {
        const nameMatch = show.name.toLowerCase().includes(searchTerm);
        const genresMatch = show.genres
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);

        const summaryMatch = show.summary
          ? show.summary
              .replace(/<[^>]*>/g, "")
              .toLowerCase()
              .includes(searchTerm)
          : false;
        return nameMatch || genresMatch || summaryMatch;
      });
      makePageForShows(filteredShows);
      updateShowCount(filteredShows.length);
      fillShowDropdown(filteredShows);
    });
    showSelect.addEventListener("change", (event) => {
      const selectedShowId = event.target.value;

      if (selectedShowId === "") {
        return;
      }

      loadShow(selectedShowId);
    });
    async function loadShow(showId) {
      try {
        const selectedShow = allShows.find(
          (show) => show.id === Number(showId),
        );
        if (!selectedShow) {
          return;
        }
        currentShowName = selectedShow.name;
        currentEpisodes = await getEpisodesForShow(showId);
        searchInput.value = "";
        fillEpisodeDropdown(currentEpisodes);
        showsRoot.hidden = true;
        showsControls.hidden = true;
        episodesRoot.hidden = false;
        episodesControls.hidden = false;
        makePageForEpisodes(currentEpisodes, currentShowName);
        updateCount(currentEpisodes.length);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error);
        searchCount.textContent = "Error loading episodes.";
      }
    }
    function fillShowDropdown(shows) {
      showSelect.innerHTML = "";

      const defaultOption = document.createElement("option");

      defaultOption.value = "";
      defaultOption.textContent = "Select a show";

      showSelect.appendChild(defaultOption);

      shows.forEach((show) => {
        const option = document.createElement("option");

        option.value = show.id;
        option.textContent = show.name;

        showSelect.appendChild(option);
      });
    }
    function fillEpisodeDropdown(episodes) {
      episodeDropdown.innerHTML = `<option value="ALL">All Episodes</option>`;

      episodes.forEach((episode) => {
        const option = document.createElement("option");
        option.value = episode.id;
        option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
        episodeDropdown.appendChild(option);
      });
    }
    function updateCount(numberOfEpisodes) {
      searchCount.textContent = `Displaying ${numberOfEpisodes}/${currentEpisodes.length} episodes`;
    }
    searchInput.addEventListener("input", (event) => {
      const searchTerm = event.target.value.toLowerCase().trim();
      episodeDropdown.value = "ALL";
      const filteredEpisodes = currentEpisodes.filter((episode) => {
        const nameMatch = episode.name.toLowerCase().includes(searchTerm);
        const summaryMatch = episode.summary
          ? episode.summary
              .replace(/<[^>]*>/g, "")
              .toLowerCase()
              .includes(searchTerm)
          : false;
        return nameMatch || summaryMatch;
      });
      makePageForEpisodes(filteredEpisodes, currentShowName);
      updateCount(filteredEpisodes.length);
    });
    episodeDropdown.addEventListener("change", (event) => {
      const selectedId = event.target.value;
      searchInput.value = "";
      if (selectedId === "ALL") {
        makePageForEpisodes(currentEpisodes, currentShowName);
        updateCount(currentEpisodes.length);
        return;
      }
      const selectedEpisode = currentEpisodes.find(
        (episode) => episode.id === Number(selectedId),
      );
      if (selectedEpisode) {
        makePageForEpisodes([selectedEpisode], currentShowName);
        updateCount(1);
      }
    });
    backToShows.addEventListener("click", () => {
      episodesRoot.hidden = true;
      episodesControls.hidden = true;
      showsRoot.hidden = false;
      showsControls.hidden = false;
      searchInput.value = "";
      episodeDropdown.value = "ALL";
      showSelect.value = "";
    });
    function makePageForShows(showList) {
      showsRoot.innerHTML = "";
      const container = document.createElement("div");
      container.className = "shows-container";
      showList.forEach((show) => {
        const card = showsTemplate.content.cloneNode(true);
        const button = card.querySelector(".show-button");
        const title = card.querySelector(".show-title");
        const image = card.querySelector(".show-image");
        const summary = card.querySelector(".show-summary");
        const genres = card.querySelector(".show-genres");
        const status = card.querySelector(".show-status");
        const rating = card.querySelector(".show-rating");
        const runtime = card.querySelector(".show-runtime");
        title.textContent = show.name;
        image.src = show.image?.medium || "";
        image.alt = show.name;
        summary.innerHTML = show.summary || "No summary available.";
        genres.textContent = `Genres: ${show.genres.join(", ")}`;
        status.textContent = `Status: ${show.status}`;
        rating.textContent = `Rating: ${show.rating?.average || "N/A"}`;
        runtime.textContent = `Runtime: ${show.runtime || "N/A"} minutes`;
        button.addEventListener("click", () => {
          loadShow(show.id);
        });
        container.appendChild(card);
      });
      showsRoot.appendChild(container);
    }
    function makePageForEpisodes(episodeList, showName) {
      episodesRoot.innerHTML = "";
      const heading = document.createElement("h1");
      heading.textContent = `${showName} Episodes`;
      episodesRoot.appendChild(heading);
      const container = document.createElement("div");
      container.className = "episodes-container";
      episodeList.forEach((episode) => {
        const card = episodesTemplate.content.cloneNode(true);
        const title = card.querySelector(".episode-title");
        const image = card.querySelector(".episode-image");
        const summary = card.querySelector(".episode-summary");
        const link = card.querySelector(".episode-link");
        title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;
        image.src = episode.image?.medium || "";
        image.alt = episode.name;
        summary.innerHTML = episode.summary || "";
        if (episode.url) {
          link.addEventListener("click", () => {
            window.open(episode.url, "_blank");
          });
        } else {
          link.style.display = "none";
        }
        container.appendChild(card);
      });
      episodesRoot.appendChild(container);
    }
  } catch (error) {
    showSearchCount.textContent = "Failed to load TV shows.";
    console.error(error);
  }
}

window.onload = setup;
