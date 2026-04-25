const BrowserAdaptor = require('./browser-adaptor');

/**
 * @description Chrome 扩展环境下的浏览器适配器实现。
 * 使用 chrome.tabs、chrome.windows、chrome.storage、ChromeBroadcastChannel 等。
 * 注意：此文件运行在 content script 的页面上下文中（通过注入），
 * 部分需要 background.js 中转的操作通过消息通信实现。
 */
class ChromeAdaptor extends BrowserAdaptor {

    constructor() {
        super();
        this._tabRemovedCallbacks = [];
        this._windowCache = {};
    }

    /**
     * @description 检查并创建主窗口。通过 background.js 管理 tab。
     * Chrome 扩展模式下主窗口是扩展内部 HTML 页面，不调用 createWindowContentFn。
     * @param {string} windowName - 窗口名称标识
     * @param {string} cacheKey - 缓存键名
     * @param {object} [options] - 创建新窗口时的选项
     * @param {function} [createWindowContentFn] - 在 Chrome 扩展模式下不会被调用
     * @returns {Promise<{handle: {tabId: number}|null}>}
     */
    async ensureMainWindow(windowName, cacheKey, options, createWindowContentFn) {
        // 步骤1: 检查本地缓存
        const cachedRef = this._getCachedWindowRef(cacheKey);
        if (cachedRef && this.isWindowAlive(cachedRef)) {
            console.log('Main window already exists (cached ref). Focusing on it.');
            await this.focusWindow(cachedRef);
            return { handle: cachedRef };
        }

        // 步骤2: 通过 background 查找或创建
        const response = await chrome.runtime.sendMessage({
            type: 'browserAdaptor',
            action: 'findOrCreateNamedWindow',
            name: windowName,
            options: options
        });

        if (!response || !response.handle) {
            return { handle: null };
        }

        const handle = response.handle;

        // 步骤3: 缓存到本地和 background
        this._setCachedWindowRef(cacheKey, handle);
        chrome.runtime.sendMessage({
            type: 'browserAdaptor',
            action: 'setCachedWindowRef',
            key: cacheKey,
            handle: handle
        });

        if (!response.isNew) {
            console.log('Main window already exists (found by name). Focusing on it.');
            await this.focusWindow(handle);
            return { handle };
        }

        // 步骤4: 新窗口（Chrome 扩展模式下主窗口内容由扩展自身 HTML 页面提供，不需要手动写入）
        console.log('Main window created (Chrome extension tab).');
        return { handle };
    }

    /**
     * @description 检查缓存中的主窗口是否存活。
     * @param {string} cacheKey - 缓存键名
     * @returns {boolean}
     */
    isMainWindowCached(cacheKey) {
        const cachedRef = this._getCachedWindowRef(cacheKey);
        return this.isWindowAlive(cachedRef);
    }

    /**
     * @description 打开一个新的 Tab 页面。
     * @param {string} url - 要打开的 URL
     * @param {string} [target='_blank'] - 目标窗口名称
     * @returns {Promise<{tabId: number}|null>}
     */
    async openTab(url, target) {
        const response = await chrome.runtime.sendMessage({
            type: 'browserAdaptor',
            action: 'openTab',
            url: url,
            target: target
        });
        return response ? response.handle : null;
    }

    /**
     * @description 激活（聚焦）指定的 tab。
     * @param {{tabId: number}} handle - tab 句柄
     */
    async focusWindow(handle) {
        if (handle && handle.tabId) {
            await chrome.runtime.sendMessage({
                type: 'browserAdaptor',
                action: 'focusWindow',
                handle: handle
            });
        }
    }

    /**
     * @description 检查指定的 tab 是否仍然存在。
     * @param {{tabId: number}} handle - tab 句柄
     * @returns {boolean}
     */
    isWindowAlive(handle) {
        // Chrome 扩展无法同步检查 tab 是否存活，返回 true 由调用方通过异步方式验证
        // 调用方可通过 try/catch focusWindow 来判断
        return !!handle;
    }

    /**
     * @description 关闭当前 tab。
     */
    closeCurrentWindow() {
        chrome.runtime.sendMessage({
            type: 'browserAdaptor',
            action: 'closeCurrentWindow'
        });
    }

    /**
     * @description 缓存窗口引用到本地实例。
     * @param {string} key - 缓存键名
     * @param {*} handle - tab 句柄
     * @private
     */
    _setCachedWindowRef(key, handle) {
        this._windowCache[key] = handle;
    }

    /**
     * @description 获取本地缓存的窗口引用。
     * @param {string} key - 缓存键名
     * @returns {*|null}
     * @private
     */
    _getCachedWindowRef(key) {
        return this._windowCache[key] || null;
    }

    /**
     * @description 获取当前窗口的 name 属性。
     * @returns {string}
     */
    getCurrentWindowName() {
        return window.name;
    }

    /**
     * @description 获取当前页面的完整 URL。
     * @returns {string}
     */
    getCurrentUrl() {
        return window.location.href;
    }

    /**
     * @description 获取当前页面的 hostname。
     * @returns {string}
     */
    getCurrentHostname() {
        return window.location.hostname;
    }

    /**
     * @description 获取当前页面 URL 的查询参数。
     * @param {string} paramName - 参数名
     * @returns {string|null}
     */
    getUrlParam(paramName) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramName);
    }

    /**
     * @description 创建 ChromeBroadcastChannel 通信频道。
     * @param {string} channelName - 频道名称
     * @returns {BroadcastChannelForChrome}
     */
    createChannel(channelName) {
        const BroadcastChannelForChrome = require('./chrome-channel');
        return new BroadcastChannelForChrome(channelName);
    }

    /**
     * @description 持久化存储数据到 chrome.storage.local。
     * @param {string} key - 存储键
     * @param {string} value - 存储值
     */
    storageSet(key, value) {
        const obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj);
    }

    /**
     * @description 从 chrome.storage.local 读取数据。
     * 注意：Chrome 扩展的 storage API 是异步的，但此接口设计为同步。
     * 使用 localStorage 作为同步降级方案。
     * @param {string} key - 存储键
     * @returns {string|null}
     */
    storageGet(key) {
        return localStorage.getItem(key);
    }

    /**
     * @description 从 chrome.storage.local 删除数据。
     * @param {string} key - 存储键
     */
    storageRemove(key) {
        chrome.storage.local.remove(key);
        localStorage.removeItem(key);
    }

    /**
     * @description 监听页面卸载事件。
     * @param {function} callback - 卸载时的回调函数
     */
    onBeforeUnload(callback) {
        window.addEventListener('beforeunload', callback);
    }

    /**
     * @description 监听页面可见性变化。
     * @param {function} callback - 回调函数
     */
    onVisibilityChange(callback) {
        document.addEventListener('visibilitychange', () => {
            callback(document.hidden);
        });
    }

    /**
     * @description 文档加载完成后的回调。
     * @param {function} callback - 回调函数
     * @param {number} [delay=5000] - 延迟毫秒数
     */
    onDocumentReady(callback, delay = 5000) {
        if (document.readyState === 'complete') {
            setTimeout(callback, delay);
        } else {
            window.addEventListener('load', () => {
                setTimeout(callback, delay);
            });
        }
    }

    /**
     * @description 监听 tab 关闭事件。
     * @param {function} callback - 回调函数，参数为 tabId
     */
    onTabRemoved(callback) {
        this._tabRemovedCallbacks.push(callback);
    }
}

module.exports = ChromeAdaptor;
