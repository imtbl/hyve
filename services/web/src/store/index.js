import Vue from 'vue'
import Vuex from 'vuex'

import app from '@/store/modules/app'
import api from '@/store/modules/api'
import auth from '@/store/modules/auth'
import error from '@/store/modules/error'
import tags from '@/store/modules/tags'
import files from '@/store/modules/files'
import settings from '@/store/modules/settings'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    app: app,
    api: api,
    auth: auth,
    error: error,
    tags: tags,
    files: files,
    settings: settings
  }
})
