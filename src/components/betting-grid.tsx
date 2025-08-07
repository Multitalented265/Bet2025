"use client"

import { BettingCard } from "@/components/betting-card"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {candidates.map((candidate) => (
          <BettingCard
            key={candidate.id}
            candidate={candidate}
            disabled={false}
            bettingEnabled={bettingEnabled}
          />
        ))}
      </div>
    </div>
  )
} 