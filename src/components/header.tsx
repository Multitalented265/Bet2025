
"use client"

import { useState } from "react"
import Link from "next/link"
import { CircleUser, Menu, Settings, LifeBuoy } from "lucide-react"

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
import { Wallet, LogOut, ShieldCheck } from "lucide-react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 flex h-16 items-center border-b bg-card px-4 md:px-6 z-30">
      {/* Desktop Header */}
      <div className="hidden w-full md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
              <Logo size="md" />
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
                <Link href="/settings"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support"><LifeBuoy className="mr-2 h-4 w-4"/>Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
              <TopNav isMobile={true} onLinkClick={handleMobileMenuClose} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Logo */}
        <div className="justify-self-center">
          <Link href="/dashboard">
            <Logo size="sm" />
          </Link>
        </div>
        
        {/* Placeholder for right side to ensure centering */}
        <div className="justify-self-end"></div>
      </div>
    </header>
  )
}
