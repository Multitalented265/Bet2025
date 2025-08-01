
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Shield, LogOut, Settings, Menu, CircleUser } from "lucide-react";
import { AdminTopNav } from "./admin-top-nav";

export function AdminHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        router.push("/admin/login");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: "Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during logout.",
      });
    }
  };

  return (
    <header className="sticky top-0 flex h-16 items-center border-b bg-card px-4 md:px-6 z-30">
      {/* Desktop Header */}
      <div className="hidden w-full md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
          <AdminTopNav />
        </div>
        
        <div className="flex-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle admin menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="grid grid-cols-3 items-center w-full md:hidden">
        {/* Mobile Navigation */}
        <div className="justify-self-start">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <AdminTopNav isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Logo */}
        <div className="justify-self-center">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Admin</span>
          </Link>
        </div>
        
        {/* Mobile User Menu */}
        <div className="justify-self-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle admin menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
