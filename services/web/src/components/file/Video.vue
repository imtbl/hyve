<template>
  <div class="file-detail-video">
    <video
      :poster="posterUrl"
      id="video-player"
      :class="{ 'is-restricted-to-viewport': restrictMediaSize }">
      playsinline
      controls
      loop>
      <source :src="url" :type="mime">
    </video>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Plyr from 'plyr'

export default {
  name: 'FileVideo',
  data: function () {
    return {
      player: null
    }
  },
  props: {
    url: {
      type: String,
      required: true
    },
    posterUrl: {
      type: String,
      required: true
    },
    mime: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState({
      restrictMediaSize: state => state.settings.restrictMediaSize
    })
  },
  mounted: function () {
    this.player = new Plyr('#video-player', {
      iconUrl: 'plyr.svg'
    })
  }
}
</script>
