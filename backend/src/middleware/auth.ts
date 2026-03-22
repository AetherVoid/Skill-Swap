import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken, type JwtPayload } from "../lib/jwt.js";

export type AuthedRequest = Request & { user?: JwtPayload };

function authDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  void (async () => {
    try {
      if (authDisabled()) {
        const email = process.env.DEV_IMPERSONATE_EMAIL ?? "demo@skillswap.local";
        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user) {
          res.status(503).json({
            error:
              "DISABLE_AUTH is on but no demo user found. Run prisma db seed (demo@skillswap.local).",
          });
          return;
        }
        req.user = { sub: user.id, email: user.email };
        next();
        return;
      }

      const h = req.headers.authorization;
      const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
      if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      try {
        req.user = verifyAccessToken(token);
        next();
      } catch {
        res.status(401).json({ error: "Invalid token" });
      }
    } catch (e) {
      next(e);
    }
  })();
}
