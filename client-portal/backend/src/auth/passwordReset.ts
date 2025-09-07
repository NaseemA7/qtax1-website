import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { env } from '../env';


const prisma = new PrismaClient();


function hash(token: string) {
return crypto.createHash('sha256').update(token).digest('hex');
}


export async function createPasswordReset(email: string) {
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return; // avoid leaking accounts
const token = nanoid(40);
const tokenHash = hash(token);
const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30m


await prisma.passwordResetToken.create({
data: { userId: user.id, tokenHash, expiresAt }
});


const link = `${env.appBaseUrl}/reset-password?token=${token}`;
const transporter = nodemailer.createTransport({
host: env.smtp.host,
port: env.smtp.port,
secure: false,
auth: { user: env.smtp.user, pass: env.smtp.pass }
});
await transporter.sendMail({
from: env.smtp.from,
to: email,
subject: 'Reset your QTAX Portal password',
text: `Reset link: ${link}`,
html: `<p>Click to reset: <a href="${link}">${link}</a></p>`
});
}


export async function verifyPasswordReset(token: string) {
const tokenHash = hash(token);
const row = await prisma.passwordResetToken.findFirst({
where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
include: { user: true }
});
return row;
}


export async function markUsed(id: string) {
await prisma.passwordResetToken.update({ where: { id }, data: { used: true } });
}