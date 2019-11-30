<template>
  <div class="settings-video-loop has-margin-bottom">
    <div class="field">
      <input
        type="checkbox"
        class="switch"
        id="settings-video-loop"
        v-model="localLoopVideos">
      <label for="settings-video-loop">
        Loop videos
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoLoop',
  props: {
    loopVideos: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    localLoopVideos: {
      get: function () {
        return this.loopVideos
      },
      set: function (localLoopVideos) {
        this.$emit('update:loopVideos', localLoopVideos)
      }
    }
  }
}
</script>
