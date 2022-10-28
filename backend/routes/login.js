const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const jwt = require('jsonwebtoken');
const config = require('config');

// Endpoint to log in with existing account in DB
// POST request (guest) 
router.post('/', async (req, res) => {
	try {
		const { error } = Account.validateCredentials(req.body); //validating the user's credentials from the payload (email, password)
		if (error)					// if there is mismatching, related to the validateCredentials schema, throw error
			throw {					// if not, the execution continues further
				statusCode: 400,
				errorMessage: 'Badly formed request payload',
				errorObj: error,
			};

		const account = await Account.checkCredentials(req.body); //waiting for result of checkCredentials method
																
		const token = jwt.sign(			 //generating a token 
			JSON.stringify(account), 	 //by turning the account into a string
			config.get('jwt_secret_key') //that string gets encrypted by the jwt key
		);

		//atach token to the response header
		res.header('x-authentication-token', token);
		account.jwt = token
		console.log(account);

		return res.send(JSON.stringify(account));

	} catch (err) {
		if (err.statusCode)
			return res.status(err.statusCode).send(JSON.stringify(err));
		return res.status(500).send(JSON.stringify(err));
	}
});

module.exports = router;
