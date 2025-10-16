import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Clean production-ready configuration
  debug: false, // Disable NextAuth debug logs
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      }
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
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user }: { session: any; user: any }) {
      // Enterprise session management - user data comes from database
      if (user && session.user) {
        session.user.id = user.id
        session.user.username = user.username
        session.user.dailyGenerationCount = user.dailyGenerationCount
        session.user.dailyLimit = user.dailyLimit
        session.user.lastGenerationDate = user.lastGenerationDate
        
        console.log('🏢 Enterprise Session Created:', {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          provider: 'database'
        })
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account, profile }: any): Promise<boolean> {
      console.log('🏢 Enterprise SignIn - Start:', {
        provider: account?.provider,
        userEmail: user?.email,
        profileEmail: profile?.email
      })
      
      // ENTERPRISE APPROACH: Let NextAuth handle everything automatically
      // No manual user lookup or modification - trust the adapter
      
      if (account?.provider === "google" && profile) {
        console.log('🏢 Google OAuth - Enterprise Flow:', {
          profileEmail: profile.email,
          profileName: profile.name,
          profileId: profile.sub
        })
        
        // Ensure user data matches profile (prevent account switching)
        user.email = profile.email
        user.name = profile.name
        user.image = profile.picture || user.image
        
        console.log('✅ Profile data normalized for enterprise authentication')
      }
      
      console.log('🏢 Enterprise SignIn - Success')
      return true
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log('� Enterprise Redirect:', { url, baseUrl })
      
      // CRITICAL: Fix redirect loop issue
      // If redirecting to login with callbackUrl, go to dashboard instead
      if (url.includes('/login?callbackUrl=')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl')
        if (callbackUrl) {
          const finalUrl = `${baseUrl}${callbackUrl}`
          console.log('🎯 Redirecting to callback:', finalUrl)
          return finalUrl
        }
      }
      
      // For relative URLs, use baseUrl
      if (url.startsWith('/')) {
        const finalUrl = `${baseUrl}${url}`
        console.log('🎯 Redirecting to relative URL:', finalUrl)
        return finalUrl
      }
      
      // For same origin URLs, allow
      if (url.startsWith(baseUrl)) {
        console.log('🎯 Same origin redirect:', url)
        return url
      }
      
      // Default to dashboard
      const defaultUrl = `${baseUrl}/dashboard`
      console.log('🎯 Default redirect to dashboard:', defaultUrl)
      return defaultUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}