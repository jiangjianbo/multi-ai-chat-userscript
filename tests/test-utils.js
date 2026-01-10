/**
 * 测试辅助工具模块
 * 用于修复源代码中的问题和提供测试所需的通用功能
 */

const Util = require('../src/util');
const SyncChatWindow = require('../src/sync-chat-window');

// 创建 Util 实例
const utilInstance = new Util();

// 创建 SyncChatWindow 实例（用于 _addStyles 方法）
const syncChatWindowInstance = new SyncChatWindow();

/**
 * 修复 util.js 中 toHtml 方法的递归调用问题
 * 源代码使用了 toHtml(childJson) 而不是 this.toHtml(childJson)
 * 在测试环境中，我们需要提供一个全局的 toHtml 函数
 *
 * @param {object} json - JSON 对象
 * @returns {HTMLElement} - HTML 元素
 */
function toHtml(json) {
    return utilInstance.toHtml(json);
}

/**
 * 修复 sync-chat-window.js 中 _addStyles 方法的调用问题
 * 源代码使用了 _addStyles(doc) 而不是 this._addStyles(doc)
 * 在测试环境中，我们需要提供一个全局的 _addStyles 函数
 *
 * @param {object} doc - 文档对象
 * @returns {string} - CSS 样式字符串
 */
function _addStyles(doc) {
    return syncChatWindowInstance._addStyles(doc);
}

// 将函数挂载到全局，供源代码中的调用使用
global.toHtml = toHtml;
global._addStyles = _addStyles;

// 导出工具函数
module.exports = {
    util: utilInstance,
    toHtml,
    syncChatWindow: syncChatWindowInstance,
    _addStyles,
    /**
     * 清理测试环境
     */
    cleanup() {
        // 测试结束后清理
    }
};
