


function setup() {
  const tvShows = getAllEpisodes();

  const tvShowCards = tvShows.map(createTvShowCard);

  root.append(...tvShowCards);
}

function createTvShowCard(tvShow) {
  const tvShowCard = document
    .getElementById("tv-show-card")
    .content
    .cloneNode(true);

  const title = tvShowCard.querySelector("h3");
  title.textContent = `${tvShow.name} - S${String(tvShow.season).padStart(
    2,
    “0”,
  )}E${String(tvShow.number).padStart(2, "0")}`;

  const image = tvShowCard.querySelector(“img”);
  image.src = tvShow.image.medium;
  image.alt = tvShow.name;

  const summary = tvShowCard.querySelector(“p”);
  summary.innerHTML = tvShow.summary;

  const link = tvShowCard.querySelector(“a”);
  link.href = tvShow.url;
  link.textContent = “Source”;
  link.target = “_blank”;

  return tvShowCard;
}

window.onload = setup;