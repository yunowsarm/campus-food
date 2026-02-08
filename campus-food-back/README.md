# 校园美食推荐与拼单平台 - 后端

基于 Express + MongoDB 的后端服务，对应数据库设计见 `../campus-food/docs/MONGODB_DATABASE_DESIGN.md`。

## 技术栈

- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- dotenv 配置

## 环境要求

- Node.js >= 18
- MongoDB >= 5

## 安装与运行

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 配置 MONGODB_URI、JWT_SECRET 等

# 启动（生产）
npm start

# 开发（监听文件变化）
npm run dev
```

## 接口说明

- **认证**：`POST /api/auth/login`（openId 登录）、`POST /api/auth/setRole`（设置角色，需 token）
- **用户**：`GET/PUT /api/users/profile`（需 token）
- **商家**：`GET /api/merchants`、`GET /api/merchants/:id`、`POST/PUT`（商家角色）
- **分类**：`GET /api/categories`、`POST/PUT/DELETE`（商家角色）
- **菜品**：`GET /api/foods`、`GET /api/foods/:id`、`POST/PUT/DELETE`（商家角色）
- **订单**：`POST /api/orders`（学生）、`GET /api/orders`、`GET /api/orders/:id`、`POST /api/orders/:id/pay`、`POST /api/orders/:id/cancel`；商家：`POST /api/orders/:id/startPreparing`、`POST /api/orders/:id/finishPreparing`
- **拼单**：`GET /api/groups`、`GET /api/groups/:id`、`POST /api/groups`、`POST /api/groups/:id/join`、`POST /api/groups/:id/cancel`
- **配送**：`GET /api/deliveries`、`GET /api/deliveries/pending`、`GET /api/deliveries/:id`、`POST /api/deliveries/:id/accept`、`POST /api/deliveries/:id/picking`、`POST /api/deliveries/:id/delivering`、`POST /api/deliveries/:id/complete`（配送员角色）
- **地址**：`GET/POST/PUT/DELETE /api/addresses`（学生角色）
- **收藏**：`GET /api/favorites`、`POST /api/favorites/toggle`（学生角色）
- **消息**：`GET /api/messages`、`POST /api/messages/:id/read`、`POST /api/messages/readAll`

请求头需携带：`Authorization: Bearer <token>`

## 角色与闭环

- **学生**：浏览、下单、拼单、支付、查单、地址、收藏
- **商家**：店铺/菜品/分类管理、接单、备餐、出餐（自取完成 / 创建配送单）
- **配送**：待抢单列表、抢单、取餐、配送中、送达（回写订单完成）

闭环流程：学生下单 → 支付 → 商家备餐 → 出餐（配送则创建配送单）→ 骑手抢单 → 取餐 → 送达 → 订单完成。
