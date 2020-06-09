import axios from 'axios'
console.log('process.env.baseUrl', process.env.baseUrl)

const service = axios.create({
  baseURL: process.env.baseUrl,
  timeout: 10000
})

// request 拦截器
service.interceptors.request.use(
  config => {
    // 配置header
    // config.headers['X-Request-Token'] = 'testToken'
    // config.headers['X-Request-Sys'] = '0'
    return config
  },
  error => {
    return Promise.resolve({
      code: error.code,
      message: error.message || JSON.stringify(error)
    })
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 错误码处理
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('error', error.message)
    return Promise.resolve({
      code: error.status || 500,
      message: error.message || JSON.stringify(error)
    })
  }
)

export default service
