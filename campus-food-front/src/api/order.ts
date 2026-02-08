// 订单接口 - 对应后端 /api/orders

import defHttp from "../utils/request";
import type { Order } from "../types/order";

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  merchantId?: string;
}

export interface OrderListResult {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderParams {
  items: { foodId: string; quantity: number; spec?: string }[];
  deliveryType: "alone" | "together" | "pickup";
  /** 用户收货地址 id（/api/addresses） */
  addressId?: string;
  /** 校园配送点 id（/api/campus-addresses），与 addressId 二选一 */
  campusAddressId?: string;
  contactName?: string;
  contactPhone?: string;
  remark?: string;
  groupId?: string;
}

/** 创建订单（学生） */
export function createOrder(data: CreateOrderParams) {
  return defHttp.Post<Order>("/api/orders", data);
}

/** 订单列表 */
export function getOrderList(params?: OrderListParams) {
  return defHttp.Get<OrderListResult>("/api/orders", params);
}

/** 订单详情 */
export function getOrderDetail(id: string) {
  return defHttp.Get<Order>(`/api/orders/${id}`);
}

/** 支付订单（学生） */
export function payOrder(orderId: string) {
  return defHttp.Post<{ payParams?: any }>(`/api/orders/${orderId}/pay`);
}

/** 取消订单（学生） */
export function cancelOrder(orderId: string, reason?: string) {
  return defHttp.Post<Order>(`/api/orders/${orderId}/cancel`, { reason });
}

/** 申请退款（学生） */
export function requestRefund(orderId: string, reason?: string) {
  return defHttp.Post<Order>(`/api/orders/${orderId}/refund`, { reason });
}

/** 审核通过退款（商家/管理员） */
export function approveRefund(orderId: string) {
  return defHttp.Post<Order>(`/api/orders/${orderId}/refund/approve`);
}

/** 拒绝退款（商家/管理员） */
export function rejectRefund(orderId: string) {
  return defHttp.Post<Order>(`/api/orders/${orderId}/refund/reject`);
}

/** 开始备餐（商家） */
export function startPreparing(orderId: string) {
  return defHttp.Post<Order>(`/api/orders/${orderId}/startPreparing`);
}

/** 出餐完成（商家，自取则完成，配送则创建配送单） */
export function finishPreparing(orderId: string) {
  return defHttp.Post<Order & { delivery?: any }>(
    `/api/orders/${orderId}/finishPreparing`
  );
}
