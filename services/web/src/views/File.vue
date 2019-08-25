<template>
  <div class="wrapper">

    <vue-headful :title="title | formatToConfiguredLetterCase" />

    <div class="container-fluid" v-if="!error.name">

      <section class="section" v-if="isLoading">
        <span class="icon is-large has-text-primary">
          <font-awesome-icon icon="spinner" class="fa-pulse fa-2x" />
        </span>
      </section>

      <section class="file-detail section" v-if="!isLoading && file">

        <media :query="{ maxWidth: 1087 }">
          <controls
            :file="file"
            :canPreserveScrollPosition="canPreserveScrollPosition" />
        </media>

        <div class="columns is-desktop has-reverse-column-order">

          <div class="column">

            <file-image
              :url="preparedMediaUrl"
              :width="file.width"
              :height="file.height"
              v-if="type === 'image'" />

            <file-video
              :url="preparedMediaUrl"
              :posterUrl="preparedThumbnailUrl"
              :mime="file.mime"
              v-if="type === 'video'" />

            <div class="content" v-if="type === 'unsupported'">
              <p>
                {{ appTitle }} does not support this MIME type.<br>
                You can download the file to view it locally.
              </p>
              <p>
                <a
                  class="button is-primary"
                  :href="preparedMediaUrl"
                  target="_blank"
                  :download="file.hash | addFileExtension(file.mime)">
                  Download file {{ file.id }}
                </a>
              </p>
            </div>

          </div>

          <div class="file-detail-info column is-4-desktop">

            <media :query="{ minWidth: 1087 }">
              <controls
                :file="file"
                :canPreserveScrollPosition="canPreserveScrollPosition" />
            </media>

            <info
              :file="file"
              :type="type"
              :tags="tags"
              :preparedMediaUrl="preparedMediaUrl" />

          </div>

        </div>

      </section>

    </div>

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Media from 'vue-media'

import config from '@/config'
import { generateDefaultFilesQuery } from '@/util/query'
import { getTagColor } from '@/util/tags'
import { prepareMediaUrl } from '@/util/url'

import Info from '@/components/file/Info'
import Controls from '@/components/file/Controls'
import FileImage from '@/components/file/Image'
import FileVideo from '@/components/file/Video'

export default {
  name: 'File',
  data: function () {
    return {
      canPreserveScrollPosition: true,
      appTitle: config.title,
      title: `File ${this.$route.params.id} – ${config.title}`
    }
  },
  computed: {
    type: function () {
      if (
        ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'].includes(
          this.file.mime
        )
      ) {
        return 'image'
      }

      if (['video/mp4', 'video/webm'].includes(this.file.mime)) {
        return 'video'
      }

      return 'unsupported'
    },
    tags: function () {
      const tags = []

      for (const tag of this.sortedDetailItemTags) {
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
    preparedMediaUrl: function () {
      return prepareMediaUrl(this.file.mediaUrl)
    },
    preparedThumbnailUrl: function () {
      return prepareMediaUrl(this.file.thumbnailUrl)
    },
    ...mapState({
      file: state => state.files.detailItem,
      isLoading: state => state.files.isLoading,
      lastDetailId: state => state.files.lastDetailId,
      colors: state => state.settings.colors,
      sorting: state => state.settings.sorting,
      sortingNamespaces: state => state.settings.sortingNamespaces,
      error: state => state.error
    }),
    ...mapGetters({
      sortedDetailItemTags: 'files/sortedDetailItemTags'
    })
  },
  methods: {
    loadFile: function () {
      this.setLastDetailId(this.$route.params.id)
      this.fetchDetail(this.$route.params.id)
    },
    changeFile: function () {
      if (document.querySelector('.pswp--open')) {
        this.$photoswipe.close()
      }

      this.canPreserveScrollPosition = false
      this.title = `file ${this.$route.params.id} – ${config.title}`

      this.loadFile()
    },
    ...mapActions({
      setLastDetailId: 'files/setLastDetailId',
      fetchDetail: 'files/fetchDetail'
    })
  },
  watch: {
    '$route': 'changeFile'
  },
  mounted: function () {
    if (this.$route.params.id !== this.lastDetailId) {
      this.loadFile()
    }
  },
  beforeRouteLeave: function (to, from, next) {
    if (document.querySelector('.pswp--open')) {
      this.$photoswipe.close()
    }

    next()
  },
  components: {
    FontAwesomeIcon,
    Media,
    Info,
    Controls,
    FileImage,
    FileVideo
  }
}
</script>
