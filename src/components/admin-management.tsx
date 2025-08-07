'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Edit, Trash2 } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [editForm, setEditForm] = useState({
    adminId: '',
    email: '',
    password: '',
    name: ''
  });
  const { toast } = useToast();

  // Load existing admins
  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Create new admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Admin account created successfully'
        });
        setCreateForm({ email: '', password: '', name: '' });
        loadAdmins();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create admin account'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Admin account updated successfully'
        });
        setEditForm({ adminId: '', email: '', password: '', name: '' });
        loadAdmins();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update admin account'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to deactivate this admin account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/update?id=${adminId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Admin account deactivated successfully'
        });
        loadAdmins();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deactivate admin account'
      });
    }
  };

  // Select admin for editing
  const selectAdminForEdit = (admin: Admin) => {
    setEditForm({
      adminId: admin.id,
      email: admin.email,
      password: '',
      name: admin.name
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <CardDescription>
            Create and manage admin accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Admin</TabsTrigger>
              <TabsTrigger value="edit">Edit Admin</TabsTrigger>
              <TabsTrigger value="list">Admin List</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="edit" className="space-y-4">
              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-admin">Select Admin</Label>
                  <select
                    id="edit-admin"
                    className="w-full p-2 border rounded"
                    value={editForm.adminId}
                    onChange={(e) => {
                      const admin = admins.find(a => a.id === e.target.value);
                      if (admin) {
                        selectAdminForEdit(admin);
                      }
                    }}
                  >
                    <option value="">Select an admin...</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading || !editForm.adminId}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Admin
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="space-y-4">
                {admins.map(admin => (
                  <Card key={admin.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{admin.name}</h3>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectAdminForEdit(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {admins.length === 0 && (
                  <Alert>
                    <AlertDescription>No admin accounts found.</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 