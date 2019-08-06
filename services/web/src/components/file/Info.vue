<template>
  <div class="frame">

    <ul class="file-detail-meta">
      <li><strong>ID:</strong> {{ file.id }}</li>
      <li><strong>Type:</strong> {{ type }}</li>
      <li><strong>MIME:</strong> {{ file.mime }}</li>
      <li><strong>Width:</strong> {{ file.width | formatNumber }} px</li>
      <li><strong>Height:</strong> {{ file.height | formatNumber }} px</li>
      <li>
        <strong>Size:</strong>
        <span class="is-normal-case"> {{ file.size | formatFileSize }}</span>
      </li>
    </ul>

    <ul class="file-detail-tags has-margin-top" v-if="tags.length">
      <li v-for="tag in tags" :key="tag.name">
        <router-link
          :to="{ path: tag.path, query: tag.query }"
          :style="{ color: tag.color }">
          {{ tag.name }}
          <small class="file-amount">{{ tag.fileCount | formatNumber }}</small>
        </router-link>
      </li>
    </ul>

    <div class="file-detail-actions has-margin-top">
      <p>
        <a
          class="button is-primary"
          :href="preparedMediaUrl"
          target="_blank"
          :download="file.hash | addFileExtension(file.mime)">
          Download
        </a>
      </p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Info',
  props: {
    file: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    tags: {
      type: Array,
      required: true
    },
    preparedMediaUrl: {
      type: String,
      required: true
    }
  },
  filters: {
    formatFileSize: function (bytes) {
      if (!bytes) {
        return ''
      }

      const sizes = [
        'Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'
      ]
      const i = Math.floor(Math.log(bytes) / Math.log(1024))

      return parseFloat(
        (bytes / Math.pow(1024, i)).toFixed(2)
      ).toLocaleString() + ` ${sizes[i]}`
    }
  }
}
</script>
