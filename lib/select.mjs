import {state} from "./state.mjs";
import {render} from "./render.mjs";
import {getControlsContainer, homeView, episodeView} from "./app.mjs";
import {makeEpisodeTitle} from "./helpers.mjs";
import {createCard} from "./card.mjs";
import {fetchFromTVMaze} from "./api.mjs";

const createOption = (template, {name, season, number}) => {
  const option = document.getElementById(template).content.cloneNode(true);
  option.querySelector("option").textContent = makeEpisodeTitle(
    name,
    season,
    number
  );
  return option;
};

const createSelect = (template, item) =>
  document.getElementById(template).content.cloneNode(true);

const handleEpisodeSelect = (event) => {
  const filteredEpisodes = state.currentShow.episodes.filter((episode) =>
    event.target.value.includes(episode.name)
  );
  state.updateState("currentEpisodes", filteredEpisodes);

  episodeView();
};

const handleReset = () => {
  // Reset state to initial
  state.updateState("currentShow", null);
  state.updateState("currentEpisodes", []);

  // Clear the episode select
  getControlsContainer().textContent = "";

  // Re-render
  homeView();
};

export {createOption, createSelect, handleEpisodeSelect, handleReset};
