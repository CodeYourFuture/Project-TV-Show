//You can edit ALL of the code here

const episodeList = {
  id: 4952,
  url: "http://www.tvmaze.com/episodes/4952/game-of-thrones-1x01-winter-is-coming",
  name: "Winter is Coming",
  season: 1,
  number: 1,
  airdate: "2011-04-17",
  airtime: "21:00",
  airstamp: "2011-04-18T01:00:00+00:00",
  runtime: 60,
  image: {
    medium:
      "http://static.tvmaze.com/uploads/images/medium_landscape/1/2668.jpg",
    original:
      "http://static.tvmaze.com/uploads/images/original_untouched/1/2668.jpg",
  },
  summary:
    "<p>Lord Eddard Stark, ruler of the North, is summoned to court by his old friend, King Robert Baratheon, to serve as the King's Hand. Eddard reluctantly agrees after learning of a possible threat to the King's life. Eddard's bastard son Jon Snow must make a painful decision about his own future, while in the distant east Viserys Targaryen plots to reclaim his father's throne, usurped by Robert, by selling his sister in marriage.</p>",
  _links: {
    self: {
      href: "http://api.tvmaze.com/episodes/4952",
    },
  },
};

function formatEpisodeCode(season, episode) {
  const formattedSeason = String(season).padStart(2, "0");
  const formattedNumber = String(episode).padStart(2, "0");
  return `S${formattedSeason}E${formattedNumber}`;
}

function createSelectElement(episodeList) {
  const createSelect = document.createElement("select");
  createSelect.id = "episode-select";
  const rootElem = document.getElementById("root");
  document.body.insertBefore(createSelect, rootElem);
  return createSelect;
}
const allEpisodes = getAllEpisodes();
function createOptionElements() {
  const createSelect = document.getElementById("episode-select");

  const defaultOption = document.createElement("option");
  defaultOption.value = "ALL";
  defaultOption.textContent = "Show all episodes";
  createSelect.appendChild(defaultOption);
  //create option value for every episode in the list
  allEpisodes.map((episode) => {
    let option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode.season, episode.number)} - ${episode.name}`;
    createSelect.appendChild(option);
  });
}

function EventChange() {
  const createSelect = document.getElementById("episode-select");

  createSelect.addEventListener("change", (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "ALL") {
      makePageForEpisodes(allEpisodes);
    } else {
      const result = allEpisodes.filter(
        (episode) => episode.id === Number(createSelect.value),
      );
      makePageForEpisodes(result);
    }
  });
}

// set the search bar...
const searchInput = document.createElement("input");
searchInput.type = "search";
searchInput.id = "search-input";
searchInput.name = "q";
searchInput.placeholder = "Search the episodes..,";

const searchCount = document.createElement("span");
searchCount.id = "search-count";

//From here , the purpose is to build the search bar
function SetupSearchBar() {
  const rootElem = document.getElementById("root");
  document.body.insertBefore(searchInput, rootElem);
}

//show the specific episode when the user types.
function displayEpisodes(EpisodeToDisplay, allEpisodes) {
  const count = document.getElementById("search-count");
  if (count) {
    count.textContent = ` Displaying ${EpisodeToDisplay.length}/${allEpisodes.length} episodes `;
  }

  EpisodeToDisplay.forEach((episode) => {
    count.textContent = `Displaying ${EpisodeToDisplay.length}/ ${allEpisodes.length} episodes `;
  });
}
displayEpisodes(allEpisodes);

// when they type in the search bar, it will filter the selected episode.

function handleSearchINput(event) {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    const FilterEpisode = allEpisodes.filter((episode) => {
      const matchName = episode.name.includes(searchTerm);
      const matchSummary = episode.summary.includes(searchTerm);

      return matchName || matchSummary;
    });
    makePageForEpisodes(FilterEpisode);
  });
}

function makePageForEpisodes(episodeTodisplay) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const card = episodeTodisplay.map((episode) => createDramaCard(episode));
  rootElem.append(...card);
}

//Purpose: Put the episode objects  into the root
//grab the root and then you put it insides : function 1: put the object insides the root

function createChildElement(parentElement, tagName, textContent) {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  parentElement.append(element);
  return element;
}

function createDramaCard(episode) {
  const card = document.createElement("section");
  card.classList.add("drama-card");

  const formattedSeason = String(episode.season).padStart(2, "0");
  const formattedNumber = String(episode.number).padStart(2, "0");
  const episodeCode = `S${formattedSeason}E${formattedNumber}`;

  const smallcard = document.createElement("div");
  smallcard.classList.add("small-card");
  createChildElement(smallcard, "h3", `${episode.name} - ${episodeCode}`);
  card.append(smallcard);

  const img = document.createElement("img");
  img.src = episode.image ? episode.image.medium : "";
  card.append(img);

  const summaryElem = document.createElement("div");
  summaryElem.innerHTML = episode.summary;
  card.append(summaryElem);

  return card;
}

const createSelect = document.createElement("select");
createSelect.id = "episode-select";

const RootContainer = document.getElementById("root");
RootContainer.appendChild(createSelect);

function setup() {
  const allEpisodes = getAllEpisodes();
  createSelectElement();
  createOptionElements();
  EventChange();

  SetupSearchBar();
  handleSearchINput();

  makePageForEpisodes(allEpisodes);
}

window.onload = setup;
