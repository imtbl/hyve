<template>
  <div class="settings-video-autoplay">
    <div class="field">
      <input
        type="checkbox"
        class="switch"
        id="settings-video-autoplay"
        v-model="localAutoplayVideos">
      <label for="settings-video-autoplay">
        Autoplay videos
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoAutoplay',
  props: {
    autoplayVideos: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    localAutoplayVideos: {
      get: function () {
        return this.autoplayVideos
      },
      set: function (localAutoplayVideos) {
        this.$emit('update:autoplayVideos', localAutoplayVideos)
      }
    }
  }
}
</script>
