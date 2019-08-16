<template>
  <form @submit.prevent="handleSubmit">

    <div class="columns">

      <div class="column is-5-tablet is-6-desktop">

        <div class="field has-addons" v-if="totalCount !== null">
          <div class="control is-expanded">
            <input
              type="text"
              class="input"
              :placeholder="
                'Search for tags containing word…'
                  | formatToConfiguredLetterCase
              "
              v-model="contains"
              v-focus>
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
            <input
              type="text"
              class="input"
              :placeholder="
                'Search for tags containing word…'
                  | formatToConfiguredLetterCase
              "
              v-model="contains"
              v-focus>
          </div>
        </div>

      </div>

      <div class="column is-5-tablet is-4-desktop">
        <sorting
          :sorting.sync="sorting"
          :sortingDirection.sync="sortingDirection" />
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

  </form>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { isEmpty } from 'lodash/lang'
import qs from 'qs'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'
import { ensureValidPage, generateTagsQuery } from '@/util/query'

import Sorting from '@/components/tags/Sorting'

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
    wantsAdditionalTags: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      isInitialized: false,
      contains: '',
      sorting: this.$store.state.settings.tagsSorting,
      sortingDirection: this.$store.state.settings.tagsSortingDirection,
      page: 1,
      useNormalLetterCase: config.useNormalLetterCase
    }
  },
  computed: {
    ...mapState({
      totalCount: state => state.tags.totalCount,
      hasReachedLastPage: state => state.tags.hasReachedLastPage,
      colors: state => state.settings.colors
    }),
    ...mapGetters({
      isCountConfirmed: 'tags/isCountConfirmed'
    })
  },
  methods: {
    initialize: function () {
      if (!isEmpty(this.$route.query)) {
        if (this.$route.query.contains) {
          this.contains = this.$route.query.contains.trim().toLowerCase()
        }

        this.page = ensureValidPage(this.$route.query.page)

        if (
          ['id', 'name', 'files', 'contains', 'random']
            .includes(
              this.$route.query.sort
            )
        ) {
          this.sorting = this.$route.query.sort
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

          this.loadTags(false)
        }

        this.finishInitialization()

        return
      }

      this.emptyTags()
      this.unsetLastQuery()

      this.loadTags(false)

      this.finishInitialization()
    },
    handleSubmit: function () {
      this.page = 1

      this.loadTags(false)
    },
    updateQueryAndGetStrings: function () {
      this.contains = this.contains.trim().toLowerCase()

      const query = generateTagsQuery(
        this.contains,
        this.sorting,
        this.sortingDirection,
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
        path: '/tags',
        query: query
      }).catch(err => {}) // eslint-disable-line handle-callback-err

      return {
        queryString: qs.stringify(query, { addQueryPrefix: true }),
        sanitizedQueryString: qs.stringify(
          sanitizedQuery, { addQueryPrefix: true }
        )
      }
    },
    loadTags: function (fetchNextPage) {
      const queryStrings = this.updateQueryAndGetStrings()

      this.setLastQuery(queryStrings.queryString)

      if (fetchNextPage) {
        this.fetchNextPage(queryStrings.sanitizedQueryString)

        return
      }

      this.fetchTags(queryStrings.sanitizedQueryString)
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
    ...mapActions({
      fetchTags: 'tags/fetch',
      fetchNextPage: 'tags/fetchNextPage',
      emptyTags: 'tags/empty',
      setLastQuery: 'tags/setLastQuery',
      unsetLastQuery: 'tags/unsetLastQuery'
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
    wantsAdditionalTags: function (wantsAdditionalTags) {
      if (
        !isEmpty(this.$route.query) &&
        wantsAdditionalTags &&
        !this.isLoading &&
        !this.hasReachedLastPage
      ) {
        this.page++

        this.loadTags(true)
      }
    },
    hasReachedLastPage: function (hasReachedLastPage) {
      if (hasReachedLastPage) {
        if (!(config.countsAreEnabled && this.isCountConfirmed)) {
          this.page = (this.page - 1) > 0 ? this.page - 1 : 1
        }

        this.setLastQuery(this.updateQueryAndGetStrings().queryString)
      }
    }
  },
  mounted: function () {
    this.initialize()
  },
  components: {
    FontAwesomeIcon,
    Sorting
  }
}
</script>
