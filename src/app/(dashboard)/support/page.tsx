
"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { LifeBuoy, Send } from "lucide-react"
import { handleCreateSupportTicket } from "@/actions/user"

const faqs = [
    {
        question: "How do I place a bet?",
        answer: "To place a bet, go to the Home page, find the candidate you want to bet on, enter the amount you wish to wager in the input field, and click the 'Place Bet' button. Your bet must be a multiple of 100 MWK."
    },
    {
        question: "How are winnings calculated?",
        answer: "We use a pari-mutuel system. All bets go into a single prize pool. If your candidate wins, the total pool is divided among all winning bettors, proportional to how much they bet. You can find a detailed example on the Home page."
    },
    {
        question: "How do I deposit or withdraw money?",
        answer: "Navigate to the 'Wallet' page. From there, you can choose to either 'Deposit' or 'Withdraw' funds. Follow the on-screen instructions to complete your transaction. Please note that a 2.5% fee applies to all transactions."
    },
    {
        question: "What happens if a candidate withdraws?",
        answer: "If a candidate withdraws from the election, all betting on that candidate is closed. In a real-world scenario, policies for handling existing bets on withdrawn candidates would apply, such as refunding the stakes. For this prototype, the bets remain but will be settled as 'Lost'."
    }
]

export default function SupportPage() {
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        
        startTransition(async () => {
            try {
                await handleCreateSupportTicket(formData);
                toast({
                    title: "Message Sent!",
                    description: "Our support team has received your message and will get back to you shortly.",
                })
                form.reset();
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: "Please fill out all required fields.",
                })
            }
        });
    }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Support Center</h1>
        <p className="text-muted-foreground">Get help with your account or find answers to common questions.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find quick answers to common questions below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
             </Card>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-full">
                            <LifeBuoy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                             <CardTitle>Contact Support</CardTitle>
                            <CardDescription>Can't find an answer? Reach out to us.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" required rows={5} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPending}>
                            <Send className="mr-2" />
                            {isPending ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
