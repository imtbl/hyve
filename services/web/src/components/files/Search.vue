<template>
  <form @submit.prevent="handleSubmit">

    <div class="columns">

      <div class="column is-5-tablet is-6-desktop">

        <div class="field has-addons" v-if="totalCount !== null">
          <div class="control is-expanded">
            <search-input
              ref="searchInput"
              :search.sync="search"
              :hasCompletedInput.sync="hasCompletedInput"
              :placeholder="placeholderText | formatToConfiguredLetterCase"
              :parentRefs="$refs" />
          </div>
          <div class="control">
            <button class="button is-static">
              <span class="icon">
                <font-awesome-icon icon="equals" />
              </span>
              <span>{{ totalCount | formatNumber }}</span>
            </button>
          </div>
        </div>

        <div class="field" v-else>
          <div class="control">
            <search-input
              ref="searchInput"
              :search.sync="search"
              :hasCompletedInput.sync="hasCompletedInput"
              :placeholder="placeholderText | formatToConfiguredLetterCase"
              :parentRefs="$refs" />
          </div>
        </div>

      </div>

      <div class="column is-5-tablet is-4-desktop">
        <sorting
          :sorting.sync="sorting"
          :sortingDirection.sync="sortingDirection"
          :sortingNamespaces.sync="sortingNamespaces" />
      </div>

      <div class="column is-2">
        <div class="field">
          <div class="control">
            <button
              type="submit"
              class="button is-primary is-fullwidth"
              :class="{ 'is-lowercase': !useNormalLetterCase }">
              <span class="icon" v-if="isLoading">
                <font-awesome-icon icon="spinner" class="fa-pulse" />
              </span>
              <span class="icon" v-else>
                <font-awesome-icon icon="search" />
              </span>
              <span v-if="isLoading">Searching…</span>
              <span v-else>Search</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <div class="file-search-filters tags" v-if="activeFilters.length">
      <!-- eslint-disable vue/use-v-on-exact -->
      <a
        class="tag is-medium"
        :class="{ 'constraint': filter.type === 'constraint' }"
        href="#"
        ref="activeFilters"
        :style="
          { backgroundColor: filter.type === 'tag' ? filter.color : null }
        "
        v-for="(filter, index) in activeFilters"
        :key="index"
        @click.prevent="removeFilter(filter.name, filter.type, true)"
        @keydown.enter.prevent="removeFilter(filter.name, filter.type, true)"
        @keydown.delete.prevent="removeFilter(filter.name, filter.type, true)"
        @keydown.left.prevent="focusActiveFilter(index - 1)"
        @keydown.right.prevent="focusActiveFilter(index + 1)"
        @keydown.tab.prevent="focusActiveFilter(activeFilters.length - 1)"
        @keydown.shift.tab.prevent="focusActiveFilter(0)"
        @keydown.esc.prevent="focusSearchInput"
        @keydown.prevent="startTyping">
        <span class="icon" v-if="filter.exclude">
          <font-awesome-icon icon="eye-slash" />
        </span>
        <span class="icon" v-if="filter.type === 'constraint'">
          <font-awesome-icon icon="tools" />
        </span>
        <span>{{ filter.name }}</span>
        <span type="button" class="delete is-small"></span>
      </a>
      <!-- eslint-enable -->
    </div>

  </form>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { isEmpty } from 'lodash/lang'
import qs from 'qs'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'
import api from '@/api'
import { ensureValidPage, generateFilesQuery } from '@/util/query'
import { isValidFileSearchInput, transformFileSearchInput } from '@/util/input'
import { getSortedTags, getTagColor } from '@/util/tags'
import { isValidConstraint } from '@/util/constraints'
import { isDesktopResolution } from '@/util/visibility'

import SearchInput from '@/components/general/FileSearchInput'
import Sorting from '@/components/files/Sorting'

