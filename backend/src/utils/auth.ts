import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      } as ApiResponse);
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      } as ApiResponse);
    }

    // Get user details from our database
    const { default: prisma } = await import('./db');
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });

    if (!dbUser) {
      // Create user if doesn't exist
      const newUser = await prisma.user.create({
        data: {
          email: user.email!,
          fullName: user.user_metadata?.full_name || user.email!.split('@')[0],
        }
      });
      
      req.user = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      };
    } else {
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    } as ApiResponse);
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    } as ApiResponse);
  }
  
  next();
};

// Demo login for development
export const demoLogin = async (req: Request, res: Response) => {
  try {
    const { email = 'demo@example.com' } = req.body;
    
    const { default: prisma } = await import('./db');
    
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
    } as ApiResponse);
    
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      success: false,
      error: 'Demo login failed'
    } as ApiResponse);
  }
};

// Demo authentication middleware for development
export const demoAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      } as ApiResponse);
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.exp < Date.now()) {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        } as ApiResponse);
      }
      
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      } as ApiResponse);
    }
    
  } catch (error) {
    console.error('Demo authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    } as ApiResponse);
  }
};
