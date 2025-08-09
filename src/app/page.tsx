import { PublicHome } from "@/components/public-home";
import { getCandidates } from "@/lib/data";

export default async function HomePage() {
  try {
    // Fetch only candidates data (no sensitive admin settings)
    const candidates = await getCandidates();

    console.log('📊 Home page candidates with bet counts:', candidates.map(c => `${c.name}: ${c.betCount} bets`));

    return <PublicHome candidates={candidates} />;
  } catch (error) {
    console.error('❌ Error loading home page:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please refresh the page if this persists.</p>
        </div>
      </div>
    );
  }
}