# Chrome 扩展程序：BroadcastChannel 模拟器

本文档概述了一个 Chrome 扩展程序的设计，该扩展程序模拟了 `BroadcastChannel` API 的功能，实现了跨标签页通信。

## 1. 架构概览 (4+1 视图)

### 1.1. 逻辑视图

系统由以下关键组件和层次构成：

-   **`Message` (消息层)**: 位于最上层，供业务逻辑直接调用。它通过 `receiverId` 在同一页面、同一频道内进行消息的精确分发。
-   **`BroadcastChannel Shim` (兼容层)**: 一个兼容原生 `BroadcastChannel` API 的接口。`Message` 类通过它进行通信。它负责将 `channelName` 附加到消息上。
-   **`ChromeBroadcastChannel.js` (注入层)**: 由内容脚本注入到页面中，实现兼容层的接口。它获取当前页面的 `tabId`，并将 `(channelName, tabId, receiverId)` 的完整寻址信息发送给后台。
-   **`content-script.js` (桥接层)**: 作为页面和后台之间的桥梁，在两者之间传递消息。
-   **`background.js` (路由层)**: 扩展程序的 Service Worker，作为消息路由中枢。它维护一个 `channelName -> tabId` 的路由表，实现跨标签页的消息广播。

### 1.2. 进程视图

#### 1.2.1. 核心概念：三级寻址

为了在整个浏览器范围内精确定位到一个接收者，消息的寻址采用了 `(channelName, tabId, receiverId)` 三元组结构：

-   `channelName`: 顶级频道，用于隔离不同的通信场景，类似于 `BroadcastChannel` 的原生概念。
-   `tabId`: 浏览器标签页的唯一标识，由 Chrome Extension API 提供，用于跨页面寻址。
-   `receiverId`: 页面内部的监听者 ID，由 `Message` 类管理，用于在页面内将消息派发给具体的业务逻辑单元。

#### 1.2.2. 注册与注销流程

`background.js` 需要动态维护一份路由表，才能知道哪些 `tabId` 订阅了哪个 `channelName`。

1.  **注册**: 当页面首次创建 `ChromeBroadcastChannel` 实例时，它会向 `background.js` 发送一条“注册”消息，包含 `channelName`。`background.js` 收到后，将发送方的 `tabId` 与 `channelName` 关联，存入路由表（例如 `Map<channelName, Set<tabId>>`）。
2.  **注销**: 当标签页关闭时，`background.js` 会监听 `chrome.tabs.onRemoved` 事件，并从路由表中移除所有与该 `tabId` 相关的记录，防止向已关闭的页面发送消息。

#### 1.2.3. 消息发送流程 (自上而下)

1.  **`Message` 层**: 业务逻辑调用 `message.send(type, { receiverId: 'someId', ... })`。
2.  **兼容层**: `BroadcastChannel` 实例的 `postMessage` 被调用。它将 `channelName` 附加到消息上，形成 `{ channel, payload: { type, data } }` 结构，然后传递给下一层。
3.  **注入层 (`ChromeBroadcastChannel`)**: 它通过 `document.dispatchEvent` 将消息发送给 `content-script.js`。
4.  **桥接层 (`content-script`)**: 捕获到页面的事件，调用 `chrome.runtime.sendMessage` 将消息发送给 `background.js`。此时，Chrome API 会自动将发送方的 `tab` 信息（包含 `tabId`）附加到消息中。
5.  **路由层 (`background.js`)**: 收到包含完整寻址信息的消息。

#### 1.2.4. 消息接收与分发流程 (自下而上)

1.  **路由层 (`background.js`)**: 
    -   从收到的消息中提取 `channelName`。
    -   根据 `channelName` 从路由表中查询出所有已注册的 `tabId` 列表。
    -   遍历 `tabId` 列表，调用 `chrome.tabs.sendMessage(tabId, message)` 将消息逐个发送给对应的 `content-script.js`（除了发送方自身）。
2.  **桥接层 (`content-script`)**: 接收到来自 `background.js` 的消息，通过 `document.dispatchEvent` 将事件派发到页面 DOM，事件名中包含 `channelName` 以便精确通知。
3.  **注入层 (`ChromeBroadcastChannel`)**: 监听 `document` 上的事件。收到事件后，它隐藏（剥离）`tabId` 信息，然后调用兼容层接口。
4.  **兼容层**: 触发 `onmessage` 事件，将带有 `receiverId` 的消息载荷传递给 `Message` 实例。
5.  **`Message` 层**: `handleMessage` 方法被触发。它解析出 `receiverId`，并从内部的 `listeners` 映射中找到对应的处理函数并执行，完成最终的消息分发。

### 1.3. 开发视图

文件结构组织清晰，以分离关注点。

```
chrome-extension/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background.js
├── content-script.js
├── ChromeBroadcastChannel.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── options/
    ├── options.html
    ├── options.css
    └── options.js
```

### 1.4. 物理视图

这是一个浏览器扩展程序，因此它完全在用户的 Chrome 浏览器中运行。`background.js` 脚本作为 Service Worker 运行，而 `content-script.js` 及其相关的 `ChromeBroadcastChannel.js` 在每个网页的上下文中运行。

## 2. 文件描述

