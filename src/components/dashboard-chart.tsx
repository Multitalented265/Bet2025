"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts"

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
}

type DashboardChartProps = {
  initialData: CandidateData[]
}

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
      color: "hsl(var(--primary))",
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
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ left: 10, right: 30 }}
            accessibilityLayer
            >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: "hsl(var(--foreground))", fontSize: 14 }}
              width={120}
              />
            <Tooltip
                cursor={{ fill: 'hsl(var(--background))' }}
                content={<ChartTooltipContent
                  formatter={(value) => `${value.toLocaleString()} MWK`}
                  nameKey="name"
                  hideLabel />}
              />
            <Bar dataKey="totalBets" layout="vertical" radius={5} animationDuration={800}>
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
