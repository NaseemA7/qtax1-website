import express from 'express';
import cors from 'cors';
import { authRouter } from './auth/routes';
import { adminRouter } from './admin/routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
});
