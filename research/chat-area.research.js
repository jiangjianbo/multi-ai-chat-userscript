
const ChatArea = require('../src/chat-area.js');

function addStyles() {
    const styles = `
        :root {
            --border-color: #ccc;
            --background-color: #f9f9f9;
            --index-width: 45px;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #e5e5e5;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            align-items: flex-start;
        }
        .chat-area-container {
            width: 100%;
            max-width: 500px;
            height: 80vh;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background-color: var(--background-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        /* Title Bar & Dropdowns */
        .chat-area-title { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--border-color); background-color: #fff; position: relative; }
        .title-left, .title-right { display: flex; align-items: center; gap: 12px; }
        .title-button { cursor: pointer; font-size: 18px; padding: 5px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .title-button:hover { background-color: #eee; }
        .pin-button .icon { transition: transform 0.2s ease; display: inline-block; }
        .pin-button.pinned .icon { transform: rotate(-45deg); color: #007bff; }
        .model-selector, .params-selector { position: relative; }
        .model-name, .params-button { cursor: pointer; padding: 5px 8px; border-radius: 5px; font-size: 14px; }
        .model-name { font-weight: bold; }
        .custom-dropdown { display: none; position: absolute; top: calc(100% + 5px); right: 0; background-color: #fff; border: 1px solid var(--border-color); border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 110; padding: 10px; min-width: 200px; }
        .custom-dropdown.model-dropdown { left: 0; right: auto; min-width: 120px; padding: 5px 0; }
        .custom-dropdown.visible { display: block; }
        .model-option { padding: 8px 15px; cursor: pointer; font-size: 14px; }
        .model-option:hover { background-color: #eee; }
        .param-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .param-item:last-child { margin-bottom: 0; }
        .param-item label { font-size: 14px; margin-right: 10px; }
        .toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 22px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #2196F3; }
        input:checked + .slider:before { transform: translateX(18px); }
        .param-item select { width: 100%; padding: 5px; border-radius: 4px; border: 1px solid var(--border-color); }

        /* Main, Index, Conversation, Input */
        .chat-area-main { flex-grow: 1; overflow: hidden; position: relative; transition: padding-bottom 0.3s ease; }
        .chat-area-index { position: absolute; top: 0; left: 0; height: 100%; width: var(--index-width); padding: 10px 0; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 10; background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(2px); opacity: 0.85; border-right: 1px solid var(--border-color); }
        .index-button { cursor: pointer; width: 24px; height: 24px; border-radius: 4px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: bold; }
        .index-button:hover { background-color: #ccc; }
        .index-item a { font-size: 14px; color: #666; text-decoration: none; }
        .chat-area-conversation { height: 100%; padding: 20px 20px 20px calc(var(--index-width) + 10px); overflow-y: auto; box-sizing: border-box; scroll-behavior: smooth; }
        .message-bubble { max-width: 90%; padding: 10px 15px; border-radius: 15px; margin-bottom: 15px; position: relative; transition: all 0.3s ease; }
        .message-bubble.question { background-color: #dcf8c6; margin-left: auto; }
        .message-bubble.answer { background-color: #fff; margin-right: auto; border: 1px solid var(--border-color); }
        .message-bubble.answer.collapsed > .bubble-content { max-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .input-placeholder { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 80px; height: 30px; border-radius: 15px; background-color: rgba(0, 0, 0, 0.4); color: white; display: flex; justify-content: center; align-items: center; font-size: 12px; cursor: pointer; pointer-events: all; transition: all 0.3s ease; z-index: 20; }
        .input-placeholder.hidden { opacity: 0; transform: translateX(-50%) scale(0.5); visibility: hidden; }
        .chat-area-input { box-sizing: border-box; position: absolute; bottom: 0; left: 0; width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px; padding-left: calc(var(--index-width) + 10px); background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(5px); border-top: 1px solid var(--border-color); box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 25; opacity: 0; visibility: hidden; transform: translateY(100%); transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease; }
        .chat-area-input.visible { opacity: 1; visibility: visible; transform: translateY(0); }
        .chat-area-input.docked { background-color: #fff; }
        .chat-area-input textarea { flex-grow: 1; border: 1px solid var(--border-color); border-radius: 5px; padding: 8px; font-size: 14px; resize: none; }
        .chat-area-input button { flex-shrink: 0; width: 36px; height: 36px; border: none; background-color: #007bff; color: white; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; justify-content: center; align-items: center; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}


document.addEventListener('DOMContentLoaded', () => {
    addStyles();

    const instancesData = [
        {
            id: 1,
            modelName: 'Gemini',
            params: { webAccess: false, longThought: true },
            conversation: [
                { type: 'question', content: 'Compare let, const, and var.' },
                { type: 'answer', content: '<code>var</code> is function-scoped, <code>let</code> and <code>const</code> are block-scoped.' },
                { type: 'question', content: 'Show a table.' },
                { type: 'answer', content: '<table><thead><tr><th>Feature</th><th>var</th><th>let</th><th>const</th></tr></thead><tbody><tr><td>Scope</td><td>Function</td><td>Block</td><td>Block</td></tr></tbody></table>' },
            ]
        },
        {
            id: 2,
            modelName: 'Kimi',
            params: { webAccess: true, longThought: false },
            conversation: [
                { type: 'question', content: 'Tell me a short story.' },
                { type: 'answer', content: 'The last man on Earth sat alone in a room. There was a knock on the door.' },
            ]
        }
    ];

    instancesData.forEach((data, index) => {
        const container = document.createElement('div');
        container.className = 'chat-area-container';
        document.body.appendChild(container);
        
        // Mock mainController for isolated research
        const mockMainController = {
            removeChatArea: (id) => {
                console.log(`MainController: removeChatArea(${id}) called.`);
                // In a real scenario, this would also remove the element from the DOM
            }
        };

        const chatArea = new ChatArea(mockMainController, data.id, `http://fake.url/${data.id}`, container);
        chatArea.init(data);
    });

    // Global listener to close dropdowns
    document.addEventListener('click', (e) => {
        const isDropdownClick = e.target.closest('.custom-dropdown');
        const isToggleClick = e.target.closest('.model-name, .params-button');
        if (!isDropdownClick && !isToggleClick) {
            document.querySelectorAll('.custom-dropdown.visible').forEach(d => d.classList.remove('visible'));
        }
    });
     document.addEventListener('close-all-dropdowns', () => {
        document.querySelectorAll('.custom-dropdown.visible').forEach(d => d.classList.remove('visible'));
    });
});
