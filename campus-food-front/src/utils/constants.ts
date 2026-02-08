// 常量定义

// 存储键名
export const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  USER_ROLE: 'userRole',
  TOKEN: 'token',
  CART: 'cart',
  /** 团长先付款再发布：支付成功后创建拼单用的参数 */
  PENDING_CREATE_GROUP: 'pendingCreateGroup'
} as const

// 用户角色
export const USER_ROLES = {
  STUDENT: 'student',
  MERCHANT: 'merchant'
} as const

// 订单状态
export const ORDER_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PREPARING: 'preparing',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

// 配送方式
export const DELIVERY_TYPES = {
  ALONE: 'alone', // 单独配送
  TOGETHER: 'together', // 集体配送
  PICKUP: 'pickup' // 到店取餐
} as const

// 配送方式显示文本
export const DELIVERY_TYPE_TEXT = {
  [DELIVERY_TYPES.ALONE]: '单独配送',
  [DELIVERY_TYPES.TOGETHER]: '集体配送',
  [DELIVERY_TYPES.PICKUP]: '到店取餐'
} as const

// 订单状态显示文本
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.UNPAID]: '待付款',
  [ORDER_STATUS.PAID]: '待接单',
  [ORDER_STATUS.PREPARING]: '制作中',
  [ORDER_STATUS.DELIVERING]: '配送中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
} as const

// API基础地址（后续替换为实际地址）
export const API_BASE_URL = 'http://localhost:3000'
