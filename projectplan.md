# 生产环境优化修复计划

## 问题描述

### 问题1: WebSocket连接失败
正式环境报错：`WebSocket connection to 'wss://tbtparent.me/socket.io/?EIO=4&transport=websocket' failed`

**原因**: 后端 Socket.io CORS 配置未包含生产环境域名 `https://tbtparent.me`

### 问题2: 监控概览显示错误的数据库地址
监控概览显示数据库地址为 `localhost`，但实际数据库在 `121.196.245.95`

**原因**: `.env` 文件中 `DB_HOST=localhost` 未更新

## 待办事项

- [ ] 1. 更新 `.env` 文件，将 `DB_HOST` 改为 `121.196.245.95`
- [ ] 2. 添加 `SOCKET_CORS_ORIGIN` 配置到 `.env` 文件，设置为生产域名
- [ ] 3. 测试监控概览数据正确性
- [ ] 4. 测试生产环境 WebSocket 连接

## 解决方案

### 1. 更新数据库地址

**文件**: `backend/.env`

修改:
```env
DB_HOST=121.196.245.95  # 从 localhost 改为实际地址
```

### 2. 添加 WebSocket CORS 配置

**文件**: `backend/.env`

添加:
```env
SOCKET_CORS_ORIGIN=https://tbtparent.me
```

这样后端 Socket.io 就会允许来自生产域名的连接。

---

## 实施步骤

### 已完成的修改

1. **前端 Socket.io 配置** - `frontend/contexts/SocketContext.jsx`
   - 修复了 Socket URL 计算逻辑
   - 添加了 `path` 配置，使用 `NEXT_PUBLIC_BASE_PATH` + `/socket.io/`
   - 生产环境会连接 `/owl/socket.io/`

2. **Nginx 配置** - `frontend/deploy/nginx.conf`
   - 添加了 `/owl/socket.io/` 的 WebSocket 代理规则
   - 配置了正确的 WebSocket 头和长连接超时

3. **后端环境变量** - `backend/.env`
   - 需要添加 `SOCKET_CORS_ORIGIN=https://tbtparent.me`
   - 需要更新 `DB_HOST=121.196.245.95`（如果还未修改）

### 下一步操作

1. **更新后端 .env 文件**
   ```bash
   # 在服务器上编辑 backend/.env
   DB_HOST=121.196.245.95
   SOCKET_CORS_ORIGIN=https://tbtparent.me

   # 重启后端服务
   pm2 restart owl-backend
   ```

2. **重新构建并部署前端**
   ```bash
   # 本地构建
   cd frontend
   npm run build
   cd deploy
   ./deploy.sh

   # 上传到服务器
   scp frontend-deploy.tar.gz root@121.196.245.95:/tmp/
   scp nginx.conf root@121.196.245.95:/tmp/owl.conf
   ```

3. **服务器部署**
   ```bash
   ssh root@121.196.245.95

   # 更新 Nginx 配置
   mv /tmp/owl.conf /etc/nginx/conf.d/owl.conf
   nginx -t
   systemctl reload nginx

   # 部署前端
   pm2 stop owl-frontend
   cd /opt/frontend/owl-frontend
   tar -xzf /tmp/frontend-deploy.tar.gz
   pm2 restart owl-frontend
   ```

4. **验证**
   - 浏览器打开 `https://tbtparent.me/owl`
   - 打开开发者工具查看 WebSocket 连接状态
   - 应该能看到 `WebSocket connection to 'wss://tbtparent.me/owl/socket.io/...' succeeded`

---

## Review

*待测试完成后填写*
