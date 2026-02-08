// 格式化工具函数

/**
 * 格式化价格
 * @param price 价格（分）
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
  return `¥${(price / 100).toFixed(2)}`
}

/**
 * 格式化时间
 * @param time 时间戳或时间字符串
 * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(time: string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(typeof time === 'string' ? time : time * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间
 * @param time 时间戳或时间字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(time: string | number): string {
  const date = new Date(typeof time === 'string' ? time : time * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 格式化倒计时
 * @param seconds 剩余秒数
 * @returns 倒计时字符串
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '已结束'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  } else {
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }
}

/**
 * 格式化距离
 * @param distance 距离（米）
 * @returns 格式化后的距离字符串
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance}m`
  } else {
    return `${(distance / 1000).toFixed(1)}km`
  }
}
