import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const, // Changed from database to jwt for better reliability
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false, // Clean production configuration
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
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
    async jwt({ token, user }: { token: any; user: any }) {
      // When user signs in, add user data to token
      if (user) {
        token.id = user.id
        token.username = user.username
        token.dailyGenerationCount = user.dailyGenerationCount
        token.dailyLimit = user.dailyLimit
        token.lastGenerationDate = user.lastGenerationDate
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      // Send user data from token to session
      if (token && session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.dailyGenerationCount = token.dailyGenerationCount
        session.user.dailyLimit = token.dailyLimit
        session.user.lastGenerationDate = token.lastGenerationDate
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account, profile }: any): Promise<boolean> {
      if (account?.provider === "google" && profile) {
        // Prevent account switching by using profile data
        user.email = profile.email
        user.name = profile.name
        user.image = profile.picture || user.image
      }
      return true
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes('/login?callbackUrl=')) {
        const callbackUrl = new URL(url).searchParams.get('callbackUrl')
        if (callbackUrl) {
          return `${baseUrl}${callbackUrl}`
        }
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      return `${baseUrl}/dashboard`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}