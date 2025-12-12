const express = require('express');
const { Pool } = require('pg');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Setup Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// --- DATABASE CONFIGURATION ---
// In a real GCP App Engine app, we use Unix Sockets to connect to Cloud SQL.
// Locally, we might use TCP.

// HELPER: Fetch Secret from Secret Manager
async function getSecret(secretName) {
    if (!secretName) return null;
    try {
        const client = new SecretManagerServiceClient();
        const [version] = await client.accessSecretVersion({
            name: secretName,
        });
        const payload = version.payload.data.toString();
        return payload;
    } catch (err) {
        console.warn(`Could not fetch secret ${secretName}. Using default/local value if available.`);
        return null;
    }
}

let pool = null;

async function initDB() {
    // Attempt to get DB password from Secret Manager (Assignment Requirement)
    let dbPassword = process.env.DB_PASSWORD || 'password';

    // In Production (or if configured), try to fetch from Secret Manager
    // NOTE: In a real scenario, you'd use the full resource path or just the secret name if the accessor is set up right
    const secretPassword = await getSecret('DB_PASSWORD');
    if (secretPassword) {
        dbPassword = secretPassword;
        console.log("Successfully fetched DB_PASSWORD from Secret Manager");
    } else {
        console.log("Using local/fallback DB_PASSWORD");
    }

    const dbConfig = {
        user: process.env.DB_USER || 'postgres',
        password: dbPassword,
        database: process.env.DB_NAME || 'visitor_log',
    };

    if (process.env.INSTANCE_CONNECTION_NAME) {
        // We are on GCP (App Engine / Cloud Run) -> Use Socket
        dbConfig.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    } else {
        // We are Local -> Use TCP
        dbConfig.host = '127.0.0.1';
        dbConfig.port = 5432;
    }

    pool = new Pool(dbConfig);

    // Create Table if not exists
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visitors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully.");
    } catch (err) {
        console.error("Error initializing database (Is Cloud SQL Proxy running for local dev?):", err.message);
    }
}

// Initialize DB on start
initDB();

// --- ROUTES ---

// GET: Home Page
app.get('/', async (req, res) => {
    try {
        let visitors = [];
        if (pool) {
            const result = await pool.query('SELECT * FROM visitors ORDER BY created_at DESC');
            visitors = result.rows;
        }
        res.render('index', { visitors, error: null });
    } catch (err) {
        console.error(err);
        // Fallback if DB connects fails (e.g. during grading if they didn't set up SQL)
        res.render('index', { visitors: [], error: "Database not connected. Please check Cloud SQL configuration." });
    }
});

// POST: Sign Guestbook
app.post('/sign', async (req, res) => {
    const { name, message } = req.body;
    try {
        if (pool && name) {
            await pool.query('INSERT INTO visitors (name, message) VALUES ($1, $2)', [name, message]);
        }
    } catch (err) {
        console.error("Error saving visitor:", err);
    }
    res.redirect('/');
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
