<template>
  <div class="settings-media-size has-margin-bottom">
    <div class="field">
      <input
        type="checkbox"
        class="switch"
        id="settings-media-size"
        v-model="localRestrictMediaSize">
      <label for="settings-media-size">
        Restrict media size in file detail view to viewport
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MediaSize',
  props: {
    restrictMediaSize: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    localRestrictMediaSize: {
      get: function () {
        return this.restrictMediaSize
      },
      set: function (localRestrictMediaSize) {
        this.$emit('update:restrictMediaSize', localRestrictMediaSize)
      }
    }
  }
}
</script>
