
import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/context/auth-provider';
import { NavigationProvider } from '@/components/navigation-provider';
import { Poppins, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const fontPtSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Bet2025',
  description: 'Your trusted betting platform for 2025',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", fontPoppins.variable, fontPtSans.variable)} suppressHydrationWarning>
        <AuthProvider>
          <NavigationProvider>
            {children}
            <Toaster />
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
