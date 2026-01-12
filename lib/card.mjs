import {state} from "./state.mjs";
import {render} from "./render.mjs";
import {fetchFromTVMaze} from "./api.mjs";
import {
  getCardContainer,
  getControlsContainer,
  homeView,
  episodeView,
} from "./app.mjs";
import {makeEpisodeTitle, parseFromAPI} from "./helpers.mjs";

const createCard = (
  template,
  {id, image, name, summary, season, number, runtime, rating, status}
) => {
  const card = document.getElementById(template).content.cloneNode(true);
  card.querySelector("[data-title]").textContent = makeEpisodeTitle(
    name,
    season,
    number
  );
  card.querySelector("[data-summary]").textContent =
    parseFromAPI(summary).body.textContent;
  card.querySelector("[data-image]").src =
    image?.medium || state.currentShow.image.medium;

  // if it's a show, populate these extra fields
  if (state.isHomeView()) {
    card.querySelector("[data-show-id]").dataset.showId = id;
    card.querySelector("[data-status]").textContent = `Status: ${status}`;
    card.querySelector("[data-rating]").textContent = rating.average;
    card.querySelector(
      "[data-runtime]"
    ).textContent = `Runtime: ${runtime?.toString()} minutes`;
  }

  return card;
};

const handleCardClick = async (event) => {
  const card = event.target.closest("[data-show-id]");

  const show = state.allShows.find(
    (show) => Number(card.dataset.showId) === show.id
  );

  // fetch episodes if not already fetched
  if (!show.episodes) {
    show.episodes = await fetchFromTVMaze(`shows/${show.id}/episodes`);
    state.updateState("show.episodes", show.episodes);
  }
  // update the state
  state.updateState("currentShow", show);
  state.updateState("currentEpisodes", show.episodes);

  // render the UI
  episodeView();
};

export {createCard, handleCardClick};
