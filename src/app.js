/**
 * ================================================================
 * SERVER ENTRY POINT
 * ================================================================
 * 
 * This is the main application file that initializes and starts
 * the Express server for the University Forum API.
 * 
 * It handles:
 * - Database connection and synchronization
 * - Middleware setup (CORS, logging, JSON parsing, cookies)
 * - Route registration
 * - Error handling
 * - Server startup
 * ================================================================ */

// ================================================================
// DEPENDENCIES
// ================================================================

const cors = require('cors');           // Enables Cross-Origin Resource Sharing
const express = require('express');     // Web framework
const cookieParser = require('cookie-parser'); // Parses cookies from requests


require('dotenv').config();             // Loads environment variables from .env file

// Import Sequelize instance from the central model registry
// (Not from config/db.js - this ensures all models are properly registered)
const { sequelize } = require('./core/models/index.js');

// Core middleware imports
const logger = require('./core/middlewares/logger');          // HTTP request logging
const errorHandler = require('./core/middlewares/errorHandler.js'); // Global error handler

// Import seed function to populate database with initial/fake data
const seed = require('./core/seed/seed.js');

// Route imports by module/feature
const authRoutes = require('./auth/routes/authLoginRoutes.js'); // Authentication (login/logout/refresh)
const authTestRoutes = require('./auth/routes/authTestRoutes.js'); // Test endpoints (auth debugging)

const userRoutes = require('./users/routes/userRoutes.js');   // User CRUD operations

const postRoutes = require('./forum/routes/postRoutes.js');   // Forum posts

// ================================================================
// INITIALIZE EXPRESS APP
// ================================================================
const app = express();

// ================================================================
// CORS CONFIGURATION
// ================================================================
// Allows any origin to access the API (default behavior)
// In production, you should restrict this to specific domains:
// app.use(cors({ origin: 'https://myfrontend.com' }));
app.use(cors());

// ================================================================
// GLOBAL MIDDLEWARES (applied to every request)
// ================================================================
app.use(logger);              // Logs request method, URL, status, and response time
app.use(express.json());      // Parses incoming JSON request bodies into req.body
app.use(cookieParser());      // Parses cookies from requests into req.cookies

// ================================================================
// ROUTE REGISTRATION
// ================================================================
// Each route module is mounted at its base path defined inside the module
// Examples:
//   - authRoutes may handle /api/v1/auth/login
//   - postRoutes may handle /api/v1/posts

app.use(authRoutes);          // Authentication endpoints (login, logout, refresh)
app.use(authTestRoutes);      // Test endpoints (auto-disabled in production by the module)

// user app
app.use(userRoutes);

app.use(postRoutes);          // Forum post endpoints


// ================================================================
// ERROR HANDLING (MUST BE LAST middleware)
// ================================================================
// Catches any errors passed via next(error) from previous middleware/routes
// Sends consistent error response format to the client
app.use(errorHandler);


// ================================================================
// DATABASE CONNECTION & SERVER START
// ================================================================

/**
 * Initializes the database connection and starts the Express server.
 * 
 * Steps:
 * 1. Authenticate connection to the database
 * 2. Synchronize models with database schema
 * 3. Run seeders to populate initial/test data
 * 4. Start listening for HTTP requests
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */

async function startServer() {
    try {
        // Step 1: Verify database connection
        // Throws an error if connection fails
        await sequelize.authenticate();
        console.log('-- Database connection established');

        // Step 2: Synchronize database schema with Sequelize models
        // Options for sync strategies (see comments below):
        
        // Option 1: Create tables if they don't exist (SAFE for production)
        // await sequelize.sync();
        
        // Option 2: Force recreation - DROPS all tables first! (DEVELOPMENT ONLY)
        // WARNING: This deletes ALL existing data!
        await sequelize.sync({ force: true });
        
        // Option 3: Smart alter - adds new columns without deleting data (CURRENT)
        // Good for active development where you're adding fields to models
        // await sequelize.sync({ alter: true });
        
        console.log('-- Database schema synchronized');

        // Step 3: Populate database with initial/fake data
        // Only inserts data if tables are empty (checks internally)
        await seed.runSeed();
        console.log('🌱 Seed data loaded');

        // Step 4: Start the HTTP server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        
    } catch (error) {
        // Log any fatal errors that prevent the server from starting
        console.error('❌ Failed to start server:', error.message);
        console.error(error);
        // Exit process with failure code (optional)
        // process.exit(1);
    }
}

// ================================================================
// START THE APPLICATION
// ================================================================

startServer();

// ================================================================
// EXPORTS (for testing purposes)
// ================================================================
module.exports = { app };