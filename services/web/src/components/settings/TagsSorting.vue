<template>
  <div class="settings-sorting has-margin-bottom">

    <div class="field has-addons" v-if="localSorting !== 'random'">
      <div class="control">
        <button class="button is-static">
          <span class="icon">
            <font-awesome-icon icon="arrows-alt-v" />
          </span>
        </button>
      </div>
      <div class="control is-expanded">
        <div class="select is-fullwidth">
          <select
            :class="{ 'is-lowercase': !useNormalLetterCase }"
            v-model="localSortingDirection">
            <option value="default">Default (based on the field)</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>

    <div class="field">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        id="sorting-tags-default"
        value="id"
        v-model="localSorting">
      <label for="sorting-tags-default">Sort by ID</label>
    </div>

    <div class="field">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        id="sorting-tags-name"
        value="name"
        v-model="localSorting">
      <label for="sorting-tags-name">Sort by name</label>
    </div>

    <div class="field">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        id="sorting-tags-files"
        value="files"
        v-model="localSorting">
      <label for="sorting-tags-files">Sort by amount of files</label>
    </div>

    <div class="field">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        id="sorting-tags-contains"
        value="contains"
        v-model="localSorting">
      <label for="sorting-tags-contains">
        Sort by given word (starting with)
      </label>
    </div>

    <div class="field">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        id="sorting-tags-random"
        value="random"
        v-model="localSorting">
      <label for="sorting-tags-random">Sort randomly</label>
    </div>

  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

export default {
  name: 'TagsSorting',
  props: {
    tagsSorting: {
      type: String,
      required: true
    },
    tagsSortingDirection: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  computed: {
    localSorting: {
      get: function () {
        return this.tagsSorting
      },
      set: function (localSorting) {
        this.$emit('update:tagsSorting', localSorting)
      }
    },
    localSortingDirection: {
      get: function () {
        return this.tagsSortingDirection
      },
      set: function (localSortingDirection) {
        this.$emit('update:tagsSortingDirection', localSortingDirection)
      }
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
