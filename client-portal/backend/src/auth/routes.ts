import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';
import { signAccess, signRefresh, verifyRefresh } from './jwt';
import { createPasswordReset, verifyPasswordReset, markUsed } from './passwordReset';


const prisma = new PrismaClient();
export const authRouter = Router();


authRouter.post('/login', async (req, res) => {
const { email, password } = req.body;
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const ok = await argon2.verify(user.passwordHash, password);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
const access = signAccess({ id: user.id, role: user.role });
const refresh = signRefresh({ id: user.id, role: user.role });
return res.json({ accessToken: access, refreshToken: refresh, role: user.role });
});


authRouter.post('/refresh', async (req, res) => {
const { refreshToken } = req.body;
try {
const payload = verifyRefresh(refreshToken) as any;
const access = signAccess({ id: payload.id, role: payload.role });
const refresh = signRefresh({ id: payload.id, role: payload.role });
return res.json({ accessToken: access, refreshToken: refresh });
} catch {
return res.status(401).json({ error: 'Invalid refresh' });
}
});


authRouter.post('/forgot-password', async (req, res) => {
const { email } = req.body;
await createPasswordReset(email);
return res.json({ ok: true });
});


authRouter.post('/reset-password', async (req, res) => {
const { token, newPassword } = req.body;
const row = await verifyPasswordReset(token);
if (!row) return res.status(400).json({ error: 'Invalid/expired token' });
const hash = await argon2.hash(newPassword);
await prisma.user.update({ where: { id: row.userId }, data: { passwordHash: hash } });
await markUsed(row.id);
return res.json({ ok: true });
});


// Example seed endpoint (remove in prod!) to create an initial super admin
authRouter.post('/seed-super-admin', async (req, res) => {
const { email, password } = req.body;
const exists = await prisma.user.findUnique({ where: { email } });
if (exists) return res.json({ ok: true, existed: true });
const passwordHash = await argon2.hash(password);
const user = await prisma.user.create({ data: { email, passwordHash, role: Role.SUPER_ADMIN } });
res.json({ ok: true, id: user.id });
});