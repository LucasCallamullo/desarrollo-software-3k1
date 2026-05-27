/**
 * ================================================================
 * LOGGER MIDDLEWARE
 * ================================================================
 * 
 * This middleware logs every incoming HTTP request with colored output
 * for better readability in the console.
 * 
 * Features:
 *   - Logs timestamp, HTTP method, URL, status code, and response time
 *   - Colors HTTP methods: GET (green), POST (cyan), PUT (yellow), PATCH (magenta), DELETE (red)
 *   - Colors status codes: 2xx (green), 3xx (cyan), 4xx (yellow), 5xx (red)
 *   - Uses res.on('finish') to capture status code and duration after response is sent
 * 
 * Usage:
 *   const logger = require('./core/middlewares/logger');
 *   app.use(logger);
 * 
 * Output example:
 *   [2026-05-27T10:30:00.000Z] GET    /api/users 200 (45ms)
 *   [2026-05-27T10:30:05.000Z] POST   /api/posts 201 (120ms)
 *   [2026-05-27T10:30:10.000Z] DELETE /api/posts/1 404 (12ms)
 * 
 * Colors in terminal:
 *   - Green: Success (2xx)
 *   - Cyan: Redirects (3xx) and POST method
 *   - Yellow: Client errors (4xx) and PUT method
 *   - Magenta: PATCH method
 *   - Red: Server errors (5xx) and DELETE method
 * 
 * ================================================================
 */

/**
 * Logger middleware function
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logger = (req, res, next) => {
    // Capture request start time for response duration calculation
    const start = Date.now();
    const method = req.method;
    const url = req.url;
    
    // ============================================================
    // HTTP METHOD COLORS
    // ============================================================
    // ANSI color codes for terminal output
    const methodColors = {
        GET: '\x1b[32m',     // Green
        POST: '\x1b[36m',    // Cyan
        PUT: '\x1b[33m',     // Yellow
        PATCH: '\x1b[35m',   // Magenta
        DELETE: '\x1b[31m'   // Red
    };
    const methodColor = methodColors[method] || '\x1b[0m';  // Default: reset
    const resetColor = '\x1b[0m';
    
    // ============================================================
    // RESPONSE EVENT LISTENER
    // ============================================================
    // The 'finish' event is emitted when the response has been sent
    // to the client. This allows us to capture:
    //   - Final status code (res.statusCode)
    //   - Response duration (Date.now() - start)
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        
        // ========================================================
        // STATUS CODE COLORS
        // ========================================================
        let statusColor;
        if (status >= 500) {
            statusColor = '\x1b[31m';   // Red - Server errors (500-599)
        } else if (status >= 400) {
            statusColor = '\x1b[33m';   // Yellow - Client errors (400-499)
        } else if (status >= 300) {
            statusColor = '\x1b[36m';   // Cyan - Redirects (300-399)
        } else {
            statusColor = '\x1b[32m';   // Green - Success (200-299)
        }
        
        // ========================================================
        // CONSOLE OUTPUT
        // ========================================================
        // Format: [TIMESTAMP] METHOD URL STATUS (DURATIONms)
        // Example: [2026-05-27T10:30:00.000Z] GET    /api/users 200 (45ms)
        console.log(
            `[${new Date().toISOString()}] ` +
            `${methodColor}${method.padEnd(6)}${resetColor} ` +
            `${url} ` +
            `${statusColor}${status}${resetColor} ` +
            `(${duration}ms)`
        );
    });
    
    // ============================================================
    // PASS CONTROL TO NEXT MIDDLEWARE
    // ============================================================
    // Important: Without next(), the request would hang indefinitely
    next();
};

module.exports = logger;