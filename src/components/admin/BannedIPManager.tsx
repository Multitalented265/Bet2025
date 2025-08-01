'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Ban, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface BannedIP {
  id: string;
  ipAddress: string;
  reason?: string;
  bannedAt: string;
  expiresAt?: string;
  isActive: boolean;
  admin: {
    name: string;
    email: string;
  };
}

export default function BannedIPManager() {
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState<BannedIP | null>(null);
  const [banForm, setBanForm] = useState({
    ipAddress: '',
    reason: '',
    expiresAt: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  const fetchBannedIPs = async () => {
    try {
      const response = await fetch('/api/admin/banned-ips');
      const data = await response.json();
      
      if (data.success) {
        setBannedIPs(data.bannedIPs);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to fetch banned IPs"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch banned IPs"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanIP = async () => {
    try {
      const response = await fetch('/api/admin/banned-ips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "IP address banned successfully"
        });
        setIsBanDialogOpen(false);
        setBanForm({ ipAddress: '', reason: '', expiresAt: '' });
        fetchBannedIPs();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to ban IP address"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to ban IP address"
      });
    }
  };

  const handleUnbanIP = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/banned-ips/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "IP address unbanned successfully"
        });
        setIsUnbanDialogOpen(false);
        setSelectedIP(null);
        fetchBannedIPs();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to unban IP address"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unban IP address"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (ip: BannedIP) => {
    if (!ip.isActive) {
      return <Badge variant="secondary">Unbanned</Badge>;
    }
    if (ip.expiresAt && isExpired(ip.expiresAt)) {
      return <Badge variant="outline">Expired</Badge>;
    }
    return <Badge variant="destructive">Banned</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                IP Ban Management
              </CardTitle>
              <CardDescription>
                Manage banned IP addresses to prevent unauthorized access
              </CardDescription>
            </div>
            <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ban IP Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ban IP Address</DialogTitle>
                  <DialogDescription>
                    Enter the IP address you want to ban and provide a reason.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">IP Address</label>
                    <Input
                      placeholder="192.168.1.1"
                      value={banForm.ipAddress}
                      onChange={(e) => setBanForm({ ...banForm, ipAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason (Optional)</label>
                    <Textarea
                      placeholder="Reason for banning this IP address"
                      value={banForm.reason}
                      onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expires At (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={banForm.expiresAt}
                      onChange={(e) => setBanForm({ ...banForm, expiresAt: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBanIP}>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban IP
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {bannedIPs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No banned IP addresses found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Banned By</TableHead>
                  <TableHead>Banned At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedIPs.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono">{ip.ipAddress}</TableCell>
                    <TableCell>
                      {ip.reason || <span className="text-muted-foreground">No reason provided</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(ip)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {ip.admin.name}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(ip.bannedAt)}</TableCell>
                    <TableCell>
                      {ip.expiresAt ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatDate(ip.expiresAt)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ip.isActive && (
                          <Dialog open={isUnbanDialogOpen && selectedIP?.id === ip.id} onOpenChange={setIsUnbanDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIP(ip)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Unban IP Address</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to unban {ip.ipAddress}? This will allow access from this IP address again.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsUnbanDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleUnbanIP(ip.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Unban IP
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Note:</strong> IP banning is an effective security measure, but be cautious when banning IP addresses. 
          Make sure you're not accidentally blocking legitimate users. Consider using temporary bans for suspicious activity 
          and permanent bans only for confirmed malicious behavior.
        </AlertDescription>
      </Alert>
    </div>
  );
} 