import { RAISE, FLUSH } from '@/store/mutation-types'

export default {
  namespaced: true,
  state: {
    name: null,
    message: null,
    isFatal: false,
    isLocal: false
  },
  mutations: {
    [RAISE] (state, payload) {
      state.name = payload.name
      state.message = payload.message
      state.isFatal = payload.isFatal
      state.isLocal = payload.isLocal
    },
    [FLUSH] (state) {
      if (!state.isFatal) {
        state.name = null
        state.message = null
        state.isFatal = false
        state.isLocal = false
      }
    }
  },
  actions: {
    raise ({ commit }, payload) {
      commit(RAISE, payload)
    },
    flush ({ commit }) {
      commit(FLUSH)
    }
  }
}
