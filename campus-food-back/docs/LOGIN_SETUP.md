# 登录功能配置说明

## 一、已完成的修改

### 1. 前端（campus-food）

✅ **login.vue**
- 改用 `code` 登录，而不是 `openId`
- 支持平台条件编译（微信小程序 / H5）
- H5 环境提供「模拟登录」按钮

✅ **auth.ts**
- 登录参数改为 `code`

### 2. 后端（campus-food-back）

✅ **authController.js**
- 支持接收 `code` 参数
- 开发环境：`mock_code_*` 直接当作 `openId` 使用
- 生产环境：调用微信 API 换取 `openId`

✅ **package.json**
- 添加 `axios` 依赖（用于调用微信 API）

✅ **.env.example**
- 添加 `WECHAT_APPID` 和 `WECHAT_SECRET` 配置项

---

## 二、安装依赖

进入后端目录，安装 axios：

```bash
cd campus-food-back
npm install
```

这会自动安装 `axios` 和其他依赖。

---

## 三、开发环境使用（无需微信配置）

### 后端启动

```bash
cd campus-food-back
npm start
```

### 前端启动（H5）

```bash
cd campus-food
npm run dev:h5
```

在浏览器中打开，点击 **[开发] 模拟登录** 按钮即可测试。

### 工作原理

1. 前端发送 `code: 'mock_code_1234567890'`
2. 后端检测到 `mock_code_` 前缀，直接使用作为 `openId`
3. 查询或创建用户，返回 token

---

## 四、生产环境配置（真实微信登录）

### 1. 获取微信小程序凭证

登录 [微信公众平台](https://mp.weixin.qq.com/)：

1. 进入「开发管理」→「开发设置」
2. 复制 **AppID** 和 **AppSecret**

### 2. 配置后端环境变量

编辑 `campus-food-back/.env` 文件：

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/campusFood
JWT_SECRET=your-random-secret-key

# 微信小程序配置
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=1234567890abcdef1234567890abcdef
```

### 3. 登录流程

**微信小程序端：**

1. 用户点击「微信授权登录」
2. 弹出授权窗口
3. 用户同意后，获取 `code` 和用户信息
4. 调用后端 `/api/auth/login`，传递 `code`
5. 后端调用微信 API：
   ```
   GET https://api.weixin.qq.com/sns/jscode2session
     ?appid=APPID
     &secret=SECRET
     &js_code=CODE
     &grant_type=authorization_code
   ```
6. 微信返回 `{ openid, session_key }`
7. 后端用 `openid` 查询/创建用户
8. 返回 JWT token 给前端

---

## 五、接口说明

### POST /api/auth/login

**请求参数：**

```json
{
  "code": "string (必填)",
  "nickName": "string (可选)",
  "avatarUrl": "string (可选)",
  "phone": "string (可选)"
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "nickName": "测试用户",
      "avatarUrl": "/static/logo.png",
      "role": "student",
      "phone": ""
    }
  }
}
```

**错误响应：**

```json
{
  "code": 400,
  "message": "缺少 code 参数"
}
```

---

## 六、测试流程

### 开发环境测试

1. 启动后端：`npm start`
2. 启动前端 H5：`npm run dev:h5`
3. 浏览器打开，点击「模拟登录」
4. 查看控制台日志：
   ```
   [开发模式] 使用模拟 openId: mock_code_1234567890
   [注册] 新用户创建成功: 507f1f77bcf86cd799439011
   ```
5. 跳转到角色选择页

### 微信小程序真机测试

1. 配置 `.env` 中的 `WECHAT_APPID` 和 `WECHAT_SECRET`
2. 微信开发者工具打开项目
3. 点击「真机调试」
4. 点击「微信授权登录」
5. 同意授权
6. 查看控制台：
   ```
   获取用户信息成功
   获取登录code成功: 021abc123
   [微信登录] 获取 openId 成功
   [注册] 新用户创建成功
   ```

---

## 七、常见问题

### 1. H5 提示 `uni.getUserProfile is not a function`

**已修复**：代码已做平台条件编译，H5 环境会使用「模拟登录」。

### 2. 后端提示 `缺少 code 参数`

**已修复**：authController 已改为接收 `code` 而不是 `openId`。

### 3. 微信 API 返回错误

常见错误码：
- `40029`: code 无效（可能已过期，5 分钟有效期）
- `40013`: appid 无效
- `40125`: secret 错误

**解决方法**：
1. 检查 `.env` 中的 `WECHAT_APPID` 和 `WECHAT_SECRET`
2. 确保 code 在 5 分钟内使用
3. 每次登录需要重新获取 code

### 4. 开发环境无法安装 axios

**手动安装**：
```bash
cd campus-food-back
npm install axios@1.6.0
```

---

## 八、代码说明

### 判断开发/生产环境

```javascript
if (code.startsWith('mock_code_')) {
  // 开发环境
  openId = code;
} else {
  // 生产环境：调用微信 API
}
```

### 微信 API 调用

```javascript
const axios = require('axios');
const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

const wxRes = await axios.get(wxApiUrl);
openId = wxRes.data.openid;
```

---

## 九、安全建议

⚠️ **生产环境注意事项：**

1. **不要**将 `WECHAT_SECRET` 提交到 Git 仓库
2. **不要**在前端代码中暴露 AppSecret
3. **务必**在后端服务器调用微信 API
4. **建议**设置 IP 白名单（微信公众平台 → 开发设置）
5. **建议**使用 HTTPS 部署后端

---

## 十、下一步

- [ ] 完善用户信息（头像、昵称、手机号）
- [ ] 实现手机号授权（微信小程序 `getPhoneNumber`）
- [ ] 添加退出登录功能
- [ ] 实现 token 刷新机制

现在可以正常登录了！🎉
