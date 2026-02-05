// User store using Prisma for persistent storage
// Phone number-based authentication (WhatsApp-style)

import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// User operations using Prisma
export async function createUser(phoneNumber: string, name: string = "User"): Promise<User> {
  const user = await prisma.user.create({
    data: {
      id: generateId(),
      phoneNumber,
      name,
      isVerified: true,
    },
  });
  console.log(`User created: ${phoneNumber}`);
  return user;
}

export async function findUserByPhone(phoneNumber: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { phoneNumber },
  });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// Get all users (for debugging)
export async function getAllUsers(): Promise<User[]> {
  return prisma.user.findMany();
}

// Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  await prisma.user.deleteMany();
}
