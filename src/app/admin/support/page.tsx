
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldQuestion, Mail, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SupportTicket = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  subject: string;
  message: string;
  date: string;
  status: 'Open' | 'Closed';
};

const mockTickets: SupportTicket[] = [
  {
    id: 'TKT-001',
    user: { name: 'John Doe', email: 'john.doe@example.com' },
    subject: 'Withdrawal Issue',
    message: 'I tried to withdraw my winnings but the transaction failed. Can you please check what happened? My balance is correct.',
    date: '2024-07-26',
    status: 'Open',
  },
  {
    id: 'TKT-002',
    user: { name: 'Jane Smith', email: 'jane.smith@example.com' },
    subject: 'Question about Bet Settlement',
    message: "My bet on Lazarus Chakwera was marked as 'Lost' but he won the election. Could this be a mistake?",
    date: '2024-07-25',
    status: 'Open',
  },
  {
    id: 'TKT-003',
    user: { name: 'Charlie Brown', email: 'charlie@example.com' },
    subject: 'Account Suspended',
    message: "Why is my account suspended? I haven't done anything wrong. Please reactivate it.",
    date: '2024-07-24',
    status: 'Closed',
  },
];


export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');
  const { toast } = useToast();

  const handleStatusChange = (ticketId: string, newStatus: 'Open' | 'Closed') => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    toast({
      title: 'Ticket Updated',
      description: `Ticket ${ticketId} has been marked as ${newStatus}.`,
    });
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status.toLowerCase() === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Support Inbox</h1>
        <p className="text-muted-foreground">Manage and respond to user support requests.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>
              {filteredTickets.length} ticket(s) matching the current filter.
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={(value: 'all' | 'open' | 'closed') => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open Tickets</SelectItem>
              <SelectItem value="closed">Closed Tickets</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-4">
                         <Badge variant={ticket.status === 'Open' ? 'destructive' : 'secondary'}>
                          {ticket.status}
                        </Badge>
                        <h3 className="font-semibold">{ticket.subject}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {ticket.user.name} ({ticket.user.email})
                      </p>
                    </div>
                     <p className="text-xs text-muted-foreground">
                        {new Date(ticket.date + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="mt-4 text-sm bg-muted/50 p-3 rounded-md">{ticket.message}</p>
                  <div className="flex justify-end items-center gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handleReply(ticket.user.email)}>
                        <Mail className="mr-2 h-4 w-4"/> Reply
                    </Button>
                    {ticket.status === 'Open' ? (
                      <Button size="sm" onClick={() => handleStatusChange(ticket.id, 'Closed')}>
                        <CheckCircle className="mr-2 h-4 w-4"/> Mark as Resolved
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusChange(ticket.id, 'Open')}>
                        <Clock className="mr-2 h-4 w-4"/> Re-open Ticket
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>No tickets found for this filter.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
