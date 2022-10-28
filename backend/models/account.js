const config = require('config');
const con = config.get('dbConfig_UCN'); // variable containing the connection string to DB
const sql = require('mssql');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

class Account {
    // creating the constructor of Account object
    constructor(accountObj) {                       
        if (accountObj.userId) {
            this.userId = accountObj.userId;
        }
        this.email = accountObj.email; 
        this.name = accountObj.name;    
        if(accountObj.jwt){             
            this.jwt = accountObj.jwt
        }
        if(accountObj.tasks){
            this.tasks = accountObj.tasks 
        }
        if(accountObj.taskId){
            this.taskId = accountObj.taskId 
        }
        if(accountObj.taskDescription){  
            this.taskDescription = accountObj.taskDescription
        }
        if(accountObj.taskCompleted){
            this.taskCompleted = accountObj.taskCompleted
        }
    }

    // validating account object, that should match the structure of the schema to be validated
    static validationSchema() {
        const schema = Joi.object({
            userId: Joi.number() 
                .integer()
                .min(1),  
            email: Joi.string() 
                .email()
                .max(255) 
                .required(), 
            name: Joi.string() 
                .max(50)
                .min(4)
                .required(), 
            tasks: Joi.array()
        })

        return schema;
    }

    // returning a result, based on validationSchema
    static validate(accountObj) {
        const schema = Account.validationSchema();

        return schema.validate(accountObj);
    }

