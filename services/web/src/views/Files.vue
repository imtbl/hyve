<template>
  <div
    class="wrapper"
    :class="{ 'has-scroll-to-top-bar': showScrollToTopBar }">

    <vue-headful :title="title | formatToConfiguredLetterCase" />

    <section class="section">

      <search
        :isLoading="isLoading"
        :lastQuery="lastQuery"
        :wantsAdditionalFiles="wantsAdditionalFiles" />

      <hr id="results-separator">

      <div class="columns is-multiline is-mobile" v-if="files.length">

        <div
          class="
            column is-6-mobile
            is-3-tablet is-2-desktop
            is-one-eight-large-desktop
            is-one-tenth-huge-desktop
          "
          v-for="(file, index) in files"
          :key="index">
          <div class="file-search-preview">
            <div class="file-search-preview-image">
              <img :src="preparedThumbnailUrls[index]">
            </div>
            <router-link
              :to="`/files/${file.id}`"
              class="file-search-preview-link">
              View file
            </router-link>
            <div class="file-search-preview-gallery-button">
              <span class="icon is-large">
                <font-awesome-icon icon="images" class="fa-2x" />
              </span>
              <img
                class="preview-img-item"
                :src="preparedThumbnailUrls[index]"
                @click="$photoswipe.open(index, galleryItems)">
            </div>
          </div>
        </div>

      </div>

      <p v-if="!isLoading && !files.length && !lastQuery">No search started.</p>

      <p v-if="!isLoading && !files.length && lastQuery">No files found.</p>

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
import urlFormatter from '@/util/url-formatter'
import visibilityHelper from '@/util/visibility-helper'

import Search from '@/components/files/Search'
import ScrollToTopBar from '@/components/general/ScrollToTopBar'

let scrollListener

export default {
  name: 'Files',
  data: function () {
    return {
      wantsAdditionalFiles: false,
      showScrollToTopBar: false,
      title: `Files – ${config.title}`
    }
  },
  computed: {
    galleryItems: function () {
      const galleryItems = []

      for (const file of this.files) {
        if (this.isImage(file.mime)) {
          galleryItems.push({
            src: urlFormatter.prepareMediaUrl(file.mediaUrl),
            w: file.width,
            h: file.height
          })

          continue
        }

        galleryItems.push({
          html: `
            <div class="gallery-mode-notice">
              <p>
                This file cannot be displayed in gallery mode.<br>
                Please go to the <a href="#/files/${file.id}">detail view</a>
                instead.
              </p>
            </div>
          `
        })
      }

      return galleryItems
    },
    preparedThumbnailUrls: function () {
      const preparedThumbnailUrls = []

      for (const file of this.files) {
        preparedThumbnailUrls.push(
          urlFormatter.prepareMediaUrl(file.thumbnailUrl)
        )
      }

      return preparedThumbnailUrls
    },
    ...mapState({
      files: state => state.files.items,
      isLoading: state => state.files.isLoading,
      lastQuery: state => state.files.lastQuery
    })
  },
  methods: {
    isImage: function (mime) {
      return ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'].includes(
        mime
      )
    },
    prepareMediaUrl: function (url) {
      return urlFormatter.prepareMediaUrl(url)
    }
  },
  mounted: function () {
    this.showScrollToTopBar = visibilityHelper.isPageScrolledPastElement(
      'results-separator'
    )

    scrollListener = throttle(() => {
      this.wantsAdditionalFiles = visibilityHelper.isBottomOfPageVisible(88)
      this.showScrollToTopBar = visibilityHelper.isPageScrolledPastElement(
        'results-separator'
      )
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

    if (document.querySelector('.pswp--open')) {
      this.$photoswipe.close()
    }

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
