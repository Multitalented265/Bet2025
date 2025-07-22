
"use client"

import { useState, useMemo, useEffect, useTransition } from "react"
import { getUsers, updateUser } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Search, Calendar as CalendarIcon, X as ClearIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import type { Bet } from "@/components/bet-ticket";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { User } from "@/lib/data"

export default async function AdminUsersPage() {
    const users = await getUsers();
    return <AdminUsersClient initialUsers={users} />
}


function AdminUsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setLocalUsers] = useState<User[]>(initialUsers);
  let [isPending, startTransition] = useTransition();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: 'all',
    joinedAfter: null as Date | null,
    minAmount: '',
    maxAmount: ''
  });

  const { toast } = useToast();

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      status: 'all',
      joinedAfter: null,
      minAmount: '',
      maxAmount: ''
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchMatch = searchQuery === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = filters.status === 'all' || user.status === filters.status;
      const dateMatch = !filters.joinedAfter || new Date(user.joined + 'T00:00:00Z') >= filters.joinedAfter;

      const minAmount = parseFloat(filters.minAmount);
      const maxAmount = parseFloat(filters.maxAmount);
      const minAmountMatch = isNaN(minAmount) || user.totalBets >= minAmount;
      const maxAmountMatch = isNaN(maxAmount) || user.totalBets <= maxAmount;

      return searchMatch && statusMatch && dateMatch && minAmountMatch && maxAmountMatch;
    });
  }, [searchQuery, users, filters]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleViewClick = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleSuspendClick = (user: User) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;
    
    const formData = new FormData(event.currentTarget);
    const updatedData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
    };

    startTransition(async () => {
        await updateUser(selectedUser.id, updatedData);
        setLocalUsers(await getUsers());
        setEditDialogOpen(false);
        toast({ title: "User Updated", description: "The user's details have been saved." });
    });
  };
  
  const handleConfirmSuspend = () => {
    if (!selectedUser) return;
    
    const newStatus = selectedUser.status === 'Active' ? 'Suspended' : 'Active';
    
    startTransition(async () => {
        await updateUser(selectedUser.id, { status: newStatus });
        setLocalUsers(await getUsers());
        setSuspendDialogOpen(false);
        toast({ title: "User Status Changed", description: `${selectedUser.name}'s status has been set to ${newStatus}.` });
    });
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4 p-4 border rounded-lg bg-muted/50">
             <div className="relative flex-grow min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
                />
            </div>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !filters.joinedAfter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.joinedAfter ? format(filters.joinedAfter, "PPP") : <span>Joined after...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.joinedAfter ?? undefined}
                  onSelect={(date) => handleFilterChange('joinedAfter', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex flex-grow items-center gap-2">
                <Input 
                    type="number" 
                    placeholder="Min Bet Amount" 
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    className="min-w-[120px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input 
                    type="number" 
                    placeholder="Max Bet Amount" 
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    className="min-w-[120px]"
                />
            </div>
            <Button variant="ghost" onClick={clearFilters}>
              <ClearIcon className="mr-2 h-4 w-4"/>
              Clear Filters
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Bet Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.totalBets.toLocaleString()} MWK</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.joined + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
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
                <Input id="name" name="name" defaultValue={selectedUser?.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={selectedUser?.email} className="col-span-3" />
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
            <DialogContent className="sm:max-w-2xl">
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
                            <span className="font-medium">{new Date(selectedUser.joined + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
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

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Betting History</h3>
                      {selectedUser.bets.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ticket ID</TableHead>
                              <TableHead>Candidate</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.bets.map(bet => (
                              <TableRow key={bet.id}>
                                <TableCell className="font-mono">{bet.id}</TableCell>
                                <TableCell>{bet.candidateName}</TableCell>
                                <TableCell>{bet.amount.toLocaleString()} MWK</TableCell>
                                <TableCell>{new Date(bet.placedDate + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                                <TableCell>
                                    <Badge variant={bet.status === 'Won' ? 'default' : bet.status === 'Lost' ? 'destructive' : 'secondary'}>
                                        {bet.status}
                                    </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                          <p>This user has not placed any bets.</p>
                        </div>
                      )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {/* Suspend User Alert Dialog */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {selectedUser?.status === 'Active' ? 'suspend' : 'reactivate'} the user account for <span className="font-bold">{selectedUser?.name}</span>. They {selectedUser?.status === 'Active' ? 'will not' : 'will'} be able to access the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSuspend} className={selectedUser?.status === 'Active' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''} disabled={isPending}>
              {isPending ? "Updating..." : `Yes, ${selectedUser?.status === 'Active' ? 'Suspend' : 'Reactivate'} User`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    