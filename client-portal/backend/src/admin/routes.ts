import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { env } from '../env';
import { requireAuth, requireRoles } from '../auth/guards';

const prisma = new PrismaClient();
export const adminRouter = Router();

adminRouter.use(requireAuth, requireRoles('ADMIN', 'SUPER_ADMIN'));

// GET /admin/users → list all users
adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
});

// POST /admin/invite → send invite
adminRouter.post('/invite', async (req, res) => {
  const { email, role, businessId } = req.body as {
    email: string;
    role: Role;
    businessId?: string | null;
  };

  if (!email || !role) return res.status(400).json({ error: 'email and role are required' });
  if (!Object.values(Role).includes(role)) return res.status(400).json({ error: 'invalid role' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.inviteToken.create({
    data: { email, role, businessId: businessId ?? null, tokenHash, expiresAt },
  });

  const link = `${env.appBaseUrl}/accept-invite?token=${raw}`;

  // Log for local dev
  console.log('Invite link for', email, '→', link);

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: email,
      subject: 'You’re invited to the QTAX Client Portal',
      html: `<p>You were invited as <b>${role}</b>.</p><p><a href="${link}">Accept Invite</a></p><p>Or paste this link: ${link}</p>`,
    });
  } catch (e) {
    console.warn('SMTP send failed (dev ok):', (e as any)?.message);
  }

  res.json({ ok: true });
});
