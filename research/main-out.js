console.log('Initializing main window.');
debugger;
window.mainWindowName = 'multi-ai-chat-main-window';
var MainWindowInitializer;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 27:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
                function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
                function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
                function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
                function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
                function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
                var Storage = __webpack_require__(892);

                /**
                 * @description 管理应用的配置参数。
                 * @param {Storage} storage - Storage 实例.
                 * @param {object} [defaultConfig={}] - 默认配置.
                 */
                function Config(storage) {
                    var defaultConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    if (!storage) {
                        throw new Error('Storage instance must be provided to Config.');
                    }
                    this.storage = storage;
                    var a_defaultConfig = defaultConfig;
                    var runtimeConfig = {};
                    var CONFIG_STORAGE_KEY = 'user-config';

                    /**
                     * @description 初始化，加载用户配置。
                     */
                    this.init = function () {
                        var userConfig = this.storage.get(CONFIG_STORAGE_KEY, {});
                        runtimeConfig = _objectSpread(_objectSpread({}, a_defaultConfig), userConfig);
                    };

                    /**
                     * @description 获取配置项。
                     * @param {string} key - 键名。
                     * @param {*} [defaultValue] - 如果未找到，覆盖默认值的默认值。
                     * @returns {*} - 配置值。
                     */
                    this.get = function (key) {
                        var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
                        if (defaultValue !== undefined && runtimeConfig[key] === undefined) {
                            return defaultValue;
                        }
                        return runtimeConfig[key] === undefined ? null : runtimeConfig[key];
                    };

                    /**
                     * @description 设置配置项并持久化。
                     * @param {string} key - 键名。
                     * @param {*} value - 配置值。
                     */
                    this.set = function (key, value) {
                        runtimeConfig[key] = value;
                        // 只持久化与默认值不同的或新增的配置
                        var userConfig = this.storage.get(CONFIG_STORAGE_KEY, {});
                        userConfig[key] = value;
                        this.storage.set(CONFIG_STORAGE_KEY, userConfig);
                    };

                    /**
                     * @description 获取所有配置项。
                     * @returns {object}
                     */
                    this.getAll = function () {
                        return _objectSpread({}, runtimeConfig);
                    };

                    /**
                     * @description 恢复默认配置。
                     */
                    this.restoreDefaults = function () {
                        runtimeConfig = _objectSpread({}, a_defaultConfig);
                        this.storage.remove(CONFIG_STORAGE_KEY);
                    };

                    // 初始化
                    this.init();
                }
                module.exports = Config;

                /***/
}),

