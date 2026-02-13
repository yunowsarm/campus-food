# 校园美食推荐与拼单平台

基于微信小程序 / H5 的校园美食推荐、下单、拼单与配送一体化系统。支持学生端、商家端、骑手端与管理后台。

---

## 一、系统组成

| 子项目 | 说明 | 技术栈 |
|--------|------|--------|
| **campus-food-front** | 学生/商家/骑手端（小程序/H5） | uni-app + Vue3 + TypeScript + Pinia + Vite |
| **campus-food-back** | 后端 API 服务 | Node.js + Express + MongoDB + Redis + JWT |
| **campus-food-admin** | 管理后台（Web） | Vue3 + Element Plus + Vue Router + Pinia + Vite |

---

## 二、环境与安装要求

### 2.1 必须安装

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| **Node.js** | >= 18 | 前后端运行 |
| **MongoDB** | >= 5 | 后端数据存储 |
| **npm** | 随 Node 安装 | 依赖安装与脚本运行 |

### 2.2 可选（按需）

| 软件 | 用途 |
|------|------|
| **Redis** | 验证码/会话等；未安装时后端会用内存兜底 |
| **微信开发者工具** | 调试/发布微信小程序 |

---

## 三、后端（campus-food-back）

### 3.1 依赖

- **express**：Web 框架  
- **mongoose**：MongoDB 驱动  
- **jsonwebtoken / bcryptjs**：JWT 认证与密码加密  
- **ioredis**：Redis 客户端（验证码等）  
- **cors / dotenv / multer / nodemailer / axios**：跨域、配置、上传、邮件、HTTP 请求  

### 3.2 环境变量

在 `campus-food-back` 下新建 `.env`（可参考下方，无 `.env.example` 时自建）：

```env
# 服务端口
PORT=3000

# 数据库（必填）
MONGODB_URI=mongodb://127.0.0.1:27017/campusFood

# JWT 密钥（必填，生产环境务必修改）
JWT_SECRET=your-jwt-secret

# Redis（可选，不填则用内存）
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# 邮件（可选，用于忘记密码等）
# SMTP_HOST=...
# SMTP_PORT=587
# SMTP_USER=...
# SMTP_PASS=...
```

### 3.3 操作步骤

```bash
cd campus-food-back
npm install
# 配置 .env 后执行：
npm start          # 生产启动
# 或
npm run dev        # 开发（--watch 热重载）
```

启动成功后控制台会输出：`Server running on http://localhost:3000`，且 MongoDB 连接成功。

---

## 四、前端小程序/H5（campus-food-front）

### 4.1 依赖

- **@dcloudio/uni-app**：uni-app 框架（多端）  
- **vue / pinia**：视图与状态管理  
- **vite / sass / typescript**：构建与样式、类型  

### 4.2 配置

- API 基础地址在 `src/utils/constants.ts` 中配置（如 `API_BASE_URL`），开发时可用 Vite 代理到后端 `http://localhost:3000`。  
- 微信小程序需在微信公众平台配置合法域名或开发时勾选“不校验合法域名”。

### 4.3 操作步骤

```bash
cd campus-food-front
npm install
# H5 开发
npm run dev:h5
# 微信小程序开发（需先安装微信开发者工具）
npm run dev:mp-weixin
```

H5 默认会在浏览器打开（如 `http://localhost:5173`），小程序需用微信开发者工具打开 `campus-food-front/dist/dev/mp-weixin` 目录。

---

## 五、管理后台（campus-food-admin）

### 5.1 依赖

- **vue / vue-router / pinia**：SPA 与状态  
- **element-plus**：UI 组件库  
- **axios**：请求  
- **vite / typescript / vue-tsc**：构建与类型检查  

### 5.2 环境变量

在 `campus-food-admin` 下复制 `.env.example` 为 `.env`：

```env
# 后端 API 地址（开发时可由 Vite 代理到 localhost:3000）
VITE_API_BASE_URL=http://localhost:3000
```

