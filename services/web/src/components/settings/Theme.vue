<template>
  <div class="settings-theme has-margin-bottom">

    <div class="field" v-for="option in themeOptions" :key="option.id">
      <input
        type="radio"
        class="is-checkradio is-aligned"
        :id="`theme-${option.id}`"
        :value="option.value"
        v-model="localTheme">
      <label :for="`theme-${option.id}`">{{ option.label }}</label>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Theme',
  props: {
    theme: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      themeOptions: [
        {
          id: 'default',
          value: 'default',
          label: 'Default (browser-controlled)'
        },
        {
          id: 'light',
          value: 'light',
          label: 'Light'
        },
        {
          id: 'dark',
          value: 'dark',
          label: 'Dark'
        }
      ]
    }
  },
  computed: {
    localTheme: {
      get: function () {
        return this.theme
      },
      set: function (localTheme) {
        this.$emit('update:theme', localTheme)
      }
    }
  }
}
</script>
