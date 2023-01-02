require("dotenv").config();

const SK = process.env.STRIPE_SECRET_KEY;
const ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET;
const API_URL = process.env.URL;
const SMTP_API_KEY = process.env.SMTP_API_KEY;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB = process.env.DB;

module.exports = {
    SK,
    ENDPOINT_SECRET,
    API_URL,
    SMTP_API_KEY,
    DB_HOST,
    DB,
    DB_PASSWORD,
    DB_USER
}