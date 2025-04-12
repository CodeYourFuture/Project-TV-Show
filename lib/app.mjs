// bring in all the components of the applications

import {render} from "./render.mjs";
import {state} from "./state.mjs";
import {fetchFromTVMaze} from "./api.mjs";
import {sortAlphabetically} from "./helpers.mjs";
import {createCard, handleCardClick} from "./card.mjs";
import {handleSearch} from "./search.mjs";
import {
  createSelect,
  createOption,
  handleEpisodeSelect,
  handleReset,
} from "./select.mjs";

// these are called getters, look them up
const getCardContainer = () => document.getElementById("card-container");
const getControlsContainer = () =>
  document.getElementById("controls-container");
const getSelect = () => document.getElementById("episode-select");

// this is the main function that runs when the page loads
// fetches data from the TVMaze API, populates the state with the fetched data, and renders the UI
const init = async () => {
  try {
    const shows = await fetchFromTVMaze("shows");
    // populate state
    state.allShows = sortAlphabetically(shows);
    state.currentShow = shows;

    // render the UI
    homeView();
  } catch (error) {
    getCardContainer().textContent = `Something went wrong, sorry! ${error.message}`;
  }
};

// this is a reusable function that renders the home view
// it goes in the same order as every other view function
const homeView = () => {
  // state
  const data = state.allShows;
  //render UI
  render(data, getCardContainer(), "show-template", createCard);
  // attach listeners to populated DOM
  const cards = document.querySelectorAll("[data-show-id]");
  cards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
  });

  const search = document.getElementById("search");
  search.addEventListener("input", handleSearch);
};

const episodeView = () => {
  //state
  const data = state.currentEpisodes;

  // render the UI
  render(["single"], getControlsContainer(), "select-template", createSelect);
  render(data, getSelect(), "option-template", createOption);
  render(data, getCardContainer(), "episode-template", createCard);

  // attach listeners
  getSelect().addEventListener("change", handleEpisodeSelect);
  getControlsContainer()
    .querySelector("#reset")
    .addEventListener("click", handleReset);
};

window.onload = init;

export {
  getCardContainer,
  getControlsContainer,
  getSelect,
  homeView,
  episodeView,
};
