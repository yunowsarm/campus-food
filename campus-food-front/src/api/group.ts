// 拼单接口 - 对应后端 /api/groups

import defHttp from "../utils/request";
import type { Group, GroupDetail, DeliveryType } from "../types/group";

export interface GroupListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  deliveryType?: DeliveryType;
}

export interface GroupListResult {
  list: Group[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateGroupParams {
  foodId: string;
  targetNum: number;
  deliveryType: DeliveryType;
  endTime: string; // ISO 或可被 new Date 解析的字符串
  /** 单独配送/集体配送时必填，校园配送点 id */
  campusAddressId?: string;
  /** 团长先付款再发布：已支付订单 id，传入则不再创建新订单 */
  creatorOrderId?: string;
}

export interface JoinGroupParams {
  deliveryType: DeliveryType;
  /** 单独配送时必填，校园配送点 id */
  campusAddressId?: string;
  addressId?: string;
  contactName?: string;
  contactPhone?: string;
}

/** 拼单列表 */
export function getGroupList(params?: GroupListParams) {
  return defHttp.Get<GroupListResult>("/api/groups", params);
}

/** 拼单详情 */
export function getGroupDetail(id: string) {
  return defHttp.Get<GroupDetail>(`/api/groups/${id}`);
}

/** 发起拼单（学生） */
export function createGroup(data: CreateGroupParams) {
  return defHttp.Post<GroupDetail>("/api/groups", data);
}

/** 参与拼单（学生） */
export function joinGroup(groupId: string, data: JoinGroupParams) {
  return defHttp.Post<GroupDetail>(`/api/groups/${groupId}/join`, data);
}

/** 取消拼单（学生，仅发起人） */
export function cancelGroup(groupId: string) {
  return defHttp.Post<void>(`/api/groups/${groupId}/cancel`);
}
