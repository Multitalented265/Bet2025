
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ReceiptText, User, FileText, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './logo';
import { Separator } from './ui/separator';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/bets', icon: ReceiptText, label: 'My Bets' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

const accountItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '#', icon: FileText, label: 'Terms & Conditions' },
    { href: '#', icon: ShieldCheck, label: 'Privacy Policy' },
]

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
                'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-accent-foreground hover:bg-accent/10 whitespace-nowrap',
                pathname === item.href && 'bg-primary text-primary-foreground'
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
                 className={cn(
                   'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-accent-foreground hover:bg-accent/10 whitespace-nowrap',
                   pathname === item.href && 'bg-primary text-primary-foreground'
                 )}
               >
                 <item.icon className="h-5 w-5" />
                 {item.label}
               </Link>
            ))}
             <Link
                href="/"
                className='flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-accent-foreground hover:bg-accent/10 whitespace-nowrap'
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
          className={cn(
            'transition-colors hover:text-accent whitespace-nowrap',
            pathname === item.href ? 'font-semibold text-primary' : 'text-muted-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
