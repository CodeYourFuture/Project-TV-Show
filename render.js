export function renderEpisodes(list) {
  root.innerHTML = "";
  const episodeCards = list.map(createEpisodeCard);
  root.append(...episodeCards);
  updateCount(list);
}