import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-only";

export type JwtPayload = { sub: string; email: string };

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
