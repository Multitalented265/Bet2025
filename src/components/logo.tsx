import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Mzunguko logo">
      <Image
        src="/logo.png"
        alt="Mzunguko Logo"
        width={250}
        height={100}
        priority // ensures logo loads fast
        className="w-full max-w-[200px] md:max-w-[250px] h-auto"
      />
    </div>
  );
}
