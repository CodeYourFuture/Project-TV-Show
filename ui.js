export function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("tv-show-card")
    .content.cloneNode(true);

  const title = episodeCard.querySelector("h3");
  title.textContent = `${episode.name} - S${String(episode.season).padStart(
    2,
    "0",
  )}E${String(episode.number).padStart(2, "0")}`;

  const image = episodeCard.querySelector("img");
  image.src = episode.image.medium;
  image.alt = episode.name;

  const summary = episodeCard.querySelector("p");
  summary.innerHTML = episode.summary;

  const link = episodeCard.querySelector("a");
  link.href = episode.url;
  link.textContent = "Source";
  link.target = "_blank";

  return episodeCard;
}