    // validation for email and password
    static validateCredentials(credentialsObj) {
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .max(255)
                .required(),
            password: Joi.string()
                .required()
        })

        return schema.validate(credentialsObj); //returning the validation result
    }

    // checking user credentials if account.email = CredentialsObj. email
    static checkCredentials(credentialsObj) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const account = await Account.readByEmail(credentialsObj.email); // calling with email to await for a result
                    // to find the account related to email in DB

                    console.log(account.userId);
                    console.log(account);
                    const pool = await sql.connect(con); // if there is succes, open connection to DB
                    const result = await pool.request()  // find hashed password matching userID
                        .input('userId', sql.Int(), account.userId)
                        .query(`
                            SELECT *
                            FROM userPassword p
                            WHERE p.FK_userId = @userId
                        `)

                    // if the length of the result is different from 1, throw error
                    if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt DB.`, errorObj: {} }

                    const hashedpassword = result.recordset[0].hashedPassword; // the result that will be verrified, if there is no error
                    
                    // using bcrypt.compareSYnc to verify hashed with raw password
                    const okCredentials = bcrypt.compareSync(credentialsObj.password, hashedpassword);

                    // if there is no match, throw error
                    if (!okCredentials) throw { statusCode: 401, errorMessage: 'Invalid user email or password' };

                    resolve(account);

                } catch (err) {
                    if (err.statusCode) reject({ statusCode: 401, errorMessage: `password is wrong`, errorObj: {} })
                    reject(err)
                }

                sql.close(); // closing DB connection
            })();
        })
    }

    // check if account.email = email
    static readByEmail(email) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con); //open connection to DB
                    const result = await pool.request() 
                        .input('email', sql.NVarChar(), email)
                        .query(`
                            SELECT *
                            FROM userAccount a
                            WHERE a.email = @email
                    `)

                    // emails in userAccount are unique values, meaning it's expected to receive only one account with that email, or not even one
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found by email: ${email}`, errorObj: {} }
                    if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt information in DB`, errorObj: {} }

                    const accountWannabe = {
                        userId: result.recordset[0].userId,
                        email: result.recordset[0].email,
                        name: result.recordset[0].name
                    }

                    // after restructuring the result into an object (accountWannabe), it has to be validated
                    const { error } = Account.validate(accountWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt account information in the database, userId: ${accountWannabe.userId}`, errorObj: error }

                    resolve(new Account(accountWannabe));

                } catch (err) {
                    reject(err);
                }
                sql.close(); // close connection to DB

            })();
        })
    }

    // check if account.userID = userID
    static readById(userId) { 
    // with this method account is called by ID and if no errors, returns with account object with the tasks belonging to account
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con); // open connection to DB
                    const result = await pool.request()
                        .input('userId', sql.Int(), userId)
                        .query(`
                        SELECT *
                        FROM userAccount a
                        LEFT JOIN task b   
                        ON a.userId = b.FK_userId
                        WHERE a.userId = @userId
                        `)
                    
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Users not found by userId: ${userId}`, errorObj: {} };

                    // if this line is reached, there is matching result in DB
                    let taskArr = []
                    result.recordset.forEach(result => { // define a task Object structure
                        let taskObj = {                 // and create for each task, object with the following properties
                            id: 0,
                            taskDetails:{
                                desc: 'asd',
                                compl: 0,
                            }
                        }
                        if(result.FK_userId == userId){  // find the tasks that belong to the user account by foreign key
                            taskObj.id = result.taskId   // convert results to task objects
                            taskObj.taskDetails.desc = result.taskDescription
                            taskObj.taskDetails.compl = result.taskCompleted
                            taskArr.push(taskObj) // push the objects to an array
                        }
                    })

                    // convert the account into object with array of tasks
                    const userWannabe = {
                        userId: result.recordset[0].userId,
                        name: result.recordset[0].name,
                        email: result.recordset[0].email,
                        tasks: taskArr
                    }


                    resolve(new Account(userWannabe));

                } catch (err) {
                    reject(err)
                }

                sql.close(); //close DB connection

            })();
        })
    }


    // create account
    create (password) {
        return new Promise((resolve, reject) => {
            (async () => {
                try { //check if email already exists
                    const account = await Account.readByEmail(this.email); // check if account already exist by email
                    
                    const error = { statusCode: 409, errorMessage: `Account already exists`, errorObj: {} }
                    return reject(error);
                } catch (err) {
                    if (!err.statusCode || err.statusCode != 404) { 
                        return reject(err);
                    }
                }

                //if this try block is reached, then there is no account in the DB
                try {
                    const pool = await sql.connect(con); // open DB connection

                    const resultAccount = await pool.request()
                    .input('email', sql.NVarChar(), this.email)   
                    .input('name', sql.NVarChar(), this.name)  // for registration the name is required input as well
                    .query(`
                        INSERT INTO userAccount
                            ([email], [name])
                        VALUES
                            (@email, @name);
                        SELECT * 
                        FROM userAccount a
                        WHERE a.userId = SCOPE_IDENTITY()
                    `)

                    if (resultAccount.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO account table failed`, errorObj: {} }

                    //adding hashed password into userPassword table, if the INSERT INTO table is succesfull
                    const hashedpassword = bcrypt.hashSync(password);
                    const userId = resultAccount.recordset[0].userId;  // the new inserted account

                    const resultPassword = await pool.request()
                    .input('userId', sql.Int(), userId)
                    .input('hashedPassword', sql.NVarChar(), hashedpassword)
                    .query(`
                        INSERT INTO userPassword
                            ([FK_userId], [hashedPassword])
                        VALUES
                            (@userId, @hashedPassword);
                        SELECT *
                        FROM userPassword p
                        WHERE p.FK_userId = @userId
                    `)

                    // if the result length is different from 1, then something went wrong with the second INSERT INTO
                    if (resultPassword.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO account table failed`, errorObj: {} }

                    sql.close(); // close DB connection

                    const account = await Account.readByEmail(this.email); // awaiting for the result of readByEmail

                    resolve(account);
                } catch (err) {
                    reject(err);
                }

                sql.close();
            })();
        })
    }

    //edit email by user ID
    update(userId) {
        return new Promise((resolve, reject) => {
            (async () => {
                console.log('asd?');
                try {
                    let editEmail;
                    editEmail = await Account.readById(userId); // make sure account exists by ID

                    const pool = await sql.connect(con);  // open connection to DB
                    editEmail = await pool.request()
                        .input('userId', sql.Int(), userId)
                        .input('email', sql.NVarChar(), this.email) 
                        .query(`
                        UPDATE userAccount
                        SET email = @email
                        WHERE userId = @userId
                        `)

                    sql.close(); //close DB connection

                    const account = await Account.readById(userId); // call Account by ID with updated email

                    resolve(account);

                } catch (err) {
                    reject(err);
                }

                sql.close();
            })();
        })
    }

}

module.exports = Account;