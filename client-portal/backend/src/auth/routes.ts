import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../env';
import { signAccess, signRefresh, verifyRefresh } from './jwt';
import { createPasswordReset, verifyPasswordReset, markUsed } from './passwordReset';

const prisma = new PrismaClient();
export const authRouter = Router();

/**
 * POST /auth/login
 * body: { email, password }
 * returns: { accessToken, refreshToken, role }
 */
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccess({ id: user.id, role: user.role });
  const refreshToken = signRefresh({ id: user.id, role: user.role });

  return res.json({ accessToken, refreshToken, role: user.role });
});

/**
 * POST /auth/refresh
 * body: { refreshToken }
 * returns: { accessToken, refreshToken }
 */
authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh token' });

  try {
    const payload = verifyRefresh(refreshToken) as any;
    const access = signAccess({ id: payload.id, role: payload.role });
    const refresh = signRefresh({ id: payload.id, role: payload.role });
    return res.json({ accessToken: access, refreshToken: refresh });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /auth/logout
 * (stateless JWT; placeholder to align with client expectations)
 */
authRouter.post('/logout', async (_req, res) => {
  return res.json({ ok: true });
});

/**
 * POST /auth/forgot-password
 * body: { email }
 * Always returns ok (don’t leak accounts); sends reset email if user exists.
 */
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: 'Missing email' });
  await createPasswordReset(email);
  return res.json({ ok: true });
});

/**
 * POST /auth/reset-password
 * body: { token, newPassword }
 */
authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body as { token: string; newPassword: string };
  if (!token || !newPassword) return res.status(400).json({ error: 'Missing token or password' });

  const row = await verifyPasswordReset(token);
  if (!row) return res.status(400).json({ error: 'Invalid/expired token' });

  const hash = await argon2.hash(newPassword);
  await prisma.user.update({ where: { id: row.userId }, data: { passwordHash: hash } });
  await markUsed(row.id);

  return res.json({ ok: true });
});

/**
 * DEV ONLY: seed super admin (remove in prod)
 * POST /auth/seed-super-admin
 * body: { email, password }
 */
authRouter.post('/seed-super-admin', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.json({ ok: true, existed: true });

  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: Role.SUPER_ADMIN },
  });

  return res.json({ ok: true, id: user.id });
});

/**
 * POST /auth/accept-invite
 * body: { token, password }
 * Creates a user from a valid invite and marks invite used.
 */
authRouter.post('/accept-invite', async (req, res) => {
  const { token, password } = req.body as { token: string; password: string };
  if (!token || !password) return res.status(400).json({ error: 'token and password required' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const invite = await prisma.inviteToken.findFirst({
    where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
  });
  if (!invite) return res.status(400).json({ error: 'Invalid or expired invite' });

  const exists = await prisma.user.findUnique({ where: { email: invite.email } });
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const passwordHash = await argon2.hash(password);
  await prisma.user.create({
    data: { email: invite.email, passwordHash, role: invite.role },
  });

  await prisma.inviteToken.update({
    where: { tokenHash },
    data: { used: true },
  });

  return res.json({ ok: true });
});

export { };
