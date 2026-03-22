import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken } from "../lib/jwt.js";

const router = Router();

function normalizeEmail(e: string): string {
  return e.trim().toLowerCase();
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(120),
  district: z.string().min(1),
  language: z.enum(["en", "ny"]).optional(),
  phone: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const email = normalizeEmail(parsed.data.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const phone = parsed.data.phone?.trim() ? parsed.data.phone.trim() : null;

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      name: parsed.data.name,
      district: parsed.data.district,
      passwordHash,
      language: parsed.data.language ?? "en",
    },
  });

  const payload = { sub: user.id, email: user.email };
  res.status(201).json({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      district: user.district,
      role: user.role,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!user.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { sub: user.id, email: user.email };
  res.json({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      district: user.district,
      role: user.role,
    },
  });
});

export default router;
