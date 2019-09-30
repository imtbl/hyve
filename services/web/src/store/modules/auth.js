import cookies from 'js-cookie'

import {
  SET_USER,
  UNSET_USER,
  AUTHORIZE,
  DEAUTHORIZE,
  SET_AUTHORIZING,
  UNSET_AUTHORIZING,
  SET_CREATING_USER,
  UNSET_CREATING_USER,
  SET_UPDATING_USERNAME,
  UNSET_UPDATING_USERNAME,
  SET_UPDATED_USERNAME,
  UNSET_UPDATED_USERNAME,
  SET_UPDATING_PASSWORD,
  UNSET_UPDATING_PASSWORD,
  SET_UPDATED_PASSWORD,
  UNSET_UPDATED_PASSWORD,
  SET_DELETING_USER,
  UNSET_DELETING_USER
} from '@/store/mutation-types'
import router from '@/router'
import api from '@/api'
import errorHandler from '@/util/error-handler'

export default {
  namespaced: true,
  state: {
    user: null,
    token: cookies.get('token'),
    mediaToken: cookies.get('mediaToken'),
    isAuthorized: (
      (typeof cookies.get('token') !== 'undefined') &&
      (typeof cookies.get('mediaToken') !== 'undefined')
    ),
    isAuthorizing: false,
    isCreatingUser: false,
    isUpdatingUsername: false,
    hasUpdatedUsername: false,
    isUpdatingPassword: false,
    hasUpdatedPassword: false,
    isDeletingUser: false
  },
  mutations: {
    [SET_USER] (state, payload) {
      state.user = payload
    },
    [UNSET_USER] (state) {
      state.user = null
    },
    [AUTHORIZE] (state, payload) {
      state.isAuthorized = payload.isAuthorized
      state.token = payload.token
      state.mediaToken = payload.mediaToken
    },
    [DEAUTHORIZE] (state) {
      state.isAuthorized = false
      state.token = null
      state.mediaToken = null
    },
    [SET_AUTHORIZING] (state) {
      state.isAuthorizing = true
    },
    [UNSET_AUTHORIZING] (state) {
      state.isAuthorizing = false
    },
    [SET_CREATING_USER] (state) {
      state.isCreatingUser = true
    },
    [UNSET_CREATING_USER] (state) {
      state.isCreatingUser = false
    },
    [SET_UPDATING_USERNAME] (state) {
      state.isUpdatingUsername = true
    },
    [UNSET_UPDATING_USERNAME] (state) {
      state.isUpdatingUsername = false
    },
    [SET_UPDATED_USERNAME] (state) {
      state.hasUpdatedUsername = true
    },
    [UNSET_UPDATED_USERNAME] (state) {
      state.hasUpdatedUsername = false
    },
    [SET_UPDATING_PASSWORD] (state) {
      state.isUpdatingPassword = true
    },
    [UNSET_UPDATING_PASSWORD] (state) {
      state.isUpdatingPassword = false
    },
    [SET_UPDATED_PASSWORD] (state) {
      state.hasUpdatedPassword = true
    },
    [UNSET_UPDATED_PASSWORD] (state) {
      state.hasUpdatedPassword = false
    },
    [SET_DELETING_USER] (state) {
      state.isDeletingUser = true
    },
    [UNSET_DELETING_USER] (state) {
      state.isDeletingUser = false
    }
  },
  actions: {
    fetchUser (context) {
      context.dispatch('error/flush', false, { root: true })

      if (!context.state.token) {
        return
      }

      return api.fetchUser(context.state.token)
        .then(res => {
          context.commit(SET_USER, res.data)
        })
        .catch(err => {
          errorHandler.handle(
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
    },
    createUser (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(SET_CREATING_USER)

      return api.createUser({
        username: payload.username,
        password: payload.password
      })
        .then(res => {
          context.dispatch(
            'authorize',
            {
              username: payload.username,
              password: payload.password,
              long: false
            }
          )
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              {
                name: 'RegistrationDisabledError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'MissingUsernameFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidUsernameFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'MissingPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              { name: 'UsernameExistsError', isFatal: false, isLocal: true },
              { name: 'SyncInProgressError', isFatal: true, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        })
        .finally(() => {
          context.commit(UNSET_CREATING_USER)
        })
    },
    deleteUser (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(SET_DELETING_USER)

      return api.deleteUser(
        { password: payload.currentPassword },
        context.state.token
      )
        .then(async res => {
          await context.dispatch('deauthorize')
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              {
                name: 'MissingPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              { name: 'InvalidUserError', isFatal: false, isLocal: true },
              { name: 'SyncInProgressError', isFatal: true, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        })
        .finally(() => {
          context.commit(UNSET_DELETING_USER)
        })
    },
    updateUsername (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(SET_UPDATING_USERNAME)

      return api.updateUser(
        {
          username: payload.newUsername,
          currentPassword: payload.currentPassword
        },
        context.state.token
      )
        .then(res => {
          context.commit(UNSET_UPDATING_USERNAME)
          context.commit(SET_UPDATED_USERNAME)
          context.commit(SET_USER, res.data)

          setTimeout(() => {
            context.commit(UNSET_UPDATED_USERNAME)
          }, 2000)
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              { name: 'NoUpdateFieldsError', isFatal: false, isLocal: true },
              {
                name: 'MissingUsernameFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidUsernameFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'MissingCurrentPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidCurrentPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              { name: 'InvalidUserError', isFatal: false, isLocal: true },
              { name: 'UsernameExistsError', isFatal: false, isLocal: true },
              { name: 'SyncInProgressError', isFatal: true, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        })
        .finally(() => {
          context.commit(UNSET_UPDATING_USERNAME)
        })
    },
    updatePassword (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(SET_UPDATING_PASSWORD)

      return api.updateUser(
        {
          password: payload.newPassword,
          currentPassword: payload.currentPassword
        },
        context.state.token
      )
        .then(res => {
          context.commit(UNSET_UPDATING_PASSWORD)
          context.commit(SET_UPDATED_PASSWORD)
          context.commit(SET_USER, res.data)

          setTimeout(() => {
            context.commit(UNSET_UPDATED_PASSWORD)
          }, 2000)
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              { name: 'MissingTokenError', isFatal: false, isLocal: false },
              { name: 'InvalidTokenError', isFatal: false, isLocal: false },
              { name: 'NoUpdateFieldsError', isFatal: false, isLocal: true },
              {
                name: 'MissingPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'MissingCurrentPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidCurrentPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              { name: 'InvalidUserError', isFatal: false, isLocal: true },
              { name: 'UsernameExistsError', isFatal: false, isLocal: true },
              { name: 'SyncInProgressError', isFatal: true, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        })
        .finally(() => {
          context.commit(UNSET_UPDATING_PASSWORD)
        })
    },
    authorize (context, payload) {
      context.dispatch('error/flush', false, { root: true })

      context.commit(SET_AUTHORIZING)

      return api.authorize({
        username: payload.username,
        password: payload.password,
        long: payload.long
      })
        .then(async res => {
          cookies.set(
            'token',
            res.data.token,
            { expires: new Date(res.data.expiresAt) }
          )
          cookies.set(
            'mediaToken',
            res.data.mediaToken,
            { expires: new Date(res.data.expiresAt) }
          )

          context.commit(
            AUTHORIZE,
            {
              isAuthorized: true,
              token: res.data.token,
              mediaToken: res.data.mediaToken
            }
          )

          await Promise.all([
            context.dispatch('api/fetchInfo', false, { root: true }),
            context.dispatch('fetchUser'),
            context.dispatch('tags/fetchMostUsed', false, { root: true }),
            context.dispatch('tags/fetchNamespaces', false, { root: true }),
            context.dispatch('files/fetchMimeTypes', false, { root: true })
          ])

          context.dispatch('settings/load', false, { root: true })

          router.push('/')
        })
        .catch(async err => {
          await errorHandler.handle(
            err.response,
            [
              {
                name: 'MissingUsernameFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidUsernameFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'MissingPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              {
                name: 'InvalidPasswordFieldError',
                isFatal: false,
                isLocal: true
              },
              { name: 'InvalidLongFieldError', isFatal: false, isLocal: true },
              { name: 'InvalidUserError', isFatal: false, isLocal: true },
              { name: 'SyncInProgressError', isFatal: true, isLocal: false },
              { name: 'ShuttingDownError', isFatal: true, isLocal: false },
              { name: 'InternalServerError', isFatal: true, isLocal: false }
            ]
          )

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        })
        .finally(() => {
          context.commit(UNSET_AUTHORIZING)
          context.commit(UNSET_CREATING_USER)
        })
    },
    deauthorize (context, payload) {
      return new Promise(async (resolve, reject) => {
        cookies.remove('token')
        cookies.remove('mediaToken')

        if (context.state.token) {
          await api.deauthorize({ all: payload }, context.state.token)
            .then(() => {
              context.commit(DEAUTHORIZE)
              context.commit(UNSET_USER)
            })
            .catch(() => {
              context.commit(DEAUTHORIZE)
              context.commit(UNSET_USER)
            })
            .finally(() => {
              context.dispatch('settings/load', false, { root: true })

              router.push('/login')

              resolve()
            })
        } else {
          context.commit(DEAUTHORIZE)
          context.commit(UNSET_USER)

          context.dispatch('settings/load', false, { root: true })

          router.push('/login')

          resolve()
        }
      })
    },
    async checkCookie ({ commit, state }) {
      if (!state.isAuthorized) {
        return
      }

      if (!(cookies.get('token') && cookies.get('mediaToken'))) {
        commit(DEAUTHORIZE)
        commit(UNSET_USER)

        await errorHandler.handle(
          { data: { error: 'InvalidTokenError' } },
          [{ name: 'InvalidTokenError', isFatal: false, isLocal: false }]
        )
      }
    }
  },
  getters: {
    mediaTokenQueryString: state => {
      return state.mediaToken ? `?token=${state.mediaToken}` : ''
    }
  }
}
