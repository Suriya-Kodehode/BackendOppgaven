import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config();

// In .env file:

// DB_HOST=""
// DB_NAME=""
// DB_USER=""
// DB_PASSWORD=""
// DB_PORT=""
// JWT_SECRET=""

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mssql',
        logging: false,
    }
);

// Test the connection
db.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

export default db;