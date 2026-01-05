# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
在输出文档内容和解释说明的时候，无论用什么语言输入，回复都优先使用中文！

## Project Overview

**Multi AI Sync Chat** 是一个支持多平台（Tampermonkey 脚本 + Chrome 扩展）的多 AI 同步聊天工具。用户可以在统一界面中同时与多个 AI 平台（Kimi, Gemini, ChatGPT, DeepSeek, Grok, Tongyi）对话，并对比它们的回答。

- **无后端服务器** - 完全在浏览器中运行
- **跨窗口通信** - 通过 BroadcastChannel API 或 Chrome 扩展消息传递
- **支持 8 种语言** - 包括阿拉伯语的 RTL 支持
- **多布局支持** - 1/2/3/4/6 面板布局
- **双平台支持** - Tampermonkey 油猴脚本 + Chrome 扩展

## Build and Test Commands

```bash
# 基础构建和测试
pnpm run build              # 构建油猴脚本 dist/multi-ai-sync-chat.userscript.js
pnpm test                   # 运行所有 Jest 测试
pnpm run test:watch         # 监听模式运行测试

# Chrome 扩展构建
pnpm run chrome:build       # 构建 Chrome 扩展（生成 .crx 和 .zip）

# 研究代码构建
pnpm run research:build     # 构建研究代码
pnpm run research:watch     # 监听模式构建研究代码
pnpm run research:main-window  # 仅构建主窗口研究代码
```

构建使用 Webpack + Babel 转译，Terser 压缩（保留 UserScript 头部注释）。

## Architecture

### 主从分离架构

- **原生页面（从）**: 注入"同步对比"按钮和 PageDriver。使用 `PageController` + 具体的 `PageDriver`（如 `KimiPageDriver`）。
- **主窗口（主）**: 独立的控制面板窗口（`window.name === 'multi-ai-chat-main-window'`）。由 `MainWindowController` 管理，包含多个 `ChatArea` 实例。

### 平台支持

1. **Tampermonkey 脚本**: 使用 BroadcastChannel API 跨窗口通信
2. **Chrome 扩展**: 使用 Chrome 扩展消息传递机制 (`chrome.runtime.sendMessage`)，通过 `ChromeBroadcastChannel` 桥接

### 入口点

`src/index.js` 根据环境初始化：
- 如果是主窗口（`window.name === 'multi-ai-chat-main-window'`）→ 跳过初始化
- 否则 → 初始化 `PageController` 用于原生 AI 页面

主窗口由 `main-window-initializer.js` 初始化，该文件在构建时被编译并注入到主窗口 HTML 中。

### 驱动模式

每个 AI 平台都有继承自 `PageDriver` 的具体驱动。驱动封装平台特定的 DOM 选择器（输入框、发送按钮、对话区域等）。见 `src/driver-factory.js` 的 URL 到驱动的映射。

### 消息协议

通过 `Message` 类和 `MessageClient` 进行语义化通信：

**Tampermonkey 版本** - 使用 BroadcastChannel (`multi-ai-chat-channel`)：
- `register_chat_area`: 原生页面通知主窗口创建聊天区域
- `sync_chat`: 主窗口发送消息到原生页面
- `chat_started` / `chat_completed` / `chat_failed`: 聊天状态通知
- `param_changed` / `param_value`: 参数变更通信
- `get_param`: 获取参数值

**Chrome 扩展版本** - 使用 `ChromeBroadcastChannel` 桥接到 Chrome 消息 API

### 模块依赖关系

```
工具类 (util) ← 几乎所有模块依赖
配置参数 (config) ← 持久存储 (storage)
消息通讯 (message) ← 工具类
国际化 (i18n) ← 配置参数、工具类

原生页面驱动 (page-driver) ← 工具类
原生页面控制器 (page-controller) ← 驱动、消息、工具类、配置、国际化
内容块 (chat-area) ← 消息、工具类、配置、国际化
主窗口控制器 (main-window-controller) ← 内容块、工具类、配置、国际化、驱动工厂
主窗口创建器 (sync-chat-window) ← 工具类
```

详细架构见 `design/architect.md` 中的 Mermaid 图。

## Code Style Requirements

**重要**: 本项目使用特定的编码风格，与现代 JavaScript 约定不同。

