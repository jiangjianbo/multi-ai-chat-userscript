/**
 * @description 讲消息封装成语义化的函数调用，通过这个和message.js通信。避免到处组装消息结构。
 */
class MessageClient {
    /**
     * @param {object} message - The message object from message.js.
     * @param {string} senderId - The ID of the sender.
     */
    constructor(message, senderId) {
        this.message = message;
        this.senderId = senderId;
    }

    /**
     * @description Sends a parameter changed message.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the parameter that changed.
     * @param {*} newValue - The new value of the parameter.
     * @param {*} oldValue - The old value of the parameter.
     */
    sendParamChanged(receiverId, key, newValue, oldValue) {
        this.message.send('param_changed', { key: key, newValue: newValue, oldValue: oldValue, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a command to sync the chat.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} prompt - The prompt to sync.
     */
    syncChat(receiverId, prompt) {
        this.message.send('sync_chat', { prompt: prompt, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message to get a parameter value.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the parameter to get.
     */
    getParam(receiverId, key) {
        this.message.send('get_param', { key: key, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a response with a parameter value.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the parameter.
     * @param {*} value - The value of the parameter.
     */
    paramValue(receiverId, key, value) {
        this.message.send('param_value', { key: key, value: value, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message indicating the chat has started.
     * @param {string} receiverId - The ID of the receiver.
     */
    chatStarted(receiverId) {
        this.message.send('chat_started', { receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message indicating the chat has completed.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} response - The chat response.
     */
    chatCompleted(receiverId, response) {
        this.message.send('chat_completed', { response: response, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message indicating the chat has failed.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} error - The error message.
     */
    chatFailed(receiverId, error) {
        this.message.send('chat_failed', { error: error, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message to register a chat area.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} name - The name of the chat area.
     * @param {string} url - The URL of the chat area.
     */
    registerChatArea(receiverId, name, url) {
        this.message.send('register_chat_area', { name: name, url: url, receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message to get all chat areas.
     * @param {string} receiverId - The ID of the receiver.
     */
    getAllChatAreas(receiverId) {
        this.message.send('get_all_chat_areas', { receiverId: receiverId });
    }

    /**
     * @description Sends a response with all chat areas.
     * @param {string} receiverId - The ID of the receiver.
     * @param {Array} chatAreas - The list of chat areas.
     */
    allChatAreas(receiverId, chatAreas) {
        this.message.send('all_chat_areas', { chatAreas: chatAreas, receiverId: receiverId });
    }

    /**
     * @description Sends a message to close the window.
     * @param {string} receiverId - The ID of the receiver.
     */
    closeWindow(receiverId) {
        this.message.send('close_window', { receiverId: receiverId, senderId });
    }

    /**
     * @description Sends a message to set a value in storage.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the value to set.
     * @param {*} value - The value to set.
     */
    storageSet(receiverId, key, value) {
        this.message.send('storage_set', { key: key, value: value, receiverId: receiverId });
    }

    /**
     * @description Sends a message to get a value from storage.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the value to get.
     */
    storageGet(receiverId, key) {
        this.message.send('storage_get', { key: key, receiverId: receiverId });
    }

    /**
     * @description Sends a response with a value from storage.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the value.
     * @param {*} value - The value.
     */
    storageValue(receiverId, key, value) {
        this.message.send('storage_value', { key: key, value: value, receiverId: receiverId });
    }

    /**
     * @description Sends a message to remove a value from storage.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} key - The key of the value to remove.
     */
    storageRemove(receiverId, key) {
        this.message.send('storage_remove', { key: key, receiverId: receiverId });
    }

    /**
     * @description Sends a message to get all values from storage.
     * @param {string} receiverId - The ID of the receiver.
     */
    storageGetAll(receiverId) {
        this.message.send('storage_get_all', { receiverId: receiverId });
    }

    /**
     * @description Sends a response with all values from storage.
     * @param {string} receiverId - The ID of the receiver.
     * @param {object} values - The values from storage.
     */
    storageAllValues(receiverId, values) {
        this.message.send('storage_all_values', { values: values, receiverId: receiverId });
    }

    /**
     * @description Sends a message to clear storage.
     * @param {string} receiverId - The ID of the receiver.
     */
    storageClear(receiverId) {
        this.message.send('storage_clear', { receiverId: receiverId });
    }

    /**
     * @description Sends a chat message.
     * @param {string} prompt - The prompt to send.
     */
    chat(prompt) {
        this.message.send('chat', { prompt: prompt, senderId });
    }

    /**
     * @description Sends a new session message.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} providerName - The name of the provider.
     */
    newSession(receiverId, providerName) {
        this.message.send('new_session', { providerName: providerName, receiverId: receiverId });
    }

    /**
     * @description Sends a focus message.
     * @param {string} receiverId - The ID of the receiver.
     */
    focus(receiverId) {
        this.message.send('focus', { receiverId: receiverId });
    }

    /**
     * @description Sends a change provider message.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} url - The new URL of the provider.
     */
    changeProvider(receiverId, url) {
        this.message.send('change_provider', { url: url, receiverId: receiverId });
    }

    /**
     * @description Sends a prompt message.
     * @param {string} receiverId - The ID of the receiver.
     * @param {string} text - The prompt text.
     */
    prompt(receiverId, text) {
        this.message.send('prompt', { text: text, receiverId: receiverId });
    }

    /**
     * @description Sends an export message.
     * @param {string} receiverId - The ID of the receiver.
     */
    export(receiverId) {
        this.message.send('export', { receiverId: receiverId });
    }

    /**
     * @description Sends a create message.
     * @param {object} data - The data for creating a chat area.
     */
    create(data) {
        this.message.send('create', data);
    }

    /**
     * @description Sends an answer message.
     * @param {string} receiverId - The ID of the chat area.
     * @param {number} index - The index of the answer.
     * @param {string} content - The content of the answer.
     */
    answer(receiverId, index, content) {
        this.message.send('answer', { receiverId: receiverId, index: index, content: content });
    }

    /**
     * @description Sends a title change message.
     * @param {string} receiverId - The ID of the chat area.
     * @param {string} title - The new title.
     */
    titleChange(receiverId, title) {
        this.message.send('titleChange', { receiverId: receiverId, title: title });
    }

    /**
     * @description Sends an option change message.
     * @param {string} receiverId - The ID of the chat area.
     * @param {string} key - The key of the option.
     * @param {*} value - The new value of the option.
     */
    optionChange(receiverId, key, value) {
        this.message.send('optionChange', { receiverId: receiverId, key: key, value: value });
    }

    /**
     * @description Sends a question message.
     * @param {string} receiverId - The ID of the chat area.
     * @param {number} index - The index of the question.
     * @param {string} content - The content of the question.
     */
    question(receiverId, index, content) {
        this.message.send('question', { receiverId: receiverId, index: index, content: content });
    }

    /**
     * @description Sends a model version change message.
     * @param {string} receiverId - The ID of the chat area.
     * @param {string} version - The new model version.
     */
    modelVersionChange(receiverId, version) {
        this.message.send('modelVersionChange', { receiverId: receiverId, version: version });
    }

    /**
     * @description Sends a set option message to PageController.
     * @param {string} id - The ID of the chat area.
     * @param {string} key - The key of the option to set.
     * @param {*} value - The new value of the option.
     */
    setOption(receiverId, key, value) {
        this.message.send('setOption', { receiverId: receiverId, key: key, value: value });
    }

    /**
     * @description Sends a set model version message to PageController.
     * @param {string} receiverId - The ID of the chat area.
     * @param {string} version - The model version to set.
     */
    setModelVersion(receiverId, version) {
        this.message.send('setModelVersion', { receiverId: receiverId, version: version });
    }

    /**
     * @description Sends a set answer status message to PageController.
     * @param {string} receiverId - The ID of the chat area.
     * @param {number} index - The index of the answer.
     * @param {boolean} collapsed - Whether the answer should be collapsed.
     */
    setAnswerStatus(receiverId, index, collapsed) {
        this.message.send('setAnswerStatus', { receiverId: receiverId, index: index, collapsed: collapsed });
    }

    /**
     * @description Sends a thread message to PageController for new session.
     * @param {string} receiverId - The ID of the chat area.
     */
    thread(receiverId) {
        this.message.send('thread', { receiverId: receiverId });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageClient;
}
