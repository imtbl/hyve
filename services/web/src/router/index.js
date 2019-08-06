import Vue from 'vue'
import Router from 'vue-router'
import qs from 'qs'

import config from '@/config'
import store from '@/store'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ '@/views/Home')
    },
    {
      path: '/registration',
      name: 'registration',
      component: () => import(/* webpackChunkName: "registration" */ '@/views/Registration'),
      meta: {
        isNoAuthenticationRequired: true
      },
      beforeEnter: (to, from, next) => {
        if (!config.isRegistrationEnabled) {
          return next('/login')
        }

        next()
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ '@/views/Login'),
      meta: {
        isNoAuthenticationRequired: true
      }
    },
    {
      path: '/logout',
      beforeEnter: async (to, from, next) => {
        if (to.query.everywhere) {
          await store.dispatch('auth/deauthorize', true)

          return
        }

        await store.dispatch('auth/deauthorize', false)
      }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import(/* webpackChunkName: "user" */ '@/views/User'),
      meta: {
        isAuthenticationRequired: true
      },
      beforeEnter: async (to, from, next) => {
        if (from.name) {
          await store.dispatch('auth/fetchUser', false)
        }

        next()
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings'),
      meta: {
        isAuthenticationRequired: config.isAuthenticationRequired
      },
      beforeEnter: async (to, from, next) => {
        if (from.name) {
          await store.dispatch('tags/fetchNamespaces', false)
        }

        next()
      }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import(/* webpackChunkName: "settings" */ '@/views/Help'),
      meta: {
        isAuthenticationRequired: config.isAuthenticationRequired
      }
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import(/* webpackChunkName: "tags" */ '@/views/Tags'),
      meta: {
        isAuthenticationRequired: config.isAuthenticationRequired
      }
    },
    {
      path: '/files',
      name: 'files',
      component: () => import(/* webpackChunkName: "files" */ '@/views/Files'),
      meta: {
        isAuthenticationRequired: config.isAuthenticationRequired
      }
    },
    {
      path: '/files/:id',
      name: 'file',
      component: () => import(/* webpackChunkName: "file" */ '@/views/File'),
      meta: {
        isAuthenticationRequired: config.isAuthenticationRequired
      },
      beforeEnter: (to, from, next) => {
        if (isNaN(to.params.id)) {
          return next('/files')
        }

        next()
      }
    },
    { path: '*', redirect: '/' }
  ],
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      store.dispatch('app/setSavedScrollPosition', true)

      return savedPosition
    }

    store.dispatch('app/unsetSavedScrollPosition', false)

    if (
      [
        'home',
        'registration',
        'login',
        'user',
        'settings',
        'help',
        'file'
      ].includes(to.name)
    ) {
      return { x: 0, y: 0 }
    }
  },
  parseQuery: query => {
    return qs.parse(query)
  },
  stringifyQuery: query => {
    const result = qs.stringify(query)

    return result ? `?${result}` : ''
  },
  linkActiveClass: 'is-active',
  linkExactActiveClass: 'is-active'
})
