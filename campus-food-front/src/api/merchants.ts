// 商家接口 - 对应后端 /api/merchants

import defHttp from "../utils/request";
import type { RequestConfig } from "../utils/request";
import type { Merchant } from "../types/merchant";

export interface MerchantListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  near?: string; // "lng,lat" 附近
}

export interface MerchantListResult {
  list: Merchant[];
  total: number;
  page: number;
  pageSize: number;
}

/** 商家列表 */
export function getMerchantList(params?: MerchantListParams) {
  return defHttp.Get<MerchantListResult>("/api/merchants", params);
}

/** 当前登录用户的商家（需商家角色，且已创建店铺）；config.silentError 为 true 时 404 不弹 toast */
export function getMerchantMe(config?: RequestConfig) {
  return defHttp.Get<Merchant>("/api/merchants/me", undefined, config);
}

/** 商家详情 */
export function getMerchantById(id: string) {
  return defHttp.Get<Merchant>(`/api/merchants/${id}`);
}

/** 创建商家（商家角色） */
export function createMerchant(data: Partial<Merchant>) {
  return defHttp.Post<Merchant>("/api/merchants", data);
}

/** 更新商家（商家角色） */
export function updateMerchant(id: string, data: Partial<Merchant>) {
  return defHttp.Put<Merchant>(`/api/merchants/${id}`, data);
}

export interface MerchantStats {
  orderCount: number;
  sales: number;
  avgPrice: number;
  statusCounts?: Record<string, number>;
  hotFoods: { id: string; name: string; sales: number }[];
}

/** 商家统计数据（今日/本周/本月） */
export function getMerchantStats(range: "today" | "week" | "month") {
  return defHttp.Get<MerchantStats>("/api/merchants/stats", { range });
}
