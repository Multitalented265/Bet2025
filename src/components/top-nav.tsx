'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './logo';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/bets', icon: ReceiptText, label: 'My Bets' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

export function TopNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  if (isMobile) {
    return (
      <nav className="grid gap-2 text-lg font-medium">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Logo />
        </Link>
        {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground whitespace-nowrap',
                pathname === item.href && 'bg-muted text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground whitespace-nowrap',
            pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
