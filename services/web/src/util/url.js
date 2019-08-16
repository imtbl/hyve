import config from '@/config'
import store from '@/store'

export function prepareMediaUrl (url) {
  return config.isAuthenticationRequired
    ? url + store.getters['auth/mediaTokenQueryString']
    : url
}
