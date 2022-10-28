const env = require('dotenv').config();
const Account = require('../models/account')
const emailTest = 'test1@gmail.com'

const errorEmail = "not.in@db.com"
const errorObj = { statusCode: 404, errorMessage: `Account not found by email: ${errorEmail}`, errorObj: {} };

const testEmail = {
    "email": "test1@gmail.com",
    "name": "test1",
    "userId": 1
}


test('account.readByEmail() with correct email returns the acc object ', async () => {
    await expect(Account.readByEmail(emailTest)).resolves.toEqual(testEmail);
})

test('account.readByEmail() rejects with incorect Email ', async () => {
    await expect(Account.readByEmail(errorEmail)).rejects.toEqual(errorObj);
})