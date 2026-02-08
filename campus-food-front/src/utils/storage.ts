// 本地存储封装

/**
 * 设置存储
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (error) {
    console.error('设置存储失败:', error)
  }
}

/**
 * 获取存储
 */
export function getStorage<T>(key: string): T | null {
  try {
    const value = uni.getStorageSync(key)
    if (!value) return null
    
    // 如果值已经是对象或数组，直接返回
    if (typeof value === 'object') {
      return value as T
    }
    
    // 尝试解析JSON字符串
    try {
      return JSON.parse(value) as T
    } catch {
      // 如果解析失败，说明是普通字符串（如JWT token），直接返回
      return value as T
    }
  } catch (error) {
    console.error('获取存储失败:', error)
    return null
  }
}

/**
 * 删除存储
 */
export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.error('删除存储失败:', error)
  }
}

/**
 * 清空所有存储
 */
export function clearStorage(): void {
  try {
    uni.clearStorageSync()
  } catch (error) {
    console.error('清空存储失败:', error)
  }
}
