import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { findUserByPhone, createUser, findUserById } from "@/lib/user-store"

// User interface for NextAuth
interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  phoneNumber?: string
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: "phone",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "tel", placeholder: "+1234567890" },
      },
      async authorize(credentials) {
        try {
          const phoneNumber = credentials.phoneNumber as string
          
          if (!phoneNumber) {
            throw new Error("Phone number is required")
          }

          // Validate phone number format
          const phoneRegex = /^[0-9+\-\s()]{10,}$/
          if (!phoneRegex.test(phoneNumber)) {
            throw new Error("Please enter a valid phone number")
          }

          // Find or create user
          let user = await findUserByPhone(phoneNumber)
          
          if (!user) {
            // Create new user
            user = await createUser(phoneNumber, "User")
          }

          // Return user object for NextAuth
          return {
            id: user.id,
            name: user.name,
            email: user.phoneNumber + "@phone.local", // Fake email for phone users
            phoneNumber: user.phoneNumber,
          }
        } catch (error: any) {
          console.error("Auth error:", error.message)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.phoneNumber = (user as any).phoneNumber
      }
      
      // Persist provider info
      if (account) {
        token.provider = account.provider
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.phoneNumber = token.phoneNumber as string | undefined
        session.user.provider = token.provider as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
})
