<template>
  <div class="wrapper">

    <vue-headful :title="title | formatToConfiguredLetterCase" />

    <section class="section">

      <div class="container">

        <div class="columns is-centered">

          <div class="column is-10-tablet is-8-desktop">

            <article class="message is-danger" v-if="error && error.isLocal">
              <div class="message-header">
                <p>{{ error.name }}</p>
              </div>
              <div class="message-body">
                <p v-html="error.message"></p>
              </div>
            </article>

            <div class="frame">

              <div class="content">

                <h1 class="has-text-primary">Login</h1>

                <form @submit.prevent="logIn">

                  <div class="field">
                    <div class="control">
                      <input
                        type="text"
                        class="input"
                        :placeholder="'Username' | formatToConfiguredLetterCase"
                        required
                        :disabled="isLoggingIn"
                        autocomplete="username"
                        v-model="username"
                        v-focus>
                    </div>
                  </div>

                  <div class="field">
                    <div class="control">
                      <input
                        type="password"
                        class="input"
                        :placeholder="'Password' | formatToConfiguredLetterCase"
                        required
                        :disabled="isLoggingIn"
                        autocomplete="current-password"
                        v-model="password">
                    </div>
                  </div>

                  <div class="field">
                    <input
                      type="checkbox"
                      class="is-checkradio is-aligned"
                      id="login-long"
                      :disabled="isLoggingIn"
                      v-model="long">
                    <label for="login-long">Stay logged in for 90 days</label>
                  </div>

                  <div class="field">
                    <div class="control">
                      <button
                        type="submit"
                        class="button is-primary"
                        :class="{ 'is-lowercase': !useNormalLetterCase }">
                        <span class="icon" v-if="isLoggingIn">
                          <font-awesome-icon icon="spinner" class="fa-pulse" />
                        </span>
                        <span class="icon" v-else>
                          <font-awesome-icon icon="sign-in-alt" />
                        </span>
                        <span v-if="isLoggingIn">Logging in…</span>
                        <span v-else>Log in</span>
                      </button>
                    </div>
                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

export default {
  name: 'Login',
  data: function () {
    return {
      username: '',
      password: '',
      long: false,
      title: `Login – ${config.title}`,
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  computed: {
    ...mapState({
      isLoggingIn: state => state.auth.isAuthorizing,
      error: state => state.error
    })
  },
  methods: {
    logIn: function () {
      if (
        this.isLoggingIn ||
        this.username.trim() === '' ||
        this.password.trim() === ''
      ) {
        return
      }

      this.authorize({
        username: this.username,
        password: this.password,
        long: this.long
      })
    },
    ...mapActions({
      authorize: 'auth/authorize'
    })
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
