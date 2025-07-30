import { getAdminLoginLogs, getAdminLoginStats } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Clock, MapPin, Monitor } from "lucide-react";
import LoginTrackingDashboard from "@/components/admin/LoginTrackingDashboard";
import BannedIPManager from "@/components/admin/BannedIPManager";

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface AdminLoginLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  timezone: string | null;
  latitude: number | undefined;
  longitude: number | undefined;
  loginTime: Date;
  logoutTime: Date | null;
  sessionDuration: number | null;
  loginStatus: string;
  failureReason: string | null;
  isSuccessful: boolean;
  referrer: string | null;
  screenResolution: string | null;
  language: string | null;
  sessionId: string | null;
  deviceFingerprint: string | null;
  admin: {
    name: string;
    email: string;
  };
}

export default async function AdminLoginTrackingPage() {
  const [logs, stats] = await Promise.all([
    getAdminLoginLogs(20), // Get last 20 logs
    getAdminLoginStats()
  ]);

  const formatLocation = (log: AdminLoginLog) => {
    if (log.ipAddress?.includes('127.0.0.1') || log.ipAddress?.includes('localhost')) {
      return 'Local Development';
    }
    if (log.city && log.country) {
      return `${log.city}, ${log.country}`;
    }
    if (log.ipAddress) {
      return `IP: ${log.ipAddress}`;
    }
    return 'Unknown location';
  };

  const formatIP = (ipAddress?: string) => {
    if (!ipAddress) return 'Unknown';
    if (ipAddress.includes('127.0.0.1') || ipAddress.includes('localhost')) {
      return 'Localhost (Development)';
    }
    return ipAddress;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Login Tracking</h1>
        <p className="text-muted-foreground">Monitor admin login activity and security analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
            <p className="text-xs text-muted-foreground">
              All time logins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
            <p className="text-xs text-muted-foreground">
              Successful logins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Security alerts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueIPs}</div>
            <p className="text-xs text-muted-foreground">
              Login locations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>Login Activity Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginTrackingDashboard />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No login activity found.</p>
            ) : (
              logs.map((log: AdminLoginLog) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${log.isSuccessful ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium">{log.adminEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.isSuccessful ? 'Successful login' : 'Failed login attempt'} - {new Date(log.loginTime).toLocaleString()}
                      </p>
                      {log.ipAddress && (
                        <p className="text-xs text-muted-foreground">
                          IP: {formatIP(log.ipAddress)} • {log.browser} on {log.os}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={log.isSuccessful ? 'default' : 'destructive'}>
                      {log.isSuccessful ? 'Success' : 'Failed'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatLocation(log)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <BannedIPManager />
    </div>
  );
} 