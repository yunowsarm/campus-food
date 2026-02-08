// 配送接口 - 对应后端 /api/deliveries（配送员角色）

import defHttp from '../utils/request'

export type DeliveryStatus = 'pending' | 'accepted' | 'picking' | 'delivering' | 'completed' | 'cancelled'

export interface Delivery {
  id?: string
  _id?: string
  deliveryNo: string
  orderIds?: string[]
  merchantId: string | { _id?: string; name?: string; address?: string }
  riderId?: string
  pickupAddress?: string
  deliveryAddress?: string
  contactName?: string
  contactPhone?: string
  status: DeliveryStatus
  fee?: number
  acceptedAt?: string
  pickedAt?: string
  deliveredAt?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface DeliveryListParams {
  page?: number
  pageSize?: number
  status?: string
}

export interface DeliveryListResult {
  list: Delivery[]
  total: number
  page: number
  pageSize: number
}

/** 我的配送列表（配送员） */
export function getDeliveryList(params?: DeliveryListParams) {
  return defHttp.Get<DeliveryListResult>('/api/deliveries', params)
}

/** 待抢单列表（配送员） */
export function getDeliveryPendingList() {
  return defHttp.Get<Delivery[]>('/api/deliveries/pending')
}

/** 配送单详情 */
export function getDeliveryDetail(id: string) {
  return defHttp.Get<Delivery>(`/api/deliveries/${id}`)
}

/** 抢单（配送员） */
export function acceptDelivery(id: string) {
  return defHttp.Post<Delivery>(`/api/deliveries/${id}/accept`)
}

/** 到店取餐（配送员） */
export function pickingDelivery(id: string) {
  return defHttp.Post<Delivery>(`/api/deliveries/${id}/picking`)
}

/** 配送中（配送员） */
export function deliveringDelivery(id: string) {
  return defHttp.Post<Delivery>(`/api/deliveries/${id}/delivering`)
}

/** 送达完成（配送员） */
export function completeDelivery(id: string) {
  return defHttp.Post<Delivery>(`/api/deliveries/${id}/complete`)
}
