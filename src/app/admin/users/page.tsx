
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
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
           <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>User management interface coming soon.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
