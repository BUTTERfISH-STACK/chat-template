# OTP Authentication System

A production-ready OTP (One-Time Password) authentication system for modern web applications. Fully self-hosted, open-source, and does not rely on paid APIs or third-party authentication services.

## Features

### Core Features
- **OTP Generation**: Cryptographically secure 6-digit numeric OTPs
- **OTP Storage**: Redis-based storage with automatic expiry (5 minutes)
- **Security**: SHA-256 hashing with constant-time comparison
- **Rate Limiting**: Per-phone-number rate limiting (3 requests per 10 minutes)
- **One-Time Use**: OTP is deleted after successful verification
- **Attempt Tracking**: Lock verification after 5 failed attempts

### Bonus Features
- **TOTP (Authenticator App)**: Optional 2FA using apps like Google Authenticator
- **QR Code Generation**: Easy setup for authenticator apps

## Tech Stack

- **Backend**: Node.js with Express
- **Storage**: Redis (with in-memory fallback for development)
- **Security**: Crypto module for SHA-256 hashing
- **Environment**: dotenv for configuration

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (optional - works with in-memory fallback)

### Installation

1. Clone or navigate to the project directory:
```bash
cd otp-auth-system
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
REDIS_URL=redis://localhost:6379
OTP_EXPIRY_SECONDS=300
MAX_OTP_ATTEMPTS=5
OTP_RATE_LIMIT_WINDOW_MINUTES=10
OTP_RATE_LIMIT_MAX_REQUESTS=3
```

5. Start the server:
```bash
npm start
```

### Docker (Optional)

Run with Redis using Docker Compose:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    
  otp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
```

## API Endpoints

### Request OTP
```http
POST /api/request-otp
Content-Type: application/json

{
  "phone": "+27123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to +27123456789",
  "otp": "123456"  // Only in development mode
}
```

### Verify OTP
```http
POST /api/verify-otp
Content-Type: application/json

{
  "phone": "+27123456789",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Get OTP Status
```http
GET /api/otp-status/+27123456789
```

### Reset OTP (Debug)
```http
DELETE /api/otp/+27123456789
```

### Health Check
```http
GET /api/health
```

## TOTP (Authenticator App) Setup

### Enable 2FA for a User

```http
POST /api/totp/setup
Content-Type: application/json

{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "otpauthUrl": "otpauth://totp/Vellon(user123)..."
}
```

### Verify TOTP Token

```http
POST /api/totp/verify
Content-Type: application/json

{
  "userId": "user123",
  "token": "123456"
}
```

## Security Features

### OTP Hashing
- All OTPs are hashed using SHA-256 before storage
- Only the hash is stored in Redis, not the plain OTP

### Constant-Time Comparison
- Uses `crypto.timingSafeEqual()` to prevent timing attacks
- Comparison always takes the same amount of time regardless of match

### Rate Limiting
- Maximum 3 OTP requests per phone number per 10 minutes
- Headers included in response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Attempt Tracking
- Maximum 5 verification attempts per OTP
- OTP deleted after successful verification
- OTP deleted after too many failed attempts

## Development vs Production

### Development Mode
- OTP is returned in the response for easy testing
- In-memory storage is used if Redis is not available
- Console logs show OTP values

### Production Mode
- OTP is NOT returned (send via SMS/WhatsApp)
- Redis storage is required for persistence
- Minimal logging for security

## File Structure

```
otp-auth-system/
├── server.js              # Main entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
├── README.md              # Documentation
├── routes/
│   └── otpRoutes.js       # API route handlers
├── services/
│   ├── otpService.js      # Core OTP operations
│   └── totpService.js     # TOTP (authenticator) service
├── middleware/
│   └── rateLimiter.js     # Rate limiting middleware
└── utils/
    ├── hash.js            # SHA-256 hashing utilities
    └── generateOtp.js     # OTP generation utilities
```

## Testing with cURL

```bash
# Request OTP
curl -X POST http://localhost:3000/api/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+27123456789"}'

# Verify OTP
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+27123456789", "otp": "123456"}'

# Check status
curl http://localhost:3000/api/otp-status/+27123456789

# Health check
curl http://localhost:3000/api/health
```

## License

MIT
