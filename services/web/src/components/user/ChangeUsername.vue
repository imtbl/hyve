<template>
  <form @submit.prevent="changeUsername">

    <div class="field">
      <div class="control">
        <input
          type="text"
          class="input"
          :placeholder="'New username' | formatToConfiguredLetterCase"
          required
          maxlength="1024"
          :disabled="isWorking || hasSaved"
          autocomplete="username"
          v-model="newUsername">
      </div>
    </div>

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
          class="button"
          :class="{
            'is-lowercase': !useNormalLetterCase,
            'is-primary': !hasUpdatedUsername,
            'is-success': hasUpdatedUsername
          }"
          :disabled="isUpdatingPassword ||
            hasUpdatedPassword ||
            isDeletingUser
          ">
          <span class="icon" v-if="isUpdatingUsername">
            <font-awesome-icon icon="spinner" class="fa-pulse" />
          </span>
          <span class="icon" v-else-if="hasUpdatedUsername">
            <font-awesome-icon icon="check" />
          </span>
          <span class="icon" v-else>
            <font-awesome-icon icon="save" />
          </span>
          <span v-if="isUpdatingUsername">Saving…</span>
          <span v-else-if="hasUpdatedUsername">Saved</span>
          <span v-else>Save</span>
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
  name: 'ChangeUsername',
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
      newUsername: '',
      currentPassword: '',
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  methods: {
    changeUsername: function () {
      if (
        this.isWorking ||
        this.hasSaved ||
        this.newUsername.trim() === '' ||
        this.currentPassword.trim() === ''
      ) {
        return
      }

      this.updateUsername({
        newUsername: this.newUsername,
        currentPassword: this.currentPassword
      })

      this.newUsername = ''
      this.currentPassword = ''
    },
    ...mapActions({
      updateUsername: 'auth/updateUsername'
    })
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
