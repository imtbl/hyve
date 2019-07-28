<template>
  <div class="wrapper">

    <vue-headful :title="title | formatToConfiguredLetterCase" />

    <section class="section">
      <div class="container">
        <h1 class="title has-text-primary has-text-centered">{{ title }}</h1>
        <h2
          class="subtitle has-text-centered"
          v-if="subtitle"
          v-html="subtitle"></h2>
        <search v-if="isAuthorized  || !isAuthenticationRequired" />
      </div>
    </section>

    <section class="section">

      <div class="container">

        <div class="content has-text-centered">

          <p v-if="isAuthorized || !isAuthenticationRequired">
            <strong>{{ api.fileCount | formatNumber }}</strong> Files
            |
            <strong>{{ api.tagCount | formatNumber }}</strong> Tags
          </p>

          <p>
            <span>Running version <code>{{ version }}</code></span>
            <br>
            <span v-if="api.isAvailable">
              Connected to API version <code>{{ api.apiVersion }}</code>
            </span>
          </p>

        </div>

      </div>

    </section>

  </div>
</template>

<script>
import { mapState } from 'vuex'

import config from '@/config'

import Search from '@/components/home/Search'

export default {
  name: 'Home',
  props: {
    isAuthorized: {
      type: Boolean,
      required: true
    },
    isAuthenticationRequired: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      version: config.version,
      title: config.title,
      subtitle: config.subtitle
    }
  },
  computed: {
    ...mapState({
      api: state => state.api
    })
  },
  components: {
    Search
  }
}
</script>
