# nuxt-base

> nuxt-base 基础的 nuxt 工具

## 使用前须知

- 1.分清楚是否需要服务端渲染,如果不需要不要使用`asyncData`和`fetch`生命周期函数
  - 可以当做一般的单页应用的 vue 项目去写即可
- 2.`generate`是生成静态页面,`yarn build && yarn start` 流程才是走的服务端渲染

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate

# 服务端渲染部署,使用pm2 监控服务
$ yarn ss
```

## 包含内容

- 1.引入外部 `axios` api
- 2.引入全局的 main.css 包括了全局的 `page 过渡`和 `flex 工具 css`
  [具体的 page 过渡效果参考](https://zh.nuxtjs.org/examples/routes-transitions/)
- 3.引入了自己抽取重写的获取 `dom 工具 fantast`
- 4.使用了 `pwa`(注入了解决 ios 不能播放视频的问题)
- 5.引入了 `store` 在 nuxt 中的正确使用方式,fetch 中同步使用
- 6.husky 和 lint-staged 结合使用,加入 commit 之前的`eslint`检查工具`prettier` --write 自动修复功能

  ```javascript
   "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "**/*.{js,vue}": [
      "eslint",
      "prettier --write"
    ]
  },
  ```

- 7.加入了 postcss 相关插件(挑主要几款说)

  - postcss-px-to-viewport 通过美术尺寸修改为 vw 的方案
  - postcss-preset-env 添加游戏前缀
  - cssnano css 压缩去重优化
  - postcss-cssnext 使用 css 的一些新特性

- 8.生产环境中移除 console.log (添加在 build 中)
  ```javascript
  terser: {
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
  ```
- 9.pm2 管理上线的 server
  [难点问题](https://github.com/Unitech/pm2/issues/325)
  ```javascript
    "ss": "cross-env PORT=10010 yarn install&&yarn build&& pm2 start npm --only --name 'nuxt-base' -i 2 -- run start"
  ```

- 10.增加了 happypack 加快打包速度

- 11.使用 cross-env 注入环境变量

- 12.使用 vue-content-loading svg 组件为基础建立的 skeleton

## 注意事项
- 有时候yarn dev开启的服务会一直loading,这时候考虑unregister控制台里面的application中pwa应用
- .gitignore 配置不起作用的时候执行`git rm --cached .`

- 在 `fetch` 中使用 store 一定要使用 async await 同步执行,否则不能及时获取到 `store` 中的数据
- `asyncData` 和 `fetch` 都是在服务端执行的,所有初次打印在命令行工具中,后续路由跳转会打印在浏览器控制台
- 在页面中引入自定义 head

  ```javascript
   head () {
    return {
      title: this.title,
      meta: [
        { hid: 'description', name: 'description', content: 'My custom description' }
      ],
      script: [
        {
          src: 'https://cdn.staticfile.org/jquery/3.5.1/jquery.js',
          async: true,
          defer: true
        }
      ]
    }
  }
  ```

  - 组件内部方法的使用顺序需要注意

  ```javascript
  export default {
    components: {
      Logo
    },
    props: {},
    async fetch({ store, params }) {},
    async asyncData({ store, params, query, req, res, redirect, error }) {
      return {}
    },
    data() {
      return {}
    },
    computed: {
      ...mapState([])
    },
    watch: {},
    created() {},
    mounted() {},
    head() {
      return {
        title: 'custom title',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'My custom description'
          }
        ]
      }
    }
  }
  ```

  ### 官方文档

  `assets` 相关官方文档 [the documentation](https://nuxtjs.org/guide/assets#webpacked).

  `layout` 相关官方文档 [the documentation](https://nuxtjs.org/guide/views#layouts).

  `middleware` 相关官方文档 [the documentation](https://nuxtjs.org/guide/routing#middleware).

  `page` 相关官方文档 [the documentation](https://nuxtjs.org/guide/routing).

  `plugin` 相关官方文档 [the documentation](https://nuxtjs.org/guide/plugins).

  `static` 相关官方文档[the documentation](https://nuxtjs.org/guide/assets#static).

  `store` 相关官方文档[the documentation](https://nuxtjs.org/guide/vuex-store).
