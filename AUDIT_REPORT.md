# Production Readiness Audit Report

## Executive Summary

The `chat-template` project (Vellon) is a Next.js 16 application with a mock in-memory database. It requires significant work to achieve production readiness, particularly in implementing a real database (Prisma is installed but not configured), completing the authentication system, and connecting API routes to persistent storage.

---

## 1. Database Analysis

### Current State: **NO PRISMA SCHEMA EXISTS**

- ❌ `chat-template/prisma/schema.prisma` - **DOES NOT EXIST**
- ❌ `chat-template/prisma.config.ts` - **DOES NOT EXIST**
- ✅ `Prisma` is listed in `devDependencies` (version 7.3.0)

### Mock Database Implementation
The project uses an in-memory mock database defined in [`src/lib/db.ts`](chat-template/src/lib/db.ts):

```typescript
export const mockDb = {
  users: new Map<string, any>(),
  conversations: new Map<string, any>(),
  conversationParticipants: new Map<string, any>(),
  messages: new Map<string, any>(),
  stores: new Map<string, any>(),
  products: new Map<string, any>(),
  orders: new Map<string, any>(),
  orderItems: new Map<string, any>(),
  reviews: new Map<string, any>(),
};
```

### Required Database Models
The following Prisma schema models need to be created:

```prisma
// Users & Authentication
model User {
  id            String    @id @default(cuid())
  phoneNumber   String    @unique
  email         String?   @unique
  name          String?
  avatar        String?
  bio           String?
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  conversations    ConversationParticipant[]
  sentMessages     Message[] @relation("SentMessages")
  stores           Store[]
  orders           Order[]
  reviews          Review[]
}

// Conversations
model Conversation {
  id            String    @id @default(cuid())
  name          String?
  type          String    @default("DIRECT") // DIRECT, GROUP
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  participants  ConversationParticipant[]
  messages      Message[]
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  userId         String
  conversationId String
  joinedAt       DateTime     @default(now())
  lastReadAt     DateTime?
  
  user           User         @relation(fields: [userId], references: [id])
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  
  @@unique([userId, conversationId])
}

// Messages
model Message {
  id             String       @id @default(cuid())
  content        String
  type           String       @default("TEXT") // TEXT, IMAGE, VIDEO, DOCUMENT
  mediaUrl       String?
  senderId       String
  conversationId String
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())
  
  sender         User         @relation("SentMessages", fields: [senderId], references: [id])
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}

// Marketplace
model Store {
  id          String    @id @default(cuid())
  name        String
  description String?
  logo        String?
  phone       String
  email       String
  address     String?
  ownerId     String
  rating      Float     @default(0)
  totalSales  Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  owner       User      @relation(fields: [ownerId], references: [id])
  products    Product[]
  orders      Order[]
}

model Product {
  id          String    @id @default(cuid())
  name        String
  description String?
  price       Float
  image       String?
  category    String
  stock       Int       @default(0)
  storeId     String
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  store       Store     @relation(fields: [storeId], references: [id])
  orderItems  OrderItem[]
  reviews     Review[]
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  storeId     String
  total       Float
  status      String      @default("PENDING") // PENDING, COMPLETED, CANCELLED
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  user        User        @relation(fields: [userId], references: [id])
  store       Store       @relation(fields: [storeId], references: [id])
  items       OrderItem[]
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  
  order     Order    @relation(fields: [orderId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  productId String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
}
```

---

## 2. Mock Data Identification

### Files with Hardcoded/Mock Data

#### UI Pages with Empty Data Structures

| File | Mock Data | Status |
|------|-----------|--------|
| [`src/app/chat/page.tsx`](chat-template/src/app/chat/page.tsx:35) | `const mockConversations: Conversation[] = []` | **Empty - needs API integration** |
| [`src/app/marketplace/page.tsx`](chat-template/src/app/marketplace/page.tsx:38) | `const products: Product[] = []` | **Empty - needs API integration** |
| [`src/app/profile/page.tsx`](chat-template/src/app/profile/page.tsx:11) | `const user = { name: "", username: "", ... }` | **Empty - needs API integration** |

