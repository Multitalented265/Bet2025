
"use client"

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Search, MoreHorizontal, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Bet } from "@/components/bet-ticket";

type FullUserType = {
  id: string;
  name: string | null;
  email: string | null;
  balance: number;
  status: string;
};

type UserForAdmin = FullUserType & {
  totalBets: number;
  bets: Bet[];
  joined: string;
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

export function AdminUsersClient({ initialUsers }: { initialUsers: UserForAdmin[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        status: "all",
        minBets: "",
        maxBets: ""
    });
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserForAdmin | null>(null);
    const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

    async function fetchUserTransactions() {
        // This would fetch transactions for the selected user
        // Implementation depends on your API structure
    }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
            status: "all",
            minBets: "",
            maxBets: ""
    });
  };

  const filteredUsers = useMemo(() => {
        return initialUsers.filter(user => {
      const searchMatch = searchQuery === '' || 
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = filters.status === 'all' || user.status === filters.status;
            
            const betAmountMatch = (!filters.minBets || user.totalBets >= parseFloat(filters.minBets)) &&
                                 (!filters.maxBets || user.totalBets <= parseFloat(filters.maxBets));

            return searchMatch && statusMatch && betAmountMatch;
        });
    }, [searchQuery, filters, initialUsers]);

  const handleEditClick = (user: UserForAdmin) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleViewClick = (user: UserForAdmin) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleSuspendClick = (user: UserForAdmin) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
        setIsPending(true);
    
    const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;

        // Here you would typically make an API call to update the user
        // For now, we'll just show a success message
        setTimeout(() => {
            toast({
                title: "User Updated",
                description: "User information has been updated successfully.",
            });
            setEditDialogOpen(false);
            setIsPending(false);
        }, 1000);
  };
  
  const handleConfirmSuspend = () => {
    if (!selectedUser) return;
    
        setIsPending(true);
        
        // Here you would typically make an API call to suspend/reactivate the user
        setTimeout(() => {
            toast({
                title: selectedUser.status === 'Active' ? "User Suspended" : "User Reactivated",
                description: `User has been ${selectedUser.status === 'Active' ? 'suspended' : 'reactivated'} successfully.`,
            });
        setSuspendDialogOpen(false);
            setIsPending(false);
        }, 1000);
  };

  return (
        <div className="space-y-6">
      <div>
                <h1 className="text-3xl font-bold font-headline">User Management</h1>
                <p className="text-muted-foreground">
                    Manage user accounts, view betting history, and monitor user activity.
                </p>
      </div>

      <Card>
        <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A comprehensive list of all registered users and their betting activity.</CardDescription>
        </CardHeader>
        <CardContent>
                    <div className="mb-4 space-y-4">
                        <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                                placeholder="Search by name, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
                />
            </div>
                        
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>
                            
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-1 border rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                            
                            <div className="flex items-center gap-2">
                <Input 
                    type="number" 
                                    placeholder="Min bets"
                                    value={filters.minBets}
                                    onChange={(e) => handleFilterChange('minBets', e.target.value)}
                                    className="w-24"
                                />
                                <span className="text-sm">to</span>
                <Input 
                    type="number" 
                                    placeholder="Max bets"
                                    value={filters.maxBets}
                                    onChange={(e) => handleFilterChange('maxBets', e.target.value)}
                                    className="w-24"
                />
            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="flex items-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                Clear
            </Button>
          </div>
                    </div>

          <Table>
            <TableHeader>
              <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                                <TableHead>Total Bets</TableHead>
                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                                    <TableCell className="font-mono">{user.id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.totalBets.toLocaleString()} MWK</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                                    <TableCell>{formatDate(user.joined)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewClick(user)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSuspendClick(user)} 
                          className={user.status === 'Active' ? 'text-destructive' : ''}
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>Make changes to the user's profile below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={selectedUser?.name ?? ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selectedUser?.email ?? ""} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={isViewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{selectedUser.name}</DialogTitle>
                    <DialogDescription>User ID: {selectedUser.id}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined:</span>
                                    <span className="font-medium">{formatDate(selectedUser.joined)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={selectedUser.status === 'Active' ? 'secondary' : 'destructive'}>
                                {selectedUser.status}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Bets:</span>
                            <span className="font-medium">{selectedUser.totalBets.toLocaleString()} MWK</span>
                        </div>
                    </div>
                    
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Betting History</h3>
                          {selectedUser.bets.length > 0 ? (
                            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Candidate</TableHead>
                                  <TableHead>Amount</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                                    {selectedUser.bets.map((bet) => (
                                  <TableRow key={bet.id}>
                                    <TableCell>{bet.candidateName}</TableCell>
                                    <TableCell>{bet.amount.toLocaleString()} MWK</TableCell>
                                                            <TableCell>
                                                                <Badge variant={bet.status === 'Won' ? 'default' : bet.status === 'Lost' ? 'destructive' : 'secondary'}>
                                                                    {bet.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{formatDate(bet.placedDate)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            </div>
                          ) : (
                                        <p className="text-muted-foreground">No betting history available.</p>
                          )}
                        </div>
                                
                         <div>
                                    <h3 className="text-lg font-semibold mb-2">Account Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Current Balance:</span>
                                            <span className="font-medium">{selectedUser.balance.toLocaleString()} MWK</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Bets Placed:</span>
                                            <span className="font-medium">{selectedUser.bets.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Account Status:</span>
                                            <Badge variant={selectedUser.status === 'Active' ? 'secondary' : 'destructive'}>
                                                {selectedUser.status}
                                        </Badge>
                                        </div>
                                    </div>
                            </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Suspend/Reactivate User Dialog */}
            {selectedUser && (
                <Dialog open={isSuspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedUser.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedUser.status === 'Active' 
                                    ? `Are you sure you want to suspend ${selectedUser.name}? They will not be able to place bets until reactivated.`
                                    : `Are you sure you want to reactivate ${selectedUser.name}? They will be able to place bets again.`
                                }
                            </DialogDescription>
                        </DialogHeader>
                <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setSuspendDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                variant={selectedUser.status === 'Active' ? 'destructive' : 'default'}
                                onClick={handleConfirmSuspend}
                                disabled={isPending}
                            >
                                {isPending ? "Processing..." : selectedUser.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
                            </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
