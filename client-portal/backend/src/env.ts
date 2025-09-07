import 'dotenv/config';


export const env = {
dbUrl: process.env.DATABASE_URL!,
accessSecret: process.env.JWT_ACCESS_SECRET!,
refreshSecret: process.env.JWT_REFRESH_SECRET!,
accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
refreshTtl: process.env.REFRESH_TOKEN_TTL || '7d',
appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
smtp: {
host: process.env.SMTP_HOST!,
port: Number(process.env.SMTP_PORT || 587),
user: process.env.SMTP_USER!,
pass: process.env.SMTP_PASS!,
from: process.env.SMTP_FROM || 'QTAX Portal <no-reply@qtax1.net>'
}
};