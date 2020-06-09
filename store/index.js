export default {
  state: () => {
    return { name: 1 }
  },
  getters: {},
  mutations: {
    fn(state, payload) {}
  },

  actions: {
    actiionFn({ state, commit }, payload) {
      commit('fn', payload)
    }
  }
}
