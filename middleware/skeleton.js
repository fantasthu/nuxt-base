export default function({ store, route }) {
  let skeletonData = null

  if (route.name.includes('index') !== -1) skeletonData = 'page-index-skeleton'
  else if (route.name.includes('test') !== -1)
    skeletonData = 'page-two-skeleton'

  store.commit('skeleton/UPDATE_SKELETON', skeletonData)
}
