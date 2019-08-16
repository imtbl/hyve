<template>
  <form @submit.prevent="handleSubmit">

    <div class="columns">

      <div class="column is-9">
        <div class="field">
          <div class="control">
            <search-input
              :search.sync="search"
              :hasCompletedInput.sync="hasCompletedInput"
              size="large"
              :placeholder="
                'Search for files by tag or constraint…' |
                  formatToConfiguredLetterCase
              " />
          </div>
        </div>
      </div>

      <div class="column is-3">
        <div class="field">
          <div class="control">
            <button
              type="submit"
              class="button is-primary is-medium is-fullwidth"
              :class="{ 'is-lowercase': !useNormalLetterCase }">
              <span class="icon">
                <font-awesome-icon icon="search" />
              </span>
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

    </div>

  </form>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'
import api from '@/api'
import { generateDefaultFilesQuery } from '@/util/query'
import {
  isValidFileSearchInput,
  convertToShortcutIfNecessary
} from '@/util/input'

import SearchInput from '@/components/general/FileSearchInput'

export default {
  name: 'Search',
  data: function () {
    return {
      search: '',
      hasCompletedInput: false,
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  methods: {
    handleSubmit: function () {
      api.cancelPendingTagAutocompleteRequest()

      if (this.search.trim() !== '') {
        if (!isValidFileSearchInput(this.search, true)) {
          return
        }
      }

      this.$router.push({
        path: '/files',
        query: generateDefaultFilesQuery(
          convertToShortcutIfNecessary(this.search.trim().toLowerCase())
        )
      })
    }
  },
  watch: {
    hasCompletedInput: function (hasCompletedInput) {
      if (hasCompletedInput) {
        this.handleSubmit()
      }
    }
  },
  components: {
    FontAwesomeIcon,
    SearchInput
  }
}
</script>
