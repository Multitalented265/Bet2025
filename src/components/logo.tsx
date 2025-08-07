import Image from 'next/image';
import logoImage from '/public/logo.png';

export default function Logo() {
  return (
    <div className="flex items-center" aria-label="Mzunguko logo">
      <Image
        src={logoImage}
        alt="Mzunguko Logo"
        width={50}
        height={50}
        className="h-12 w-12 md:h-14 md:w-14"
        priority
      />
    </div>
  );
}
