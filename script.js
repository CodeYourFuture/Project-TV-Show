// --------------------------
// DOM ELEMENTS
// --------------------------

// Store references to elements that already exist in the HTML
const episodeContainer = document.getElementById('episode-container');
const episodeSearchInput = document.getElementById('episode-search-input');
const searchCount = document.getElementById('episode-search-count');
const episodeSelect = document.getElementById('episode-select');
const statusMessage = document.getElementById('status-message');
const totalEpisodes = document.getElementById('total-episodes');

const showSelect = document.getElementById('show-select');
const showContainer = document.getElementById('show-container');
const showView = document.getElementById('show-view');
const episodeView = document.getElementById('episode-view');
const homeButton = document.getElementById('home-button');
const showSearchInput = document.getElementById('show-search-input');
const showCount = document.getElementById('show-search-count');

// --------------------------
// HELPER FUNCTIONS
// --------------------------
/*
 * Creates and adds options to a select dropdown.
 */
function populateDropdown(optionData, selectElement, getText) {
    optionData.forEach((optionDatum) => {
        const option = document.createElement('option');
        option.value = optionDatum.id;
        option.textContent = getText(optionDatum);
        selectElement.appendChild(option);
    });
}
/*
 * Returns an item's image URL.
 * Uses a placeholder image if no image is available.
 */
function getImageUrl(item) {
    return item.image?.medium ?? './images/placeholder.png';
}
function switchView(view) {
    // Update app state
    appState.currentView = view;
    if (view === 'shows') {
        showView.hidden = false;
        episodeView.hidden = true;
    } else if (view === 'episodes') {
        episodeView.hidden = false;
        showView.hidden = true;
    }
}
// --------------------------
// RENDER FUNCTIONS
// --------------------------

/*
 * Clears the container and renders a list of cards.
 */
function render(data, createCard, container) {
    container.textContent = '';
    data.forEach((datum) => {
        const card = createCard(datum);
        container.appendChild(card);
    });
}
/*
 * Creates an episode card using episode data.
 */
function createEpisodeCard(episode) {
    const episodeCard = document
        .getElementById('episode-template')
        .content.cloneNode(true);
    episodeCard.querySelector('.episode-title').textContent =
        `${episode.name} - S${episode.season.toString().padStart(2, '0')}E${episode.number.toString().padStart(2, '0')}`;
    episodeCard.querySelector('.episode-description').innerHTML =
        episode.summary ?? 'No summary available.';
    episodeCard.querySelector('.episode-image').src = getImageUrl(episode);
    episodeCard.querySelector('.episode-image').alt = episode.name;
    return episodeCard;
}

function createShowCard(show) {
    const showCard = document
        .getElementById('show-template')
        .content.cloneNode(true);
    const showTitle = showCard.querySelector('.show-title');
    const showImage = showCard.querySelector('.show-image');
    const showSummary = showCard.querySelector('.show-summary');
    const showRating = showCard.querySelector('.show-rating');
    const showGenres = showCard.querySelector('.show-genres');
    const showStatus = showCard.querySelector('.show-status');
    const showRuntime = showCard.querySelector('.show-runtime');
    const ratingLabel = document.createElement('strong');
    const genresLabel = document.createElement('strong');
    const statusLabel = document.createElement('strong');
    const runtimeLabel = document.createElement('strong');

    showTitle.textContent = show.name;
    showTitle.dataset.showId = show.id;
    showImage.src = getImageUrl(show);
    showImage.dataset.showId = show.id;
    showImage.alt = show.name;
    ratingLabel.textContent = 'Rated:';
    genresLabel.textContent = 'Genres:';
    statusLabel.textContent = 'Status:';
    runtimeLabel.textContent = 'Runtime:';

    showSummary.innerHTML = show.summary ?? 'No summary available.';
    showRating.appendChild(ratingLabel);
    showGenres.appendChild(genresLabel);
    showStatus.appendChild(statusLabel);
    showRuntime.appendChild(runtimeLabel);

    showRating.append(` ${show.rating?.average ?? 'Not rated'}`);
    showGenres.append(` ${show.genres.join(', ')}`);
    showStatus.append(` ${show.status}`);
    showRuntime.append(` ${show.runtime}`);
    return showCard;
}
// --------------------------
// LOADING FUNCTIONS
// --------------------------

/*
 * Handles loading states and error messages.
 * Can run functions that load shows or episodes.
 */
async function handleLoading(
    loadingFunction,
    loadingMessage,
    errorMessage,
    showId
) {
    statusMessage.textContent = loadingMessage;
    const success = await (!showId
        ? loadingFunction()
        : loadingFunction(showId));
    if (success) {
        statusMessage.textContent = '';
    } else {
        statusMessage.textContent = errorMessage;
    }
}
// --------------------------
// SHOW CLICK HANDLER
// --------------------------

