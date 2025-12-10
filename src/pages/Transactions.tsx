import { useState } from "react";
import { Search, Plus, Filter, Download, ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  memberName: string;
  memberNo: string;
  accountType: string;
  direction: "credit" | "debit";
  amount: number;
  narration: string;
  reference: string;
  createdBy: string;
}

const mockTransactions: Transaction[] = [
  { id: "TXN001", date: "2024-01-15", memberName: "Sarah Nakamya", memberNo: "M001", accountType: "Savings", direction: "credit", amount: 500000, narration: "Monthly savings deposit", reference: "DEP-2024-001", createdBy: "clerk1" },
  { id: "TXN002", date: "2024-01-15", memberName: "John Okello", memberNo: "M002", accountType: "Loan", direction: "debit", amount: 2000000, narration: "Loan disbursement", reference: "LOAN-2024-005", createdBy: "treasurer" },
  { id: "TXN003", date: "2024-01-14", memberName: "Grace Auma", memberNo: "M003", accountType: "Shares", direction: "credit", amount: 100000, narration: "Share contribution", reference: "SHA-2024-012", createdBy: "clerk1" },
  { id: "TXN004", date: "2024-01-14", memberName: "Peter Mugisha", memberNo: "M004", accountType: "MM", direction: "credit", amount: 300000, narration: "MM cycle contribution", reference: "MM-2024-008", createdBy: "clerk2" },
  { id: "TXN005", date: "2024-01-13", memberName: "Mary Nalwanga", memberNo: "M005", accountType: "Savings", direction: "debit", amount: 150000, narration: "Cash withdrawal", reference: "WDR-2024-003", createdBy: "clerk1" },
  { id: "TXN006", date: "2024-01-13", memberName: "David Ssemakula", memberNo: "M006", accountType: "Loan", direction: "credit", amount: 500000, narration: "Loan repayment", reference: "REP-2024-015", createdBy: "clerk2" },
  { id: "TXN007", date: "2024-01-12", memberName: "Sarah Nakamya", memberNo: "M001", accountType: "Development", direction: "credit", amount: 50000, narration: "Development fund contribution", reference: "DEV-2024-004", createdBy: "clerk1" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount);
}

const accountTypeStyles: Record<string, string> = {
  Savings: "bg-success/10 text-success",
  Shares: "bg-accent/10 text-accent",
  Loan: "bg-warning/10 text-warning",
  MM: "bg-info/10 text-info",
  Development: "bg-primary/10 text-primary",
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");

  const filteredTransactions = mockTransactions.filter((txn) => {
    const matchesSearch =
      txn.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount = accountFilter === "all" || txn.accountType === accountFilter;
    return matchesSearch && matchesAccount;
  });

  const columns = [
    {
      header: "Date",
      accessorKey: "date" as const,
      cell: (txn: Transaction) => (
        <span className="text-sm text-foreground">{txn.date}</span>
      ),
    },
    {
      header: "Reference",
      accessorKey: "reference" as const,
      cell: (txn: Transaction) => (
        <span className="text-sm font-mono text-muted-foreground">{txn.reference}</span>
      ),
    },
    {
      header: "Member",
      accessorKey: "memberName" as const,
      cell: (txn: Transaction) => (
        <div>
          <p className="text-sm font-medium text-foreground">{txn.memberName}</p>
          <p className="text-xs text-muted-foreground font-mono">{txn.memberNo}</p>
        </div>
      ),
    },
    {
      header: "Account",
      accessorKey: "accountType" as const,
      cell: (txn: Transaction) => (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", accountTypeStyles[txn.accountType])}>
          {txn.accountType}
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "direction" as const,
      cell: (txn: Transaction) => (
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
      cell: (txn: Transaction) => (
        <span className={cn("text-sm font-semibold", txn.direction === "credit" ? "text-success" : "text-foreground")}>
          {formatCurrency(txn.amount)}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Narration",
      accessorKey: "narration" as const,
      cell: (txn: Transaction) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">{txn.narration}</span>
      ),
    },
  ];

  const totalCredits = filteredTransactions
    .filter((t) => t.direction === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = filteredTransactions
    .filter((t) => t.direction === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Transactions"
        description="Record and manage all SACCO transactions"
      >
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Transaction
        </Button>
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
            <SelectItem value="Savings">Savings</SelectItem>
            <SelectItem value="Shares">Shares</SelectItem>
            <SelectItem value="Loan">Loan</SelectItem>
            <SelectItem value="MM">MM Cycle</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          More Filters
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{filteredTransactions.length}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Credits</p>
          <p className="text-2xl font-semibold text-success mt-1">{formatCurrency(totalCredits)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Debits</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(totalDebits)}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredTransactions} />
    </div>
  );
}
