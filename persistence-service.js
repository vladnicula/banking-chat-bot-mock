'use strict';

const interlaMock = {};

const persistenceService = {

	getSessionOfUserId : ( senderId ) => {
		if ( !interlaMock[senderId] ) {
			interlaMock[senderId] = {
				// any particular bot flow existing already and needs handling?
				flowState: null
			};
		}
		return interlaMock[senderId];
	}
}

module.exports = persistenceService;