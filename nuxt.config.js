const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: 5 })

module.exports = {
  /*
   ** 同时支持单页和服务端渲染模式的开发
   */

  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** 定义顶部loading条的颜色
   */
  loading: { color: 'red' },
  /*
   ** 添加全局 CSS
   */
  css: ['~/assets/css/main.css'],
  /*
   ** 添加插件(比如引入外部的elementui等)
   */
  plugins: ['~/plugins/vue-inject.js'],
  router: {
    middleware: ['skeleton']
  },
  /*
   **添加开发阶段 Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module'
  ],
  /*
   ** 添加 Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa'],
  pwa: {
    manifest: {
      display: 'browser',
      name: 'PWA Chapter01 Demo',
      short_name: 'Chapter01 Demo',
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      start_url: '/index.html',
      display: 'standalone',
      background_color: '#fff',
      theme_color: 'red'
    },
    workbox: {
      dev: false,
      cachingExtensions: '@/plugins/workbox-range-request.js'
      // runtimeCaching: [
      //   {
      //     strategyOptions: {
      //       cacheName: 'our-cache',
      //       cacheExpiration: {
      //         maxEntries: 10,
      //         maxAgeSeconds: 300
      //       }
      //     }
      //   }
      // ]
    }
  },
  env: {
    baseUrl: process.env.BASE_URL
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     * postcss 继承
     */
    postcss: {
      plugins: {
        'postcss-aspect-ratio-mini': {},
        'postcss-cssnext': {},
        cssnano: {
          autoprefixer: false,
          'postcss-zindex': false
        },
        'postcss-preset-env': {
          browsers: 'last 2 versions'
        },
        'postcss-aspect-ratio-mini': {},
        'postcss-px-to-viewport': {
          viewportWidth: 750, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
          viewportHeight: 1334, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
          unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数
          viewportUnit: 'vw', //指定需要转换成的视窗单位，建议使用vw
          selectorBlackList: ['.ignore'], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
          minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
          mediaQuery: false // 允许在媒体查询中转换`px`,
        }
      }
    },
    terser: {
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    },
    plugins: [
      new HappyPack({
        id: 'babelLoader',
        threadPool: happyThreadPool,
        loaders: ['babel-loader']
      })
    ],
    /*
     ** 添加自定义的webpack配置
     */
    extend(config, ctx) {}
  }
}
