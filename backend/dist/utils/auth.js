"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoAuthenticate = exports.demoLogin = exports.requireAdmin = exports.authenticate = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid authorization header'
            });
        }
        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await exports.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        // Get user details from our database
        const { default: prisma } = await Promise.resolve().then(() => __importStar(require('./db')));
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
        });
        if (!dbUser) {
            // Create user if doesn't exist
            const newUser = await prisma.user.create({
                data: {
                    email: user.email,
                    fullName: user.user_metadata?.full_name || user.email.split('@')[0],
                }
            });
            req.user = {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            };
        }
        else {
            req.user = {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role
            };
        }
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Demo login for development
const demoLogin = async (req, res) => {
    try {
        const { email = 'demo@example.com' } = req.body;
        const { default: prisma } = await Promise.resolve().then(() => __importStar(require('./db')));
        // Find or create demo user
        let user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    fullName: 'Demo User',
                    role: email === 'admin@example.com' ? 'ADMIN' : 'USER'
                }
            });
        }
        // Create a demo token (in production, use proper JWT)
        const demoToken = Buffer.from(JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        })).toString('base64');
        res.json({
            success: true,
            data: {
                token: demoToken,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Demo login error:', error);
        res.status(500).json({
            success: false,
            error: 'Demo login failed'
        });
    }
};
exports.demoLogin = demoLogin;
// Demo authentication middleware for development
const demoAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid authorization header'
            });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            if (decoded.exp < Date.now()) {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired'
                });
            }
            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
            next();
        }
        catch {
            return res.status(401).json({
                success: false,
                error: 'Invalid token format'
            });
        }
    }
    catch (error) {
        console.error('Demo authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
exports.demoAuthenticate = demoAuthenticate;
//# sourceMappingURL=auth.js.map