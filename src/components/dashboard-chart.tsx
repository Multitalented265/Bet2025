
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
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
import { useBets } from "@/context/bet-context"
import type { CandidateData } from "@/context/bet-context"
import { useHasMounted } from "@/hooks/use-has-mounted"

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, data } = props;
    const candidate = data.find((d: CandidateData) => d.name === payload.value);
  
    if (!candidate) return null;
  
    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-120} y={-25} width="110" height="70">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Image
              src={candidate.image}
              alt={candidate.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
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


export function DashboardChart() {
  const { candidates, totalPot } = useBets();
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
          Total Pot: <span className="font-bold text-primary">{totalPot.toLocaleString()} MWK</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[450px] w-full">
          <BarChart 
            data={sortedData} 
            layout="vertical"
            margin={{ left: 10, right: 30, top: 20, bottom: 20 }}
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
              width={120}
              interval={0}
              />
            <Tooltip
                cursor={<CustomCursor />}
                content={<ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: chartConfig[name as string]?.color }} />
                        <div className="flex flex-col">
                            <span className="font-medium">{name}</span>
                            <span className="text-muted-foreground">{`${Number(value).toLocaleString()} MWK`}</span>
                        </div>
                    </div>
                  )}
                  nameKey="name"
                  hideLabel />}
              />
            <Bar dataKey="totalBets" layout="vertical" radius={8} animationDuration={800}>
              <LabelList
                dataKey="totalBets"
                position="right"
                offset={10}
                className="fill-foreground font-semibold text-xs sm:text-sm"
                formatter={(value: number) => `${value.toLocaleString()}`}
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
