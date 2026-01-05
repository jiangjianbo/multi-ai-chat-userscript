/**
 * @description A client for sending semantic messages.
 * @param {object} message - The message object from message.js.
 */
function MessageClient(message) {
    this.message = message;
}

/**
 * @description Sends a parameter changed message.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the parameter that changed.
 * @param {*} newValue - The new value of the parameter.
 * @param {*} oldValue - The old value of the parameter.
 */
MessageClient.prototype.sendParamChanged = function(receiverId, key, newValue, oldValue) {
    this.message.send('param_changed', { key: key, newValue: newValue, oldValue: oldValue, receiverId: receiverId });
};

/**
 * @description Sends a command to sync the chat.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} prompt - The prompt to sync.
 */
MessageClient.prototype.syncChat = function(receiverId, prompt) {
    this.message.send('sync_chat', { prompt: prompt, receiverId: receiverId });
};

/**
 * @description Sends a message to get a parameter value.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the parameter to get.
 */
MessageClient.prototype.getParam = function(receiverId, key) {
    this.message.send('get_param', { key: key, receiverId: receiverId });
};

/**
 * @description Sends a response with a parameter value.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the parameter.
 * @param {*} value - The value of the parameter.
 */
MessageClient.prototype.paramValue = function(receiverId, key, value) {
    this.message.send('param_value', { key: key, value: value, receiverId: receiverId });
};

/**
 * @description Sends a message indicating the chat has started.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.chatStarted = function(receiverId) {
    this.message.send('chat_started', { receiverId: receiverId });
};

/**
 * @description Sends a message indicating the chat has completed.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} response - The chat response.
 */
MessageClient.prototype.chatCompleted = function(receiverId, response) {
    this.message.send('chat_completed', { response: response, receiverId: receiverId });
};

/**
 * @description Sends a message indicating the chat has failed.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} error - The error message.
 */
MessageClient.prototype.chatFailed = function(receiverId, error) {
    this.message.send('chat_failed', { error: error, receiverId: receiverId });
};

/**
 * @description Sends a message to register a chat area.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} name - The name of the chat area.
 * @param {string} url - The URL of the chat area.
 */
MessageClient.prototype.registerChatArea = function(receiverId, name, url) {
    this.message.send('register_chat_area', { name: name, url: url, receiverId: receiverId });
};

/**
 * @description Sends a message to get all chat areas.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.getAllChatAreas = function(receiverId) {
    this.message.send('get_all_chat_areas', { receiverId: receiverId });
};

/**
 * @description Sends a response with all chat areas.
 * @param {string} receiverId - The ID of the receiver.
 * @param {Array} chatAreas - The list of chat areas.
 */
MessageClient.prototype.allChatAreas = function(receiverId, chatAreas) {
    this.message.send('all_chat_areas', { chatAreas: chatAreas, receiverId: receiverId });
};

/**
 * @description Sends a message to close the window.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.closeWindow = function(receiverId) {
    this.message.send('close_window', { receiverId: receiverId });
};

/**
 * @description Sends a message to set a value in storage.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the value to set.
 * @param {*} value - The value to set.
 */
MessageClient.prototype.storageSet = function(receiverId, key, value) {
    this.message.send('storage_set', { key: key, value: value, receiverId: receiverId });
};

/**
 * @description Sends a message to get a value from storage.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the value to get.
 */
MessageClient.prototype.storageGet = function(receiverId, key) {
    this.message.send('storage_get', { key: key, receiverId: receiverId });
};

/**
 * @description Sends a response with a value from storage.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the value.
 * @param {*} value - The value.
 */
MessageClient.prototype.storageValue = function(receiverId, key, value) {
    this.message.send('storage_value', { key: key, value: value, receiverId: receiverId });
};

/**
 * @description Sends a message to remove a value from storage.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} key - The key of the value to remove.
 */
MessageClient.prototype.storageRemove = function(receiverId, key) {
    this.message.send('storage_remove', { key: key, receiverId: receiverId });
};

/**
 * @description Sends a message to get all values from storage.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.storageGetAll = function(receiverId) {
    this.message.send('storage_get_all', { receiverId: receiverId });
};

/**
 * @description Sends a response with all values from storage.
 * @param {string} receiverId - The ID of the receiver.
 * @param {object} values - The values from storage.
 */
