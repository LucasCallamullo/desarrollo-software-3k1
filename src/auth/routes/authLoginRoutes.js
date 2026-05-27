/**
 * ================================================================
 * AUTHENTICATION ROUTES
 * ================================================================
 * 
 * Defines all authentication-related endpoints.
 * No business logic here - only routing and middleware.
 * ================================================================
 */

const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();
const BASE_URL = '/api/v1/auth';

// Public routes
router.post(`${BASE_URL}/login`, authController.login);
router.post(`${BASE_URL}/logout`, authController.logout);
router.post(`${BASE_URL}/refresh`, authController.refresh);

module.exports = router;