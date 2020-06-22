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
        <search v-if="isAuthorized || !isAuthenticationRequired" />
      </div>
    </section>

    <section
      class="section"
      v-if="
        showTagCloud &&
        (isAuthorized || !isAuthenticationRequired) &&
        mostUsedTags.length
      ">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-8-tablet is-6-desktop has-text-centered">
            <tag-cloud />
          </div>
        </div>
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

          <p>
            <span>
              <a
                href="https://github.com/imtbl/hyve"
                target="_blank"
                rel="noopener">
                hyve
              </a>
              is free software released under the
              <span class="is-normal-case">AGPLv3</span>.
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
import TagCloud from '@/components/home/TagCloud'

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
      subtitle: config.subtitle,
      showTagCloud: config.showTagCloud
    }
  },
  computed: {
    ...mapState({
      api: state => state.api,
      mostUsedTags: state => state.tags.mostUsed
    })
  },
  components: {
    Search,
    TagCloud
  }
}
</script>
