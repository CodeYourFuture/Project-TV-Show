// The TVMaze API provides the data for this project.

let allShows = [];
let allEpisodes = [];
const savedRequests = {};

async function setup() {
  showMessage("Loading shows...");
  try {
    allShows = await getData("https://api.tvmaze.com/shows");
    allShows.sort(function (firstShow, secondShow) {
      return firstShow.name.localeCompare(secondShow.name, undefined, { sensitivity: "base" });
    });
    makeShowListPage();
  } catch (error) {
    showMessage("Sorry, the shows could not load. Please refresh the page.", true);
    console.error(error);
  }
}

// Store each request so one URL is never fetched twice during a visit.
async function getData(url) {
  if (!savedRequests[url]) {
    savedRequests[url] = fetch(url).then(function (response) {
      if (!response.ok) throw new Error("Could not load data");
      return response.json();
    });
  }
  return savedRequests[url];
}

function getRoot() {
  return document.getElementById("root");
}

function showMessage(message, isError) {
  const root = getRoot();
  root.textContent = "";
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  if (isError) messageElement.setAttribute("role", "alert");
  root.appendChild(messageElement);
}

// Level 500 home page: show every TV show and a search box.
function makeShowListPage() {
  const root = getRoot();
  root.textContent = "";

  const heading = document.createElement("h2");
  heading.textContent = "Browse TV shows";
  root.appendChild(heading);

  const controls = document.createElement("section");
  controls.className = "show-controls";
  controls.setAttribute("aria-label", "Show controls");
  addLabel(controls, "show-selector", "Choose a TV show");
  controls.appendChild(makeShowSelector());
  addLabel(controls, "show-search", "Search shows");

  const searchInput = document.createElement("input");
  searchInput.id = "show-search";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name, genre or summary";
  searchInput.addEventListener("input", searchShows);
  controls.appendChild(searchInput);
  root.appendChild(controls);

  const count = document.createElement("p");
  count.id = "show-count";
  count.setAttribute("aria-live", "polite");
  root.appendChild(count);

  const list = document.createElement("section");
  list.id = "show-list";
  list.className = "show-list";
  list.setAttribute("aria-label", "TV shows");
  root.appendChild(list);
  displayShows(allShows);
}

function addLabel(parent, inputId, text) {
  const label = document.createElement("label");
  label.htmlFor = inputId;
  label.textContent = text;
  parent.appendChild(label);
}

function makeShowSelector(selectedShowId) {
  const selector = document.createElement("select");
  selector.id = "show-selector";
  selector.addEventListener("change", function (event) {
    if (event.target.value !== "") showEpisodes(event.target.value);
  });

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose a show";
  selector.appendChild(defaultOption);

  for (const show of allShows) {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    option.selected = show.id === selectedShowId;
    selector.appendChild(option);
  }
  return selector;
}

function searchShows(event) {
  const searchTerm = event.target.value.toLowerCase();
  const matchingShows = [];
  for (const show of allShows) {
    const name = show.name.toLowerCase();
    const genres = show.genres.join(" ").toLowerCase();
    const summary = (show.summary || "").toLowerCase();
    if (name.includes(searchTerm) || genres.includes(searchTerm) || summary.includes(searchTerm)) {
      matchingShows.push(show);
    }
  }
  displayShows(matchingShows);
}

function displayShows(showsToDisplay) {
  document.getElementById("show-count").textContent = `Showing ${showsToDisplay.length} show(s)`;
  const list = document.getElementById("show-list");
  list.textContent = "";
  for (const show of showsToDisplay) list.appendChild(makeShowCard(show));
}

function makeShowCard(show) {
  const card = document.createElement("article");
  card.className = "show-card";

  const titleButton = document.createElement("button");
  titleButton.className = "show-title";
  titleButton.textContent = show.name;
  titleButton.addEventListener("click", function () { showEpisodes(show.id); });
  card.appendChild(titleButton);

  if (show.image && show.image.medium) {
    const image = document.createElement("img");
    image.src = show.image.medium;
    image.alt = `${show.name} poster`;
    card.appendChild(image);
  }

  const summary = document.createElement("div");
  summary.innerHTML = show.summary || "No summary is available.";
  card.appendChild(summary);

  const rating = show.rating.average === null ? "Not rated" : show.rating.average;
  const runtime = show.runtime === null ? "Unknown" : `${show.runtime} minutes`;
  const details = document.createElement("p");
  details.textContent = `Genres: ${show.genres.join(", ") || "None"} | Status: ${show.status} | Rating: ${rating} | Runtime: ${runtime}`;
  card.appendChild(details);
  return card;
}

