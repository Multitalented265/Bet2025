"use client";

import Link from "next/link";
import Logo from "@/components/logo";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="flex flex-col items-center gap-6 max-w-xl text-center">
        <Logo />
        <h1 className="text-3xl md:text-4xl font-semibold">We&rsquo;ll be back soon</h1>
        <p className="text-muted-foreground">
          Our site is currently undergoing scheduled maintenance. We&rsquo;re working
          hard to bring everything back online as quickly as possible.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Thank you for your patience.</p>
          <p>
            If you need assistance, please contact support at
            {" "}
            <a className="underline" href="mailto:support@mzunguko.app">
              support@mzunguko.app
            </a>
            .
          </p>
        </div>
        <div className="pt-2">
          <Link href="/" className="underline">
            Try reloading the homepage
          </Link>
        </div>
      </div>
    </main>
  );
}


