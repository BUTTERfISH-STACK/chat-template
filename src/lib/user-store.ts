// In-memory user store to replace Prisma database
// Phone number-based authentication (WhatsApp-style)

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage
const users: Map<string, User> = new Map();

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// User operations
export function createUser(phoneNumber: string, name: string = "User"): User {
  const user: User = {
    id: generateId(),
    phoneNumber,
    name,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(phoneNumber, user);
  console.log(`User created: ${phoneNumber}`);
  return user;
}

export function findUserByPhone(phoneNumber: string): User | undefined {
  return users.get(phoneNumber);
}

export function findUserById(id: string): User | undefined {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return undefined;
}

export function updateUser(id: string, data: Partial<User>): User | undefined {
  for (const [phoneNumber, user] of users.entries()) {
    if (user.id === id) {
      const updatedUser = {
        ...user,
        ...data,
        id: user.id, // Preserve ID
        phoneNumber: user.phoneNumber, // Preserve phone number
        createdAt: user.createdAt, // Preserve creation date
        updatedAt: new Date(),
      };
      users.set(phoneNumber, updatedUser);
      return updatedUser;
    }
  }
  return undefined;
}

// Get all users (for debugging)
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

// Clear all data (for testing)
export function clearAllData(): void {
  users.clear();
}
