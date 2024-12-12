import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import messageRoute from './routes/chat.route.js';

dotenv.config();

export const app: Application = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  })
);

await connectDB();

app.get('/', (req: Request, res: Response) => {
  res.status(200).send(`Server is working...`);
});

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/chat', messageRoute);

export default app;
