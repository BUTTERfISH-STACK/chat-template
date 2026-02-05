import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phoneNumber?: string
      provider?: string
    } & DefaultSession["user"]
  }

  interface User {
    phoneNumber?: string
    provider?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    phoneNumber?: string
    provider?: string
  }
}