/***/ 89:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                var DriverFactory = __webpack_require__(540);
                var Util = __webpack_require__(825);
                function ChatArea(mainController, id, url, container, i18n) {
                    var _this3 = this;
                    var driverFactory = new DriverFactory();
                    var utils = new Util();
                    this.mainController = mainController;
                    this.id = id;
                    this.url = url;
                    this.container = container;
                    this.i18n = i18n;
                    this.element = null;
                    this.hideTimeout = null;
                    this.pinned = false;
                    this.eventHandlers = {
                        onEvtClose: function onEvtClose(chatArea) { },
                        onEvtNewSession: function onEvtNewSession(chatArea, providerName) { },
                        onEvtShare: function onEvtShare(chatArea, url) { },
                        onEvtParamChanged: function onEvtParamChanged(chatArea, key, newValue, oldValue) { },
                        onEvtProviderChanged: function onEvtProviderChanged(chatArea, newProvider, oldProvider) { },
                        onEvtPromptSend: function onEvtPromptSend(chatArea, text) { },
                        onEvtExport: function onEvtExport() { }
                    };
                    this.setEventHandler = function (eventName, handler) {
                        var name = "";
                        var ev = eventName.toLowerCase();
                        if (ev == "onEvtClose".toLowerCase() || ev == "Close".toLowerCase()) name = "onEvtClose";
                        if (ev == "onEvtNewSession".toLowerCase() || ev == "NewSession".toLowerCase()) name = "onEvtNewSession";
                        if (ev == "onEvtShare".toLowerCase() || ev == "Share".toLowerCase()) name = "onEvtShare";
                        if (ev == "onEvtParamChanged".toLowerCase() || ev == "ParamChanged".toLowerCase()) name = "onEvtParamChanged";
                        if (ev == "onEvtProviderChanged".toLowerCase() || ev == "ProviderChanged".toLowerCase()) name = "onEvtProviderChanged";
                        if (ev == "onEvtPromptSend".toLowerCase() || ev == "PromptSend".toLowerCase()) name = "onEvtPromptSend";
                        if (ev == "onEvtExport".toLowerCase() || ev == "Export".toLowerCase()) name = "onEvtExport";
                        if (name.length > 0) this.eventHandlers[name] = handler;
                    };

                    /**
                     * 初始化结构
                     * @param {object} instanceData 初始化数据，结构为{id, providerName, params:{webAccess,longThought, models}, conversation:[{type, content}], pinned}
                     */
                    this.init = function (instanceData) {
                        var chatAreaHtml = this.render(instanceData);
                        this.container.innerHTML = chatAreaHtml;
                        this.element = this.container; //.querySelector('.chat-area-instance');
                        if (!this.url) {
                            this.element.classList.add('forced-selection');
                        }
                        this.pinned = instanceData.pinned || false;
                        this.cacheDOMElements();
                        this.initEventListeners();
                        this.updatePinState();
                    };

                    /**
                     * 渲染问答内容
                     * @param {object} data 初始化渲染问答内容，结构为{id, providerName, params:{webAccess,longThought, models}, conversation:{type, content}[], pinned}
                     * @returns 
                     */
                    this.render = function (data) {
                        console.debug("Rendering ChatArea ".concat(data.id, " with provider ").concat(data.providerName, ", data = ").concat(JSON.stringify(data)));
                        var providers = driverFactory.getProviders().map(function (m, i) {
                            return "<div class=\"model-option\" data-value=\"".concat(m, "\">").concat(m, "</div>");
                        }).join('');
                        var versions = (data.params.models || []).map(function (m, i) {
                            return "<option>".concat(m, "</option>");
                        }).join('');
                        var answers = (data.conversation || []).filter(function (msg) {
                            return msg.type === 'answer';
                        });
                        var indexHtml = answers.map(function (ans, i) {
                            return "<div class=\"index-item\"><a href=\"#answer-".concat(data.id, "-").concat(i, "\">").concat(i + 1, "</a></div>");
                        }).join('');
                        var conversationHtml = (data.conversation || []).map(function (msg) {
                            var id = '';
                            if (msg.type === 'answer') {
                                var answerIndex = answers.indexOf(msg);
                                id = "id=\"answer-".concat(data.id, "-").concat(answerIndex, "\"");
                            }
                            return "<div class=\"message-bubble ".concat(msg.type, "\" ").concat(id, "><div class=\"bubble-content\">").concat(msg.content, "</div></div>");
                        }).join('');
                        var overlayHtml = this.url ? '' : "\n            <div class=\"forced-selection-overlay\">\n                <div class=\"selection-hint\" style=\"position: absolute; top: 10px; left: 10px; text-align: left; color: white; font-size: 1.2em; background-color: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px; z-index: 10; display: flex; align-items: center;\">\n                    <div style=\"font-size: 2em; margin-right: 10px; line-height: 1;\">\u2196\uFE0F</div>\n                    <span data-lang-key=\"selectProviderHint\">Please select an AI provider from the dropdown above to start chatting.</span>\n                </div>\n            </div>\n        ";
                        var modelSelectorClass = this.url ? 'model-selector' : 'model-selector highlight-dropdown';
                        return "\n            ".concat(overlayHtml, "\n            <div class=\"chat-area-title\">\n                <div class=\"title-left\">\n                    <div class=\"").concat(modelSelectorClass, "\">\n                        <div class=\"model-name\">").concat(data.providerName, "</div>\n                        <div class=\"model-dropdown-arrow\">&#9662;</div> <!-- \u65B0\u589E\u7684\u7BAD\u5934div -->\n                        <div class=\"custom-dropdown model-dropdown\">\n                            ").concat(providers, "\n                        </div>\n                    </div>\n                    <div class=\"title-button new-session-button\" title=\"New Session\" data-lang-key=\"newSessionButtonTitle\">&#10133;</div>\n                </div>\n                <div class=\"title-center\">\n                    <div class=\"title-button expand-all\" title=\"Expand All\" data-lang-key=\"expandAllButtonTitle\">&#x2924;</div>\n                    <div class=\"title-button collapse-all\" title=\"Collapse All\" data-lang-key=\"collapseAllButtonTitle\">&#x2922;</div>\n                    <div class=\"title-button export-button\" title=\"Export Content\" data-lang-key=\"exportContentButtonTitle\">&#128228;</div>\n                </div>\n                <div class=\"title-right\">\n                    <div class=\"params-selector\">\n                        <div class=\"title-button params-button\" title=\"Parameters\" data-lang-key=\"parametersButtonTitle\">&#9881;</div>\n                        <div class=\"custom-dropdown params-dropdown\">\n                            <div class=\"param-item\" data-param-name=\"webAccess\"><label data-lang-key=\"webAccessLabel\">Web Access</label><label class=\"toggle-switch\"><input type=\"checkbox\" id=\"web-access-").concat(data.id, "\" ").concat(data.params.webAccess ? 'checked' : '', "><span class=\"slider\"></span></label></div>\n                            <div class=\"param-item\" data-param-name=\"longThought\"><label data-lang-key=\"longThoughtLabel\">Long Thought</label><label class=\"toggle-switch\"><input type=\"checkbox\" id=\"long-thought-").concat(data.id, "\" ").concat(data.params.longThought ? 'checked' : '', "><span class=\"slider\"></span></label></div>\n                            <hr>\n                            <div class=\"param-item\" data-param-name=\"modelVersion\"><label data-lang-key=\"modelVersionLabel\">Model Version</label>\n                                <select>").concat(versions, "</select>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"title-button share-button\" title=\"Share\" data-lang-key=\"shareButtonTitle\">&#128279;</div>\n                    <div class=\"title-button pin-button\" title=\"Pin\" data-lang-key=\"pinButtonTitle\"><span class=\"icon\">&#128204;</span></div>\n                    <div class=\"title-button close-button\" title=\"Close\" data-lang-key=\"closeButtonTitle\">&#10006;</div>\n                </div>\n            </div>\n            <div class=\"chat-area-main\">\n                <div class=\"chat-area-index\">\n                    ").concat(indexHtml, "\n                </div>\n                <div class=\"chat-area-conversation\">").concat(conversationHtml, "</div>\n            </div>\n            <div class=\"input-placeholder\" data-lang-key=\"inputPlaceholder\">Input</div>\n            <div class=\"chat-area-input\">\n                <textarea rows=\"1\" placeholder=\"Type your message...\" data-lang-key=\"typeMessagePlaceholder\"></textarea>\n                <button title=\"Send\" data-lang-key=\"sendButtonTitle\">&#10148;</button>\n            </div>\n        ");
                    };
                    this.cacheDOMElements = function () {
                        this.mainArea = this.element.querySelector('.chat-area-main');
                        this.placeholder = this.element.querySelector('.input-placeholder');
                        this.inputArea = this.element.querySelector('.chat-area-input');
                        this.textarea = this.element.querySelector('textarea');
                        this.conversationArea = this.element.querySelector('.chat-area-conversation');
                        this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
                        this.modelSelector = this.element.querySelector('.model-selector');
                        this.providerNameDisplay = this.modelSelector.querySelector('.model-name');
                        this.modelDropdown = this.modelSelector.querySelector('.model-dropdown');
                        this.paramsSelector = this.element.querySelector('.params-selector');
                        this.paramsButton = this.paramsSelector.querySelector('.params-button');
                        this.paramsDropdown = this.paramsSelector.querySelector('.params-dropdown');
                    };
                    this.initEventListeners = function () {
                        var _this = this;
                        this.pinButton = this.element.querySelector('.pin-button');
                        this.pinButton.addEventListener('click', function () {
                            return _this.setPin(!_this.isPinned());
                        });
                        this.element.querySelector('.close-button').addEventListener('click', function () {
                            _this.eventHandlers.onEvtClose(_this);
                            _this.mainController.removeChatArea(_this.id);
                        });
                        this.element.querySelector('.new-session-button').addEventListener('click', function () {
                            _this.eventHandlers.onEvtNewSession(_this, _this.getProvider());
                        });
                        this.element.querySelector('.share-button').addEventListener('click', function () {
                            _this.eventHandlers.onEvtShare(_this, _this.getUrl());
                        });
                        this.providerNameDisplay.addEventListener('click', function (e) {
                            return _this.toggleDropdown(e, _this.modelDropdown);
                        });
                        this.paramsButton.addEventListener('click', function (e) {
                            return _this.toggleDropdown(e, _this.paramsDropdown);
                        });
                        var selectOldValue;
                        var selectElement = this.paramsDropdown.querySelector('select');
                        selectElement.addEventListener('focus', function (e) {
                            selectOldValue = e.target.value;
                        });
                        this.paramsDropdown.addEventListener('change', function (e) {
                            var target = e.target;
                            var name, oldValue, newValue;
                            var paramItem = target.closest('.param-item');
                            if (!paramItem) return;
                            name = paramItem.dataset.paramName;
                            if (target.type === 'checkbox') {
                                newValue = target.checked;
                                oldValue = !newValue;
                            } else if (target.tagName === 'SELECT') {
                                newValue = target.value;
                                oldValue = selectOldValue;
                            }
                            if (name) {
                                _this.eventHandlers.onEvtParamChanged(_this, name, newValue, oldValue);
                            }
                        });
                        this.modelDropdown.querySelectorAll('.model-option').forEach(function (option) {
                            option.addEventListener('click', function (e) {
                                var oldProvider = _this.getProvider();
                                var newProvider = e.currentTarget.dataset.value;
                                _this.providerNameDisplay.textContent = newProvider;
                                _this.eventHandlers.onEvtProviderChanged(_this, newProvider, oldProvider);
                                _this.modelDropdown.classList.remove('visible');
                                if (_this.element.classList.contains('forced-selection')) {
                                    _this.element.classList.remove('forced-selection');
                                    var overlay = _this.element.querySelector('.forced-selection-overlay');
                                    if (overlay) {
                                        overlay.remove();
                                    }
                                    _this.url = driverFactory.getProviderUrl(newProvider);
                                }
                            });
                        });
                        this.element.querySelector('.expand-all').addEventListener('click', function () {
                            return _this.expandAll();
                        });
                        this.element.querySelector('.collapse-all').addEventListener('click', function () {
                            return _this.collapseAll();
                        });
                        this.element.querySelector('.export-button').addEventListener('click', function () {
                            _this.eventHandlers.onEvtExport(_this);
                        });
                        this.placeholder.addEventListener('mouseenter', function () {
                            return _this.showInput();
                        });
                        this.inputArea.addEventListener('mouseenter', function () {
                            return _this.showInput();
                        });
                        this.inputArea.addEventListener('mouseleave', function () {
                            return _this.undockInput();
                        });
                        this.textarea.addEventListener('focus', function () {
                            return _this.dockInput();
                        });
                        this.inputArea.addEventListener('focusout', function (e) {
                            return _this.handleFocusOut(e);
                        });
                        this.inputArea.querySelector('button').addEventListener('click', function () {
                            var prompt = _this.textarea.value.trim();
                            if (prompt) {
                                _this.eventHandlers.onEvtPromptSend(_this, prompt);
                                _this.textarea.value = '';
                            }
                        });
                    };
                    this.isPinned = function () {
                        return this.pinned;
                    };
                    this.setPin = function (isPinned) {
                        this.pinned = isPinned;
                        this.updatePinState();
                        // Notify main controller to update layout
                        if (this.mainController && this.mainController.updateLayout) {
                            this.mainController.updateLayout();
                        }
                    };
                    this.updatePinState = function () {
                        if (this.pinButton) {
                            this.pinButton.classList.toggle('pinned', this.pinned);
                        }
                    };

                    /**
                     * @description 根据不可用提供商列表更新下拉选项的UI状态。
                     * @param {string[]} unavailableProviders - 不可用的AI提供商名称数组。
                     */
                    this.updateProviderOptions = function (unavailableProviders) {
                        var _this2 = this;
                        var currentSelectedProvider = this.getProvider(); // 获取当前ChatArea已选择的提供商

                        this.modelDropdown.querySelectorAll('.model-option').forEach(function (option) {
                            var providerName = option.dataset.value;
                            // 如果提供商在不可用列表中，并且不是当前ChatArea自己的选择，则禁用
                            if (unavailableProviders.includes(providerName) && providerName !== currentSelectedProvider) {
                                option.classList.add('unavailable');
                                option.style.pointerEvents = 'none'; // 阻止点击
                                option.setAttribute('title', _this2.i18n.getText('providerUnavailable')); // 提示不可用语言key
                            } else {
                                option.classList.remove('unavailable');
                                option.style.pointerEvents = 'auto'; // 允许点击
                                option.removeAttribute('title');
                            }
                        });
                    };
                    this.toggleDropdown = function (event, dropdown) {
                        event.stopPropagation();
                        if (dropdown === this.modelDropdown) {
                            var unavailable = this.mainController.getUnavailableProviders(this.id);
                            this.updateProviderOptions(unavailable);
                        }
                        dropdown.classList.toggle('visible');
                    };
                    this.closeDropdowns = function () {
                        this.modelDropdown.classList.remove('visible');
                        this.paramsDropdown.classList.remove('visible');
                    };
                    this.expandAll = function () {
                        return _this3.answerBubbles.forEach(function (b) {
                            return b.classList.remove('collapsed');
                        });
                    };
                    this.collapseAll = function () {
                        return _this3.answerBubbles.forEach(function (b) {
                            return b.classList.add('collapsed');
                        });
                    };
                    this.showInput = function () {
                        clearTimeout(this.hideTimeout);
                        this.placeholder.classList.add('hidden');
                        this.inputArea.classList.add('visible');
                    };
                    this.dockInput = function () {
                        this.showInput();
                        this.inputArea.classList.add('docked');
                        this.mainArea.style.paddingBottom = "".concat(this.inputArea.offsetHeight, "px");
                    };
                    this.undockInput = function () {
                        var _this4 = this;
                        this.inputArea.classList.remove('docked');
                        this.mainArea.style.paddingBottom = '0px';
                        this.hideTimeout = setTimeout(function () {
                            if (!_this4.inputArea.contains(document.activeElement)) {
                                _this4.inputArea.classList.remove('visible');
                                _this4.placeholder.classList.remove('hidden');
                            }
                        }, 300);
                    };
                    this.handleFocusOut = function (event) {
                        if (!this.inputArea.contains(event.relatedTarget)) this.undockInput();
                    };
                    this.addMessage = function (content, type) {
                        var answers = Array.from(this.answerBubbles);
                        var answerIndex = answers.length;
                        var id = "answer-".concat(this.id, "-").concat(answerIndex);
                        var messageJson = {
                            tag: 'div',
                            '@class': "message-bubble ".concat(type),
                            '@id': type === 'answer' ? id : '',
                            child: [{
                                tag: 'div',
                                '@class': 'bubble-content',
                                innerHTML: content
                            }]
                        };
                        var messageElement = utils.toHtml(messageJson);
                        this.conversationArea.appendChild(messageElement);
                        this.conversationArea.scrollTop = this.conversationArea.scrollHeight;
                        if (type === 'answer') {
                            var indexJson = {
                                tag: 'div',
                                '@class': 'index-item',
                                child: [{
                                    tag: 'a',
                                    '@href': "#".concat(id),
                                    text: "".concat(answerIndex + 1)
                                }]
                            };
                            this.element.querySelector('.chat-area-index').appendChild(utils.toHtml(indexJson));
                            this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
                        }
                    };
                    this.destroy = function () {
                        // Internal cleanup can go here. DOM removal is handled by the controller.
                    };
                    this.getProvider = function () {
                        return this.providerNameDisplay.textContent.trim();
                    };
                    this.getWebAccess = function () {
                        return this.element.querySelector("#web-access-".concat(this.id)).checked;
                    };
                    this.getLongThought = function () {
                        return this.element.querySelector("#long-thought-".concat(this.id)).checked;
                    };
                    this.getModelVersion = function () {
                        return this.paramsDropdown.querySelector('select').value;
                    };
                    this.getUrl = function () {
                        return this.url;
                    };
                    this.setWebAccess = function (value) {
                        this.element.querySelector("#web-access-".concat(this.id)).checked = value;
                    };
                    this.setLongThought = function (value) {
                        this.element.querySelector("#long-thought-".concat(this.id)).checked = value;
                    };
                    this.updateTitle = function (title) {
                        // Assuming there's an element to display the title, e.g., this.element.querySelector('.chat-title-display')
                        // For now, we'll just log it.
                        console.log("ChatArea ".concat(this.id, ": Title updated to ").concat(title));
                    };
                    this.updateOption = function (key, value) {
                        // This will depend on how options are displayed in ChatArea.
                        // For now, we'll just log it.
                        console.log("ChatArea ".concat(this.id, ": Option ").concat(key, " updated to ").concat(value));
                    };
                    this.addQuestion = function (content) {
                        this.addMessage(content, 'question');
                    };
                    this.updateModelVersion = function (version) {
                        // Assuming there's an element to display the model version.
                        // For now, we'll just log it.
                        console.log("ChatArea ".concat(this.id, ": Model version updated to ").concat(version));
                    };
                    this.newSession = function () {
                        // Clear conversation, reset state for a new session.
                        this.conversationArea.innerHTML = '';
                        this.element.querySelector('.chat-area-index').innerHTML = '';
                        this.answerBubbles = this.element.querySelectorAll('.message-bubble.answer');
                        console.log("ChatArea ".concat(this.id, ": Started new session."));
                    };
                }
                module.exports = ChatArea;

                /***/
}),

