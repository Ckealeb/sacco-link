import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Calendar, Plus, FileText, Wallet, PiggyBank, CircleDollarSign, ArrowDownLeft, ArrowUpRight, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMemberDetail, Account, createAccount, createTransaction } from "@/hooks/useMemberData";
import { toast } from "sonner";

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
  const { member, accounts, transactions, loading, error, refetch } = useMemberDetail(id);

  // Statement dialog state
  const [statementOpen, setStatementOpen] = useState(false);
  const [statementAccountType, setStatementAccountType] = useState<string>("all");
  const [statementDateFrom, setStatementDateFrom] = useState("");
  const [statementDateTo, setStatementDateTo] = useState("");

  // Transaction dialog state
  const [txnOpen, setTxnOpen] = useState(false);
  const [txnAccountType, setTxnAccountType] = useState<string>("");
  const [txnDirection, setTxnDirection] = useState<"credit" | "debit">("credit");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnNarration, setTxnNarration] = useState("");
  const [txnLoading, setTxnLoading] = useState(false);

  const handleAddTransaction = async () => {
    if (!id || !txnAccountType || !txnAmount) {
      toast.error("Please fill all required fields");
      return;
    }

    setTxnLoading(true);
    try {
      let account = accounts.find(a => a.account_type === txnAccountType);
      
      if (!account) {
        account = await createAccount(id, txnAccountType as Account["account_type"]);
        toast.success(`${accountTypeConfig[txnAccountType]?.title} account created`);
      }

      await createTransaction(
        account.id,
        id,
        parseFloat(txnAmount),
        txnDirection,
        txnNarration || `${txnDirection === "credit" ? "Deposit" : "Withdrawal"} - ${accountTypeConfig[txnAccountType]?.title}`,
        account.balance
      );

      toast.success("Transaction recorded successfully");
      setTxnOpen(false);
      setTxnAccountType("");
      setTxnAmount("");
      setTxnNarration("");
      refetch();
    } catch (err) {
      toast.error("Failed to record transaction");
    } finally {
      setTxnLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    if (statementAccountType !== "all") {
      filtered = filtered.filter(t => t.account?.account_type === statementAccountType);
    }
    
    if (statementDateFrom) {
      filtered = filtered.filter(t => t.txn_date >= statementDateFrom);
    }
    
    if (statementDateTo) {
      filtered = filtered.filter(t => t.txn_date <= statementDateTo);
    }
    
    return filtered;
  };

  const handleExportStatement = () => {
    const filtered = getFilteredTransactions();
    const csvContent = [
      ["Date", "Account", "Type", "Narration", "Amount", "Balance After"].join(","),
      ...filtered.map(t => [
        t.txn_date,
        t.account ? accountTypeConfig[t.account.account_type]?.title : "",
        t.direction,
        `"${t.narration || ""}"`,
        t.direction === "credit" ? t.amount : -t.amount,
        t.balance_after
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement_${member?.member_no}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Statement exported");
  };

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
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => setStatementOpen(true)}>
            <FileText className="w-4 h-4" />
            Statement
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={() => setTxnOpen(true)}>
            <Plus className="w-4 h-4" />
            Transaction
          </Button>
        </div>
      </div>

      {/* Statement Dialog */}
      <Dialog open={statementOpen} onOpenChange={setStatementOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Member Statement - {member.first_name} {member.last_name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-4 py-4 border-b border-border">
            <div className="space-y-1.5">
              <Label>Account Type</Label>
              <Select value={statementAccountType} onValueChange={setStatementAccountType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {Object.entries(accountTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>{config.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>From Date</Label>
              <Input type="date" value={statementDateFrom} onChange={(e) => setStatementDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label>To Date</Label>
              <Input type="date" value={statementDateTo} onChange={(e) => setStatementDateTo(e.target.value)} className="w-40" />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-left p-2 font-medium">Account</th>
                  <th className="text-left p-2 font-medium">Narration</th>
                  <th className="text-right p-2 font-medium">Debit</th>
                  <th className="text-right p-2 font-medium">Credit</th>
                  <th className="text-right p-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {getFilteredTransactions().map((txn) => (
                  <tr key={txn.id} className="hover:bg-secondary/30">
                    <td className="p-2">{txn.txn_date}</td>
                    <td className="p-2">{txn.account ? accountTypeConfig[txn.account.account_type]?.title : "-"}</td>
                    <td className="p-2">{txn.narration || "-"}</td>
                    <td className="p-2 text-right">{txn.direction === "debit" ? formatCurrency(txn.amount) : "-"}</td>
                    <td className="p-2 text-right text-success">{txn.direction === "credit" ? formatCurrency(txn.amount) : "-"}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(txn.balance_after)}</td>
                  </tr>
                ))}
                {getFilteredTransactions().length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatementOpen(false)}>Close</Button>
            <Button onClick={handleExportStatement} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={txnOpen} onOpenChange={setTxnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Account Type *</Label>
              <Select value={txnAccountType} onValueChange={setTxnAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>{config.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transaction Type *</Label>
              <Select value={txnDirection} onValueChange={(v) => setTxnDirection(v as "credit" | "debit")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Deposit (Credit)</SelectItem>
                  <SelectItem value="debit">Withdrawal (Debit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (UGX) *</Label>
              <Input type="number" placeholder="0" value={txnAmount} onChange={(e) => setTxnAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Narration</Label>
              <Textarea placeholder="Transaction description..." value={txnNarration} onChange={(e) => setTxnNarration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTxnOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction} disabled={txnLoading}>
              {txnLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