/*
 * Gets the ID of the clicked show,
 * loads that show's episodes,
 * and renders the episodes.
 */
async function displayShowEpisodes(showId) {
    appState.selectedShow = showId;
    await handleLoading(
        getShowEpisodes,
        'Episodes loading...',
        'Unable to load episodes. Please try again later.',
        appState.selectedShow
    );
    switchView('episodes');
    window.scrollTo(0, 0);
    episodeSelect.textContent = '';
    populateDropdown(
        appState.episodes,
        episodeSelect,
        (episode) =>
            `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')} - ${episode.name}`
    );
    totalEpisodes.textContent = `Displaying: ${appState.episodes.length}/${appState.episodes.length}`;
    render(appState.episodes, createEpisodeCard, episodeContainer);
}

async function handleShowClick(event) {
    const showId = event.target.dataset.showId;
    await displayShowEpisodes(showId);
}
// --------------------------
// APP INITIALISATION
// --------------------------

/*
 * Loads all shows when the application starts,
 * sorts them, populates the show dropdown,
 * renders the show cards, and adds click listeners.
 */
async function setup() {
    await handleLoading(
        getShows,
        'Shows loading...',
        'Unable to load shows. Please try again later.'
    );
    appState.shows.sort((showA, showB) => {
        return showA.name.toLowerCase().localeCompare(showB.name.toLowerCase());
    });
    populateDropdown(appState.shows, showSelect, (show) => show.name);
    showCount.textContent = `Displaying: ${appState.shows.length} show(s)`;
    switchView('shows');
    render(appState.shows, createShowCard, showContainer);
    handleDisplayShowEpisodes();
}

// --------------------------
// EVENT LISTENERS
// --------------------------

/*
 * Loads episodes when a show is selected
 * from the show dropdown.
 */
function handleDisplayShowEpisodes() {
    const showTitles = document.querySelectorAll('.show-title');

    showTitles.forEach((showTitle) => {
        showTitle.addEventListener('click', handleShowClick);
    });

    const showImages = document.querySelectorAll('.show-image');

    showImages.forEach((showImage) => {
        showImage.addEventListener('click', handleShowClick);
    });
}
showSelect.addEventListener('change', async () => {
    appState.selectedShow = showSelect.value;
    await displayShowEpisodes(appState.selectedShow);
});
/*
 * Displays the selected episode.
 */
episodeSelect.addEventListener('change', () => {
    searchCount.textContent = '';
    appState.selectedEpisode = episodeSelect.value;
    const foundEpisode = appState.episodes.find((episode) => {
        return episode.id === Number(appState.selectedEpisode);
    });
    if (foundEpisode) {
        totalEpisodes.textContent = `Displaying: 1/${appState.episodes.length}`;
        render([foundEpisode], createEpisodeCard, episodeContainer);
    } else if (appState.selectedEpisode === '') {
        totalEpisodes.textContent = `Displaying: ${appState.episodes.length}/${appState.episodes.length}`;
        render(appState.episodes, createEpisodeCard, episodeContainer);
    }
});
/*
 * Filters and displays episodes based on the search input.
 */
episodeSearchInput.addEventListener('input', () => {
    totalEpisodes.textContent = '';
    appState.episodeSearchTerm = episodeSearchInput.value.toLowerCase();
    const filteredEpisodes = appState.episodes.filter(
        (episode) =>
            episode.name.toLowerCase().includes(appState.episodeSearchTerm) ||
            (episode.summary || '')
                .toLowerCase()
                .includes(appState.episodeSearchTerm)
    );
    if (appState.episodeSearchTerm) {
        searchCount.textContent = `Displaying: ${filteredEpisodes.length}/${appState.episodes.length}`;
    } else {
        searchCount.textContent = '';
    }
    render(filteredEpisodes, createEpisodeCard, episodeContainer);
});

showSearchInput.addEventListener('input', () => {
    showCount.textContent = '';

    appState.showSearchTerm = showSearchInput.value.toLowerCase();

    const filteredShows = appState.shows.filter(
        (show) =>
            show.name.toLowerCase().includes(appState.showSearchTerm) ||
            show.genres
                .join(', ')
                .toLowerCase()
                .includes(appState.showSearchTerm) ||
            show.summary.toLowerCase().includes(appState.showSearchTerm)
    );

    if (appState.showSearchTerm) {
        showCount.textContent = `Displaying: ${filteredShows.length}/${appState.shows.length} show(s)`;
    } else {
        showCount.textContent = '';
    }

    render(filteredShows, createShowCard, showContainer);
    handleDisplayShowEpisodes();
});

homeButton.addEventListener('click', () => {
    switchView('shows');
});

// --------------------------
// START APPLICATION
// --------------------------

/*
 * Runs setup when the page has finished loading.
 */

window.onload = setup;
