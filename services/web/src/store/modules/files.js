import {
  SET_FILES_LOADING,
  UNSET_FILES_LOADING,
  SET_FILES,
  APPEND_FILES,
  UNSET_FILES,
  SET_LAST_FILES_QUERY,
  UNSET_LAST_FILES_QUERY,
  SET_TOTAL_FILE_COUNT,
  UNSET_TOTAL_FILE_COUNT,
  SET_LAST_FILES_PAGE_REACHED,
  UNSET_LAST_FILES_PAGE_REACHED,
  SET_DETAIL_ITEM,
  UNSET_DETAIL_ITEM,
  SET_LAST_DETAIL_ID,
  SET_MIME_TYPES
} from '@/store/mutation-types'
import config from '@/config'
import api from '@/api'
import errorHandler from '@/util/error-handler'
import tagsHelper from '@/util/tags-helper'

export default {
  namespaced: true,
  state: {
    items: [],
    isLoading: false,
    lastQuery: null,
    totalCount: null,
    hasReachedLastPage: false,
    detailItem: null,
    lastDetailId: null,
    mimeTypes: []
  },
  mutations: {
    [SET_FILES] (state, payload) {
      state.items = payload
    },
    [APPEND_FILES] (state, payload) {
      state.items = state.items.concat(payload)
    },
    [UNSET_FILES] (state) {
      state.items = []
    },
    [SET_FILES_LOADING] (state) {
      state.isLoading = true
    },
    [UNSET_FILES_LOADING] (state) {
      state.isLoading = false
    },
    [SET_LAST_FILES_QUERY] (state, payload) {
      state.lastQuery = payload
    },
    [UNSET_LAST_FILES_QUERY] (state) {
      state.lastQuery = null
    },
    [SET_TOTAL_FILE_COUNT] (state, payload) {
      state.totalCount = payload
    },
    [UNSET_TOTAL_FILE_COUNT] (state) {
      state.totalCount = null
    },
    [SET_LAST_FILES_PAGE_REACHED] (state) {
      state.hasReachedLastPage = true
    },
    [UNSET_LAST_FILES_PAGE_REACHED] (state) {
      state.hasReachedLastPage = false
    },
    [SET_DETAIL_ITEM] (state, payload) {
      state.detailItem = payload
    },
    [UNSET_DETAIL_ITEM] (state) {
      state.detailItem = null
    },
    [SET_LAST_DETAIL_ID] (state, payload) {
      state.lastDetailId = payload
    },
    [SET_MIME_TYPES] (state, payload) {
      state.mimeTypes = payload
    }
  },
  actions: {
    fetch (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(UNSET_FILES)
      context.commit(UNSET_LAST_FILES_PAGE_REACHED)
      context.commit(SET_FILES_LOADING)

      return api.fetchFiles(payload, context.rootState.auth.token)
        .then(res => {
          if (!res.data.files.length) {
            context.commit(SET_LAST_FILES_PAGE_REACHED)

            if (config.countsAreEnabled) {
              context.commit(SET_TOTAL_FILE_COUNT, res.data.fileCount)
            }

            return
          }

          context.commit(SET_FILES, res.data.files)

          if (config.countsAreEnabled) {
            context.commit(SET_TOTAL_FILE_COUNT, res.data.fileCount)

            if (context.state.totalCount === context.state.items.length) {
              context.commit(SET_LAST_FILES_PAGE_REACHED)
            }
          }

          window.requestAnimationFrame(() => {
            document.dispatchEvent(new Event('scroll'))
          })
        })
        .catch(async err => {
          context.commit(UNSET_TOTAL_FILE_COUNT)

          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              {
                name: 'MissingPageParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidPageParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidTagsParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidConstraintsParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidSortParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidDirectionParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'MissingNamespacesParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidNamespacesParameterError',
                isFatal: false,
                isLocal: false
              },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )
        })
        .finally(() => {
          context.commit(UNSET_FILES_LOADING)
        })
    },
    fetchNextPage (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(SET_FILES_LOADING)

      return api.fetchFiles(payload, context.rootState.auth.token)
        .then(res => {
          if (!res.data.files.length) {
            context.commit(SET_LAST_FILES_PAGE_REACHED)

            if (config.countsAreEnabled) {
              context.commit(SET_TOTAL_FILE_COUNT, res.data.fileCount)
            }

            return
          }

          context.commit(APPEND_FILES, res.data.files)

          if (config.countsAreEnabled) {
            context.commit(SET_TOTAL_FILE_COUNT, res.data.fileCount)

            if (context.state.totalCount === context.state.items.length) {
              context.commit(SET_LAST_FILES_PAGE_REACHED)
            }
          }

          window.requestAnimationFrame(() => {
            document.dispatchEvent(new Event('scroll'))
          })
        })
        .catch(async err => {
          context.commit(UNSET_TOTAL_FILE_COUNT)

          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              {
                name: 'MissingPageParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidPageParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidTagsParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidConstraintsParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidSortParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidDirectionParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'MissingNamespacesParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidNamespacesParameterError',
                isFatal: false,
                isLocal: false
              },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )
        })
        .finally(() => {
          context.commit(UNSET_FILES_LOADING)
        })
    },
    empty ({ commit }) {
      commit(UNSET_FILES)
    },
    setLastQuery ({ commit }, payload) {
      commit(SET_LAST_FILES_QUERY, payload)
    },
    unsetLastQuery ({ commit }) {
      commit(UNSET_LAST_FILES_QUERY)
    },
    unsetLastPageReached (context) {
      context.commit(UNSET_LAST_FILES_PAGE_REACHED)
    },
    fetchDetail (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(UNSET_DETAIL_ITEM)
      context.commit(SET_FILES_LOADING)

      return api.fetchFile(payload, context.rootState.auth.token)
        .then(res => {
          context.commit(SET_DETAIL_ITEM, res.data)
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              {
                name: 'MissingIdParameterError',
                isFatal: false,
                isLocal: false
              },
              {
                name: 'InvalidIdParameterError',
                isFatal: false,
                isLocal: false
              },
              { name: 'NotFoundError', isFatal: false, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )
        })
        .finally(() => {
          context.commit(UNSET_FILES_LOADING)
        })
    },
    setLastDetailId ({ commit }, payload) {
      commit(SET_LAST_DETAIL_ID, payload)
    },
    fetchMimeTypes (context) {
      context.dispatch('error/flush', false, { root: true })

      if (!context.rootState.auth.token && config.isAuthenticationRequired) {
        return
      }

      return api.fetchMimeTypes(context.rootState.auth.token)
        .then(res => {
          context.commit(SET_MIME_TYPES, res.data.mimeTypes)
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )
        })
    }
  },
  getters: {
    isCountConfirmed: state => state.totalCount === state.items.length,
    sortedDetailItemTags: state => {
      if (!state.detailItem) {
        return []
      }

      return tagsHelper.getSortedTags(state.detailItem.tags)
    }
  }
}
