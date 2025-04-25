const state = {
  allShows: [],
  currentShow: {},
  currentEpisodes: [],
  nowShowing: [],

  updateState(stateKey, newValues) {
    this[stateKey] = newValues;
  },
};

export {state};
