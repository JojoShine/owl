# Git 仓库整合计划

## 目标

将前后端代码整合到一个统一的 Git 仓库，并推送到远程仓库：
- 远程仓库地址：https://github.com/JojoShine/owl.git
- 前后端作为一个整体项目管理

## 现状分析

**当前状态**:
- ✅ 前端目录 (`frontend/`) 有独立的 `.git` 仓库
- ❌ 后端目录 (`backend/`) 没有 git 管理
- ❌ 根目录没有 git 仓库
- ✅ 根目录有 `.gitignore` 文件

**目录结构**:
```
common_managerment_platform/
├── frontend/          # 有 .git（需要删除）
├── backend/           # 无 git
├── shared/            # 共享代码
├── .gitignore         # 已存在
├── README.md          # 项目说明
├── requirement.md     # 需求文档
└── projectplan*.md    # 计划文档
```

## 实施方案

### 方案选择：在根目录创建新的 Git 仓库

**原因**:
1. 前后端作为一个整体更易于管理
2. 方便统一版本控制
3. 便于协同开发和部署
4. 共享文档和配置文件

### 实施步骤

#### Todo 列表

- [ ] 1. 检查并完善根目录 `.gitignore` 文件
- [ ] 2. 删除前端目录的 `.git` 仓库
- [ ] 3. 在根目录初始化 Git 仓库
- [ ] 4. 添加远程仓库地址
- [ ] 5. 添加所有文件到暂存区
- [ ] 6. 创建初始提交
- [ ] 7. 推送到远程仓库

## 详细步骤

### 步骤 1：检查 `.gitignore` 文件

确保以下内容被忽略：

**前端**:
- `frontend/node_modules/`
- `frontend/.next/`
- `frontend/out/`
- `frontend/dist/`
- `frontend/.env*.local`

**后端**:
- `backend/node_modules/`
- `backend/dist/`
- `backend/.env`
- `backend/logs/`

**通用**:
- `.DS_Store`
- `*.log`
- `.idea/`
- `*.swp`

### 步骤 2：删除前端的 `.git` 目录

```bash
rm -rf frontend/.git
```

### 步骤 3：初始化根目录 Git 仓库

```bash
git init
```

### 步骤 4：添加远程仓库

```bash
git remote add origin https://github.com/JojoShine/owl.git
```

### 步骤 5：添加文件到暂存区

```bash
git add .
```

### 步骤 6：创建初始提交

```bash
git commit -m "Initial commit: Common Management Platform

- Frontend: Next.js + React management system
- Backend: Node.js + Express API server
- Features: User management, role management, permission system, file management, etc.
"
```

### 步骤 7：推送到远程仓库

```bash
# 检查远程仓库是否为空，如果不为空可能需要 force push
git push -u origin main
# 或者如果远程有内容且需要强制推送
# git push -u origin main --force
```

## 注意事项

### 1. 远程仓库检查

- ⚠️ 如果远程仓库已有内容，需要先确认是否可以覆盖
- ⚠️ 如果远程有重要内容，建议先拉取合并再推送

### 2. 敏感信息检查

在提交前确认以下文件**不要**被提交：
- ❌ `.env` 文件
- ❌ 数据库配置中的密码
- ❌ API 密钥
- ❌ `node_modules/` 目录
- ❌ 编译产物目录

### 3. 大文件检查

确认是否有大文件（>100MB）：
- 如果有，考虑使用 Git LFS
- 或者将其添加到 `.gitignore`

### 4. Git 分支策略

建议的分支结构：
- `main` - 主分支（生产环境）
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

## 执行前确认清单

- [ ] 远程仓库地址正确：https://github.com/JojoShine/owl.git
- [ ] 已检查 `.gitignore` 文件完整性
- [ ] 已确认没有敏感信息会被提交
- [ ] 已了解远程仓库当前状态（是否为空）
- [ ] 已备份重要代码（如有需要）

## 后续工作

推送成功后：
- [ ] 配置 GitHub Actions（可选）
- [ ] 设置分支保护规则（可选）
- [ ] 添加 README.md 徽章（可选）
- [ ] 配置 CI/CD 流程（可选）

---

**创建时间**: 2025-10-23
**预计工期**: 30 分钟
**优先级**: 高
**复杂度**: 简单

---

## 等待用户确认

请确认以下问题：
1. ✅ 远程仓库 `https://github.com/JojoShine/owl.git` 是否为空？
2. ✅ 如果远程仓库已有内容，是否可以强制推送覆盖？
3. ✅ 是否需要保留前端原有的 git 历史记录？

确认后我将开始执行上述步骤。
