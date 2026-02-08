# 校园美食平台 - 后台管理

Vue 3 + Element Plus + TypeScript + Vite 构建的 Web 后台管理系统。

## 功能

- 登录（管理员邮箱密码，需后端用户角色为 admin）
- 数据看板：用户数、商家数、订单数、评价数等
- 用户管理：列表、禁用/启用
- 商家审核：待审核商家列表、通过/拒绝
- 美食审核：待审核美食列表、通过/拒绝
- 评价管理：待审核评价列表、通过/拒绝

## 开发

```bash
npm install
npm run dev
```

默认端口 5174，API 请求通过 vite proxy 转发到 `http://localhost:3000`。

## 构建

```bash
npm run build
```

## 说明

- 管理员账号需在后端将用户角色设置为 `admin`（如通过数据库或后续管理接口）。
- 后端需已启动（campus-food-back），并配置好 MongoDB。
