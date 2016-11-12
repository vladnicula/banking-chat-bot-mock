const userService = require('../services/user-service');


const USERS = [
	{ name:'Raul', chatId:'981647388611508', currentAmmount: 1250.18},
	{ name:'Vlad', chatId:'1221584201246326', currentAmmount: 322.53},
	{ name:'Bogdan', chatId:'1325850250780262', currentAmmount: 320.00},
	{ name:'Horia', chatId:'1203276786414242', currentAmmount: 500},
	{ name:'Vivianne', chatId:'1130662566983525', currentAmmount: 755}
];

const USER_IDS = USERS.map(userDetails => {
	userService.registerNewUser(userDetails)
});

exports = {USER_IDS};
