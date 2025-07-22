
"use client"

import { useState, useTransition } from "react"
import { getCandidates } from "@/lib/data"
import { handleAddCandidate, handleUpdateCandidate, handleRemoveCandidate, handleUpdateCandidateStatus } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import type { CandidateData } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

type AdminCandidatesPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

// This page now needs to be async to fetch initial data on the server.
export default async function AdminCandidatesPage({ searchParams }: AdminCandidatesPageProps) {
  const candidates = await getCandidates();
  
  // The client-side logic is wrapped in a new component.
  return <AdminCandidatesClient candidates={candidates} />;
}


// --- Client Component ---

function AdminCandidatesClient({ candidates: initialCandidates }: { candidates: CandidateData[] }) {
  const { toast } = useToast()
  let [isPending, startTransition] = useTransition();

  const [isAddDialogOpen, setAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null)

  const onAddNewCandidate = async (formData: FormData) => {
    startTransition(async () => {
      await handleAddCandidate(formData);
      toast({ title: "Candidate Added", description: `The new candidate has been added.` });
      setAddDialogOpen(false);
    });
  };

  const onEditCandidate = async (formData: FormData) => {
    if (!selectedCandidate) return;
    startTransition(async () => {
      await handleUpdateCandidate(selectedCandidate.id, formData);
      toast({ title: "Candidate Updated", description: "The candidate's details have been saved." });
      setEditDialogOpen(false);
    });
  };

  const onConfirmStatusChange = async () => {
    if (!selectedCandidate) return;
    startTransition(async () => {
      await handleUpdateCandidateStatus(selectedCandidate.id, selectedCandidate.status);
      toast({ title: "Status Updated", description: `${selectedCandidate.name}'s status has been changed.` });
      setStatusDialogOpen(false);
    });
  };

  const onConfirmRemove = async () => {
    if (!selectedCandidate) return;
    startTransition(async () => {
      await handleRemoveCandidate(selectedCandidate.id);
      toast({ title: "Candidate Removed", description: `${selectedCandidate.name} has been removed.` });
      setRemoveDialogOpen(false);
    });
  };


  const handleEditClick = (candidate: CandidateData) => {
    setSelectedCandidate(candidate)
    setEditDialogOpen(true)
  }

  const handleStatusClick = (candidate: CandidateData) => {
    setSelectedCandidate(candidate)
    setStatusDialogOpen(true)
  }

  const handleRemoveClick = (candidate: CandidateData) => {
    setSelectedCandidate(candidate)
    setRemoveDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Candidates</h1>
        <p className="text-muted-foreground">Add, edit, or remove election candidates.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Candidate List</CardTitle>
            <CardDescription>A list of all candidates in the election.</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Candidate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>
                  Enter the details for the new candidate below.
                </DialogDescription>
              </DialogHeader>
              <form action={onAddNewCandidate}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hint" className="text-right">AI Hint</Label>
                    <Input id="hint" name="hint" placeholder="e.g. malawian man" className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">Color Code</Label>
                    <Input id="color" name="color" placeholder="#FF0000" className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Candidate"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Total Bets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={candidate.image} alt={candidate.name} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: candidate.color }}></span>
                        <span className="font-medium">{candidate.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.totalBets.toLocaleString()} MWK</TableCell>
                  <TableCell>
                     <Badge variant={candidate.status === 'Active' ? 'secondary' : 'outline'}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(candidate)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusClick(candidate)}>
                          {candidate.status === 'Active' ? 'Mark as Withdrawn' : 'Re-instate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveClick(candidate)}>
                          Remove
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

      {/* Edit Dialog */}
      {selectedCandidate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Candidate: {selectedCandidate.name}</DialogTitle>
            </DialogHeader>
            <form action={onEditCandidate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" defaultValue={selectedCandidate.name} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" defaultValue={selectedCandidate.image} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hint" className="text-right">AI Hint</Label>
                    <Input id="hint" name="hint" defaultValue={selectedCandidate.hint} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">Color Code</Label>
                    <Input id="color" name="color" defaultValue={selectedCandidate.color} className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                 <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Change Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of <span className="font-bold">{selectedCandidate?.name}</span> to <span className="font-bold">{selectedCandidate?.status === 'Active' ? 'Withdrawn' : 'Active'}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmStatusChange} disabled={isPending}>
                {isPending ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently remove <span className="font-bold">{selectedCandidate?.name}</span> from the election? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

