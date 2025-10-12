
/**
 * @description 封装 BroadcastChannel 实现跨窗口通信。
 * @param {string} channelName - 通信频道的名称。
 */
function Message(channelName) {
    if (!channelName) {
        throw new Error('channelName is required for Message module.');
    }
    this.channel = new BroadcastChannel(channelName);
    this.listeners = new Set();

    // 绑定 handleMessage 的 this 上下文
    this.handleMessage = this.handleMessage.bind(this);
    this.channel.addEventListener('message', this.handleMessage);

    /**
     * @description 广播消息。
     * @param {string} type - 消息类型 (e.g., 'chat', 'create')。
     * @param {object} data - 附带的数据。
     */
    this.send = function(type, data) {
        try {
            this.channel.postMessage({ type, data });
        } catch (e) {
            console.error(`Error posting message: ${e}`);
        }
    };

    /**
     * @description 注册一个监听器对象。
     * @param {object} target - 包含 onMsg* 方法的对象。
     */
    this.register = function(target) {
        if (target) {
            this.listeners.add(target);
        }
    };

    /**
     * @description 注销一个监听器对象。
     * @param {object} target - 已注册的对象。
     */
    this.unregister = function(target) {
        this.listeners.delete(target);
    };

    /**
     * @description 关闭并清理通信频道。
     */
    this.close = function() {
        this.channel.removeEventListener('message', this.handleMessage);
        this.channel.close();
        this.listeners.clear();
    };
}

/**
 * @description 处理来自 BroadcastChannel 的消息。
 * @param {MessageEvent} event - 消息事件。
 */
Message.prototype.handleMessage = function(event) {
    const { type, data } = event.data;
    if (!type) return;

    // 将消息类型转换为 onMsg* 格式的方法名
    // e.g., 'create' -> 'onMsgCreate'
    const methodName = 'onMsg' + type.charAt(0).toUpperCase() + type.slice(1);

    this.listeners.forEach(listener => {
        if (typeof listener[methodName] === 'function') {
            try {
                listener[methodName](data);
            } catch (e) {
                console.error(`Error in message handler for ${type}:`, e);
            }
        }
    });
};

module.exports = Message;
