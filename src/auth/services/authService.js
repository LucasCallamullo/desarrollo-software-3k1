/**
 * ================================================================
 * AUTH SERVICE
 * ================================================================
 * 
 * Contains business logic for authentication:
 * - Login validation and token generation
 * - Token refresh logic
 * - Logout (cookie clearing)
 * 
 * All errors are thrown as AppError for consistent handling.
 * ================================================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../users/models/User');
const AppError = require('../../core/utils/AppError');

/**
 * Authenticates a user and generates access + refresh tokens
 * 
 * @param {string} email - User's email
 * @param {string} password - User's plain text password
 * @returns {Promise<{ accessToken: string, user: object }>}
 * @throws {AppError} - 400 if missing credentials, 401 if invalid
 */
const login = async (email, password) => {
    // Validate required fields
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Check if user exists AND password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid email or password', 401);
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Return user data (without sensitive fields)
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
    };
};

/**
 * Generates a new access token from a valid refresh token
 * 
 * @param {string} refreshToken - Refresh token from cookie
 * @returns {Promise<{ accessToken: string }>}
 * @throws {AppError} - 401 if no token, 403 if invalid/expired
 */
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError('Refresh token not found. Please login again.', 401);
    }
    
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Find user by ID
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            throw new AppError('User not found. Please login again.', 403);
        }
        
        // Generate new access token
        const accessToken = generateAccessToken(user);
        
        return { accessToken };
        
    } catch (error) {
        if (error instanceof AppError) throw error;
        
        // Handle JWT specific errors
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Refresh token expired. Please login again.', 403);
        }
        
        throw new AppError('Invalid refresh token. Please login again.', 403);
    }
};

/**
 * Generates an access token (short-lived)
 * 
 * @param {Object} user - User object from database
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '15m' 
        }
    );
};

/**
 * Generates a refresh token (long-lived)
 * 
 * @param {Object} user - User object from database
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { 
            id: user.id
        },
        process.env.JWT_REFRESH_SECRET,
        { 
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
        }
    );
};

/**
 * Cookie configuration helper
 * 
 * @returns {Object} Cookie options object
 */
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});

module.exports = {
    login,
    refreshAccessToken,
    getCookieOptions,
    generateAccessToken,  // exported for testing only
    generateRefreshToken  // exported for testing only
};