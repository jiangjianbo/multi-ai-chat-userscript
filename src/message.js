/**
 * 消息通知器，负责不同窗口间的通讯
 * @constructor
 * @param {string} channelName 频道名称
 */
function MessageNotifier(channelName) {
    this.channelName = channelName;
    this.broadcastChannel = new BroadcastChannel(channelName);
    this.messageHandlers = {};

    // 注册消息处理
    this.broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        if (this.messageHandlers[type]) {
            this.messageHandlers[type](data);
        }
    };

    /**
     * 注册对象中的onMsg开头的函数作为事件响应函数
     * @param {Object} target 要注册的对象
     */
    this.register = function (target) {
        // 自动注册onMsg开头的方法作为消息处理器
        for (const prop in target) {
            if (typeof target[prop] === 'function' && prop.startsWith('onMsg')) {
                const msgType = prop.substring(5).toLowerCase();
                this.messageHandlers[msgType] = target[prop].bind(target);
            }
        }
    }

    /**
     * 发送消息
     * @param {string} type 消息类型
     * @param {Object} data 消息数据
     * @param {Window} [targetWindow] 目标窗口，不指定则广播
     */
    this.send = function (type, data, targetWindow) {
        const message = { type, data };
        if (targetWindow) {
            targetWindow.postMessage(message, '*');
        } else {
            this.broadcastChannel.postMessage(message);
        }
    };

    // 注册自己和派生类的事件响应
    this.register(this);
}

export default MessageNotifier;
