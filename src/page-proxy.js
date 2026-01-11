const Util = require('./util');

/**
 * @description 页面代理类，用于管理页面资源监听和清理。
 * 该类提供了统一的资源管理接口，支持事件监听、DOM 监听、history/location 变化监听等，
 * 并能够在需要时自动清理所有注册的资源。
 *
 * @property {Array} _eventListeners - 存储所有事件监听器的记录
 * @property {Array} _observers - 存储 MutationObserver 的记录
 * @property {Array} _intervals - 存储 setInterval 的记录
 * @property {Array} _timeouts - 存储 setTimeout 的记录
 * @property {Util} util - 工具类实例
 */
class PageProxy {

    constructor() {
        /**
         * @description 存储所有事件监听器的记录。
         * 每条记录格式：{ target, event, handler, options, captured, removeNotifier }
         * @type {Array<{target: EventTarget, event: string, handler: Function, options: *, captured: boolean, removeNotifier: Function}>}
         * @private
         */
        this._eventListeners = [];

        /**
         * @description 存储 MutationObserver 的记录。
         * 每条记录格式：{ observer, target, removeNotifier }
         * @type {Array<{observer: MutationObserver, target: Node, removeNotifier: Function}>}
         * @private
         */
        this._observers = [];

        /**
         * @description 存储 setInterval 的记录。
         * 每条记录格式：{ id, handler, delay, removeNotifier }
         * @type {Array<{id: number, handler: Function, delay: number, removeNotifier: Function}>}
         * @private
         */
        this._intervals = [];

        /**
         * @description 存储 setTimeout 的记录。
         * 每条记录格式：{ id, handler, delay, removeNotifier }
         * @type {Array<{id: number, handler: Function, delay: number, removeNotifier: Function}>}
         * @private
         */
        this._timeouts = [];

        /**
         * @description 存储 history/location 监听的记录。
         * @type {Array<{type: string, handler: Function, removeNotifier: Function}>}
         * @private
         */
        this._historyListeners = [];

        /**
         * @description 工具类实例。
         * @type {Util}
         */
        this.util = new Util();
    }

    // --- 事件监听管理 ---

    /**
     * @description 添加事件监听器，并记录以便后续清理。
     * 支持标准的 addEventListener 参数，以及一个可选的 removeNotifier 回调作为最后一个参数。
     *
     * @param {EventTarget} target - 事件目标对象（如 Element、Window、Document 等）
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     * @param {boolean|object} [options=false] - 事件选项（useCapture 或 AddEventListenerOptions）
     * @param {Function} [removeNotifier] - 移除通知回调，清理时如果返回 false 则阻止自动移除
     * @returns {boolean} 是否成功添加监听器
     *
     * @example
     * // 基本用法
     * pageProxy.addEventListener(button, 'click', handleClick);
     *
     * @example
     * // 带 options 的用法
     * pageProxy.addEventListener(window, 'resize', handleResize, { passive: true });
     *
     * @example
     * // 带 removeNotifier 的用法（自定义清理逻辑）
     * pageProxy.addEventListener(button, 'click', handleClick, false, () => {
     *     console.log('Event listener is being removed');
     *     return true; // 返回 false 可以阻止自动移除
     * });
     */
    addEventListener(target, event, handler, options = false, removeNotifier) {
        if (!target || !event || typeof handler !== 'function') {
            console.warn('[PageProxy.addEventListener] Invalid parameters:', { target, event, handler });
            return false;
        }

        try {
            target.addEventListener(event, handler, options);

            // 记录监听器以便后续清理
            const record = {
                target,
                event,
                handler,
                options,
                removeNotifier
            };
            this._eventListeners.push(record);

            return true;
        } catch (error) {
            console.error('[PageProxy.addEventListener] Failed to add event listener:', error);
            return false;
        }
    }

