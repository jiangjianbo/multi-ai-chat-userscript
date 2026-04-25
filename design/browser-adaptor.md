# BrowserAdaptor 设计文档

## 概述

BrowserAdaptor 是一个浏览器页面操作适配器抽象层，将所有对浏览器窗口、Tab、通信、存储等底层操作抽象为统一接口。Tampermonkey 和 Chrome 扩展各自实现这些接口，使上层业务代码无需关心运行环境差异。

## 模块依赖关系

```
browser-adaptor.js (抽象基类)
  ├── tampermonkey-adaptor.js (Tampermonkey 实现)
  └── chrome-adaptor.js (Chrome 扩展实现)
```

依赖 browser-adaptor 的模块：
- `index.js` - 入口点，创建 adaptor 实例
- `main-window-initializer.js` - 主窗口初始化，创建 adaptor 实例
- `page-controller.js` - 原生页面控制器，使用 adaptor 进行页面操作
- `main-window-controller.js` - 主窗口控制器，使用 adaptor 管理窗口
- `sync-chat-window.js` - 主窗口创建器，使用 adaptor 管理窗口
- `storage.js` - 存储模块，通过 adaptor 访问存储 API
- `message.js` - 消息模块，通过 adaptor 创建通信频道

## 接口定义

### 窗口/Tab 管理

| 方法 | 说明 | 返回值 |
|---|---|---|
| `ensureMainWindow(windowName, cacheKey, options, createWindowContentFn)` | 检查并创建主窗口（完整封装查找/创建/缓存/写入流程） | `Promise<{handle}>` |
| `isMainWindowCached(cacheKey)` | 检查缓存中的主窗口是否存活 | `boolean` |
| `openTab(url, target)` | 打开新 Tab | `Promise<handle>` |
| `focusWindow(handle)` | 激活窗口 | `Promise<void>` |
| `isWindowAlive(handle)` | 检查窗口是否存活 | `boolean` |
| `closeCurrentWindow()` | 关闭当前窗口 | `void` |

### 当前页面信息

| 方法 | 说明 | 返回值 |
|---|---|---|
| `getCurrentWindowName()` | 获取当前窗口 name | `string` |
| `getCurrentUrl()` | 获取当前 URL | `string` |
| `getCurrentHostname()` | 获取当前 hostname | `string` |
| `getUrlParam(paramName)` | 获取 URL 查询参数 | `string\|null` |

### 通信

| 方法 | 说明 | 返回值 |
|---|---|---|
| `createChannel(channelName)` | 创建跨窗口通信频道 | `BroadcastChannel 兼容对象` |

### 存储

| 方法 | 说明 | 返回值 |
|---|---|---|
| `storageSet(key, value)` | 存储数据 | `void` |
| `storageGet(key)` | 读取数据 | `string\|null` |
| `storageRemove(key)` | 删除数据 | `void` |

### 页面生命周期

| 方法 | 说明 | 返回值 |
|---|---|---|
| `onBeforeUnload(callback)` | 监听页面卸载 | `void` |
| `onVisibilityChange(callback)` | 监听可见性变化 | `void` |
| `onDocumentReady(callback, delay)` | 文档就绪回调 | `void` |
| `onTabRemoved(callback)` | 监听 Tab 关闭 | `void` |

## 实现差异

### TampermonkeyAdaptor

| 操作 | 实现方式 |
|---|---|
| `ensureMainWindow` | 检查 `window.top` 缓存 → `window.open('', name, features)` → 写入 DOM |
| `isMainWindowCached` | 检查 `window.top[key]` 是否存活 |
| `openTab` | `window.open(url, target)` |
| `focusWindow` | `handle.focus()` |
| `isWindowAlive` | `!handle.closed` |
| `closeCurrentWindow` | `window.close()` |
| `createChannel` | `new BroadcastChannel(name)` |
| `storageSet/Get/Remove` | `localStorage.setItem/getItem/removeItem` |

内部私有方法：`_findOrCreateNamedWindow`, `_getDocument`, `_setCachedWindowRef`, `_getCachedWindowRef`

### ChromeAdaptor

| 操作 | 实现方式 |
|---|---|
| `ensureMainWindow` | 检查本地缓存 → `chrome.runtime.sendMessage` 委托 background 查找/创建 tab |
| `isMainWindowCached` | 检查本地 `_windowCache` 引用 |
| `openTab` | `chrome.runtime.sendMessage` 请求 background 创建 |
| `focusWindow` | 通过 background 中转 `chrome.tabs.update` |
| `isWindowAlive` | 检查 handle 是否存在 |
| `closeCurrentWindow` | 通过 background 中转 `chrome.tabs.remove` |
| `createChannel` | `new BroadcastChannelForChrome(name)` |
| `storageSet/Get/Remove` | `chrome.storage.local` + `localStorage` 降级 |

内部私有方法：`_setCachedWindowRef`, `_getCachedWindowRef`

## 句柄（handle）抽象

`handle` 类型在不同实现中含义不同：

- **Tampermonkey**: `Window` 对象引用
- **Chrome 扩展**: `{tabId: number, windowId?: number}` 对象

调用方不感知具体类型，全部通过 adaptor 方法操作。

## 使用方式

### 在 index.js 中（原生页面入口）

```javascript
const adaptor = new TampermonkeyAdaptor();
const channel = adaptor.createChannel(config.get('channelName'));
const message = new Message(channel);
const pageController = new PageController(message, config, i18n, util, adaptor);
```

### 在 main-window-initializer.js 中（主窗口入口）

```javascript
const adaptor = new TampermonkeyAdaptor();
const channel = adaptor.createChannel(config.get('channelName'));
const message = new Message(channel);
const controller = new MainWindowController(mainWinId, message, config, i18n, adaptor);
```

### 向后兼容

所有修改的模块都保持向后兼容：
- `SyncChatWindow` 构造函数的 `adaptor` 参数可选，不提供时走原生 API 路径
- `MainWindowController` 构造函数的 `adaptor` 参数可选
- `PageController` 构造函数的 `adaptor` 参数可选
- `Message` 构造函数支持传入字符串（创建 BroadcastChannel）或已有 channel 对象
- `Storage` 构造函数第一个参数改为 `adaptor`，第二个参数仍是 `prefix`
