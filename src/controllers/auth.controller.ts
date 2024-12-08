import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { generateToken } from '../config/token.js';
import { sendMail } from '../config/mail.js';
import User from '../models/user.model.js';

export const signup = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid Email Format' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User Already Exists' });

    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const signupData = {
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpiry: Date.now() + 10 * 60 * 1000
    };
    const token = jwt.sign(signupData, process.env.JWT_AUTH!, { expiresIn: '10m' });

    res.cookie('signupData', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 10 * 60 * 1000
    });

    await sendMail(email, verificationCode);

    return res.status(200).json({
      message: 'Verification code sent. Please check your email'
    });
  } catch (error: any) {
    console.error(`Error in [signup]: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const signupVerify = async (req: Request, res: Response): Promise<any> => {
  const { verification_code } = req.body;

  try {
    const token = req.cookies.signupData;
    if (!token) return res.status(404).json({ error: 'Data not found' });

    let signupData: any = jwt.verify(token, process.env.JWT_AUTH!);
    if (!signupData) return res.status(400).json({ error: 'Invalid or expired token. Please start again.' });

    const { name, email, password, verificationCode, verificationCodeExpiry } = signupData;

    if (!verificationCode || verification_code !== verificationCode || Date.now() > verificationCodeExpiry)
      return res.status(400).json({ error: 'Invalid or expired verification code' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      res.clearCookie('signupData');

      const token = generateToken(user.id, res);
      const userResponse = user.toJSON();
      delete userResponse.password;

      return res.status(201).json({
        token,
        user: userResponse,
        message: 'Signup Successfully'
      });
    }
  } catch (error: any) {
    console.error(`Error in [signupComplete]: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User Not Found' });

    const isUserPasswordCorrect = await bcrypt.compare(password, user.password);

    if (user && isUserPasswordCorrect) {
      const token = generateToken(user.id, res);

      return res.status(200).json({
        message: 'Login Successfully',
        token,
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic
      });
    }

    return res.status(400).json({ error: 'Incorrect email or password' });
  } catch (error: any) {
    console.error(`Error in [login] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error(`Error in [logout] controller: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const checkAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    return res.status(200).json(req.user);
  } catch (error: any) {
    console.error(`Error in [authCheck] controller: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
