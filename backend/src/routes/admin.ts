import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, type AdminRequest } from "../middleware/requireAdmin.js";

const router = Router();
router.use(requireAdmin);

function parseRange(req: { query: Record<string, unknown> }) {
  const start = Math.max(0, Number(req.query._start) || 0);
  const end = Math.max(start, Number(req.query._end) || start + 25);
  const take = Math.min(500, end - start);
  const sortField = typeof req.query._sort === "string" ? req.query._sort : "createdAt";
  const order = req.query._order === "ASC" ? "asc" : "desc";
  return { skip: start, take, sortField, order: order as "asc" | "desc" };
}

router.get("/overview", async (_req, res) => {
  const [users, exchanges, completed, openDisputes] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.exchange.count({ where: { deletedAt: null } }),
    prisma.exchange.count({ where: { status: "completed", deletedAt: null } }),
    prisma.dispute.count({ where: { status: "open" } }),
  ]);
  res.json({
    totalUsers: users,
    totalExchanges: exchanges,
    completedExchanges: completed,
    openDisputes,
  });
});

router.get("/users", async (req: AdminRequest, res) => {
  const { skip, take, sortField, order } = parseRange(req);
  const sortKey = ["createdAt", "name", "district", "email", "phone", "role", "averageRating"].includes(
    sortField
  )
    ? sortField
    : "createdAt";
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { [sortKey]: order },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        district: true,
        role: true,
        averageRating: true,
        ratingCount: true,
        verifiedAt: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);
  res.setHeader("X-Total-Count", String(total));
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
  res.json(rows);
});

router.get("/users/:id", async (req, res) => {
  const u = await prisma.user.findFirst({
    where: { id: req.params.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      district: true,
      role: true,
      bio: true,
      averageRating: true,
      ratingCount: true,
      verifiedAt: true,
      createdAt: true,
      userSkills: { include: { skillTaxonomy: true } },
    },
  });
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(u);
});

router.get("/exchanges", async (req, res) => {
  const { skip, take, sortField, order } = parseRange(req);
  const sortKey = ["createdAt", "status", "hoursAgreed"].includes(sortField) ? sortField : "createdAt";
  const [rows, total] = await Promise.all([
    prisma.exchange.findMany({
      where: { deletedAt: null },
      orderBy: { [sortKey]: order },
      skip,
      take,
      include: {
        user1: { select: { id: true, name: true, email: true, phone: true, district: true } },
        user2: { select: { id: true, name: true, email: true, phone: true, district: true } },
        skillOffered: { select: { id: true, nameEn: true } },
        skillWanted: { select: { id: true, nameEn: true } },
      },
    }),
    prisma.exchange.count({ where: { deletedAt: null } }),
  ]);
  res.setHeader("X-Total-Count", String(total));
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
  res.json(rows);
});

export default router;
