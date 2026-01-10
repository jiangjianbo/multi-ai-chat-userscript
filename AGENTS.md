# AGENTS.md - 代码规范与命令指南

## 构建与测试命令
```bash
pnpm run build              # 构建油猴脚本
pnpm test                   # 运行所有测试
pnpm test -- tests/util.test.js  # 运行单个测试文件
pnpm run test:watch         # 监听模式运行测试
pnpm run chrome:build       # 构建 Chrome 扩展
```

## 代码风格规范

### 类定义与命名
- 使用 ES6 `class` 语法，类名 `PascalCase`，方法名 `camelCase`，常量 `UPPER_SNAKE_CASE`
- 所有方法必须包含 JSDoc 注释（`@description`, `@param`, `@returns`）
- 方法定义后加分号：`myMethod() { ... };`

### HTML 生成
- **推荐**: 使用 `util.toHtml(json)` 生成 HTML（防止 XSS）
- **禁止**: 字符串拼接生成 HTML

### 测试
- 测试文件位于 `tests/`，命名为 `*.test.js`
- 使用 Jest + jsdom，mock 外部依赖
- 测试驱动开发：先写测试，测试定稿后非必要不修改

### 其他约定
- 所有 UI 文字使用 i18n key 引用（见 `src/lang.js`）
- 检查 `dist/jsdoc/` 了解类接口，再阅读源码
- 新增 AI 提供商需继承 `PageDriver` 并在 `driver-factory.js` 注册
