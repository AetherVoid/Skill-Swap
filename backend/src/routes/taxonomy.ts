import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  const skills = await prisma.skillTaxonomy.findMany({ orderBy: [{ category: "asc" }, { nameEn: "asc" }] });
  res.json(skills);
});

export default router;
