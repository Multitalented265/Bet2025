
"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SafeImage } from "@/components/ui/safe-image"
import { useToast } from "@/hooks/use-toast"
import { handleError } from "@/lib/utils"
import type { CandidateData } from "@/lib/data"
import { handleBetPlacement } from "@/actions/bet"

const betSchema = z.object({
  amount: z.number().min(100, "Minimum bet is 100 MWK").max(1000000, "Maximum bet is 1,000,000 MWK"),
});

type BettingCardProps = {
  candidate: CandidateData;
  disabled?: boolean;
  bettingEnabled?: boolean;
}

export function BettingCard({ candidate, disabled = false, bettingEnabled = true }: BettingCardProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<z.infer<typeof betSchema>>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      amount: 100, // Back to 100 as initial amount
    },
  })

  function onSubmit(values: z.infer<typeof betSchema>) {
    startTransition(async () => {
      try {
        const result = await handleBetPlacement(candidate.id, values.amount);
        
        if (result.success) {
          toast({
            title: "Bet Placed!",
            description: `Your ${values.amount.toLocaleString('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 0 })} bet on ${candidate.name} has been placed.`,
          });
          form.reset();
        } else {
          // Handle error from server action
          const userFriendlyMessage = handleError(result.error || "An unexpected error occurred");
          toast({
            variant: "destructive",
            title: "Betting Failed",
            description: userFriendlyMessage,
          });
        }
      } catch (error) {
        // Handle unexpected errors (network, etc.)
        const userFriendlyMessage = handleError(error as Error);
        toast({
          variant: "destructive",
          title: "Betting Failed",
          description: userFriendlyMessage,
        });
      }
    });
  }
  
  const isCardDisabled = disabled || !bettingEnabled || candidate.status === 'Withdrawn';
  
  const getButtonText = () => {
    if (isPending) return 'Placing Bet...';
    if (candidate.status === 'Withdrawn') return 'Betting Closed';
    if (disabled) return 'Election Over';
    if (!bettingEnabled) return 'Betting Stopped';
    return 'Place Bet';
  }

  return (
    <Card className={`w-full transform transition-all duration-300 ${!isCardDisabled ? 'hover:scale-105 hover:shadow-xl' : 'opacity-70'}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isCardDisabled || isPending}>
            <CardHeader>
              <CardTitle className="text-center font-headline text-2xl">{candidate.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-primary shadow-lg flex-shrink-0">
                <SafeImage
                  src={candidate.image}
                  alt={`Photo of ${candidate.name}`}
                  fill
                  sizes="160px"
                  className="object-cover object-center"
                  priority
                  fallbackText={candidate.name.charAt(0)}
                  fallbackClassName="absolute inset-0 rounded-full text-4xl font-bold"
                />
                {candidate.status === 'Withdrawn' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-lg rotate-[-15deg] border-2 border-white p-2 rounded">WITHDRAWN</span>
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-center block">Bet Amount (MWK)</FormLabel>
                    <FormControl>
                        <Input 
                          {...field}
                          type="number" 
                          step="1000" 
                          className="text-center text-lg font-bold w-full"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-bold">
                 {getButtonText()}
              </Button>
            </CardFooter>
          </fieldset>
        </form>
      </Form>
    </Card>
  )
}
