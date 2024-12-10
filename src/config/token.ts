import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (id: string, res: Response) => {
  const token: string = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '15d'
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV !== 'development'
  });

  return token;
};
