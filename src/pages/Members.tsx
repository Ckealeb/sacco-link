import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, UserPlus, Edit, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  memberNo: string;
  name: string;
  phone: string;
  email: string;
  sharesBalance: number;
  savingsBalance: number;
  loanBalance: number;
  status: "active" | "inactive" | "suspended";
  joinedDate: string;
}

const mockMembers: Member[] = [
  { id: "1", memberNo: "M001", name: "Sarah Nakamya", phone: "+256 700 123456", email: "sarah@email.com", sharesBalance: 2500000, savingsBalance: 1500000, loanBalance: 0, status: "active", joinedDate: "2022-03-15" },
  { id: "2", memberNo: "M002", name: "John Okello", phone: "+256 701 234567", email: "john@email.com", sharesBalance: 5000000, savingsBalance: 3200000, loanBalance: 8000000, status: "active", joinedDate: "2021-08-20" },
  { id: "3", memberNo: "M003", name: "Grace Auma", phone: "+256 702 345678", email: "grace@email.com", sharesBalance: 1000000, savingsBalance: 800000, loanBalance: 2000000, status: "active", joinedDate: "2023-01-10" },
  { id: "4", memberNo: "M004", name: "Peter Mugisha", phone: "+256 703 456789", email: "peter@email.com", sharesBalance: 3500000, savingsBalance: 2100000, loanBalance: 0, status: "inactive", joinedDate: "2020-11-05" },
  { id: "5", memberNo: "M005", name: "Mary Nalwanga", phone: "+256 704 567890", email: "mary@email.com", sharesBalance: 1800000, savingsBalance: 950000, loanBalance: 5000000, status: "active", joinedDate: "2022-06-28" },
  { id: "6", memberNo: "M006", name: "David Ssemakula", phone: "+256 705 678901", email: "david@email.com", sharesBalance: 4200000, savingsBalance: 2800000, loanBalance: 3000000, status: "active", joinedDate: "2021-04-12" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusStyles = {
  active: "badge-success",
  inactive: "badge-warning",
  suspended: "badge-destructive",
};

export default function Members() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMember = () => {
    toast.success("Member registration form - Connect to database to save");
    setIsAddDialogOpen(false);
  };

  const columns = [
    {
      header: "Member No",
      accessorKey: "memberNo" as const,
      cell: (member: Member) => (
        <span className="font-mono text-sm font-medium text-foreground">{member.memberNo}</span>
      ),
    },
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: (member: Member) => (
        <div>
          <p className="font-medium text-foreground">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone" as const,
      cell: (member: Member) => (
        <span className="text-sm text-muted-foreground">{member.phone}</span>
      ),
    },
    {
      header: "Shares",
      accessorKey: "sharesBalance" as const,
      cell: (member: Member) => (
        <span className="text-sm font-medium text-foreground">{formatCurrency(member.sharesBalance)}</span>
      ),
      className: "text-right",
    },
    {
      header: "Savings",
      accessorKey: "savingsBalance" as const,
      cell: (member: Member) => (
        <span className="text-sm font-medium text-foreground">{formatCurrency(member.savingsBalance)}</span>
      ),
      className: "text-right",
    },
    {
      header: "Loan Balance",
      accessorKey: "loanBalance" as const,
      cell: (member: Member) => (
        <span className={cn("text-sm font-medium", member.loanBalance > 0 ? "text-warning" : "text-foreground")}>
          {formatCurrency(member.loanBalance)}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (member: Member) => (
        <span className={statusStyles[member.status]}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </span>
      ),
    },
    {
      header: "",
      accessorKey: "id" as const,
      cell: (member: Member) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/members/${member.id}`)}>
              <UserPlus className="w-4 h-4 mr-2" />
              View Details - View member profile, accounts, and transaction history
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Edit member details - Update personal information and contact details")}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Member - Modify member information
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/transactions")}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Transaction - Record deposit, withdrawal, or payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Members"
        description="Manage SACCO member accounts and information"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Member</DialogTitle>
              <DialogDescription>
                Add a new member to the SACCO. Fill in the required details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+256 700 000000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="member@email.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="initialShares">Initial Share Contribution (UGX)</Label>
                <Input id="initialShares" type="number" placeholder="500000" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMember}>Register Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, member no, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Members</DialogTitle>
              <DialogDescription>
                Apply filters to narrow down the member list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active - Members in good standing</SelectItem>
                    <SelectItem value="inactive">Inactive - Dormant accounts</SelectItem>
                    <SelectItem value="suspended">Suspended - Temporarily restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setStatusFilter("all"); setIsFilterOpen(false); }}>
                Clear Filters
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{filteredMembers.length}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold text-success mt-1">
            {filteredMembers.filter(m => m.status === "active").length}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Shares</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {formatCurrency(filteredMembers.reduce((sum, m) => sum + m.sharesBalance, 0))}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Savings</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {formatCurrency(filteredMembers.reduce((sum, m) => sum + m.savingsBalance, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        onRowClick={(member) => navigate(`/members/${member.id}`)}
      />
    </div>
  );
}