MessageClient.prototype.storageAllValues = function(receiverId, values) {
    this.message.send('storage_all_values', { values: values, receiverId: receiverId });
};

/**
 * @description Sends a message to clear storage.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.storageClear = function(receiverId) {
    this.message.send('storage_clear', { receiverId: receiverId });
};

/**
 * @description Sends a chat message.
 * @param {string} prompt - The prompt to send.
 */
MessageClient.prototype.chat = function(prompt) {
    this.message.send('chat', { prompt: prompt });
};

/**
 * @description Sends a new session message.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} providerName - The name of the provider.
 */
MessageClient.prototype.newSession = function(receiverId, providerName) {
    this.message.send('new_session', { providerName: providerName, receiverId: receiverId });
};

/**
 * @description Sends a focus message.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.focus = function(receiverId) {
    this.message.send('focus', { receiverId: receiverId });
};

/**
 * @description Sends a change provider message.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} url - The new URL of the provider.
 */
MessageClient.prototype.changeProvider = function(receiverId, url) {
    this.message.send('change_provider', { url: url, receiverId: receiverId });
};

/**
 * @description Sends a prompt message.
 * @param {string} receiverId - The ID of the receiver.
 * @param {string} text - The prompt text.
 */
MessageClient.prototype.prompt = function(receiverId, text) {
    this.message.send('prompt', { text: text, receiverId: receiverId });
};

/**
 * @description Sends an export message.
 * @param {string} receiverId - The ID of the receiver.
 */
MessageClient.prototype.export = function(receiverId) {
    this.message.send('export', { receiverId: receiverId });
};

/**
 * @description Sends a create message.
 * @param {object} data - The data for creating a chat area.
 */
MessageClient.prototype.create = function(data) {
    this.message.send('create', data);
};

/**
 * @description Sends an answer message.
 * @param {string} id - The ID of the chat area.
 * @param {number} index - The index of the answer.
 * @param {string} content - The content of the answer.
 */
MessageClient.prototype.answer = function(id, index, content) {
    this.message.send('answer', { id: id, index: index, content: content });
};

/**
 * @description Sends a title change message.
 * @param {string} id - The ID of the chat area.
 * @param {string} title - The new title.
 */
MessageClient.prototype.titleChange = function(id, title) {
    this.message.send('titleChange', { id: id, title: title });
};

/**
 * @description Sends an option change message.
 * @param {string} id - The ID of the chat area.
 * @param {string} key - The key of the option.
 * @param {*} value - The new value of the option.
 */
MessageClient.prototype.optionChange = function(id, key, value) {
    this.message.send('optionChange', { id: id, key: key, value: value });
};

/**
 * @description Sends a question message.
 * @param {string} id - The ID of the chat area.
 * @param {number} index - The index of the question.
 * @param {string} content - The content of the question.
 */
MessageClient.prototype.question = function(id, index, content) {
    this.message.send('question', { id: id, index: index, content: content });
};

/**
 * @description Sends a model version change message.
 * @param {string} id - The ID of the chat area.
 * @param {string} version - The new model version.
 */
MessageClient.prototype.modelVersionChange = function(id, version) {
    this.message.send('modelVersionChange', { id: id, version: version });
};

/**
 * @description Sends a set option message to PageController.
 * @param {string} id - The ID of the chat area.
 * @param {string} key - The key of the option to set.
 * @param {*} value - The new value of the option.
 */
MessageClient.prototype.setOption = function(id, key, value) {
    this.message.send('setOption', { id: id, key: key, value: value });
};

/**
 * @description Sends a set model version message to PageController.
 * @param {string} id - The ID of the chat area.
 * @param {string} version - The model version to set.
 */
MessageClient.prototype.setModelVersion = function(id, version) {
    this.message.send('setModelVersion', { id: id, version: version });
};

/**
 * @description Sends a set answer status message to PageController.
 * @param {string} id - The ID of the chat area.
 * @param {number} index - The index of the answer.
 * @param {boolean} collapsed - Whether the answer should be collapsed.
 */
MessageClient.prototype.setAnswerStatus = function(id, index, collapsed) {
    this.message.send('setAnswerStatus', { id: id, index: index, collapsed: collapsed });
};

/**
 * @description Sends a thread message to PageController for new session.
 * @param {string} id - The ID of the chat area.
 */
MessageClient.prototype.thread = function(id) {
    this.message.send('thread', { id: id });
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageClient;
}
