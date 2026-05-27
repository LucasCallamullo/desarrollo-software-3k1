/**
 * ================================================================
 * AUTHENTICATION MIDDLEWARE
 * ================================================================
 * 
 * This middleware verifies JWT tokens from the Authorization header.
 * It extracts the token, validates it, and attaches the decoded user
 * information to `req.user` for use in subsequent middleware/routes.
 * 
 * All errors are passed to the global errorHandler via next(error),
 * ensuring consistent error response formatting across the API.
 * 
 * Usage:
 *   app.get('/api/protected', authenticateToken, (req, res) => {
 *       res.json({ user: req.user });
 *   });
 * 
 * Headers expected:
 *   Authorization: Bearer <jwt_token>
 * 
 * Errors handled (passed to errorHandler):
 *   401 - No token provided
 *   403 - Invalid or expired token
 * ================================================================
 */

const jwt = require('jsonwebtoken');

const AppError = require('../../core/utils/AppError');


/**
 * Authenticates a user by verifying the JWT token from the Authorization header.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} - Calls next() if authenticated, or next(error) on failure
 */
function authenticateToken(req, res, next) {
    try {
        // 1. Get the Authorization header
        // Expected format: "Bearer <token>"
        const authHeader = req.headers.authorization;
        
        // 2. Extract token (remove "Bearer " prefix)
        // If authHeader is "Bearer abc123...", split gives ["Bearer", "abc123..."]
        // Then we take the second element (index 1)
        const token = authHeader && authHeader.split(' ')[1];
        
        // 3. Check if token exists
        if (!token) {
            return next(new AppError('Access denied. No token provided.', 401));
        }
        
        // 4. Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            // If verification fails (invalid signature, expired, malformed)
            if (err) {
                // Differentiate between expired and invalid tokens for better error messages
                if (err.name === 'TokenExpiredError') {
                    return next(new AppError('Token expired. Please login again.', 403));
                }
                return next(new AppError('Invalid token.', 403));
            }
            
            // 5. Attach decoded user info to request object
            // The decoded payload typically contains:
            //   { id, email, role, iat, exp }
            req.user = decoded;
            
            // 6. Pass control to the next middleware/route handler
            next();
        });
        
    } catch (error) {
        // Handle any synchronous errors (unlikely in this function)
        console.error('Authentication middleware error:', error.message);
        return next(new AppError('Internal server error during authentication.', 500));
    }
}

/**
 * Authorizes a user based on their role.
 * Must be used AFTER authenticateToken.
 * 
 * @param {...string} allowedRoles - List of roles allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * Usage:
 *   app.delete('/api/users/:id', authenticateToken, authorizeRole('admin'), deleteUser);
 *   app.post('/api/posts', authenticateToken, authorizeRole('admin', 'user'), createPost);
 */
function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        // Check if user exists (should be set by authenticateToken)
        if (!req.user) {
            return next(new AppError('Authentication required before role check.', 401));
        }
        
        // Check if user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError(
                `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
                403
            ));
        }
        
        next();
    };
}

// EXPORTS
module.exports = {
    authenticateToken,
    authorizeRole
};