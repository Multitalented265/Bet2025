'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Activity, 
  Users, 
  Globe, 
  Clock, 
  Shield, 
  AlertTriangle,
  Eye,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Monitor,
  Smartphone,
  Globe2,
  Calendar,
  Timer
} from 'lucide-react';

interface LoginLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  city?: string;
  country?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  loginTime: string;
  logoutTime?: string;
  sessionDuration?: number;
  loginStatus: string;
  failureReason?: string;
  isSuccessful: boolean;
  referrer?: string;
  screenResolution?: string;
  language?: string;
  sessionId?: string;
  deviceFingerprint?: string;
}

interface LoginStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueAdmins: number;
  uniqueIPs: number;
  averageSessionDuration: number;
}

export default function LoginTrackingDashboard() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [stats, setStats] = useState<LoginStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const [selectedLog, setSelectedLog] = useState<LoginLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchLoginData();
  }, []);

  const fetchLoginData = async () => {
    try {
      setLoading(true);
      
      // Fetch login logs
      const logsResponse = await fetch('/api/admin/login-track');
      const logsData = await logsResponse.json();
      
      if (logsData.success) {
        setLogs(logsData.logs);
      }
      
      // Fetch statistics
      const statsResponse = await fetch('/api/admin/login-track/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
      
    } catch (error) {
      console.error('Error fetching login data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || 
      (filter === 'success' && log.isSuccessful) ||
      (filter === 'failed' && !log.isSuccessful);
    
    const matchesSearch = searchTerm === '' || 
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdmin = selectedAdmin === 'all' || log.adminId === selectedAdmin;
    
    return matchesFilter && matchesSearch && matchesAdmin;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (log: LoginLog) => {
    if (log.isSuccessful) {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    } else {
      return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      default:
        return '💻';
    }
  };

  const formatLocation = (log: LoginLog) => {
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

  const handleViewDetails = (log: LoginLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const exportData = () => {
    const csvContent = [
      ['Admin', 'Email', 'IP Address', 'Device', 'Browser', 'OS', 'Location', 'Login Time', 'Status', 'Session Duration'],
      ...filteredLogs.map(log => [
        log.adminName,
        log.adminEmail,
        log.ipAddress || 'N/A',
        log.deviceType || 'N/A',
        log.browser || 'N/A',
        log.os || 'N/A',
        `${log.city || ''}, ${log.country || ''}`.trim() || 'N/A',
        formatDateTime(log.loginTime),
        log.isSuccessful ? 'Success' : 'Failed',
        formatDuration(log.sessionDuration)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-login-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading login tracking data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Login Tracking</h2>
          <p className="text-muted-foreground">
            Monitor admin login activities and security events
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLoginData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueIPs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by admin, email, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logins</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Login Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
          <CardDescription>
            Recent admin login attempts and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.adminName}</div>
                        <div className="text-sm text-muted-foreground">{log.adminEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getDeviceIcon(log.deviceType)}</span>
                        <div>
                          <div className="text-sm">{log.browser}</div>
                          <div className="text-xs text-muted-foreground">{log.os}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{formatIP(log.ipAddress)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatLocation(log)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDateTime(log.loginTime)}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDuration(log.sessionDuration)}</div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No login logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Login Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this login attempt
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Admin Name</label>
                      <p className="text-sm">{selectedLog.adminName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{selectedLog.adminEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedLog)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Login Time</label>
                      <p className="text-sm">{formatDateTime(selectedLog.loginTime)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Device Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Device Type</label>
                      <p className="text-sm flex items-center gap-2">
                        {getDeviceIcon(selectedLog.deviceType)} {selectedLog.deviceType || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Browser</label>
                      <p className="text-sm">{selectedLog.browser || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Operating System</label>
                      <p className="text-sm">{selectedLog.os || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Screen Resolution</label>
                      <p className="text-sm">{selectedLog.screenResolution || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Language</label>
                      <p className="text-sm">{selectedLog.language || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                      <p className="text-sm text-xs break-all">{selectedLog.userAgent || 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                      <p className="text-sm">{formatIP(selectedLog.ipAddress)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-sm">{selectedLog.city || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <p className="text-sm">{selectedLog.country || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Region</label>
                      <p className="text-sm">{selectedLog.region || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                      <p className="text-sm">{selectedLog.timezone || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                      <p className="text-sm">
                        {selectedLog.latitude && selectedLog.longitude 
                          ? `${selectedLog.latitude}, ${selectedLog.longitude}`
                          : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Session Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                      <p className="text-sm font-mono text-xs break-all">{selectedLog.sessionId || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Session Duration</label>
                      <p className="text-sm">{formatDuration(selectedLog.sessionDuration)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Logout Time</label>
                      <p className="text-sm">
                        {selectedLog.logoutTime ? formatDateTime(selectedLog.logoutTime) : 'Active Session'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Device Fingerprint</label>
                      <p className="text-sm font-mono text-xs break-all">{selectedLog.deviceFingerprint || 'Unknown'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Failure Info (if failed) */}
              {!selectedLog.isSuccessful && selectedLog.failureReason && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Failure Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Failure Reason</label>
                      <p className="text-sm text-red-600">{selectedLog.failureReason}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 