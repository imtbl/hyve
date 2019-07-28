<template>
  <nav class="file-detail-controls level is-mobile" v-hotkey="keymap">

    <div class="level-left">

      <div class="file-detail-back">
        <a class="has-text-primary" @click="goBackToList">
          <span class="icon is-medium">
            <font-awesome-icon
              icon="long-arrow-alt-left"
              class="fa-2x" />
          </span>
        </a>
      </div>

    </div>

    <div
      class="level-right"
      v-if="file && (navigation.previous || navigation.next)">

      <div class="file-detail-navigation">

        <div class="file-detail-navigation-item" v-if="navigation.previous">
          <router-link
            :to="`/files/${navigation.previous}`"
            class="has-text-primary">
            <span class="icon is-medium">
              <font-awesome-icon icon="arrow-left" class="fa-2x" />
            </span>
          </router-link>
        </div>

        <div class="file-detail-navigation-item" v-if="navigation.next">
          <router-link
            :to="`/files/${navigation.next}`"
            class="has-text-primary">
            <span class="icon is-medium">
              <font-awesome-icon icon="arrow-right" class="fa-2x" />
            </span>
          </router-link>
        </div>

      </div>

    </div>

  </nav>
</template>

<script>
import { mapState } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'Controls',
  props: {
    file: {
      type: Object,
      required: true
    },
    canPreserveScrollPosition: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    navigation: function () {
      if (!this.file) {
        return null
      }

      const navigation = {
        previous: null,
        next: null
      }

      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].id === this.file.id) {
          if (i !== 0) {
            navigation.previous = this.files[i - 1].id
          }

          if (i !== (this.files.length - 1)) {
            navigation.next = this.files[i + 1].id
          }

          break
        }
      }

      return navigation
    },
    keymap: function () {
      return {
        left: this.goToPreviousFile,
        right: this.goToNextFile
      }
    },
    ...mapState({
      files: state => state.files.items,
      lastFilesQuery: state => state.files.lastQuery
    })
  },
  methods: {
    goToPreviousFile: function () {
      if (
        !(this.navigation && this.navigation.previous) ||
        (document.querySelector('.pswp--open'))
      ) {
        return
      }

      this.$router.push(`/files/${this.navigation.previous}`)
    },
    goToNextFile: function () {
      if (
        !(this.navigation && this.navigation.next) ||
        (document.querySelector('.pswp--open'))
      ) {
        return
      }

      this.$router.push(`/files/${this.navigation.next}`)
    },
    goBackToList: function () {
      if (this.lastFilesQuery) {
        if (this.canPreserveScrollPosition) {
          this.$router.go(-1)

          return
        }

        this.$router.push(`/files/${this.lastFilesQuery}`)

        return
      }

      this.$router.push('/files')
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
