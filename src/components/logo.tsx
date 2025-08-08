import Image from 'next/image';
import logoImage from '@/../public/logo.png';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 h-14 md:h-16 shrink-0" aria-label="Mzunguko logo">
      <Image
        src={logoImage}
        alt="Mzunguko Logo"
        width={250}
        height={100}
        priority
        quality={100}
        sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 220px, 240px"
        className="h-full w-auto"
      />
    </div>
  );
}
