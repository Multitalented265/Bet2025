import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center" aria-label="Mzunguko logo">
      <Image
        src="/logo.png"
        alt="Mzunguko Logo"
        width={160}
        height={160}
        className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
        priority
      />
    </div>
  );
}
