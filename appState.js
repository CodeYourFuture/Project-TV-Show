const appState = {
    shows: [],
    episodes: [],
    episodesCache: new Map(),
    selectedShow: '',
    selectedEpisode: '',
    episodeSearchTerm: '',
    showSearchTerm: '',
    currentView: 'shows',
};

// --------------------------
// API / FETCH FUNCTIONS
// --------------------------

async function getShows() {
    const url = 'https://api.tvmaze.com/shows';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        appState.shows = await response.json();
        return true;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

async function getShowEpisodes(showId) {
    if (appState.episodesCache.has(appState.selectedShow)) {
        appState.episodes = appState.episodesCache.get(appState.selectedShow);
        return true;
    } else {
        const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            appState.episodes = await response.json();
            appState.episodesCache.set(
                appState.selectedShow,
                appState.episodes
            );
            return true;
        } catch (error) {
            console.error(error.message);
            return false;
        }
    }
}
