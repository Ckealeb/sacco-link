import { useState } from "react";
import { Search, Plus, AlertCircle, CheckCircle, Clock, XCircle, Eye, CreditCard, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";
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
import { toast } from "@/hooks/use-toast";

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
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [arrearsDialogOpen, setArrearsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const filteredLoans = mockLoans.filter((loan) => {
    const matchesSearch =
      loan.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loanNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const arrearsLoans = mockLoans.filter((l) => l.status === "arrears");

  const handleNewLoan = () => {
    toast({
      title: "Loan Application Created",
      description: "New loan application has been submitted for approval.",
    });
    setNewLoanOpen(false);
  };

  const handleRecordPayment = () => {
    toast({
      title: "Payment Recorded",
      description: `Payment has been recorded for ${selectedLoan?.loanNo}.`,
    });
    setPaymentDialogOpen(false);
    setSelectedLoan(null);
  };

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
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (loan: Loan) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => {
              toast({ title: "View Loan", description: `Viewing details for ${loan.loanNo}` });
            }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {loan.status !== "closed" && (
              <DropdownMenuItem onClick={() => {
                setSelectedLoan(loan);
                setPaymentDialogOpen(true);
              }}>
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => {
              toast({ title: "Schedule Generated", description: `Loan schedule for ${loan.loanNo} has been generated.` });
            }}>
              <FileText className="w-4 h-4 mr-2" />
              View Schedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <Dialog open={newLoanOpen} onOpenChange={setNewLoanOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Loan Application</DialogTitle>
              <DialogDescription>Create a new loan application for a member. The loan will be submitted for approval.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member">Select Member</Label>
                <Select>
                  <SelectTrigger id="member">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M002">John Okello (M002)</SelectItem>
                    <SelectItem value="M003">Grace Auma (M003)</SelectItem>
                    <SelectItem value="M004">Peter Mugisha (M004)</SelectItem>
                    <SelectItem value="M005">Mary Nalwanga (M005)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="principal">Loan Amount (UGX)</Label>
                <Input id="principal" type="number" placeholder="Enter loan amount" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Interest Rate (%)</Label>
                  <Input id="rate" type="number" defaultValue="12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenor">Tenor (Months)</Label>
                  <Input id="tenor" type="number" defaultValue="12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input id="purpose" placeholder="e.g., Business expansion" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewLoanOpen(false)}>Cancel</Button>
              <Button onClick={handleNewLoan}>Submit Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Arrears Alert */}
      {inArrears > 0 && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-warning" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{inArrears} loan(s)</span> are currently in arrears and require attention.
          </p>
          <Dialog open={arrearsDialogOpen} onOpenChange={setArrearsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                View Arrears
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Loans in Arrears</DialogTitle>
                <DialogDescription>These loans have overdue payments and need immediate attention.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                {arrearsLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{loan.memberName}</p>
                      <p className="text-sm text-muted-foreground">{loan.loanNo} • Due: {loan.nextPaymentDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-warning">{formatCurrency(loan.outstandingBalance)}</p>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setArrearsDialogOpen(false)}>Close</Button>
                <Button onClick={() => {
                  toast({ title: "Reminders Sent", description: "Payment reminders have been sent to all members with arrears." });
                  setArrearsDialogOpen(false);
                }}>Send Reminders</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Loan Payment</DialogTitle>
            <DialogDescription>Record a payment for {selectedLoan?.loanNo} - {selectedLoan?.memberName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(selectedLoan?.outstandingBalance || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount (UGX)</Label>
              <Input id="paymentAmount" type="number" placeholder="Enter payment amount" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input id="paymentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentRef">Reference</Label>
              <Input id="paymentRef" placeholder="e.g., Receipt number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
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