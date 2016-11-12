const userService = require('../services/user-service');

const USERS = [
    {name: 'Raul', chatId: '981647388611508', balance: 1250.18, balanceSavings: 3000},
    {name: 'Vlad', chatId: '1221584201246326', balance: 322.53, balanceSavings: 3000},
    {name: 'Bogdan', chatId: '1325850250780262', balance: 320.00, balanceSavings: 3000},
    {name: 'Horia', chatId: '1203276786414242', balance: 500, balanceSavings: 3000},
    {name: 'Vivianne', chatId: '1130662566983525', balance: 755, balanceSavings: 3000}
];

const USER_IDS = USERS.map(userDetails => {
    userService.registerNewUser(userDetails)
});

exports = {USER_IDS};
