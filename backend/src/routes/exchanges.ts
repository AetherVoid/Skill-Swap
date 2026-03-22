import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const createSchema = z.object({
  partnerUserId: z.string(),
  skillTheyTeachId: z.string(),
  skillTheyLearnId: z.string(),
  hoursAgreed: z.number().positive().max(8).default(1),
});

/** Requester is current user (user1). skillTheyTeach = what partner teaches me; skillTheyLearn = what I teach partner */
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const user1Id = req.user!.sub;
  const { partnerUserId: user2Id, skillTheyTeachId, skillTheyLearnId, hoursAgreed } = parsed.data;
  if (user1Id === user2Id) {
    res.status(400).json({ error: "Invalid partner" });
    return;
  }

  const ex = await prisma.exchange.create({
    data: {
      user1Id,
      user2Id,
      skillOfferedId: skillTheyLearnId,
      skillWantedId: skillTheyTeachId,
      hoursAgreed,
      status: "pending",
    },
  });
  res.status(201).json(ex);
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.user!.sub;
  const list = await prisma.exchange.findMany({
    where: {
      OR: [{ user1Id: uid }, { user2Id: uid }],
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      skillOffered: true,
      skillWanted: true,
      user1: { select: { id: true, name: true, email: true, district: true } },
      user2: { select: { id: true, name: true, email: true, district: true } },
    },
  });
  res.json(list);
});

router.get("/:id/messages", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.user!.sub;
  const id = String(req.params.id);
  const ex = await prisma.exchange.findFirst({
    where: {
      id,
      OR: [{ user1Id: uid }, { user2Id: uid }],
    },
  });
  if (!ex) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const messages = await prisma.message.findMany({
    where: { exchangeId: ex.id },
    orderBy: { sentAt: "asc" },
  });
  res.json(messages);
});

const msgSchema = z.object({ content: z.string().min(1).max(4000) });

router.post("/:id/messages", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = msgSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const uid = req.user!.sub;
  const id = String(req.params.id);
  const ex = await prisma.exchange.findFirst({
    where: {
      id,
      OR: [{ user1Id: uid }, { user2Id: uid }],
    },
  });
  if (!ex) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const msg = await prisma.message.create({
    data: {
      exchangeId: ex.id,
      senderId: uid,
      content: parsed.data.content,
      channel: "app",
    },
  });
  res.status(201).json(msg);
});

const patchSchema = z.object({
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  scheduleTime: z.string().datetime().optional(),
});

router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const uid = req.user!.sub;
  const id = String(req.params.id);
  const ex = await prisma.exchange.findFirst({
    where: {
      id,
      OR: [{ user1Id: uid }, { user2Id: uid }],
    },
  });
  if (!ex) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const data: {
    status?: "active" | "completed" | "cancelled";
    scheduleTime?: Date;
    completedAt?: Date | null;
  } = {};
  if (parsed.data.status) {
    data.status = parsed.data.status;
    if (parsed.data.status === "completed") data.completedAt = new Date();
  }
  if (parsed.data.scheduleTime) data.scheduleTime = new Date(parsed.data.scheduleTime);

  const updated = await prisma.exchange.update({
    where: { id: ex.id },
    data,
    include: { skillOffered: true, skillWanted: true },
  });
  res.json(updated);
});

export default router;
