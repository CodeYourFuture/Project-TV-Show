async function fetchFromTVMaze(endpoint) {
  endpoint = `https://api.tvmaze.com/${endpoint}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}

export {fetchFromTVMaze};
