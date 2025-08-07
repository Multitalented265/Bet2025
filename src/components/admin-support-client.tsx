
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, Clock, ShieldQuestion } from "lucide-react";

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

type AdminSupportClientProps = {
    initialTickets: SupportTicket[];
}

// Utility function to format dates reliably
const formatDate = (dateInput: any): string => {
  try {
    let dateObj: Date;
    
    if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else if (typeof dateInput === 'string') {
      dateObj = new Date(dateInput);
    } else {
      dateObj = new Date();
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  } catch (error) {
    console.error('Date formatting error:', error, dateInput);
    return 'Invalid Date';
  }
};

export function AdminSupportClient({ initialTickets }: AdminSupportClientProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [filter, setFilter] = useState<'all' | 'Open' | 'Closed'>('all');
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (ticketId: string, newStatus: 'Open' | 'Closed') => {
    setIsPending(true);
    
    // Simulate API call
    setTimeout(() => {
        // Optimistically update the UI
        setTickets(prevTickets => prevTickets.map(t => 
            t.id === ticketId ? { ...t, status: newStatus } : t
        ));

        toast({
            title: 'Ticket Updated',
            description: `Ticket ${ticketId} has been marked as ${newStatus}.`,
        });
        setIsPending(false);
    }, 500);
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
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
          <Select value={filter} onValueChange={(value: 'all' | 'Open' | 'Closed') => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="Open">Open Tickets</SelectItem>
              <SelectItem value="Closed">Closed Tickets</SelectItem>
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
                        {formatDate(ticket.date)}
                    </p>
                  </div>
                  <p className="mt-4 text-sm bg-muted/50 p-3 rounded-md">{ticket.message}</p>
                  <div className="flex justify-end items-center gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handleReply(ticket.user.email)}>
                        <Mail className="mr-2 h-4 w-4"/> Reply
                    </Button>
                    {ticket.status === 'Open' ? (
                      <Button size="sm" onClick={() => handleStatusChange(ticket.id, 'Closed')} disabled={isPending}>
                        <CheckCircle className="mr-2 h-4 w-4"/> {isPending ? "Updating..." : "Mark as Resolved"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleStatusChange(ticket.id, 'Open')} disabled={isPending}>
                        <Clock className="mr-2 h-4 w-4"/> {isPending ? "Updating..." : "Re-open Ticket"}
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <ShieldQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No tickets found</h3>
                <p className="mt-1 text-sm text-muted-foreground">There are no tickets matching the current filter.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
