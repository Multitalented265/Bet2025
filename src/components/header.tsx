
"use client"

import Link from "next/link"
import { CircleUser, Menu, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Logo from "./logo"
import { TopNav } from "./top-nav"
import { User, FileText, ShieldCheck, LogOut } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center border-b bg-card px-4 md:px-6 z-30">
      {/* Desktop Header */}
      <div className="hidden w-full md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
              <Logo />
          </Link>
          <TopNav />
        </div>
        <div className="flex-none">
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
                <Link href="/profile"><User className="mr-2 h-4 w-4"/>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link href="/wallet"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 lucide lucide-wallet"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>Wallet</Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                <Link href="#"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
              <TopNav isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Logo */}
        <div className="justify-self-center">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        
        {/* Placeholder for right side to ensure centering */}
        <div className="justify-self-end"></div>
      </div>
    </header>
  )
}
