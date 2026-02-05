// In-memory user store to replace Prisma database
// WhatsApp-style phone number authentication

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

interface OTP {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory storage
const users: Map<string, User> = new Map();
const otps: Map<string, OTP> = new Map();

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

// OTP operations
export function addOtp(phoneNumber: string, otp: string, expiresInMinutes: number = 5): void {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  // Remove existing OTP for this phone number
  otps.delete(phoneNumber);
  
  const otpData: OTP = {
    phoneNumber,
    otp,
    expiresAt,
    createdAt: new Date(),
  };
  
  otps.set(phoneNumber, otpData);
  console.log(`OTP stored for ${phoneNumber}: ${otp} (expires at ${expiresAt.toISOString()})`);
}

export function getOtp(phoneNumber: string): string | null {
  const otpData = otps.get(phoneNumber);
  
  if (!otpData) {
    console.log(`No OTP found for ${phoneNumber}`);
    return null;
  }
  
  if (new Date() > otpData.expiresAt) {
    console.log(`OTP expired for ${phoneNumber}`);
    otps.delete(phoneNumber);
    return null;
  }
  
  return otpData.otp;
}

export function removeOtp(phoneNumber: string): void {
  otps.delete(phoneNumber);
  console.log(`OTP removed for ${phoneNumber}`);
}

// Get all users (for debugging)
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

// Clear all data (for testing)
export function clearAllData(): void {
  users.clear();
  otps.clear();
}
