
function addStyles() {
    const styles = `
        :root {
            --border-color: #e5e5e5;
            --background-color: #f7f7f8;
            --sidebar-bg: #202123;
            --text-color: #333;
            --text-light: #fff;
            --toolbar-bg: rgba(240, 240, 240, 0.9);
            --injected-index-width: 45px; /* Define index toolbar width */
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            display: flex;
            height: 100vh;
            background-color: var(--background-color);
        }
        /* Mock Page Layout */
        .mock-sidebar {
            width: 260px;
            background-color: var(--sidebar-bg);
            color: var(--text-light);
            padding: 20px;
        }
        .mock-main-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative; /* For injected elements */
        }
        .mock-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
            background: #fff;
        }
        .mock-chat-area {
            flex-grow: 1;
            overflow-y: auto;
            padding: 20px 20px 20px calc(var(--injected-index-width) + 10px); /* Adjust padding for index toolbar */
            position: relative; /* For index toolbar positioning */
        }
        .mock-input-area {
            padding: 20px;
            border-top: 1px solid var(--border-color);
            background: #fff;
        }
        .mock-input-area input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
        }

        /* --- Injected Elements --- */

        /* 1. Sync Button */
        .injected-sync-button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 20px;
        }
        .injected-sync-button:hover {
            background-color: #0056b3;
        }

        /* 2. Q&A Toolbar */
        .mock-qna-block {
            padding: 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-bottom: 20px;
            position: relative;
            max-width: calc(100% - 40px); /* Constrain width to prevent expansion */
        }
        .mock-qna-block:hover .injected-qna-toolbar {
            opacity: 1;
            visibility: visible;
        }
        .injected-qna-toolbar {
            position: absolute;
            top: -35px; /* Position above the block */
            left: 50%;
            transform: translateX(-50%); /* Center horizontally */
            background: var(--toolbar-bg);
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 3px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
            display: flex;
            gap: 5px;
            width: fit-content; /* Adjust width to content */
        }
        .injected-qna-toolbar button {
            border: none;
            background: none;
            cursor: pointer;
            padding: 5px;
            border-radius: 3px;
            font-size: 16px; /* Make icons a bit larger */
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .injected-qna-toolbar button:hover {
            background: #ddd;
        }

        /* Collapsed state for Q&A blocks */
        .mock-qna-block.collapsed .qna-content {
            max-height: 20px; /* Fixed height to show one line */
            overflow: hidden;
            width: 100%; /* Ensure it takes full width and doesn\'t expand */
            box-sizing: border-box;
        }
        .mock-qna-block.collapsed .qna-content p {
            white-space: nowrap; /* Force text to single line */
            text-overflow: ellipsis; /* Add ellipsis if text overflows */
            overflow: hidden; /* Hide overflowing text */
            line-height: 20px; /* Ensure consistent line height */
            margin: 0; /* Remove default paragraph margin */
            padding: 0; /* Remove default paragraph padding */
        }
        .mock-qna-block.collapsed .injected-qna-toolbar .collapse-button .icon {
            transform: rotate(180deg); /* Rotate arrow up */
        }
        .injected-qna-toolbar .icon {
            display: inline-block;
            transition: transform 0.2s ease;
        }

        /* 3. Index Toolbar */
        .injected-index-toolbar {
            position: fixed;
            top: 100px; /* Adjust as needed */
            left: calc(260px + 10px); /* Sidebar width + padding */
            width: var(--injected-index-width);
            background: var(--toolbar-bg);
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            z-index: 1000;
        }
        .injected-index-toolbar .index-button {
            cursor: pointer;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            font-weight: bold;
        }
        .injected-index-toolbar .index-button:hover {
            background-color: #ccc;
        }
        .injected-index-toolbar a {
            text-decoration: none;
            color: #333;
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

function renderHTML() {
    const html = `
        <aside class="mock-sidebar">
            <h3>History</h3>
            <ul>
                <li>Conversation 1</li>
                <li>Conversation 2</li>
            </ul>
            <button>+ New Chat</button>
        </aside>

        <main class="mock-main-content">
            <header class="mock-header">
                <h2>Model XYZ</h2>
                <!-- 1. Injected Sync Button -->
                <button class="injected-sync-button">Start Sync</button>
            </header>

            <div class="mock-chat-area" id="chat-area">
                <div class="mock-qna-block">
                    <div class="qna-content">
                        <p>This is the user\'s first question.</p>
                    </div>
                    <!-- 2. Injected Q&A Toolbar -->
                    <div class="injected-qna-toolbar">
                        <button class="collapse-button" title="Toggle Collapse"><span class="icon">&#x2922;</span></button>
                        <button class="copy-button" title="Copy"><span class="icon">&#x1F4CB;</span></button>
                    </div>
                </div>
                <div class="mock-qna-block" id="answer-1">
                    <div class="qna-content">
                        <p>This is the AI\'s first answer. It provides some details and context.</p>
                    </div>
                    <div class="injected-qna-toolbar">
                        <button class="collapse-button" title="Toggle Collapse"><span class="icon">&#x2922;</span></button>
                        <button class="copy-button" title="Copy"><span class="icon">&#x1F4CB;</span></button>
                    </div>
                </div>
                <div class="mock-qna-block">
                    <div class="qna-content">
                        <p>Here is a follow-up question from the user.</p>
                    </div>
                    <div class="injected-qna-toolbar">
                        <button class="collapse-button" title="Toggle Collapse"><span class="icon">&#x2922;</span></button>
                        <button class="copy-button" title="Copy"><span class="icon">&#x1F4CB;</span></button>
                    </div>
                </div>
                <div class="mock-qna-block" id="answer-2">
                    <div class="qna-content">
                        <p>The AI gives a second, more elaborate answer. This is to demonstrate the scrolling capability of the index toolbar. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
                    </div>
                    <div class="injected-qna-toolbar">
                        <button class="collapse-button" title="Toggle Collapse"><span class="icon">&#x2922;</span></button>
                        <button class="copy-button" title="Copy"><span class="icon">&#x1F4CB;</span></button>
                    </div>
                </div>
            </div>

            <footer class="mock-input-area">
                <input type="text" placeholder="Ask a follow-up...">
            </footer>

            <!-- 3. Injected Index Toolbar -->
            <div class="injected-index-toolbar">
                <div class="index-button expand-all" title="Expand All"><span class="icon">&#x2924;</span></div>
                <div class="index-button collapse-all" title="Collapse All"><span class="icon">&#x2922;</span></div>
                <a href="#answer-1" class="index-button">1</a>
                <a href="#answer-2" class="index-button">2</a>
            </div>
        </main>
    `;
    document.body.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    renderHTML();

    // This part is a direct copy of the script from page-controller.html
    // It represents the target functionality for the real PageController
    const chatArea = document.getElementById('chat-area');

    // Smooth scrolling for index links
    document.querySelectorAll('.injected-index-toolbar a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                chatArea.scrollTo({
                    top: targetElement.offsetTop - 20, // offset for padding
                    behavior: 'smooth'
                });
            }
        });
    });

    // Q&A Toolbar functionality
    document.querySelectorAll('.mock-qna-block').forEach(qnaBlock => {
        const collapseButton = qnaBlock.querySelector('.collapse-button');
        const copyButton = qnaBlock.querySelector('.copy-button');
        const qnaContent = qnaBlock.querySelector('.qna-content');

        if (collapseButton) {
            collapseButton.addEventListener('click', () => {
                qnaBlock.classList.toggle('collapsed');
            });
        }

        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const textToCopy = qnaContent.textContent || '';
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('Content copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
        }
    });

    // Index Toolbar Expand All / Collapse All
    document.querySelector('.injected-index-toolbar .expand-all').addEventListener('click', () => {
        document.querySelectorAll('.mock-qna-block').forEach(block => {
            block.classList.remove('collapsed');
        });
    });

    document.querySelector('.injected-index-toolbar .collapse-all').addEventListener('click', () => {
        document.querySelectorAll('.mock-qna-block').forEach(block => {
            block.classList.add('collapsed');
        });
    });

    // Sync Button dummy functionality
    document.querySelector('.injected-sync-button').addEventListener('click', () => {
        alert('Sync button clicked!');
    });

    console.log('Page Controller research page initialized from JS.');
});
