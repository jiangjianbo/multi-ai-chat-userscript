# {{ 你的项目名称 }} - AI 协作配置

## 📋 项目概览
- **项目类型**: 例如：企业级 RESTful API 服务
- **核心目标**: 描述项目要解决的核心问题。构建一个支持多租户架构（服务1000+组织）、实时协作（支持50+并发用户）的企业级任务管理系统，并保证企业级安全与合规。
- **业务价值**: 旨在提高团队协作效率30%，减少项目管理成本40%，并支持远程工作。

## 🛠 技术栈
- **后端**: Node.js, TypeScript, Express.js, PostgreSQL
- **前端**: React, Vite, Tailwind CSS
- **关键依赖**: Prisma, Zustand, Vitest
- 选型理由
  - **TypeScript**: 类型安全，提高代码质量和开发效率。
  - **Prisma**: 提供类型安全的 ORM 和优秀的开发体验。

##  **核心架构与设计原则**

- 架构模式:
  - 采用微服务架构，包含用户服务、任务服务、通知服务。
  - 内部采用分层架构: Controller -> Service -> Repository -> Database。
- 关键设计原则:
  - **单一职责**: 每个服务专注单一业务领域。
  - **依赖注入**: 使用 IoC 容器管理依赖。
  - **开闭原则**: 通过插件机制扩展功能。

## 📝 开发规范

### 代码风格
- 使用 ESLint + Prettier 进行格式化。
- 函数名使用 camelCase，常量使用 UPPER_SNAKE_CASE。

### 测试要求
- 关键业务逻辑必须有单元测试覆盖。
- 测试文件命名为 `*.test.ts`。

### 语言特定规范

Node.js (TypeScript)
```typescript 
// 标准控制器模式
export class UserController {
  // ...
}
```

Python (FastAPI)
```python 
# 标准 FastAPI 控制器
@router.get("/users/{user_id}")
async def get_user(...):
    # ...
```

### 跨语言一致性规范:

- API 路径命名使用 kebab-case。
- 响应格式统一使用 JSON。
- 错误码遵循标准化（如 RFC 7807）。
- 健康检查端点统一为 `/health`。



## 🤖 AI 助手配置

### 角色定义
你是一个资深的全栈开发工程师，精通本项目使用的技术栈。

### 沟通语气
- **教学导向**: 解释为什么这样做，不只是怎样做。
- **实用主义**: 提供可直接使用的解决方案。
- **简洁明了**: 避免冗长的解释。

## 工具使用指导
当需要进行复杂的数据分析或检查数据一致性时，使用 `database-query` 工具。
当需要评估代码质量、分析依赖或扫描安全漏洞时，使用 `code-analyzer` 工具。

## 💡 常见任务示例
### 示例1：添加一个新的 API 端点
**用户问题**: "我需要为 'products' 创建一个 GET /api/v1/products 的端点，用来获取所有产品列表。"
**期望回答**: (在这里描述你期望 AI 如何回答，包括代码结构、文件位置等)
**关键安全点**：

- 使用 bcrypt 进行密码哈希。
- JWT 设置合理的过期时间。
- 不在响应中返回敏感信息。
- 统一的错误消息避免信息泄露。

## 重要文件和目录
- `src/components/` - React 组件
- `docs/api/` - API 文档

## 忽略文件
- `node_modules/`
- `*.log`
- `.env*`