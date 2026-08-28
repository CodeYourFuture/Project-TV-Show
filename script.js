// --------------------------
// DOM ELEMENTS
// --------------------------

const showsView = document.getElementById("shows-view");
const showsContainer = document.getElementById("shows-container");
const showSearch = document.getElementById("show-search");
const showSelector = document.getElementById("show-selector");
const showStatus = document.getElementById("show-status");


const episodesView = document.getElementById("episodes-view");
const backToShows = document.getElementById("back-to-shows");

const episodesContainer = document.getElementById("episodes-container");
const searchInput = document.getElementById("episode-search");
const episodeCount = document.getElementById("episode-count");
const episodeSelector = document.getElementById("episode-selector");
const searchContainer = document.getElementById("search-container");
const statusMessage = document.getElementById("status-message");

let allEpisodes = [];
let allShows = [];

const episodesCache = new Map();

searchContainer.hidden = true;


// --------------------------
// SHOW RENDERING
// --------------------------

function renderShows(showList) {
    showsContainer.textContent = "";

    showList.forEach(function (show) {
        const showCard = document.createElement("article");

        const showTitle = document.createElement("h2");
        showTitle.textContent = show.name;

        const showImage = document.createElement("img");

        if (show.image) {
            showImage.src = show.image.medium;
        }

        showImage.alt = show.name;

        const showSummary = document.createElement("div");
        showSummary.innerHTML = show.summary || "No summary available.";

        const showGenres = document.createElement("p");
        showGenres.textContent =
            `Genres: ${show.genres.length > 0 ? show.genres.join(", ") : "N/A"}`;

        const showStatusText = document.createElement("p");
        showStatusText.textContent = `Status: ${show.status}`;

        const showRating = document.createElement("p");
        showRating.textContent =
            `Rating: ${show.rating.average ?? "N/A"}`;

        const showRuntime = document.createElement("p");
        showRuntime.textContent =
            `Runtime: ${show.runtime ?? "N/A"} minutes`;

        showCard.appendChild(showTitle);
        showCard.appendChild(showImage);
        showCard.appendChild(showSummary);
        showCard.appendChild(showGenres);
        showCard.appendChild(showStatusText);
        showCard.appendChild(showRating);
        showCard.appendChild(showRuntime);

        showCard.addEventListener("click", function () {
            showEpisodes(show);
        });

        showsContainer.appendChild(showCard);
    });
}


// --------------------------
// EPISODE RENDERING
// --------------------------

function render(episodeList) {
    episodesContainer.textContent = "";

    episodeList.forEach(function (episode) {
        const episodeContainer = document.createElement("article");

        episodeContainer.id = `episode-${episode.id}`;

        const episodeTitle = document.createElement("h2");

        const episodeCode =
            `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

        episodeTitle.textContent =
            `${episode.name} - ${episodeCode}`;

        const episodeDetails = document.createElement("p");

        episodeDetails.textContent =
            `Season: ${episode.season} | Episode: ${episode.number}`;

        const episodeImage = document.createElement("img");

        if (episode.image) {
            episodeImage.src = episode.image.medium;
        }

        episodeImage.alt = episode.name;

        const episodeSummary = document.createElement("div");

        episodeSummary.innerHTML =
            episode.summary || "No summary available.";

        const episodeLink = document.createElement("a");

        episodeLink.href = episode.url;
        episodeLink.textContent = "View on TVMaze";

        episodeContainer.appendChild(episodeTitle);
        episodeContainer.appendChild(episodeDetails);
        episodeContainer.appendChild(episodeImage);
        episodeContainer.appendChild(episodeSummary);
        episodeContainer.appendChild(episodeLink);

        episodesContainer.appendChild(episodeContainer);
    });
}


// --------------------------
// EPISODE SELECTOR
// --------------------------

function updateEpisodeSelector(episodes) {

    episodeSelector.innerHTML =
        '<option value="" disabled selected>Select an episode</option>';

    episodes.forEach(function (episode) {

        const option = document.createElement("option");

        option.value = episode.id;

        const episodeCode =
            `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

        option.textContent =
            `${episodeCode} - ${episode.name}`;

        episodeSelector.appendChild(option);
    });
}


