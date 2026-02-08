// 上传接口 - 对应后端 /api/upload

import { API_BASE_URL } from '../utils/constants'
import { getStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'

export interface UploadSingleResult {
  url: string
  filename: string
}

/**
 * 单文件上传（图片），用于 logo、菜品图等
 * @param filePath 本地临时路径（如 uni.chooseImage 返回的 tempFilePaths[0]）
 */
export function uploadSingle(filePath: string): Promise<UploadSingleResult> {
  return new Promise((resolve, reject) => {
    const token = getStorage<string>(STORAGE_KEYS.TOKEN)
    uni.uploadFile({
      url: `${API_BASE_URL}/api/upload/single`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('上传失败'))
          return
        }
        try {
          const body = JSON.parse(res.data as string)
          if (body.code === 0 && body.data?.url) {
            const url = body.data.url.startsWith('http')
              ? body.data.url
              : `${API_BASE_URL}${body.data.url}`
            resolve({ url, filename: body.data.filename || '' })
          } else {
            reject(new Error(body.message || '上传失败'))
          }
        } catch {
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => reject(err),
    })
  })
}