    /**
     * @description 移除指定的事件监听器。
     *
     * @param {EventTarget} target - 事件目标对象
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     * @returns {boolean} 是否成功移除
     */
    removeEventListener(target, event, handler) {
        if (!target || !event || typeof handler !== 'function') {
            return false;
        }

        // 从记录中查找匹配的监听器
        const index = this._eventListeners.findIndex(
            record => record.target === target && record.event === event && record.handler === handler
        );

        if (index !== -1) {
            const record = this._eventListeners[index];

            // 调用 removeNotifier（如果存在），传递关键参数
            let shouldAutoRemove = true;
            if (record.removeNotifier) {
                try {
                    // 传递 target, event, handler 参数
                    shouldAutoRemove = record.removeNotifier(target, event, handler, record.options) !== false;
                } catch (error) {
                    console.error('[PageProxy.removeEventListener] Error in removeNotifier:', error);
                }
            }

            // 总是从内部记录中移除，即使 removeNotifier 返回 false
            this._eventListeners.splice(index, 1);

            // 只有当 removeNotifier 允许时才自动移除监听器
            if (shouldAutoRemove) {
                target.removeEventListener(event, handler, record.options);
            }
            return true;
        }

        return false;
    }

    // --- MutationObserver 管理 ---

    /**
     * @description 创建 MutationObserver 并开始观察，同时记录以便后续清理。
     *
     * @param {Node} target - 要观察的 DOM 节点
     * @param {MutationObserverInit} options - 观察选项
     * @param {MutationCallback} callback - 变化回调函数
     * @param {Function} [removeNotifier] - 移除通知回调
     * @returns {MutationObserver|null} 创建的 MutationObserver 实例，失败返回 null
     *
     * @example
     * const observer = pageProxy.observe(element, { childList: true, subtree: true }, (mutations) => {
     *     console.log('DOM changed:', mutations);
     * });
     */
    observe(target, options, callback, removeNotifier) {
        if (!target || typeof callback !== 'function' || typeof options !== 'object') {
            console.warn('[PageProxy.observe] Invalid parameters:', { target, options, callback });
            return null;
        }

        try {
            const observer = new MutationObserver(callback);
            observer.observe(target, options);

            // 记录 observer 以便后续清理
            this._observers.push({
                observer,
                target,
                removeNotifier
            });

            return observer;
        } catch (error) {
            console.error('[PageProxy.observe] Failed to create observer:', error);
            return null;
        }
    }

    /**
     * @description 断开 MutationObserver 的观察。
     *
     * @param {MutationObserver} observer - 要断开的 MutationObserver 实例
     * @returns {boolean} 是否成功断开
     */
    disconnectObserver(observer) {
        if (!observer) {
            return false;
        }

        const index = this._observers.findIndex(record => record.observer === observer);

        if (index !== -1) {
            const record = this._observers[index];

            // 调用 removeNotifier（如果存在），传递关键参数
            let shouldAutoDisconnect = true;
            if (record.removeNotifier) {
                try {
                    // 传递 observer, target 参数
                    shouldAutoDisconnect = record.removeNotifier(observer, record.target) !== false;
                } catch (error) {
                    console.error('[PageProxy.disconnectObserver] Error in removeNotifier:', error);
                }
            }

            // 总是从内部记录中移除，即使 removeNotifier 返回 false
            this._observers.splice(index, 1);

            // 只有当 removeNotifier 允许时才自动断开
            if (shouldAutoDisconnect) {
                observer.disconnect();
            }
            return true;
        }

        return false;
    }

    // --- 定时器管理 ---

    /**
     * @description 创建定时器（setInterval），并记录以便后续清理。
     *
     * @param {Function} handler - 定时器处理函数
     * @param {number} delay - 延迟时间（毫秒）
     * @param {Array} [args] - 传递给处理函数的参数
     * @param {Function} [removeNotifier] - 移除通知回调
     * @returns {number|null} 定时器 ID，失败返回 null
     */
    setInterval(handler, delay, args, removeNotifier) {
        if (typeof handler !== 'function') {
            console.warn('[PageProxy.setInterval] Invalid handler:', handler);
            return null;
        }

        try {
            const id = setInterval(handler, delay, ...(args || []));

            this._intervals.push({
                id,
                handler,
                delay,
                removeNotifier
            });

            return id;
        } catch (error) {
            console.error('[PageProxy.setInterval] Failed to create interval:', error);
            return null;
        }
    }

