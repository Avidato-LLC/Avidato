declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      dailyGenerationCount: number
      dailyLimit: number
      lastGenerationDate?: Date | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string | null
    dailyGenerationCount?: number
    dailyLimit?: number
    lastGenerationDate?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string | null
    dailyGenerationCount: number
    dailyLimit: number
  }
}