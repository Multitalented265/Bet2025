"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MaintenanceCheckProps {
  children: React.ReactNode;
  exemptPaths?: string[];
}

export default function MaintenanceCheck({ children, exemptPaths = [] }: MaintenanceCheckProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Default exempt paths - admin and essential routes
  const defaultExemptPaths = [
    '/admin',
    '/api/admin',
    '/api/paychangu/webhook',
    '/api/paychangu/webhook-monitor',
    '/maintenance',
    '/api/health',
    '/_next',
    '/favicon.ico'
  ];

  const allExemptPaths = [...defaultExemptPaths, ...exemptPaths];

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch('/api/admin/maintenance', {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsMaintenanceMode(data.maintenanceMode);
        } else {
          // If API fails, assume no maintenance mode
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        // If check fails, assume no maintenance mode
        setIsMaintenanceMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceMode();
  }, []);

  useEffect(() => {
    if (isMaintenanceMode && !isLoading) {
      const currentPath = window.location.pathname;
      const isExempt = allExemptPaths.some(path => currentPath.startsWith(path));
      
      if (!isExempt) {
        router.push('/maintenance');
      }
    }
  }, [isMaintenanceMode, isLoading, router, allExemptPaths]);

  // Show loading or the content
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If maintenance mode is on and current path is not exempt, don't render children
  // (user will be redirected)
  if (isMaintenanceMode) {
    const currentPath = window.location.pathname;
    const isExempt = allExemptPaths.some(path => currentPath.startsWith(path));
    
    if (!isExempt) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}
