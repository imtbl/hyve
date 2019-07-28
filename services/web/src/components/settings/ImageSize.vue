<template>
  <div class="settings-image-size has-margin-bottom">
    <div class="field">
      <input
        type="checkbox"
        class="switch"
        id="settings-image-size"
        v-model="localRestrictImageSize">
      <label for="settings-image-size">
        Restrict image size in file detail view to viewport
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSize',
  props: {
    restrictImageSize: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    localRestrictImageSize: {
      get: function () {
        return this.restrictImageSize
      },
      set: function (localRestrictImageSize) {
        this.$emit('update:restrictImageSize', localRestrictImageSize)
      }
    }
  }
}
</script>
