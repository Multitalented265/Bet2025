
"use client"

import { useState } from "react"
import { useBets } from "@/context/bet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import type { Bet } from "@/components/bet-ticket";

type User = {
  id: string;
  name: string;
  email: string;
  joined: string;
  status: "Active" | "Suspended";
  totalBets: number;
  bets: Bet[];
};

const initialUsers: Omit<User, 'totalBets' | 'bets'>[] = [
  { id: "user-123", name: "John Doe", email: "john.doe@example.com", joined: "2024-07-20", status: "Active" },
  { id: "user-456", name: "Jane Smith", email: "jane.smith@example.com", joined: "2024-07-15", status: "Active" },
  { id: "user-789", name: "Charlie Brown", email: "charlie@example.com", joined: "2024-07-05", status: "Suspended" },
];

export default function AdminUsersPage() {
  const { bets: allBets } = useBets();
  
  const processedUsers: User[] = initialUsers.map(user => {
    const userBets = allBets.filter(bet => bet.userId === user.id);
    const totalBets = userBets.reduce((acc, bet) => acc + bet.amount, 0);
    return { ...user, bets: userBets, totalBets };
  });

  const [users, setUsers] = useState<User[]>(processedUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const { toast } = useToast();

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
    const updatedUser = {
      ...selectedUser,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditDialogOpen(false);
    toast({ title: "User Updated", description: "The user's details have been saved." });
  };
  
  const handleConfirmSuspend = () => {
    if (!selectedUser) return;
    
    const newStatus = selectedUser.status === 'Active' ? 'Suspended' : 'Active';
    const updatedUser = { ...selectedUser, status: newStatus };

    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setSuspendDialogOpen(false);
    toast({ title: "User Status Changed", description: `${selectedUser.name}'s status has been set to ${newStatus}.` });
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
              {users.map((user) => (
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
              <Button type="submit">Save Changes</Button>
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.bets.map(bet => (
                              <TableRow key={bet.id}>
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
            <AlertDialogAction onClick={handleConfirmSuspend} className={selectedUser?.status === 'Active' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
              Yes, {selectedUser?.status === 'Active' ? 'Suspend' : 'Reactivate'} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    