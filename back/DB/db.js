const mysql = require('mysql2');
require('dotenv').config();

const dbConfigCleverCloud = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT
};

const dbConfigLocal = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'governmentscheme'
};

let db = mysql.createConnection(dbConfigCleverCloud);

db.connect((err) => {
    if (err) {
        console.error('DB connection failed:', err.message);
        console.log('Trying to connect with Localhost Database...');
        
        db = mysql.createConnection(dbConfigLocal);
        db.connect((localErr) => {
            if (localErr) {
                console.error('Localhost DB connection failed:', localErr.message);
            } else {
                console.log('Connected to Localhost MySQL Database');
            }
        });
    }
    // if(err) {
    //     console.error('Error to connect');
    //     console.error("Error", err);
    // }
   
    else{
        console.log('Connected to  Database');
    }
});

module.exports = db;