    /**
     * @description 清除定时器。
     *
     * @param {number} id - 定时器 ID
     * @returns {boolean} 是否成功清除
     */
    clearInterval(id) {
        const index = this._intervals.findIndex(record => record.id === id);

        if (index !== -1) {
            const record = this._intervals[index];

            // 调用 removeNotifier（如果存在），传递关键参数
            let shouldAutoClear = true;
            if (record.removeNotifier) {
                try {
                    // 传递 id, handler, delay 参数
                    shouldAutoClear = record.removeNotifier(id, record.handler, record.delay) !== false;
                } catch (error) {
                    console.error('[PageProxy.clearInterval] Error in removeNotifier:', error);
                }
            }

            // 总是从内部记录中移除，即使 removeNotifier 返回 false
            this._intervals.splice(index, 1);

            // 只有当 removeNotifier 允许时才自动清除
            if (shouldAutoClear) {
                clearInterval(id);
            }
            return true;
        }

        return false;
    }

    /**
     * @description 创建延时器（setTimeout），并记录以便后续清理。
     *
     * @param {Function} handler - 延时器处理函数
     * @param {number} delay - 延迟时间（毫秒）
     * @param {Array} [args] - 传递给处理函数的参数
     * @param {Function} [removeNotifier] - 移除通知回调
     * @returns {number|null} 延时器 ID，失败返回 null
     */
    setTimeout(handler, delay, args, removeNotifier) {
        if (typeof handler !== 'function') {
            console.warn('[PageProxy.setTimeout] Invalid handler:', handler);
            return null;
        }

        try {
            const id = setTimeout(() => {
                // 执行后自动从记录中移除
                const index = this._timeouts.findIndex(record => record.id === id);
                if (index !== -1) {
                    this._timeouts.splice(index, 1);
                }
                handler(...(args || []));
            }, delay);

            this._timeouts.push({
                id,
                handler,
                delay,
                removeNotifier
            });

            return id;
        } catch (error) {
            console.error('[PageProxy.setTimeout] Failed to create timeout:', error);
            return null;
        }
    }

    /**
     * @description 清除延时器。
     *
     * @param {number} id - 延时器 ID
     * @returns {boolean} 是否成功清除
     */
    clearTimeout(id) {
        const index = this._timeouts.findIndex(record => record.id === id);

        if (index !== -1) {
            const record = this._timeouts[index];

            // 调用 removeNotifier（如果存在），传递关键参数
            let shouldAutoClear = true;
            if (record.removeNotifier) {
                try {
                    // 传递 id, handler, delay 参数
                    shouldAutoClear = record.removeNotifier(id, record.handler, record.delay) !== false;
                } catch (error) {
                    console.error('[PageProxy.clearTimeout] Error in removeNotifier:', error);
                }
            }

            // 总是从内部记录中移除，即使 removeNotifier 返回 false
            this._timeouts.splice(index, 1);

            // 只有当 removeNotifier 允许时才自动清除
            if (shouldAutoClear) {
                clearTimeout(id);
            }
            return true;
        }

        return false;
    }

    // --- History/Location 监听管理 ---

