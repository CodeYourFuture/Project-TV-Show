const fetchFromTVMaze = async (endpoint) => {
  endpoint = `https://api.tvmaze.com/${endpoint}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  } catch (error) {
    return error;
  }
};

export {fetchFromTVMaze};