#### API Routes with Hardcoded Mock Data

| File | Mock Data | Status |
|------|-----------|--------|
| [`src/app/api/marketplace/products/route.ts`](chat-template/src/app/api/marketplace/products/route.ts:25) | `const mockProducts = [...]` (3 items) | **Needs DB connection** |
| [`src/app/api/marketplace/stores/route.ts`](chat-template/src/app/api/marketplace/stores/route.ts:24) | `const mockStores = [...]` (2 items) | **Needs DB connection** |
| [`src/lib/api.ts`](chat-template/src/lib/api.ts) | Mock chat messages (lines 77-124) | **Deprecated - should be removed** |

---

## 3. API Route Review

### All API Routes Using Mock Database

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| [`/api/chat/conversations`](chat-template/src/app/api/chat/conversations/route.ts) | GET, POST | ❌ Mock | Uses `mockDb` in-memory maps |
| [`/api/chat/messages`](chat-template/src/app/api/chat/messages/route.ts) | GET, POST | ❌ Mock | Uses `mockDb` in-memory maps |
| [`/api/marketplace/products`](chat-template/src/app/api/marketplace/products/route.ts) | GET, POST | ❌ Hybrid | Has mock data + `mockDb` |
| [`/api/marketplace/stores`](chat-template/src/app/api/marketplace/stores/route.ts) | GET, POST | ❌ Hybrid | Has mock data + `mockDb` |
| [`/api/whatsapp/qr`](chat-template/src/app/api/whatsapp/qr/route.ts) | GET | ⚠️ External | Proxies to Express OTP server |
| [`/api/tophot`](chat-template/src/app/api/tophot/route.ts) | GET | ❌ Not reviewed | Unknown implementation |

### Common Pattern in API Routes
All routes follow this pattern for authentication:

```typescript
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = Array.from(mockDb.users.values()).find((u: any) => u.id === decoded.userId);
    return user;
  } catch {
    return null;
  }
}
```

**Issue**: This relies on `mockDb.users` which is empty and in-memory.

---

## 4. Authentication System Status

### Current Implementation: **SESSION-BASED MOCK AUTH**

#### Auth Context ([`src/lib/auth-context.tsx`](chat-template/src/lib/auth-context.tsx))

| Feature | Status | Notes |
|---------|--------|-------|
| Provider | ✅ Exists | `AuthProvider` wraps app |
| Login | ✅ Works | Creates session storage entry |
| Logout | ✅ Works | Clears session storage |
| Session Persistence | ⚠️ Partial | Uses `sessionStorage` (lost on tab close) |
| JWT Integration | ⚠️ Partial | Generates token but not persisted properly |
| Protected Routes | ❌ Missing | No middleware protection |
| Login Page | ❌ Missing | No login UI exists |
| OTP Integration | ⚠️ External | Express server at port 3001 |

#### Authentication Gaps

1. **No Login Page** - Login page doesn't exist in the codebase
2. **No OTP Verification Page** - No OTP verification UI
3. **Session Storage Only** - Uses `sessionStorage` instead of `localStorage` or cookies
4. **No Auth Middleware** - No route protection middleware
5. **Hardcoded JWT Secret** - `JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'`
6. **No User Registration** - No flow to create users in the database

---

## 5. Dependencies Review

### Current package.json Analysis

#### Installed Dependencies

| Package | Version | Production Ready? | Notes |
|---------|---------|-------------------|-------|
| `next` | ^16.1.6 | ✅ Yes | Latest Next.js |
| `react` | ^19.0.0 | ✅ Yes | Latest React |
| `tailwindcss` | ^3.4.17 | ✅ Yes | Stable |
| `@whiskeysockets/baileys` | ^6.7.2 | ⚠️ External | WhatsApp integration |
| `qrcode` | ^1.5.3 | ✅ Yes | QR code generation |
| `jsonwebtoken` | ^9.0.2 | ✅ Yes | JWT handling |
| `redis` | ^4.6.12 | ⚠️ Not Used | Caching (not configured) |
| `prisma` | ^7.3.0 | ❌ Not Configured | Installed but no schema |

