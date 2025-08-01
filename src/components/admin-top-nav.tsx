'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Wallet, 
  DollarSign, 
  BarChart3, 
  MessageSquare, 
  Activity, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useHasMounted } from '@/hooks/use-has-mounted';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/candidates', icon: UserCheck, label: 'Candidates' },
  { href: '/admin/bets', icon: Wallet, label: 'Bets' },
  { href: '/admin/transactions', icon: DollarSign, label: 'Transactions' },
  { href: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
  { href: '/admin/support', icon: MessageSquare, label: 'Support' },
  { href: '/admin/login-tracking', icon: Activity, label: 'Login Tracking' },
];

const adminItems = [
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminTopNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return null; 
  }

  if (isMobile) {
    return (
      <nav className="grid gap-2 text-lg font-medium">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4" prefetch>
          <Shield className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>
        {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                pathname === item.href && 'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
        ))}
        <Separator className="my-4" />
        <div className="grid gap-2">
            <p className="px-3 text-sm font-medium text-muted-foreground">Admin</p>
            {adminItems.map((item) => (
                 <Link
                 key={`${item.href}-${item.label}`}
                 href={item.href}
                 prefetch
                 className={cn(
                   'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                   pathname === item.href && 'bg-primary text-primary-foreground hover:text-primary-foreground'
                 )}
               >
                 <item.icon className="h-5 w-5" />
                 {item.label}
               </Link>
            ))}
             <Link
                href="/admin/login"
                prefetch
                className='flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground'
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Link>
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
            'transition-colors hover:text-primary',
            pathname === item.href ? 'font-semibold text-primary' : 'text-muted-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 