import {state} from "./state.mjs";
import {render} from "./render.mjs";
import {getCardContainer} from "./app.mjs";
import {createCard, handleCardClick} from "./card.mjs";

const handleSearch = (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const current = state.isHomeView() ? state.allShows : state.currentEpisodes;
  const template = state.isHomeView() ? "show-template" : "episode-template";

  const filtered = current.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchTerm)
  );

  render(filtered, getCardContainer(), template, createCard);

  // reattach event listeners
  if (state.isHomeView()) {
    document.querySelectorAll("[data-show-id]").forEach((card) => {
      card.addEventListener("click", handleCardClick);
    });
  }
};

export {handleSearch};
