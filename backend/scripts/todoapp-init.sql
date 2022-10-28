USE [WAD-MMD-CSD-S21_10407762] 
-- PUT YOUR ID BEFORE USING!!!
GO

ALTER TABLE dbo.userAccount 
DROP CONSTRAINT IF EXISTS FK_user_userPassword
GO


ALTER TABLE dbo.userPassword 
DROP CONSTRAINT IF EXISTS FK_userPassword_user
GO

ALTER TABLE dbo.task 
DROP CONSTRAINT IF EXISTS FK_task_userAccount
GO


DROP TABLE IF EXISTS dbo.userPassword
GO

DROP TABLE IF EXISTS dbo.userAccount
GO

DROP TABLE IF EXISTS dbo.task
GO


CREATE TABLE dbo.userAccount(
	userId INT NOT NULL IDENTITY PRIMARY KEY,
	[name] varchar(16) NOT NULL UNIQUE,
	email nvarchar(255) NOT NULL UNIQUE,
)
GO


CREATE TABLE dbo.userPassword(
	FK_userId INT NOT NULL,
	hashedPassword nvarchar(255) NOT NULL

	CONSTRAINT FK_userPassword_user FOREIGN KEY (FK_userId) REFERENCES userAccount (userId)
)
GO

CREATE TABLE dbo.task(
	FK_userId INT NOT NULL,
	taskId INT NOT NULL IDENTITY PRIMARY KEY,
	taskDescription nchar(255) NOT NULL,
	taskCompleted INT NOT NULL

	CONSTRAINT FK_task_userAccount FOREIGN KEY (FK_userId) REFERENCES userAccount (userId)
)
GO


INSERT INTO dbo.userAccount
    ([name], [email])
VALUES
    ('test1', 'test1@gmail.com'),
    ('test2', 'test2@gmail.com'),
    ('test3', 'test3@gmail.com'),
    ('test4', 'test4@gmail.com'),
    ('test5', 'test5@gmail.com')
GO

INSERT INTO dbo.userPassword
    ([FK_userId], [hashedpassword])
VALUES
    (1, '$2a$10$lQUoAiYtQi7FIU94DFsh8uzMDx2iAvZsyfiquwFzMskn3cVZGlSiG'),
    (2, '$2a$10$C9tYuiAKQf.iLgk3Lry8LeZIUJNbkUFMenS0FXbhczR5QbG52Byp2'),
    (3, '$2a$10$99Xa6CLBZEN9a90Msm/64uWAqfyHCbkLZSeBO4xD3xwSDbqfnK3gG'),
    (4, '$2a$10$KoZcOm7Y2uR95bAlfdWNX.fD5SYRwaMzHDYId/Wf/Bh/khtzm9kLW'),
    (5, '$2a$10$n5HBeVVHDuH4giVSfV2yUuYG/ePyYvQjdHPidDec6NQH9ZcU3.Zv6')
GO


INSERT INTO dbo.task
    ([FK_userId], [taskDescription], [taskCompleted])
VALUES
    (1, 'Don`t fail the exam', 0),
    (1, 'Don`t fail the exam 2', 0),
    (1, 'Don`t fail the exam 3', 0),
    (2, 'Don`t fail the exam 4', 0),
    (2, 'Don`t fail the exam 5', 0)
GO

SELECT *
FROM userAccount a
    INNER JOIN userPassword pa
    ON a.userId = pa.FK_userId
ORDER BY a.userId
GO


SELECT *
FROM userPassword 
GO

INSERT INTO task
([FK_userId],[taskDescription],[taskCompleted])
VALUES
(1, 'Merge?', 0)
SELECT * FROM task a
WHERE a.taskId = SCOPE_IDENTITY()
SELECT * FROM task


SELECT *
FROM userAccount a
INNER JOIN task b
ON a.userId = b.FK_userId
WHERE a.userId= 1