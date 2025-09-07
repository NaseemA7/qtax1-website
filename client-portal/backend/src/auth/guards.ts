import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env';


export function requireAuth(req: Request, res: Response, next: NextFunction) {
const header = req.headers.authorization;
const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
if (!token) return res.status(401).json({ error: 'Unauthorized' });
try {
const payload = jwt.verify(token, env.accessSecret) as any;
(req as any).user = payload; // { id, role }
next();
} catch {
return res.status(401).json({ error: 'Invalid token' });
}
}


export function requireRoles(...roles: string[]) {
return (req: Request, res: Response, next: NextFunction) => {
const user = (req as any).user;
if (!user || !roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
next();
};
}