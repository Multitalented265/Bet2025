import { prisma } from './db';
import { headers } from 'next/headers';

export interface AdminLoginData {
  adminId: string;
  adminEmail: string;
  adminName: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  location?: any;
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  loginStatus: 'success' | 'failed';
  failureReason?: string;
  isSuccessful: boolean;
  requestHeaders?: any;
  referrer?: string;
  screenResolution?: string;
  language?: string;
  timezoneOffset?: number;
  sessionId?: string;
  deviceFingerprint?: string;
}

export class AdminLoginTracker {
  /**
   * Extract client information from request headers
   */
  static extractClientInfo(headersList: Headers): Partial<AdminLoginData> {
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    const acceptLanguage = headersList.get('accept-language') || '';
    const xForwardedFor = headersList.get('x-forwarded-for') || '';
    const xRealIp = headersList.get('x-real-ip') || '';
    const cfConnectingIp = headersList.get('cf-connecting-ip') || '';
    const xForwarded = headersList.get('x-forwarded') || '';
    
    // Get IP address with better detection
    let ipAddress = cfConnectingIp || xRealIp || xForwardedFor.split(',')[0] || xForwarded.split(',')[0] || 'unknown';
    
    // Clean up the IP address
    ipAddress = ipAddress.trim();
    
    // Handle localhost addresses
    if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
      ipAddress = '127.0.0.1 (Localhost)';
    }
    
    // Parse user agent
    const deviceInfo = this.parseUserAgent(userAgent);
    
    // Parse language
    const language = acceptLanguage.split(',')[0] || 'en';
    
