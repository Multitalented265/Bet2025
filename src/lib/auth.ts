
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import crypto from "crypto";

// Extend the NextAuth types to include id in the user object
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log("--- [auth.ts - authorize] ---");
                    console.log("[authorize] Environment check - DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
                    
                    if (!credentials?.email || !credentials.password) {
                        console.log("[authorize] Missing credentials");
                        return null;
                    }

                    console.log(`[authorize] Looking up user: ${credentials.email}`);
                    
                    // Check if database is accessible
                    try {
                        const user = await prisma.user.findUnique({
                            where: { email: credentials.email }
                        });

                        if (!user) {
                            console.log(`[authorize] User not found: ${credentials.email}`);
                            return null;
                        }

                        if (!user.password) {
                            console.log(`[authorize] User found but no password set: ${credentials.email}`);
                            return null;
                        }

                        console.log(`[authorize] User found. Verifying password...`);
                        const isValid = await bcrypt.compare(credentials.password, user.password);

                        if (!isValid) {
                            console.log(`[authorize] Password invalid for: ${credentials.email}`);
                            return null;
                        }
                        
                        console.log(`[authorize] Password valid. Returning user object for session creation:`, { id: user.id, name: user.name, email: user.email });
                        
                        // Check if this is the user's first login by checking if they have any sessions
                        const existingSessions = await prisma.session.findMany({
                            where: { userId: user.id }
                        });
                        
                        // If this is the first login (no previous sessions), send notification
                        if (existingSessions.length === 0) {
                            try {
                                const { notifyNewUserLogin } = await import('./notifications');
                                await notifyNewUserLogin({
                                    name: user.name || 'Unknown',
                                    email: user.email || 'Unknown',
                                    loginTime: new Date()
                                });
                                console.log(`[authorize] First login notification sent for user: ${user.email}`);
                            } catch (notificationError) {
                                console.error('[authorize] Error sending first login notification:', notificationError);
                            }
                        }
                        
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                        };
                    } catch (dbError) {
                        console.error("[authorize] Database error:", dbError);
                        return null;
                    }
                } catch (error) {
                    console.error("[authorize] Error during authentication:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    // Check if user already exists
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    if (!existingUser) {
                        // Create new user for Google OAuth
                        const newUser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name || user.email!.split('@')[0],
                                image: user.image,
                                emailVerified: new Date(),
                            }
                        });
                        console.log(`[signIn] Created new user via Google OAuth: ${newUser.email}`);
                    } else {
                        console.log(`[signIn] Existing user logged in via Google OAuth: ${existingUser.email}`);
                    }
                } catch (error) {
                    console.error('[signIn] Error handling Google OAuth user:', error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            try {
                console.log("--- [auth.ts - session callback] ---");
                if (session.user && token) {
                    console.log("[session] Hydrating session with user ID from token.");
                    (session.user as NextAuthUser & { id: string }).id = token.id as string;
                } else {
                    console.log("[session] session.user or token object is missing. Cannot hydrate session.");
                }
                console.log("[session] Final session object:", session);
                return session;
            } catch (error) {
                console.error("[session] Error in session callback:", error);
                return session;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};

export const getSession = () => getServerSession(authOptions);

// Admin authentication functions
export async function authenticateAdmin(email: string, password: string, ipAddress?: string) {
  try {
    // Check if IP is banned
    if (ipAddress) {
      const bannedIP = await prisma.bannedIP.findFirst({
        where: {
          ipAddress,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (bannedIP) {
        console.log(`Blocked login attempt from banned IP: ${ipAddress}`);
        return {
          success: false,
          message: 'Access denied: IP address is banned'
        };
      }
    }

    // Find admin in database
    const admin = await prisma.admin.findUnique({
      where: { 
        email: email.toLowerCase(),
        isActive: true
      }
    });
    
    if (!admin) {
      return {
        success: false,
        message: 'Invalid admin credentials'
      };
    }
    
    // Use bcrypt to compare passwords
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (isValidPassword) {
      // Create admin session using the new AdminSession model
      const sessionToken = generateSessionToken();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await prisma.adminSession.create({
        data: {
          sessionToken,
          adminId: admin.id,
          expires
        }
      });
      
      // Send notification for successful login
      try {
        const { notifyLoginAttempt } = await import('./notifications');
        await notifyLoginAttempt({
          adminEmail: admin.email,
          ipAddress: ipAddress || 'Unknown',
          isSuccessful: true
        });
      } catch (notificationError) {
        console.error('Error sending login notification:', notificationError);
      }
      
      return {
        success: true,
        sessionToken,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      };
    } else {
      // Send notification for failed login
      try {
        const { notifyLoginAttempt } = await import('./notifications');
        await notifyLoginAttempt({
          adminEmail: email,
          ipAddress: ipAddress || 'Unknown',
          isSuccessful: false,
          failureReason: 'Invalid password'
        });
      } catch (notificationError) {
        console.error('Error sending login notification:', notificationError);
      }
      
      return {
        success: false,
        message: 'Invalid admin credentials'
      };
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed'
    };
  }
}

// Helper function to generate a random session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to get session token from cookies
async function getSessionToken(): Promise<string | null> {
  try {
    console.log("🔍 Getting session token from cookies...");
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value || null;
    console.log("📋 Session token found:", sessionToken ? "Yes" : "No");
    return sessionToken;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

export async function getAdminSession() {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) return null;
    
    const session = await prisma.adminSession.findUnique({
      where: { sessionToken },
      include: {
        admin: true
      }
    });
    
    if (!session || session.expires < new Date()) {
      return null;
    }
    
    if (session.admin && session.admin.isActive) {
      return {
        user: {
          id: session.admin.id,
          name: session.admin.name,
          email: session.admin.email,
          role: session.admin.role
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Admin session error:', error);
    return null;
  }
}

export async function logoutAdmin() {
  try {
    const sessionToken = await getSessionToken();
    if (sessionToken) {
      // Get the session to find the admin
      const session = await prisma.adminSession.findUnique({
        where: { sessionToken },
        include: { admin: true }
      });

      if (session) {
        // Find the most recent login log for this admin that doesn't have a logout time
        const latestLoginLog = await prisma.adminLoginLog.findFirst({
          where: {
            adminId: session.adminId,
            logoutTime: null,
            isSuccessful: true
          },
          orderBy: { loginTime: 'desc' }
        });

        if (latestLoginLog) {
          const now = new Date();
          const sessionDuration = Math.floor((now.getTime() - latestLoginLog.loginTime.getTime()) / 1000);

          // Update the login log with logout time and duration
          await prisma.adminLoginLog.update({
            where: { id: latestLoginLog.id },
            data: {
              logoutTime: now,
              sessionDuration: sessionDuration
            }
          });
        }

        // Delete the session
        await prisma.adminSession.deleteMany({
          where: { sessionToken }
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Admin logout error:', error);
    return { success: false };
  }
}
