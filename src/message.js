const Util = require('./util');

/**
 * @description 封装 BroadcastChannel 实现跨窗口通信。
 */
class Message {
    /**
     * @param {string} channelName - 通信频道的名称。
     */
    constructor(channelName) {
        if (!channelName) {
            throw new Error('channelName is required for Message module.');
        }
        this.channel = new BroadcastChannel(channelName);
        this.listeners = new Map(); // Map<receiverId, Map<type, Set<function>>>

        // 绑定 handleMessage 的 this 上下文
        this.handleMessage = this.handleMessage.bind(this);
        this.channel.addEventListener('message', this.handleMessage);

        this.util = new Util();
    }

    /**
     * @description 处理来自 BroadcastChannel 的消息。
     * @param {MessageEvent} event - 消息事件。
     */
    handleMessage(event) {
        console.debug(`receive message ${JSON.stringify(event?.data)}`);

        const { type, data } = event.data;
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
                            console.error(`Error in message handler for type '${type}' and receiverId '${targetReceiverId}':`, e);
                        }
                    });
                }
            } else {
                console.debug(`No listeners for receiverId '${targetReceiverId}'.`);
            }
        } else { // Broadcast message to all relevant listeners
            this.listeners.forEach(receiverListeners => {
                const typeListeners = receiverListeners.get(type);
                if (typeListeners) {
                    typeListeners.forEach(listenerFunction => {
                        try {
                            listenerFunction(data);
                        } catch (e) {
                            console.error(`Error in broadcast message handler for type '${type}':`, e);
                        }
                    });
                }else {
                    console.debug(`No listeners for message type '${type}' in receiver.`);
                }
            });
        }
    }

    /**
     * @description 广播消息。
     * @param {string} type - 消息类型 (e.g., 'chat', 'create')。
     * @param {object} data - 附带的数据。
     */
    send(type, data) {
        try {
            console.debug(`send type = ${type}, data = ${JSON.stringify(data)}`);

            this.channel.postMessage({ type, data });
        } catch (e) {
            console.error(`Error posting message: ${e}`);
        }
    }

    /**
     * @description 注册一个监听器对象。
     * @param {string} receiverId - 对象的接收id。
     * @param {object} listener - 包含 onMsg* 方法的对象。
     */
    register(receiverId, listener) {
        if (!receiverId || !listener) {
            console.warn('Message.register: receiverId and listener are required.');
            return;
        }

        console.debug(`Registering listener for receiverId '${receiverId}' --> ${listener}.`);
        if (!this.listeners.has(receiverId)) {
            this.listeners.set(receiverId, new Map()); // Map<type, Set<function>>
        }
        const receiverListeners = this.listeners.get(receiverId);

        this.util.forEachMember(listener, (obj, methodName, methodValue) => {
            if (typeof listener[methodName] === 'function' && methodName.startsWith('onMsg')) {
                const type = this.util.camelToDash(methodName.substring(5), '_');
                console.debug(`Checking method ${methodName} in listener for ${type} registration.`);
                if (!receiverListeners.has(type)) {
                    receiverListeners.set(type, new Set());
                }
                receiverListeners.get(type).add(listener[methodName].bind(listener)); // Bind to listener instance
            }
        });
    }

    /**
     * @description 注销一个监听器对象。
     * @param {string} receiverId - 对象的接收id。
     */
    unregister(receiverId) {
        if (receiverId) {
            this.listeners.delete(receiverId);
        }
    }

    /**
     * @description 关闭并清理通信频道。
     */
    close() {
        this.channel.removeEventListener('message', this.handleMessage);
        this.channel.close();
        this.listeners.clear();
    }
}

module.exports = Message;
