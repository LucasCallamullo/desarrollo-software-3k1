/**
 * ================================================================
 * USER ROUTES
 * ================================================================
 * 
 * Base: /api/v1/users
 * 
 * Routes:
 *   GET    /           → Get all users
 *   GET    /:id        → Get user by ID
 *   POST   /           → Create user
 *   PUT    /:id        → Full update
 *   PATCH  /:id        → Partial update
 *   DELETE /:id        → Delete user
 * ================================================================
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

const BASE_URL = '/api/v1/users';

router.get(`${BASE_URL}/`, UserController.getUsers);
router.get(`${BASE_URL}/:id`, UserController.getUserById);
router.post(`${BASE_URL}/`, UserController.create);

router.put(`${BASE_URL}/:id`, UserController.update);
router.patch(`${BASE_URL}/:id`, UserController.update);
router.delete(`${BASE_URL}/:id`, UserController.delete);

module.exports = router;