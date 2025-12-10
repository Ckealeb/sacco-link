import { useState } from "react";
import { Search, Filter, Download, User, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  category: "member" | "transaction" | "loan" | "system" | "auth";
  ipAddress: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: "1", timestamp: "2024-01-15 14:32:15", user: "clerk1", action: "CREATE_TRANSACTION", details: "Created deposit transaction TXN001 for member M001", category: "transaction", ipAddress: "192.168.1.45" },
  { id: "2", timestamp: "2024-01-15 14:28:00", user: "treasurer", action: "DISBURSE_LOAN", details: "Disbursed loan LN-2024-001 to member M002 - UGX 10,000,000", category: "loan", ipAddress: "192.168.1.20" },
  { id: "3", timestamp: "2024-01-15 13:45:22", user: "admin", action: "UPDATE_MEMBER", details: "Updated contact information for member M003", category: "member", ipAddress: "192.168.1.10" },
  { id: "4", timestamp: "2024-01-15 12:00:00", user: "system", action: "INTEREST_ACCRUAL", details: "Monthly interest accrual completed for 45 active loans", category: "system", ipAddress: "localhost" },
  { id: "5", timestamp: "2024-01-15 11:30:15", user: "clerk2", action: "CREATE_MEMBER", details: "Created new member M007 - Peter Waswa", category: "member", ipAddress: "192.168.1.50" },
  { id: "6", timestamp: "2024-01-15 10:15:00", user: "admin", action: "LOGIN", details: "User logged in successfully", category: "auth", ipAddress: "192.168.1.10" },
  { id: "7", timestamp: "2024-01-14 16:45:30", user: "clerk1", action: "DELETE_TRANSACTION", details: "Voided transaction TXN089 - duplicate entry", category: "transaction", ipAddress: "192.168.1.45" },
  { id: "8", timestamp: "2024-01-14 15:20:00", user: "treasurer", action: "APPLY_PAYMENT", details: "Applied loan payment of UGX 500,000 to LN-2023-028", category: "loan", ipAddress: "192.168.1.20" },
];

const categoryStyles = {
  member: "bg-accent/10 text-accent",
  transaction: "bg-success/10 text-success",
  loan: "bg-warning/10 text-warning",
  system: "bg-primary/10 text-primary",
  auth: "bg-info/10 text-info",
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredLogs = mockAuditLog.filter((entry) => {
    const matchesSearch =
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Audit Log"
        description="Track all system activities and changes"
      >
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, action, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="transaction">Transaction</SelectItem>
            <SelectItem value="loan">Loan</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="auth">Authentication</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Date Range
        </Button>
      </div>

      {/* Log Entries */}
      <div className="card-elevated divide-y divide-border">
        {filteredLogs.map((entry) => (
          <div key={entry.id} className="p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-foreground">{entry.user}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", categoryStyles[entry.category])}>
                    {entry.category}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-1">
                  <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded mr-2">
                    {entry.action}
                  </span>
                  {entry.details}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                  <span>IP: {entry.ipAddress}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination hint */}
      <div className="mt-4 text-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
