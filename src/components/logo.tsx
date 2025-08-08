import Image from 'next/image';
import logoImage from '@/../public/logo.png';

export default function Logo() {
  return (
    <header className="h-16 flex items-center px-4">
      <Image
        src={logoImage}
        alt="Mzunguko Logo"
        width={220}
        height={88}
        priority
        quality={100}
        sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
        className="max-h-12 w-auto h-auto"
      />
    </header>
  );
}