    /**
     * @description 监听 URL 变化（包括 pushState、replaceState、popstate、hashchange）。
     * 这是综合的 URL 变化监听方法。
     *
     * @param {Function} callback - URL 变化时的回调函数，接收 (newUrl, oldUrl) 参数
     * @param {Function} [removeNotifier] - 移除通知回调
     * @returns {Function|null} 取消监听的函数，失败返回 null
     */
    onUrlChange(callback, removeNotifier) {
        if (typeof callback !== 'function') {
            console.warn('[PageProxy.onUrlChange] Invalid callback:', callback);
            return null;
        }

        let currentUrl = window.location.href;

        // 辅助函数：从 pushState/replaceState 参数构建新 URL
        const buildNewUrl = (url) => {
            if (!url) return window.location.href;
            try {
                // 处理相对路径
                return new URL(url, window.location.href).href;
            } catch (e) {
                return url;
            }
        };

        // 包装原始的 pushState 和 replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        const pushStateWrapper = (...args) => {
            const oldUrl = window.location.href;
            originalPushState.apply(history, args);
            // args[2] 是 URL 参数（如果提供）
            const newUrl = args[2] ? buildNewUrl(args[2]) : window.location.href;
            if (newUrl !== oldUrl) {
                callback(newUrl, oldUrl);
            }
        };

        const replaceStateWrapper = (...args) => {
            const oldUrl = window.location.href;
            originalReplaceState.apply(history, args);
            // args[2] 是 URL 参数（如果提供）
            const newUrl = args[2] ? buildNewUrl(args[2]) : window.location.href;
            if (newUrl !== oldUrl) {
                callback(newUrl, oldUrl);
            }
        };

