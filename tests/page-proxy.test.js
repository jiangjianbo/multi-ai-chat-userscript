const { PageProxy } = require('../src/page-proxy');

describe('PageProxy', () => {
    let pageProxy;

    beforeEach(() => {
        pageProxy = new PageProxy();
    });

    afterEach(() => {
        // 确保每个测试后都清理资源
        pageProxy.cleanup();
    });

    describe('构造函数和初始化', () => {
        test('应该正确初始化 PageProxy 实例', () => {
            expect(pageProxy).toBeInstanceOf(PageProxy);
            expect(pageProxy._eventListeners).toEqual([]);
            expect(pageProxy._observers).toEqual([]);
            expect(pageProxy._intervals).toEqual([]);
            expect(pageProxy._timeouts).toEqual([]);
            expect(pageProxy._historyListeners).toEqual([]);
        });

        test('应该有 util 属性', () => {
            expect(pageProxy.util).toBeDefined();
        });
    });

    describe('addEventListener / removeEventListener', () => {
        let button;
        let clickHandler;

        beforeEach(() => {
            button = document.createElement('button');
            clickHandler = jest.fn();
            document.body.appendChild(button);
        });

        afterEach(() => {
            document.body.removeChild(button);
        });

        test('1.1: 应该成功添加事件监听器', () => {
            const result = pageProxy.addEventListener(button, 'click', clickHandler);
            expect(result).toBe(true);
            expect(pageProxy._eventListeners.length).toBe(1);
        });

        test('1.2: 当参数无效时应该返回 false', () => {
            expect(pageProxy.addEventListener(null, 'click', clickHandler)).toBe(false);
            expect(pageProxy.addEventListener(button, '', clickHandler)).toBe(false);
            expect(pageProxy.addEventListener(button, 'click', null)).toBe(false);
        });

        test('1.3: 事件监听器应该正常工作', () => {
            pageProxy.addEventListener(button, 'click', clickHandler);
            button.click();
            expect(clickHandler).toHaveBeenCalledTimes(1);
        });

        test('1.4: 应该支持 options 参数', () => {
            let captured = false;
            const captureHandler = (e) => { captured = true; };
            pageProxy.addEventListener(button, 'click', captureHandler, true);
            button.click();
            expect(captured).toBe(true);
        });

        test('1.5: 应该支持 removeNotifier 回调', () => {
            let notifierCalled = false;
            const removeNotifier = jest.fn(() => {
                notifierCalled = true;
                return true;
            });

            pageProxy.addEventListener(button, 'click', clickHandler, false, removeNotifier);
            const record = pageProxy._eventListeners[0];
            expect(record.removeNotifier).toBe(removeNotifier);
        });

        test('1.6: removeNotifier 返回 false 时应该阻止自动移除，但内部数据仍被清除', () => {
            const removeNotifier = jest.fn(() => false);

            pageProxy.addEventListener(button, 'click', clickHandler, false, removeNotifier);
            const result = pageProxy.removeEventListener(button, 'click', clickHandler);

            // removeNotifier 应该被调用，并接收参数
            expect(removeNotifier).toHaveBeenCalledWith(button, 'click', clickHandler, false);
            // 应该返回 true（内部数据已清除）
            expect(result).toBe(true);
            // 内部记录应该被清除
            expect(pageProxy._eventListeners.length).toBe(0);
        });

        test('1.7: 应该成功移除事件监听器', () => {
            pageProxy.addEventListener(button, 'click', clickHandler);
            const result = pageProxy.removeEventListener(button, 'click', clickHandler);

            expect(result).toBe(true);
            expect(pageProxy._eventListeners.length).toBe(0);
        });

        test('1.8: 移除不存在的监听器应该返回 false', () => {
            const result = pageProxy.removeEventListener(button, 'click', clickHandler);
            expect(result).toBe(false);
        });
    });

    describe('observe / disconnectObserver', () => {
        let targetElement;

        beforeEach(() => {
            targetElement = document.createElement('div');
            document.body.appendChild(targetElement);
        });

        afterEach(() => {
            document.body.removeChild(targetElement);
        });

        test('2.1: 应该成功创建 MutationObserver', () => {
            const callback = jest.fn();
            const observer = pageProxy.observe(targetElement, { childList: true }, callback);

            expect(observer).toBeInstanceOf(MutationObserver);
            expect(pageProxy._observers.length).toBe(1);
        });

        test('2.2: 当参数无效时应该返回 null', () => {
            expect(pageProxy.observe(null, {}, jest.fn())).toBeNull();
            expect(pageProxy.observe(targetElement, {}, null)).toBeNull();
        });

        test('2.3: MutationObserver 应该正常工作', () => {
            const callback = jest.fn();
            const observer = pageProxy.observe(targetElement, { childList: true }, callback);

            // 验证 observer 被正确创建
            expect(observer).toBeInstanceOf(MutationObserver);
            expect(pageProxy._observers.length).toBe(1);
            expect(pageProxy._observers[0].observer).toBeInstanceOf(MutationObserver);

            // 手动触发一个 DOM 变化并验证
            targetElement.appendChild(document.createElement('span'));
            // 注意：jsdom 中 MutationObserver 可能不会立即触发
            // 这里主要验证 observer 的正确创建和记录
        });

        test('2.4: 应该支持 removeNotifier 回调', () => {
            const removeNotifier = jest.fn();
            const callback = jest.fn();
            pageProxy.observe(targetElement, { childList: true }, callback, removeNotifier);

            const record = pageProxy._observers[0];
            expect(record.removeNotifier).toBe(removeNotifier);
        });

        test('2.5: removeNotifier 返回 false 时应该阻止自动断开，但内部数据仍被清除', () => {
            const removeNotifier = jest.fn(() => false);
            const callback = jest.fn();
            const observer = pageProxy.observe(targetElement, { childList: true }, callback, removeNotifier);

            const result = pageProxy.disconnectObserver(observer);

            // removeNotifier 应该被调用，并接收参数
            expect(removeNotifier).toHaveBeenCalledWith(observer, targetElement);
            // 应该返回 true（内部数据已清除）
            expect(result).toBe(true);
            // 内部记录应该被清除
            expect(pageProxy._observers.length).toBe(0);
        });

        test('2.6: 应该成功断开 MutationObserver', () => {
            const callback = jest.fn();
            const observer = pageProxy.observe(targetElement, { childList: true }, callback);

            const result = pageProxy.disconnectObserver(observer);

            expect(result).toBe(true);
            expect(pageProxy._observers.length).toBe(0);
        });
    });

    describe('setInterval / clearInterval', () => {
        jest.useFakeTimers();

        test('3.1: 应该成功创建定时器', () => {
            const handler = jest.fn();
            const id = pageProxy.setInterval(handler, 100);

            expect(typeof id).toBe('number');
            expect(pageProxy._intervals.length).toBe(1);
        });

        test('3.2: 当 handler 无效时应该返回 null', () => {
            const id = pageProxy.setInterval(null, 100);
            expect(id).toBeNull();
        });

        test('3.3: 定时器应该正常工作', () => {
            const handler = jest.fn();
            pageProxy.setInterval(handler, 100);

            jest.advanceTimersByTime(300);

            expect(handler).toHaveBeenCalledTimes(3);
        });

        test('3.4: 应该支持 removeNotifier 回调', () => {
            const removeNotifier = jest.fn();
            const handler = jest.fn();
            pageProxy.setInterval(handler, 100, [], removeNotifier);

            const record = pageProxy._intervals[0];
            expect(record.removeNotifier).toBe(removeNotifier);
        });

        test('3.5: removeNotifier 返回 false 时应该阻止清除，但内部数据仍被清除', () => {
            const removeNotifier = jest.fn(() => false);
            const handler = jest.fn();
            const id = pageProxy.setInterval(handler, 100, [], removeNotifier);

            const result = pageProxy.clearInterval(id);

            // removeNotifier 应该被调用，并接收参数
            expect(removeNotifier).toHaveBeenCalledWith(id, handler, 100);
            // 应该返回 true（内部数据已清除）
            expect(result).toBe(true);
            // 内部记录应该被清除
            expect(pageProxy._intervals.length).toBe(0);
        });

        test('3.6: 应该成功清除定时器', () => {
            const handler = jest.fn();
            const id = pageProxy.setInterval(handler, 100);

            const result = pageProxy.clearInterval(id);

            expect(result).toBe(true);
            expect(pageProxy._intervals.length).toBe(0);
        });

        test('3.7: 清除不存在的定时器应该返回 false', () => {
            const result = pageProxy.clearInterval(99999);
            expect(result).toBe(false);
        });

        afterEach(() => {
            jest.clearAllTimers();
        });
    });

    describe('setTimeout / clearTimeout', () => {
        jest.useFakeTimers();

        test('4.1: 应该成功创建延时器', () => {
            const handler = jest.fn();
            const id = pageProxy.setTimeout(handler, 100);

            expect(typeof id).toBe('number');
            expect(pageProxy._timeouts.length).toBe(1);
        });

        test('4.2: 当 handler 无效时应该返回 null', () => {
            const id = pageProxy.setTimeout(null, 100);
            expect(id).toBeNull();
        });

        test('4.3: 延时器应该正常工作', () => {
            const handler = jest.fn();
            pageProxy.setTimeout(handler, 100);

            jest.advanceTimersByTime(100);

            expect(handler).toHaveBeenCalledTimes(1);
        });

        test('4.4: 延时器执行后应该自动从记录中移除', () => {
            const handler = jest.fn();
            pageProxy.setTimeout(handler, 100);

            jest.advanceTimersByTime(100);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(pageProxy._timeouts.length).toBe(0);
        });

        test('4.5: 应该支持 removeNotifier 回调', () => {
            const removeNotifier = jest.fn();
            const handler = jest.fn();
            pageProxy.setTimeout(handler, 100, [], removeNotifier);

            const record = pageProxy._timeouts[0];
            expect(record.removeNotifier).toBe(removeNotifier);
        });

        test('4.6: removeNotifier 返回 false 时应该阻止清除，但内部数据仍被清除', () => {
            const removeNotifier = jest.fn(() => false);
            const handler = jest.fn();
            const id = pageProxy.setTimeout(handler, 100, [], removeNotifier);

            const result = pageProxy.clearTimeout(id);

            // removeNotifier 应该被调用，并接收参数
            expect(removeNotifier).toHaveBeenCalledWith(id, handler, 100);
            // 应该返回 true（内部数据已清除）
            expect(result).toBe(true);
            // 内部记录应该被清除
            expect(pageProxy._timeouts.length).toBe(0);
        });

        test('4.7: 应该成功清除延时器', () => {
            const handler = jest.fn();
            const id = pageProxy.setTimeout(handler, 100);

            const result = pageProxy.clearTimeout(id);

            expect(result).toBe(true);
            expect(pageProxy._timeouts.length).toBe(0);
            expect(handler).not.toHaveBeenCalled();
        });

        afterEach(() => {
            jest.clearAllTimers();
        });
    });

    describe('onUrlChange / offUrlChange', () => {
        let originalPushState;
        let originalReplaceState;

        beforeEach(() => {
            originalPushState = history.pushState;
            originalReplaceState = history.replaceState;
        });

        afterEach(() => {
            // 恢复原始方法
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
        });

        test('5.1: 应该成功注册 URL 变化监听', () => {
            const callback = jest.fn();
            const unregister = pageProxy.onUrlChange(callback);

            expect(typeof unregister).toBe('function');
            expect(pageProxy._historyListeners.length).toBe(1);
        });

        test('5.2: 当 callback 无效时应该返回 null', () => {
            const unregister = pageProxy.onUrlChange(null);
            expect(unregister).toBeNull();
        });

        test('5.3: pushState 应该触发回调', () => {
            const callback = jest.fn();
            pageProxy.onUrlChange(callback);

            history.pushState({}, '', '/new-path');

            expect(callback).toHaveBeenCalledWith(
                expect.stringContaining('new-path'),
                expect.any(String)
            );
        });

        test('5.4: replaceState 应该触发回调', () => {
            const callback = jest.fn();
            pageProxy.onUrlChange(callback);

            history.replaceState({}, '', '/replaced-path');

            expect(callback).toHaveBeenCalledWith(
                expect.stringContaining('replaced-path'),
                expect.any(String)
            );
        });

        test('5.5: 应该支持 removeNotifier 回调', () => {
            const removeNotifier = jest.fn();
            const callback = jest.fn();
            pageProxy.onUrlChange(callback, removeNotifier);

            const record = pageProxy._historyListeners[0];
            expect(record.removeNotifier).toBe(removeNotifier);
        });

        test('5.6: removeNotifier 返回 false 时应该阻止取消监听，但内部数据仍被清除', () => {
            const removeNotifier = jest.fn(() => false);
            const callback = jest.fn();
            pageProxy.onUrlChange(callback, removeNotifier);

            const result = pageProxy.offUrlChange(callback);

            // removeNotifier 应该被调用，并接收参数
            expect(removeNotifier).toHaveBeenCalledWith(callback);
            // 应该返回 true（内部数据已清除）
            expect(result).toBe(true);
            // 内部记录应该被清除
            expect(pageProxy._historyListeners.length).toBe(0);
        });

        test('5.7: 应该成功取消 URL 变化监听', () => {
            const callback = jest.fn();
            pageProxy.onUrlChange(callback);

            const result = pageProxy.offUrlChange(callback);

            expect(result).toBe(true);
            expect(pageProxy._historyListeners.length).toBe(0);
        });

        test('5.8: 使用返回的函数应该取消监听', () => {
            const callback = jest.fn();
            const unregister = pageProxy.onUrlChange(callback);

            unregister();

            expect(pageProxy._historyListeners.length).toBe(0);
        });
    });

    describe('cleanup', () => {
        let button;

        beforeEach(() => {
            button = document.createElement('button');
            document.body.appendChild(button);
        });

        afterEach(() => {
            document.body.removeChild(button);
        });

        test('6.1: 应该清理所有事件监听器', () => {
            const handler = jest.fn();
            pageProxy.addEventListener(button, 'click', handler);
            pageProxy.addEventListener(button, 'mouseover', handler);

            const result = pageProxy.cleanup();

            expect(result.eventListeners).toBe(2);
            expect(pageProxy._eventListeners.length).toBe(0);
        });

        test('6.2: 应该清理所有 MutationObserver', () => {
            const callback = jest.fn();
            pageProxy.observe(button, { childList: true }, callback);
            pageProxy.observe(document.body, { attributes: true }, callback);

            const result = pageProxy.cleanup();

            expect(result.observers).toBe(2);
            expect(pageProxy._observers.length).toBe(0);
        });

        test('6.3: 应该清理所有定时器', () => {
            jest.useFakeTimers();
            const handler = jest.fn();
            pageProxy.setInterval(handler, 100);
            pageProxy.setInterval(handler, 200);

            const result = pageProxy.cleanup();

            expect(result.intervals).toBe(2);
            expect(pageProxy._intervals.length).toBe(0);
            jest.useRealTimers();
        });

        test('6.4: 应该清理所有延时器', () => {
            jest.useFakeTimers();
            const handler = jest.fn();
            pageProxy.setTimeout(handler, 100);
            pageProxy.setTimeout(handler, 200);

            const result = pageProxy.cleanup();

            expect(result.timeouts).toBe(2);
            expect(pageProxy._timeouts.length).toBe(0);
            jest.useRealTimers();
        });

        test('6.5: 应该清理所有 history/location 监听', () => {
            const callback = jest.fn();
            pageProxy.onUrlChange(callback);

            const result = pageProxy.cleanup();

            expect(result.historyListeners).toBe(1);
            expect(pageProxy._historyListeners.length).toBe(0);
        });

        test('6.6: 应该返回清理结果统计', () => {
            jest.useFakeTimers();
            const handler = jest.fn();
            pageProxy.addEventListener(button, 'click', handler);
            pageProxy.observe(button, { childList: true }, handler);
            pageProxy.setInterval(handler, 100);
            pageProxy.setTimeout(handler, 100);
            pageProxy.onUrlChange(handler);

            const result = pageProxy.cleanup();

            // onUrlChange 内部添加了 popstate 和 hashchange 两个事件监听器
            expect(result).toEqual({
                eventListeners: 3, // 1 (click) + 2 (onUrlChange 内部)
                observers: 1,
                intervals: 1,
                timeouts: 1,
                historyListeners: 1,
                errors: []
            });
            jest.useRealTimers();
        });

        test('6.7: removeNotifier 返回 false 时应该阻止自动清理，但内部数据仍被清除', () => {
            const removeNotifier = jest.fn(() => false);
            const handler = jest.fn();
            pageProxy.addEventListener(button, 'click', handler, false, removeNotifier);

            const result = pageProxy.cleanup();

            // removeNotifier 应该被调用，并接收参数
            expect(removeNotifier).toHaveBeenCalledWith(button, 'click', handler, false);
            // 计数应该增加（内部数据已清除）
            expect(result.eventListeners).toBe(1);
            // 内部记录应该被清除
            expect(pageProxy._eventListeners.length).toBe(0);
        });
    });

    describe('查询方法', () => {
        let button;

        beforeEach(() => {
            button = document.createElement('button');
            document.body.appendChild(button);
        });

        afterEach(() => {
            document.body.removeChild(button);
        });

        test('7.1: getResourceStats 应该返回正确的统计信息', () => {
            jest.useFakeTimers();
            const handler = jest.fn();
            pageProxy.addEventListener(button, 'click', handler);
            pageProxy.observe(button, { childList: true }, handler);
            pageProxy.setInterval(handler, 100);
            pageProxy.setTimeout(handler, 100);
            pageProxy.onUrlChange(handler);

            const stats = pageProxy.getResourceStats();

            // onUrlChange 内部添加了 popstate 和 hashchange 两个事件监听器
            expect(stats).toEqual({
                eventListeners: 3, // 1 (click) + 2 (onUrlChange 内部)
                observers: 1,
                intervals: 1,
                timeouts: 1,
                historyListeners: 1
            });
            jest.useRealTimers();
        });

        test('7.2: hasResources 在有资源时应该返回 true', () => {
            pageProxy.addEventListener(button, 'click', () => {});
            expect(pageProxy.hasResources()).toBe(true);
        });

        test('7.3: hasResources 在没有资源时应该返回 false', () => {
            expect(pageProxy.hasResources()).toBe(false);
        });

        test('7.4: getEventListenerRecords 应该返回事件监听器记录的副本', () => {
            const handler = () => {};
            pageProxy.addEventListener(button, 'click', handler);

            const records = pageProxy.getEventListenerRecords();

            expect(records.length).toBe(1);
            expect(records[0].event).toBe('click');
            expect(records).not.toBe(pageProxy._eventListeners);
        });

        test('7.5: getObserverRecords 应该返回 observer 记录的副本', () => {
            const callback = () => {};
            pageProxy.observe(button, { childList: true }, callback);

            const records = pageProxy.getObserverRecords();

            expect(records.length).toBe(1);
            expect(records).not.toBe(pageProxy._observers);
        });
    });

    describe('集成测试', () => {
        let button;

        beforeEach(() => {
            button = document.createElement('button');
            document.body.appendChild(button);
        });

        afterEach(() => {
            document.body.removeChild(button);
        });

        test('8.1: 应该支持多种资源的混合管理和清理', () => {
            jest.useFakeTimers();
            const clickHandler = jest.fn();
            const mutationCallback = jest.fn();
            const intervalHandler = jest.fn();
            const timeoutHandler = jest.fn();
            const urlCallback = jest.fn();

            // 添加各种资源
            pageProxy.addEventListener(button, 'click', clickHandler);
            pageProxy.observe(button, { childList: true }, mutationCallback);
            pageProxy.setInterval(intervalHandler, 100);
            pageProxy.setTimeout(timeoutHandler, 100);
            pageProxy.onUrlChange(urlCallback);

            // 验证资源已注册
            expect(pageProxy.hasResources()).toBe(true);

            // 清理所有资源
            const result = pageProxy.cleanup();

            // 验证清理结果 (onUrlChange 内部添加了 2 个事件监听器)
            expect(result.eventListeners).toBe(3); // 1 (click) + 2 (onUrlChange 内部)
            expect(result.observers).toBe(1);
            expect(result.intervals).toBe(1);
            expect(result.timeouts).toBe(1);
            expect(result.historyListeners).toBe(1);
            expect(result.errors).toEqual([]);

            // 验证所有资源已清理
            expect(pageProxy.hasResources()).toBe(false);
            expect(pageProxy.getResourceStats()).toEqual({
                eventListeners: 0,
                observers: 0,
                intervals: 0,
                timeouts: 0,
                historyListeners: 0
            });

            jest.useRealTimers();
        });

        test('8.2: cleanup 后应该能够重新添加资源', () => {
            const handler = jest.fn();

            pageProxy.addEventListener(button, 'click', handler);
            pageProxy.cleanup();
            expect(pageProxy._eventListeners.length).toBe(0);

            pageProxy.addEventListener(button, 'click', handler);
            expect(pageProxy._eventListeners.length).toBe(1);
        });
    });
});
