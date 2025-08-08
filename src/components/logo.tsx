import Image from 'next/image';
import logoImage from '@/../public/logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  showWrapper?: boolean;
}

export default function Logo({ 
  size = 'md', 
  className,
  showWrapper = false 
}: LogoProps) {
  const sizeConfig = {
    xs: {
      width: 120,
      height: 48,
      className: "h-6 w-auto",
      sizes: "(max-width: 640px) 60px, (max-width: 768px) 80px, (max-width: 1024px) 100px, 120px"
    },
    sm: {
      width: 160,
      height: 64,
      className: "h-10 w-auto",
      sizes: "(max-width: 640px) 100px, (max-width: 768px) 120px, (max-width: 1024px) 140px, 160px"
    },
    md: {
      width: 200,
      height: 80,
      className: "h-14 w-auto",
      sizes: "(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
    },
    lg: {
      width: 260,
      height: 104,
      className: "h-20 w-auto",
      sizes: "(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 240px, 260px"
    },
    xl: {
      width: 320,
      height: 128,
      className: "h-24 w-auto",
      sizes: "(max-width: 640px) 220px, (max-width: 768px) 260px, (max-width: 1024px) 300px, 320px"
    },
    xxl: {
      width: 400,
      height: 160,
      className: "h-32 w-auto",
      sizes: "(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 360px, 400px"
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

  
  

  return logoElement;
}
