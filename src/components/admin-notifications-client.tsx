'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Check, AlertTriangle, User, Wallet, DollarSign, Shield, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminNotification {
  id: string;
  subject: string;
  message: string;
  type: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export function AdminNotificationsClient() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        console.error('Failed to fetch notifications:', data.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notifications"
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        toast({
          title: "Success",
          description: "Notification marked as read"
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        toast({
          title: "Success",
          description: "All notifications marked as read"
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'newUser':
        return <User className="h-4 w-4" />;
      case 'largeBet':
        return <Wallet className="h-4 w-4" />;
      case 'largeDeposit':
        return <DollarSign className="h-4 w-4" />;
      case 'loginAttempt':
        return <Shield className="h-4 w-4" />;
      case 'systemAlert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'newUser':
        return <Badge variant="default">New User</Badge>;
      case 'largeBet':
        return <Badge variant="secondary">Large Bet</Badge>;
      case 'largeDeposit':
        return <Badge variant="secondary">Large Transaction</Badge>;
      case 'loginAttempt':
        return <Badge variant="destructive">Security</Badge>;
      case 'systemAlert':
        return <Badge variant="destructive">System</Badge>;
      default:
        return <Badge variant="outline">Notification</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: 'all' | 'unread' | 'read') => setFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
              </SelectContent>
            </Select>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          System notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' ? 'No notifications yet' : 
               filter === 'unread' ? 'No unread notifications' : 
               'No read notifications'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? 'bg-muted/50 hover:bg-muted/70' 
                    : 'bg-background border-primary/20 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${notification.isRead ? 'text-muted-foreground' : 'text-primary'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {notification.subject}
                        </h4>
                        {getNotificationBadge(notification.type)}
                        {notification.isRead && (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 