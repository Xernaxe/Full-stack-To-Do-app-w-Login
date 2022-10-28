const express = require('express');
const router = express.Router();

const _ = require('lodash'); 

const Account = require('../models/account');
const Joi = require('joi');

// Endpoint for creating a new acount
// POST request (guest) 
router.post('/', async (req, res) => {
    try {                             
        // separating the user info from the password with lodash
        const newAccount = _.pick(req.body, ['email', 'name']); 
        const newPassword = _.pick(req.body, ['password']);

        //checking the raw password
        const schema = Joi.object({  // Joi is used to define the password
            password: Joi.string()   // as a string with minimun length 
            .min(3)                  // of 3 characters
            .required()              // and is required
        });

        let validateResult = schema.validate(newPassword); 
        // if password does not meets requirements throw an error, code stops here
        if (validateResult.error) throw { statusCode: 400, errorMessage: `Password does not match requirements`, errorObj: validateResult.error }

        //otherwise, continue with user info matches requirements
        validateResult = Account.validate(newAccount);  // if not, throw error
        if (validateResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validateResult.error }

        const toBeSaved = new Account(newAccount); //calling Account constructor with the new user info
        // and assigning the new account object to toBeSaved

        const account = await toBeSaved.create(newPassword.password); //waiting for the new user to be saved in DB
        console.log(account);
        return res.send(JSON.stringify(account)); // respond with new account

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));
    }
});

module.exports = router;