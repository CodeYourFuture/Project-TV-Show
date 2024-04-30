const rootElement = document.getElementById('root');
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
let episode = [];
let dataFetched = false;

// Fetch data from TVMaze API
async function fetchData() {
  if (!dataFetched) {
    try{
  const response = await fetch('https://api.tvmaze.com/shows/82/episodes');
  const data = await response.json();
  
  episode = data;
  dataFetched = true;
  
  } catch (error) {
    throw new Error('Failed to fetch data from TXMaze API');
  }
  return data;
}
}



// Render episode cards
function renderEpisodes(episodes) {
  rootElement.innerHTML = '';
  episodes.forEach(episode => {
    const episodeCard = document.createElement('div');
    episodeCard.classList.add('episode-card');

    const episodeCode = `S${episode.season.toString().padStart(2, '0')}E${episode.number.toString().padStart(2, '0')}`;
    
    episodeCard.innerHTML = `
      <h3>${episode.name}</h3>
      <p>Episode Code: ${episodeCode}</p>
      <p>${episode.summary}</p>
      <img class="episode-image" src="${episode.image.medium}" alt="${episode.name}">
      <p>Season: ${episode.season} | Episode: ${episode.number}</p>
      <p><a href="${episode.url}" target="_blank">View on TVMaze</a></p>
    `;

    rootElement.appendChild(episodeCard);
  });
}

// Perform search and update episode display
function performSearch(searchTerm) {
  const filteredEpisodes = episodes.filter(episode =>
    episode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    episode.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderEpisodes(filteredEpisodes);
  searchCount.textContent = `Displaying ${filteredEpisodes.length} / ${episodes.length} episodes`;
}

let episodes = [];

// Initialize
async function initialize() {
try {
  rootElement.innerHTML = '<p>Loading...</p>';

  await fetchData();
  renderEpisodes(episodes);

  searchInput.addEventListener('input', function () {
    performSearch(this.value);
  });
}catch (error){
  //show error message
  rootElement.innerHTML = `<p>${error.message}</p>`;
}
}

initialize();
