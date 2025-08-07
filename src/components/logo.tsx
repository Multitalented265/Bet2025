import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center" aria-label="Mzunguko logo">
      <Image
        src="/logo.png"
        alt="Mzunguko Logo"
        width={32}
        height={32}
        className="h-8 w-8"
        priority
      />
    </div>
  );
}
