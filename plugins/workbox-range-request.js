// 解决PWA 在safari下视频不能播放的问题

/* eslint-disable */
workbox.routing.registerRoute(
  /.*\.(mp4|webm)/,
  workbox.strategies.cacheFirst({
    plugins: [new workbox.rangeRequests.Plugin()]
  }),
  'GET'
)
/* eslint-disable */
