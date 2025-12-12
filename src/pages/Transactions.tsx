import { useState } from "react";
import { Search, Plus, Filter, Download, ArrowDownLeft, ArrowUpRight, FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  useTransactions, 
  useMembersForSelect, 
  useCreateTransaction,
  useTransactionStats,
  TransactionWithDetails 
} from "@/hooks/useTransactionsData";
import { Database } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type AccountType = Database["public"]["Enums"]["account_type"];
type TransactionDirection = Database["public"]["Enums"]["transaction_direction"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount);
}

const accountTypeStyles: Record<string, string> = {
  savings: "bg-success/10 text-success",
  shares: "bg-accent/10 text-accent",
  loan: "bg-warning/10 text-warning",
  mm: "bg-info/10 text-info",
  development_fund: "bg-primary/10 text-primary",
  fixed_deposit: "bg-secondary text-secondary-foreground",
};

const accountTypeLabels: Record<string, string> = {
  savings: "Savings",
  shares: "Shares",
  loan: "Loan",
  mm: "MM Cycle",
  development_fund: "Development",
  fixed_deposit: "Fixed Deposit",
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isNewTxnOpen, setIsNewTxnOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form state for new transaction
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | "">("");
  const [selectedDirection, setSelectedDirection] = useState<TransactionDirection | "">("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const { data: transactions, isLoading } = useTransactions({
    searchQuery,
    accountType: accountFilter,
    direction: directionFilter,
    dateFrom,
    dateTo,
  });

  const { data: members } = useMembersForSelect();
  const createTransaction = useCreateTransaction();
  const stats = useTransactionStats(transactions || []);

  const handleExport = (format: "excel" | "pdf") => {
    if (!transactions || transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    if (format === "excel") {
      const headers = ["Date", "Reference", "Member", "Account", "Type", "Amount", "Narration"];
      const rows = transactions.map(t => [
        t.date,
        t.reference || "",
        `${t.memberName} (${t.memberNo})`,
        accountTypeLabels[t.accountType] || t.accountType,
        t.direction,
        t.amount,
        t.narration || "",
      ]);

      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully");
    } else {
      toast.info("PDF export coming soon");
    }
  };

  const handleNewTransaction = async () => {
    if (!selectedMember || !selectedAccountType || !selectedDirection || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createTransaction.mutateAsync({
        memberId: selectedMember,
        accountType: selectedAccountType as AccountType,
        direction: selectedDirection as TransactionDirection,
        amount: Number(amount),
        narration: narration || undefined,
      });

      toast.success("Transaction recorded successfully");
      setIsNewTxnOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to record transaction");
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedMember("");
    setSelectedAccountType("");
    setSelectedDirection("");
    setAmount("");
    setNarration("");
  };

  const columns = [
    {
      header: "Date",
      accessorKey: "date" as const,
      cell: (txn: TransactionWithDetails) => (
        <span className="text-sm text-foreground">{txn.date}</span>
      ),
    },
    {
      header: "Reference",
      accessorKey: "reference" as const,
      cell: (txn: TransactionWithDetails) => (
        <span className="text-sm font-mono text-muted-foreground">
          {txn.reference || "-"}
        </span>
      ),
    },
    {
      header: "Member",
      accessorKey: "memberName" as const,
      cell: (txn: TransactionWithDetails) => (
        <div>
          <p className="text-sm font-medium text-foreground">{txn.memberName}</p>
          <p className="text-xs text-muted-foreground font-mono">{txn.memberNo}</p>
        </div>
      ),
    },
    {
      header: "Account",
      accessorKey: "accountType" as const,
      cell: (txn: TransactionWithDetails) => (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", accountTypeStyles[txn.accountType] || "bg-secondary text-secondary-foreground")}>
          {accountTypeLabels[txn.accountType] || txn.accountType}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "direction" as const,
      cell: (txn: TransactionWithDetails) => (
        <div className="flex items-center gap-2">
          {txn.direction === "credit" ? (
            <>
              <ArrowDownLeft className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Credit</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning">Debit</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount" as const,
      cell: (txn: TransactionWithDetails) => (
        <span className={cn("text-sm font-semibold", txn.direction === "credit" ? "text-success" : "text-foreground")}>
          {formatCurrency(txn.amount)}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Narration",
      accessorKey: "narration" as const,
      cell: (txn: TransactionWithDetails) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {txn.narration || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transactions"
        description="Record and manage all SACCO transactions"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>
              <FileText className="w-4 h-4 mr-2" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Dialog open={isNewTxnOpen} onOpenChange={setIsNewTxnOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
              <DialogDescription>
                Enter transaction details. All transactions are automatically mapped to the general ledger.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="member">Member *</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.memberNo} - {member.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select value={selectedAccountType} onValueChange={(v) => setSelectedAccountType(v as AccountType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="shares">Shares</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="mm">MM Cycle</SelectItem>
                    <SelectItem value="development_fund">Development Fund</SelectItem>
                    <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="direction">Transaction Type *</Label>
                <Select value={selectedDirection} onValueChange={(v) => setSelectedDirection(v as TransactionDirection)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Money In)</SelectItem>
                    <SelectItem value="debit">Debit (Money Out)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (UGX) *</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="narration">Narration</Label>
                <Textarea 
                  id="narration" 
                  placeholder="Brief description of transaction"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsNewTxnOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleNewTransaction}
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? "Recording..." : "Record Transaction"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by member, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={accountFilter} onValueChange={setAccountFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Account Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="shares">Shares</SelectItem>
            <SelectItem value="loan">Loan</SelectItem>
            <SelectItem value="mm">MM Cycle</SelectItem>
            <SelectItem value="development_fund">Development</SelectItem>
            <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
              <DialogDescription>
                Apply additional filters to narrow down transactions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Transaction Direction</Label>
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credits Only</SelectItem>
                    <SelectItem value="debit">Debits Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Input 
                    type="date" 
                    placeholder="From" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <Input 
                    type="date" 
                    placeholder="To" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { 
                setDirectionFilter("all"); 
                setDateFrom("");
                setDateTo("");
                setIsFilterOpen(false); 
              }}>
                Clear All
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-foreground mt-1">{stats.totalTransactions}</p>
          )}
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Credits</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-success mt-1">{formatCurrency(stats.totalCredits)}</p>
          )}
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Debits</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(stats.totalDebits)}</p>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={transactions || []} />
      )}
    </div>
  );
}
