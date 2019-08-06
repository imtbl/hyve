module.exports = {
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.scss']
    }
  },
  css: {
    loaderOptions: {
      sass: {
        data: process.env.VUE_APP_HYVE_PRIMARY_COLOR
          ? `$primary: ${process.env.VUE_APP_HYVE_PRIMARY_COLOR};`
          : '$primary: #3449bb;'
      }
    }
  },
  productionSourceMap: false
}
