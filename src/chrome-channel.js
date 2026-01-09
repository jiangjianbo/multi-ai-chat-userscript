/**
 * @file chrome-channel.js
 * @description A wrapper class that provides a BroadcastChannel-compatible API
 *              but uses the Chrome Extension's messaging system under the hood.
 *              This acts as an adapter between the Message class and ChromeBroadcastChannel.
 */

/**
 * A BroadcastChannel-compatible class that communicates with the Chrome Extension's
 * injected ChromeBroadcastChannel script.
 */
class BroadcastChannelForChrome {
    /**
     * @param {string} channelName - The name of the communication channel.
     */
    constructor(channelName) {
        if (typeof ChromeBroadcastChannel === 'undefined') {
            throw new Error('ChromeBroadcastChannel is not available. Ensure the extension context is correct.');
        }

        this.name = channelName;
        this.onmessage = null;

        // Instantiate the actual channel communicator provided by the extension
        this.chromeChannel = new ChromeBroadcastChannel(channelName);

        // Bridge the onmessage handler
        this.chromeChannel.onmessage = (payload) => {
            if (this.onmessage) {
                // We create a mock MessageEvent-like object for compatibility
                const mockEvent = {
                    data: payload.data, // Extract the inner data, as per the design
                    origin: 'chrome-extension',
                    lastEventId: '',
                    source: null,
                    ports: []
                };
                this.onmessage(mockEvent);
            }
        };
    }

    /**
     * Posts a message through the Chrome Extension channel.
     * @param {any} data - The data to be sent. The Message class will structure this.
     */
    postMessage(data) {
        // The `postMessage` in ChromeBroadcastChannel expects the payload from the Message class
        this.chromeChannel.postMessage(data);
    }

    /**
     * Closes the connection through the Chrome Extension channel.
     */
    close() {
        this.chromeChannel.close();
    }

    // The following are properties/methods of the standard BroadcastChannel API
    // that we don't need to implement for this use case, but are listed for completeness.
    addEventListener(type, listener) {
        if (type === 'message') {
            // A more robust implementation could support multiple listeners
            this.onmessage = listener;
        }
    }

    removeEventListener(type, listener) {
        if (type === 'message' && this.onmessage === listener) {
            this.onmessage = null;
        }
    }

    dispatchEvent() {
        throw new Error('dispatchEvent is not implemented for BroadcastChannelForChrome.');
    }
}

module.exports = BroadcastChannelForChrome;
