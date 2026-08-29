export const fetchShows = async () => {
  const response = await fetch("https://api.tvmaze.com/shows");

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return await response.json();
};

export const fetchEpisode = async (showId) => {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return await response.json();
};