/***/ 190:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
                function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
                function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
                function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
                function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
                function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
                var ChatArea = __webpack_require__(89);
                var Util = __webpack_require__(825);
                var DriverFactory = __webpack_require__(540);

                /**
                 * @description Core controller for the main window.
                 * @param {string} receiverId - 用于接收消息的唯一id
                 * @param {object} message - The message bus instance.
                 * @param {object} config - The configuration instance.
                 * @param {object} i18n - The internationalization instance.
                 */
                function MainWindowController(receiverId, message, config, i18n) {
                    var _this = this;
                    this.receiverId = receiverId;
                    this.message = message;
                    this.config = config;
                    this.i18n = i18n;
                    this.util = new Util();
                    this.chatAreas = new Map();
                    this.driverFactory = new DriverFactory(); // 只是用来获取提供商URL和模型列表
                    this.defaultDriverParams = null; // 默认的页面参数， webAccess, longThought等  
                    this.selectedProviders = new Map(); // K: providerName, V: chatAreaId
                    this.element = null;
                    this.chatAreaContainer = null;
                    this.layoutSwitcher = null;
                    this.eventHandlers = {
                        onEvtAllWebAccessChanged: function onEvtAllWebAccessChanged(newValue) {
                            _this.chatAreas.forEach(function (area) {
                                return area.setWebAccess(newValue);
                            });
                        },
                        onEvtAllLongThoughtChanged: function onEvtAllLongThoughtChanged(newValue) {
                            _this.chatAreas.forEach(function (area) {
                                return area.setLongThought(newValue);
                            });
                        },
                        onEvtAllPrompt: function onEvtAllPrompt(prompt) {
                            _this.message.send('chat', {
                                prompt: prompt
                            });
                        }
                    };
                    this.setEventHandler = function (eventName, handler) {
                        this.eventHandlers[eventName] = handler;
                    };

                    /**
                     * @description Switches the application language and updates all UI elements with `data-lang-key`.
                     * @param {string} newLang - The new language code (e.g., 'en', 'zh').
                     */
                    this.switchLanguage = function (newLang, rootElement) {
                        var _this2 = this;
                        var forceUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                        if (!forceUpdate && this.i18n.getCurrentLang() === newLang) {
                            return;
                        }
                        this.i18n.setCurrentLang(newLang);
                        var targetElement = rootElement || this.element;
                        var elements = targetElement.querySelectorAll('[data-lang-key]');
                        elements.forEach(function (el) {
                            var langKey = el.dataset.langKey;
                            var translatedText = _this2.i18n.getText(langKey);
                            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                                el.placeholder = translatedText;
                            } else if (el.hasAttribute('title')) {
                                el.title = translatedText;
                            } else {
                                el.textContent = translatedText;
                            }
                        });
                        // Close the language dropdown after switching
                        this.langDropdown.style.display = 'none';
                    };

                    /**
                     * @description Initializes the controller, renders the layout, and registers listeners.
                     */
                    this.init = function () {
                        this.cacheDOMElements();
                        this.initEventListeners();
                        this.initMessageListeners();
                        this.updateLayout(); // Initial layout update
                        this.updateNewChatButtonState();
                        this.switchLanguage(this.i18n.getCurrentLang(), this.element, true);
                    };

                    /**
                     * @description Caches frequently accessed DOM elements.
                     */
                    this.cacheDOMElements = function () {
                        this.element = document.querySelector('.main-window');
                        this.chatAreaContainer = this.element.querySelector('.content-area');
                        this.layoutSwitcher = this.element.querySelector('#layout-switcher');
                        this.globalSendButton = document.getElementById('global-send-button');
                        this.promptTextarea = document.getElementById('prompt-textarea');
                        this.promptWrapper = document.getElementById('prompt-wrapper');
                        this.langSwitcher = document.getElementById('lang-switcher');
                        this.langDropdown = document.getElementById('lang-dropdown');
                        this.settingsButton = document.getElementById('settings-button');
                        this.settingsMenu = document.getElementById('settings-menu');
                        this.newChatButton = document.getElementById('new-chat-button');
                    };

                    /**
                     * @description Initializes global event listeners.
                     */
                    this.initEventListeners = function () {
                        var _this3 = this;
                        // Layout Switcher
                        this.layoutSwitcher.addEventListener('click', function (e) {
                            if (e.target.matches('.layout-button')) {
                                _this3.setLayout(e.target.dataset.layout);
                            }
                        });

                        // Global Send
                        this.globalSendButton.addEventListener('click', function () {
                            var prompt = _this3.promptTextarea.value;
                            if (prompt.trim()) {
                                _this3.eventHandlers.onEvtAllPrompt(prompt);
                                _this3.promptTextarea.value = '';
                                _this3.promptWrapper.dataset.replicatedValue = ''; // Reset auto-grow
                            }
                        });

                        // Close Window
                        document.getElementById('main-window-close-button').addEventListener('click', function () {
                            window.close();
                        });

                        // Language Switcher
                        this.langSwitcher.addEventListener('click', function (e) {
                            e.stopPropagation();
                            _this3.langDropdown.style.display = _this3.langDropdown.style.display === 'block' ? 'none' : 'block';
                        });
                        this.langDropdown.addEventListener('click', function (e) {
                            if (e.target.matches('[data-lang]')) {
                                _this3.switchLanguage(e.target.dataset.lang, _this3.element, false);
                            }
                        });

                        // Settings Menu
                        this.settingsButton.addEventListener('click', function (e) {
                            e.stopPropagation();
                            var isDisplay = _this3.settingsMenu.style.display === 'block';
                            // 切换显示和隐藏
                            _this3.settingsMenu.style.display = isDisplay ? 'none' : 'block';
                        });
                        this.settingsMenu.addEventListener('click', function (e) {
                            return e.stopPropagation();
                        });
                        this.settingsMenu.querySelector('#web-access').addEventListener('change', function (e) {
                            _this3.eventHandlers.onEvtAllWebAccessChanged(e.target.checked);
                        });
                        this.settingsMenu.querySelector('#long-thought').addEventListener('change', function (e) {
                            _this3.eventHandlers.onEvtAllLongThoughtChanged(e.target.checked);
                        });
                        this.closeAllDropdowns = function () {
                            this.chatAreas.forEach(function (area) {
                                return area.closeDropdowns();
                            });
                        };

                        // Global click to close dropdowns
                        document.addEventListener('click', function (e) {
                            if (_this3.langDropdown) _this3.langDropdown.style.display = 'none';
                            if (_this3.settingsMenu) _this3.settingsMenu.style.display = 'none';
                            if (!e.target.closest('.model-selector') && !e.target.closest('.params-selector')) {
                                _this3.closeAllDropdowns();
                            }
                        });

                        // Auto-growing Textarea
                        this.promptTextarea.addEventListener('input', function () {
                            _this3.promptWrapper.dataset.replicatedValue = _this3.promptTextarea.value;
                        });
                        this.newChatButton.addEventListener('click', function () {
                            debugger;
                            try {
                                var newId = "chat-area-".concat(Date.now());
                                var webAccess = _this3.settingsMenu.querySelector('#web-access').checked;
                                var longThought = _this3.settingsMenu.querySelector('#long-thought').checked;
                                _this3.addChatArea({
                                    id: newId,
                                    url: null,
                                    providerName: 'New Chat',
                                    title: 'New Chat',
                                    params: {
                                        webAccess: webAccess,
                                        longThought: longThought,
                                        models: [],
                                        // 默认没有模型列表
                                        modelVersion: null // 默认没有模型版本
                                    },
                                    conversation: []
                                });
                            } catch (e) {
                                console.error("error:" + e);
                            }
                        });

                        // Populate Language Dropdown
                        var langs = this.i18n.getAllLangs();
                        this.langDropdown.innerHTML = langs.map(function (lang) {
                            return "<div data-lang=\"".concat(lang, "\">").concat(lang, "</div>");
                        }).join('');
                    };

                    /**
                     * @description Sets the layout for the chat areas.
                     * @param {string} layout - The layout to apply (e.g., '1', '2', '4', '6').
                     */
                    this.setLayout = function (layout) {
                        if (layout > 4) {
                            layout = '6'; // Max 6
                        } else if (layout > 2) {
                            layout = '4';
                        } else if (layout > 1) {
                            layout = '2';
                        } else if (layout < 1) layout = '1'; // Min 6

                        if (this.chatAreaContainer.dataset.layout !== layout) {
                            this.chatAreaContainer.dataset.layout = layout;
                            var currentActive = this.layoutSwitcher.querySelector('.active');
                            if (currentActive) currentActive.classList.remove('active');
                            var newActive = this.layoutSwitcher.querySelector("[data-layout=\"".concat(layout, "\"]"));
                            if (newActive) newActive.classList.add('active');
                            this.updateLayout();
                            this.updateNewChatButtonState();
                        }
                    };
                    this.updateNewChatButtonState = function () {
                        var layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
                        var numAreas = this.chatAreas.size;
                        this.newChatButton.disabled = numAreas >= layout;
                    };
                    this.updateLayout = function () {
                        var layout = parseInt(this.chatAreaContainer.dataset.layout, 10);
                        var allAreas = Array.from(this.chatAreas.values());
                        var pinned = allAreas.filter(function (area) {
                            return area.isPinned();
                        });
                        var unpinned = allAreas.filter(function (area) {
                            return !area.isPinned();
                        });
                        var displayOrder = [].concat(_toConsumableArray(pinned), _toConsumableArray(unpinned));
                        allAreas.forEach(function (area) {
                            if (area.container) {
                                area.container.style.display = 'none';
                            }
                        });
                        for (var i = 0; i < Math.min(layout, displayOrder.length); i++) {
                            if (displayOrder[i].container) {
                                displayOrder[i].container.style.display = 'flex';
                            }
                        }
                    };

                    /**
                     * @description Initializes message listeners for communication with page drivers.
                     */
                    this.initMessageListeners = function () {
                        this.message.register(this.receiverId, this);
                    };

                    /**
                     * @description Handles the 'create' message to add a new chat area.
                     * @param {object} data - Message data {id, providerName, url, pinned, params:{webAccess,longThought, models}, conversation:[{type, content}]}.
                     */
                    this.onMsgCreate = function (data) {
                        // 这里要保存 driver相关的一些参数，检查是否初始化，如果没有初始化，则保存为默认参数
                        if (!this.defaultDriverParams) {
                            var _data$params, _data$params2;
                            this.defaultDriverParams = {
                                webAccess: ((_data$params = data.params) === null || _data$params === void 0 ? void 0 : _data$params.webAccess) || false,
                                longThought: ((_data$params2 = data.params) === null || _data$params2 === void 0 ? void 0 : _data$params2.longThought) || false
                            };
                            // 设置参数配置项控件的值
                            this.settingsMenu.querySelector('#web-access').checked = this.defaultDriverParams.webAccess;
                            this.settingsMenu.querySelector('#long-thought').checked = this.defaultDriverParams.longThought;
                        }
                        this.addChatArea(data);
                    };

                    /**
                     * @description Handles the 'answer' message to update a chat area.
                     * @param {object} data - Message data ({ id, content, ... }).
                     */
                    this.onMsgAnswer = function (data) {
                        var chatArea = this.chatAreas.get(data.id);
                        if (chatArea) {
                            chatArea.handleAnswer(data);
                        }
                    };

                    /**
                     * @description Handles the 'destroy' message to remove a chat area.
                     * @param {object} data - Message data ({ id }).
                     */
                    this.onMsgDestroy = function (data) {
                        this.removeChatArea(data.id);
                    };

                    /**
                     * @description Handles the 'titleChange' message to update a chat area's title.
                     * @param {object} data - Message data ({ id, title }).
                     */
                    this.onMsgTitleChange = function (data) {
                        var chatArea = this.chatAreas.get(data.id);
                        if (chatArea) {
                            chatArea.updateTitle(data.title);
                        }
                    };

                    /**
                     * @description Handles the 'optionChange' message to update a chat area's option.
                     * @param {object} data - Message data ({ id, key, value }).
                     */
                    this.onMsgOptionChange = function (data) {
                        var chatArea = this.chatAreas.get(data.id);
                        if (chatArea) {
                            chatArea.updateOption(data.key, data.value);
                        }
                    };

                    /**
                     * @description Handles the 'question' message to add a new question to a chat area.
                     * @param {object} data - Message data ({ id, index, content }).
                     */
                    this.onMsgQuestion = function (data) {
                        var chatArea = this.chatAreas.get(data.id);
                        if (chatArea) {
                            chatArea.addQuestion(data.content);
                        }
                    };

                    /**
                     * @description Handles the 'modelVersionChange' message to update a chat area's model version.
                     * @param {object} data - Message data ({ id, version }).
                     */
                    this.onMsgModelVersionChange = function (data) {
                        var chatArea = this.chatAreas.get(data.id);
                        if (chatArea) {
                            chatArea.updateModelVersion(data.version);
                        }
                    };

                    /**
                     * @description Handles the 'newSession' message to reset a chat area for a new session.
                     * @param {object} data - Message data ({ id }).
                     */
                    this.onMsgNewSession = function (data) {
                        var chatArea = this.chatAreas.get(data.id);
                        if (chatArea) {
                            chatArea.newSession();
                        }
                    };

                    /**
                     * @description Adds a new ChatArea instance.
                     * @param {object} data - 初始化数据，结构为{id, providerName, url, pinned, params:{webAccess,longThought, models, modelVersion}, conversation:[{type, content}]}.
                     */
                    this.addChatArea = function (data) {
                        var _this4 = this,
                            _data$conversations;
                        console.debug("add chatarea with ".concat(JSON.stringify(data)));
                        if (this.chatAreas.has(data.id)) {
                            console.warn("ChatArea with id ".concat(data.id, " already exists."));
                            return;
                        }
                        var container = this.util.toHtml({
                            tag: 'div',
                            '@class': 'chat-area-container'
                        });
                        this.chatAreaContainer.appendChild(container);
                        var chatArea = new ChatArea(this, data.id, data.url, container, this.i18n);
                        chatArea.init(data);
                        this.switchLanguage(this.i18n.getCurrentLang(), chatArea.element, true);
                        chatArea.setEventHandler('onEvtNewSession', this._handleNewSession.bind(this));
                        chatArea.setEventHandler('onEvtShare', this._handleShare.bind(this));
                        chatArea.setEventHandler('onEvtParamChanged', this._handleParamChanged.bind(this));
                        chatArea.setEventHandler('onEvtProviderChanged', function (ca, newProvider, oldProvider) {
                            if (oldProvider && _this4.selectedProviders.get(oldProvider) === ca.id) {
                                _this4.selectedProviders["delete"](oldProvider);
                            }
                            if (newProvider) {
                                _this4.selectedProviders.set(newProvider, ca.id);
                            }
                        });
                        chatArea.setEventHandler('onEvtPromptSend', this._handlePromptSend.bind(this));
                        chatArea.setEventHandler('onEvtExport', this._handleExport.bind(this));
                        this.chatAreas.set(data.id, chatArea);
                        this.updateDefaultLayout();
                        this.updateNewChatButtonState();
                        console.log("Added ChatArea: ".concat(data.id));
                        if (data.providerName && data.providerName !== 'New Chat') {
                            this.selectedProviders.set(data.providerName, data.id);
                        }
                        (_data$conversations = data.conversations) === null || _data$conversations === void 0 || _data$conversations.forEach(function (item) {
                            if (item.type === 'question') {
                                chatArea.addQuestion(item.content);
                            } else if (item.type === 'answer') {
                                chatArea.addAnswer(item.content);
                            }
                        });
                    };
                    this.updateDefaultLayout = function () {
                        var numAreas = this.chatAreas.size;
                        var layout = '1';
                        if (numAreas > 4) {
                            layout = '6';
                        } else if (numAreas > 2) {
                            layout = '4';
                        } else if (numAreas > 1) {
                            layout = '2';
                        }
                        this.setLayout(layout);
                    };

                    /**
                     * @description Removes a ChatArea from the main window.
                     * @param {string} id - The unique identifier of the ChatArea.
                     */
                    this.removeChatArea = function (id) {
                        var chatArea = this.chatAreas.get(id);
                        if (chatArea) {
                            var providerName = chatArea.getProvider();
                            if (providerName && this.selectedProviders.get(providerName) === id) {
                                this.selectedProviders["delete"](providerName);
                            }
                            var wrapper = chatArea.container.parentElement;
                            chatArea.destroy(); // Let chat area clean up itself
                            if (wrapper) {
                                wrapper.remove(); // Controller removes the wrapper it created
                            }
                            this.chatAreas["delete"](id);
                            this.updateDefaultLayout();
                            this.updateNewChatButtonState();
                            console.log("Removed ChatArea: ".concat(id));
                        }
                    };
                    this._handleNewSession = function (chatArea, providerName) {
                        this.message.send(chatArea.id, 'new_session', {
                            providerName: providerName
                        });
                    };
                    this._handleShare = function (chatArea, url) {
                        navigator.clipboard.writeText(url);
                        this.message.send(chatArea.id, 'focus', {});
                    };
                    this._handleParamChanged = function (chatArea, key, newValue, oldValue) {
                        this.message.send(chatArea.id, 'param_changed', {
                            key: key,
                            newValue: newValue,
                            oldValue: oldValue
                        });
                    };
                    this._handleProviderChanged = function (chatArea, newProvider, oldProvider) {
                        var newUrl = this.driverFactory.getProviderUrl(newProvider);
                        this.message.send(chatArea.id, 'change_provider', {
                            url: newUrl
                        });
                        chatArea.url = newUrl;
                    };
                    this._handlePromptSend = function (chatArea, text) {
                        this.message.send(chatArea.id, 'prompt', {
                            text: text
                        });
                    };
                    this._handleExport = function (chatArea) {
                        this.message.send(chatArea.id, 'export', {});
                    };

                    /**
                     * @description 获取当前被其他ChatArea占用的AI提供商列表。
                     * @param {string} requestingChatAreaId - 请求此列表的ChatArea的ID，该ChatArea自己的选择不会被视为不可用。
                     * @returns {string[]} - 不可用的AI提供商名称数组。
                     */
                    this.getUnavailableProviders = function (requestingChatAreaId) {
                        var unavailable = [];
                        this.selectedProviders.forEach(function (chatAreaId, providerName) {
                            if (chatAreaId !== requestingChatAreaId) {
                                unavailable.push(providerName);
                            }
                        });
                        return unavailable;
                    };
                }
                module.exports = MainWindowController;

                /***/
}),