### 类定义

使用 `function` 构造函数，而非 `class` 语法：
```javascript
function MyClass(args) {
    this.property = 'value';

    /**
     * @description 初始化方法
     */
    this.init = function() {
        // 初始化逻辑
    };

    /**
     * @description 方法描述
     * @param {string} param1 - 参数描述
     * @returns {boolean} 返回值描述
     */
    this.myMethod = function(param1) {
        return true;
    };
}
```

### 命名规范

- 类名: `PascalCase`
- 方法/函数名: `camelCase`
- 常量: `UPPER_SNAKE_CASE`
- 所有方法必须包含 JSDoc 注释

### HTML 生成

- **推荐**: 使用 `util.toHtml(json)` 将 JSON 结构转换为 HTML
- **允许**: 使用 `document.createElement` + `appendChild` 等原生 DOM API，但尽量少用
- **禁止**: 字符串拼接生成 HTML（XSS 风险）

`util.toHtml` 支持格式：
```javascript
// 标准格式
{ tag: 'div', '@class': 'my-class', text: 'content' }

// 简写格式
{ div: 'content', '@id': 'my-id' }

// 嵌套结构
{ tag: 'div', child: [
    { tag: 'span', text: 'hello' },
    { tag: 'span', text: 'world' }
]}
```

## Testing

- 测试文件位于 `tests/` 目录，命名为 `*.test.js`
- 使用 Jest + jsdom 环境
- 测试驱动开发：先写测试，测试定稿后非必要不修改
- 在测试中 mock 依赖（如 `I18n`）

参考 `tests/util.test.js` 了解测试模式。

## Adding a New AI Provider

1. 在 `src/` 创建新的 PageDriver（如 `claude-page-driver.js`）
2. 继承自 `PageDriver`，覆盖 `selectors` 对象
3. 在 `src/driver-factory.js` 中添加 URL 映射
4. 在 `tests/` 中编写测试
5. （可选）更新默认 AI 提供商列表

## Key Files

### 核心源文件
- `src/index.js`: 入口点，检测环境
- `src/page-controller.js`: 原生页面控制器
- `src/sync-chat-window.js`: 主窗口创建和管理
- `src/main-window-controller.js`: 主窗口核心控制器
- `src/main-window-initializer.js`: 主窗口js代码构造器，编译时候会单独编译到输出文件中，然后输出文件内容替换到主窗口html的标记位置，让主窗口可以以独立和无依赖的方式运行脚本
- `src/chat-area.js`: 单个 AI 对话面板
- `src/page-driver.js`: 页面驱动基类
- `src/driver-factory.js`: AI 提供商驱动映射工厂
- `src/message.js`: 消息通信基类
- `src/message-client.js`: 语义化消息客户端
- `src/chrome-channel.js`: Chrome 扩展广播通道桥接
- `src/util.js`: DOM 工具方法
- `src/config.js`: 配置参数管理
- `src/storage.js`: localStorage 封装
- `src/i18n.js`: 国际化支持
- `src/lang.js`: 语言包定义

### Chrome 扩展
- `chrome-extension/manifest.json`: 扩展清单
- `chrome-extension/background.js`: 后台脚本
- `chrome-extension/content-script.js`: 内容脚本
- `chrome-extension/ChromeBroadcastChannel.js`: BroadcastChannel 桥接

### 文档
- `design/architect.md`: 总体架构设计（包含模块依赖图）
- `design/`: 各模块的详细设计文档
- `GEMINI.md`: AI 助手配置和开发规范
- `userscript.meta.js`: Tampermonkey 元数据
- `research/`: 各种技术预研、仿真等相关的文件，研究成果可以平滑迁移到正式代码中

## localStorage

Key: `multi_ai_sync_config`
结构: `{ providers: [{name, url}, ...], layout: 3, lang: 'zh' }`

## Important Constraints

- 原生页面只注入"同步对比"按钮；所有其他逻辑通过消息通信
- 主窗口是独立 tab，支持 1/2/4/6 面板布局
- 所有 UI 文字使用 i18n key 引用
- 阿拉伯语需要 RTL 支持
- 主窗口通过 `window.name === 'multi-ai-chat-main-window'` 标识
- 所有模块都有对应的设计文档（`design/*.md`）
