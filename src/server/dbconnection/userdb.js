import mysql from 'mysql';

export default {
    pool: mysql.createPool({
        connectionLimit: 10,
        multipleStatements: true,
        host: process.env.RAZZLE_DB_HOST,
        user: process.env.RAZZLE_DB_USER,
        password: process.env.RAZZLE_DB_PASS,
        database: process.env.RAZZLE_USERS_DB
    }),
    connection: mysql.createConnection({
        multipleStatements: true,
        host: process.env.RAZZLE_DB_HOST,
        user: process.env.RAZZLE_DB_USER,
        password: process.env.RAZZLE_DB_PASS,
        database: process.env.RAZZLE_USERS_DB
    })
}