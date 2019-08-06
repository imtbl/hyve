<template>
  <div class="wrapper">

    <section class="section has-text-centered">
      <div class="container">
        <span class="icon is-large has-text-primary">
          <font-awesome-icon icon="spinner" class="fa-pulse fa-3x" />
        </span>
      </div>
    </section>

  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'Spinner',
  components: {
    FontAwesomeIcon
  }
}
</script>
