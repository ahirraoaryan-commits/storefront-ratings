import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const password = "DemoPass!1";

const upsertUser = async (
  name: string,
  email: string,
  address: string,
  role: "ADMIN" | "NORMAL_USER" | "STORE_OWNER",
) =>
  prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      address,
      role,
      emailVerified: true,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

const main = async () => {
  const admin = await upsertUser(
    "Ananya Mehta Administrator",
    "admin@shoppulse.local",
    "22 Residency Road, Bengaluru, Karnataka 560025",
    "ADMIN",
  );
  const owner = await upsertUser(
    "Kabir Nair Store Owner",
    "owner@shoppulse.local",
    "17 Indiranagar 100 Feet Road, Bengaluru, Karnataka 560038",
    "STORE_OWNER",
  );
  const customer = await upsertUser(
    "Ishita Rao Customer User",
    "customer@shoppulse.local",
    "9 Jayanagar 4th Block, Bengaluru, Karnataka 560011",
    "NORMAL_USER",
  );

  const store = await prisma.store.upsert({
    where: { email: "hello@urbanbasket.local" },
    update: {},
    create: {
      name: "Urban Basket",
      email: "hello@urbanbasket.local",
      address: "31 Church Street, Bengaluru, Karnataka 560001",
      ownerId: owner.id,
    },
  });
  await prisma.store.upsert({
    where: { email: "care@techharbor.local" },
    update: {},
    create: {
      name: "Tech Harbor",
      email: "care@techharbor.local",
      address: "44 Commercial Street, Bengaluru, Karnataka 560001",
    },
  });
  await prisma.rating.upsert({
    where: { userId_storeId: { userId: customer.id, storeId: store.id } },
    update: {},
    create: { userId: customer.id, storeId: store.id, value: 4 },
  });

  console.info(`Seeded ${admin.email}, ${owner.email}, and ${customer.email}.`);
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
