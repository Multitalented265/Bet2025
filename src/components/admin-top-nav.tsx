'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, ReceiptText, Users, Wallet, Settings, BarChart3, Shield, LogOut, LifeBuoy, FileText, Ban, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { Badge } from './ui/badge';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/bets', icon: ReceiptText, label: 'Bets' },
  { href: '/admin/candidates', icon: FileText, label: 'Candidates' },
  { href: '/admin/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
  { href: '/admin/transactions', icon: FileText, label: 'Transactions' },
  { href: '/admin/support', icon: LifeBuoy, label: 'Support' },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { href: '/admin/login-tracking', icon: Ban, label: 'Login Tracking' },
];

const adminItems = [
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/support', icon: LifeBuoy, label: 'Support' },
];

interface AdminTopNavProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function AdminTopNav({ isMobile = false, onLinkClick }: AdminTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (hasMounted) {
      fetchUnreadNotifications();
    }
  }, [hasMounted]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      
      if (data.success) {
        const unreadCount = data.notifications.filter((n: any) => !n.isRead).length;
        setUnreadNotifications(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  if (!hasMounted) {
    return null; 
  }

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const handleLogout = () => {
    if (onLinkClick) {
      onLinkClick();
    }
    // Clear admin session and redirect to login
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => {
        router.push('/admin-auth/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        router.push('/admin-auth/login');
      });
  };

  if (isMobile) {
    return (
      <nav className="grid gap-2 text-lg font-medium">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4" prefetch onClick={handleLinkClick}>
          <Shield className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>
        {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                pathname === item.href && 'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.href === '/admin/notifications' && unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </div>
              {item.label}
            </Link>
        ))}
        <Separator className="my-4" />
        <div className="grid gap-2">
            <p className="px-3 text-sm font-medium text-muted-foreground">Admin Account</p>
            {adminItems.map((item) => (
                 <Link
                 key={`${item.href}-${item.label}`}
                 href={item.href}
                 prefetch
                 onClick={handleLinkClick}
                 className={cn(
                   'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                   pathname === item.href && 'bg-primary text-primary-foreground hover:text-primary-foreground'
                 )}
               >
                 <item.icon className="h-5 w-5" />
                 {item.label}
               </Link>
            ))}
             <button
                onClick={handleLogout}
                className='flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground w-full text-left'
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch
          className={cn(
            'transition-colors hover:text-primary relative',
            pathname === item.href ? 'font-semibold text-primary' : 'text-muted-foreground'
          )}
        >
          {item.label}
          {item.href === '/admin/notifications' && unreadNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
} 