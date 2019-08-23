<template>
  <div class="tag-cloud">
    <ul>
      <template v-for="tag in formattedTags">
        <li :key="tag.name">
          <router-link
            :to="{ path: tag.path, query: tag.query }"
            :style="{ 'font-size': tag.fontSize, color: tag.color }">
            {{ tag.name }}
          </router-link>
        </li>{{ ' ' }}
      </template>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { generateDefaultFilesQuery } from '@/util/query'
import { getTagColor } from '@/util/tags'

export default {
  name: 'TagCloud',
  computed: {
    formattedTags: function () {
      const counts = []

      for (const tag of this.tags) {
        counts.push(tag.fileCount)
      }

      const minCount = Math.min.apply(null, counts)
      const maxCount = Math.max.apply(null, counts)

      let step = Math.floor((maxCount - minCount) / 4)
      step = step > 1 ? step : 1

      const sizes = new Map([
        [2, maxCount],
        [1.75, step * 4],
        [1.5, step * 3],
        [1.25, step * 2],
        [1, step]
      ])

      const tags = []

      for (const tag of this.tags) {
        let fontSize = 0.75

        for (const [size, count] of sizes) {
          if (tag.fileCount >= count) {
            fontSize = size

            break
          }
        }

        tags.push({
          name: tag.name,
          path: '/files',
          query: generateDefaultFilesQuery(tag.name),
          color: getTagColor(tag.name, this.colors),
          fontSize: `${fontSize}em`
        })
      }

      for (let i = tags.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))

        ;[tags[i], tags[j]] = [tags[j], tags[i]]
      }

      return tags
    },
    ...mapState({
      tags: state => state.tags.mostUsed,
      colors: state => state.settings.colors
    })
  }
}
</script>
