// 校园配送点 - 对应后端 /api/campus-addresses（固定选项，如男生宿舍1、女生宿舍）

import defHttp from "../utils/request";

export interface CampusAddressItem {
  id?: string;
  _id?: string;
  code: number;
  name: string;
  sort?: number;
}

/** 校园配送点列表（下单时选择） */
export function getCampusAddressList() {
  return defHttp.Get<CampusAddressItem[]>("/api/campus-addresses");
}
