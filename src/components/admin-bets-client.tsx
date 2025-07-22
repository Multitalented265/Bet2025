
"use client"

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Bet } from "@/components/bet-ticket";

type BetWithUser = Bet & { userName: string };

export function AdminBetsClient({ initialBets }: { initialBets: BetWithUser[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBets = useMemo(() => {
        return initialBets.filter(bet => {
            const searchMatch = searchQuery === '' ||
                bet.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bet.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bet.candidateName.toLowerCase().includes(searchQuery.toLowerCase());
            
            return searchMatch;
        });
    }, [searchQuery, initialBets]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">All Bets</h1>
                <p className="text-muted-foreground">
                    Search and verify all bets placed on the platform.
                </p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Betting Ledger</CardTitle>
                    <CardDescription>A complete log of all bets placed by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by Bet ID, User Name, or Candidate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bet Ticket ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBets.map((bet) => (
                                <TableRow key={bet.id}>
                                    <TableCell className="font-mono">{bet.id}</TableCell>
                                    <TableCell>{bet.userName}</TableCell>
                                    <TableCell>{bet.candidateName}</TableCell>
                                    <TableCell>{new Date(bet.placedDate + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                                    <TableCell>
                                        <Badge variant={bet.status === 'Won' ? 'default' : bet.status === 'Lost' ? 'destructive' : 'secondary'}>
                                            {bet.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{bet.amount.toLocaleString()} MWK</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
