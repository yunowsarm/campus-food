# 校园美食推荐与拼单平台 - MongoDB 数据库设计

## 一、业务闭环概览

```
┌─────────────┐    下单/拼单     ┌─────────────┐    接单备餐     ┌─────────────┐    取餐配送     ┌─────────────┐
│   学生端    │ ──────────────► │   商家端    │ ──────────────► │   配送端    │ ──────────────► │   学生端    │
│  浏览/下单   │                 │  接单/出餐   │                 │  接单/送达   │                 │  确认收货   │
└─────────────┘                 └─────────────┘                 └─────────────┘                 └─────────────┘
       │                               │                               │                               │
       │        拼单成团 → 合并订单     │        分配骑手               │        完成订单               │
       └───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

**闭环关键节点：**

1. **学生**：选品 → 下单/拼单 → 支付 → 等餐 → 收货/自取 → 评价
2. **商家**：接单 → 备餐 → 呼叫配送/待自取 → 出餐完成
3. **配送**：抢单/派单 → 到店取餐 → 配送中 → 送达

---

## 二、角色与集合总览

| 集合名          | 说明                                          | 主要使用者       |
| --------------- | --------------------------------------------- | ---------------- |
| users           | 用户（学生/商家/配送员）                      | 全端             |
| merchants       | 商家/店铺                                     | 商家端           |
| foods           | 菜品                                          | 学生端、商家端   |
| categories      | 菜品分类                                      | 学生端、商家端   |
| orders          | 订单                                          | 学生、商家、配送 |
| groups          | 拼单                                          | 学生端           |
| deliveries      | 配送单                                        | 配送端、商家端   |
| addresses       | 收货地址（用户维护）                          | 学生端           |
| campusaddresses | 校园配送点（固定选项，如男生宿舍1、女生宿舍） | 学生端           |
| favorites       | 收藏                                          | 学生端           |
| messages        | 消息/通知                                     | 全端             |

---

## 三、集合详细设计

### 1. users（用户）

统一用户表，通过 `role` 区分身份，同一人可多角色（如学生+配送员）。

```javascript
{
  _id: ObjectId,
  openId: String,           // 微信 openId，唯一
  unionId: String,         // 可选
  nickName: String,
  avatarUrl: String,
  phone: String,
  role: "student" | "merchant" | "delivery",  // 主角色，可扩展为数组支持多角色
  roles: ["student", "delivery"],            // 可选：多角色时使用

  // 学生端扩展（role=student 时）
  defaultAddressId: ObjectId,

  // 商家端扩展（role=merchant 时）
  merchantId: ObjectId,     // 关联 merchants._id

  // 配送端扩展（role=delivery 时）
  deliveryStatus: "idle" | "busy" | "offline",
  currentDeliveryId: ObjectId,

  status: "active" | "disabled",
  createdAt: Date,
  updatedAt: Date
}
```

**索引建议：**

- `openId` unique
- `role`, `merchantId`, `deliveryStatus` 按查询场景建

---

### 2. merchants（商家/店铺）

```javascript
{
  _id: ObjectId,
  name: String,
  logo: String,
  images: [String],
  description: String,
  category: String,         // 如 "川菜", "快餐"

  // 经营信息
  address: String,
  location: { type: "Point", coordinates: [lng, lat] },  // 地理坐标，便于配送距离
  contactName: String,
  contactPhone: String,
  businessHours: String,   // "9:00-22:00"

  // 统计（可异步更新）
  salesCount: Number,
  rating: Number,
  ratingCount: Number,

  status: "open" | "closed" | "rest",
  createdAt: Date,
  updatedAt: Date
}
```

**索引建议：**

- `status`
- `location` 2dsphere（附近商家、配送距离）

---

### 3. categories（菜品分类）

全局或按商家维度的分类，按需选择。

```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  sort: Number,
  merchantId: ObjectId,    // 若为 null 则为平台统一分类
  createdAt: Date,
  updatedAt: Date
}
```

**索引建议：** `merchantId`, `sort`

---

### 4. foods（菜品）

```javascript
{
  _id: ObjectId,
  merchantId: ObjectId,
  categoryId: ObjectId,
  name: String,
  description: String,
  images: [String],
  price: Number,           // 单位：分
  originalPrice: Number,
  stock: Number,
  sales: Number,
  tags: [String],

  // 拼单相关
  groupPrice: Number,      // 拼单价
  minGroupNum: Number,     // 最少成团人数

  status: "on" | "off",
  sort: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**索引建议：**

- `merchantId`, `status`
- `categoryId`
- 列表页可考虑 `(merchantId, status, sort)`

---

### 5. orders（订单）

核心闭环表，关联学生、商家、配送。

```javascript
{
  _id: ObjectId,
  orderNo: String,         // 业务单号，如 ORD202601270001，唯一

  userId: ObjectId,        // 学生
  merchantId: ObjectId,
  deliveryId: ObjectId,    // 配送单 id，见 deliveries
  groupId: ObjectId,       // 若来自拼单，关联 groups

  items: [
    {
      foodId: ObjectId,
      foodName: String,
      foodImage: String,
      price: Number,
      quantity: Number,
      spec: String
    }
  ],

  totalPrice: Number,      // 商品总价，分
  deliveryFee: Number,     // 配送费，分
  discountAmount: Number,  // 优惠金额，分
  finalPrice: Number,      // 实付，分

  deliveryType: "alone" | "together" | "pickup",  // 单独送 / 拼单送 / 自取
  addressId: ObjectId,
  address: String,
  contactName: String,
  contactPhone: String,
  remark: String,

  status: "unpaid" | "paid" | "preparing" | "delivering" | "completed" | "cancelled" | "refunded",

  paidAt: Date,
  preparedAt: Date,        // 商家出餐完成
  deliveredAt: Date,       // 骑手送达
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,

  createdAt: Date,
  updatedAt: Date
}
```

**状态流转（闭环）：**

- 学生下单 → `unpaid`
- 支付成功 → `paid`
- 商家接单备餐 → `preparing`
- 商家出餐、若有配送 → `delivering`（并写 deliveries）
- 自取则直接 → `completed`
- 骑手送达 → `completed`

**索引建议：**

- `orderNo` unique
- `userId`, `createdAt`
- `merchantId`, `status`, `createdAt`
- `deliveryId`（若有）
- `groupId`

---

### 6. groups（拼单）

```javascript
{
  _id: ObjectId,
  foodId: ObjectId,
  merchantId: ObjectId,

  foodName: String,
  foodImage: String,
  price: Number,           // 拼单单价，分
  originalPrice: Number,
  targetNum: Number,
  deliveryType: "together" | "pickup",

  creatorId: ObjectId,
  creatorName: String,
  creatorAvatar: String,

  participants: [
    {
      userId: ObjectId,
      nickName: String,
      avatarUrl: String,
      joinTime: Date,
      deliveryType: String,
      addressId: ObjectId,
      address: String,
      contactName: String,
      contactPhone: String,
      orderId: ObjectId     // 成团后生成的订单 id
    }
  ],

  status: "pending" | "success" | "failed" | "cancelled",
  endTime: Date,
  successAt: Date,         // 成团时间

  createdAt: Date,
  updatedAt: Date
}
```

**闭环要点：**

- `pending`：未成团，学生可继续参与
- `success`：成团 → 为每个 participant 创建订单（可共用一个配送单）
- `failed`：超时未成团，可退款
- 成团后：写 orders、可选写 deliveries（若为一起送则合并配送）

**索引建议：**

- `status`, `endTime`
- `foodId`, `merchantId`
- `creatorId`

---

### 7. deliveries（配送单）

连接「商家出餐」与「骑手送达」，支持一单多订单（拼单一起送）。

```javascript
{
  _id: ObjectId,
  deliveryNo: String,      // 如 DEL202601270001

  orderIds: [ObjectId],    // 一个配送单可对应多个订单（拼单）
  merchantId: ObjectId,
  riderId: ObjectId,       // 配送员 userId

  pickupAddress: String,   // 取餐地址（商家地址）
  pickupLocation: { type: "Point", coordinates: [lng, lat] },
  deliveryAddress: String,
  deliveryLocation: { type: "Point", coordinates: [lng, lat] },
  contactName: String,
  contactPhone: String,

  status: "pending" | "accepted" | "picking" | "delivering" | "completed" | "cancelled",
  fee: Number,             // 配送费，分

  acceptedAt: Date,
  pickedAt: Date,
  deliveredAt: Date,
  completedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

**闭环要点：**

- 商家出餐后创建 `deliveries`，`status: "pending"`
- 配送端抢单/派单 → `accepted`，写入 `riderId`
- 骑手到店取餐 → `picking` → `delivering`
- 送达 → `completed`，回写各 `orders.deliveredAt`、`orders.status = "completed"`

**索引建议：**

- `deliveryNo` unique
- `riderId`, `status`
- `merchantId`, `status`
- `status`（待抢单列表）

---

### 8. addresses（收货地址）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  phone: String,
  region: String,           // 省市区
  detail: String,           // 详细地址
  location: { type: "Point", coordinates: [lng, lat] },
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**索引建议：** `userId`

---

### 8.1 campusaddresses（校园配送点 / 固定地址选项）

用于下单时选择的固定配送点，数据格式：编号 → 名称。初始数据示例：1-男生宿舍1，2-女生宿舍。

```javascript
{
  _id: ObjectId,
  code: Number,    // 编号，唯一，如 1、2
  name: String,     // 显示名称，如 "男生宿舍1"、"女生宿舍"
  sort: Number,     // 排序
  createdAt: Date,
  updatedAt: Date
}
```

**索引建议：** `code` unique，`sort`

**接口：** `GET /api/campus-addresses` 返回列表（按 sort、code 排序），无需登录。

---

### 9. favorites（收藏）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  targetType: "food" | "merchant",
  targetId: ObjectId,
  createdAt: Date
}
```

**索引建议：** `(userId, targetType, targetId)` unique

---

### 10. messages（消息/通知）

用于订单状态变更、拼单成团、配送状态等通知。

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "order" | "group" | "delivery" | "system",
  title: String,
  content: String,
  relatedId: ObjectId,      // orderId / groupId / deliveryId
  isRead: Boolean,
  createdAt: Date
}
```

**索引建议：** `userId`, `isRead`, `createdAt`

---

## 四、业务闭环流程（按端）

### 4.1 学生端

| 操作          | 涉及集合                     | 说明                                        |
| ------------- | ---------------------------- | ------------------------------------------- |
| 注册/登录     | users                        | 按 openId 查/建用户，写 role                |
| 浏览美食      | foods, categories, merchants | 列表/筛选/详情                              |
| 收藏          | favorites                    | 增删                                        |
| 加购          | 前端 cart，下单时用          | 或服务端 cart 集合可选                      |
| 下单          | orders, orders.items         | 创建订单，status=unpaid                     |
| 拼单发起/参与 | groups                       | 创建或 participants 追加，成团后生成 orders |
| 支付          | orders                       | 更新 paidAt、status=paid，可触发消息        |
| 查订单/物流   | orders, deliveries           | 列表、详情、配送状态                        |
| 收货/自取确认 | orders                       | 若需学生确认完成，则更新 completedAt        |
| 地址管理      | addresses                    | CRUD、defaultAddressId                      |

### 4.2 商家端

| 操作      | 涉及集合           | 说明                                                     |
| --------- | ------------------ | -------------------------------------------------------- |
| 店铺信息  | merchants          | 维护名称、地址、营业时间、location                       |
| 菜品/分类 | foods, categories  | CRUD、上下架、排序                                       |
| 接单列表  | orders             | 按 merchantId、status 查 paid/preparing                  |
| 备餐      | orders             | 更新 status=preparing                                    |
| 出餐      | orders, deliveries | 自取→订单 completed；配送→创建 delivery，订单 delivering |
| 统计      | orders, foods      | 聚合统计销售额、单量、菜品销量                           |

### 4.3 配送端

| 操作       | 涉及集合           | 说明                                                        |
| ---------- | ------------------ | ----------------------------------------------------------- |
| 可接单列表 | deliveries         | status=pending，可按距离排序                                |
| 抢单/派单  | deliveries, users  | 更新 riderId、status=accepted，用户 deliveryStatus=busy     |
| 到店取餐   | deliveries         | status=picking → 取餐后 delivering                          |
| 送达       | deliveries, orders | status=completed，回写 orders.deliveredAt、status=completed |
| 我的配送   | deliveries         | 按 riderId、时间查                                          |

---

## 五、关键闭环时序（简版）

1. **学生**：选商品 → 下单(orders 新增) → 支付 → orders.status=paid
2. **商家**：查新单 → 接单备餐 → orders.status=preparing → 出餐
   - 若配送：创建 deliveries(pending) → orders.status=delivering
   - 若自取：orders.status=completed
3. **配送**：查 deliveries(pending) → 抢单(accepted) → 取餐(picking→delivering) → 送达(completed)
4. **系统**：deliveries.completed 时回写 orders.deliveredAt、orders.status=completed，并可选写 messages

拼单闭环：groups 成团 → 为每个 participant 生成 order → 可合并一个 delivery → 同上 2、3、4。

---

## 六、MongoDB 使用建议

1. **ID 策略**：统一用 `ObjectId`，对外可再暴露一层 `orderNo`、`deliveryNo` 等业务号。
2. **金额**：以「分」存储，避免浮点误差。
3. **地理**：商家、地址用 `GeoJSON Point`，便于附近商家、配送距离、骑手派单。
4. **事务**：支付、成团生成多单、创建配送单等建议放在 **事务** 中执行，保证一致性。
5. **读写**：高频列表（订单列表、待接单配送列表）注意索引与分页；统计可用定时任务聚合或 CQRS 读模型。
6. **扩展**：后续可增加评价表(reviews)、优惠券(coupons)、活动(activities)等，在订单中引用即可。

按本文档的集合与状态流转，即可在 MongoDB 上实现学生端、商家端、配送端的三端闭环。
