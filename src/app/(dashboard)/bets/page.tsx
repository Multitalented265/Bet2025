import { BetTicket } from "@/components/bet-ticket";

const mockBets = [
  {
    id: 'BET-001',
    candidateName: 'Lazarus Chakwera',
    amount: 5000,
    placedDate: '2024-07-20',
    status: 'Pending',
    potentialWin: 15000,
  },
  {
    id: 'BET-002',
    candidateName: 'Peter Mutharika',
    amount: 10000,
    placedDate: '2024-07-18',
    status: 'Won',
    potentialWin: 25000,
  },
  {
    id: 'BET-003',
    candidateName: 'Saulos Chilima',
    amount: 2500,
    placedDate: '2024-07-15',
    status: 'Lost',
    potentialWin: 7500,
  },
    {
    id: 'BET-004',
    candidateName: 'Lazarus Chakwera',
    amount: 2000,
    placedDate: '2024-07-21',
    status: 'Pending',
    potentialWin: 6000,
  },
];

export default function BetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Bets</h1>
        <p className="text-muted-foreground">
          An overview of your betting history.
        </p>
      </div>
      {mockBets.length === 0 ? (
         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>You haven't placed any bets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockBets.map((bet) => (
            <BetTicket key={bet.id} bet={bet} />
          ))}
        </div>
      )}
    </div>
  );
}
