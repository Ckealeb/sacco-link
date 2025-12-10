import { useState } from "react";
import { Search, Plus, Filter, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Loan {
  id: string;
  loanNo: string;
  memberName: string;
  memberNo: string;
  principal: number;
  interestRate: number;
  tenorMonths: number;
  disbursedDate: string;
  outstandingBalance: number;
  status: "active" | "closed" | "arrears" | "defaulted";
  nextPaymentDate: string;
}

const mockLoans: Loan[] = [
  { id: "1", loanNo: "LN-2024-001", memberName: "John Okello", memberNo: "M002", principal: 10000000, interestRate: 12, tenorMonths: 12, disbursedDate: "2024-01-10", outstandingBalance: 8000000, status: "active", nextPaymentDate: "2024-02-10" },
  { id: "2", loanNo: "LN-2023-045", memberName: "Grace Auma", memberNo: "M003", principal: 5000000, interestRate: 10, tenorMonths: 6, disbursedDate: "2023-11-15", outstandingBalance: 2000000, status: "active", nextPaymentDate: "2024-01-25" },
  { id: "3", loanNo: "LN-2023-032", memberName: "Mary Nalwanga", memberNo: "M005", principal: 8000000, interestRate: 12, tenorMonths: 12, disbursedDate: "2023-08-20", outstandingBalance: 5000000, status: "arrears", nextPaymentDate: "2024-01-05" },
  { id: "4", loanNo: "LN-2023-028", memberName: "David Ssemakula", memberNo: "M006", principal: 3000000, interestRate: 10, tenorMonths: 6, disbursedDate: "2023-09-01", outstandingBalance: 0, status: "closed", nextPaymentDate: "-" },
  { id: "5", loanNo: "LN-2022-089", memberName: "Peter Mugisha", memberNo: "M004", principal: 15000000, interestRate: 15, tenorMonths: 24, disbursedDate: "2022-06-10", outstandingBalance: 12000000, status: "defaulted", nextPaymentDate: "2023-06-10" },
];

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
  defaulted: { icon: XCircle, label: "Defaulted", className: "badge-destructive" },
};

export default function Loans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLoans = mockLoans.filter((loan) => {
    const matchesSearch =
      loan.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loanNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: "Loan No",
      accessorKey: "loanNo" as const,
      cell: (loan: Loan) => (
        <span className="font-mono text-sm font-medium text-foreground">{loan.loanNo}</span>
      ),
    },
    {
      header: "Member",
      accessorKey: "memberName" as const,
      cell: (loan: Loan) => (
        <div>
          <p className="text-sm font-medium text-foreground">{loan.memberName}</p>
          <p className="text-xs text-muted-foreground font-mono">{loan.memberNo}</p>
        </div>
      ),
    },
    {
      header: "Principal",
      accessorKey: "principal" as const,
      cell: (loan: Loan) => (
        <span className="text-sm font-medium text-foreground">{formatCurrency(loan.principal)}</span>
      ),
      className: "text-right",
    },
    {
      header: "Rate",
      accessorKey: "interestRate" as const,
      cell: (loan: Loan) => (
        <span className="text-sm text-muted-foreground">{loan.interestRate}% p.a.</span>
      ),
    },
    {
      header: "Tenor",
      accessorKey: "tenorMonths" as const,
      cell: (loan: Loan) => (
        <span className="text-sm text-muted-foreground">{loan.tenorMonths} months</span>
      ),
    },
    {
      header: "Outstanding",
      accessorKey: "outstandingBalance" as const,
      cell: (loan: Loan) => {
        const paidPercent = ((loan.principal - loan.outstandingBalance) / loan.principal) * 100;
        return (
          <div className="space-y-1">
            <span className={cn("text-sm font-semibold", loan.outstandingBalance > 0 ? "text-warning" : "text-success")}>
              {formatCurrency(loan.outstandingBalance)}
            </span>
            <Progress value={paidPercent} className="h-1.5" />
          </div>
        );
      },
      className: "text-right min-w-[120px]",
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (loan: Loan) => {
        const config = statusConfig[loan.status];
        return (
          <span className={config.className}>
            {config.label}
          </span>
        );
      },
    },
    {
      header: "Next Payment",
      accessorKey: "nextPaymentDate" as const,
      cell: (loan: Loan) => (
        <span className={cn(
          "text-sm",
          loan.status === "arrears" ? "text-destructive font-medium" : "text-muted-foreground"
        )}>
          {loan.nextPaymentDate}
        </span>
      ),
    },
  ];

  const totalOutstanding = mockLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const activeLoans = mockLoans.filter((l) => l.status === "active").length;
  const inArrears = mockLoans.filter((l) => l.status === "arrears").length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Loan Management"
        description="Track and manage member loans"
      >
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Loan
        </Button>
      </PageHeader>

      {/* Alerts */}
      {inArrears > 0 && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-warning" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{inArrears} loan(s)</span> are currently in arrears and require attention.
          </p>
          <Button variant="outline" size="sm" className="ml-auto">
            View Arrears
          </Button>
        </div>
      )}

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
          {["all", "active", "arrears", "closed", "defaulted"].map((status) => (
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
          <p className="text-2xl font-semibold text-foreground mt-1">{mockLoans.length}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Active Loans</p>
          <p className="text-2xl font-semibold text-success mt-1">{activeLoans}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">In Arrears</p>
          <p className="text-2xl font-semibold text-warning mt-1">{inArrears}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredLoans} />
    </div>
  );
}
