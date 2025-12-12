import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecentTransactions } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
}

const accountTypeLabels: Record<string, string> = {
  savings: "Savings",
  shares: "Shares",
  loan: "Loan",
  mm: "MM Cycle",
  fixed_deposit: "Fixed Deposit",
  development_fund: "Development",
};

export function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions(5);
  const navigate = useNavigate();

  return (
    <div className="card-elevated p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <button 
          onClick={() => navigate("/transactions")}
          className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
        >
          View all
        </button>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : transactions && transactions.length > 0 ? (
          transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  txn.direction === "credit" ? "bg-success/10" : "bg-warning/10"
                )}
              >
                {txn.direction === "credit" ? (
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-warning" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{txn.memberName}</p>
                <p className="text-xs text-muted-foreground">
                  {accountTypeLabels[txn.accountType] || txn.accountType}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    txn.direction === "credit" ? "text-success" : "text-foreground"
                  )}
                >
                  {txn.direction === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{txn.date}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm">Add transactions from the Members page</p>
          </div>
        )}
      </div>
    </div>
  );
}