### 5.3 操作步骤

```bash
cd campus-food-admin
npm install
npm run dev
```

浏览器访问控制台给出的地址（一般为 `http://localhost:5173`）。

---

## 六、系统闭环说明

整体闭环：**学生下单/拼单 → 支付 → 商家接单备餐 → 出餐（自取完成 / 生成配送单）→ 骑手抢单配送 → 送达 → 订单完成；消息与后台贯穿全流程。**

### 6.1 学生下单闭环

1. **浏览**：首页/分类页 → 美食详情 → 可收藏、可发起拼单或单独购买。  
2. **下单**：选规格/数量 → 选配送方式（自取/配送）与地址 → 生成订单。  
3. **支付**：订单列表/详情 → 调起支付 → 支付成功回写订单状态。  
4. **跟踪**：订单详情/订单跟踪页查看状态（待接单 → 备餐中 → 配送中/待自取 → 已完成）。  
5. **评价**：完成后可对菜品写评价；评价数据写回后端，供推荐与展示。

### 6.2 拼单闭环

1. **发起**：美食详情 → 发起拼单 → 设置成团人数、配送方式、截止时间 → 团长先支付 → 拼单创建并展示在拼单广场。  
2. **参与**：拼单广场/详情 → 选择配送方式（单独配送填地址 / 集体配送用团长地址 / 到店自取）→ 参与并支付。  
3. **成团**：在截止时间内人数达标 → 后端标记拼单成功 → 消息通知所有参与者；超时未成团 → 拼单失败并退款，定时任务（expiredGroupCron）与 Redis/数据库配合。  
4. **履约**：成团后按普通订单流程走（商家备餐 → 出餐 → 自取完成或生成配送单由骑手配送）。

### 6.3 商家接单与出餐闭环

1. **接单**：学生支付后订单进入“待接单/已支付”，商家在商家端查看并接单（或自动接单）。  
2. **备餐**：订单状态变为“备餐中”，商家操作“开始备餐”“出餐完成”。  
3. **出餐**：  
   - **自取**：出餐即标记订单完成，可选发消息通知学生。  
   - **配送**：出餐时创建配送单，进入骑手待抢单池，并通知学生/骑手（若有消息模块）。

### 6.4 骑手配送闭环

1. **抢单**：骑手端展示待抢配送单 → 抢单后配送单与骑手绑定。  
2. **取餐**：状态更新为“取餐中” → 到店取餐后更新为“配送中”。  
3. **送达**：送达后操作“完成” → 后端更新配送单与关联订单为“已完成”，并写回订单完成时间、可选推送消息。

### 6.5 消息与后台在闭环中的作用

- **消息**：  
  - 拼单成团/失败、订单状态变更、配送状态变更等触发后端发消息（如 messageHelper）。  
  - 学生端消息中心拉取列表、未读数、标记已读；点击消息可跳转订单/拼单详情，形成“通知 → 回看业务”的闭环。  

- **管理后台**：  
  - 用户、商家、菜品、分类、订单、评价等数据的查询与管理，支撑运营与排查问题，不改变主业务闭环，但保证数据一致与可追溯。

---

## 七、推荐本地运行顺序

1. 启动 **MongoDB**（确保 `MONGODB_URI` 可连）。  
2. （可选）启动 **Redis**，避免验证码等走内存。  
3. 启动 **后端**：`cd campus-food-back && npm run dev`。  
4. 启动 **前端**：`cd campus-food-front && npm run dev:h5`（或小程序）。  
5. 需要管理后台时：`cd campus-food-admin && npm run dev`。  

确保前端/管理后台请求的 API 地址指向当前运行的后端（如 `http://localhost:3000`），即可完成从“浏览 → 下单 → 支付 → 商家/骑手处理 → 完成”的完整闭环。

---

## 八、许可证

MIT License
