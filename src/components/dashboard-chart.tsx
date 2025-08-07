
"use client"

import { useEffect, useState } from "react"
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
import { useHasMounted } from "@/hooks/use-has-mounted"
import { SafeImage } from "@/components/ui/safe-image"

type CandidateWithBetCount = CandidateData & { betCount: number };

type DashboardChartProps = {
  candidates: CandidateWithBetCount[];
  totalPot: number;
}

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, data } = props;
    const candidate = data.find((d: CandidateData) => d.name === payload.value);
  
    if (!candidate) return null;
  
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-150} y={y} textAnchor="end" className="text-xs fill-foreground font-medium">
              {candidate.name}
        </text>
        <circle cx={-120} cy={y - 15} r={15} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x={-120} y={y - 10} textAnchor="middle" className="text-xs fill-foreground font-bold">
          {candidate.name.charAt(0).toUpperCase()}
        </text>
      </g>
    );
  };

const CustomCursor = (props: any) => {
  const { x, y, width, height } = props;
  if (width <= 0) return null; // Don't render for zero-value bars
  return <Rectangle fill="hsl(var(--muted))" x={x} y={y} width={width} height={height} radius={8} />;
};

export function DashboardChart({ candidates, totalPot }: DashboardChartProps) {
  const hasMounted = useHasMounted();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!hasMounted) return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [hasMounted]);
  
  const chartConfig = candidates.reduce((acc, candidate) => {
    acc[candidate.name] = {
      label: candidate.name,
      color: candidate.color,
    }
    return acc
  }, {} as any)
  
  const sortedData = [...candidates].filter(c => c.status === 'Active').sort((a, b) => b.totalBets - a.totalBets);

  // Calculate dynamic height based on number of candidates
  const minHeight = 400;
  const maxHeight = 800;
  const heightPerCandidate = 80;
  const dynamicHeight = Math.min(Math.max(sortedData.length * heightPerCandidate, minHeight), maxHeight);

  if (!hasMounted) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Live Betting Pool</CardTitle>
                <CardDescription>Total Pot: ...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[450px] w-full flex items-center justify-center text-muted-foreground">
                    Loading Chart...
                </div>
            </CardContent>
        </Card>
    )
  }

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
          <div className="relative pr-4">
            {/* Candidate Images Overlay for iOS Compatibility */}
            <div className="absolute left-0 top-0 z-10 pointer-events-none">
              {sortedData.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="absolute flex items-center gap-3"
                  style={{
                    top: `${20 + (index * 80)}px`,
                    left: '10px',
                    width: '140px'
                  }}
                >
                  <div className="relative w-8 h-8 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm flex-shrink-0">
                    <SafeImage
                      src={candidate.image}
                      alt={`Photo of ${candidate.name}`}
                      fill
                      sizes="32px"
                      className="object-cover object-center"
                      fallbackText={candidate.name.charAt(0).toUpperCase()}
                      fallbackClassName="absolute inset-0 rounded-full text-xs font-bold"
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">
                    {candidate.name}
                  </span>
                </div>
              ))}
            </div>
            
          <ChartContainer config={chartConfig} className="w-full" style={{ height: `${Math.max(sortedData.length * 80, 400)}px` }}>
            <BarChart 
              data={sortedData} 
              layout="vertical"
              margin={{ 
                  left: 160, 
                right: isMobile ? 120 : 140, 
                top: 20, 
                bottom: 20 
              }}
              accessibilityLayer
              barCategoryGap={isMobile ? "35%" : "20%"}
              >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                  hide
                />
              <Tooltip
                  cursor={<CustomCursor />}
                  content={<ChartTooltipContent
                      formatter={(value, name, props) => {
                        // Access the betCount directly from the chart data point
                        const betCount = props.payload?.betCount || 0;
                      return (
                        <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: chartConfig[name as string]?.color }} />
                            <div className="flex flex-col">
                                <span className="font-medium">{name}</span>
                                <span className="text-muted-foreground">{Number(value).toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  <span className="text-muted-foreground text-xs">{betCount} bets placed</span>
                            </div>
                        </div>
                      );
                    }}
                    nameKey="name"
                    hideLabel />}
                />
              <Bar dataKey="totalBets" layout="vertical" radius={8} animationDuration={800}>
                <LabelList
                  dataKey="totalBets"
                  position="right"
                  offset={isMobile ? 20 : 25}
                  className="fill-foreground font-semibold text-xs sm:text-sm"
                  formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                />
                {sortedData.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