#### Missing Critical Dependencies

| Package | Purpose | Recommended |
|---------|---------|-------------|
| `@prisma/client` | Prisma ORM client | `npm install @prisma/client` |
| `next-auth` | Full authentication | `npm install next-auth` |
| `bcryptjs` | Password hashing | `npm install bcryptjs` |
| `zod` | Runtime validation | `npm install zod` |
| `react-hook-form` | Form handling | `npm install react-hook-form` |

---

## 6. Work Required Summary

### Priority 1: Database & Backend (Week 1)

- [ ] Create Prisma schema with all models
- [ ] Configure Prisma with database provider (PostgreSQL/MySQL)
- [ ] Generate Prisma client
- [ ] Migrate all `mockDb` operations to Prisma queries
- [ ] Create seed script for initial data

### Priority 2: Authentication (Week 1-2)

- [ ] Create login page UI
- [ ] Create OTP verification page
- [ ] Implement proper JWT cookie-based auth
- [ ] Add auth middleware for protected routes
- [ ] Create user registration flow

### Priority 3: API Integration (Week 2)

- [ ] Connect all API routes to Prisma
- [ ] Remove hardcoded mock data from routes
- [ ] Add proper error handling
- [ ] Implement pagination for lists

### Priority 4: Frontend Data Integration (Week 2-3)

- [ ] Add data fetching to chat page
- [ ] Add data fetching to marketplace page
- [ ] Add data fetching to profile page
- [ ] Implement loading states
- [ ] Add error boundaries

---

## Architecture Diagram

```mermaid
graph TD
    subgraph Frontend
        A[Next.js App] --> B[AuthContext]
        B --> C[Chat Page]
        B --> D[Marketplace Page]
        B --> E[Profile Page]
    end
    
    subgraph API Layer
        C --> F[/api/chat/conversations]
        C --> G[/api/chat/messages]
        D --> H[/api/marketplace/products]
        D --> I[/api/marketplace/stores]
    end
    
    subgraph Current State
        F --> J[mockDb in-memory]
        G --> J
        H --> J
        I --> J
    end
    
    subgraph Target State
        F --> K[Prisma ORM]
        G --> K
        H --> K
        I --> K
        K --> L[(Database)]
    end
```

---

## Files to Reference

| File | Purpose |
|------|---------|
| [`chat-template/src/lib/db.ts`](chat-template/src/lib/db.ts) | Mock database implementation |
| [`chat-template/src/lib/auth-context.tsx`](chat-template/src/lib/auth-context.tsx) | Auth provider |
| [`chat-template/src/app/api/chat/conversations/route.ts`](chat-template/src/app/api/chat/conversations/route.ts) | Conversations API |
| [`chat-template/src/app/api/chat/messages/route.ts`](chat-template/src/app/api/chat/messages/route.ts) | Messages API |
| [`chat-template/src/app/api/marketplace/products/route.ts`](chat-template/src/app/api/marketplace/products/route.ts) | Products API |
| [`chat-template/src/app/api/marketplace/stores/route.ts`](chat-template/src/app/api/marketplace/stores/route.ts) | Stores API |
| [`chat-template/src/app/chat/page.tsx`](chat-template/src/app/chat/page.tsx) | Chat UI |
| [`chat-template/src/app/marketplace/page.tsx`](chat-template/src/app/marketplace/page.tsx) | Marketplace UI |
| [`chat-template/src/app/profile/page.tsx`](chat-template/src/app/profile/page.tsx) | Profile UI |

---

*Audit completed: 2026-02-04*
