import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (_id: any, res: Response) => {
  const token: string = jwt.sign({ _id }, process.env.JWT_SECRET as string, {
    expiresIn: '15d'
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    partitioned: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV !== 'development'
  });

  return token;
};
