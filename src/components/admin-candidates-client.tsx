
"use client"

import { useState, useTransition } from "react"
import { handleAddCandidate, handleUpdateCandidate, handleRemoveCandidate, handleUpdateCandidateStatus } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SafeImage } from "@/components/ui/safe-image"
import { ImageUpload } from "@/components/ui/image-upload"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import type { CandidateData } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

// This is a Client Component. It handles all state and interactivity.
export function AdminCandidatesClient({ initialCandidates }: { initialCandidates: CandidateData[] }) {
  const { toast } = useToast()
  let [isPending, startTransition] = useTransition();

  const [isAddDialogOpen, setAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null)
  const [newCandidateImage, setNewCandidateImage] = useState("")
  const [editCandidateImage, setEditCandidateImage] = useState("")

  // Note: The component now receives candidates via props, no need to fetch here.
  const candidates = initialCandidates;

  const onAddNewCandidate = async (formData: FormData) => {
    startTransition(async () => {
      try {
        // Add the image URL to the form data
        if (newCandidateImage) {
          formData.append('imageUrl', newCandidateImage);
        }
        await handleAddCandidate(formData);
        toast({ title: "Candidate Added", description: `The new candidate has been added.` });
        setAddDialogOpen(false);
        setNewCandidateImage(""); // Reset image state
      } catch (error) {
        console.error('Error adding candidate:', error);
        toast({ 
          title: "Error", 
          description: error instanceof Error ? error.message : "Failed to add candidate",
          variant: "destructive"
        });
      }
    });
  };

  const onEditCandidate = async (formData: FormData) => {
    if (!selectedCandidate) return;
    startTransition(async () => {
      try {
        // Add the image URL to the form data if it has changed
        if (editCandidateImage && editCandidateImage !== selectedCandidate.image) {
          formData.append('imageUrl', editCandidateImage);
        }
        await handleUpdateCandidate(selectedCandidate.id, formData);
        toast({ title: "Candidate Updated", description: "The candidate's details have been saved." });
        setEditDialogOpen(false);
        setEditCandidateImage(""); // Reset image state
      } catch (error) {
        console.error('Error updating candidate:', error);
        toast({ 
          title: "Error", 
          description: error instanceof Error ? error.message : "Failed to update candidate",
          variant: "destructive"
        });
      }
    });
  };

  const onConfirmStatusChange = async () => {
    if (!selectedCandidate) return;
    startTransition(async () => {
      try {
        await handleUpdateCandidateStatus(selectedCandidate.id, selectedCandidate.status);
        toast({ title: "Status Updated", description: `${selectedCandidate.name}'s status has been changed.` });
        setStatusDialogOpen(false);
      } catch (error) {
        console.error('Error updating candidate status:', error);
        toast({ 
          title: "Error", 
          description: error instanceof Error ? error.message : "Failed to update candidate status",
          variant: "destructive"
        });
      }
    });
  };

  const onConfirmRemove = async () => {
    if (!selectedCandidate) return;
    startTransition(async () => {
      try {
        await handleRemoveCandidate(selectedCandidate.id);
        toast({ title: "Candidate Removed", description: `${selectedCandidate.name} has been removed.` });
        setRemoveDialogOpen(false);
      } catch (error) {
        console.error('Error removing candidate:', error);
        toast({ 
          title: "Error", 
          description: error instanceof Error ? error.message : "Failed to remove candidate",
          variant: "destructive"
        });
      }
    });
  };


  const handleEditClick = (candidate: CandidateData) => {
    setSelectedCandidate(candidate)
    setEditCandidateImage(candidate.image) // Initialize with current image
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
                  <div className="col-span-4">
                    <ImageUpload
                      value={newCandidateImage}
                      onChange={setNewCandidateImage}
                      label="Candidate Image"
                    />
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
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                                             <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm flex-shrink-0">
                         <SafeImage
                           src={candidate.image}
                           alt={`Photo of ${candidate.name}`}
                           fill
                           sizes="40px"
                           className="object-cover object-center"
                           fallbackText={candidate.name.charAt(0)}
                           fallbackClassName="absolute inset-0 rounded-full text-sm font-medium"
                         />
                      </div>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: candidate.color }}></span>
                        <span className="font-medium truncate">{candidate.name}</span>
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
                <div className="col-span-4">
                  <ImageUpload
                    value={editCandidateImage || selectedCandidate.image}
                    onChange={setEditCandidateImage}
                    label="Candidate Image"
                  />
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
