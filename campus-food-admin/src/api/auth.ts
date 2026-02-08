import request from "@/utils/request";

export interface LoginRes {
  token: string;
  user: { id: string; nickName: string; role: string };
}

export function login(data: { email: string; password: string }) {
  return request.post<any, LoginRes>("/api/auth/login", data);
}
