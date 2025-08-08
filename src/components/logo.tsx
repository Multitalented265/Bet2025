import Image from 'next/image';
import logoImage from '@/../public/logo.png';

export default function Logo() {
  return (
    <Image
      src={logoImage}
      alt="Mzunguko Logo"
      width={300}
      height={120}
      priority
      quality={100}
      sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, (max-width: 1024px) 220px, 300px"
      className="h-auto w-auto"
    />
  );
}
