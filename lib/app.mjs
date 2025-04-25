// bring in all the components of the applications
import {render} from "./render.mjs";
import {state} from "./state.mjs";
import {sortAlphabetically} from "./helpers.mjs";
import {createCard} from "./card.mjs";
import {
  createOption,
  handleShowSelect,
  handleEpisodeSelect,
} from "./select.mjs";
import {fetchFromTVMaze} from "./api.mjs";

// these are called getters, look them up
const getCardContainer = () => document.getElementById("card-container");
const getSelectEpisode = () => document.getElementById("episode-select");
const getSelectShow = () => document.getElementById("show-select");

// this is my "start view"
const resetView = () => {
  state.updateState("currentShow", []);
  state.updateState("currentEpisodes", []);
  state.updateState("nowShowing", state.allShows);

  render(state.nowShowing, getCardContainer(), "card-template", createCard);
  render(
    [{name: "Choose show"}, ...state.allShows],
    getSelectShow(),
    "option-template",
    createOption
  );
};

// this is the main function that runs when the page loads
// sets up the state, fetches data from the TVMaze API, and renders the UI
const init = async () => {
  try {
    const shows = await fetchFromTVMaze("shows");
    // populate state
    state.updateState("allShows", sortAlphabetically(shows));
    state.updateState("currentShow", []);
    state.updateState("nowShowing", state.allShows);

    // grab nodes from html
    const search = document.getElementById("episode-search");
    const reset = document.getElementById("reset-state");

    // listen for user events
    getSelectEpisode().addEventListener("change", handleEpisodeSelect);
    getSelectShow().addEventListener("change", handleShowSelect);
    reset.addEventListener("click", resetView);

    // render UI
    resetView();
  } catch (error) {
    getCardContainer().textContent = `Something went wrong, sorry! ${error.message}`;
  }
};

window.onload = init;

export {getCardContainer, getSelectEpisode, getSelectShow};
