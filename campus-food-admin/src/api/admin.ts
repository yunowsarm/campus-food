import request from "@/utils/request";

const prefix = "/api/admin";

export interface UserItem {
  _id: string;
  nickName: string;
  email?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface MerchantItem {
  _id: string;
  name: string;
  logo?: string;
  address?: string;
  auditStatus: string;
  createdAt: string;
}

export interface FoodItem {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  merchantId?: { name: string };
  auditStatus: string;
  createdAt: string;
}

export interface ReviewItem {
  _id: string;
  content: string;
  rating: number;
  targetType: string;
  userId?: { nickName: string };
  status: string;
  createdAt: string;
}

export interface StatsRes {
  userCount: number;
  merchantCount: number;
  pendingMerchantCount: number;
  orderCount: number;
  orderAmount: number;
  reviewCount: number;
  pendingReviewCount: number;
}

export function getUsers(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  status?: string;
}) {
  return request.get<{ list: UserItem[]; total: number }>(`${prefix}/users`, {
    params,
  });
}

export function setUserStatus(id: string, status: "active" | "disabled") {
  return request.put(`${prefix}/users/${id}/status`, { status });
}

export function setUserRole(id: string, role: string) {
  return request.put(`${prefix}/users/${id}/role`, { role });
}

export function getPendingMerchants() {
  return request.get<{ list: MerchantItem[] }>(`${prefix}/merchants/pending`);
}

export function approveMerchant(id: string) {
  return request.put(`${prefix}/merchants/${id}/approve`);
}

export function rejectMerchant(id: string) {
  return request.put(`${prefix}/merchants/${id}/reject`);
}

export function getPendingFoods() {
  return request.get<{ list: FoodItem[] }>(`${prefix}/foods/pending`);
}

export function approveFood(id: string) {
  return request.put(`${prefix}/foods/${id}/approve`);
}

export function rejectFood(id: string) {
  return request.put(`${prefix}/foods/${id}/reject`);
}

export function getPendingReviews() {
  return request.get<{ list: ReviewItem[] }>(`${prefix}/reviews/pending`);
}

export function approveReview(id: string) {
  return request.put(`${prefix}/reviews/${id}/approve`);
}

export function rejectReview(id: string) {
  return request.put(`${prefix}/reviews/${id}/reject`);
}

export function getStats(): Promise<StatsRes> {
  return request.get(`${prefix}/stats`) as Promise<StatsRes>;
}
