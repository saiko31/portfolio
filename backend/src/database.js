const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({path: path.join(__dirname, '../.env')});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

//Initializing DB
async function initDB(){

    console.log("Verifying tables...");

    try{

        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS site_stats (
                id INT PRIMARY KEY,
                total_visits INT DEFAULT 0
            )
        `);

        await promisePool.query(`
            INSERT IGNORE INTO site_stats (id, total_visits) VALUES (1, 0)
        `);

        await promisePool.query(`
            CREATE TABLE log_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_hash VARCHAR(64) NOT NULL,
                visit_date DATE NOT NULL,
                UNIQUE KEY unique_visit (ip_hash, visit_date)
            )
        `);

        console.log("Tables created succesfully!")
    }catch(err){
        console.log("ERROR: Could not create Tables");
    }
}


initDB();

module.exports = pool.promise();

