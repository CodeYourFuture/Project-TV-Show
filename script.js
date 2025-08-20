function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  populateDropdown(allEpisodes);
  setupSearch(allEpisodes);
  setupDropdown(allEpisodes);
}

function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

function makePageForEpisodes(episodes) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const template = document.getElementById("episode-template");

  episodes.forEach((ep) => {
    const episodeCode = `S${zeroPad(ep.season)}E${zeroPad(ep.number)}`;
    const clone = template.content.cloneNode(true);

    clone.querySelector("a").href = ep.url;
    clone.querySelector(".episode-name").textContent = ep.name;
    clone.querySelector(".episode-code").textContent = episodeCode;

    const img = clone.querySelector("img");
    img.src = ep.image.medium;
    img.alt = `Image from ${ep.name}`;

    clone.querySelector(".episode-summary").innerHTML = ep.summary;

    root.appendChild(clone);
  });

  const count = document.getElementById("episodeCount");
  count.textContent = `Displaying ${episodes.length} episode(s)`;
}



window.onload = setup;
