
/**
 * 消息通知器，负责不同窗口间的通讯
 * @constructor
 * @param {string} channelName 频道名称
 */
function MessageNotifier(channelName) {
    this.channelName = channelName;
    this.broadcastChannel = new BroadcastChannel(channelName);
    this.messageHandlers = {};

    const normalizeKey = (key) => key.toLowerCase().replace(/[-_]/g, '');

    // 注册消息处理
    this.broadcastChannel.onmessage = (event) => {
        if (!event.data || !event.data.type) return;
        const { type, data } = event.data;
        const handlerKey = normalizeKey(type);
        if (this.messageHandlers[handlerKey]) {
            this.messageHandlers[handlerKey](data);
        }
    };

    this.broadcastChannel.onmessageerror = (event) => {
        console.error(`MessageNotifier (${this.channelName}) error:`, event);
    };

    this.register = function (target) {
        for (const prop in target) {
            if (typeof target[prop] === 'function' && prop.startsWith('onMsg')) {
                const msgType = prop.substring(5);
                const handlerKey = normalizeKey(msgType);
                this.messageHandlers[handlerKey] = target[prop].bind(target);
            }
        }
    }

    this.send = function (type, data, targetWindow) {
        const message = { type, data };
        try {
            if (targetWindow) {
                targetWindow.postMessage(message, '*');
            } else {
                this.broadcastChannel.postMessage(message);
            }
        } catch (error) {
            console.error(`MessageNotifier (${this.channelName}) failed to send message:`, error);
        }
    };

    this.close = function() {
        this.broadcastChannel.close();
    };

    this.register(this);
}

export default MessageNotifier;
