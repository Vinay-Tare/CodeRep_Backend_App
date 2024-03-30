const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  port: process.env.PORT,
  secretKey: process.env.SECRET_KEY,
  mongoUrl: process.env.MONGO_DB_CONNECTION_URL,
};