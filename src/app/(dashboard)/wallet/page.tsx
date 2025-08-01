
import { WalletClient } from "@/components/wallet-client"
import { getTransactions, getUserById } from "@/lib/data"
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PaymentStatus } from "@/components/payment-status";
import Script from "next/script";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; tx_ref?: string }>;
}) {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return redirect("/");
    }

    // Await searchParams
    const params = await searchParams;

    // Fetch data in parallel for better performance
    const [user, allTransactions] = await Promise.all([
      getUserById(session.user.id),
      getTransactions()
    ]);

    if (!user) {
      return redirect("/");
    }

    const userTransactions = allTransactions.filter(tx => tx.userId === user.id);

    return (
      <div className="flex flex-col gap-6">
        {/* Debug script to identify paymentDetails null log */}
        <Script id="debug-payment-details" strategy="afterInteractive">
          {`
            console.log('🔍 PaymentDetails Debug Script Loaded');
            
            // Override console.log to capture paymentDetails logs
            const originalConsoleLog = console.log;
            console.log = function(...args) {
              const message = args.join(' ');
              if (message.includes('paymentDetails')) {
                console.error('🚨 PAYMENTDETAILS LOG DETECTED:', {
                  message: message,
                  stack: new Error().stack,
                  timestamp: new Date().toISOString()
                });
              }
              originalConsoleLog.apply(console, args);
            };
            
            // Monitor URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const paymentStatus = urlParams.get('payment');
            const txRef = urlParams.get('tx_ref');
            
            console.log('🔍 URL Parameters Check:', {
              paymentStatus,
              txRef,
              hasPaymentStatus: !!paymentStatus,
              hasTxRef: !!txRef
            });
            
            if (!paymentStatus && !txRef) {
              console.log('📋 No payment parameters found in URL - this might be the source of paymentDetails null');
            }
          `}
        </Script>
        
        {params.payment && (
          <PaymentStatus 
            status={params.payment} 
            txRef={params.tx_ref} 
          />
        )}
          <WalletClient user={user} initialTransactions={userTransactions} />
      </div>
    )
}
