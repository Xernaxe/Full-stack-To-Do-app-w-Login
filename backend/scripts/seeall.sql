

SELECT *
                        FROM userAccount a
                        LEFT JOIN task b
                        ON a.userId = b.FK_userId
                        WHERE a.userId = 2


SELECT * FROM userAccount
SELECT * FROM userPassword
SELECT * FROM task