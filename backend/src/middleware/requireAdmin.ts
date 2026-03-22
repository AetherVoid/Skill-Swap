import type { Response, NextFunction } from "express";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AuthedRequest } from "./auth.js";

export type AdminRequest = AuthedRequest & { adminUser?: User };

const ALLOWED = new Set(["super_admin", "moderator"]);

function authDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): void {
  void (async () => {
    try {
      if (authDisabled()) {
        const preferredEmail = process.env.ADMIN_IMPERSONATE_EMAIL ?? "admin@skillswap.local";
        let user = await prisma.user.findFirst({
          where: { email: preferredEmail, deletedAt: null },
        });
        if (!user || !ALLOWED.has(user.role)) {
          user = await prisma.user.findFirst({
            where: { role: "super_admin", deletedAt: null },
          });
        }
        if (!user || !ALLOWED.has(user.role)) {
          res.status(503).json({
            error:
              "DISABLE_AUTH is on but no admin user found. Run prisma db seed (admin@skillswap.local).",
          });
          return;
        }
        req.adminUser = user;
        next();
        return;
      }

      const h = req.headers.authorization;
      const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
      if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      let sub: string;
      try {
        sub = verifyAccessToken(token).sub;
      } catch {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      const user = await prisma.user.findFirst({ where: { id: sub, deletedAt: null } });
      if (!user || !ALLOWED.has(user.role)) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }
      req.adminUser = user;
      next();
    } catch (e) {
      next(e);
    }
  })();
}
