import { SET_API_STATUS, SET_API_INFO } from '@/store/mutation-types'
import config from '@/config'
import api from '@/api'
import errorHandler from '@/util/error-handler'

export default {
  namespaced: true,
  state: {
    isAvailable: false,
    apiVersion: null,
    tagCount: null,
    fileCount: null
  },
  mutations: {
    [SET_API_STATUS] (state, payload) {
      state.isAvailable = true
      state.apiVersion = payload.apiVersion
    },
    [SET_API_INFO] (state, payload) {
      state.tagCount = payload.tagCount
      state.fileCount = payload.fileCount
    }
  },
  actions: {
    fetchStatus ({ commit, dispatch }) {
      dispatch('error/flush', false, { root: true })

      return api.fetchApiStatus()
        .then(res => {
          commit(SET_API_STATUS, res.data.hyve)
        })
        .catch(async err => {
          await errorHandler.handle(err.response)
        })
    },
    fetchInfo (context) {
      context.dispatch('error/flush', false, { root: true })

      if (!context.rootState.auth.token && config.isAuthenticationRequired) {
        return
      }

      return api.fetchInfo(context.rootState.auth.token)
        .then(res => {
          context.commit(SET_API_INFO, res.data)
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              { name: 'SyncInProgressError', isFatal: true, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )
        })
    }
  }
}
