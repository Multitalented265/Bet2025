
"use client"

import { useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell, LabelList, Rectangle } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CandidateData } from "@/lib/data"
// no client-only guard; render immediately for faster first paint
import { SafeImage } from "@/components/ui/safe-image"

type CandidateWithBetCount = CandidateData & { betCount: number };

type DashboardChartProps = {
  candidates: CandidateWithBetCount[];
  totalPot: number;
}

const CustomCursor = (props: any) => {
  const { x, y, width, height } = props;
  if (width <= 0) return null; // Don't render for zero-value bars
  return <Rectangle fill="hsl(var(--muted))" x={x} y={y} width={width} height={height} radius={8} />;
};

export function DashboardChart({ candidates, totalPot }: DashboardChartProps) {
  useEffect(() => {
    // noop: kept to preserve client component behavior, but no gating
  }, []);
  
  const chartConfig = candidates.reduce((acc, candidate) => {
    acc[candidate.name] = {
      label: candidate.name,
      color: candidate.color,
    }
    return acc
  }, {} as any)
  
  const sortedData = [...candidates].sort((a, b) => b.totalBets - a.totalBets);

  // Calculate dynamic height based on number of candidates
  const minHeight = 300; // Minimum height for empty state
  const maxHeight = 800; // Maximum height before scrolling
  const heightPerCandidate = 80; // Height per candidate row
  const dynamicHeight = Math.min(Math.max(sortedData.length * heightPerCandidate + 100, minHeight), maxHeight);

  // Render immediately without waiting for hasMounted

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Live Betting Pool</CardTitle>
        <CardDescription>
          Total Pot: <span className="font-bold text-primary">{totalPot.toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full" style={{ height: `${dynamicHeight}px` }}>
          <div className="space-y-3 pr-4">
            {sortedData.map((candidate) => (
              <div key={candidate.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                {/* Profile Picture */}
                <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm flex-shrink-0">
                  <SafeImage
                    src={candidate.image}
                    alt={`Photo of ${candidate.name}`}
                    fill
                    sizes="48px"
                    className="object-cover object-center"
                    fallbackText={candidate.name.charAt(0).toUpperCase()}
                    fallbackClassName="absolute inset-0 rounded-full text-sm font-bold"
                  />
                </div>
                
                {/* Candidate Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">
                    {candidate.name}
                  </h3>
                </div>
                
                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm md:text-base font-bold text-primary">
                    {candidate.totalBets.toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {candidate.betCount} bets placed
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1 max-w-[200px]">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${totalPot > 0 ? (candidate.totalBets / totalPot) * 100 : 0}%`,
                        backgroundColor: candidate.color || 'hsl(var(--primary))'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {sortedData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active candidates found.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
