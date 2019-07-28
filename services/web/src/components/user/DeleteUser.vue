<template>
  <form @submit.prevent="removeUser">

    <div class="field">
      <div class="control">
        <input
          type="password"
          class="input"
          :placeholder="'Current password' | formatToConfiguredLetterCase"
          required
          :disabled="isWorking || hasSaved"
          autocomplete="current-password"
          v-model="currentPassword">
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button
          type="submit"
          class="button is-danger"
          :class="{ 'is-lowercase': !useNormalLetterCase }"
          :disabled="
            isUpdatingUsername ||
            hasUpdatedUsername ||
            isUpdatingPassword ||
            hasUpdatedPassword
          ">
          <span class="icon" v-if="isDeletingUser">
            <font-awesome-icon icon="spinner" class="fa-pulse" />
          </span>
          <span class="icon" v-else>
            <font-awesome-icon icon="trash" />
          </span>
          <span v-if="isDeletingUser">Deleting user…</span>
          <span v-else>Delete user</span>
        </button>
      </div>
    </div>

  </form>
</template>

<script>
import { mapActions } from 'vuex'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

export default {
  name: 'DeleteUser',
  props: {
    isWorking: {
      type: Boolean,
      required: true
    },
    hasSaved: {
      type: Boolean,
      required: true
    },
    isUpdatingUsername: {
      type: Boolean,
      required: true
    },
    hasUpdatedUsername: {
      type: Boolean,
      required: true
    },
    isUpdatingPassword: {
      type: Boolean,
      required: true
    },
    hasUpdatedPassword: {
      type: Boolean,
      required: true
    },
    isDeletingUser: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      currentPassword: '',
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  methods: {
    removeUser: function () {
      if (
        this.isWorking ||
        this.hasSaved ||
        this.currentPassword.trim() === ''
      ) {
        return
      }

      this.deleteUser({ currentPassword: this.currentPassword })

      this.currentPassword = ''
    },
    ...mapActions({
      deleteUser: 'auth/deleteUser'
    })
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
