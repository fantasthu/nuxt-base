export default {
  state: () => {
    return {
      skeletonData: null,
      page_loading: true
    }
  },
  mutations: {
    UPDATE_SKELETON(state, payload) {
      state.skeletonData = payload
    },
    UPDATE_LOADING(state, payload) {
      console.log(' state.page_loading ', payload)
      state.page_loading = payload
    }
  }
}
