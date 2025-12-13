import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, AlertCircle, CheckCircle, Clock, XCircle, Eye, CreditCard, FileText, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMembersForSelect } from "@/hooks/useTransactionsData";

interface LoanAccount {
  id: string;
  accountNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  balance: number;
  openedDate: string;
  isActive: boolean;
}

interface LoanTransaction {
  id: string;
  amount: number;
  direction: "credit" | "debit";
  date: string;
  narration: string | null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusConfig = {
  active: { icon: CheckCircle, label: "Active", className: "badge-success" },
  closed: { icon: CheckCircle, label: "Closed", className: "bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-medium" },
  arrears: { icon: Clock, label: "In Arrears", className: "badge-warning" },
};

function useLoanAccounts() {
  return useQuery({
    queryKey: ["loan-accounts"],
    queryFn: async (): Promise<LoanAccount[]> => {
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select("id, account_no, member_id, balance, opened_date, is_active")
        .eq("account_type", "loan")
        .order("opened_date", { ascending: false });

      if (error) throw error;
      if (!accounts || accounts.length === 0) return [];

      const memberIds = [...new Set(accounts.map(a => a.member_id))];
      const { data: members } = await supabase
        .from("members")
        .select("id, first_name, last_name, member_no")
        .in("id", memberIds);

      const memberMap = new Map(members?.map(m => [m.id, m]) || []);

      return accounts.map(acc => {
        const member = memberMap.get(acc.member_id);
        return {
          id: acc.id,
          accountNo: acc.account_no,
          memberId: acc.member_id,
          memberName: member ? `${member.first_name} ${member.last_name}` : "Unknown",
          memberNo: member?.member_no || "",
          balance: Math.abs(Number(acc.balance)), // Loans are stored as negative
          openedDate: acc.opened_date,
          isActive: acc.is_active,
        };
      });
    },
  });
}

function useLoanTransactions(accountId: string | null) {
  return useQuery({
    queryKey: ["loan-transactions", accountId],
    enabled: !!accountId,
    queryFn: async (): Promise<LoanTransaction[]> => {
      if (!accountId) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, direction, txn_date, narration")
        .eq("account_id", accountId)
        .order("txn_date", { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        amount: Number(t.amount),
        direction: t.direction as "credit" | "debit",
        date: t.txn_date,
        narration: t.narration,
      }));
    },
  });
}

