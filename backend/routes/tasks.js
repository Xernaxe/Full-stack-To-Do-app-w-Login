const express = require('express');
const router = express.Router();
const Task = require('../models/task')
const authenticate = require('../middleware/authenticate');

const Joi = require('joi');

router.get('/:userId', [authenticate], async(req, res) => {
	try {
        const schema = Joi.object({ // schema to validate userId param
            userId: Joi.number()
                .integer()
                .min(1)
                .required()
        })
        const { error } = schema.validate(req.params);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }
        const task = await Task.readAllTasksByUserId(req.params.userId); //read all tasks by req.params.userId

        return res.send(JSON.stringify(task));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }
});

router.post('/task/:userId', [authenticate], async(req, res) => {
	try {
        const { error } = Task.validate(req.body); //validate req.body
        console.log(req.body);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }
        const taskToBeSaved = new Task(req.body); // new task with req.body as params
		// console.log(taskToBeSaved);
		const task = await taskToBeSaved.createTask(req.params.userId);
		// console.log(task);

        return res.send(JSON.stringify(task));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }
});

router.get('/task/:taskId', [authenticate], async (req, res) => {
	try {
        const schema = Joi.object({ // validator for taskid param
            taskId: Joi.number()
                .integer()
                .min(1)
                .required()
        })


        const { error } = schema.validate(req.params);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }
        const task = await Task.readByTaskId(req.params.taskId);

        return res.send(JSON.stringify(task));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }
});

router.put('/task/:taskId', [authenticate], async(req, res) => {
    try {

        const task = await Task.readByTaskId(req.params.taskId); 

        if (req.body.taskDescription) {
            task.taskDescription = req.body.taskDescription;
        }
        if (req.body.taskCompleted) {
            task.taskCompleted = req.body.taskCompleted;
        }

        validationResult = Task.validate(task)
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }

        console.log(task);

        const updatedTask = await task.updateTask(req.params.taskId);
        
        return res.send(JSON.stringify(updatedTask));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }
});

router.delete('/task/:taskId', [authenticate], async (req, res) => {
    try{
        const task = await Task.readByTaskId(req.params.taskId);
        const deletedTask = await task.deleteTask(req.params.taskId);
        return res.send(JSON.stringify(deletedTask));
    }
    catch (err) { // if error
        if (err.statusCode) {   // if error with statusCode, send error with status: statusCode 
        return res.status(err.statusCode).send(JSON.stringify(err));
    }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode, send error with status: 500
    }
});

module.exports = router;