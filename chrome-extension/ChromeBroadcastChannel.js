/**
 * @file ChromeBroadcastChannel.js
 * @description A library injected into the page to simulate the BroadcastChannel API.
 */
class ChromeBroadcastChannel {
    /**
     * @param {string} channelName - The name of the channel.
     */
    constructor(channelName) {
        if (!channelName) {
            throw new TypeError("Failed to construct 'BroadcastChannel': 1 argument required, but only 0 present.");
        }
        this.name = channelName;
        this.onmessage = null;

        this._listener = (event) => {
            if (this.onmessage) {
                // The payload from the background script is in event.detail
                this.onmessage(event.detail);
            }
        };

        // Listen for messages forwarded from the content script
        document.addEventListener(`message-from-content-script-${this.name}`, this._listener);

        // Register this channel with the background script
        this.sendMessageToContentScript('register');
    }

    /**
     * Sends a message to all other tabs connected to this channel.
     * @param {*} payload - The data to send, expected to be an object from the Message class.
     */
    postMessage(payload) {
        this.sendMessageToContentScript('broadcast', payload);
    }

    /**
     * Closes the channel and unregisters from the background script.
     */
    close() {
        // Unregister from the background script
        this.sendMessageToContentScript('unregister');

        // Remove the page-level listener
        document.removeEventListener(`message-from-content-script-${this.name}`, this._listener);
        this.onmessage = null;
    }

    /**
     * Helper to dispatch events to the content script.
     * @param {string} type - The type of message ('register', 'unregister', 'broadcast').
     * @param {object} [payload] - The data payload, for broadcast messages.
     * @private
     */
    sendMessageToContentScript(type, payload = {}) {
        document.dispatchEvent(new CustomEvent('message-from-page', {
            detail: {
                type: type,
                channel: this.name,
                payload: payload
            }
        }));
    }
}