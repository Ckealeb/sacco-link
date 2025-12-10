import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  memberName: string;
  type: "credit" | "debit";
  amount: number;
  accountType: string;
  date: string;
}

const mockTransactions: Transaction[] = [
  { id: "1", memberName: "Sarah Nakamya", type: "credit", amount: 500000, accountType: "Savings", date: "2024-01-15" },
  { id: "2", memberName: "John Okello", type: "debit", amount: 2000000, accountType: "Loan", date: "2024-01-15" },
  { id: "3", memberName: "Grace Auma", type: "credit", amount: 100000, accountType: "Shares", date: "2024-01-14" },
  { id: "4", memberName: "Peter Mugisha", type: "credit", amount: 300000, accountType: "MM", date: "2024-01-14" },
  { id: "5", memberName: "Mary Nalwanga", type: "debit", amount: 150000, accountType: "Withdrawal", date: "2024-01-13" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function RecentTransactions() {
  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-sm text-accent hover:text-accent/80 font-medium transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {mockTransactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                txn.type === "credit" ? "bg-success/10" : "bg-warning/10"
              )}
            >
              {txn.type === "credit" ? (
                <ArrowDownLeft className="w-5 h-5 text-success" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{txn.memberName}</p>
              <p className="text-xs text-muted-foreground">{txn.accountType}</p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold",
                  txn.type === "credit" ? "text-success" : "text-foreground"
                )}
              >
                {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{txn.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
