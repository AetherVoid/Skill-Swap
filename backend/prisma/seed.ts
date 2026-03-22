import { PrismaClient, SkillCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_SKILLS: { nameEn: string; nameNy: string; category: SkillCategory }[] = [
  { nameEn: "Maize farming", nameNy: "Kulima chimanga", category: "agriculture" },
  { nameEn: "Vegetable gardening", nameNy: "Kulima masamba", category: "agriculture" },
  { nameEn: "English conversation", nameNy: "Kuyankhula Chingerezi", category: "language" },
  { nameEn: "Chichewa literacy", nameNy: "Kuwerenga Chichewa", category: "literacy" },
  { nameEn: "Smartphone repair", nameNy: "Kukonza foni", category: "tech" },
  { nameEn: "Mobile money basics", nameNy: "Mobile money", category: "tech" },
  { nameEn: "Carpentry", nameNy: "Kusoka", category: "trades" },
  { nameEn: "Tailoring", nameNy: "Kusoka zovala", category: "trades" },
  { nameEn: "Traditional dance", nameNy: "Magule", category: "arts" },
  { nameEn: "Small business bookkeeping", nameNy: "Mabuku a bizinesi", category: "business" },
  { nameEn: "First aid basics", nameNy: "Thandizo loyamba", category: "health" },
];

async function main() {
  for (const s of SEED_SKILLS) {
    await prisma.skillTaxonomy.upsert({
      where: { id: `seed-${s.nameEn.toLowerCase().replace(/\s+/g, "-")}` },
      create: {
        id: `seed-${s.nameEn.toLowerCase().replace(/\s+/g, "-")}`,
        nameEn: s.nameEn,
        nameNy: s.nameNy,
        category: s.category,
      },
      update: { nameEn: s.nameEn, nameNy: s.nameNy, category: s.category },
    });
  }

  const adminEmail = "admin@skillswap.local";
  const adminPass = process.env.ADMIN_SEED_PASSWORD ?? "admin123";
  const adminHash = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Platform Admin",
      district: "Lilongwe",
      role: "super_admin",
      passwordHash: adminHash,
    },
    update: { role: "super_admin", passwordHash: adminHash },
  });

  const demoEmail = "demo@skillswap.local";
  const demoPass = process.env.DEMO_USER_SEED_PASSWORD ?? "user123";
  const demoHash = await bcrypt.hash(demoPass, 10);
  const taxonomy = {
    english: "seed-english-conversation",
    phoneRepair: "seed-smartphone-repair",
  };

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      name: "Demo User",
      district: "Blantyre",
      role: "user",
      passwordHash: demoHash,
      language: "en",
      verifiedAt: new Date(),
      bio: "Dummy account for testing SkillSwap Malawi.",
    },
    update: {
      name: "Demo User",
      passwordHash: demoHash,
      role: "user",
      bio: "Dummy account for testing SkillSwap Malawi.",
    },
  });

  await prisma.userSkill.deleteMany({ where: { userId: demoUser.id } });
  await prisma.userSkill.createMany({
    data: [
      {
        userId: demoUser.id,
        skillTaxonomyId: taxonomy.english,
        proficiency: "can_teach",
        offered: true,
      },
      {
        userId: demoUser.id,
        skillTaxonomyId: taxonomy.phoneRepair,
        proficiency: "beginner",
        offered: false,
      },
    ],
  });

  await prisma.creditTransaction.deleteMany({ where: { userId: demoUser.id } });
  await prisma.creditTransaction.create({
    data: {
      userId: demoUser.id,
      type: "earn",
      amountHours: 5,
    },
  });

  console.log("Seeded skill taxonomy.");
  console.log("  Admin:", adminEmail, "(password: ADMIN_SEED_PASSWORD or admin123)");
  console.log("  Demo user:", demoEmail, "(password: DEMO_USER_SEED_PASSWORD or user123)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
