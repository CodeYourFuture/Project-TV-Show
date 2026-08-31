import { state } from "./state.js";
import { renderEpisodes } from "./render.js";

const searchInput = document.getElementById("q");

export function handleSearch() {
  const term = searchInput.value.toLowerCase();
  state.searchTerm = term;

  if (term === "") {
    renderEpisodes(state.episodes);
    return;
  }

  const filteredEpisodes = state.episodes.filter(function (episode) {
    const name = episode.name.toLowerCase();

    return name.indexOf(state.searchTerm) !== -1;
  });

  renderEpisodes(filteredEpisodes);
}

