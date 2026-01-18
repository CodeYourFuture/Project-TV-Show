function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

// Function to render all episodes on the page
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ''; // Clear any existing content

  const episodeCount = document.createElement('p');
  episodeCount.textContent = `Got ${episodeList.length} episode(s)`;
  rootElem.appendChild(episodeCount);

  // Create a container for episodes
  const episodeContainer = document.createElement('div');
  episodeContainer.id = 'episode-container';
  rootElem.appendChild(episodeContainer);

  episodeList.forEach((episode) => {
    const episodeCard = document.createElement('div');
    episodeCard.className = 'episode-card';

    // Episode Title with Episode Code
    const episodeTitle = document.createElement('h3');
    episodeTitle.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;

    // Episode Image
    const episodeImage = document.createElement('img');
    episodeImage.src = episode.image?.medium || 'placeholder.jpg';
    episodeImage.alt = episode.name;

    // Episode Summary
    const episodeSummary = document.createElement('p');
    episodeSummary.innerHTML = episode.summary || 'No summary available.';

    // Link to TVMaze episode page
    const episodeLink = document.createElement('a');
    episodeLink.href = episode.url;
    episodeLink.target = '_blank';
    episodeLink.textContent = 'View on TVMaze';

    // Append elements to the episode card
    episodeCard.appendChild(episodeTitle);
    episodeCard.appendChild(episodeImage);
    episodeCard.appendChild(episodeSummary);
    episodeCard.appendChild(episodeLink);

    // Add episode card to container
    episodeContainer.appendChild(episodeCard);
  });
}

// Format the episode code (e.g., S02E07)
function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, '0')}E${String(number).padStart(2, '0')}`;
}

// Run the setup when the page loads
window.onload = setup;
