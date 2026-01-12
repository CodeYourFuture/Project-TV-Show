const state = {
  allShows: [],
  currentShow: null,
  currentEpisodes: [],

  updateState(stateKey, newValues) {
    this[stateKey] = newValues;
  },

  isHomeView() {
    return this.currentEpisodes.length === 0;
  },
};

export {state};
