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
