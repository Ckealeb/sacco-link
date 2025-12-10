import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Calendar, Plus, FileText, Wallet, PiggyBank, CircleDollarSign, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock member data
const memberData = {
  id: "1",
  memberNo: "M001",
  name: "Sarah Nakamya",
  phone: "+256 700 123456",
  email: "sarah@email.com",
  joinedDate: "2022-03-15",
  status: "active",
  accounts: {
    shares: { balance: 2500000, accountNo: "SHA-001" },
    savings: { balance: 1500000, accountNo: "SAV-001" },
    loan: { balance: 0, accountNo: "LON-001" },
    mm: { balance: 300000, accountNo: "MM-001" },
    development: { balance: 150000, accountNo: "DEV-001" },
  },
  transactions: [
    { id: "1", date: "2024-01-15", type: "credit", amount: 500000, account: "Savings", narration: "Monthly savings deposit" },
    { id: "2", date: "2024-01-10", type: "credit", amount: 100000, account: "Shares", narration: "Share contribution" },
    { id: "3", date: "2024-01-05", type: "credit", amount: 100000, account: "MM", narration: "MM cycle contribution" },
    { id: "4", date: "2023-12-28", type: "debit", amount: 200000, account: "Savings", narration: "Cash withdrawal" },
    { id: "5", date: "2023-12-20", type: "credit", amount: 300000, account: "Savings", narration: "Monthly savings deposit" },
  ],
};

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

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In real app, fetch member by id
  const member = memberData;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
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
            <h1 className="text-2xl font-semibold text-foreground">{member.name}</h1>
            <span className="badge-success">{member.status}</span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{member.memberNo}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Statement
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Transaction
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-6 mb-8 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{member.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{member.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Joined:</span>
          <span className="text-foreground">{member.joinedDate}</span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <AccountCard
          title="Shares"
          balance={member.accounts.shares.balance}
          accountNo={member.accounts.shares.accountNo}
          icon={PiggyBank}
          iconColor="bg-accent/10 text-accent"
        />
        <AccountCard
          title="Savings"
          balance={member.accounts.savings.balance}
          accountNo={member.accounts.savings.accountNo}
          icon={PiggyBank}
          iconColor="bg-success/10 text-success"
        />
        <AccountCard
          title="Loan"
          balance={member.accounts.loan.balance}
          accountNo={member.accounts.loan.accountNo}
          icon={Wallet}
          iconColor="bg-warning/10 text-warning"
        />
        <AccountCard
          title="MM Cycle"
          balance={member.accounts.mm.balance}
          accountNo={member.accounts.mm.accountNo}
          icon={CircleDollarSign}
          iconColor="bg-info/10 text-info"
        />
        <AccountCard
          title="Development"
          balance={member.accounts.development.balance}
          accountNo={member.accounts.development.accountNo}
          icon={PiggyBank}
          iconColor="bg-primary/10 text-primary"
        />
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
            <div className="divide-y divide-border">
              {member.transactions.map((txn) => (
                <div key={txn.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
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
                    <p className="text-sm font-medium text-foreground">{txn.narration}</p>
                    <p className="text-xs text-muted-foreground">{txn.account}</p>
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
