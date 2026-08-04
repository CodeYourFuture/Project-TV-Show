//You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear the page

  episodeList.forEach((episode) => {
    // Create a card
    const card = document.createElement("div");
    card.className = "episode-card";

    // Episode title
    const title = document.createElement("h3");
    title.textContent = episode.name;

    // Episode code (S01E01)
    const code = document.createElement("span");
    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");
    code.textContent = `S${season}E${number}`;

    // Image
    const img = document.createElement("img");
    img.src = episode.image.medium;
    img.alt = episode.name;

    // Summary
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    // Add everything to the card
    card.appendChild(title);
    card.appendChild(code);
    card.appendChild(img);
    card.appendChild(summary);

    // Add card to the page
    rootElem.appendChild(card);
  });

  // Add TVMaze credit
  const credit = document.createElement("p");
  credit.innerHTML = `Data originally from <a href="https://tvmaze.com/">TVMaze.com</a>`;
  rootElem.appendChild(credit);
}

//test pull request**

window.onload = setup;
