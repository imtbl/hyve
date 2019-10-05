<template>
  <div class="file-video">
    <video :poster="posterUrl" id="video-player" playsinline controls loop>
      <source :src="url" :type="mime">
    </video>
  </div>
</template>

<script>
import Plyr from 'plyr/'

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
  mounted: function () {
    this.player = new Plyr('#video-player', {
      iconUrl: 'plyr.svg'
    })
  }
}
</script>
