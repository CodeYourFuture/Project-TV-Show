import { state } from "./state.js";
import { createEpisodeCard } from "./ui.js";

const root = document.getElementById("root");

export function renderEpisodes(list) {
  root.innerHTML = "";
  const episodeCards = list.map(createEpisodeCard);
  root.append(...episodeCards);
  updateCount(list);
}
function updateCount(list) {
  const countElement = document.getElementById("search-count");

  if (state.searchTerm.trim() === "") {
    countElement.textContent = `Displaying ${list.length}/${state.episodes.length} episodes`;
    return;
  }

  countElement.textContent = `Matching episodes: ${list.length}`;
}