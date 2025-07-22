import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ success: false, error: 'Authentication token required.' });
  }

  if (token !== AUTH_TOKEN) {
    return res.status(403).json({ success: false, error: 'Invalid authentication token.' });
  }

  next();
};