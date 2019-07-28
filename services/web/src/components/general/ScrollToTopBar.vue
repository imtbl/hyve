<template>
  <div class="scroll-to-top-bar">
    <button class="button is-primary" @click="scrollToTop">
      <span class="icon is-medium">
        <font-awesome-icon icon="arrow-up" class="fa-lg" />
      </span>
    </button>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'ScrollToTopBar',
  methods: {
    scrollToTop: function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
