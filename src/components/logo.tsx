import { Vote } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Bet2025 logo">
      <div className="p-2 bg-primary rounded-lg">
        <Vote className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold font-headline text-primary">
        Bet2025
      </span>
    </div>
  );
}
