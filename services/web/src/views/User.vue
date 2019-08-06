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

                <h1 class="has-text-primary" v-if="user">
                  {{ user.username }}
                </h1>
                <h1 v-else>User</h1>

                <p v-if="user">
                  Your user was created on
                  <em>{{ user.createdAt | formatDate }}</em>.
                  It was last edited on
                  <em>{{ user.updatedAt | formatDate }}</em>.
                </p>

                <hr class="has-background-grey-lighter" v-if="user">

                <h2 class="has-paragraph-size has-text-primary">
                  Change username
                </h2>

                <change-username
                  :isWorking="isWorking"
                  :hasSaved="hasSaved"
                  :isUpdatingUsername="isUpdatingUsername"
                  :hasUpdatedUsername="hasUpdatedUsername"
                  :isUpdatingPassword="isUpdatingPassword"
                  :hasUpdatedPassword="hasUpdatedPassword"
                  :isDeletingUser="isDeletingUser" />

                <hr class="has-background-grey-lighter">

                <h2 class="has-paragraph-size has-text-primary">
                  Change password
                </h2>

                <change-password
                  :isWorking="isWorking"
                  :hasSaved="hasSaved"
                  :isUpdatingUsername="isUpdatingUsername"
                  :hasUpdatedUsername="hasUpdatedUsername"
                  :isUpdatingPassword="isUpdatingPassword"
                  :hasUpdatedPassword="hasUpdatedPassword"
                  :isDeletingUser="isDeletingUser" />

                <hr class="has-background-grey-lighter">

                <h2 class="has-paragraph-size has-text-primary">Log out</h2>

                <p>
                  <button
                    class="button is-primary"
                    :class="{ 'is-lowercase': !useNormalLetterCase }"
                    @click="logOutEverywhere"
                    :disabled="isWorking || hasSaved">
                    <span class="icon">
                      <font-awesome-icon icon="sign-out-alt" />
                    </span>
                    <span>Log out everywhere</span>
                  </button>
                </p>

                <p>
                  This action logs you out in every browser, device and
                  application, effectively invalidating every existing token
                  for your user.
                </p>

                <hr class="has-background-grey-lighter">

                <h2 class="has-paragraph-size has-text-primary">
                  Delete user
                </h2>

                <p>
                  <delete-user
                    :isWorking="isWorking"
                    :hasSaved="hasSaved"
                    :isUpdatingUsername="isUpdatingUsername"
                    :hasUpdatedUsername="hasUpdatedUsername"
                    :isUpdatingPassword="isUpdatingPassword"
                    :hasUpdatedPassword="hasUpdatedPassword"
                    :isDeletingUser="isDeletingUser" />
                </p>

                <p>
                  This action deletes your user (logging you out everywhere).
                  Deleting the user cannot be undone.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  </div>
</template>

<script>
import { mapState } from 'vuex'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

import ChangeUsername from '@/components/user/ChangeUsername'
import ChangePassword from '@/components/user/ChangePassword'
import DeleteUser from '@/components/user/DeleteUser'

export default {
  name: 'User',
  data: function () {
    return {
      title: `User – ${config.title}`,
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  computed: {
    isWorking: function () {
      return this.isUpdatingUsername ||
        this.isUpdatingPassword ||
        this.isDeletingUser
    },
    hasSaved: function () {
      return this.hasUpdatedUsername || this.hasUpdatedPassword
    },
    ...mapState({
      user: state => state.auth.user,
      isUpdatingUsername: state => state.auth.isUpdatingUsername,
      hasUpdatedUsername: state => state.auth.hasUpdatedUsername,
      isUpdatingPassword: state => state.auth.isUpdatingPassword,
      hasUpdatedPassword: state => state.auth.hasUpdatedPassword,
      isDeletingUser: state => state.auth.isDeletingUser,
      error: state => state.error
    })
  },
  methods: {
    logOutEverywhere: function () {
      this.$router.push({ path: '/logout', query: { everywhere: true } })
    }
  },
  components: {
    FontAwesomeIcon,
    ChangeUsername,
    ChangePassword,
    DeleteUser
  }
}
</script>
