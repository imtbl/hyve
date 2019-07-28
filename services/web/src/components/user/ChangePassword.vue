<template>
  <form @submit.prevent="changePassword">

    <div class="field">
      <div class="control">
        <input
          type="password"
          class="input"
          :placeholder="'New password' | formatToConfiguredLetterCase"
          required
          :minlength="minPasswordLength"
          maxlength="1024"
          :disabled="isWorking || hasSaved"
          autocomplete="new-password"
          v-model="newPassword">
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
            'is-primary': !hasUpdatedPassword,
            'is-success': hasUpdatedPassword
          }"
          :disabled="isUpdatingUsername ||
            hasUpdatedUsername ||
            isDeletingUser
          ">
          <span class="icon" v-if="isUpdatingPassword">
            <font-awesome-icon icon="spinner" class="fa-pulse" />
          </span>
          <span class="icon" v-else-if="hasUpdatedPassword">
            <font-awesome-icon icon="check" />
          </span>
          <span class="icon" v-else>
            <font-awesome-icon icon="save" />
          </span>
          <span v-if="isUpdatingPassword">Saving…</span>
          <span v-else-if="hasUpdatedPassword">Saved</span>
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
  name: 'ChangePassword',
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
      newPassword: '',
      minPasswordLength: config.minPasswordLength < 1024
        ? config.minPasswordLength
        : 1024,
      currentPassword: '',
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  methods: {
    changePassword: function () {
      if (
        this.isWorking ||
        this.hasSaved ||
        this.newPassword.trim() === '' ||
        this.currentPassword.trim() === '' ||
        this.currentPassword.length < this.minPasswordLength
      ) {
        return
      }

      this.updatePassword({
        newPassword: this.newPassword,
        currentPassword: this.currentPassword
      })

      this.newPassword = ''
      this.currentPassword = ''
    },
    ...mapActions({
      updatePassword: 'auth/updatePassword'
    })
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
