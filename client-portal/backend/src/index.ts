import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './auth/routes';


const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRouter);


app.listen(4000, () => console.log('API on http://localhost:4000'));