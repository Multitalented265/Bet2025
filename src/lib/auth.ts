
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import crypto from "crypto";
import { sanitizeInput, logSecurityEvent, generateSecureToken } from "./utils";

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

// In-memory admin login attempt tracking (in production, use Redis)
const adminLoginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

// Function to clear in-memory rate limiting
export function clearAdminLoginAttempts() {
  adminLoginAttempts.clear();
  console.log('🧹 Cleared in-memory admin login attempts');
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

                    // Sanitize inputs
                    const sanitizedEmail = sanitizeInput(credentials.email);
                    const sanitizedPassword = sanitizeInput(credentials.password);

                    console.log(`[authorize] Looking up user: ${sanitizedEmail}`);
                    
                    // Check if database is accessible
                    try {
                        const user = await prisma.user.findUnique({
                            where: { email: sanitizedEmail }
                        });

                        if (!user) {
                            console.log(`[authorize] User not found: ${sanitizedEmail}`);
                            return null;
                        }

                        if (!user.password) {
                            console.log(`[authorize] User found but no password set: ${sanitizedEmail}`);
                            return null;
                        }

                        console.log(`[authorize] User found. Verifying password...`);
                        const isValid = await bcrypt.compare(sanitizedPassword, user.password);

                        if (!isValid) {
                            console.log(`[authorize] Password invalid for: ${sanitizedEmail}`);
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
            if (token) {
                session.user.id = token.id;
            }
            return session;
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

// Admin authentication functions with enhanced security
export async function authenticateAdmin(email: string, password: string, ipAddress?: string) {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedIP = sanitizeInput(ipAddress || 'unknown');

    // Rate limiting for admin login attempts
    const rateLimitKey = `admin_login:${sanitizedIP}`;
    const now = Date.now();
    const attemptRecord = adminLoginAttempts.get(rateLimitKey);
    
    // Check if IP is blocked
    if (attemptRecord?.blockedUntil && now < attemptRecord.blockedUntil) {
      logSecurityEvent('Admin login blocked - rate limit', { ip: sanitizedIP, email: sanitizedEmail });
      return {
        success: false,
        message: 'Too many login attempts. Please try again later.'
      };
    }

    // Check if IP is banned
    if (sanitizedIP && sanitizedIP !== 'unknown') {
      const bannedIP = await prisma.bannedIP.findFirst({
        where: {
          ipAddress: sanitizedIP,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (bannedIP) {
        logSecurityEvent('Admin login blocked - banned IP', { ip: sanitizedIP, email: sanitizedEmail });
        return {
          success: false,
          message: 'Access denied: IP address is banned'
        };
      }
    }

    // Find admin in database
    const admin = await prisma.admin.findUnique({
      where: { 
        email: sanitizedEmail.toLowerCase(),
        isActive: true
      }
    }) as any;
    if (!admin) {
      // Track failed attempt
      const failedAttempts = (attemptRecord?.count || 0) + 1;
      const blockUntil = failedAttempts >= 5 ? now + (15 * 60 * 1000) : undefined; // Block for 15 minutes after 5 attempts
      
      adminLoginAttempts.set(rateLimitKey, {
        count: failedAttempts,
        lastAttempt: now,
        blockedUntil: blockUntil
      });

      logSecurityEvent('Admin login failed - invalid credentials', { 
        ip: sanitizedIP, 
        email: sanitizedEmail,
        attemptCount: failedAttempts 
      });

      return {
        success: false,
        message: 'Invalid admin credentials'
      };
    }
    
    // Use bcrypt to compare passwords
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(sanitizedPassword, admin.password);
    
    if (isValidPassword) {
      // Reset failed attempts on successful login
      adminLoginAttempts.delete(rateLimitKey);

      // Create admin session using the new AdminSession model
      const sessionToken = generateSecureToken(64);
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
          ipAddress: sanitizedIP,
          isSuccessful: true
        });
      } catch (notificationError) {
        console.error('Error sending login notification:', notificationError);
      }

      logSecurityEvent('Admin login successful', { 
        ip: sanitizedIP, 
        email: admin.email,
        adminId: admin.id 
      });
      
      return {
        success: true,
        sessionToken,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          twoFactorEnabled: (admin as any).twoFactorEnabled
        }
      };
    } else {
      // Track failed attempt
      const failedAttempts = (attemptRecord?.count || 0) + 1;
      const blockUntil = failedAttempts >= 5 ? now + (15 * 60 * 1000) : undefined;
      
      adminLoginAttempts.set(rateLimitKey, {
        count: failedAttempts,
        lastAttempt: now,
        blockedUntil: blockUntil
      });

      // Send notification for failed login
      try {
        const { notifyLoginAttempt } = await import('./notifications');
        await notifyLoginAttempt({
          adminEmail: sanitizedEmail,
          ipAddress: sanitizedIP,
          isSuccessful: false,
          failureReason: 'Invalid password'
        });
      } catch (notificationError) {
        console.error('Error sending login notification:', notificationError);
      }

      logSecurityEvent('Admin login failed - invalid password', { 
        ip: sanitizedIP, 
        email: sanitizedEmail,
        attemptCount: failedAttempts 
      });
      
      return {
        success: false,
        message: 'Invalid admin credentials'
      };
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    logSecurityEvent('Admin authentication error', { error: error instanceof Error ? error.message : 'Unknown error' });
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
  // This would be implemented based on your cookie handling
  // For now, return null as this is handled by the session management
  return null;
}

export async function getAdminSession() {
  try {
    const sessionToken = await getSessionToken();
    
    if (!sessionToken) {
      return null;
    }

    const session = await prisma.adminSession.findUnique({
      where: { sessionToken },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!session || session.expires < new Date() || !session.admin.isActive) {
      // Clean up expired session
      if (session) {
        await prisma.adminSession.delete({
          where: { sessionToken }
        });
      }
      return null;
    }

    return {
      user: session.admin
    };
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
}

export async function logoutAdmin() {
  try {
    const sessionToken = await getSessionToken();
    
    if (sessionToken) {
      await prisma.adminSession.delete({
        where: { sessionToken }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging out admin:', error);
    return { success: false };
  }
}
