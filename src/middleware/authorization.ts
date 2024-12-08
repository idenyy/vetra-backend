import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import User from '../models/user.model.js';

export const authorization = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '') || req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    if (!decoded) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    const user = await User.findOne({ where: { id: decoded.id }, attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'Unauthorized: User Not Found' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in token verification: ', error);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
