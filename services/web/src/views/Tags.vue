<template>
  <div
    class="wrapper"
    :class="{ 'has-scroll-to-top-bar': showScrollToTopBar }">

    <vue-headful :title="title | formatToConfiguredLetterCase" />

    <section class="section">

      <search
        :isLoading="isLoading"
        :lastQuery="lastQuery"
        :wantsAdditionalTags="wantsAdditionalTags" />

      <hr id="results-separator">

      <div class="table-container" v-if="formattedTags.length">

        <table class="table is-fullwidth is-striped is-hoverable">

          <thead>
            <tr>
              <th class="is-fullwidth">Tag</th>
              <th>Files</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="tag in formattedTags" :key="tag.name">
              <td class="is-fullwidth">
                <router-link
                  :to="{ path: tag.path, query: tag.query }"
                  :style="{ color: tag.color }">
                  {{ tag.name }}
                </router-link>
              </td>
              <td>{{ tag.fileCount | formatNumber }}</td>
            </tr>

          </tbody>

        </table>

      </div>

      <p v-if="!isLoading && !formattedTags.length && !lastQuery">
        No search started.
      </p>

      <p v-if="!isLoading && !formattedTags.length && lastQuery">
        No tags found.
      </p>

      <div class="has-text-centered" v-if="isLoading">
        <span class="icon is-large has-text-primary">
          <font-awesome-icon icon="spinner" class="fa-pulse fa-2x" />
        </span>
      </div>

    </section>

    <media :query="{ minWidth: 1088 }" v-if="showScrollToTopBar">
      <scroll-to-top-bar />
    </media>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import throttle from 'lodash/throttle'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Media from 'vue-media'

import config from '@/config'
import { generateDefaultFilesQuery } from '@/util/query'
import { getTagColor } from '@/util/tags'
import {
  isPageScrolledPastElement, isBottomOfPageVisible
} from '@/util/visibility'

import Search from '@/components/tags/Search'
import ScrollToTopBar from '@/components/general/ScrollToTopBar'

let scrollListener

export default {
  name: 'Tags',
  data: function () {
    return {
      wantsAdditionalTags: false,
      showScrollToTopBar: false,
      title: `Tags – ${config.title}`
    }
  },
  computed: {
    formattedTags: function () {
      const tags = []

      for (const tag of this.tags) {
        tags.push({
          name: tag.name,
          path: '/files',
          query: generateDefaultFilesQuery(tag.name),
          color: getTagColor(tag.name, this.colors),
          fileCount: tag.fileCount
        })
      }

      return tags
    },
    ...mapState({
      tags: state => state.tags.items,
      isLoading: state => state.tags.isLoading,
      lastQuery: state => state.tags.lastQuery,
      colors: state => state.settings.colors
    })
  },
  mounted: function () {
    this.showScrollToTopBar = isPageScrolledPastElement('results-separator')

    scrollListener = throttle(() => {
      this.wantsAdditionalTags = isBottomOfPageVisible(88)
      this.showScrollToTopBar = isPageScrolledPastElement('results-separator')
    }, 50)

    window.addEventListener(
      'scroll',
      scrollListener,
      {
        capture: true,
        passive: true
      }
    )
  },
  beforeRouteLeave: function (to, from, next) {
    window.removeEventListener(
      'scroll',
      scrollListener,
      {
        capture: true,
        passive: true
      }
    )

    next()
  },
  components: {
    FontAwesomeIcon,
    Media,
    Search,
    ScrollToTopBar
  }
}
</script>