/***/ 385:
/***/ ((module) => {

                var resources = {
                    'en': {
                        'app.title': 'Multi-AI Sync Chat',
                        'button.send': 'Send',
                        'button.send.title': 'Send',
                        'prompt.placeholder': 'Ask all AIs...',
                        'sync_chat_button_label': 'Sync Chat',
                        // New keys for sync-chat-window.html
                        'productName': 'Multi AI Chat',
                        'newChatButtonTitle': 'New Chat',
                        'settingsButtonTitle': 'Settings',
                        'webAccessLabel': 'Web Access',
                        'longThoughtLabel': 'Long Thought',
                        'promptTextareaPlaceholder': 'Ask all AIs...',
                        'globalSendButtonTitle': 'Send',
                        // New keys for chat-area.js
                        'newSessionButtonTitle': 'New Session',
                        'expandAllButtonTitle': 'Expand All',
                        'collapseAllButtonTitle': 'Collapse All',
                        'exportContentButtonTitle': 'Export Content',
                        'parametersButtonTitle': 'Parameters',
                        'modelVersionLabel': 'Model Version',
                        'shareButtonTitle': 'Share',
                        'pinButtonTitle': 'Pin',
                        'closeButtonTitle': 'Close',
                        'inputPlaceholder': 'Input',
                        'typeMessagePlaceholder': 'Type your message...',
                        'sendButtonTitle': 'Send',
                        'selectProviderHint': 'Please select an AI provider from the dropdown above to start chatting.',
                        'providerUnavailable': 'This AI provider is already selected by another chat area.'
                    },
                    'zh': {
                        'app.title': '多AI同步聊天',
                        'button.send': '发送',
                        'button.send.title': '发送',
                        'prompt.placeholder': '向所有AI提问...',
                        'sync_chat_button_label': '同步聊天',
                        // New keys for sync-chat-window.html
                        'productName': '多AI同步聊天',
                        'newChatButtonTitle': '新建聊天',
                        'settingsButtonTitle': '设置',
                        'webAccessLabel': '网页访问',
                        'longThoughtLabel': '长时思考',
                        'promptTextareaPlaceholder': '向所有AI提问...',
                        'globalSendButtonTitle': '发送',
                        // New keys for chat-area.js
                        'newSessionButtonTitle': '新会话',
                        'expandAllButtonTitle': '展开全部',
                        'collapseAllButtonTitle': '折叠全部',
                        'exportContentButtonTitle': '导出内容',
                        'parametersButtonTitle': '参数',
                        'modelVersionLabel': '模型版本',
                        'shareButtonTitle': '分享',
                        'pinButtonTitle': '固定',
                        'closeButtonTitle': '关闭',
                        'inputPlaceholder': '输入',
                        'typeMessagePlaceholder': '输入你的消息...',
                        'sendButtonTitle': '发送',
                        'selectProviderHint': '请从上方下拉菜单中选择一个AI提供商以开始聊天。',
                        'providerUnavailable': '该AI提供商已被其他聊天窗口选中。'
                    },
                    'ar': {
                        'app.title': 'دردشة متزامنة متعددة الذكاء الاصطناعي',
                        'button.send': 'إرسال',
                        'button.send.title': 'إرسال',
                        'prompt.placeholder': 'اسأل كل الذكاء الاصطناعي...',
                        'sync_chat_button_label': 'مزامنة الدردشة',
                        // New keys for sync-chat-window.html
                        'productName': 'دردشة متزامنة متعددة الذكاء الاصطناعي',
                        'newChatButtonTitle': 'محادثة جديدة',
                        'settingsButtonTitle': 'الإعدادات',
                        'webAccessLabel': 'الوصول إلى الويب',
                        'longThoughtLabel': 'تفكير طويل',
                        'promptTextareaPlaceholder': 'اسأل كل الذكاء الاصطناعي...',
                        'globalSendButtonTitle': 'إرسال',
                        // New keys for chat-area.js
                        'newSessionButtonTitle': 'جلسة جديدة',
                        'expandAllButtonTitle': 'توسيع الكل',
                        'collapseAllButtonTitle': 'طي الكل',
                        'exportContentButtonTitle': 'تصدير المحتوى',
                        'parametersButtonTitle': 'المعلمات',
                        'modelVersionLabel': 'إصدار النموذج',
                        'shareButtonTitle': 'مشاركة',
                        'pinButtonTitle': 'تثبيت',
                        'closeButtonTitle': 'إغلاق',
                        'inputPlaceholder': 'إدخال',
                        'typeMessagePlaceholder': 'اكتب رسالتك...',
                        'sendButtonTitle': 'إرسال',
                        'selectProviderHint': 'الرجاء تحديد مزود الذكاء الاصطناعي من القائمة المنسدلة أعلاه لبدء الدردشة.',
                        'providerUnavailable': 'لقد تم اختيار مزود الذكاء الاصطناعي هذا بواسطة منطقة دردشة أخرى.'
                    }
                };
                module.exports = resources;

                /***/
}),

