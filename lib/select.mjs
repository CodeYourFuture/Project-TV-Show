import {state} from "./state.mjs";
import {render} from "./render.mjs";
import {getCardContainer, getSelectEpisode, getSelectShow} from "./app.mjs";
import {pad, makeEpisodeTitle, sortAlphabetically} from "./helpers.mjs";
import {createCard} from "./card.mjs";
import {fetchFromTVMaze} from "./api.mjs";

function createOption(template, {name, season, number}) {
  const option = document.getElementById(template).content.cloneNode(true);
  option.querySelector("option").textContent = makeEpisodeTitle(
    name,
    season,
    number
  );
  return option;
}

function handleEpisodeSelect(event) {
  //filter the list
  const filteredEpisodes = state.currentEpisodes.filter(
    (episode) =>
      event.target.value ===
      `${makeEpisodeTitle(episode.name, episode.season, episode.number)}`
  );

  if (filteredEpisodes.length) {
    state.updateState("nowShowing", filteredEpisodes);
  }
  // render the UI
  render(state.nowShowing, getCardContainer(), "card-template", createCard);
}

async function handleShowSelect(event) {
  // filter the list
  let show = state.allShows.find((show) => event.target.value === show.name);

  // fetch episodes if not already fetched
  if (!show.episodes) {
    try {
      show.episodes = await fetchFromTVMaze(`shows/${show.id}/episodes`);
    } catch (error) {
      getCardContainer().textContent = `Something went wrong, sorry! ${error.message}`;
    }
  }
  // update the state
  state.updateState("currentShow", show);
  state.updateState("currentEpisodes", show.episodes);
  state.updateState("nowShowing", [show]);

  // render the episodes that belong to this show into the episodes select
  render(
    [{name: "Choose episode"}, ...state.currentEpisodes],
    getSelectEpisode(),
    "option-template",
    createOption
  );
  render(
    state.currentEpisodes,
    getCardContainer(),
    "card-template",
    createCard
  );
}

export {createOption, handleEpisodeSelect, handleShowSelect};
