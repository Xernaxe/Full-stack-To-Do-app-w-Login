const sql = require('mssql');
const config = require('config');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

class Task {
    constructor(taskObj){
        if(taskObj.userId){
            this.userId = taskObj.userId
        }
        this.taskId = taskObj.taskId
        this.taskDescription = taskObj.taskDescription
        this.taskCompleted = taskObj.taskCompleted
    }

    static validationSchema() {
        const schema =Joi.object({
            taskId: Joi.number()
                .integer()
                .min(1),
            taskDescription: Joi.string()
                .max(255)
                .required(),
            taskCompleted: Joi.number()
                .integer()
                .required()
        })

        return schema
    }

    static validate(taskObj) {
        const schema = Task.validationSchema();

        return schema.validate(taskObj);
    }

    static readAllTasksByUserId(userId) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userId', sql.Int(), userId)
                        .query(`
                            SELECT *
                            FROM task t
                            WHERE t.FK_userId= @userId
                        `)
                    // console.log(result.recordset);
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Tasks not found for userId: ${userId}`, errorObj: {} };
                    
                    // const taskWannabe = result.recordset.map(el =>{el.taskId, el.tasKdescription, el.taskCompleted})
                    // console.log(taskWannabe);
                        // ^^ works too but it screws with the validator

                    const tasks = []; // init an empty array in which we will push the resulting tasks
                    result.recordset.forEach(record => {
                        const taskWannabe = {
                            taskId: record.taskId,
                            taskDescription: record.taskDescription,
                            taskCompleted: record.taskCompleted
                        }

                        const { error } = Task.validate(taskWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, task does not validate: ${taskWannabe.taskId}`, errorObj: error };

                        tasks.push(new Task(taskWannabe));
                    })

                    resolve(tasks)

                } catch (err) {
                    reject(err)
                }

                sql.close();

            })();   // *** IIFE
        })
    }

    static readByTaskId(taskId) {
        return new Promise((resolve, reject) => {
            (async () => {

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('taskId', sql.Int(), taskId)
                        .query(`
                            SELECT *
                            FROM task t
                            WHERE t.taskId = @taskId
                        `)

                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple tasks with taskId: ${taskId}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Task not found by taskId: ${taskId}`, errorObj: {} };
                    
                    const taskWannabe = {
                        taskId: result.recordset[0].taskId,
                        taskDescription: result.recordset[0].taskDescription,
                        taskCompleted: result.recordset[0].taskCompleted
                    }
                    // console.log(taskWannabe);
                    const { error } = Task.validate(taskWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, task does not validate: ${taskWannabe.taskId}`, errorObj: error };

                    resolve(new Task(taskWannabe))

                } catch (err) {
                    reject(err)
                }

                sql.close();

            })();
        })
    }


    createTask(userId) {
        return new Promise((resolve, reject) => {
            (async () => {
                console.log('asd');
                try {
                    
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userId', sql.Int(), userId)
                        .input('taskDescription', sql.NChar(), this.taskDescription)
                        .input('taskCompleted', sql.Int(), this.taskCompleted)
                        .query(`
                            INSERT INTO task
                            ([FK_userId],[taskDescription],[taskCompleted])
                            VALUES
                            (@userId, @taskDescription, @taskCompleted)
                            SELECT * FROM task a
                            WHERE a.taskId = SCOPE_IDENTITY()
                        `)
                        // console.log(result.recordset);
                        if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO task table failed`, errorObj: {} }
                    // console.log(result.recordset);
                    const taskId = result.recordset[0].taskId;
                    sql.close();
                    const task = await Task.readByTaskId(taskId);
                    resolve(task)

                } catch (err) {
                    reject(err)
                }

                sql.close();

            })();   // *** IIFE
        })
    }


    deleteTask(taskId) {
        return new Promise((resolve, reject) => {
            (async () => {
                // console.log('asd');
                try {
                    const task = await Task.readByTaskId(taskId)
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('taskId', sql.Int(), taskId)
                        .query(`
                            DELETE FROM task
                            WHERE taskId = @taskId
                        `)
                        
                    resolve(task)

                } catch (err) {
                    reject(err)
                }

                sql.close();

            })();   // *** IIFE
        })
    }

    updateTask(taskId) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let tmpResult;

                    tmpResult = await Task.readByTaskId(taskId)

                    const pool = await sql.connect(con);
                    tmpResult = await pool.request()
                        .input('taskId', sql.Int(), this.taskId)
                        .input('taskDescription', sql.NChar(), this.taskDescription)
                        .input('taskCompleted', sql.Int(), this.taskCompleted)
                        .query(`
                            UPDATE task
                            SET taskDescription = @taskDescription, taskCompleted = @taskCompleted
                            WHERE taskId = @taskId
                        `)
                        sql.close()
                        const task = await Task.readByTaskId(this.taskId)
                        console.log(task);
                        resolve(task)
                    } catch (err) {
                    reject(err)
                }

                sql.close();

            })();   // *** IIFE
        })
    }
}



module.exports = Task;