/***/ 540:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                var _require = __webpack_require__(981),
                    KimiPageDriver = _require.KimiPageDriver,
                    GeminiPageDriver = _require.GeminiPageDriver,
                    ChatGPTPageDriver = _require.ChatGPTPageDriver,
                    GenericPageDriver = _require.GenericPageDriver;
                function DriverFactory() {
                    var urlMap = {
                        'kimi.ai': {
                            name: 'Kimi',
                            url: 'https://www.kimi.com'
                        },
                        'www.kimi.com': {
                            name: 'Kimi',
                            url: 'https://www.kimi.com'
                        },
                        'gemini.google.com': {
                            name: 'Gemini',
                            url: 'https://gemini.google.com/app'
                        },
                        'chat.openai.com': {
                            name: 'ChatGPT',
                            url: 'https://chat.openai.com'
                        }
                    };
                    var driverMap = {
                        'Kimi': KimiPageDriver,
                        'Gemini': GeminiPageDriver,
                        'ChatGPT': ChatGPTPageDriver
                    };

                    /**
                     * 获取所有支持的AI提供商名称列表。
                     * @returns {Array<string>} 支持的AI提供商列表
                     */
                    this.getProviders = function () {
                        return Object.keys(driverMap);
                    };

                    /**
                     * 获取指定AI提供商对应的网址。
                     * @param {string} providerName AI提供商名字
                     * @returns {string} 对应的网址
                     */
                    this.getProviderUrl = function (providerName) {
                        var _Object$values$find;
                        return ((_Object$values$find = Object.values(urlMap).find(function (v) {
                            return v.name === providerName;
                        })) === null || _Object$values$find === void 0 ? void 0 : _Object$values$find.url) || '';
                    };

                    /**
                     * 创建对应域名的驱动实例。
                     * @param {string} hostname 域名
                     * @returns {GenericPageDriver} 驱动实例
                     */
                    this.createDriver = function (hostname) {
                        var nameUrl = urlMap[hostname];
                        if (nameUrl) {
                            var Driver = driverMap[nameUrl.name];
                            if (Driver) {
                                return new Driver();
                            }
                        }
                        console.warn("No specific driver found for ".concat(hostname, ". Using GenericPageDriver."));
                        return new GenericPageDriver();
                    };
                }
                module.exports = DriverFactory;

                /***/
}),

/***/ 677:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                var Config = __webpack_require__(27);

                /**
                 * @description 管理国际化文本资源。
                 * @param {Config} config - Config 实例.
                 * @param {object} langs - 语言资源.
                 */
                function I18n(config, langs) {
                    if (!config) {
                        throw new Error('Config instance must be provided to I18n.');
                    }
                    this.config = config;
                    this.resources = langs || {};
                    this.currentLang = 'en'; // 默认语言

                    /**
                     * @description 初始化，确定当前语言。
                     */
                    this.init = function () {
                        var configLang = this.config.get('current-lang');
                        var browserLang = this.getBrowserLang();
                        this.currentLang = configLang || browserLang || 'en';
                    };

                    /**
                     * @description 根据键获取当前语言的文本。
                     * @param {string} key - 文本的键。
                     * @returns {string} - 对应的文本。
                     */
                    this.getText = function (key) {
                        var lang = this.currentLang;

                        // 尝试完整语言代码, e.g., 'zh-CN'
                        if (this.resources[lang] && this.resources[lang][key] !== undefined) {
                            return this.resources[lang][key];
                        }

                        // 尝试基础语言代码, e.g., 'zh'
                        var baseLang = lang.split('-')[0];
                        if (this.resources[baseLang] && this.resources[baseLang][key] !== undefined) {
                            return this.resources[baseLang][key];
                        }

                        // 尝试默认语言 'en'
                        if (this.resources['en'] && this.resources['en'][key] !== undefined) {
                            return this.resources['en'][key];
                        }

                        // 如果都找不到，返回 key 本身
                        return key;
                    };

                    /**
                     * @description 获取当前正在使用的语言代码。
                     * @returns {string}
                     */
                    this.getCurrentLang = function () {
                        return this.currentLang;
                    };

                    /**
                     * @description 设置当前语言。
                     * @param {string} lang - 语言代码 (e.g., 'en')。
                     */
                    this.setCurrentLang = function (lang) {
                        this.currentLang = lang;
                        this.config.set('current-lang', lang);
                    };

                    /**
                     * @description 获取浏览器的语言设置。
                     * @returns {string|null}
                     */
                    this.getBrowserLang = function () {
                        return navigator.language || navigator.userLanguage || null;
                    };

                    /**
                     * @description Gets the list of all supported languages.
                     * @returns {string[]} - An array of language codes.
                     */
                    this.getAllLangs = function () {
                        return Object.keys(this.resources);
                    };

                    // 初始化
                    this.init();
                }
                module.exports = I18n;

                /***/
}),

