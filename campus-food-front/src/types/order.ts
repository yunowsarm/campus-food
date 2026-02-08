// 订单相关类型定义

//状态值	含义
//unpaid	待支付
//paid	已支付（待接单）
//preparing	备餐中
//delivering	配送中
//completed	已完成
//cancelled	已取消
//refunded	已退款

export type OrderStatus = 'unpaid' | 'paid' | 'preparing' | 'delivering' | 'completed' | 'cancelled' | 'refunded'

export const ORDER_STATUS_TEXT = {
  unpaid: "待支付",
  paid: "已支付（待接单）",
  preparing: "备餐中",
  delivering: "配送中",
  completed: "已完成",
  cancelled: "已取消",
  refunded: "已退款",
};

//配送方式	含义
//alone	单独送
//together	拼单送
//pickup	自取
export type DeliveryType = 'alone' | 'together' | 'pickup'

export interface OrderItem {
  id: string
  foodId: string
  foodName: string
  foodImage: string
  price: number
  quantity: number
  spec?: string
}

export interface Order {
  id?: string
  _id?: string
  orderNo: string
  userId: string
  merchantId: string
  merchantName: string
  items: OrderItem[]
  totalPrice: number
  deliveryPrice?: number
  deliveryFee?: number // 后端返回
  discountPrice?: number
  discountAmount?: number // 后端返回
  finalPrice: number
  status: OrderStatus
  deliveryType: DeliveryType
  address?: string
  contactName?: string
  contactPhone?: string
  remark?: string
  groupId?: string
  isGroupOrder?: boolean
  createdAt: string
  paidAt?: string
  deliveredAt?: string
  completedAt?: string
  refundReason?: string
  refundStatus?: 'none' | 'pending' | 'approved' | 'rejected'
  refundedAt?: string
}

export interface OrderStats {
  unpaid: number
  undelivered: number
  completed: number
  refunded: number
}

export interface OrderState {
  currentOrder: Order | null
  orderList: Order[]
  orderStats: OrderStats
}
