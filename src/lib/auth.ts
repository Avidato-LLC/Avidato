import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.dailyGenerationCount = user.dailyGenerationCount
        token.dailyLimit = user.dailyLimit
      }
      
      // Handle Google OAuth account linking
      if (account?.provider === "google" && user) {
        try {
          // Check if user already exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              username: true,
              dailyGenerationCount: true,
              dailyLimit: true,
            }
          })
          
          if (existingUser) {
            // User exists, link the Google account and enrich token
            token.id = existingUser.id
            token.username = existingUser.username
            token.dailyGenerationCount = existingUser.dailyGenerationCount
            token.dailyLimit = existingUser.dailyLimit
          }
        } catch (error) {
          console.error("Error in JWT callback:", error)
        }
      }
      
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.dailyGenerationCount = token.dailyGenerationCount as number
        session.user.dailyLimit = token.dailyLimit as number
        
        // Only fetch fresh user data for generation-related requests or periodically
        // This prevents unnecessary DB calls on every page load
        const now = new Date()
        const lastFetch = token.lastDataFetch as number || 0
        const fiveMinutesAgo = now.getTime() - (5 * 60 * 1000)
        
        if (lastFetch < fiveMinutesAgo) {
          try {
            const freshUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                dailyGenerationCount: true,
                lastGenerationDate: true,
                dailyLimit: true,
              }
            })
            
            if (freshUser) {
              session.user.dailyGenerationCount = freshUser.dailyGenerationCount
              session.user.dailyLimit = freshUser.dailyLimit
              session.user.lastGenerationDate = freshUser.lastGenerationDate
              // Cache the fetch time
              token.lastDataFetch = now.getTime()
            }
          } catch (error) {
            console.error("Error fetching fresh user data:", error)
          }
        }
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account, profile }: any): Promise<boolean> {
      // For Google OAuth, ensure user profile is enriched
      if (account?.provider === "google" && profile) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (existingUser) {
            // Update existing user with Google profile data if missing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {}
            if (!existingUser.image && user.image) {
              updateData.image = user.image
            }
            if (!existingUser.name && user.name) {
              updateData.name = user.name
            }
            
            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: updateData
              })
            }
          } else {
            // For new Google users, the adapter will create the user
            // but we want to ensure the name is properly set
            // This happens automatically through the adapter
          }
        } catch (error) {
          console.error("Error updating user profile:", error)
        }
      }
      
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}