/***/ 825:
/***/ ((module) => {

                var _excluded = ["tag", "text", "innerHTML", "children", "child"];
                function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() { } function GeneratorFunction() { } function GeneratorFunctionPrototype() { } t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
                function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n; else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
                function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
                function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
                function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
                function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
                function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
                function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
                function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
                function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
                function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
                function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
                function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
                // 根据项目规范，使用 function 定义构造函数来模拟类，并导出
                function Util() {
                    /**
                     * @description 在文档加载完成之后延迟运行。
                     * @param {function} fn - 回调函数
                     * @param {int} delay - 延迟的毫秒，默认5秒
                     * @returns {HTMLElement} - 创建的 HTML 元素。
                     */
                    this.documentReady = function (fn) {
                        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
                        // 确保页面加载完成后再执行初始化
                        if (document.readyState === 'complete') {
                            setTimeout(fn, delay);
                        } else {
                            window.addEventListener('load', function () {
                                // 延迟5秒后执行初始化
                                setTimeout(fn, delay);
                            });
                        }
                    };

                    /**
                     * @description 根据 JSON 对象创建 HTML 元素。
                     * @param {object} json - 描述 HTML 结构的 JSON 对象。
                     * @returns {HTMLElement} - 创建的 HTML 元素。
                     */
                    this.toHtml = function toHtml(json) {
                        if (typeof json === 'string') {
                            return document.createTextNode(json);
                        }
                        var tag = json.tag,
                            text = json.text,
                            innerHTML = json.innerHTML,
                            children = json.children,
                            child = json.child,
                            attrs = _objectWithoutProperties(json, _excluded);

                        // 处理简写形式, e.g., { div: 'hello', '@id': 'my-div' }
                        if (!tag) {
                            var firstKey = Object.keys(json)[0];
                            if (firstKey && !['@', 'on', 'text', 'innerHTML', 'children', 'child'].some(function (prefix) {
                                return firstKey.startsWith(prefix);
                            })) {
                                tag = firstKey;
                                text = json[tag];
                                delete attrs[tag];
                                if (children || child) {
                                    throw new Error('Shorthand tag format cannot have children.');
                                }
                            }
                        }
                        if (!tag) {
                            throw new Error('JSON object must have a "tag" property or a shorthand tag.');
                        }
                        var element = document.createElement(tag);
                        if (innerHTML) {
                            element.innerHTML = innerHTML;
                        } else if (text) {
                            if (tag.toLowerCase() === 'script' && typeof text === 'function') {
                                element.textContent = text.toString();
                            } else {
                                element.textContent = text;
                            }
                        }
                        for (var key in attrs) {
                            if (key.startsWith('@')) {
                                var attrName = key.substring(1);
                                var attrValue = attrs[key];
                                if (_typeof(attrValue) === 'object' && attrValue !== null) {
                                    attrValue = Object.entries(attrValue).map(function (_ref) {
                                        var _ref2 = _slicedToArray(_ref, 2),
                                            k = _ref2[0],
                                            v = _ref2[1];
                                        return "".concat(k, ":").concat(v);
                                    }).join(';');
                                }
                                element.setAttribute(attrName, attrValue);
                            } else if (key.startsWith('on')) {
                                var eventName = key.toLowerCase();
                                var eventFunc = attrs[key];
                                if (typeof eventFunc === 'function') {
                                    eventFunc = "(".concat(eventFunc.toString(), ")()");
                                }
                                element.setAttribute(eventName, eventFunc);
                            }
                        }
                        var childNodes = children || child;
                        if (childNodes) {
                            if (Array.isArray(childNodes)) {
                                childNodes.forEach(function (childJson) {
                                    element.appendChild(toHtml(childJson));
                                });
                            } else {
                                element.appendChild(toHtml(childNodes));
                            }
                        }
                        return element;
                    };

                    /**
                     * @description 查询并返回匹配选择器的第一个 DOM 元素。
                     * @param {string} selector - CSS 选择器。
                     * @param {HTMLElement|Document} [parent=document] - 查询的父节点。
                     * @returns {HTMLElement|null}
                     */
                    this.$ = function (selector) {
                        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
                        if (selector == null || selector === '') {
                            return null;
                        }
                        return parent.querySelector(selector);
                    };

                    /**
                     * @description 查询并返回匹配选择器的所有 DOM 元素组成的 NodeList。
                     * @param {string} selector - CSS 选择器。
                     * @param {HTMLElement|Document} [parent=document] - 查询的父节点。
                     * @returns {NodeListOf<HTMLElement>}
                     */
                    this.$ = function (selector) {
                        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
                        if (selector == null || selector === '') {
                            return [];
                        }
                        return parent.querySelectorAll(selector);
                    };

                    /**
                     * @description 模拟点击元素，然后在两次点击之间调用某个函数回调
                     * @param {function} callback - a function to get the content
                     * @returns {Promise<any>} - the content
                     */
                    this.clickAndGet = /*#__PURE__*/function () {
                        var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(clickElement, callback) {
                            var result;
                            return _regenerator().w(function (_context) {
                                while (1) switch (_context.n) {
                                    case 0:
                                        clickElement.click();
                                        _context.n = 1;
                                        return new Promise(function (resolve) {
                                            return setTimeout(resolve, 200);
                                        });
                                    case 1:
                                        result = callback();
                                        clickElement.click();
                                        return _context.a(2, result);
                                }
                            }, _callee);
                        }));
                        return function (_x, _x2) {
                            return _ref3.apply(this, arguments);
                        };
                    }();

                    /**
                     * @description 获取HTML元素的内容或值，根据元素类型返回正确的数据类型。
                     * @param {HTMLElement} element - 要获取内容的HTML元素。
                     * @returns {*} - 元素的内容或值，类型根据元素类型而定（例如，checkbox返回boolean，input返回string）。
                     */
                    this.getText = function (element) {
                        if (!element) {
                            return undefined;
                        }
                        var tagName = element.tagName.toLowerCase();
                        var type = element.type ? element.type.toLowerCase() : '';
                        if (tagName === 'input') {
                            if (type === 'checkbox' || type === 'radio') {
                                return element.checked;
                            }
                            return element.value;
                        } else if (tagName === 'textarea' || tagName === 'select') {
                            return element.value;
                        } else {
                            // For other elements like div, span, p, etc.
                            return element.textContent;
                        }
                    };

                    /**
                     * @description 设置HTML元素的内容或值，根据元素类型接受正确的数据类型。
                     * @param {HTMLElement} element - 要设置内容的HTML元素。
                     * @param {*} value - 要设置的值，类型根据元素类型而定（例如，checkbox接受boolean，input接受string）。
                     */
                    this.setText = function (element, value) {
                        if (!element) {
                            return;
                        }
                        var tagName = element.tagName.toLowerCase();
                        var type = element.type ? element.type.toLowerCase() : '';
                        if (tagName === 'input') {
                            if (type === 'checkbox' || type === 'radio') {
                                element.checked = !!value; // Ensure boolean
                            } else {
                                element.value = String(value); // Ensure string
                            }
                        } else if (tagName === 'textarea' || tagName === 'select') {
                            element.value = String(value); // Ensure string
                        } else {
                            // For other elements like div, span, p, etc.
                            element.textContent = String(value); // Ensure string
                        }
                    };

                    /**
                     * @description 获取HTML元素的布尔值状态，主要用于checkbox或具有布尔语义的元素。
                     * @param {HTMLElement} element - 要获取布尔值的HTML元素。
                     * @returns {boolean|undefined} - 元素的布尔值状态，如果元素没有明确的布尔状态则返回undefined。
                     */
                    this.getBoolean = function (element) {
                        if (!element) {
                            return undefined;
                        }
                        var tagName = element.tagName.toLowerCase();
                        var type = element.type ? element.type.toLowerCase() : '';
                        if (tagName === 'input' && (type === 'checkbox' || type === 'radio')) {
                            return element.checked;
                        }
                        // For other elements, if they have a 'data-checked' or similar attribute,
                        // or if their text content can be parsed as boolean,
                        // this can be extended. For now, focus on standard boolean inputs.
                        return undefined;
                    };

                    /**
                     * 获取函数对象的名称
                     * @param {Function} func 对象
                     * @returns {string|null} 函数名称，若无法获取则返回 null
                     */
                    this.getFunctionName = function (func) {
                        if (typeof func !== 'function') {
                            return null;
                        }
                        return func.name || func.toString().match(/function ([^\(]+)/)[1];
                    };

                    /**
                     * 将特殊字符转换为 HTML 实体，防止 XSS 攻击
                     * @param {string} unsafe 呆html的字符串
                     * @returns 
                     */
                    this.escapeHtml = function (unsafe) {
                        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                    };

                    /**
                     * 将 JSON 对象转换为安全的字符串，防止 XSS 攻击
                     * @param {*} jsonObj json对象
                     * @returns {string} 安全的字符串，使用JSON.parse可以还原
                     */
                    this.safeJsonString = function (jsonObj) {
                        return JSON.stringify(jsonObj).replace(/</g, "\\u003c") // 转义 <
                            .replace(/>/g, "\\u003e") // 转义 >
                            .replace(/&/g, "\\u0026") // 转义 &
                            .replace(/'/g, "\\u0027"); // 转义单引号
                    };

                    /**
                     * 返回依赖库的源代码
                     * @returns 返回依赖库的源代码
                     */
                    this.safeString = function (str) {
                        return str.replace(/\\/g, '\\\\') // 先转义反斜杠
                            .replace(/'/g, "\\'") // 转义单引号
                            .replace(/`/g, "'") // 将反引号替换为单引号
                            .replace(/\n/g, '\\n') // 转义换行符
                            .replace(/\r/g, '\\r') // 转义回车符
                            .replace(/\t/g, '\\t'); // 转义制表符
                        // removed by dead control flow
                        { }
                    };
                }
                module.exports = Util;

                /***/
}),

/***/ 866:
/***/ ((module) => {

                /**
                 * @description 封装 BroadcastChannel 实现跨窗口通信。
                 * @param {string} channelName - 通信频道的名称。
                 */
                function Message(channelName) {
                    if (!channelName) {
                        throw new Error('channelName is required for Message module.');
                    }
                    this.channel = new BroadcastChannel(channelName);
                    this.listeners = new Map(); // Map<receiverId, Map<type, Set<function>>>

                    /**
                     * @description 处理来自 BroadcastChannel 的消息。
                     * @param {MessageEvent} event - 消息事件。
                     */
                    this.handleMessage = function (event) {
                        console.debug("receive message ".concat(JSON.stringify(event)));
                        var _event$data = event.data,
                            type = _event$data.type,
                            data = _event$data.data;
                        if (!type) return;
                        var targetReceiverId = data ? data.receiverId : undefined;

                        // If a specific receiverId is targeted
                        if (targetReceiverId) {
                            var receiverListeners = this.listeners.get(targetReceiverId);
                            if (receiverListeners) {
                                var typeListeners = receiverListeners.get(type);
                                if (typeListeners) {
                                    typeListeners.forEach(function (listenerFunction) {
                                        try {
                                            listenerFunction(data);
                                        } catch (e) {
                                            console.error("Error in message handler for type '".concat(type, "' and receiverId '").concat(targetReceiverId, "':"), e);
                                        }
                                    });
                                }
                            }
                        } else {
                            // Broadcast message to all relevant listeners
                            this.listeners.forEach(function (receiverListeners) {
                                var typeListeners = receiverListeners.get(type);
                                if (typeListeners) {
                                    typeListeners.forEach(function (listenerFunction) {
                                        try {
                                            listenerFunction(data);
                                        } catch (e) {
                                            console.error("Error in broadcast message handler for type '".concat(type, "':"), e);
                                        }
                                    });
                                }
                            });
                        }
                    };

                    // 绑定 handleMessage 的 this 上下文
                    this.handleMessage = this.handleMessage.bind(this);
                    this.channel.addEventListener('message', this.handleMessage);

                    /**
                     * @description 广播消息。
                     * @param {string} type - 消息类型 (e.g., 'chat', 'create')。
                     * @param {object} data - 附带的数据。
                     */
                    this.send = function (type, data) {
                        try {
                            console.debug("send type = ".concat(type, ", data = ").concat(JSON.stringify(data)));
                            this.channel.postMessage({
                                type: type,
                                data: data
                            });
                        } catch (e) {
                            console.error("Error posting message: ".concat(e));
                        }
                    };

                    /**
                     * @description 注册一个监听器对象。
                     * @param {string} receiverId - 对象的接收id。
                     * @param {object} listener - 包含 onMsg* 方法的对象。
                     */
                    this.register = function (receiverId, listener) {
                        if (!receiverId || !listener) {
                            console.warn('Message.register: receiverId and listener are required.');
                            return;
                        }
                        if (!this.listeners.has(receiverId)) {
                            this.listeners.set(receiverId, new Map()); // Map<type, Set<function>>
                        }
                        var receiverListeners = this.listeners.get(receiverId);
                        for (var methodName in listener) {
                            if (typeof listener[methodName] === 'function' && methodName.startsWith('onMsg')) {
                                var type = methodName.substring(5).charAt(0).toLowerCase() + methodName.substring(6);
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
                    this.unregister = function (receiverId) {
                        if (receiverId) {
                            this.listeners["delete"](receiverId);
                        }
                    };

                    /**
                     * @description 关闭并清理通信频道。
                     */
                    this.close = function () {
                        this.channel.removeEventListener('message', this.handleMessage);
                        this.channel.close();
                        this.listeners.clear();
                    };
                }
                module.exports = Message;

                /***/
}),

/***/ 892:
/***/ ((module) => {

                /**
                 * @description 封装 localStorage 提供持久化存储。
                 * @param {string} prefix - 存入 localStorage 的 key 的前缀。
                 */
                function Storage() {
                    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'multi-ai-chat-';
                    var PREFIX = prefix;

                    /**
                     * @description 将键值对存入 localStorage。
                     * @param {string} key - 键名。
                     * @param {*} value - 要存储的值。
                     */
                    this.set = function (key, value) {
                        var fullKey = PREFIX + key;
                        try {
                            var serializedValue = JSON.stringify(value);
                            localStorage.setItem(fullKey, serializedValue);
                        } catch (e) {
                            console.error("Error saving to localStorage: ".concat(e));
                        }
                    };

                    /**
                     * @description 从 localStorage 读取键对应的值。
                     * @param {string} key - 键名。
                     * @param {*} [defaultValue=null] - 如果未找到，返回的默认值。
                     * @returns {*} - 存储的值或默认值。
                     */
                    this.get = function (key) {
                        var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                        var fullKey = PREFIX + key;
                        try {
                            var serializedValue = localStorage.getItem(fullKey);
                            if (serializedValue === null) {
                                return defaultValue;
                            }
                            return JSON.parse(serializedValue);
                        } catch (e) {
                            console.error("Error reading from localStorage: ".concat(e));
                            return defaultValue;
                        }
                    };

                    /**
                     * @description 从 localStorage 中移除一个键。
                     * @param {string} key - 键名。
                     */
                    this.remove = function (key) {
                        var fullKey = PREFIX + key;
                        try {
                            localStorage.removeItem(fullKey);
                        } catch (e) {
                            console.error("Error removing from localStorage: ".concat(e));
                        }
                    };
                }
                module.exports = Storage;

                /***/
}),

/***/ 981:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() { } function GeneratorFunction() { } function GeneratorFunctionPrototype() { } t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
                function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n; else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
                function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
                function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
                var Util = __webpack_require__(825);

                /**
                 * @description 页面驱动的抽象基类。
                 * @property {object} selectors - 包含所有CSS选择器的对象。
                 * @property {function} onAnswer - 回调函数，当新答案出现时调用。
                 * @property {function} onChatTitle - 回调函数，当会话标题更改时调用。
                 * @property {function} onOption - 回调函数，当选项更改时调用。
                 */
                function GenericPageDriver() {
                    this.util = new Util();
                    this.selectors = {
                        promptInput: 'textarea',
                        sendButton: 'button[type="submit"]',
                        questions: '.question',
                        answers: '.answer',
                        conversationArea: '#conversation',
                        chatTitle: 'h1',
                        historyItems: '.history-item',
                        answerCollapsedClass: 'collapsed',
                        newSessionButton: 'button.new-session',
                        webAccessOption: 'input#web-access',
                        longThoughtOption: 'input#long-thought',
                        modelVersionList: 'select.model-version',
                        currentModelVersion: 'span.current-model'
                    }; // 应由具体驱动覆盖
                    this.onAnswer = function (index, element) { };
                    this.onChatTitle = function (title) { };
                    this.onOption = function (key, value) { };
                    this.onQuestion = function (index, element) { };
                    this.onModelVersionChange = function (version) { };
                    this.onNewSession = function () { };
                    this.className = this.util.getFunctionName(this);
                    this.observer = null;
                    this.currentModelVersionObserver = null;
                    this.optionObservers = [];
                    this.newSessionButtonListener = null;
                    this.providerName = null;

                    /**
                     * @description 异步初始化方法，可用于预加载或缓存元素。
                     */
                    this.init = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
                        return _regenerator().w(function (_context) {
                            while (1) switch (_context.n) {
                                case 0:
                                    return _context.a(2);
                            }
                        }, _callee);
                    }));

                    /**
                     * 返回当前驱动的提供商代号
                     */
                    this.getProviderName = function () {
                        return this.providerName;
                    },
                        // --- DOM Element Accessors ---

                        /**
                         * 获取提示输入框对应的元素。
                         * @returns {HTMLElement|null}  提示输入框元素。
                         */
                        this.elementPromptInput = function () {
                            return this.util.$(this.selectors.promptInput);
                        };

                    /**
                     * 获取发送按钮对应的元素。
                     * @returns {HTMLElement|null} 发送按钮元素。
                     */
                    this.elementSendButton = function () {
                        return this.util.$(this.selectors.sendButton);
                    };

                    /**
                     * 获取对话区域对应的元素
                     * @returns {HTMLElement|null} 对话区域元素。
                     */
                    this.elementConversationArea = function () {
                        return this.util.$(this.selectors.conversationArea);
                    };

                    /**
                     * 获取历史记录区域对应的元素
                     * @returns {HTMLElement|null} 历史记录区域元素。
                     */
                    this.elementHistoryArea = function () {
                        return this.util.$(this.selectors.historyArea);
                    };

                    /**
                     * 获取所用户所问问题元素列表。 
                     * @returns {NodeListOf<HTMLElement>} 用户问题元素列表。
                     */
                    this.elementQuestions = function () {
                        return this.util.$(this.selectors.questions);
                    };

                    /**
                     * 获取回答元素列表。
                     * @returns {NodeListOf<HTMLElement>} 回答元素列表。
                     */
                    this.elementAnswers = function () {
                        return this.util.$(this.selectors.answers);
                    };

                    /**
                     * 获取历史记录项元素列表。
                     * @returns {NodeListOf<HTMLElement>} 历史记录项元素列表。
                     */
                    this.elementHistoryItems = function () {
                        return this.util.$(this.selectors.historyItems);
                    };

                    /**
                     * 获取指定索引的问题元素。
                     * @param {Int} index - 问题的索引下标
                     * @returns 问题元素
                     */
                    this.elementQuestion = function (index) {
                        return this.elementQuestions()[index] || null;
                    };

                    /**
                     * 获取指定索引的回答元素。
                     * @param {Int} index - 回答的索引下标 
                     * @returns 回答元素
                     */
                    this.elementAnswer = function (index) {
                        return this.elementAnswers()[index] || null;
                    };

                    /**
                     * 获取会话标题元素。
                     * @returns {HTMLElement|null} 会话标题元素。
                     */
                    this.elementChatTitle = function () {
                        return this.util.$(this.selectors.chatTitle);
                    };

                    /**
                     * 获取指定索引的历史记录项元素。
                     * @param {Int} index - 历史记录项的索引下标 
                     * @returns 历史记录项元素
                     */
                    this.elementHistoryItem = function (index) {
                        return this.elementHistoryItems()[index] || null;
                    };

                    /**
                     * 获取新会话按钮元素。
                     * @returns {HTMLElement|null} 新会话按钮元素。
                     */
                    this.elementNewSessionButton = function () {
                        return this.util.$(this.selectors.newSessionButton);
                    };

                    /**
                     * 获取网页访问选项元素。
                     * @returns {HTMLElement|null} 网页访问选项元素。
                     */
                    this.elementWebAccessOption = function () {
                        return this.util.$(this.selectors.webAccessOption);
                    };

                    /**
                     * 获取长思选项元素。
                     * @returns {HTMLElement|null} 长思选项元素。
                     */
                    this.elementLongThoughtOption = function () {
                        return this.util.$(this.selectors.longThoughtOption);
                    };

                    /**
                     * 获取模型版本列表元素。
                     * @returns {HTMLElement|null} 模型版本列表元素。
                     */
                    this.elementModelVersionList = function () {
                        return this.util.$(this.selectors.modelVersionList);
                    };

                    /**
                     * 获取当前模型版本元素。
                     * @returns {HTMLElement|null} 当前模型版本元素。
                     */
                    this.elementCurrentModelVersion = function () {
                        return this.util.$(this.selectors.currentModelVersion);
                    };

                    // --- DOM Data Getters ---

                    /**
                     * 获取提示词输入框中的文字
                     * @returns {string} 提示输入框元素。
                     */
                    this.getPromptInput = function () {
                        return this.util.getText(this.elementPromptInput());
                    };

                    /**
                     * 获取会话轮数
                     * @returns {number} 会话轮数
                     */
                    this.getConversationCount = function () {
                        return this.elementQuestions().length;
                    };

                    /**
                     * 获取历史记录数量
                     * @returns {number} 历史记录数量
                     */
                    this.getHistoryCount = function () {
                        return this.elementHistoryItems().length;
                    };

                    /**
                     * 获取指定索引的历史记录项数据
                     * @param {number} index - 历史记录索引
                     * @returns 历史纪录项数据
                     */
                    this.getHistory = function (index) {
                        var el = this.elementHistoryItem(index);
                        if (!el) return null;
                        return {
                            title: el.textContent.trim(),
                            url: el.href
                        };
                    };

                    /**
                     * 获取指定索引的问题内容
                     * @param {number} index - 问题索引
                     * @returns 问题内容
                     */
                    this.getQuestion = function (index) {
                        var el = this.elementQuestion(index);
                        return el ? el.textContent.trim() : '';
                    };

                    /**
                     * 获取指定索引的回答内容
                     * @param {number} index - 回答索引
                     * @returns 回答内容
                     */
                    this.getAnswer = function (index) {
                        var el = this.elementAnswer(index);
                        return el ? el.textContent.trim() : '';
                    };

                    /**
                     * 获取当前的所有对话内容
                     * @returns 对话内容数组[{type, content}]
                     */
                    this.getConversations = function () {
                        var conversations = [];
                        var count = this.getConversationCount();
                        for (var i = 0; i < count; ++i) {
                            conversations.push({
                                content: this.getQuestion(i),
                                type: 'question'
                            });
                            conversations.push({
                                type: 'answer',
                                content: this.getAnswer(i)
                            });
                        }
                        return conversations;
                    },
                        /**
                         * 获取网页访问选项状态
                         * @returns {boolean|null} 网页访问选项状态
                         */
                        this.getWebAccessOption = function () {
                            var el = this.elementWebAccessOption();
                            return this.util.getBoolean(el);
                        };

                    /**
                     * 获取长思考选项值
                     * @returns {boolean|null} 长思选项状态
                     */
                    this.getLongThoughtOption = function () {
                        var el = this.elementLongThoughtOption();
                        return this.util.getBoolean(el);
                    };

                    /**
                     * 获取模型版本列表
                     * @returns {Array<string>} 模型版本列表
                     */
                    this.getModelVersionList = function () {
                        return Array.from(this.elementModelVersionList(), function (node) {
                            return node.textContent;
                        });
                    };

                    /**
                     * 获取当前模型版本
                     * @returns {string} 当前模型版本
                     */
                    this.getCurrentModelVersion = function () {
                        return this.util.getText(this.elementCurrentModelVersion());
                    };

                    /**
                     * 获取会话标题
                     * @returns {string} 会话标题
                     */
                    this.getChatTitle = function () {
                        var el = this.elementChatTitle();
                        return this.util.getText(el, '');
                    };

                    /**
                     * 获取所有选项的键值对
                     * @returns {object} 选项键值对
                     */
                    this.getOptions = function () {
                        // 此方法需要具体驱动实现复杂的逻辑
                        return {
                            webAccess: this.getWebAccessOption(),
                            longThought: this.getLongThoughtOption()
                        };
                    };
                    this.getAnswerStatus = function (index) {
                        // 假设折叠状态由一个特定的 class 或 attribute 表示
                        var answer = this.elementAnswer(index);
                        return answer ? answer.classList.contains(this.selectors.answerCollapsedClass) : false;
                    };

                    // --- DOM 操作方法 ---

                    /**
                     * 填充消息到提示词输入框
                     * @param {string} message 要发送的消息
                     */
                    this.setPrompt = function (message) {
                        var input = this.util.$(this.selectors.promptInput);
                        if (input) {
                            input.value = message;
                            // 触发输入事件，以防页面有自己的监听器
                            input.dispatchEvent(new Event('input', {
                                bubbles: true
                            }));
                        } else {
                            console.error('Prompt input not found');
                        }
                    };

                    /**
                     * 发送当前提示词输入框的内容
                     */
                    this.send = function () {
                        if (this.selectors.sendButton !== '') {
                            var button = this.util.$(this.selectors.sendButton);
                            if (button) {
                                button.click();
                            } else {
                                console.error('Send button not found');
                            }
                        } else {
                            // 直接在prompt输入框按下Enter键发送
                            var input = this.elementPromptInput();
                            if (input) {
                                var enterEvent = new KeyboardEvent('keydown', {
                                    bubbles: true,
                                    cancelable: true,
                                    key: 'Enter',
                                    code: 'Enter',
                                    keyCode: 13
                                });
                                input.dispatchEvent(enterEvent);
                            } else {
                                console.error('Prompt input not found for Enter key simulation.');
                            }
                        }
                    };
                    this.addAttachment = function (file) {
                        console.warn('addAttachment() is not implemented. This may be restricted by browser security.');
                    };
                    this.setOption = function (key, value) {
                        console.warn('setOption() is not implemented in the generic driver.');
                    };
                    this.setAnswerStatus = function (index, collapsed) {
                        var answer = this.elementAnswer(index);
                        if (!answer || !this.selectors.answerCollapsedClass) return;
                        if (collapsed) {
                            answer.classList.add(this.selectors.answerCollapsedClass);
                        } else {
                            answer.classList.remove(this.selectors.answerCollapsedClass);
                        }
                    };
                    this.setModelVersion = function (version) {
                        console.warn("setModelVersion() is not implemented in the generic driver. Attempted to set version: ".concat(version));
                    };
                    this.newSession = function () {
                        console.warn('newSession() is not implemented in the generic driver.');
                    };

                    // --- 事件监控 ---

                    this.startMonitoring = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
                        var _this = this;
                        var lastQuestionCount, lastAnswerCount, lastChatTitle, lastModelVersion, lastWebAccessOption, lastLongThoughtOption, conversationArea, currentModelVersionElement, webAccessElement, webAccessObserver, longThoughtElement, longThoughtObserver, newSessionButton;
                        return _regenerator().w(function (_context2) {
                            while (1) switch (_context2.n) {
                                case 0:
                                    lastQuestionCount = this.getConversationCount();
                                    lastAnswerCount = this.elementAnswers().length;
                                    lastChatTitle = this.getChatTitle();
                                    lastModelVersion = this.getCurrentModelVersion();
                                    lastWebAccessOption = this.getWebAccessOption();
                                    lastLongThoughtOption = this.getLongThoughtOption();
                                    this.observer = new MutationObserver(function (mutations) {
                                        mutations.forEach(function (mutation) {
                                            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                                                // Monitor for new questions
                                                var currentQuestionCount = _this.getConversationCount();
                                                if (currentQuestionCount > lastQuestionCount) {
                                                    var newQuestionIndex = currentQuestionCount - 1;
                                                    var newQuestionElement = _this.elementQuestion(newQuestionIndex);
                                                    if (newQuestionElement) {
                                                        _this.onQuestion(newQuestionIndex, newQuestionElement);
                                                    }
                                                    lastQuestionCount = currentQuestionCount;
                                                }

                                                // Monitor for new answers
                                                var currentAnswerCount = _this.elementAnswers().length;
                                                if (currentAnswerCount > lastAnswerCount) {
                                                    mutation.addedNodes.forEach(function (node) {
                                                        if (node.nodeType === 1 && node.matches(_this.selectors.answers)) {
                                                            var allAnswers = Array.from(_this.util.$(_this.selectors.answers));
                                                            var newAnswerIndex = allAnswers.indexOf(node);
                                                            _this.onAnswer(newAnswerIndex, node);
                                                        }
                                                    });
                                                    lastAnswerCount = currentAnswerCount;
                                                }
                                            }

                                            // Monitor for chat title changes
                                            var currentChatTitle = _this.getChatTitle();
                                            if (currentChatTitle !== lastChatTitle) {
                                                _this.onChatTitle(currentChatTitle);
                                                lastChatTitle = currentChatTitle;
                                            }
                                        });
                                    });
                                    conversationArea = this.util.$(this.selectors.conversationArea);
                                    if (conversationArea) {
                                        this.observer.observe(conversationArea, {
                                            childList: true,
                                            subtree: true,
                                            attributes: true,
                                            characterData: true
                                        });
                                    } else {
                                        console.error('Conversation area not found for monitoring.');
                                    }

                                    // Monitor for model version changes
                                    currentModelVersionElement = this.elementCurrentModelVersion();
                                    if (currentModelVersionElement) {
                                        this.currentModelVersionObserver = new MutationObserver(function () {
                                            var newModelVersion = _this.getCurrentModelVersion();
                                            if (newModelVersion !== lastModelVersion) {
                                                _this.onModelVersionChange(newModelVersion);
                                                lastModelVersion = newModelVersion;
                                            }
                                        });
                                        this.currentModelVersionObserver.observe(currentModelVersionElement, {
                                            childList: true,
                                            subtree: true,
                                            characterData: true
                                        });
                                    }

                                    // Monitor for option changes (web access, long thought)
                                    webAccessElement = this.elementWebAccessOption();
                                    if (webAccessElement) {
                                        webAccessObserver = new MutationObserver(function () {
                                            var newWebAccessOption = _this.getWebAccessOption();
                                            if (newWebAccessOption !== lastWebAccessOption) {
                                                _this.onOption('webAccess', newWebAccessOption);
                                                lastWebAccessOption = newWebAccessOption;
                                            }
                                        });
                                        webAccessObserver.observe(webAccessElement, {
                                            attributes: true,
                                            attributeFilter: ['checked']
                                        });
                                        this.optionObservers.push(webAccessObserver);
                                    }
                                    longThoughtElement = this.elementLongThoughtOption();
                                    if (longThoughtElement) {
                                        longThoughtObserver = new MutationObserver(function () {
                                            var newLongThoughtOption = _this.getLongThoughtOption();
                                            if (newLongThoughtOption !== lastLongThoughtOption) {
                                                _this.onOption('longThought', newLongThoughtOption);
                                                lastLongThoughtOption = newLongThoughtOption;
                                            }
                                        });
                                        longThoughtObserver.observe(longThoughtElement, {
                                            attributes: true,
                                            attributeFilter: ['checked']
                                        });
                                        this.optionObservers.push(longThoughtObserver);
                                    }

                                    // Monitor for new session button clicks
                                    newSessionButton = this.elementNewSessionButton();
                                    if (newSessionButton) {
                                        this.newSessionButtonListener = function () {
                                            return _this.onNewSession();
                                        };
                                        newSessionButton.addEventListener('click', this.newSessionButtonListener);
                                    }
                                case 1:
                                    return _context2.a(2);
                            }
                        }, _callee2, this);
                    }));
                    this.stopMonitoring = function () {
                        if (this.observer) {
                            this.observer.disconnect();
                        }
                        if (this.currentModelVersionObserver) {
                            this.currentModelVersionObserver.disconnect();
                        }
                        this.optionObservers.forEach(function (observer) {
                            return observer.disconnect();
                        });
                        if (this.newSessionButtonListener && this.elementNewSessionButton()) {
                            this.elementNewSessionButton().removeEventListener('click', this.newSessionButtonListener);
                        }
                    };
                }
                // --- 具体驱动实现 ---

                function KimiPageDriver() {
                    GenericPageDriver.call(this);
                    var kimiSelectors = {
                        // ... Kimi.ai 对应的选择器 (占位)
                        promptInput: 'div.chat-action > div.chat-editor > div.chat-input div.chat-input-editor',
                        sendButton: 'div.chat-action > div.chat-editor > div.chat-editor-action div.send-button-container > div.send-button',
                        questions: 'div.chat-content-item.chat-content-item-user div.segment-content div.segment-content-box',
                        answers: 'div.chat-content-item.chat-content-item-assistant div.segment-content div.segment-content-box',
                        conversationArea: '#app div.main div.layout-content-main div.chat-content-container',
                        chatTitle: '#app div.main div.layout-header header.chat-header-content h2',
                        historyItems: '.sidebar div.history-part ul li',
                        newSessionButton: '#app aside div.sidebar-nav a.new-chat-btn',
                        webAccessOption: 'body div.toolkit-popover > div.toolkit-container div.toolkit-item:nth-child(1) > div.search-switch > label > input',
                        longThoughtOption: 'body div.toolkit-popover > div.toolkit-container div.toolkit-item:nth-child(2) > div.search-switch > label > input',
                        modelVersionList: 'body div.models-popover div.models-container div.model-item div.model-name > span.name',
                        currentModelVersion: '#app div.main div.chat-action > div.chat-editor > div.chat-editor-action div.current-model span.name',
                        modelVersionButton: 'div.current-model',
                        optionButton: 'div.toolkit-trigger-btn'
                    };
                    this.selectors = Object.assign({}, this.selectors, kimiSelectors);
                    this.optionButton = this.util.$(this.selectors.optionButton);
                    this.modelVersionButton = this.util.$(this.selectors.modelVersionButton);
                    this.cachedWebAccess = null;
                    this.cachedLongThought = null;
                    this.cachedVersions = null;
                    this.providerName = 'Kimi';

                    /**
                     * @description Initializes the Kimi driver by performing async operations to cache elements.
                     */
                    this.init = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
                        var _this2 = this;
                        return _regenerator().w(function (_context4) {
                            while (1) switch (_context4.n) {
                                case 0:
                                    if (!this.optionButton) {
                                        _context4.n = 2;
                                        break;
                                    }
                                    _context4.n = 1;
                                    return this.util.clickAndGet(this.optionButton, function () {
                                        _this2.cachedWebAccess = _this2.util.getBoolean(_this2.util.$(_this2.selectors.webAccessOption));
                                        _this2.cachedLongThought = _this2.util.getBoolean(_this2.util.$(_this2.selectors.longThoughtOption));
                                    });
                                case 1:
                                    // Add event listener to refresh cache on subsequent clicks
                                    this.optionButton.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
                                        return _regenerator().w(function (_context3) {
                                            while (1) switch (_context3.n) {
                                                case 0:
                                                    _context3.n = 1;
                                                    return new Promise(function (resolve) {
                                                        return setTimeout(resolve, 200);
                                                    });
                                                case 1:
                                                    _this2.cachedWebAccess = _this2.util.getBoolean(_this2.util.$(_this2.selectors.webAccessOption));
                                                    _this2.cachedLongThought = _this2.util.getBoolean(_this2.util.$(_this2.selectors.longThoughtOption));
                                                case 2:
                                                    return _context3.a(2);
                                            }
                                        }, _callee3);
                                    })));
                                case 2:
                                    if (!this.modelVersionButton) {
                                        _context4.n = 3;
                                        break;
                                    }
                                    _context4.n = 3;
                                    return this.util.clickAndGet(this.modelVersionButton, function () {
                                        _this2.cachedVersions = Array.from(_this2.util.$(_this2.selectors.modelVersionList), function (node) {
                                            return node.textContent;
                                        });
                                    });
                                case 3:
                                    return _context4.a(2);
                            }
                        }, _callee4, this);
                    }));
                    this.getWebAccessOption = function () {
                        if (this.cachedWebAccess === null) {
                            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
                        }
                        return this.cachedWebAccess;
                    };
                    this.getLongThoughtOption = function () {
                        if (this.cachedLongThought === null) {
                            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
                        }
                        return this.cachedLongThought;
                    };
                    this.getModelVersionList = function () {
                        if (this.cachedVersions === null) {
                            console.warn('KimiPageDriver not initialized. Call init() before using getters.');
                        }
                        return this.cachedVersions;
                    };
                }
                //KimiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

                function GeminiPageDriver() {
                    GenericPageDriver.call(this);
                    var geminiSelectors = {
                        // ... Gemini 对应的选择器 (占位)
                        promptInput: 'input-container div.input-area rich-textarea',
                        sendButton: '',
                        questions: 'div#chat-history div.conversation-container div.query-content',
                        answers: 'div#chat-history div.response-content message-content',
                        conversationArea: 'div#chat-history',
                        chatTitle: '',
                        historyItems: 'div.conversation-title',
                        newSessionButton: 'side-nav-action-button button',
                        webAccessOption: '',
                        longThoughtOption: '',
                        modelVersionList: 'div.mat-mdc-menu-panel div.mat-mdc-menu-content > button.mat-mdc-menu-item span.mat-mdc-menu-item-text div.title-and-description > span.mode-desc.gds-label-m-alt',
                        currentModelVersion: 'bard-mode-switcher button.mdc-button > span.mdc-button__label > div > span',
                        modelVersionButton: 'bard-mode-switcher button.mdc-button',
                        optionButton: '' //'toolbox-drawer div.toolbox-drawer-button-container button'
                    };
                    this.selectors = Object.assign({}, this.selectors, geminiSelectors);
                    this.providerName = 'Gemini';
                }
                //GeminiPageDriver.prototype = Object.create(GenericPageDriver.prototype);

                function ChatGPTPageDriver() {
                    GenericPageDriver.call(this);
                    var chatGPTSelectors = {
                        // ... ChatGPT 对应的选择器 (占位)
                    };
                    this.selectors = Object.assign({}, this.selectors, chatGPTSelectors);
                    this.providerName = 'ChatGPT';
                }
                //ChatGPTPageDriver.prototype = Object.create(GenericPageDriver.prototype);

                // --- 驱动工厂 ---

                module.exports = {
                    GenericPageDriver: GenericPageDriver,
                    KimiPageDriver: KimiPageDriver,
                    GeminiPageDriver: GeminiPageDriver,
                    ChatGPTPageDriver: ChatGPTPageDriver
                };

                /***/
})

        /******/
});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
            /******/
}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
            /******/
};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
        /******/
}
    /******/
    /************************************************************************/
    var __webpack_exports__ = {};
    // This entry needs to be wrapped in an IIFE because it declares 'MainWindowInitializer' on top-level, which conflicts with the current library output.
    (() => {
        var Util = __webpack_require__(825);
        var Storage = __webpack_require__(892);
        var Config = __webpack_require__(27);
        var I18n = __webpack_require__(677);
        var Message = __webpack_require__(866);
        var DriverFactory = __webpack_require__(540);
        var ChatArea = __webpack_require__(89);
        var MainWindowController = __webpack_require__(190);
        var resources = __webpack_require__(385);
        function MainWindowInitializer() {
            console.log("Main window initializer loading ...");

            // 加入错误处理
            window.onerror = function (msg, src, line, col, err) {
                console.error('Global error caught:\\n' + (err && err.stack || msg));
                return true; // 阻止默认处理
            };
            window.addEventListener('unhandledrejection', function (e) {
                console.error('Unhandled rejection:\\n' + e.reason);
            });
            var util = new Util();
            var storage = new Storage();
            var defaultConfig = {
                channelName: 'multi-ai-chat'
            };
            var config = new Config(storage, defaultConfig);
            var i18n = new I18n(config, resources);
            var message = new Message(config.get('channelName'));
            var mainWindowController = new MainWindowController(window.mainWindowName, message, config, i18n);
            mainWindowController.init();
            console.log("Main window initializer loaded.");
        }
        MainWindowInitializer();
    })();

    MainWindowInitializer = __webpack_exports__["default"];
    /******/
})()
    ;
console.log('Main window initialized.');
