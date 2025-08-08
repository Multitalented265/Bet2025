import Image from 'next/image';
import logoImage from '@/../public/logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showWrapper?: boolean;
}

export default function Logo({ 
  size = 'md', 
  className,
  showWrapper = false 
}: LogoProps) {
  const sizeConfig = {
    sm: {
      width: 140,
      height: 56,
      className: "h-8 w-auto",
      sizes: "(max-width: 640px) 80px, (max-width: 768px) 100px, (max-width: 1024px) 120px, 140px"
    },
    md: {
      width: 180,
      height: 72,
      className: "h-12 w-auto",
      sizes: "(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
    },
    lg: {
      width: 220,
      height: 88,
      className: "h-16 w-auto",
      sizes: "(max-width: 640px) 140px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 220px"
    },
    xl: {
      width: 280,
      height: 112,
      className: "h-20 w-auto",
      sizes: "(max-width: 640px) 160px, (max-width: 768px) 200px, (max-width: 1024px) 240px, 280px"
    }
  };

  const config = sizeConfig[size];

  const logoElement = (
    <Image
      src={logoImage}
      alt="Mzunguko Logo"
      width={config.width}
      height={config.height}
      priority
      quality={100}
      sizes={config.sizes}
      className={cn(config.className, className)}
    />
  );

  if (showWrapper) {
    return (
      <header className="h-16 flex items-center px-4">
        {logoElement}
      </header>
    );
  }

  return logoElement;
}
