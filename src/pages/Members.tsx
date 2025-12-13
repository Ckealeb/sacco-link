import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, UserPlus, Edit, CreditCard, Loader2, Eye } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

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

const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().min(10, "Valid phone number is required").max(20),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  initialShares: z.number().min(0, "Initial shares must be positive"),
});

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionMember, setTransactionMember] = useState<Member | null>(null);
  const [transactionType, setTransactionType] = useState<string>("shares");
  const [transactionDirection, setTransactionDirection] = useState<string>("credit");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionNarration, setTransactionNarration] = useState("");
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [initialShares, setInitialShares] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedMembers: Member[] = (data || []).map((m) => ({
        id: m.id,
        memberNo: m.member_no,
        name: `${m.first_name} ${m.last_name}`,
        phone: m.phone,
        email: m.email || "",
        sharesBalance: Number(m.shares_balance),
        savingsBalance: Number(m.savings_balance),
        loanBalance: Number(m.loan_balance),
        status: m.status as "active" | "inactive" | "suspended",
        joinedDate: m.joined_date,
      }));

      setMembers(formattedMembers);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setInitialShares("");
    setEditStatus("");
  };

  const handleAddMember = async () => {
    const validation = memberSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      initialShares: Number(initialShares) || 0,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("members").insert([{
        member_no: '', // Will be auto-generated by trigger
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        shares_balance: Number(initialShares) || 0,
      }]);

      if (error) throw error;

      toast.success("Member registered successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error(error.message || "Failed to register member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    const validation = memberSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      initialShares: 0, // Not editing shares here
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const updateData: Record<string, any> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      };
      
      if (editStatus) {
        updateData.status = editStatus;
      }

      const { error } = await supabase
        .from("members")
        .update(updateData)
        .eq("id", editingMember.id);

      if (error) throw error;

      toast.success("Member updated successfully!");
      setIsEditDialogOpen(false);
      setEditingMember(null);
      resetForm();
      fetchMembers();
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast.error(error.message || "Failed to update member");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    const [first, ...rest] = member.name.split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
    setPhone(member.phone);
    setEmail(member.email);
    setEditStatus(member.status);
    setIsEditDialogOpen(true);
  };

  const openTransactionDialog = (member: Member) => {
    setTransactionMember(member);
    setTransactionType("shares");
    setTransactionDirection("credit");
    setTransactionAmount("");
    setTransactionNarration("");
    setIsTransactionDialogOpen(true);
  };

  const handleAddTransaction = async () => {
    if (!transactionMember || !transactionAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const amount = Number(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      // First, get or create the account for this transaction type
      let { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("*")
        .eq("member_id", transactionMember.id)
        .eq("account_type", transactionType as "shares" | "savings" | "loan" | "mm" | "fixed_deposit" | "development_fund")
        .eq("is_active", true)
        .single();

      if (accountError && accountError.code === "PGRST116") {
        // Account doesn't exist, create it
        const { data: newAccount, error: createError } = await supabase
          .from("accounts")
          .insert([{
            member_id: transactionMember.id,
            account_type: transactionType as "shares" | "savings" | "loan" | "mm" | "fixed_deposit" | "development_fund",
            account_no: "",
            balance: 0,
          }])
          .select()
          .single();

        if (createError) throw createError;
        account = newAccount;
      } else if (accountError) {
        throw accountError;
      }

      if (!account) throw new Error("Failed to get account");

      const currentBalance = Number(account.balance);
      const newBalance = transactionDirection === "credit" 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (newBalance < 0) {
        toast.error("Insufficient balance for this withdrawal");
        setSubmitting(false);
        return;
      }

      // Create transaction
      const { error: txnError } = await supabase.from("transactions").insert([{
        account_id: account.id,
        member_id: transactionMember.id,
        amount,
        direction: transactionDirection as "credit" | "debit",
        balance_after: newBalance,
        narration: transactionNarration || `${transactionDirection === "credit" ? "Deposit" : "Withdrawal"} - ${transactionType}`,
      }]);

      if (txnError) throw txnError;

      // Update account balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (updateError) throw updateError;

      // Update member balance
      const balanceField = transactionType === "shares" ? "shares_balance" 
        : transactionType === "savings" ? "savings_balance" 
        : transactionType === "loan" ? "loan_balance" 
        : null;

      if (balanceField) {
        const { error: memberError } = await supabase
          .from("members")
          .update({ [balanceField]: newBalance })
          .eq("id", transactionMember.id);

        if (memberError) throw memberError;
      }

      toast.success("Transaction recorded successfully!");
      setIsTransactionDialogOpen(false);
      setTransactionMember(null);
      fetchMembers();
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast.error(error.message || "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
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
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(member)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Member
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openTransactionDialog(member)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Members"
        description="Manage SACCO member accounts and information"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
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
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter first name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter last name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+256 700 000000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="member@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="initialShares">Initial Share Contribution (UGX)</Label>
                <Input 
                  id="initialShares" 
                  type="number" 
                  placeholder="500000" 
                  value={initialShares}
                  onChange={(e) => setInitialShares(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Register Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingMember(null);
          resetForm();
          setEditStatus("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member details for {editingMember?.memberNo}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input 
                  id="editFirstName" 
                  placeholder="Enter first name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input 
                  id="editLastName" 
                  placeholder="Enter last name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone Number *</Label>
              <Input 
                id="editPhone" 
                placeholder="+256 700 000000" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email Address</Label>
              <Input 
                id="editEmail" 
                type="email" 
                placeholder="member@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditMember} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={(open) => {
        setIsTransactionDialogOpen(open);
        if (!open) setTransactionMember(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              {transactionMember ? `Record a transaction for ${transactionMember.name}` : "Record a new transaction"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Account Type</Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shares">Shares</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="mm">Merry-Go-Round (MM)</SelectItem>
                  <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                  <SelectItem value="development_fund">Development Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Transaction Type</Label>
              <Select value={transactionDirection} onValueChange={setTransactionDirection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Deposit / Credit</SelectItem>
                  <SelectItem value="debit">Withdrawal / Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="txnAmount">Amount (UGX) *</Label>
              <Input 
                id="txnAmount" 
                type="number" 
                placeholder="Enter amount"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="txnNarration">Narration</Label>
              <Input 
                id="txnNarration" 
                placeholder="Transaction description (optional)"
                value={transactionNarration}
                onChange={(e) => setTransactionNarration(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Record Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