        // 监听 popstate 和 hashchange 事件
        const popstateHandler = () => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                callback(newUrl, currentUrl);
                currentUrl = newUrl;
            }
        };

        const hashchangeHandler = () => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                callback(newUrl, currentUrl);
                currentUrl = newUrl;
            }
        };

        // 覆盖 history 方法
        history.pushState = pushStateWrapper;
        history.replaceState = replaceStateWrapper;

        // 添加事件监听
        this.addEventListener(window, 'popstate', popstateHandler);
        this.addEventListener(window, 'hashchange', hashchangeHandler);

        // 存储监听记录
        const listenerRecord = {
            type: 'urlChange',
            callback,
            removeNotifier,
            originalPushState,
            originalReplaceState,
            popstateHandler,
            hashchangeHandler
        };
        this._historyListeners.push(listenerRecord);

        // 返回取消监听函数
        return () => this.offUrlChange(callback);
    }

    /**
     * @description 取消 URL 变化监听。
     *
     * @param {Function} callback - 之前注册的回调函数
     * @returns {boolean} 是否成功取消
     */
    offUrlChange(callback) {
        const index = this._historyListeners.findIndex(
            record => record.type === 'urlChange' && record.callback === callback
        );

        if (index !== -1) {
            const record = this._historyListeners[index];

            // 调用 removeNotifier（如果存在），传递关键参数
            let shouldAutoRemove = true;
            if (record.removeNotifier) {
                try {
                    // 传递 callback 参数
                    shouldAutoRemove = record.removeNotifier(callback) !== false;
                } catch (error) {
                    console.error('[PageProxy.offUrlChange] Error in removeNotifier:', error);
                }
            }

            // 总是从内部记录中移除，即使 removeNotifier 返回 false
            this._historyListeners.splice(index, 1);

            // 只有当 removeNotifier 允许时才自动恢复和移除
            if (shouldAutoRemove) {
                // 恢复原始方法
                history.pushState = record.originalPushState;
                history.replaceState = record.originalReplaceState;

                // 移除事件监听
                this.removeEventListener(window, 'popstate', record.popstateHandler);
                this.removeEventListener(window, 'hashchange', record.hashchangeHandler);
            }
            return true;
        }

        return false;
    }

    // --- 批量清理 ---

    /**
     * @description 清理所有已注册的资源。
     * 按照相反的顺序清理资源（后注册的先清理）。
     *
     * @returns {Object} 清理结果统计
     */
    cleanup() {
        const result = {
            eventListeners: 0,
            observers: 0,
            intervals: 0,
            timeouts: 0,
            historyListeners: 0,
            errors: []
        };

        // 清理定时器
        while (this._intervals.length > 0) {
            const record = this._intervals.pop();
            try {
                let shouldAutoClear = true;
                if (record.removeNotifier) {
                    // 传递 id, handler, delay 参数
                    shouldAutoClear = record.removeNotifier(record.id, record.handler, record.delay) !== false;
                }
                if (shouldAutoClear) {
                    clearInterval(record.id);
                }
                result.intervals++;
            } catch (error) {
                result.errors.push({ type: 'interval', error: error.message });
            }
        }

        // 清理延时器
        while (this._timeouts.length > 0) {
            const record = this._timeouts.pop();
            try {
                let shouldAutoClear = true;
                if (record.removeNotifier) {
                    // 传递 id, handler, delay 参数
                    shouldAutoClear = record.removeNotifier(record.id, record.handler, record.delay) !== false;
                }
                if (shouldAutoClear) {
                    clearTimeout(record.id);
                }
                result.timeouts++;
            } catch (error) {
                result.errors.push({ type: 'timeout', error: error.message });
            }
        }

        // 清理 MutationObserver
        while (this._observers.length > 0) {
            const record = this._observers.pop();
            try {
                let shouldAutoDisconnect = true;
                if (record.removeNotifier) {
                    // 传递 observer, target 参数
                    shouldAutoDisconnect = record.removeNotifier(record.observer, record.target) !== false;
                }
                if (shouldAutoDisconnect) {
                    record.observer.disconnect();
                }
                result.observers++;
            } catch (error) {
                result.errors.push({ type: 'observer', error: error.message });
            }
        }

        // 清理事件监听器（反向遍历）
        for (let i = this._eventListeners.length - 1; i >= 0; i--) {
            const record = this._eventListeners[i];
            try {
                let shouldAutoRemove = true;
                if (record.removeNotifier) {
                    // 传递 target, event, handler, options 参数
                    shouldAutoRemove = record.removeNotifier(record.target, record.event, record.handler, record.options) !== false;
                }
                if (shouldAutoRemove) {
                    record.target.removeEventListener(record.event, record.handler, record.options);
                }
                result.eventListeners++;
            } catch (error) {
                result.errors.push({ type: 'eventListener', error: error.message });
            }
        }
        this._eventListeners = [];

        // 清理 history/location 监听
        while (this._historyListeners.length > 0) {
            const record = this._historyListeners.pop();
            try {
                let shouldAutoRemove = true;
                if (record.removeNotifier) {
                    // 传递 callback 参数
                    shouldAutoRemove = record.removeNotifier(record.callback) !== false;
                }
                if (shouldAutoRemove && record.type === 'urlChange') {
                    history.pushState = record.originalPushState;
                    history.replaceState = record.originalReplaceState;
                    // 注意：这里不需要手动移除 popstate 和 hashchange 监听
                    // 因为它们在 _eventListeners 中会被清理
                }
                result.historyListeners++;
            } catch (error) {
                result.errors.push({ type: 'historyListener', error: error.message });
            }
        }

        return result;
    }

    // --- 查询方法 ---

    /**
     * @description 获取当前注册的资源统计信息。
     *
     * @returns {Object} 资源统计信息
     */
    getResourceStats() {
        return {
            eventListeners: this._eventListeners.length,
            observers: this._observers.length,
            intervals: this._intervals.length,
            timeouts: this._timeouts.length,
            historyListeners: this._historyListeners.length
        };
    }

    /**
     * @description 检查是否有任何已注册的资源。
     *
     * @returns {boolean} 如果有已注册的资源返回 true，否则返回 false
     */
    hasResources() {
        return this._eventListeners.length > 0 ||
               this._observers.length > 0 ||
               this._intervals.length > 0 ||
               this._timeouts.length > 0 ||
               this._historyListeners.length > 0;
    }

    /**
     * @description 获取所有事件监听器的记录。
     *
     * @returns {Array} 事件监听器记录数组
     */
    getEventListenerRecords() {
        return [...this._eventListeners];
    }

    /**
     * @description 获取所有 MutationObserver 的记录。
     *
     * @returns {Array} MutationObserver 记录数组
     */
    getObserverRecords() {
        return [...this._observers];
    }
}

module.exports = {
    PageProxy
};
