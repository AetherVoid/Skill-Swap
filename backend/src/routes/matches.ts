import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

/** Rule-based MVP: users who offer a skill I want and want a skill I offer, same district first */
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const meId = req.user!.sub;
  const { district, q } = req.query as { district?: string; q?: string };

  const me = await prisma.user.findUnique({
    where: { id: meId },
    include: { userSkills: true },
  });
  if (!me) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const myOfferIds = new Set(me.userSkills.filter((s) => s.offered).map((s) => s.skillTaxonomyId));
  const myWantIds = new Set(me.userSkills.filter((s) => !s.offered).map((s) => s.skillTaxonomyId));
  if (myOfferIds.size === 0 || myWantIds.size === 0) {
    res.json({ matches: [], hint: "Add at least one offered and one wanted skill" });
    return;
  }

  const others = await prisma.user.findMany({
    where: {
      id: { not: meId },
      deletedAt: null,
      ...(district ? { district } : {}),
    },
    include: { userSkills: { include: { skillTaxonomy: true } } },
    take: 100,
  });

  type MatchRow = {
    user: (typeof others)[0];
    score: number;
    mutualSkills: string[];
  };

  const matches: MatchRow[] = [];
  for (const u of others) {
    const theyOffer = u.userSkills.filter((s) => s.offered).map((s) => s.skillTaxonomyId);
    const theyWant = u.userSkills.filter((s) => !s.offered).map((s) => s.skillTaxonomyId);
    const iTeachTheyWant = theyWant.filter((id) => myOfferIds.has(id));
    const theyTeachIWant = theyOffer.filter((id) => myWantIds.has(id));
    if (iTeachTheyWant.length === 0 || theyTeachIWant.length === 0) continue;

    let score = iTeachTheyWant.length * 10 + theyTeachIWant.length * 10;
    if (u.district === me.district) score += 5;
    if (u.verifiedAt) score += 3;
    score += Math.min(5, u.averageRating);

    const mutualSkills = [...new Set([...iTeachTheyWant, ...theyTeachIWant])];
    if (q) {
      const ql = q.toLowerCase();
      const hit = u.name.toLowerCase().includes(ql) ||
        u.district.toLowerCase().includes(ql) ||
        u.userSkills.some((s) => s.skillTaxonomy.nameEn.toLowerCase().includes(ql));
      if (!hit) continue;
    }

    matches.push({ user: u, score, mutualSkills });
  }

  matches.sort((a, b) => b.score - a.score);
  res.json({
    matches: matches.slice(0, 50).map((m) => ({
      id: m.user.id,
      name: m.user.name,
      district: m.user.district,
      averageRating: m.user.averageRating,
      ratingCount: m.user.ratingCount,
      verified: !!m.user.verifiedAt,
      score: m.score,
      mutualSkills: m.mutualSkills,
      skills: m.user.userSkills,
    })),
  });
});

export default router;