// --------------------------
// API / FETCH FUNCTIONS
// --------------------------

async function getShows() {
    const url = "https://api.tvmaze.com/shows";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        allShows = await response.json();

        return true;

    } catch (error) {
        console.error(error.message);

        return false;
    }
}


async function getShowEpisodes(showId) {
    const url =
        `https://api.tvmaze.com/shows/${showId}/episodes`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        allEpisodes = await response.json();

        return true;

    } catch (error) {
        console.error(error.message);

        return false;
    }
}


// --------------------------
// SHOW → EPISODES
// --------------------------

async function showEpisodes(show) {

    showsView.hidden = true;
    episodesView.hidden = false;

    statusMessage.textContent = "Episodes loading...";

    if (episodesCache.has(show.id)) {

        allEpisodes = episodesCache.get(show.id);

    } else {

        const success = await getShowEpisodes(show.id);

        if (!success) {
            statusMessage.textContent =
                "Unable to load episodes, try again later";

            return;
        }

        episodesCache.set(show.id, allEpisodes);
    }

    statusMessage.textContent = "";

    searchInput.value = "";

    updateEpisodeSelector(allEpisodes);

    searchContainer.hidden = false;

    episodeCount.textContent =
        `Displaying: ${allEpisodes.length}/${allEpisodes.length}`;

    render(allEpisodes);
}


// --------------------------
// SHOW SEARCH
// --------------------------

showSearch.addEventListener("input", function () {

    const searchTerm =
        showSearch.value.toLowerCase();

    const filteredShows = allShows.filter(function (show) {

        return (
            show.name.toLowerCase().includes(searchTerm) ||
            show.genres.join(" ").toLowerCase().includes(searchTerm) ||
            (show.summary || "").toLowerCase().includes(searchTerm)
        );
    });

    renderShows(filteredShows);
});

// --------------------------
// SHOW SELECTOR
// --------------------------

showSelector.addEventListener("change", function () {

    const selectedShowId = Number(showSelector.value);

    const selectedShow = allShows.find(function (show) {
        return show.id === selectedShowId;
    });

    if (selectedShow) {
        showEpisodes(selectedShow);
    }
});


// --------------------------
// EPISODE SEARCH
// --------------------------

let searchTerm = "";

searchInput.addEventListener("input", function () {

    searchTerm =
        searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter(function (episode) {

        return (
            episode.name.toLowerCase().includes(searchTerm) ||
            (episode.summary || "").toLowerCase().includes(searchTerm)
        );
    });

    episodeCount.textContent =
        `Displaying: ${filteredEpisodes.length}/${allEpisodes.length}`;

    updateEpisodeSelector(filteredEpisodes);

    render(filteredEpisodes);
});


// --------------------------
// EPISODE SELECTOR
// --------------------------

episodeSelector.addEventListener("change", function () {

    const selectedEpisode =
        episodeSelector.value;

    const episodeElement =
        document.getElementById(`episode-${selectedEpisode}`);

    if (episodeElement) {

        episodeElement.scrollIntoView({
            behavior: "smooth"
        });
    }
});


// --------------------------
// BACK TO SHOWS
// --------------------------

backToShows.addEventListener("click", function () {

    episodesView.hidden = true;
    showsView.hidden = false;

    searchInput.value = "";
    episodeCount.textContent = "";

    episodeSelector.innerHTML =
        '<option value="" disabled selected>Select an episode</option>';

    episodesContainer.textContent = "";

    searchContainer.hidden = true;
});


// --------------------------
// INITIALISE APP
// --------------------------

async function setup() {

    showStatus.textContent = "Shows loading...";

    const success = await getShows();

    if (!success) {

        showStatus.textContent =
            "Unable to load shows, try again later";

        return;
    }

    showStatus.textContent = "";

    allShows.sort(function (showA, showB) {

        return showA.name
            .toLowerCase()
            .localeCompare(showB.name.toLowerCase());
    });

    allShows.forEach(function (show) {
    const option = document.createElement("option");

    option.value = show.id;
    option.textContent = show.name;

    showSelector.appendChild(option);
});


    renderShows(allShows);
}

setup();