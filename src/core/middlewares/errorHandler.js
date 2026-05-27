// core/middlewares/errorHandler.js
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(`[ERROR] ${err.message}`);
    
    // Handle operational errors (AppError)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(err.details && { details: err.details })
        });
    }

    // Handle JWT specific errors (if they somehow bypass AppError)
    if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({
            success: false,
            error: 'Invalid token.'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(403).json({
            success: false,
            error: 'Token expired. Please login again.'
        });
    }
    
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.errors.map(e => e.message)
        });
    }
    
    // Handle unknown errors (500)
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};

module.exports = errorHandler;