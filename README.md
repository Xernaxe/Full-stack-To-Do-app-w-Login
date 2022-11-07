Does not contain .env file <br/>

Full-stack To-Do App w/ Login <br/>

Tech stack: <br/>
NodeJs <br/>
Express <br/>
JWT <br/>
BCrypt <br/>
JavaScript <br/>
SQL <br/>
Jest <br/>
AWS <br/>



NB! ONLY THE FIRST 2 ACCOUNTS ARE POPULATED WITH TASKS <br/>
 TEST ACCOUNTS: <br/>
 1: EMAIL:test1@gmail.com PASSWORD:test1 <br/>
 2: EMAIL:test2@gmail.com PASSWORD:test2 <br/>
 3: EMAIL:test3@gmail.com PASSWORD:test3 <br/>
 4: EMAIL:test4@gmail.com PASSWORD:test4 <br/>
 5: EMAIL:test5@gmail.com PASSWORD:test5 <br/>

 ENDPOINTS: <br/>
///// PROFILES <br/>
/api/accounts/:userId - GET account by :userId <br/>
/api/accounts/:userId - PUT edit account with :userId <br/>
 <br/>
///// LOGIN <br/>
--/api/accounts -- POST validatecred, get token, get account <br/>
 <br/>
///// REGISTER <br/>
--/api/accounts -- POST new account <br/>
 <br/>
 ///// TASKS <br/>
 --/api/tasks/:userId  --GET ALL :userId TASKS <br/>
 --/api/tasks/task/:taskId  --GET TASK ID <br/>
 --/api/tasks/task/:userId --POST A NEW TASK FOR :userId  <br/>
    Body:{"taskDescription":"", "taskCompleted":""}(0 = false | 1 = true)  <br/>
--/api/tasks/task/:taskId --PUT TASK BY ID <br/>
--/api/tasks/task/:taskId --DELETE TASK BY ID <br/>

