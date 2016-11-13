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

    hasEnoughMoney(user, sum, accountType = "balance") {
        if (sum < 0) {
            return false;
        }

        const balance = user[accountType];
        return balance >= parseFloat(sum.toFixed(2));
    },

    addSumTo(user, sum, accountType = "balance") {
        user[accountType] = parseFloat((user[accountType] + parseFloat(sum)).toFixed(2));
    },

    withdrawSumFrom(user, sum, accountType = "balance") {
        user[accountType] = parseFloat((user[accountType] - parseFloat(sum)).toFixed(2));
    },

    getUserById: (userId) => {
        return usersById[userId];
    },

    getUserByChatId: (userChatId) => {
        return userService.getUserById(usersByChatId[userChatId]);
    },

    getUserByName: (name='') => {
        return userService.getUserById(usersByName[name.toLowerCase()]);
    },

    sendMoneyBetweenUsersByIds: (sourceId, targetId, ammount) => {
        const sourceUser = userService.getUserById(sourceId);
        const targetUser = userService.getUserById(targetId);
        userService.addSumTo(targetUser, ammount);
        userService.withdrawSumFrom(sourceUser, ammount);
        return Promise.resolve();
    }
};

module.exports = userService;

