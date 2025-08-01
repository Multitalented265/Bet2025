
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
        <foreignObject x={-140} y={-25} width="130" height="70">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: '2px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--muted))'
            }}>
              <SafeImage
                src={candidate.image}
                alt={candidate.name}
                width={50}
                height={50}
                className="object-cover w-full h-full"
                fallbackText={candidate.name.charAt(0).toUpperCase()}
                fallbackClassName="flex items-center justify-center font-bold text-lg"
              />
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: 'hsl(var(--foreground))', whiteSpace: 'normal', lineHeight: '1.2' }}>
              {candidate.name}
            </div>
          </div>
        </foreignObject>
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
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <BarChart 
            data={sortedData} 
            layout="vertical"
            margin={{ 
              left: 10, 
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
              tick={<CustomYAxisTick data={candidates} />}
              width={140}
              interval={0}
              />
            <Tooltip
                cursor={<CustomCursor />}
                content={<ChartTooltipContent
                  formatter={(value, name) => {
                    const candidate = sortedData.find(c => c.name === name);
                    return (
                      <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: chartConfig[name as string]?.color }} />
                          <div className="flex flex-col">
                              <span className="font-medium">{name}</span>
                              <span className="text-muted-foreground">{Number(value).toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span className="text-muted-foreground text-xs">{candidate?.betCount || 0} bets placed</span>
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
      </CardContent>
    </Card>
  )
}
