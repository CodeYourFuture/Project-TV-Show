const cache = {};
let allShows = [];
let allEpisodes = [];

async function fetchWithCache(url) {
  if (!cache[url]) {
    cache[url] = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
      }
      return response.json();
    });
  }
  return cache[url];
}

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const status = document.createElement("p");
  status.id = "status";
  status.textContent = "Loading shows, please wait...";
  rootElem.appendChild(status);

  rootElem.appendChild(createShowsView());
  const episodesView = createEpisodesView();
  episodesView.hidden = true;
  rootElem.appendChild(episodesView);

  const footer = document.createElement("footer");
  footer.innerHTML =
    'Data originally provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>';
  rootElem.appendChild(footer);

  try {
    const shows = await fetchWithCache("https://api.tvmaze.com/shows");
    allShows = shows
      .slice()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    status.textContent = "";
    renderShows(allShows);
  } catch (error) {
    status.textContent = "Something went wrong loading shows. Please try refreshing the page.";
    console.error(error);
  }
}

function createShowsView() {
  const view = document.createElement("section");
  view.id = "shows-view";

  const heading = document.createElement("h1");
  heading.textContent = "TV Shows";
  view.appendChild(heading);

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.id = "show-search";
  searchInput.placeholder = "Search shows by name, genre, or summary...";
  searchInput.addEventListener("input", handleShowSearch);
  view.appendChild(searchInput);

  const container = document.createElement("div");
  container.id = "shows-container";
  view.appendChild(container);
  return view;
}

function createEpisodesView() {
  const view = document.createElement("section");
  view.id = "episodes-view";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.id = "back-to-shows";
  backButton.textContent = "Back to shows";
  backButton.addEventListener("click", showShowsView);
  view.appendChild(backButton);
  view.appendChild(createControls());
  view.appendChild(createEpisodesContainer());
  return view;
}

function handleShowSearch(event) {
  const term = event.target.value.trim().toLowerCase();
  const filtered = allShows.filter((show) => {
    const searchableText = [
      show.name,
      ...(show.genres || []),
      stripHtml(show.summary || ""),
    ]
      .join(" ")
      .toLowerCase();
    return searchableText.includes(term);
  });
  renderShows(filtered);
}

function renderShows(showList) {
  const container = document.getElementById("shows-container");
  container.innerHTML = "";
  showList.forEach((show) => container.appendChild(createShowCard(show)));
}

function createShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";

  const title = document.createElement("h2");
  const titleButton = document.createElement("button");
  titleButton.type = "button";
  titleButton.textContent = show.name;
  titleButton.addEventListener("click", () => handleShowClick(show));
  title.appendChild(titleButton);
  card.appendChild(title);

  if (show.image && show.image.medium) {
    const image = document.createElement("img");
    image.src = show.image.medium;
    image.alt = `${show.name} poster`;
    card.appendChild(image);
  }

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "No summary available.";
  card.appendChild(summary);

  const details = document.createElement("p");
  details.className = "show-details";
  details.textContent = `Genres: ${(show.genres || []).join(", ") || "None"} | Status: ${show.status || "Unknown"} | Rating: ${show.rating && show.rating.average ? show.rating.average : "N/A"} | Runtime: ${show.runtime || "N/A"} minutes`;
  card.appendChild(details);
  return card;
}

async function handleShowClick(show) {
  const status = document.getElementById("status");
  status.textContent = "Loading episodes, please wait...";
  try {
    await loadEpisodesForShow(show.id);
    document.getElementById("shows-view").hidden = true;
    document.getElementById("episodes-view").hidden = false;
    status.textContent = "";
  } catch (error) {
    status.textContent = "Something went wrong loading episodes. Please try again.";
    console.error(error);
  }
}

function showShowsView() {
  document.getElementById("episodes-view").hidden = true;
  document.getElementById("shows-view").hidden = false;
}

async function loadEpisodesForShow(showId) {
  allEpisodes = await fetchWithCache(`https://api.tvmaze.com/shows/${showId}/episodes`);
  document.getElementById("search-input").value = "";
  renderEpisodes(allEpisodes);
  populateSelector(allEpisodes);
}

function createControls() {
  const controls = document.createElement("div");
  controls.id = "controls";

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search episodes by name or summary...";
  searchInput.addEventListener("input", handleSearch);

  const matchCount = document.createElement("p");
  matchCount.id = "match-count";

  const selector = document.createElement("select");
  selector.id = "episode-selector";
  selector.addEventListener("change", handleSelect);

  controls.appendChild(searchInput);
  controls.appendChild(matchCount);
  controls.appendChild(selector);
  return controls;
}

function createEpisodesContainer() {
  const container = document.createElement("div");
  container.id = "episodes-container";
  return container;
}

function handleSearch(event) {
  const term = event.target.value.trim().toLowerCase();
  const filtered = allEpisodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    return name.includes(term) || summary.includes(term);
  });
  renderEpisodes(term === "" ? allEpisodes : filtered);
}

function handleSelect(event) {
  const id = event.target.value;
  if (!id) return;
  const target = document.getElementById(`episode-${id}`);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderEpisodes(episodeList) {
  const container = document.getElementById("episodes-container");
  container.innerHTML = "";
  document.getElementById("match-count").textContent = `${episodeList.length} episode(s) found`;
  episodeList.forEach((episode) => container.appendChild(createEpisodeCard(episode)));
}

function populateSelector(episodeList) {
  const selector = document.getElementById("episode-selector");
  selector.innerHTML = '<option value="">Jump to episode...</option>';
  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    selector.appendChild(option);
  });
}

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;

  const title = document.createElement("h2");
  title.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`;
  card.appendChild(title);

  if (episode.image && episode.image.medium) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = episode.name;
    card.appendChild(image);
  }

  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "";
  card.appendChild(summary);
  return card;
}

function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

function stripHtml(html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || "";
}

window.onload = setup;
