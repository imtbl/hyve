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

        <div class="field" v-for="option in sortingOptions" :key="option.id">
          <input
            type="radio"
            class="is-checkradio is-aligned"
            :id="`sorting-${option.id}`"
            :value="option.value"
            v-model="localSorting">
          <label :for="`sorting-${option.id}`">{{ option.label }}</label>
        </div>

        <div class="namespace-sorting panel" v-if="sorting === 'namespaces'">

          <p class="panel-heading">
            Namespaces
          </p>

          <draggable v-model="localSortingNamespaces">
            <div
              class="panel-block sortable"
              v-for="(namespace, index) in localSortingNamespaces"
              :key="index"
              @touchstart.self.prevent>
              <span class="namespace">{{ namespace }}</span>
              <button
                type="button"
                class="delete is-small is-pulled-right"
                @click="removeNamespace(index)"></button>
            </div>
          </draggable>

          <div class="panel-block">
            <input
              type="text"
              class="input"
              v-model="newNamespace"
              @keydown.enter.prevent="addNamespace">
            <button
              type="button"
              class="button is-primary"
              :class="{ 'is-lowercase': !useNormalLetterCase }"
              @click="addNamespace">
              Add
            </button>
          </div>

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
import Draggable from 'vuedraggable'
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
    },
    sortingNamespaces: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      isOpen: false,
      sortingOptions: [
        {
          id: 'default',
          value: 'id',
          label: 'Sort by ID'
        },
        {
          id: 'size',
          value: 'size',
          label: 'Sort by file size'
        },
        {
          id: 'width',
          value: 'width',
          label: 'Sort by width'
        },
        {
          id: 'height',
          value: 'height',
          label: 'Sort by height'
        },
        {
          id: 'mime',
          value: 'mime',
          label: 'Sort by MIME type'
        },
        {
          id: 'tags',
          value: 'tags',
          label: 'Sort by amount of tags'
        },
        {
          id: 'random',
          value: 'random',
          label: 'Sort randomly'
        },
        {
          id: 'namespaces',
          value: 'namespaces',
          label: 'Sort by namespaces'
        }
      ],
      newNamespace: '',
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
    localSortingNamespaces: {
      get: function () {
        return this.sortingNamespaces
      },
      set: function (localSortingNamespaces) {
        this.$emit('update:sortingNamespaces', localSortingNamespaces)
      }
    },
    sortingIcon: function () {
      const iconMappings = {
        id: 'long-arrow-alt-down',
        'id-asc': 'long-arrow-alt-up',
        'id-desc': 'long-arrow-alt-down',
        size: 'long-arrow-alt-down',
        'size-asc': 'long-arrow-alt-up',
        'size-desc': 'long-arrow-alt-down',
        width: 'long-arrow-alt-down',
        'width-asc': 'long-arrow-alt-up',
        'width-desc': 'long-arrow-alt-down',
        height: 'long-arrow-alt-down',
        'height-asc': 'long-arrow-alt-up',
        'height-desc': 'long-arrow-alt-down',
        mime: 'long-arrow-alt-up',
        'mime-asc': 'long-arrow-alt-up',
        'mime-desc': 'long-arrow-alt-down',
        tags: 'long-arrow-alt-down',
        'tags-asc': 'long-arrow-alt-up',
        'tags-desc': 'long-arrow-alt-down',
        random: 'random',
        'random-desc': 'random',
        'random-asc': 'random',
        namespaces: 'long-arrow-alt-up',
        'namespaces-asc': 'long-arrow-alt-up',
        'namespaces-desc': 'long-arrow-alt-down'
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
        case 'size':
          return this.$options.filters.formatToConfiguredLetterCase('File size')
        case 'width':
          return this.$options.filters.formatToConfiguredLetterCase('Width')
        case 'height':
          return this.$options.filters.formatToConfiguredLetterCase('Height')
        case 'mime':
          return this.$options.filters.formatToConfiguredLetterCase('MIME type')
        case 'tags':
          return this.$options.filters.formatToConfiguredLetterCase(
            'Amount of tags'
          )
        case 'random':
          return this.$options.filters.formatToConfiguredLetterCase('Random')
        case 'namespaces':
          return this.localSortingNamespaces.join(' – ')
        default:
          return this.$options.filters.formatToConfiguredLetterCase('ID')
      }
    }
  },
  methods: {
    openSettings: function () {
      document.activeElement.blur()

      this.isOpen = true
    },
    addNamespace: function () {
      if (this.newNamespace.trim() !== '') {
        this.localSortingNamespaces.push(
          this.newNamespace.trim()
        )

        this.newNamespace = ''
      }
    },
    removeNamespace: function (index) {
      if (this.localSortingNamespaces.length > 1) {
        this.localSortingNamespaces.splice(index, 1)
      }
    }
  },
  components: {
    Draggable,
    FontAwesomeIcon
  }
}
</script>
