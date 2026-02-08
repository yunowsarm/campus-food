// 网络请求封装，支持 defHttp.Get / defHttp.Post 调用方式

import { API_BASE_URL, STORAGE_KEYS } from './constants'
import { getStorage } from './storage'

export interface RequestConfig {
  showLoading?: boolean
  loadingText?: string
  /** 为 true 时返回完整响应 { code, message, data }，否则只返回 data */
  isAllRes?: boolean
  /** 为 true 时不弹错误 toast（仅 reject），用于预期内的失败如 404 */
  silentError?: boolean
  header?: Record<string, string>
}

interface RequestOptions extends RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 底层请求方法
 */
function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data,
      header = {},
      showLoading = true,
      loadingText = '加载中...',
      isAllRes = false,
      silentError = false
    } = options

    if (showLoading) {
      uni.showLoading({ title: loadingText, mask: true })
    }

    const token = getStorage<string>(STORAGE_KEYS.TOKEN)
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      url: url.startsWith('http') ? url : `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (showLoading) uni.hideLoading()

        const response = res.data as ResponseData<T>

        if (response.code === 200 || response.code === 0) {
          resolve((isAllRes ? response : response.data) as T)
        } else {
          if (response.code === 401) {
            uni.removeStorageSync(STORAGE_KEYS.TOKEN)
            uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
            uni.reLaunch({ url: '/pages/auth/login' })
          }
          if (!silentError) {
            uni.showToast({ title: response.message || '请求失败', icon: 'none' })
          }
          reject(new Error(response.message || '请求失败'))
        }
      },
      fail: (err) => {
        if (showLoading) uni.hideLoading()
        uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

/**
 * 请求对象：前端使用 defHttp.Get / defHttp.Post / defHttp.Put / defHttp.Delete
 */
export const defHttp = {
  Get: <T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> =>
    request<T>({ url, method: 'GET', data: params, ...config }),

  Post: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> =>
    request<T>({ url, method: 'POST', data, ...config }),

  Put: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> =>
    request<T>({ url, method: 'PUT', data, ...config }),

  Delete: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> =>
    request<T>({ url, method: 'DELETE', data, ...config })
}

// 兼容旧写法：get / post / put / del
export const get = defHttp.Get
export const post = defHttp.Post
export const put = defHttp.Put
export const del = defHttp.Delete

export default defHttp
