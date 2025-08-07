import Image from 'next/image';
import logoImage from '/public/logo.png';

export default function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Mzunguko logo">
      <Image
        src={logoImage}
        alt="Mzunguko Logo"
        width={100}
        height={100}
        className="h-20 w-20 md:h-24 md:w-24"
        priority
      />
    </div>
  );
}
