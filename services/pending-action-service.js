const pendingActionsById = {};
const pendingActionsByUserId = {};

const uuid = require('uuid');

module.exports = {
	registerPendingAction: (actionDescriptor, sourceUserId, targetUserId) => {
		const actionId = `pa-${Date.now()}-${uuid()}`;

		pendingActionsById[actionId] = Object.assign(
			{id: actionId}, actionDescriptor, {targetUserId, sourceUserId}
		);

		if (!pendingActionsByUserId[targetUserId]) {
			pendingActionsByUserId[targetUserId] = [];	
		}

		pendingActionsByUserId[targetUserId].push(actionId);

		return actionId;
	},

	resolvePendingAction: (actionId) => {

		if ( !pendingActionsById[actionId] ) {
			return;
		}

		const {targetUserId} = pendingActionsById[actionId];

		const indexOfActionId = pendingActionsByUserId[targetUserId].indexOf(actionId);

		pendingActionsByUserId[targetUserId] = []
			.concat(pendingActionsByUserId[targetUserId].slice(0, indexOfActionId))
			.concat(pendingActionsByUserId[targetUserId].slice(indexOfActionId+1));

		delete pendingActionsById[actionId];
	},

	getActionById: (actionId) => {
		return pendingActionsById[actionId];
	},

	getPendingActionsByUserId: (clientId) => {
		return (pendingActionsByUserId[clientId]||[]).map(this.getActionById);
	}
};

