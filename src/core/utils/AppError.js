/**
 * Custom error class for operational errors
 * 
 * @example
 * throw new AppError('User not found', 404);
 * throw new AppError('Validation failed', 400, { fields: ['email', 'password'] });
 */
class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;  // to distinguish from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;