    return {
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      referrer: referer,
      language,
      requestHeaders: Object.fromEntries(headersList.entries())
    };
  }

  /**
   * Parse user agent string to extract device information
   */
  static parseUserAgent(userAgent: string): { deviceType: string; browser: string; os: string } {
    const ua = userAgent.toLowerCase();
    
    // Determine device type
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }
    
    // Determine browser
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';
    
    // Determine OS
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    
    return { deviceType, browser, os };
  }

  /**
   * Get location information from IP address
   */
  static async getLocationFromIP(ipAddress: string): Promise<{
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  }> {
    try {
      // Handle localhost addresses
      if (ipAddress.includes('127.0.0.1') || ipAddress.includes('localhost') || ipAddress.includes('::1')) {
        return {
          city: 'Local Development',
          country: 'Development Environment',
          region: 'Localhost',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          latitude: 0,
          longitude: 0
        };
      }
      
      // Skip geolocation for private IP addresses
      if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
        return {
          city: 'Private Network',
          country: 'Local Network',
          region: 'Private IP',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          latitude: 0,
          longitude: 0
        };
      }
      
      // Use ipapi.co for geolocation (free tier available)
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if the response is valid
        if (data.error !== true && data.city) {
          return {
            city: data.city,
            country: data.country_name,
            region: data.region,
            timezone: data.timezone,
            latitude: data.latitude,
            longitude: data.longitude
          };
        }
      }
      
      // Fallback to ip-api.com if ipapi.co fails
      const fallbackResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (data.status === 'success') {
          return {
            city: data.city,
            country: data.country,
            region: data.regionName,
            timezone: data.timezone,
            latitude: data.lat,
            longitude: data.lon
          };
        }
      }
    } catch (error) {
      console.error('Error getting location from IP:', error);
    }
    
    // Return default values if geolocation fails
    return {
      city: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: 0,
      longitude: 0
    };
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, screenResolution?: string): string {
    const fingerprint = `${userAgent}-${screenResolution || 'unknown'}`;
    return Buffer.from(fingerprint).toString('base64').substring(0, 32);
  }

  /**
   * Log admin login attempt
   */
  static async logAdminLogin(loginData: AdminLoginData): Promise<void> {
    try {
      // Handle the case where adminId is 'unknown' (failed login attempts)
      if (loginData.adminId === 'unknown') {
        console.log(`⚠️  Admin with ID unknown not found, skipping login log`);
        return;
      }

      // First, check if the admin exists
      const adminExists = await prisma.admin.findUnique({
        where: { id: loginData.adminId }
      });

      if (!adminExists) {
        console.log(`⚠️  Admin with ID ${loginData.adminId} not found, skipping login log`);
        return;
      }

      await prisma.adminLoginLog.create({
        data: {
          ...loginData,
          sessionId: loginData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deviceFingerprint: loginData.deviceFingerprint || this.generateDeviceFingerprint(loginData.userAgent || '')
        }
      });
      
      console.log(`Admin login logged: ${loginData.adminEmail} - ${loginData.loginStatus} - ${loginData.ipAddress}`);
    } catch (error) {
      console.error('Error logging admin login:', error);
      // Don't throw the error to prevent login failures
    }
  }

  /**
   * Log admin logout
   */
  static async logAdminLogout(sessionId: string, adminId: string): Promise<void> {
    try {
      const logoutTime = new Date();
      
      // Find the login record and update it
      const loginRecord = await prisma.adminLoginLog.findFirst({
        where: {
          sessionId,
          adminId,
          logoutTime: null
        },
        orderBy: {
          loginTime: 'desc'
        }
      });
      
      if (loginRecord) {
        const sessionDuration = Math.floor((logoutTime.getTime() - loginRecord.loginTime.getTime()) / 1000);
        
        await prisma.adminLoginLog.update({
          where: { id: loginRecord.id },
          data: {
            logoutTime,
            sessionDuration
          }
        });
        
        console.log(`Admin logout logged: ${loginRecord.adminEmail} - Session duration: ${sessionDuration}s`);
      }
    } catch (error) {
      console.error('Error logging admin logout:', error);
    }
  }

  /**
   * Get admin login history
   */
  static async getAdminLoginHistory(adminId?: string, limit: number = 50): Promise<any[]> {
    try {
      const where = adminId ? { adminId } : {};
      
      const logs = await prisma.adminLoginLog.findMany({
        where,
        orderBy: {
          loginTime: 'desc'
        },
        take: limit,
        include: {
          admin: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      return logs.map(log => ({
        ...log,
        latitude: log.latitude?.toNumber(),
        longitude: log.longitude?.toNumber()
      }));
    } catch (error) {
      console.error('Error getting admin login history:', error);
      return [];
    }
  }

  /**
   * Get login statistics
   */
  static async getLoginStatistics(): Promise<{
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueAdmins: number;
    uniqueIPs: number;
    averageSessionDuration: number;
  }> {
    try {
      const [
        totalLogins,
        successfulLogins,
        failedLogins,
        uniqueAdmins,
        uniqueIPs,
        avgSessionDuration
      ] = await Promise.all([
        prisma.adminLoginLog.count(),
        prisma.adminLoginLog.count({ where: { isSuccessful: true } }),
        prisma.adminLoginLog.count({ where: { isSuccessful: false } }),
        prisma.adminLoginLog.groupBy({ by: ['adminId'], _count: true }),
        prisma.adminLoginLog.groupBy({ by: ['ipAddress'], _count: true }),
        prisma.adminLoginLog.aggregate({
          _avg: { sessionDuration: true },
          where: { sessionDuration: { not: null } }
        })
      ]);
      
      return {
        totalLogins,
        successfulLogins,
        failedLogins,
        uniqueAdmins: uniqueAdmins.length,
        uniqueIPs: uniqueIPs.length,
        averageSessionDuration: avgSessionDuration._avg.sessionDuration || 0
      };
    } catch (error) {
      console.error('Error getting login statistics:', error);
      return {
        totalLogins: 0,
        successfulLogins: 0,
        failedLogins: 0,
        uniqueAdmins: 0,
        uniqueIPs: 0,
        averageSessionDuration: 0
      };
    }
  }
} 