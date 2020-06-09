<template>
  <div>
    <component :is="skeletonData" v-if="page_loading"></component>
    <nuxt v-else />
  </div>
</template>
<script>
import pageIndexSkeleton from '@/components/page-index-skeleton'
import pageTwoSkeleton from '@/components/page-two-skeleton'
export default {
  components: { pageIndexSkeleton, pageTwoSkeleton },
  computed: {
    skeletonData() {
      return this.$store.state.skeleton.skeletonData
    },
    page_loading() {
      return this.$store.state.skeleton.page_loading
    }
  }
}
</script>
<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
</style>
