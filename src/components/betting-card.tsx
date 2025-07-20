
"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useBets } from "@/context/bet-context"

const betSchema = z.object({
  amount: z.coerce.number().int().min(100, "Minimum bet is 100 MWK.").refine(
    (val) => val % 100 === 0,
    { message: "Bet must be in multiples of 100 MWK." }
  ),
})

type BettingCardProps = {
  candidate: {
    id: number
    name: string
    image: string
    hint: string
  }
  onBet: (candidateId: number, amount: number) => void
  disabled?: boolean
}

export function BettingCard({ candidate, onBet, disabled = false }: BettingCardProps) {
  const { toast } = useToast()
  const { addBet } = useBets();
  
  const form = useForm<z.infer<typeof betSchema>>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      amount: 100,
    },
  })

  function onSubmit(values: z.infer<typeof betSchema>) {
    onBet(candidate.id, values.amount)
    addBet({
      candidateName: candidate.name,
      amount: values.amount,
    })
    toast({
      title: "Bet Placed!",
      description: `Your ${values.amount} MWK bet on ${candidate.name} has been placed.`,
    })
    form.reset()
  }

  return (
    <Card className={`w-full transform transition-all duration-300 ${!disabled ? 'hover:scale-105 hover:shadow-xl' : 'opacity-70'}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={disabled}>
            <CardHeader>
              <CardTitle className="text-center font-headline text-2xl">{candidate.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-primary shadow-lg">
                <Image
                  src={candidate.image}
                  alt={`Photo of ${candidate.name}`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={candidate.hint}
                />
              </div>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-center block">Bet Amount (MWK)</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" step="100" className="text-center text-lg font-bold w-full" />
                      </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-bold">Place Bet</Button>
            </CardFooter>
          </fieldset>
        </form>
      </Form>
    </Card>
  )
}
