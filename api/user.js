import request from '~/assets/js/axios'

export default {
  getName(params) {
    return request.get('/getName', params)
  }
}
