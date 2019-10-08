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

    <div class="field" v-for="option in sortingOptions" :key="option.id">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        :id="`sorting-tags-${option.id}`"
        :value="option.value"
        v-model="localSorting">
      <label :for="`sorting-tags-${option.id}`">{{ option.label }}</label>
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
      sortingOptions: [
        {
          id: 'default',
          value: 'id',
          label: 'Sort by ID'
        },
        {
          id: 'name',
          value: 'name',
          label: 'Sort by name'
        },
        {
          id: 'files',
          value: 'files',
          label: 'Sort by amount of files'
        },
        {
          id: 'contains',
          value: 'contains',
          label: 'Sort by given word (starting with)'
        },
        {
          id: 'random',
          value: 'random',
          label: 'Sort randomly'
        }
      ],
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
