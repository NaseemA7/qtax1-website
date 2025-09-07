import jwt from 'jsonwebtoken';
import { env } from '../env';


type JwtPayload = { id: string; role: string };


export function signAccess(payload: JwtPayload) {
return jwt.sign(payload, env.accessSecret, { expiresIn: env.accessTtl });
}
export function signRefresh(payload: JwtPayload) {
return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshTtl });
}
export function verifyAccess(token: string) {
return jwt.verify(token, env.accessSecret) as JwtPayload;
}
export function verifyRefresh(token: string) {
return jwt.verify(token, env.refreshSecret) as JwtPayload;
}