export default function Loans() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [arrearsDialogOpen, setArrearsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanAccount | null>(null);

  // New loan form
  const [selectedMember, setSelectedMember] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanNarration, setLoanNarration] = useState("");

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNarration, setPaymentNarration] = useState("");

  const { data: loans, isLoading } = useLoanAccounts();
  const { data: members } = useMembersForSelect();
  const { data: loanTransactions } = useLoanTransactions(selectedLoan?.id || null);

  const filteredLoans = (loans || []).filter((loan) => {
    const matchesSearch =
      loan.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.accountNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.memberNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && loan.isActive && loan.balance > 0;
    if (statusFilter === "closed") return matchesSearch && (!loan.isActive || loan.balance === 0);
    return matchesSearch;
  });

  const activeLoans = (loans || []).filter(l => l.isActive && l.balance > 0);
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.balance, 0);

  const disburseLoan = useMutation({
    mutationFn: async () => {
      if (!selectedMember || !loanAmount) throw new Error("Missing required fields");

      const amount = Number(loanAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

      // Check if loan account exists
      let { data: account } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("member_id", selectedMember)
        .eq("account_type", "loan")
        .maybeSingle();

      if (!account) {
        const { data: newAccount, error: createError } = await supabase
          .from("accounts")
          .insert({
            member_id: selectedMember,
            account_type: "loan",
            account_no: "",
            balance: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        account = newAccount;
      }

      // Loan disbursement: debit increases loan balance (asset)
      const newBalance = Number(account.balance) + amount;

      // Create transaction
      const { error: txnError } = await supabase.from("transactions").insert({
        account_id: account.id,
        member_id: selectedMember,
        amount,
        direction: "debit",
        balance_after: newBalance,
        narration: loanNarration || "Loan disbursement",
      });

      if (txnError) throw txnError;

      // Update account balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Loan disbursed successfully");
      setNewLoanOpen(false);
      setSelectedMember("");
      setLoanAmount("");
      setLoanNarration("");
      queryClient.invalidateQueries({ queryKey: ["loan-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disburse loan");
    },
  });

  const recordPayment = useMutation({
    mutationFn: async () => {
      if (!selectedLoan || !paymentAmount) throw new Error("Missing required fields");

      const amount = Number(paymentAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

      // Loan repayment: credit decreases loan balance
      const newBalance = selectedLoan.balance - amount;

      // Create transaction
      const { error: txnError } = await supabase.from("transactions").insert({
        account_id: selectedLoan.id,
        member_id: selectedLoan.memberId,
        amount,
        direction: "credit",
        balance_after: newBalance,
        narration: paymentNarration || "Loan repayment",
      });

      if (txnError) throw txnError;

      // Update account balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", selectedLoan.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      setPaymentDialogOpen(false);
      setSelectedLoan(null);
      setPaymentAmount("");
      setPaymentNarration("");
      queryClient.invalidateQueries({ queryKey: ["loan-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });

  const columns = [
    {
      header: "Loan Account",
      accessorKey: "accountNo" as const,
      cell: (loan: LoanAccount) => (
        <span className="font-mono text-sm font-medium text-foreground">{loan.accountNo || "-"}</span>
      ),
    },
    {
      header: "Member",
      accessorKey: "memberName" as const,
      cell: (loan: LoanAccount) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/members/${loan.memberId}`);
          }}
          className="text-left group"
        >
          <p className="text-sm font-medium text-foreground group-hover:text-accent flex items-center gap-1">
            {loan.memberName}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
          </p>
          <p className="text-xs text-muted-foreground font-mono">{loan.memberNo}</p>
        </button>
      ),
    },
    {
      header: "Disbursed",
      accessorKey: "openedDate" as const,
      cell: (loan: LoanAccount) => (
        <span className="text-sm text-muted-foreground">{loan.openedDate}</span>
      ),
    },
    {
      header: "Outstanding",
      accessorKey: "balance" as const,
      cell: (loan: LoanAccount) => (
        <span className={cn("text-sm font-semibold", loan.balance > 0 ? "text-warning" : "text-success")}>
          {formatCurrency(loan.balance)}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Status",
      accessorKey: "isActive" as const,
      cell: (loan: LoanAccount) => {
        const status = loan.balance === 0 ? "closed" : "active";
        const config = statusConfig[status];
        return (
          <span className={config.className}>
            {config.label}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (loan: LoanAccount) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => {
              setSelectedLoan(loan);
              setDetailsDialogOpen(true);
            }}>
              <Eye className="w-4 h-4 mr-2" />
              View Transactions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/members/${loan.memberId}`)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Member
            </DropdownMenuItem>
            {loan.balance > 0 && (
              <DropdownMenuItem onClick={() => {
                setSelectedLoan(loan);
                setPaymentDialogOpen(true);
              }}>
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate("/transactions")}>
              <FileText className="w-4 h-4 mr-2" />
              All Transactions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Loan Management"
        description="Track and manage member loans"
      >
        <Dialog open={newLoanOpen} onOpenChange={setNewLoanOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Disburse Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Disburse New Loan</DialogTitle>
              <DialogDescription>Create a new loan for a member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member">Select Member *</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.memberNo} - {m.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount (UGX) *</Label>
                <Input 
                  id="loanAmount" 
                  type="number" 
                  placeholder="Enter loan amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanNarration">Purpose/Narration</Label>
                <Input 
                  id="loanNarration" 
                  placeholder="e.g., Business expansion"
                  value={loanNarration}
                  onChange={(e) => setLoanNarration(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewLoanOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => disburseLoan.mutate()}
                disabled={disburseLoan.isPending}
              >
                {disburseLoan.isPending ? "Processing..." : "Disburse Loan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Arrears Alert */}
      {activeLoans.length > 0 && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-warning" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{activeLoans.length} active loan(s)</span> with total outstanding of <span className="font-semibold">{formatCurrency(totalOutstanding)}</span>
          </p>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Loan Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedLoan?.memberName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedLoan?.balance || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount (UGX) *</Label>
              <Input 
                id="paymentAmount" 
                type="number" 
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNarration">Reference/Narration</Label>
              <Input 
                id="paymentNarration" 
                placeholder="e.g., Monthly payment"
                value={paymentNarration}
                onChange={(e) => setPaymentNarration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => recordPayment.mutate()}
              disabled={recordPayment.isPending}
            >
              {recordPayment.isPending ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loan Details/Transactions Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Transactions</DialogTitle>
            <DialogDescription>
              {selectedLoan?.memberName} - {selectedLoan?.accountNo}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-secondary/50 rounded-lg mb-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(selectedLoan?.balance || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Opened</p>
                  <p className="text-sm font-medium text-foreground">{selectedLoan?.openedDate}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {loanTransactions && loanTransactions.length > 0 ? (
                loanTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {txn.direction === "debit" ? "Disbursement" : "Repayment"}
                      </p>
                      <p className="text-xs text-muted-foreground">{txn.date} • {txn.narration || "-"}</p>
                    </div>
                    <span className={cn("text-sm font-semibold", txn.direction === "credit" ? "text-success" : "text-warning")}>
                      {txn.direction === "credit" ? "-" : "+"}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No transactions found</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/transactions")}>
              View All Transactions
            </Button>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by loan number or member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "closed"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === "all" ? "All" : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Loans</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-foreground mt-1">{loans?.length || 0}</p>
          )}
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Active Loans</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-success mt-1">{activeLoans.length}</p>
          )}
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Closed Loans</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-muted-foreground mt-1">
              {(loans || []).filter(l => l.balance === 0).length}
            </p>
          )}
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(totalOutstanding)}</p>
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
        <DataTable columns={columns} data={filteredLoans} />
      )}
    </div>
  );
}
