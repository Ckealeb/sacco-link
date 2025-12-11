import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Calendar, Plus, FileText, Wallet, PiggyBank, CircleDollarSign, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMemberDetail, Account } from "@/hooks/useMemberData";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface AccountCardProps {
  title: string;
  balance: number;
  accountNo: string;
  icon: React.ElementType;
  iconColor: string;
}

function AccountCard({ title, balance, accountNo, icon: Icon, iconColor }: AccountCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(balance)}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{accountNo}</p>
        </div>
        <div className={cn("p-3 rounded-xl", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

const accountTypeConfig: Record<string, { title: string; icon: React.ElementType; iconColor: string }> = {
  shares: { title: "Shares", icon: PiggyBank, iconColor: "bg-accent/10 text-accent" },
  savings: { title: "Savings", icon: PiggyBank, iconColor: "bg-success/10 text-success" },
  fixed_deposit: { title: "Fixed Deposit", icon: Wallet, iconColor: "bg-info/10 text-info" },
  loan: { title: "Loan", icon: Wallet, iconColor: "bg-warning/10 text-warning" },
  mm: { title: "MM Cycle", icon: CircleDollarSign, iconColor: "bg-info/10 text-info" },
  development_fund: { title: "Development", icon: PiggyBank, iconColor: "bg-primary/10 text-primary" },
};

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { member, accounts, transactions, loading, error } = useMemberDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Member not found</p>
        <Button variant="outline" onClick={() => navigate("/members")} className="mt-4">
          Back to Members
        </Button>
      </div>
    );
  }

  const getAccountByType = (type: string): Account | undefined => {
    return accounts.find(a => a.account_type === type);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/members")}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              {member.first_name} {member.last_name}
            </h1>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              member.status === "active" ? "badge-success" : "bg-muted text-muted-foreground"
            )}>
              {member.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{member.member_no}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <FileText className="w-4 h-4" />
            Statement
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none">
            <Plus className="w-4 h-4" />
            Transaction
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{member.phone}</span>
        </div>
        {member.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{member.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Joined:</span>
          <span className="text-foreground">{member.joined_date}</span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {Object.entries(accountTypeConfig).map(([type, config]) => {
          const account = getAccountByType(type);
          return (
            <AccountCard
              key={type}
              title={config.title}
              balance={account?.balance ?? 0}
              accountNo={account?.account_no ?? "Not opened"}
              icon={config.icon}
              iconColor={config.iconColor}
            />
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="mm">MM Cycles</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Transaction History</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
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
                      <p className="text-sm font-medium text-foreground truncate">{txn.narration || "Transaction"}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.account ? accountTypeConfig[txn.account.account_type]?.title : "Account"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          txn.direction === "credit" ? "text-success" : "text-foreground"
                        )}
                      >
                        {txn.direction === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{txn.txn_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <div className="card-elevated p-8 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Active Loans</h3>
            <p className="text-sm text-muted-foreground mb-4">This member doesn't have any active loans.</p>
            <Button>Apply for Loan</Button>
          </div>
        </TabsContent>

        <TabsContent value="mm">
          <div className="card-elevated p-8 text-center">
            <CircleDollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">MM Cycle Participation</h3>
            <p className="text-sm text-muted-foreground mb-4">View and manage MM cycle contributions.</p>
            <Button variant="outline">View MM History</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
