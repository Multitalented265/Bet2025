
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, ShieldCheck, LogOut, Settings, LifeBuoy, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './logo';
import { Separator } from './ui/separator';
import { useHasMounted } from '@/hooks/use-has-mounted';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/bets', icon: ReceiptText, label: 'My Bets' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

const accountItems = [
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/support', icon: LifeBuoy, label: 'Support' },
    { href: '#', icon: ShieldCheck, label: 'Privacy Policy' },
]

interface TopNavProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function TopNav({ isMobile = false, onLinkClick }: TopNavProps) {
  const pathname = usePathname();
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return null; 
  }

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  if (isMobile) {
    return (
      <nav className="grid gap-2 text-lg font-medium">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-lg font-semibold mb-4" 
          prefetch
          onClick={handleLinkClick}
        >
            <Logo size="sm" />
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
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
        ))}
        <Separator className="my-4" />
        <div className="grid gap-2">
            <p className="px-3 text-sm font-medium text-muted-foreground">My Account</p>
            {accountItems.map((item) => (
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
             <Link
                href="/"
                prefetch
                onClick={handleLinkClick}
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
