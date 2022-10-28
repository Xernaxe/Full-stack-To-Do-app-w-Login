const express = require('express');
const router = express.Router();

const _ = require('lodash');

const Account = require('../models/account');
const Joi = require('joi');

const authenticate = require('../middleware/authenticate');

// GET /api/accounts/id - get account by id
router.get('/:userId', [authenticate], async(req, res) => {
    try {
        // console.log('asd');

        const account = await Account.readById(req.params.userId);
        console.log(account);
        return res.send(JSON.stringify(account));

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err)); 
    }
});

// PUT /api/accounts/id - update credentials by id
router.put('/:userId', [authenticate], async (req, res) => {
    try {
        const accountCurrent = await Account.readById(req.params.userId);

        if (req.body.email) {
            accountCurrent.email = req.body.email;
        }

        let validationResult = Account.validate(accountCurrent);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }
        console.log(accountCurrent);
        const account = await accountCurrent.update(req.params.userId);


        return res.send(JSON.stringify(account))
        
    } catch (err) {
        if (err.statusCode) {  
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));
    }

})

module.exports = router;