-   **`manifest.json`**：Chrome 扩展程序的核心配置文件。它定义了权限（`tabs`、`scripting`）、后台 Service Worker、内容脚本以及弹出窗口和选项页面等 UI 组件。
-   **`icons/`**：包含扩展程序各种尺寸图标的目录。
-   **`background.js`**：Service Worker。其唯一职责是充当消息中继。它监听来自内容脚本的消息，并将其广播到所有其他相关标签页。
-   **`content-script.js`**：注入到网页中。它将 `ChromeBroadcastChannel.js` 脚本注入到页面的上下文中，并建立页面与 `background.js` 脚本之间的双向通信通道。
-   **`ChromeBroadcastChannel.js`**：面向用户的库。它旨在替代原生的 `BroadcastChannel`。它打包消息并将其发送到 `content-script`，并监听传入消息以触发 `onmessage` 事件。
-   **`popup/popup.html`**：当用户点击扩展程序图标时出现的弹出窗口的 HTML 结构。
-   **`popup/popup.css`**：弹出窗口的样式。
-   **`popup/popup.js`**：弹出窗口的逻辑，例如显示连接状态或最新消息。
-   **`options/options.html`**：扩展程序选项页面的 HTML 结构。
-   **`options/options.css`**：选项页面的样式。
-   **`options/options.js`**：选项页面的逻辑，例如允许用户配置扩展程序在哪些网站上处于活动状态或其他设置。
-   **`webpack.chrome.js`**: 用于构建 Chrome 扩展程序的 Webpack 配置文件。它负责处理多个 JavaScript 入口文件（如 `background.js`, `content-script.js` 等），将它们打包，并允许它们使用 ES6 模块和从 `src/` 目录导入代码。它还使用 `CopyWebpackPlugin` 将 `manifest.json`、HTML、CSS 和图标等静态资源复制到输出目录。
-   **`chrome-extension-key.pem`**: 用于签名扩展程序的私钥。**注意：此文件至关重要，且不应提交到版本控制系统中**。`.gitignore` 文件已配置为忽略所有 `.pem` 文件。

## 3. API 设计 (`ChromeBroadcastChannel.js`)

`ChromeBroadcastChannel` 类将具有以下公共接口，镜像标准的 `BroadcastChannel` API：

```javascript
class ChromeBroadcastChannel {
    // ... (API design remains the same)
}
```

## 4. 构建与打包

项目包含一个自动化的构建流程，用于打包和签名 Chrome 扩展程序。

### 4.1. 构建命令

通过运行以下命令来启动构建过程：

```bash
npm run chrome:build
```

### 4.2. 构建流程

该命令会执行以下一系列操作：

1.  **清理旧文件**: 删除 `dist/` 目录中任何先前构建的扩展文件（`dist/chrome-extension`, `dist/chrome-extension.zip`, `dist/chrome-extension.crx`）。
2.  **Webpack 打包**: 使用 `webpack.chrome.js` 配置来编译和打包所有相关的 JavaScript 文件。
3.  **签名扩展**: 使用 `crx` 工具和 `chrome-extension-key.pem` 私钥对 `dist/chrome-extension` 目录中的内容进行签名，生成一个 `.crx` 文件。`.crx` 文件用于在非官方商店的场景下分发或进行本地测试。
4.  **创建 ZIP 包**: 将 `dist/chrome-extension` 目录的内容压缩成 `dist/chrome-extension.zip` 文件。这个 ZIP 文件是最终上传到 Chrome 网上应用店的格式。

## 5. 发布到 Chrome 网上应用店

### 5.1. 证书管理

-   **首次发布**: `chrome-extension-key.pem` 文件是在项目初始化时自动生成的。当你首次将扩展上传到 Chrome 商店时，商店会为你生成一个新的、官方的私钥。对于后续的所有更新，你都必须使用最初上传时生成的那个包（或者说，使用同一个私钥）。
-   **更新扩展**: 为了更新你在商店中的应用，你必须使用首次上传时所用的同一个私钥。如果你丢失了这个私钥，你将无法再更新你的扩展，只能以新的 ID 重新发布一个全新的扩展。因此，**请务必备份好你的私钥**。
-   **更换本地证书**: 如果你需要更换本地测试用的 `chrome-extension-key.pem` 文件，只需删除旧文件，然后使用 `openssl` 等工具生成一个新文件即可。但这不会影响到已发布在商店的扩展。

### 5.2. 发布步骤

1.  **注册开发者账号**: 访问 [Chrome 网上应用店开发者信息中心](https://chrome.google.com/webstore/developer/dashboard)，并支付一次性的注册费用（通常是 5 美元）以创建开发者账号。
2.  **准备上传包**: 运行 `npm run chrome:build` 命令，生成 `dist/chrome-extension.zip` 文件。
3.  **上传新项目**: 
    -   在开发者信息中心，点击“添加新内容”按钮。
    -   上传你刚刚生成的 `dist/chrome-extension.zip` 文件。
4.  **填写商品详情**: 
    -   提供详细的扩展程序描述、功能说明。
    -   上传符合要求的图标（特别是 128x128）和至少一张屏幕截图。
    -   选择正确的分类和语言。
5.  **设置隐私权和分发**: 
    -   提供你的隐私权政策链接（如果需要）。
    -   选择分发范围（公开、不公开或私密）。
6.  **提交审核**: 保存草稿并点击“提交以供审核”。Google 会对你的扩展进行审查，这可能需要几天时间。

### 5.3. 注意事项

-   **版本号**: 每次上传更新时，都必须在 `manifest.json` 文件中增加 `"version"` 字段的值。否则，Chrome 商店将拒绝你的上传。
-   **保持一致性**: 确保你的商店商品详情与你的扩展功能保持一致，避免因误导性描述而被拒绝。
-   **关注审核反馈**: 如果你的扩展被拒绝，请仔细阅读审核人员提供的反馈，并根据要求进行修改后重新提交。