async function showEpisodes(showId) {
  let selectedShow;
  for (const show of allShows) {
    if (show.id === Number(showId)) selectedShow = show;
  }
  if (!selectedShow) return;

  makeEpisodePage(selectedShow);
  const episodeView = document.getElementById("episode-view");
  episodeView.textContent = "Loading episodes...";
  try {
    allEpisodes = await getData(`https://api.tvmaze.com/shows/${showId}/episodes`);
    displayEpisodePage(selectedShow.name);
  } catch (error) {
    episodeView.textContent = "";
    const message = document.createElement("p");
    message.textContent = "Sorry, this show's episodes could not load. Please try another show.";
    message.setAttribute("role", "alert");
    episodeView.appendChild(message);
    console.error(error);
  }
}

function makeEpisodePage(selectedShow) {
  const root = getRoot();
  root.textContent = "";

  const backButton = document.createElement("button");
  backButton.textContent = "Back to all shows";
  backButton.addEventListener("click", makeShowListPage);
  root.appendChild(backButton);

  addLabel(root, "show-selector", "Choose a different TV show");
  root.appendChild(makeShowSelector(selectedShow.id));

  const episodeView = document.createElement("section");
  episodeView.id = "episode-view";
  root.appendChild(episodeView);
}

function displayEpisodePage(showName) {
  const episodeView = document.getElementById("episode-view");
  episodeView.textContent = "";
  const heading = document.createElement("h2");
  heading.textContent = `${showName} Episodes`;
  episodeView.appendChild(heading);
  episodeView.appendChild(makeEpisodeControls());

  const count = document.createElement("p");
  count.id = "episode-count";
  count.setAttribute("aria-live", "polite");
  episodeView.appendChild(count);

  const list = document.createElement("section");
  list.id = "episode-list";
  list.className = "episode-list";
  list.setAttribute("aria-label", `${showName} episodes`);
  episodeView.appendChild(list);
  displayEpisodes(allEpisodes);
}

function makeEpisodeControls() {
  const controls = document.createElement("section");
  controls.className = "episode-controls";
  addLabel(controls, "episode-search", "Search episodes");
  const searchInput = document.createElement("input");
  searchInput.id = "episode-search";
  searchInput.type = "search";
  searchInput.placeholder = "Search by name or summary";
  searchInput.addEventListener("input", searchEpisodes);
  controls.appendChild(searchInput);
  addLabel(controls, "episode-selector", "Jump to an episode");

  const selector = document.createElement("select");
  selector.id = "episode-selector";
  selector.addEventListener("change", jumpToEpisode);
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose an episode";
  selector.appendChild(defaultOption);
  for (const episode of allEpisodes) {
    const option = document.createElement("option");
    option.value = `episode-${episode.id}`;
    option.textContent = `${makeEpisodeCode(episode)} - ${episode.name}`;
    selector.appendChild(option);
  }
  controls.appendChild(selector);
  return controls;
}

function searchEpisodes(event) {
  const searchTerm = event.target.value.toLowerCase();
  const matchingEpisodes = [];
  for (const episode of allEpisodes) {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    if (name.includes(searchTerm) || summary.includes(searchTerm)) matchingEpisodes.push(episode);
  }
  displayEpisodes(matchingEpisodes);
}

function displayEpisodes(episodesToDisplay) {
  document.getElementById("episode-count").textContent = `Showing ${episodesToDisplay.length} episode(s)`;
  const list = document.getElementById("episode-list");
  list.textContent = "";
  for (const episode of episodesToDisplay) list.appendChild(makeEpisodeCard(episode));
}

function jumpToEpisode(event) {
  const episodeId = event.target.value;
  if (episodeId === "") return;
  let selectedEpisode = document.getElementById(episodeId);
  if (!selectedEpisode) {
    document.getElementById("episode-search").value = "";
    displayEpisodes(allEpisodes);
    selectedEpisode = document.getElementById(episodeId);
  }
  selectedEpisode.scrollIntoView({ behavior: "smooth", block: "start" });
  selectedEpisode.focus({ preventScroll: true });
}

function makeEpisodeCard(episode) {
  const card = document.createElement("article");
  card.className = "episode-card";
  card.id = `episode-${episode.id}`;
  card.tabIndex = -1;
  const title = document.createElement("h3");
  title.textContent = `${makeEpisodeCode(episode)} - ${episode.name}`;
  card.appendChild(title);
  if (episode.image && episode.image.medium) {
    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = `Scene from ${episode.name}`;
    card.appendChild(image);
  }
  const summary = document.createElement("div");
  summary.innerHTML = episode.summary || "No summary is available.";
  card.appendChild(summary);
  return card;
}

function makeEpisodeCode(episode) {
  const seasonNumber = String(episode.season).padStart(2, "0");
  const episodeNumber = String(episode.number).padStart(2, "0");
  return `S${seasonNumber}E${episodeNumber}`;
}

window.onload = setup;
