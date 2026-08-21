// You can edit ALL of the code here

const API_URL = "https://api.tvmaze.com/shows/82/episodes";

function setup() {
  const rootElem = document.getElementById("root");

  // Show loading message while waiting for data
  rootElem.innerHTML = "<h2>Loading episodes, please wait...</h2>";

  // Fetch the episodes ONCE
  fetch(API_URL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      return response.json();
    })
    .then(function (allEpisodes) {
      makePageForEpisodes(allEpisodes);
    })
    .catch(function (error) {
      // Show error message to the user
      rootElem.innerHTML =
        "<h2>Sorry, we could not load the episodes.</h2>" +
        "<p>Please try again later.</p>";

      console.error(error);
    });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear previous content
  rootElem.innerHTML = "";

  // 1. Show total number of episodes
  const header = document.createElement("h2");
  header.textContent = `Got ${episodeList.length} episode(s)`;
  rootElem.appendChild(header);

  // 2. Loop through each episode
  episodeList.forEach(function (episode) {
    const container = document.createElement("div");

    // Episode title
    const title = document.createElement("h3");
    title.textContent = episode.name;
    container.appendChild(title);

    // Episode code: S02E07
    const episodeCode = document.createElement("p");

    const season = String(episode.season).padStart(2, "0");
    const number = String(episode.number).padStart(2, "0");

    episodeCode.textContent = `S${season}E${number}`;

    container.appendChild(episodeCode);

    // 3. Show medium-size image
    const image = document.createElement("img");

    if (episode.image && episode.image.medium) {
      image.src = episode.image.medium;
      image.alt = episode.name;
    }

    container.appendChild(image);

    // Episode summary
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary || "No summary available.";

    container.appendChild(summary);

    // Add episode to page
    rootElem.appendChild(container);
  });

  // 4. Link to TVMaze
  const source = document.createElement("p");

  const link = document.createElement("a");
  link.href = "https://www.tvmaze.com/";
  link.textContent = "Data provided by TVMaze";
  link.target = "_blank";

  source.appendChild(link);
  rootElem.appendChild(source);
}

window.onload = setup;
