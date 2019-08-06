<template>
  <nav
    id="navbar"
    class="navbar is-primary is-fixed-top"
    v-click-outside="closeNavigation">

    <div class="navbar-brand">

      <router-link to="/" exact class="navbar-item has-text-weight-bold">
        <svg v-if="showLogo"
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 31.09 32">
          <polygon points="22.45 0 15.69 13.39 15.41 13.39 8.64 0 0 0 11.7 21.31 19.39 21.31 31.09 0 22.45 0" />
          <rect class="cls-1" x="11.7" y="24.31" width="7.69" height="7.69" />
        </svg>
        <span>{{ title }}</span>
      </router-link>

      <div
        role="button"
        class="navbar-burger"
        :class="{ 'is-active': isNavigationOpen }"
        @click="toggleNavigation(!isNavigationOpen)"
        v-if="isInitialized && !error.isFatal">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>

    <div
      class="navbar-menu"
      :class="{ 'is-active': isNavigationOpen }"
      v-if="isInitialized && !error.isFatal">

      <div
        class="navbar-start"
        v-if="isAuthorized || !isAuthenticationRequired">
        <router-link
          to="/files"
          class="navbar-item"
          event=""
          @click.native.prevent="navigateOrScrollToTop('/files')">
          Files
        </router-link>
        <router-link
          to="/tags"
          class="navbar-item"
          event=""
          @click.native.prevent="navigateOrScrollToTop('/tags')">
          Tags
        </router-link>
      </div>

      <div class="navbar-end">

        <router-link
          to="/help"
          class="navbar-item"
          v-if="isAuthorized || !isAuthenticationRequired">
          <span class="icon">
            <font-awesome-icon icon="info" />
          </span>
          <span>Help</span>
        </router-link>

        <router-link
          to="/settings"
          class="navbar-item"
          v-if="isAuthorized || !isAuthenticationRequired">
          <span class="icon">
            <font-awesome-icon icon="cog" />
          </span>
          <span>Settings</span>
        </router-link>

        <router-link
          to="/user"
          class="navbar-item has-restricted-width"
          v-if="isAuthorized && user">
          <span class="icon">
            <font-awesome-icon icon="user" />
          </span>
          <span>{{ user.username }}</span>
        </router-link>

        <router-link to="/logout" class="navbar-item" v-if="isAuthorized">
          <span class="icon">
            <font-awesome-icon icon="sign-out-alt" />
          </span>
          <span>Log out</span>
        </router-link>

        <router-link to="/login" class="navbar-item" v-if="!isAuthorized">
          <span class="icon">
            <font-awesome-icon icon="sign-in-alt" />
          </span>
          <span>Login</span>
        </router-link>

        <router-link
          to="/registration"
          class="navbar-item"
          v-if="!isAuthorized && isRegistrationEnabled">
          <span class="icon">
            <font-awesome-icon icon="user-plus" />
          </span>
          <span>Registration</span>
        </router-link>

      </div>

    </div>

  </nav>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

export default {
  name: 'Navbar',
  props: {
    isInitialized: {
      type: Boolean,
      required: true
    },
    isAuthorized: {
      type: Boolean,
      required: true
    },
    isAuthenticationRequired: {
      type: Boolean,
      required: true
    },
    error: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      title: config.title,
      showLogo: config.showLogo,
      isRegistrationEnabled: config.isRegistrationEnabled
    }
  },
  computed: {
    ...mapState({
      isNavigationOpen: state => state.app.isNavigationOpen,
      user: state => state.auth.user
    })
  },
  methods: {
    toggleNavigation: function (open) {
      if (open) {
        this.openNavigation()

        return
      }

      this.closeNavigation()
    },
    navigateOrScrollToTop: function (route) {
      if (route === this.$route.path) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })

        if (this.isNavigationOpen) {
          this.closeNavigation()
        }

        return
      }

      this.$router.push(route)
    },
    ...mapActions({
      openNavigation: 'app/openNavigation',
      closeNavigation: 'app/closeNavigation'
    })
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
