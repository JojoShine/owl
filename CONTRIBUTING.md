# 贡献指南

首先感谢你对 Owl Platform 的兴趣！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

如果发现 bug，请通过 [GitHub Issues](https://github.com/JojoShine/owl/issues) 提交报告，包含：

- 清晰的标题和描述
- 复现步骤
- 实际行为
- 预期行为
- 环境信息（操作系统、Node.js 版本等）

### 提交功能请求

对于新功能的建议，请：

1. 先在 [Discussions](https://github.com/JojoShine/owl/discussions) 中讨论
2. 确认不与现有功能冲突
3. 提交 Issue 详细说明需求和用例

### 提交代码

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循代码规范（见下文）
4. 提交代码 (`git commit -m 'Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 提交 Pull Request

#### 代码规范

- **风格一致性**：遵循现有代码风格
  - 后端：参见 `backend/src` 中的现有代码
  - 前端：参见 `frontend/app` 中的现有代码
- **提交信息**：清晰描述改动
  - feat: 新功能
  - fix: 修复 bug
  - refactor: 重构
  - docs: 文档更新
  - test: 测试用例
- **文档**：更新相关文档
- **测试**：添加或更新测试用例

#### 提交 PR 的要求

- 标题清晰简洁
- 描述详细，包含：
  - 解决的问题或新增功能
  - 测试方法
  - 相关 Issue（如有）
- 不包含不相关的改动

### 改进文档

文档总是需要改进！你可以：

- 修复拼写或语法错误
- 补充示例或说明
- 翻译文档
- 添加新的使用场景

## 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/JojoShine/owl.git
cd owl

# 后端开发
cd backend
npm install
cp .env.example .env
npm run db:init
npm run dev

# 前端开发（新终端）
cd frontend
npm install
npm run dev
```

详见 [系统初始化指南](./docs/02-initialization.md)。

## 代码审查流程

- 所有 PR 需至少一位维护者审查
- 代码审查关注：
  - 功能正确性
  - 代码质量
  - 测试覆盖
  - 文档完整性
  - 安全性

## 行为准则

本项目采纳 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。

参与者同意遵守该准则以确保一个友好、安全、包容的社区环境。

## 许可证

提交的代码将在 MIT 许可证下发布。

## 问题反馈

有问题或建议？

- GitHub Issues：提交 bug 或功能请求
- GitHub Discussions：讨论功能设计或使用问题

感谢你的贡献！
