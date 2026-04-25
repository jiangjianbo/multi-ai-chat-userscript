const BrowserAdaptor = require('./browser-adaptor');

/**
 * @description Tampermonkey 环境下的浏览器适配器实现。
 * 使用原生 DOM API、window.open、BroadcastChannel、localStorage 等。
 */
class TampermonkeyAdaptor extends BrowserAdaptor {

    /**
     * @description 检查并创建主窗口。完整封装窗口查找、创建、缓存、内容写入流程。
     * @param {string} windowName - 窗口名称标识
     * @param {string} cacheKey - 缓存键名
     * @param {object} [options] - 创建新窗口时的选项
     * @param {number} [options.width] - 窗口宽度
     * @param {number} [options.height] - 窗口高度
     * @param {function} [createWindowContentFn] - 新窗口内容写入回调
     * @returns {Promise<{handle: Window|null}>}
     */
    async ensureMainWindow(windowName, cacheKey, options, createWindowContentFn) {
        // 步骤1: 检查缓存引用
        const cachedRef = this._getCachedWindowRef(cacheKey);
        if (this.isWindowAlive(cachedRef)) {
            console.log('Main window already exists (cached ref). Focusing on it.');
            await this.focusWindow(cachedRef);
            return { handle: cachedRef };
        }

        // 步骤2: 查找或创建命名窗口
        const { handle, isNew } = this._findOrCreateNamedWindow(windowName, options);
        if (!handle) {
            return { handle: null };
        }

        // 步骤3: 缓存引用
        this._setCachedWindowRef(cacheKey, handle);

        if (!isNew) {
            console.log('Main window already exists (found by name). Focusing on it.');
            await this.focusWindow(handle);
            return { handle };
        }

        // 步骤4: 新窗口，写入内容
        const doc = this._getDocument(handle);
        if (doc && createWindowContentFn) {
            createWindowContentFn(doc);
        }
        console.log('Main window created.');
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
     * @description 通过名称查找已存在的窗口，如果不存在则创建新窗口。
     * @param {string} name - 窗口名称标识
     * @param {object} [options] - 创建新窗口时的选项
     * @returns {{handle: Window|null, isNew: boolean}}
     * @private
     */
    _findOrCreateNamedWindow(name, options) {
        const features = options ? `width=${options.width || 1200},height=${options.height || 800}` : 'width=1200,height=800';
        const newWindow = window.open('', name, features);
        if (!newWindow) {
            return { handle: null, isNew: false };
        }

        let isNew = true;
        try {
            const rootEl = newWindow.document.getElementById('root');
            if (rootEl) {
                isNew = false;
            }
        } catch (e) {
            // 跨域访问可能抛出异常，说明不是我们的窗口，视为新窗口
        }

        return { handle: newWindow, isNew };
    }

    /**
     * @description 打开一个新的 Tab 页面。
     * @param {string} url - 要打开的 URL
     * @param {string} [target='_blank'] - 目标窗口名称
     * @returns {Window|null} - 窗口引用
     */
    async openTab(url, target) {
        return window.open(url, target || '_blank');
    }

    /**
     * @description 激活（聚焦）指定的窗口。
     * @param {Window} handle - 窗口引用
     */
    async focusWindow(handle) {
        if (handle) {
            try {
                handle.focus();
            } catch (e) {
                // 跨域窗口可能无法调用 focus()，忽略错误
            }
        }
    }

    /**
     * @description 检查指定的窗口是否仍然存在（未关闭）。
     * @param {Window} handle - 窗口引用
     * @returns {boolean}
     */
    isWindowAlive(handle) {
        return !!(handle && !handle.closed);
    }

    /**
     * @description 关闭当前窗口。
     */
    closeCurrentWindow() {
        window.close();
    }

    /**
     * @description 获取窗口的文档对象。
     * @param {Window} handle - 窗口引用
     * @returns {Document|null}
     * @private
     */
    _getDocument(handle) {
        if (!handle) return null;
        try {
            return handle.document;
        } catch (e) {
            return null;
        }
    }

    /**
     * @description 缓存窗口引用到 window.top。
     * @param {string} key - 缓存键名
     * @param {*} handle - 窗口引用
     * @private
     */
    _setCachedWindowRef(key, handle) {
        try {
            window.top[key] = handle;
        } catch (e) {
            // 跨域 iframe 可能无法访问 window.top，降级到 window
            window[key] = handle;
        }
    }

    /**
     * @description 获取缓存的窗口引用。
     * @param {string} key - 缓存键名
     * @returns {*|null}
     * @private
     */
    _getCachedWindowRef(key) {
        try {
            return window.top[key] || null;
        } catch (e) {
            return window[key] || null;
        }
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
     * @description 创建 BroadcastChannel 通信频道。
     * @param {string} channelName - 频道名称
     * @returns {BroadcastChannel}
     */
    createChannel(channelName) {
        return new BroadcastChannel(channelName);
    }

    /**
     * @description 持久化存储数据到 localStorage。
     * @param {string} key - 存储键
     * @param {string} value - 存储值
     */
    storageSet(key, value) {
        localStorage.setItem(key, value);
    }

    /**
     * @description 从 localStorage 读取数据。
     * @param {string} key - 存储键
     * @returns {string|null}
     */
    storageGet(key) {
        return localStorage.getItem(key);
    }

    /**
     * @description 从 localStorage 删除数据。
     * @param {string} key - 存储键
     */
    storageRemove(key) {
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
}

module.exports = TampermonkeyAdaptor;
