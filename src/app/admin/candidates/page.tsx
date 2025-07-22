
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCandidatesPage() {
  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Manage Candidates</h1>
        <p className="text-muted-foreground">Add, edit, or remove election candidates.</p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Candidate List</CardTitle>
          <CardDescription>A list of all candidates in the election.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Candidate management interface coming soon.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
