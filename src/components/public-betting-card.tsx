"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/ui/safe-image"
import type { CandidateData } from "@/lib/data"
import { LogIn } from "lucide-react"
import Link from "next/link"

type PublicBettingCardProps = {
  candidate: CandidateData;
  bettingEnabled: boolean;
}

export function PublicBettingCard({ candidate, bettingEnabled }: PublicBettingCardProps) {
  const isCardDisabled = !bettingEnabled || candidate.status === 'Withdrawn';
  
  const getButtonText = () => {
    if (candidate.status === 'Withdrawn') return 'Betting Closed';
    if (!bettingEnabled) return 'Betting Stopped';
    return 'Login to Place Bet';
  }

  return (
    <Card className={`w-full h-full flex flex-col transform transition-all duration-300 ${isCardDisabled ? 'opacity-70' : ''}`}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-center font-headline text-xl md:text-2xl line-clamp-2 min-h-[3rem] flex items-center justify-center">
          {candidate.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 flex-grow">
        <div className="relative h-32 w-32 md:h-36 md:w-36 overflow-hidden rounded-full border-4 border-primary shadow-lg flex-shrink-0">
          <SafeImage
            src={candidate.image}
            alt={`Photo of ${candidate.name}`}
            fill
            sizes="144px"
            className="object-cover object-center"
            priority
            fallbackText={candidate.name.charAt(0)}
            fallbackClassName="absolute inset-0 rounded-full text-3xl font-bold"
          />
          {candidate.status === 'Withdrawn' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-lg rotate-[-15deg] border-2 border-white p-2 rounded">WITHDRAWN</span>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Login or sign up to place your bet</p>
        </div>
      </CardContent>
      <CardFooter className="flex-shrink-0">
        <Button asChild className="w-full font-bold" disabled={isCardDisabled}>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            {getButtonText()}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
