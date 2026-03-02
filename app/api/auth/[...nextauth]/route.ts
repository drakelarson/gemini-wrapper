import NextAuth, { NextAuthOptions } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/schema'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
