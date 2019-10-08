module.exports = {
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.scss']
    }
  },
  css: {
    loaderOptions: {
      sass: {
        data:
          process.env.VUE_APP_HYVE_PRIMARY_COLOR &&
          process.env.VUE_APP_HYVE_PRIMARY_COLOR_DARK
            ? `$primary: ${process.env.VUE_APP_HYVE_PRIMARY_COLOR};` +
              `$dark-theme-primary: ${process.env.VUE_APP_HYVE_PRIMARY_COLOR_DARK};`
            : process.env.VUE_APP_HYVE_PRIMARY_COLOR
              ? `$primary: ${process.env.VUE_APP_HYVE_PRIMARY_COLOR};` +
                `$dark-theme-primary: #500ea5;`
              : process.env.VUE_APP_HYVE_PRIMARY_COLOR_DARK
                ? `$primary: #3449bb;` +
                  `$dark-theme-primary: ${process.env.VUE_APP_HYVE_PRIMARY_COLOR_DARK};`
                : `$primary: #3449bb;` +
                  `$dark-theme-primary: #500ea5;`
      }
    }
  },
  productionSourceMap: false
}
