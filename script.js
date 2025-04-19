//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
// rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  
  const episodesContainer = document.createElement('div');
  episodesContainer.id = 'episodes-container';
  rootElem.appendChild(episodesContainer);

  function pad(num) {
    return num.toString().padStart(2, '0');
  }

  episodeList.forEach(episode => {
    const card = document.createElement('div');
    card.id = 'episode-card';

    const episodeCode = `S${pad(episode.season)}E${pad(episode.number)}`;
    
    const name = document.createElement('h2');
    name.textContent = episode.name;

    const img = document.createElement('img');
    img.src = episode.image?.medium || '';
    img.alt = episode.name;

    const season = document.createElement('p');
    season.id = 'episode-code';
    season.textContent = episodeCode;

    const summary = document.createElement('div');
    summary.id = 'episode-summary';
    summary.innerHTML = episode.summary || '';

    const link = document.createElement('a');
    link.href = episode.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View on TVMaze';

    card.appendChild(name);
    card.appendChild(season);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(link);

    episodesContainer.appendChild(card);
    
  });


  const credit = document.createElement('p');
  credit.innerHTML = `Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>`;
  rootElem.appendChild(credit);

}

window.onload = setup;
