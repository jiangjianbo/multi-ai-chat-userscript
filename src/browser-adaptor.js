
/**
 * @description 浏览器页面操作适配器抽象基类。
 * 将所有对浏览器窗口、Tab、通信、存储等底层操作抽象为统一接口，
 * Tampermonkey 和 Chrome 扩展各自实现这些接口。
 */
class BrowserAdaptor {

    /**
     * @description 检查并创建主窗口。完整封装窗口查找、创建、缓存、内容写入流程。
     * Tampermonkey 下通过 window.open + DOM 写入实现；Chrome 扩展下通过 background.js 管理 tab 实现。
     * @param {string} windowName - 窗口名称标识（如 'multi-ai-chat-main-window'）
     * @param {string} cacheKey - 缓存键名（如 'multiAiChatMainWindow'）
     * @param {object} options - 创建新窗口时的选项
     * @param {number} [options.width] - 窗口宽度
     * @param {number} [options.height] - 窗口高度
     * @param {function} [createWindowContentFn] - 新窗口创建后的回调，接收 Document 对象，
     *   用于向新窗口写入内容。Chrome 扩展模式下此回调不会被调用。
     * @returns {Promise<{handle: *}>} - 返回窗口句柄对象，handle 可能为 null（如弹窗被拦截）
     */
    async ensureMainWindow(windowName, cacheKey, options, createWindowContentFn) {
        throw new Error('Not implemented');
    }

    /**
     * @description 检查缓存中的主窗口是否仍然存活。
     * 封装了「从缓存取引用 + 检查存活」的联合操作。
     * @param {string} cacheKey - 缓存键名
     * @returns {boolean} - 存在且存活返回 true
     */
    isMainWindowCached(cacheKey) {
        throw new Error('Not implemented');
    }

    /**
     * @description 打开一个新的 Tab 页面。
     * @param {string} url - 要打开的 URL
     * @param {string} [target='_blank'] - 目标窗口名称，用于窗口复用
     * @returns {Promise<*>} - 返回窗口/tab 句柄
     */
    async openTab(url, target) {
        throw new Error('Not implemented');
    }

    /**
     * @description 激活（聚焦）指定的窗口/tab。
     * @param {*} handle - 窗口/tab 句柄
     * @returns {Promise<void>}
     */
    async focusWindow(handle) {
        throw new Error('Not implemented');
    }

    /**
     * @description 检查指定的窗口/tab 是否仍然存在（未关闭）。
     * @param {*} handle - 窗口/tab 句柄
     * @returns {boolean} - 存在返回 true，否则 false
     */
    isWindowAlive(handle) {
        throw new Error('Not implemented');
    }

    /**
     * @description 关闭当前窗口。
     * @returns {void}
     */
    closeCurrentWindow() {
        throw new Error('Not implemented');
    }

    /**
     * @description 获取当前窗口的 name 属性。
     * @returns {string} - 窗口名称
     */
    getCurrentWindowName() {
        throw new Error('Not implemented');
    }

    /**
     * @description 获取当前页面的完整 URL。
     * @returns {string} - 当前页面 URL
     */
    getCurrentUrl() {
        throw new Error('Not implemented');
    }

    /**
     * @description 获取当前页面的 hostname。
     * @returns {string} - hostname
     */
    getCurrentHostname() {
        throw new Error('Not implemented');
    }

    /**
     * @description 获取当前页面 URL 的查询参数。
     * @param {string} paramName - 参数名
     * @returns {string|null} - 参数值
     */
    getUrlParam(paramName) {
        throw new Error('Not implemented');
    }

    /**
     * @description 创建一个跨窗口通信频道。
     * @param {string} channelName - 频道名称
     * @returns {object} - 兼容 BroadcastChannel API 的通信对象
     */
    createChannel(channelName) {
        throw new Error('Not implemented');
    }

    /**
     * @description 持久化存储数据。
     * @param {string} key - 存储键
     * @param {string} value - 存储值（JSON 字符串）
     */
    storageSet(key, value) {
        throw new Error('Not implemented');
    }

    /**
     * @description 读取持久化存储的数据。
     * @param {string} key - 存储键
     * @returns {string|null} - 存储的值，不存在则返回 null
     */
    storageGet(key) {
        throw new Error('Not implemented');
    }

    /**
     * @description 删除持久化存储的数据。
     * @param {string} key - 存储键
     */
    storageRemove(key) {
        throw new Error('Not implemented');
    }

    /**
     * @description 监听页面卸载事件（beforeunload）。
     * @param {function} callback - 卸载时的回调函数
     */
    onBeforeUnload(callback) {
        throw new Error('Not implemented');
    }

    /**
     * @description 监听页面可见性变化。
     * @param {function} callback - 回调函数，参数为 boolean（true=隐藏，false=可见）
     */
    onVisibilityChange(callback) {
        throw new Error('Not implemented');
    }

    /**
     * @description 文档加载完成后的回调。
     * @param {function} callback - 回调函数
     * @param {number} [delay=5000] - 延迟毫秒数
     */
    onDocumentReady(callback, delay) {
        throw new Error('Not implemented');
    }

    /**
     * @description 监听 tab 关闭事件。
     * @param {function} callback - 回调函数，参数为 tabId
     */
    onTabRemoved(callback) {
        // 默认空实现，Chrome 扩展专用
    }
}

module.exports = BrowserAdaptor;
