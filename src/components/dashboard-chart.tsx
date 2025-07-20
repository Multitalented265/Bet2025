
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell } from "recharts"

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
}

type DashboardChartProps = {
  initialData: CandidateData[]
}

const candidateColors: { [key: string]: string } = {
    "Saulos Chilima": "hsl(0 75% 60%)", // Red
    "Lazarus Chakwera": "hsl(0 0% 0%)", // Black
    "Peter Mutharika": "hsl(200 100% 50%)", // Sky Blue
    "Atupele Muluzi": "hsl(54 100% 50%)", // Yellow
};

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, data } = props;
    const candidate = data.find((d: CandidateData) => d.name === payload.value);
  
    if (!candidate) return null;
  
    return (
      <g transform={`translate(${x - 10},${y})`}>
        <foreignObject x={-140} y={-35} width="140" height="70">
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

export function DashboardChart({ initialData }: DashboardChartProps) {
  const [chartData, setChartData] = useState<CandidateData[]>(initialData.sort((a,b) => b.totalBets - a.totalBets))
  const [totalPot, setTotalPot] = useState(initialData.reduce((acc, curr) => acc + curr.totalBets, 0))

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newChartData = [...prevData]
        const randomIndex = Math.floor(Math.random() * newChartData.length)
        const randomAmount = Math.floor(Math.random() * 5 + 1) * 100 // 100 to 500 MWK
        
        newChartData[randomIndex].totalBets += randomAmount

        setTotalPot(pot => pot + randomAmount)
        
        return newChartData.sort((a, b) => b.totalBets - a.totalBets)
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])
  
  const chartConfig = chartData.reduce((acc, candidate) => {
    acc[candidate.name] = {
      label: candidate.name,
      color: candidateColors[candidate.name] || "hsl(var(--chart-1))",
    }
    return acc
  }, {} as any)

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
            data={chartData} 
            layout="vertical"
            margin={{ left: 20, right: 30, top: 20, bottom: 20 }}
            accessibilityLayer
            barCategoryGap="20%"
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
            <Bar dataKey="totalBets" layout="vertical" radius={5} animationDuration={800}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={candidateColors[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
