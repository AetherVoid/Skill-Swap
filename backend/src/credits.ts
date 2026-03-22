import type { PrismaClient, CreditTxType } from "@prisma/client";

function signedAmount(type: CreditTxType, amountHours: number): number {
  switch (type) {
    case "earn":
    case "release":
    case "refund":
      return amountHours;
    case "spend":
    case "escrow":
      return -amountHours;
    default:
      return 0;
  }
}

/** Append-only ledger: balance = sum of signed amounts per user */
export async function getCreditBalance(prisma: PrismaClient, userId: string): Promise<number> {
  const rows = await prisma.creditTransaction.findMany({
    where: { userId },
    select: { type: true, amountHours: true },
  });
  const sum = rows.reduce((acc, r) => acc + signedAmount(r.type, r.amountHours), 0);
  return Math.round(sum * 1000) / 1000;
}
