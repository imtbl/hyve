import {
  SET_THEME,
  SET_RESTRICT_MEDIA_SIZE,
  SET_AUTOPLAY_VIDEOS,
  SET_LOOP_VIDEOS,
  SET_COLORS,
  SET_FILES_SORTING,
  SET_FILES_SORTING_DIRECTION,
  SET_FILES_SORTING_NAMESPACES,
  SET_TAGS_SORTING,
  SET_TAGS_SORTING_DIRECTION
} from '@/store/mutation-types'
import config from '@/config'
import { setTheme } from '@/util/theme'

export default {
  namespaced: true,
  state: {
    theme: 'default',
    restrictMediaSize: false,
    autoplayVideos: false,
    loopVideos: false,
    colors: [],
    filesSorting: 'id',
    filesSortingDirection: 'default',
    filesSortingNamespaces: [],
    tagsSorting: 'id',
    tagsSortingDirection: 'default'
  },
  mutations: {
    [SET_THEME] (state, payload) {
      state.theme = payload
    },
    [SET_RESTRICT_MEDIA_SIZE] (state, payload) {
      state.restrictMediaSize = payload
    },
    [SET_AUTOPLAY_VIDEOS] (state, payload) {
      state.autoplayVideos = payload
    },
    [SET_LOOP_VIDEOS] (state, payload) {
      state.loopVideos = payload
    },
    [SET_COLORS] (state, payload) {
      state.colors = payload
    },
    [SET_FILES_SORTING] (state, payload) {
      state.filesSorting = payload
    },
    [SET_FILES_SORTING_DIRECTION] (state, payload) {
      state.filesSortingDirection = payload
    },
    [SET_FILES_SORTING_NAMESPACES] (state, payload) {
      state.filesSortingNamespaces = payload
    },
    [SET_TAGS_SORTING] (state, payload) {
      state.tagsSorting = payload
    },
    [SET_TAGS_SORTING_DIRECTION] (state, payload) {
      state.tagsSortingDirection = payload
    }
  },
  actions: {
    load (context) {
      const userId = context.rootState.auth.user
        ? `-${context.rootState.auth.user.id}`
        : ''

      const storedTheme = localStorage.getItem(`hyve-theme${userId}`)
      const storedRestrictMediaSize = localStorage.getItem(
        `hyve-restrict-media-size${userId}`
      )
      const storedAutoplayVideos = localStorage.getItem(
        `hyve-autoplay-videos${userId}`
      )
      const storedLoopVideos = localStorage.getItem(
        `hyve-loop-videos${userId}`
      )
      const storedColors = localStorage.getItem(`hyve-colors${userId}`)
      const storedFilesSorting = localStorage.getItem(
        `hyve-files-sorting${userId}`
      )
      const storedFilesSortingDirection = localStorage.getItem(
        `hyve-files-sorting-direction${userId}`
      )
      const storedFilesSortingNamespaces = localStorage.getItem(
        `hyve-files-sorting-namespaces${userId}`
      )
      const storedTagsSorting = localStorage.getItem(
        `hyve-tags-sorting${userId}`
      )
      const storedTagsSortingDirection = localStorage.getItem(
        `hyve-tags-sorting-direction${userId}`
      )

      context.dispatch(
        'save',
        {
          theme: storedTheme
            ? JSON.parse(storedTheme)
            : undefined,
          restrictMediaSize: storedRestrictMediaSize
            ? JSON.parse(storedRestrictMediaSize)
            : undefined,
          autoplayVideos: storedAutoplayVideos
            ? JSON.parse(storedAutoplayVideos)
            : undefined,
          loopVideos: storedLoopVideos
            ? JSON.parse(storedLoopVideos)
            : undefined,
          colors: storedColors ? JSON.parse(storedColors) : undefined,
          filesSorting: storedFilesSorting
            ? JSON.parse(storedFilesSorting)
            : undefined,
          filesSortingDirection: storedFilesSortingDirection
            ? JSON.parse(storedFilesSortingDirection)
            : undefined,
          filesSortingNamespaces: storedFilesSortingNamespaces
            ? JSON.parse(storedFilesSortingNamespaces)
            : undefined,
          tagsSorting: storedTagsSorting
            ? JSON.parse(storedTagsSorting)
            : undefined,
          tagsSortingDirection: storedTagsSortingDirection
            ? JSON.parse(storedTagsSortingDirection)
            : undefined
        }
      )
    },
    save (context, payload) {
      const userId = context.rootState.auth.user
        ? `-${context.rootState.auth.user.id}`
        : ''

      const {
        theme = 'default',
        restrictMediaSize = false,
        autoplayVideos = false,
        loopVideos = false,
        colors = config.defaultNamespaceColors,
        filesSorting = 'id',
        filesSortingDirection = 'default',
        filesSortingNamespaces = [config.fallbackFilesSortingNamespace],
        tagsSorting = 'id',
        tagsSortingDirection = 'default'
      } = payload

      context.commit(SET_THEME, theme)
      localStorage.setItem(`hyve-theme${userId}`, JSON.stringify(theme))

      setTheme(
        theme === 'default'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : theme === 'dark'
      )

      context.commit(SET_RESTRICT_MEDIA_SIZE, restrictMediaSize)
      localStorage.setItem(
        `hyve-restrict-media-size${userId}`, JSON.stringify(restrictMediaSize)
      )

      context.commit(SET_AUTOPLAY_VIDEOS, autoplayVideos)
      localStorage.setItem(
        `hyve-autoplay-videos${userId}`, JSON.stringify(autoplayVideos)
      )

      context.commit(SET_LOOP_VIDEOS, loopVideos)
      localStorage.setItem(
        `hyve-loop-videos${userId}`, JSON.stringify(loopVideos)
      )

      context.commit(SET_COLORS, colors)
      localStorage.setItem(`hyve-colors${userId}`, JSON.stringify(colors))

      context.commit(SET_FILES_SORTING, filesSorting)
      localStorage.setItem(
        `hyve-files-sorting${userId}`, JSON.stringify(filesSorting)
      )

      context.commit(SET_FILES_SORTING_DIRECTION, filesSortingDirection)
      localStorage.setItem(
        `hyve-files-sorting-direction${userId}`,
        JSON.stringify(filesSortingDirection)
      )

      context.commit(SET_FILES_SORTING_NAMESPACES, filesSortingNamespaces)
      localStorage.setItem(
        `hyve-files-sorting-namespaces${userId}`,
        JSON.stringify(filesSortingNamespaces)
      )

      context.commit(SET_TAGS_SORTING, tagsSorting)
      localStorage.setItem(
        `hyve-tags-sorting${userId}`, JSON.stringify(tagsSorting)
      )

      context.commit(SET_TAGS_SORTING_DIRECTION, tagsSortingDirection)
      localStorage.setItem(
        `hyve-tags-sorting-direction${userId}`,
        JSON.stringify(tagsSortingDirection)
      )
    }
  },
  getters: {
    currentColors: (state, getters, rootState) => {
      if (!(state.colors.length && rootState.tags.namespaces.length)) {
        return []
      }

      const colors = []

      for (const namespace of rootState.tags.namespaces) {
        const available = state.colors.find(
          color => color.name === namespace.name
        )

        colors.push({
          name: namespace.name,
          color: available ? available.color : config.fallbackNamespaceColor
        })
      }

      return colors
    }
  }
}
