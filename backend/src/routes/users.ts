import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { getCreditBalance } from "../credits.js";

const router = Router();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const id = req.user!.sub;
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: {
      userSkills: { include: { skillTaxonomy: true } },
    },
  });
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const balance = await getCreditBalance(prisma, id);
  const { passwordHash: _omitPwd, ...rest } = user;
  res.json({ ...rest, creditBalance: balance });
});

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(2000).optional(),
  district: z.string().min(1).optional(),
  language: z.enum(["en", "ny"]).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const id = req.user!.sub;
  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    include: { userSkills: { include: { skillTaxonomy: true } } },
  });
  const { passwordHash: _, ...rest } = user;
  res.json(rest);
});

const skillsBodySchema = z.object({
  offered: z.array(
    z.object({
      skillTaxonomyId: z.string(),
      proficiency: z.enum(["beginner", "can_teach", "expert"]),
    })
  ),
  wanted: z.array(
    z.object({
      skillTaxonomyId: z.string(),
      proficiency: z.enum(["beginner", "can_teach", "expert"]),
    })
  ),
});

router.put("/me/skills", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = skillsBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const userId = req.user!.sub;

  await prisma.$transaction(async (tx) => {
    await tx.userSkill.deleteMany({ where: { userId } });
    const rows = [
      ...parsed.data.offered.map((s) => ({
        userId,
        skillTaxonomyId: s.skillTaxonomyId,
        proficiency: s.proficiency,
        offered: true,
      })),
      ...parsed.data.wanted.map((s) => ({
        userId,
        skillTaxonomyId: s.skillTaxonomyId,
        proficiency: s.proficiency,
        offered: false,
      })),
    ];
    if (rows.length) await tx.userSkill.createMany({ data: rows });
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userSkills: { include: { skillTaxonomy: true } } },
  });
  res.json(user);
});

export default router;
