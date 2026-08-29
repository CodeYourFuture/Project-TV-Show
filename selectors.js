export function populateEpisodeSelect(episodes) {
  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Choose an episode";
  defaultOption.value = "";

  episodeSelect.append(defaultOption);

  for (const episode of episodes) {
    const opt = document.createElement("option");

    opt.textContent = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")} - ${episode.name}`;

    opt.value = episode.id;

    episodeSelect.append(opt);
  }
}