export default {
  name: 'Search',
  props: {
    isLoading: {
      type: Boolean,
      required: true
    },
    lastQuery: {
      required: true
    },
    wantsAdditionalFiles: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      isInitialized: false,
      search: '',
      sorting: this.$store.state.settings.filesSorting,
      sortingDirection: this.$store.state.settings.filesSortingDirection,
      sortingNamespaces: Object.assign(
        [], this.$store.state.settings.filesSortingNamespaces
      ),
      page: 1,
      activeTags: [],
      activeConstraints: [],
      hasCompletedInput: false,
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  computed: {
    activeFilters: function () {
      const sortedActiveConstraints = this.activeConstraints.slice()
      sortedActiveConstraints.sort((a, b) => a.name.localeCompare(b.name))

      return sortedActiveConstraints.concat(
        getSortedTags(this.activeTags.slice(), true)
      )
    },
    placeholderText: function () {
      return this.activeFilters.length
        ? 'Add more tags or constraints to your search…'
        : 'Search for files by tag or constraint…'
    },
    ...mapState({
      totalCount: state => state.files.totalCount,
      hasReachedLastPage: state => state.files.hasReachedLastPage,
      colors: state => state.settings.colors
    }),
    ...mapGetters({
      isCountConfirmed: 'files/isCountConfirmed'
    })
  },
  methods: {
    initialize: function () {
      if (!isEmpty(this.$route.query)) {
        this.page = ensureValidPage(this.$route.query.page)

        if (this.$route.query.tags) {
          this.setFilters(this.$route.query.tags)
        }

        if (this.$route.query.constraints) {
          const constraints = []

          for (const constraint of this.$route.query.constraints) {
            if (isValidConstraint(constraint)) {
              constraints.push(constraint)
            }
          }

          this.setFilters(constraints)
        }

        if (
          [
            'id',
            'size',
            'width',
            'height',
            'mime',
            'tags',
            'random',
            'namespaces'
          ]
            .includes(
              this.$route.query.sort
            )
        ) {
          this.sorting = this.$route.query.sort

          if (this.$route.query.sort === 'namespaces') {
            if (this.$route.query.namespaces) {
              this.sortingNamespaces = this.$route.query.namespaces
            } else {
              this.sorting = 'id'
            }
          }
        }

        if (['default', 'asc', 'desc'].includes(this.$route.query.direction)) {
          this.sortingDirection = this.$route.query.direction
        }

        const queryString = qs.stringify(
          this.$route.query,
          { addQueryPrefix: true }
        )

        if (queryString !== this.lastQuery) {
          this.setLastQuery(queryString)

          this.loadFiles(false)
        }

        this.finishInitialization()

        return
      }

      this.emptyFiles()
      this.unsetLastQuery()

      this.loadFiles(false)

      this.finishInitialization()
    },
    handleSubmit: function () {
      api.cancelPendingTagAutocompleteRequest()

      if (this.search.trim() !== '') {
        if (!isValidFileSearchInput(this.search, true)) {
          return
        }
      }

      this.page = 1

      this.loadFiles(false)
    },
    updateQueryAndGetStrings: function () {
      const query = generateFilesQuery(
        this.activeTags.map(
          tag => tag.exclude
            ? `-${tag.name}`
            : tag.name.startsWith('-')
              ? `\\${tag.name}`
              : tag.name
        ),
        this.activeConstraints.map(constraint => constraint.name),
        this.sorting,
        this.sortingDirection,
        this.sortingNamespaces,
        this.page
      )

      const sanitizedQuery = Object.assign({}, query)

      if (sanitizedQuery.direction && sanitizedQuery.direction === 'default') {
        delete sanitizedQuery.direction
      }

      /*
       * The error is not handled because the `this.$router.replace()` call is
       * only used to replace the current URL, no navigation is expected.
       * vue-router can not navigate to the same URL again and errors as of
       * version 3.1.0.
       *
       * See https://github.com/vuejs/vue-router/issues/2872#issuecomment-519073998
       */
      this.$router.replace({
        path: '/files',
        query: query
      }).catch(_ => {}) // eslint-disable-line handle-callback-err

      return {
        queryString: qs.stringify(query, { addQueryPrefix: true }),
        sanitizedQueryString: qs.stringify(
          sanitizedQuery, { addQueryPrefix: true }
        )
      }
    },
    loadFiles: function (fetchNextPage) {
      this.search = transformFileSearchInput(this.search)

      if (this.search !== '') {
        this.removeFilter(
          this.search.startsWith('\\-')
            ? this.search.substr(1)
            : this.search.startsWith('-')
              ? this.search.substr(1)
              : this.search,
          isValidConstraint(this.search) ? 'constraint' : 'tag'
        )

        this.addFilter(this.search)
      }

      this.search = ''

      const queryStrings = this.updateQueryAndGetStrings()

      this.setLastQuery(queryStrings.queryString)

      if (fetchNextPage) {
        this.fetchNextPage(queryStrings.sanitizedQueryString)

        return
      }

      this.fetchFiles(queryStrings.sanitizedQueryString)
    },
    addFilter: function (filter) {
      if (isValidConstraint(filter)) {
        this.activeConstraints.push({
          type: 'constraint',
          name: filter
        })

        return
      }

      const filterName = filter.startsWith('-')
        ? filter.replace('-', '')
        : filter.startsWith('\\-')
          ? filter.replace('\\-', '-')
          : filter

      this.activeTags.push({
        type: 'tag',
        name: filterName,
        exclude: filter.startsWith('-'),
        color: getTagColor(filterName, this.colors)
      })
    },
    setFilters: function (filters) {
      if (filters.length) {
        filters = filters
          .map(filter => filter.trim())
          .filter(filter => filter.length)
          .filter((filter, i, filters) => filters.indexOf(filter) === i)

        for (const filter of filters) {
          this.addFilter(filter)
        }
      }
    },
    removeFilter: function (filter, type, submit = false) {
      if (type === 'constraint') {
        for (let i = 0; i < this.activeConstraints.length; i++) {
          if (this.activeConstraints[i].name === filter) {
            this.activeConstraints.splice(i, 1)
          }
        }
      } else {
        for (let i = 0; i < this.activeTags.length; i++) {
          if (this.activeTags[i].name === filter) {
            this.activeTags.splice(i, 1)
          }
        }
      }

      if (submit) {
        this.handleSubmit()

        this.$nextTick(() => {
          if (this.activeFilters.length) {
            this.$refs.activeFilters[this.$refs.activeFilters.length - 1]
              .focus()

            return
          }

          this.focusSearchInput()
        })
      }
    },
    finishInitialization: function () {
      /*
       * Workaround to delay sorting watchers to not reset page to 1 after
       * loading the view.
       *
       * See https://github.com/vuejs/vue/issues/2918#issuecomment-408669914
       */
      setTimeout(() => {
        this.isInitialized = true
      }, 0)
    },
    focusActiveFilter: function (index) {
      this.$nextTick(() => {
        if (this.activeFilters.length) {
          if (index === -1) {
            this.$refs.activeFilters[this.$refs.activeFilters.length - 1]
              .focus()

            return
          }

          if (index >= this.activeFilters.length) {
            this.$refs.activeFilters[0].focus()

            return
          }

          this.$refs.activeFilters[index].focus()
        }
      })
    },
    focusSearchInput: function () {
      if (isDesktopResolution()) {
        this.$refs.searchInput.$refs.search.focus()
      }
    },
    startTyping: function (event) {
      if (event.key.match(/^[ -~]$/g)) {
        this.focusSearchInput()

        this.search = this.search + event.key.toLowerCase()
      }
    },
    ...mapActions({
      fetchFiles: 'files/fetch',
      fetchNextPage: 'files/fetchNextPage',
      emptyFiles: 'files/empty',
      setLastQuery: 'files/setLastQuery',
      unsetLastQuery: 'files/unsetLastQuery'
    })
  },
  watch: {
    sorting: function () {
      if (!this.isInitialized) {
        return
      }

      this.handleSubmit()
    },
    sortingDirection: function () {
      if (!this.isInitialized) {
        return
      }

      this.handleSubmit()
    },
    sortingNamespaces: function () {
      if (!this.isInitialized) {
        return
      }

      this.handleSubmit()
    },
    wantsAdditionalFiles: function (wantsAdditionalFiles) {
      if (
        !isEmpty(this.$route.query) &&
        wantsAdditionalFiles &&
        !this.isLoading &&
        !this.hasReachedLastPage
      ) {
        this.page++

        this.loadFiles(true)
      }
    },
    hasReachedLastPage: function (hasReachedLastPage) {
      if (hasReachedLastPage) {
        if (!(config.countsAreEnabled && this.isCountConfirmed)) {
          this.page = (this.page - 1) > 0 ? this.page - 1 : 1
        }

        this.setLastQuery(this.updateQueryAndGetStrings().queryString)
      }
    },
    hasCompletedInput: function (hasCompletedInput) {
      if (hasCompletedInput) {
        this.hasCompletedInput = false

        this.handleSubmit()
      }
    }
  },
  mounted: function () {
    this.initialize()
  },
  components: {
    FontAwesomeIcon,
    SearchInput,
    Sorting
  }
}
</script>
