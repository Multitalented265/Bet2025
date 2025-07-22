
"use client"

import Link from "next/link"
import { CircleUser, Menu, Package, Users, DollarSign, LifeBuoy, ShieldQuestion, Settings, ReceiptText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Logo from "@/components/logo"
import { LogOut, LayoutDashboard } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 flex h-16 items-center border-b bg-card px-4 md:px-6 z-30">
      <nav className="hidden w-full md:flex md:items-center md:gap-6 text-sm font-medium">
         <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo />
            <span className="sr-only">Bet2025 Admin</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
           <Link
            href="/admin/users"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Users
          </Link>
           <Link
            href="/admin/candidates"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Candidates
          </Link>
          <Link
            href="/admin/bets"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Bets
          </Link>
           <Link
            href="/admin/revenue"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Transactions
          </Link>
           <Link
            href="/admin/support"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Support
          </Link>
      </nav>
      
      {/* Mobile Header */}
      <div className="flex w-full items-center gap-4 md:hidden">
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
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 text-lg font-semibold"
                    >
                        <Logo />
                        <span className="sr-only">Bet2025 Admin</span>
                    </Link>
                    <Link href="/admin/dashboard" className="hover:text-foreground">
                        <LayoutDashboard className="mr-2 h-4 w-4 inline-block" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/users"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Users className="mr-2 h-4 w-4 inline-block" />
                        Users
                    </Link>
                    <Link
                        href="/admin/candidates"
                        className="text-muted-foreground hover:text-foreground"
                    >
                         <Package className="mr-2 h-4 w-4 inline-block" />
                        Candidates
                    </Link>
                     <Link
                        href="/admin/bets"
                        className="text-muted-foreground hover:text-foreground"
                    >
                         <ReceiptText className="mr-2 h-4 w-4 inline-block" />
                        Bets
                    </Link>
                    <Link
                        href="/admin/revenue"
                        className="text-muted-foreground hover:text-foreground"
                    >
                         <DollarSign className="mr-2 h-4 w-4 inline-block" />
                        Transactions
                    </Link>
                     <Link
                        href="/admin/support"
                        className="text-muted-foreground hover:text-foreground"
                    >
                         <ShieldQuestion className="mr-2 h-4 w-4 inline-block" />
                        Support
                    </Link>
                </nav>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
      </div>


      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                 <Link href="/admin/support"><ShieldQuestion className="mr-2 h-4 w-4"/>Support</Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                <Link href="/admin/settings"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                <Link href="/"><LogOut className="mr-2 h-4 w-4"/>Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  )
}
