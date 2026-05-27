// modules/auth/test.routes.js (simplificado pero mejorado)
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware.js');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Solo en desarrollo
const isDev = process.env.NODE_ENV !== 'production';

// DEBUG: verificar que las variables se cargaron
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Cargado' : 'No cargado');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'Cargado' : 'No cargado');

if (isDev) {
    console.log('Auth test endpoints enabled (development only)');

    // Base URL for all test auth routes
    const BASE_URL = '/api/v1/auth';

    /**
     * @route   GET /api/v1/auth/test/public
     * @desc    Test público - sin autenticación
     */
    router.get(`${BASE_URL}/test/public`, (req, res) => {
        res.json({ 
            success: true,
            message: 'Public endpoint OK',
            timestamp: new Date().toISOString()
        });
    });
    
    /**
     * @route   GET /api/v1/auth/test/protected
     * @desc    Test protegido - cualquier token válido
     */
    router.get(`${BASE_URL}/test/protected`, authenticateToken, (req, res) => {
        res.json({ 
            success: true,
            message: 'Protected endpoint OK',
            user: { 
                id: req.user.id, 
                email: req.user.email,
                role: req.user.role 
            }
        });
    });
    
    /**
     * @route   GET /api/v1/auth/test/user
     * @desc    Test solo para rol 'user'
     */
    router.get(`${BASE_URL}/test/user`, authenticateToken, authorizeRole('user'), (req, res) => {
        res.json({ 
            success: true,
            message: 'User role endpoint OK',
            user: { id: req.user.id, role: req.user.role }
        });
    });
    
    /**
     * @route   GET /api/v1/auth/test/editor
     * @desc    Test solo para rol 'editor'
     */
    router.get(`${BASE_URL}/test/editor`, authenticateToken, authorizeRole('editor'), (req, res) => {
        res.json({ 
            success: true,
            message: 'Editor role endpoint OK',
            user: { id: req.user.id, role: req.user.role }
        });
    });
    
    /**
     * @route   GET /api/v1/auth/test/admin
     * @desc    Test solo para rol 'admin'
     */
    router.get(`${BASE_URL}/test/admin`, authenticateToken, authorizeRole('admin'), (req, res) => {
        res.json({ 
            success: true,
            message: 'Admin role endpoint OK',
            user: { id: req.user.id, role: req.user.role }
        });
    });
    
    /**
     * @route   GET /api/v1/auth/test/multi-role
     * @desc    Test para roles 'admin' o 'editor'
     */
    router.get(`${BASE_URL}/test/multi-role`, authenticateToken, authorizeRole('admin', 'editor'), (req, res) => {
        res.json({ 
            success: true,
            message: `Multi-role endpoint OK - your role: ${req.user.role}`,
            user: { id: req.user.id, role: req.user.role }
        });
    });
    
    /**
     * @route   GET /api/v1/auth/test/me
     * @desc    Info detallada del token actual
     */
    router.get(`${BASE_URL}/test/me`, authenticateToken, (req, res) => {
        res.json({ 
            success: true,
            user: req.user,
            tokenInfo: {
                issuedAt: req.user.iat ? new Date(req.user.iat * 1000).toISOString() : null,
                expiresAt: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null,
                remainingSeconds: req.user.exp ? req.user.exp - Math.floor(Date.now() / 1000) : null
            }
        });
    });
    
    /**
     * @route   POST /api/v1/auth/test/decode-token
     * @desc    Decodifica un token sin verificar (solo para debugging)
     * @body    { token: "jwt_token_here" }
     */
    router.post(`${BASE_URL}/test/decode-token`, (req, res) => {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                error: 'Token required in body' 
            });
        }
        
        try {
            // Solo decodificar, no verificar firma
            const decoded = jwt.decode(token);
            res.json({ 
                success: true, 
                decoded,
                note: 'Token decoded without verification. Use /test/verify to check signature.'
            });
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
    });
    
    /**
     * @route   POST /api/v1/auth/test/verify-token
     * @desc    Verifica un token (requiere JWT_SECRET correcto)
     * @body    { token: "jwt_token_here" }
     */
    router.post(`${BASE_URL}/test/verify-token`, (req, res) => {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false, 
                error: 'Token required in body' 
            });
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    success: false, 
                    error: err.name,
                    message: err.message
                });
            }
            
            res.json({ 
                success: true, 
                valid: true,
                user: decoded,
                tokenInfo: {
                    issuedAt: new Date(decoded.iat * 1000).toISOString(),
                    expiresAt: new Date(decoded.exp * 1000).toISOString()
                }
            });
        });
    });
}

module.exports = router;