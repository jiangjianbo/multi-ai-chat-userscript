const MessageClient = require('../src/message-client');

describe('MessageClient', () => {
    let message;
    let msgClient;

    beforeEach(() => {
        message = {
            send: jest.fn()
        };
        msgClient = new MessageClient(message);
    });

    test('sendParamChanged should send a param_changed message', () => {
        msgClient.sendParamChanged('receiver1', 'key1', 'newVal', 'oldVal');
        expect(message.send).toHaveBeenCalledWith('param_changed', {
            key: 'key1',
            newValue: 'newVal',
            oldValue: 'oldVal',
            receiverId: 'receiver1'
        });
    });

    test('syncChat should send a sync_chat message', () => {
        msgClient.syncChat('receiver1', 'Hello');
        expect(message.send).toHaveBeenCalledWith('sync_chat', {
            prompt: 'Hello',
            receiverId: 'receiver1'
        });
    });

    test('getParam should send a get_param message', () => {
        msgClient.getParam('receiver1', 'key1');
        expect(message.send).toHaveBeenCalledWith('get_param', {
            key: 'key1',
            receiverId: 'receiver1'
        });
    });

    test('paramValue should send a param_value message', () => {
        msgClient.paramValue('receiver1', 'key1', 'value1');
        expect(message.send).toHaveBeenCalledWith('param_value', {
            key: 'key1',
            value: 'value1',
            receiverId: 'receiver1'
        });
    });

    test('chatStarted should send a chat_started message', () => {
        msgClient.chatStarted('receiver1');
        expect(message.send).toHaveBeenCalledWith('chat_started', {
            receiverId: 'receiver1'
        });
    });

    test('chatCompleted should send a chat_completed message', () => {
        msgClient.chatCompleted('receiver1', 'Done');
        expect(message.send).toHaveBeenCalledWith('chat_completed', {
            response: 'Done',
            receiverId: 'receiver1'
        });
    });

    test('chatFailed should send a chat_failed message', () => {
        msgClient.chatFailed('receiver1', 'Error');
        expect(message.send).toHaveBeenCalledWith('chat_failed', {
            error: 'Error',
            receiverId: 'receiver1'
        });
    });

    test('registerChatArea should send a register_chat_area message', () => {
        msgClient.registerChatArea('receiver1', 'name1', 'url1');
        expect(message.send).toHaveBeenCalledWith('register_chat_area', {
            name: 'name1',
            url: 'url1',
            receiverId: 'receiver1'
        });
    });

    test('getAllChatAreas should send a get_all_chat_areas message', () => {
        msgClient.getAllChatAreas('receiver1');
        expect(message.send).toHaveBeenCalledWith('get_all_chat_areas', {
            receiverId: 'receiver1'
        });
    });

    test('allChatAreas should send an all_chat_areas message', () => {
        const areas = [{ id: '1', name: 'name1' }];
        msgClient.allChatAreas('receiver1', areas);
        expect(message.send).toHaveBeenCalledWith('all_chat_areas', {
            chatAreas: areas,
            receiverId: 'receiver1'
        });
    });

    test('closeWindow should send a close_window message', () => {
        msgClient.closeWindow('receiver1');
        expect(message.send).toHaveBeenCalledWith('close_window', {
            receiverId: 'receiver1'
        });
    });

    test('storageSet should send a storage_set message', () => {
        msgClient.storageSet('receiver1', 'key1', 'value1');
        expect(message.send).toHaveBeenCalledWith('storage_set', {
            key: 'key1',
            value: 'value1',
            receiverId: 'receiver1'
        });
    });

    test('storageGet should send a storage_get message', () => {
        msgClient.storageGet('receiver1', 'key1');
        expect(message.send).toHaveBeenCalledWith('storage_get', {
            key: 'key1',
            receiverId: 'receiver1'
        });
    });

    test('storageValue should send a storage_value message', () => {
        msgClient.storageValue('receiver1', 'key1', 'value1');
        expect(message.send).toHaveBeenCalledWith('storage_value', {
            key: 'key1',
            value: 'value1',
            receiverId: 'receiver1'
        });
    });

    test('storageRemove should send a storage_remove message', () => {
        msgClient.storageRemove('receiver1', 'key1');
        expect(message.send).toHaveBeenCalledWith('storage_remove', {
            key: 'key1',
            receiverId: 'receiver1'
        });
    });

    test('storageGetAll should send a storage_get_all message', () => {
        msgClient.storageGetAll('receiver1');
        expect(message.send).toHaveBeenCalledWith('storage_get_all', {
            receiverId: 'receiver1'
        });
    });

    test('storageAllValues should send a storage_all_values message', () => {
        const values = { key1: 'value1' };
        msgClient.storageAllValues('receiver1', values);
        expect(message.send).toHaveBeenCalledWith('storage_all_values', {
            values: values,
            receiverId: 'receiver1'
        });
    });

    test('storageClear should send a storage_clear message', () => {
        msgClient.storageClear('receiver1');
        expect(message.send).toHaveBeenCalledWith('storage_clear', {
            receiverId: 'receiver1'
        });
    });

    test('chat should send a chat message', () => {
        msgClient.chat('Hello');
        expect(message.send).toHaveBeenCalledWith('chat', {
            prompt: 'Hello'
        });
    });

    test('newSession should send a new_session message', () => {
        msgClient.newSession('receiver1', 'provider1');
        expect(message.send).toHaveBeenCalledWith('new_session', {
            providerName: 'provider1',
            receiverId: 'receiver1'
        });
    });

    test('focus should send a focus message', () => {
        msgClient.focus('receiver1');
        expect(message.send).toHaveBeenCalledWith('focus', {
            receiverId: 'receiver1'
        });
    });

    test('changeProvider should send a change_provider message', () => {
        msgClient.changeProvider('receiver1', 'http://example.com');
        expect(message.send).toHaveBeenCalledWith('change_provider', {
            url: 'http://example.com',
            receiverId: 'receiver1'
        });
    });

    test('prompt should send a prompt message', () => {
        msgClient.prompt('receiver1', 'Hello');
        expect(message.send).toHaveBeenCalledWith('prompt', {
            text: 'Hello',
            receiverId: 'receiver1'
        });
    });

    test('export should send an export message', () => {
        msgClient.export('receiver1');
        expect(message.send).toHaveBeenCalledWith('export', {
            receiverId: 'receiver1'
        });
    });

    test('create should send a create message', () => {
        const data = { id: '1', name: 'test' };
        msgClient.create(data);
        expect(message.send).toHaveBeenCalledWith('create', data);
    });

    test('answer should send an answer message', () => {
        msgClient.answer('id1', 0, 'content');
        expect(message.send).toHaveBeenCalledWith('answer', {
            id: 'id1',
            index: 0,
            content: 'content'
        });
    });

    test('titleChange should send a titleChange message', () => {
        msgClient.titleChange('id1', 'new title');
        expect(message.send).toHaveBeenCalledWith('titleChange', {
            id: 'id1',
            title: 'new title'
        });
    });

    test('optionChange should send an optionChange message', () => {
        msgClient.optionChange('id1', 'key1', 'value1');
        expect(message.send).toHaveBeenCalledWith('optionChange', {
            id: 'id1',
            key: 'key1',
            value: 'value1'
        });
    });

    test('question should send a question message', () => {
        msgClient.question('id1', 0, 'a question');
        expect(message.send).toHaveBeenCalledWith('question', {
            id: 'id1',
            index: 0,
            content: 'a question'
        });
    });

    test('modelVersionChange should send a modelVersionChange message', () => {
        msgClient.modelVersionChange('id1', 'v2');
        expect(message.send).toHaveBeenCalledWith('modelVersionChange', {
            id: 'id1',
            version: 'v2'
        });
    });
});
