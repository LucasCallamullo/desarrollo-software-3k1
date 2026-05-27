/**
 * ================================================================
 * POST ROUTES
 * ================================================================
 * 
 * This file defines all routes for the Post resource.
 * 
 * URL pattern: /api/v1/posts
 * 
 * Routes:
 *   GET    /api/v1/posts        - Get all posts (public)
 *   GET    /api/v1/posts/:id    - Get post by ID (public)
 *   POST   /api/v1/posts        - Create a new post (authenticated)
 *   PUT    /api/v1/posts/:id    - Update post fully (authenticated)
 *   PATCH  /api/v1/posts/:id    - Update post partially (authenticated)
 *   DELETE /api/v1/posts/:id    - Delete a post (admin only)
 * ================================================================
 */

const express = require('express');
const router = express.Router();

const PostController = require('../controllers/postController');

// Import authentication and authorization middlewares
const { authenticateToken, authorizeRole } = require('../../auth/middlewares/authMiddleware');

// Base URL for all post routes
const BASE_URL = '/api/v1/posts';

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================

/**
 * @route   GET /api/v1/posts
 * @desc    Get all posts
 * @access  Public
 */
router.get(BASE_URL, PostController.getPosts);

/**
 * @route   GET /api/v1/posts/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get(`${BASE_URL}/:id`, PostController.getPostById);

// ============================================================
// PROTECTED ROUTES (authentication required)
// ============================================================

/**
 * @route   POST /api/v1/posts
 * @desc    Create a new post
 * @access  Authenticated users only
 */
router.post(BASE_URL, authenticateToken, PostController.create);

/**
 * @route   PUT /api/v1/posts/:id
 * @desc    Fully update a post (all fields required)
 * @access  Authenticated users only
 */
router.put(`${BASE_URL}/:id`, authenticateToken, PostController.update);

/**
 * @route   PATCH /api/v1/posts/:id
 * @desc    Partially update a post (send only fields to change)
 * @access  Authenticated users only
 */
router.patch(`${BASE_URL}/:id`, authenticateToken, PostController.update);

/**
 * @route   DELETE /api/v1/posts/:id
 * @desc    Delete a post
 * @access  Admin only
 */
router.delete(`${BASE_URL}/:id`, authenticateToken, authorizeRole('admin'), PostController.delete);

module.exports = router;