<template>
  <div class="wrapper">

    <section class="section">

      <div class="container">

        <article class="message is-danger">

          <div class="message-header">
            <p>{{ error.name }}</p>
          </div>

          <div class="message-body">
            <p v-html="error.message"></p>
          </div>

        </article>

      </div>

    </section>

  </div>
</template>

<script>
export default {
  name: 'Error',
  props: {
    error: {
      type: Object,
      required: true
    }
  }
}
</script>
