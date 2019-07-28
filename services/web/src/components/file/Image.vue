<template>
  <div
    class="file-detail-image"
    :class="{ 'is-restricted-to-viewport': restrictImageSize }">
    <img
      class="preview-img-item"
      :src="url"
      @click="$photoswipe.open(0, [{ src: url, w: width, h: height }])">
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FileImage',
  props: {
    url: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  computed: {
    ...mapState({
      restrictImageSize: state => state.settings.restrictImageSize
    })
  }
}
</script>
