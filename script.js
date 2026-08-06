//You can edit ALL of the code here

//This content is from https://www.tvmaze.com/
//specifically: https://api.tvmaze.com/shows/82/episodes

// ======= DOM REFERENCES ======
const inputSearch = document.getElementById("input-search");
const countSearch = document.getElementById("count-search");
const selectEpisode = document.getElementById("select-episode");

// ========== DATA =========
const allEpisodes = getAllEpisodes();

function setup() {
  renderFilms(allEpisodes);
  createResetOption();
  populateEpisodeOptions();
  handleEpisodeSelection();
  handleSearchInput();
}

// ========= UTILITIES =======
// Formats episode and season numbers to show 2 digits
const formatEpisodeCode = (prefix, value) =>
  `${prefix}${String(value).padStart(2, "0")}`;

// ========= RENDERING =======

const createFilmCard = (film) => {
  // Build a single episode card using the <template> element.
  const {
    name,
    season,
    number,
    image: { medium },
    summary,
  } = film;
  const filmCard = document.getElementById("film-card").content.cloneNode(true);
  const title = filmCard.querySelector("h2");
  title.innerText = `${name} - ${formatEpisodeCode(
    "S",
    season
  )}${formatEpisodeCode("E", number)}`;

  const filmImage = filmCard.querySelector("img");
  filmImage.src = medium;
  filmImage.alt = "image from film";

  const filmSummary = filmCard.querySelector("p");
  filmSummary.innerHTML = summary;

  return filmCard;
};

// Render a list of episode cards into the grid container.
const renderFilms = (data) => {
  const rootElem = document.getElementById("film-grid");
  rootElem.innerHTML = "";
  const filmCards = data.map(createFilmCard);
  rootElem.append(...filmCards);
};
//========= SEARCH SETUP ========
// Filter episodes by title or summary as the user types.
function handleSearchInput() {
  inputSearch.addEventListener("input", function () {
    const inputSearchValueLowerCase = inputSearch.value.toLowerCase();
    const searchedEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(inputSearchValueLowerCase) ||
        episode.summary.toLowerCase().includes(inputSearchValueLowerCase)
      );
    });
    renderFilms(searchedEpisodes);
    countSearch.innerText = `Displaying ${searchedEpisodes.length} of ${allEpisodes.length} episodes`;
  });
}
// ======== SELECTOR SETUP ========
// Add the "Show All Episodes" option at the top of the dropdown.
function createResetOption() {
  const resetOption = document.createElement("option");
  resetOption.value = "all";
  resetOption.textContent = "Show All Episodes";
  selectEpisode.appendChild(resetOption);
}
// Populate the dropdown with one option per episode.
function populateEpisodeOptions() {
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      "S",
      episode.season
    )}${formatEpisodeCode("E", episode.number)} - ${episode.name}`;
    selectEpisode.appendChild(option);
  });
}

// Handle dropdown changes: show all episodes or filter by selected episode.
function handleEpisodeSelection() {
  selectEpisode.addEventListener("change", function () {
    if (selectEpisode.value == "all") {
      return renderFilms(allEpisodes);
    }
    console.log("change event working");
    const selectedEpisode = allEpisodes.filter((episode) => {
      return episode.id === Number(selectEpisode.value);
    });
    renderFilms(selectedEpisode);
  });
}

window.onload = setup;
