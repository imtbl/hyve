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
        :id="`sorting-files-${option.id}`"
        :value="option.value"
        v-model="localSorting">
      <label :for="`sorting-files-${option.id}`">{{ option.label }}</label>
    </div>

    <div
      class="namespace-sorting panel is-primary"
      v-if="localSorting === 'namespaces'">

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
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Draggable from 'vuedraggable'

import config from '@/config'

export default {
  name: 'FilesSorting',
  props: {
    filesSorting: {
      type: String,
      required: true
    },
    filesSortingDirection: {
      type: String,
      required: true
    },
    filesSortingNamespaces: {
      type: Array,
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
        return this.filesSorting
      },
      set: function (localSorting) {
        this.$emit('update:filesSorting', localSorting)
      }
    },
    localSortingDirection: {
      get: function () {
        return this.filesSortingDirection
      },
      set: function (localSortingDirection) {
        this.$emit('update:filesSortingDirection', localSortingDirection)
      }
    },
    localSortingNamespaces: {
      get: function () {
        return this.filesSortingNamespaces
      },
      set: function (localSortingNamespaces) {
        this.$emit('update:filesSortingNamespaces', localSortingNamespaces)
      }
    }
  },
  methods: {
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
    FontAwesomeIcon,
    Draggable
  }
}
</script>
