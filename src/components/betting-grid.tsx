"use client"

import { BettingCard } from "@/components/betting-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CandidateData, User } from "@/lib/data"

type BettingGridProps = {
  candidates: CandidateData[];
  user: User;
  bettingEnabled: boolean;
}

export function BettingGrid({ candidates, user, bettingEnabled }: BettingGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Place Your Bet</h2>
      </div>
      <ScrollArea className="w-full" style={{ height: '600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pr-4">
          {candidates.map((candidate) => (
            <BettingCard
              key={candidate.id}
              candidate={candidate}
              disabled={false}
              bettingEnabled={bettingEnabled}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 