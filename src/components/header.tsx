"use client"

import Link from "next/link"
import { CircleUser, FileText, KeyRound, LogOut, Menu, Settings, ShieldCheck, User, Wallet } from "lucide-react"

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
import Logo from "./logo"
import { TopNav } from "./top-nav"

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-30">
        <Link href="/dashboard" className="hidden md:block">
            <Logo />
        </Link>
        <TopNav />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <TopNav isMobile={true} />
          </SheetContent>
        </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:flex-initial md:justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/wallet"><Wallet className="mr-2 h-4 w-4"/>Wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#"><User className="mr-2 h-4 w-4"/>Profile</Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href="#"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="#"><KeyRound className="mr-2 h-4 w-4"/>Password Change</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#"><FileText className="mr-2 h-4 w-4"/>Terms & Conditions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#"><ShieldCheck className="mr-2 h-4 w-4"/>Privacy Policy</Link>
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
