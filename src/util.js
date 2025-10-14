
/**
 * @description 根据 JSON 对象创建 HTML 元素。
 * @param {object} json - 描述 HTML 结构的 JSON 对象。
 * @returns {HTMLElement} - 创建的 HTML 元素。
 */
function toHtml(json) {
    if (typeof json === 'string') {
        return document.createTextNode(json);
    }

    let { tag, text, children, child, ...attrs } = json;

    // 处理简写形式, e.g., { div: 'hello', '@id': 'my-div' }
    if (!tag) {
        const firstKey = Object.keys(json)[0];
        if (firstKey && !['@', 'on', 'text', 'children', 'child'].some(prefix => firstKey.startsWith(prefix))) {
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

    const element = document.createElement(tag);

    if (text) {
        if (tag.toLowerCase() === 'script' && typeof text === 'function') {
            element.textContent = text.toString();
        } else {
            element.textContent = text;
        }
    }

    for (const key in attrs) {
        if (key.startsWith('@')) {
            const attrName = key.substring(1);
            let attrValue = attrs[key];
            if (typeof attrValue === 'object' && attrValue !== null) {
                attrValue = Object.entries(attrValue)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(';');
            }
            element.setAttribute(attrName, attrValue);
        } else if (key.startsWith('on')) {
            const eventName = key.toLowerCase();
            let eventFunc = attrs[key];
            if (typeof eventFunc === 'function') {
                eventFunc = `(${eventFunc.toString()})()`;
            }
            element.setAttribute(eventName, eventFunc);
        }
    }

    const childNodes = children || child;
    if (childNodes) {
        if (Array.isArray(childNodes)) {
            childNodes.forEach(childJson => {
                element.appendChild(toHtml(childJson));
            });
        } else {
             element.appendChild(toHtml(childNodes));
        }
    }

    return element;
}

/**
 * @description 查询并返回匹配选择器的第一个 DOM 元素。
 * @param {string} selector - CSS 选择器。
 * @param {HTMLElement|Document} [parent=document] - 查询的父节点。
 * @returns {HTMLElement|null}
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * @description 查询并返回匹配选择器的所有 DOM 元素组成的 NodeList。
 * @param {string} selector - CSS 选择器。
 * @param {HTMLElement|Document} [parent=document] - 查询的父节点。
 * @returns {NodeListOf<HTMLElement>}
 */
function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

// 根据项目规范，使用 function 定义构造函数来模拟类，并导出
function Util() {
    this.toHtml = toHtml;
    this.$ = $;
    this.$$ = $$;
}

module.exports = Util;
