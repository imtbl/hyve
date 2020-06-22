/*!
 * hyve
 * Copyright (C) 2020-present  imtbl  https://github.com/imtbl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Vue from 'vue'
import VueHeadful from 'vue-headful'
import VueHotkey from 'v-hotkey'
import VueClickOutside from 'v-click-outside'
import PhotoSwipe from 'vue-simple-photoswipe/dist/vue-simple-photoswipe'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faArrowRight,
  faArrowsAltV,
  faArrowUp,
  faCheck,
  faCog,
  faEquals,
  faEyeSlash,
  faImages,
  faInfo,
  faLongArrowAltLeft,
  faLongArrowAltDown,
  faLongArrowAltUp,
  faRandom,
  faSave,
  faSearch,
  faSignInAlt,
  faSignOutAlt,
  faSpinner,
  faTools,
  faTrash,
  faUser,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons'

import config from '@/config'
import router from '@/router'
import store from '@/store'
import { isDesktopResolution } from '@/util/visibility'

import App from '@/App'

import '@/styles/main'

Vue.config.productionTip = false

Vue.component('vue-headful', VueHeadful)
Vue.use(VueHotkey)
Vue.use(VueClickOutside)
Vue.use(PhotoSwipe)

Vue.directive('focus', {
  inserted: function (el) {
    Vue.nextTick(() => {
      if (!store.state.app.hasSavedScrollPosition && isDesktopResolution()) {
        el.focus()
      }
    })
  }
})

Vue.filter('formatToConfiguredLetterCase', text => {
  if (!text) {
    return ''
  }

  return config.useNormalLetterCase ? text : text.toLowerCase()
})

Vue.filter('formatNumber', number => {
  if (typeof number !== 'number') {
    return ''
  }

  return number.toLocaleString()
})

Vue.filter('formatDate', dateString => {
  if (!dateString) {
    return ''
  }

  return new Date(dateString).toLocaleString()
})

Vue.filter('addFileExtension', (name, mime) => {
  if (!(name && mime)) {
    return ''
  }

  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'video/x-flv': 'flv',
    'video/mp4': 'mp4',
    'video/x-ms-wmv': 'wmv',
    'video/x-matroska': 'mkv',
    'video/webm': 'webm',
    'image/apng': 'apng',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'image/webp': 'webp'
  }

  return `${name}.${extensions[mime]}`
})

router.beforeEach(async (to, from, next) => {
  store.dispatch('app/closeNavigation')

  store.dispatch('error/flush')

  if (to.path !== '/logout') {
    await store.dispatch('auth/checkCookie')
  }

  const isAuthenticationRequired = to.matched.some(
    route => route.meta.isAuthenticationRequired
  )
  const isNoAuthenticationRequired = to.matched.some(
    route => route.meta.isNoAuthenticationRequired
  )
  const isAuthorized = store.state.auth.isAuthorized

  if (isAuthenticationRequired && !isAuthorized) {
    return next('/login')
  }

  if (isNoAuthenticationRequired && isAuthorized) {
    return next('/')
  }

  next()
})

library.add(
  faArrowLeft,
  faArrowRight,
  faArrowsAltV,
  faArrowUp,
  faCheck,
  faCog,
  faEquals,
  faEyeSlash,
  faImages,
  faInfo,
  faLongArrowAltLeft,
  faLongArrowAltDown,
  faLongArrowAltUp,
  faRandom,
  faSave,
  faSearch,
  faSignInAlt,
  faSignOutAlt,
  faSpinner,
  faTools,
  faTrash,
  faUser,
  faUserPlus
)

new Vue({
  router,
  store,
  mounted: function () {
    this.$store.dispatch('app/initialize')
  },
  render: h => h(App)
}).$mount('#app')
