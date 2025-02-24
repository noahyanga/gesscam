import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string | null
      email?: string | null
      role?: string | null
    }
  }

  interface User {
    id: string
    username?: string | null
    email?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
