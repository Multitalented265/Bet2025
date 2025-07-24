
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    // User not found or doesn't have a password (e.g., OAuth user)
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }
                
                // Return the user object if credentials are valid
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        // The `jwt` callback is called when a new JWT is created.
        // We add the user's ID to the token here.
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // The `session` callback is called whenever a session is accessed.
        // We add the user's ID from the token to the session object.
        async session({ session, token }) {
            if (session.user) {
                (session.user as NextAuthUser & { id: string }).id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
        error: '/', // Redirect to the login page on error
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get the session on the server side
export const getSession = () => getServerSession(authOptions);
