/**
 * ================================================================
 * AUTH CONTROLLER
 * ================================================================
 * 
 * Handles HTTP requests and responses for authentication.
 * Delegates business logic to auth.service.js.
 * 
 * Uses AppError and passes errors to global errorHandler via next().
 * ================================================================
 */

const authService = require('../services/authService');

/**
 * POST /api/v1/auth/login
 * Authenticates user and sets refresh token cookie
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Delegate to service
        const { accessToken, refreshToken, user } = await authService.login(email, password);
        
        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, authService.getCookieOptions());
        
        // Return access token and user info
        res.json({
            success: true,
            accessToken,
            user
        });
        
    } catch (error) {
        next(error);  // Pass to global error handler
    }
};

/**
 * POST /api/v1/auth/logout
 * Clears refresh token cookie
 */
const logout = (req, res, next) => {
    try {
        res.clearCookie('refreshToken', authService.getCookieOptions());
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/auth/refresh
 * Generates new access token from refresh token cookie
 */
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        const { accessToken } = await authService.refreshAccessToken(refreshToken);
        
        res.json({
            success: true,
            accessToken
        });
        
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    refresh
};