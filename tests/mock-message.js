/**
 * @description 封装 BroadcastChannel 实现跨窗口通信。
 * @param {string} channelName - 通信频道的名称。
 */
function Message(channelName) {
    if (!channelName) {
        throw new Error('channelName is required for MockMessage module.');
    }
    // No BroadcastChannel for mock
    this.channel = { postMessage: () => {}, close: () => {}, addEventListener: () => {}, removeEventListener: () => {} }; // Mock channel object
    this.listeners = new Map(); // Map<receiverId, Map<type, Set<function>>>

    /**
     * @description 模拟处理消息，直接调用监听器。
     * @param {object} messageEvent - 模拟的消息事件，包含 type 和 data。
     */
    this.handleMessage = function(messageEvent) {
        const { type, data } = messageEvent;
        if (!type) return;

        const targetReceiverId = data ? data.receiverId : undefined;

        // If a specific receiverId is targeted
        if (targetReceiverId) {
            const receiverListeners = this.listeners.get(targetReceiverId);
            if (receiverListeners) {
                const typeListeners = receiverListeners.get(type);
                if (typeListeners) {
                    typeListeners.forEach(listenerFunction => {
                        try {
                            listenerFunction(data);
                        } catch (e) {
                            console.error(`Error in mock message handler for type '${type}' and receiverId '${targetReceiverId}':`, e);
                        }
                    });
                }
            }
        } else { // Broadcast message to all relevant listeners
            this.listeners.forEach(receiverListeners => {
                const typeListeners = receiverListeners.get(type);
                if (typeListeners) {
                    typeListeners.forEach(listenerFunction => {
                        try {
                            listenerFunction(data);
                        } catch (e) {
                            console.error(`Error in mock broadcast message handler for type '${type}':`, e);
                        }
                    });
                }
            });
        }
    };

    /**
     * @description 广播消息，并直接发送给注册的回调。
     * @param {string} type - 消息类型 (e.g., 'chat', 'create')。
     * @param {object} data - 附带的数据。
     */
    this.send = function(type, data) {
        console.log(`MockMessage.send: Type - ${type}, Data -`, data);
        // Delay call handleMessage to simulate message delivery
        setTimeout(() => {
            this.handleMessage({ type, data });
        }, 1000);
    };

    /**
     * @description 注册一个监听器对象。
     * @param {string} receiverId - 对象的接收id。
     * @param {object} listener - 包含 onMsg* 方法的对象。
     */
    this.register = function(receiverId, listener) {
        if (!receiverId || !listener) {
            console.warn('MockMessage.register: receiverId and listener are required.');
            return;
        }

        if (!this.listeners.has(receiverId)) {
            this.listeners.set(receiverId, new Map()); // Map<type, Set<function>>
        }
        const receiverListeners = this.listeners.get(receiverId);

        for (const methodName in listener) {
            if (typeof listener[methodName] === 'function' && methodName.startsWith('onMsg')) {
                const type = methodName.substring(5).charAt(0).toLowerCase() + methodName.substring(6);
                if (!receiverListeners.has(type)) {
                    receiverListeners.set(type, new Set());
                }
                receiverListeners.get(type).add(listener[methodName].bind(listener)); // Bind to listener instance
            }
        }
    };

    /**
     * @description 注销一个监听器对象。
     * @param {string} receiverId - 对象的接收id。
     */
    this.unregister = function(receiverId) {
        if (receiverId) {
            this.listeners.delete(receiverId);
        }
    };

    /**
     * @description 关闭并清理通信频道。
     */
    this.close = function() {
        this.listeners.clear();
    };
}

module.exports = Message;
