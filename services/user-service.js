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
		return this.getUserById(usersByChatId[userChatId])
	},

	getUserByName: (name) => {
		return this.getUserById(usersByName[name]);
	},

	sendMoneyBetweenUsersByIds: (sourceId, targetId, ammount) => {
		const sourceUser = this.getUserById(sourceId);
		const targetUser = this.getUserById(targetId);
		sourceUser.balance -= ammount;
		targetUser.balance += ammount;
		return Promise.resolve();
	}
};

module.exports = userService;

