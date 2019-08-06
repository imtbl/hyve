<template>
  <div class="settings-colors has-margin-bottom">

    <div class="table-container">

      <table class="table is-fullwidth is-striped is-hoverable">

        <thead>
          <tr>
            <th class="is-fullwidth">Namespace</th>
            <th>Color</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="namespace in localColors" :key="namespace.name">
            <td class="is-fullwidth" :style="{ color: namespace.color }">
              {{ namespace.name }}
            </td>
            <td>
              <color-picker v-model="namespace.color" />
            </td>
          </tr>
        </tbody>

      </table>

    </div>

  </div>
</template>

<script>
import { VueColorpicker } from 'vue-pop-colorpicker/src'

export default {
  name: 'Colors',
  props: {
    colors: {
      type: Array,
      required: true
    }
  },
  computed: {
    localColors: {
      get: function () {
        return this.colors
      },
      set: function (localColors) {
        this.$emit('update:colors', localColors)
      }
    }
  },
  components: {
    'color-picker': VueColorpicker
  }
}
</script>
