<template>
  <div>

    <div
      class="quickview-blocker"
      @click="isOpen = false"
      v-if="isOpen"></div>

    <div class="quickview" :class="{ 'is-active': isOpen }">

      <header class="quickview-header">
        <p class="title">Sorting</p>
        <button
          type="button"
          class="delete"
          @click="isOpen = false"></button>
      </header>

      <div class="quickview-body">

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
            id="sorting-default"
            value="id"
            v-model="localSorting">
          <label for="sorting-default">Sort by ID</label>
        </div>

        <div class="field">
          <input
            type="radio"
            class="is-checkradio is-aligned"
            id="sorting-name"
            value="name"
            v-model="localSorting">
          <label for="sorting-name">Sort by name</label>
        </div>

        <div class="field">
          <input
            type="radio"
            class="is-checkradio is-aligned"
            id="sorting-files"
            value="files"
            v-model="localSorting">
          <label for="sorting-files">Sort by amount of files</label>
        </div>

        <div class="field">
          <input
            type="radio"
            class="is-checkradio is-aligned"
            id="sorting-contains"
            value="contains"
            v-model="localSorting">
          <label for="sorting-contains">
            Sort by given word (starting with)
          </label>
        </div>

        <div class="field">
          <input
            type="radio"
            class="is-checkradio is-aligned"
            id="sorting-random"
            value="random"
            v-model="localSorting">
          <label for="sorting-random">Sort randomly</label>
        </div>

      </div>

    </div>

    <div class="field has-pointer has-addons">
      <div class="control">
        <button class="button is-static">
          <span class="icon">
            <font-awesome-icon :icon="sortingIcon" />
          </span>
        </button>
      </div>
      <div class="control is-expanded">
        <input
          type="text"
          class="input"
          readonly
          v-model="sortingDisplay"
          @click="openSettings">
      </div>
    </div>

  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

export default {
  name: 'Sorting',
  props: {
    sorting: {
      type: String,
      required: true
    },
    sortingDirection: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      isOpen: false,
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  computed: {
    localSorting: {
      get: function () {
        return this.sorting
      },
      set: function (localSorting) {
        this.$emit('update:sorting', localSorting)
      }
    },
    localSortingDirection: {
      get: function () {
        return this.sortingDirection
      },
      set: function (localSortingDirection) {
        this.$emit('update:sortingDirection', localSortingDirection)
      }
    },
    sortingIcon: function () {
      const iconMappings = {
        id: 'long-arrow-alt-down',
        'id-asc': 'long-arrow-alt-up',
        'id-desc': 'long-arrow-alt-down',
        name: 'long-arrow-alt-up',
        'name-asc': 'long-arrow-alt-up',
        'name-desc': 'long-arrow-alt-down',
        files: 'long-arrow-alt-down',
        'files-asc': 'long-arrow-alt-up',
        'files-desc': 'long-arrow-alt-down',
        contains: 'long-arrow-alt-up',
        'contains-asc': 'long-arrow-alt-up',
        'contains-desc': 'long-arrow-alt-down',
        random: 'random',
        'random-desc': 'random',
        'random-asc': 'random'
      }

      let direction

      switch (this.localSortingDirection) {
        case 'asc':
          direction = '-asc'

          break
        case 'desc':
          direction = '-desc'

          break
        default:
          direction = ''
      }

      return iconMappings[this.localSorting + direction]
    },
    sortingDisplay: function () {
      switch (this.localSorting) {
        case 'name':
          return this.$options.filters.formatToConfiguredLetterCase('Name')
        case 'files':
          return this.$options.filters.formatToConfiguredLetterCase(
            'Amount of files'
          )
        case 'contains':
          return this.$options.filters.formatToConfiguredLetterCase('Given word')
        case 'random':
          return this.$options.filters.formatToConfiguredLetterCase('Random')
        default:
          return this.$options.filters.formatToConfiguredLetterCase('ID')
      }
    }
  },
  methods: {
    openSettings: function () {
      document.activeElement.blur()

      this.isOpen = true
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
