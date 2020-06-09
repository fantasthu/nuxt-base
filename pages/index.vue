<template>
    <div class="f-vcc">
      {{ title }}
      <logo />
      <h1 class="title">nuxt-base</h1>
      <h2 class="subtitle">nuxt-base 基础的nuxt工具</h2>
      <div class="links">
        <a href="https://nuxtjs.org/" target="_blank" class="button--green"
          >Documentation</a
        >
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey"
          >GitHub</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Logo from '~/components/Logo.vue'
import API from '~/api/index.js'
export default {
  components: {
    Logo,
  },
  props: {},
  async fetch({ store, params }) {
    await store.commit('skeleton/UPDATE_LOADING', true)
  },
  async asyncData({ store, params, query, req, res, redirect, error }) {
    await API.getName({}).then((_) => {
      console.log('_')
      store.commit('skeleton/UPDATE_LOADING', false)
    })
    // await sleep(2000)
    return {
      fetch: false
      // mydata: data
    }
  },
  data() {
    return { fetch: false }
  },
  computed: {
    ...mapState(['title'])
  },
  watch: {},
  created() {},
  mounted() {
    setTimeout(() => {
      this.fetch = true
    }, 3000)
    console.log('this.muname')
  },
  head() {
    return {
      title: this.title,
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
</script>

<style lang="scss" scoped>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  .content {
  }
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
