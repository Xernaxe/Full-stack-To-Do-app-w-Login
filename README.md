

NB! ONLY THE FIRST 2 ACCOUNTS ARE POPULATED WITH TASKS
 TEST ACCOUNTS:
 1: EMAIL:test1@gmail.com PASSWORD:test1
 2: EMAIL:test2@gmail.com PASSWORD:test2
 3: EMAIL:test3@gmail.com PASSWORD:test3
 4: EMAIL:test4@gmail.com PASSWORD:test4
 5: EMAIL:test5@gmail.com PASSWORD:test5

 ENDPOINTS:
///// PROFILES
/api/accounts/:userId - GET account by :userId
/api/accounts/:userId - PUT edit account with :userId

///// LOGIN
--/api/accounts -- POST validatecred, get token, get account

///// REGISTER
--/api/accounts -- POST new account

 ///// TASKS
 --/api/tasks/:userId  --GET ALL :userId TASKS
 --/api/tasks/task/:taskId  --GET TASK ID
 --/api/tasks/task/:userId --POST A NEW TASK FOR :userId 
    Body:{"taskDescription":"", "taskCompleted":""}(0 = false | 1 = true) 
--/api/tasks/task/:taskId --PUT TASK BY ID
--/api/tasks/task/:taskId --DELETE TASK BY ID

