const usersByName = {};
const usersById = {};
const usersByChatId = {};
const usersByFacebookId = {};

const uuid = require('uuid');

const userService = {
    registerNewUser: (userDetails) => {
        const userId = `user-${Date.now()}-${uuid()}`;
        const {name, facebookId, chatId} = userDetails;

        usersById[userId] = Object.assign({}, userDetails, {id: userId});
        usersByName[name] = userId;
        usersByChatId[chatId] = userId;

        return userId;
    },

    getUserById: (userId) => {
        return usersById[userId];
    },

    getUserByChatId: (userChatId) => {
        return userService.getUserById(usersByChatId[userChatId]);
    },

    getUserByName: (name) => {
        return userService.getUserById(usersByName[name]);
    },

    sendMoneyBetweenUsersByIds: (sourceId, targetId, ammount) => {
        const sourceUser = userService.getUserById(sourceId);
        const targetUser = userService.getUserById(targetId);
        sourceUser.balance -= ammount;
        targetUser.balance += ammount;
        return Promise.resolve();
    }
};

module.exports = userService;

