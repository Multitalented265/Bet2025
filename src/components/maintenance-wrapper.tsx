'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // List of paths that should bypass maintenance mode
  const allowedPaths = [
    '/maintenance',
    '/admin',
    '/api/admin',
    '/api/paychangu/webhook',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/assets',
  ];

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Skip maintenance check for allowed paths
        if (allowedPaths.some(path => pathname.startsWith(path))) {
          setIsChecking(false);
          return;
        }

        const res = await fetch('/api/admin/maintenance', {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-cache'
          }
        });

        if (!res.ok) {
          // If API fails, allow access
          setIsChecking(false);
          return;
        }

        const data = await res.json();
        
        if (data.maintenanceMode && !pathname.startsWith('/maintenance')) {
          router.push('/maintenance');
        }
        
        setIsChecking(false);
      } catch (error) {
        // If check fails, allow access
        console.error('Failed to check maintenance mode:', error);
        setIsChecking(false);
      }
    };

    checkMaintenance();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
