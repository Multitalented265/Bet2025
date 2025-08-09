
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
    <Card className={`w-full h-full flex flex-col transform transition-all duration-300 ${!isCardDisabled ? 'hover:scale-105 hover:shadow-xl' : 'opacity-70'}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <fieldset disabled={isCardDisabled || isPending} className="flex flex-col h-full">
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
                  fallbackClassName="absolute inset-0 rounded-full text-3xl font-bold bg-muted flex items-center justify-center"
                />
                {candidate.status === 'Withdrawn' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-lg rotate-[-15deg] border-2 border-white p-2 rounded">WITHDRAWN</span>
                  </div>
                )}
              </div>
              <div className="w-full max-w-[200px]">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-center block text-sm font-medium">Bet Amount (MWK)</FormLabel>
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
                      <FormMessage className="text-center text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-shrink-0">
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
