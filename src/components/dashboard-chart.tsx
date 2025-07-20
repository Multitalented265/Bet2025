
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"

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

export type CandidateData = {
  id: number
  name: string
  totalBets: number
  image: string;
  hint: string;
}

type DashboardChartProps = {
  candidates: CandidateData[]
}

const candidateColors: { [key: string]: string } = {
    "Lazarus Chakwera": "#000000",
    "Peter Mutharika": "#87CEEB",
    "Dalitso Kabambe": "#FF0000",
    "Atupele Muluzi": "#FFD700",
};

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, data } = props;
    const candidate = data.find((d: CandidateData) => d.name === payload.value);
  
    if (!candidate) return null;
  
    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-150} y={-25} width="140" height="70">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Image
              src={candidate.image}
              alt={candidate.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div style={{ marginTop: '4px', fontSize: '12px', color: 'hsl(var(--foreground))', whiteSpace: 'normal', lineHeight: '1.2' }}>
              {candidate.name}
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

export function DashboardChart({ candidates }: DashboardChartProps) {
  const [chartData, setChartData] = useState<CandidateData[]>(candidates)
  const [totalPot, setTotalPot] = useState(candidates.reduce((acc, curr) => acc + curr.totalBets, 0))
  const [barCategoryGap, setBarCategoryGap] = useState("35%");

  useEffect(() => {
    const checkScreenSize = () => {
        if (window.matchMedia("(min-width: 768px)").matches) {
            setBarCategoryGap("20%"); // Wider bars on desktop
        } else {
            setBarCategoryGap("35%"); // Default for mobile
        }
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Keep the original candidates array to find challengers
    const originalCandidates = [...candidates];
    
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newChartData = [...prevData];
        let betAmount = 0;

        // With a 40% chance, give a large boost to a candidate who is not in the lead
        if (Math.random() < 0.4 && newChartData.length > 1) {
           const sortedByBets = [...newChartData].sort((a, b) => b.totalBets - a.totalBets);
           const challengers = sortedByBets.slice(1);
          
          if (challengers.length > 0) {
            const challengerIndex = Math.floor(Math.random() * challengers.length);
            const challengerName = challengers[challengerIndex].name;
            const originalIndex = newChartData.findIndex(c => c.name === challengerName);
            
            if (originalIndex !== -1) {
              betAmount = Math.floor(Math.random() * 20 + 10) * 100; // 1000 to 3000 MWK
              newChartData[originalIndex].totalBets += betAmount;
            }
          }
        } else {
          // Otherwise, add a smaller random bet to any candidate
          const randomIndex = Math.floor(Math.random() * newChartData.length);
          betAmount = Math.floor(Math.random() * 5 + 1) * 100; // 100 to 500 MWK
          newChartData[randomIndex].totalBets += betAmount;
        }

        setTotalPot(pot => pot + betAmount);
        // Return the new data without sorting it. The chart will handle transitions.
        return newChartData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [candidates]);
  
  const chartConfig = chartData.reduce((acc, candidate) => {
    acc[candidate.name] = {
      label: candidate.name,
      color: candidateColors[candidate.name] || "#8884d8",
    }
    return acc
  }, {} as any)
  
  const sortedData = [...chartData].sort((a, b) => b.totalBets - a.totalBets);

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
            margin={{ left: 20, right: 30, top: 20, bottom: 20 }}
            accessibilityLayer
            barCategoryGap={barCategoryGap}
            >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tickLine={false} 
              axisLine={false} 
              tick={<CustomYAxisTick data={chartData} />}
              width={140}
              interval={0}
              />
            <Tooltip
                cursor={{ fill: "hsl(var(--muted))", radius: 8 }}
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
                className="fill-foreground font-semibold"
                formatter={(value: number) => `${value.toLocaleString()}`}
              />
              {sortedData.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={candidateColors[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
