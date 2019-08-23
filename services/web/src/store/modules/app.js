import {
  INITIALIZE_APP,
  OPEN_NAVIGATION,
  CLOSE_NAVIGATION,
  SET_SAVED_SCROLL_POSITION,
  UNSET_SAVED_SCROLL_POSITION
} from '@/store/mutation-types'

export default {
  namespaced: true,
  state: {
    isInitialized: false,
    isNavigationOpen: false,
    hasSavedScrollPosition: false
  },
  mutations: {
    [INITIALIZE_APP] (state) {
      state.isInitialized = true
    },
    [OPEN_NAVIGATION] (state) {
      state.isNavigationOpen = true
    },
    [CLOSE_NAVIGATION] (state) {
      state.isNavigationOpen = false
    },
    [SET_SAVED_SCROLL_POSITION] (state) {
      state.hasSavedScrollPosition = true
    },
    [UNSET_SAVED_SCROLL_POSITION] (state) {
      state.hasSavedScrollPosition = false
    }
  },
  actions: {
    async initialize (context) {
      await context.dispatch('api/fetchStatus', false, { root: true })

      if (!context.rootState.error.isFatal) {
        await Promise.all([
          context.dispatch('api/fetchInfo', false, { root: true }),
          context.dispatch('auth/fetchUser', false, { root: true }),
          context.dispatch('tags/fetchMostUsed', false, { root: true }),
          context.dispatch('tags/fetchNamespaces', false, { root: true }),
          context.dispatch('files/fetchMimeTypes', false, { root: true })
        ])

        context.dispatch('settings/load', false, { root: true })
      }

      context.commit(INITIALIZE_APP)
    },
    openNavigation ({ commit }) {
      commit(OPEN_NAVIGATION)
    },
    closeNavigation ({ commit }) {
      commit(CLOSE_NAVIGATION)
    },
    setSavedScrollPosition ({ commit }) {
      commit(SET_SAVED_SCROLL_POSITION)
    },
    unsetSavedScrollPosition ({ commit }) {
      commit(UNSET_SAVED_SCROLL_POSITION)
    }
  }
}
