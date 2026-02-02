import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For development without database, we use a mock
const useMockDb = process.env.USE_MOCK_DB === 'true' || !process.env.DATABASE_URL;

let prisma: any;

if (useMockDb) {
  // Mock Prisma client for development
  prisma = {
    user: {
      findUnique: async () => null,
      create: async (data: any) => ({ id: 'mock-user-id', ...data.data }),
    },
    oTP: {
      findUnique: async () => null,
      upsert: async (data: any) => ({ id: 'mock-otp-id', ...data }),
      update: async () => ({}),
    },
    conversation: {
      findMany: async () => [],
      findFirst: async () => null,
      create: async (data: any) => ({ id: 'mock-conv-id', ...data }),
      update: async () => ({}),
    },
    conversationParticipant: {
      findFirst: async () => null,
      create: async (data: any) => ({ id: 'mock-participant-id', ...data }),
    },
    message: {
      findMany: async () => [],
      create: async (data: any) => ({ id: 'mock-msg-id', ...data }),
    },
    store: {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (data: any) => ({ id: 'mock-store-id', ...data }),
    },
    product: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async (data: any) => ({ id: 'mock-product-id', ...data }),
    },
    order: {
      create: async (data: any) => ({ id: 'mock-order-id', ...data }),
    },
    orderItem: {
      create: async (data: any) => ({ id: 'mock-order-item-id', ...data }),
    },
    review: {
      create: async (data: any) => ({ id: 'mock-review-id', ...data }),
    },
  };
} else {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
