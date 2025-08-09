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
      width: 60,
      height: 24,
      className: "h-3 w-auto",
      sizes: "(max-width: 640px) 30px, (max-width: 768px) 40px, (max-width: 1024px) 50px, 60px"
    },
    sm: {
      width: 80,
      height: 32,
      className: "h-5 w-auto",
      sizes: "(max-width: 640px) 50px, (max-width: 768px) 60px, (max-width: 1024px) 70px, 80px"
    },
    md: {
      width: 100,
      height: 40,
      className: "h-7 w-auto",
      sizes: "(max-width: 640px) 70px, (max-width: 768px) 80px, (max-width: 1024px) 90px, 100px"
    },
    lg: {
      width: 130,
      height: 52,
      className: "h-10 w-auto",
      sizes: "(max-width: 640px) 90px, (max-width: 768px) 110px, (max-width: 1024px) 120px, 130px"
    },
    xl: {
      width: 160,
      height: 64,
      className: "h-12 w-auto",
      sizes: "(max-width: 640px) 110px, (max-width: 768px) 130px, (max-width: 1024px) 150px, 160px"
    },
    xxl: {
      width: 200,
      height: 80,
      className: "h-16 w-auto",
      sizes: "(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
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
