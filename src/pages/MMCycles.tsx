import { useState } from "react";
import { Search, Plus, Users, Calendar, CircleDollarSign } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MMCycle {
  id: string;
  name: string;
  members: number;
  contributionAmount: number;
  frequency: "weekly" | "monthly";
  currentRound: number;
  totalRounds: number;
  nextPayoutDate: string;
  nextPayoutMember: string;
  totalCollected: number;
  status: "active" | "completed" | "paused";
}

const mockCycles: MMCycle[] = [
  {
    id: "1",
    name: "Women's Group A",
    members: 12,
    contributionAmount: 100000,
    frequency: "monthly",
    currentRound: 5,
    totalRounds: 12,
    nextPayoutDate: "2024-02-01",
    nextPayoutMember: "Grace Auma",
    totalCollected: 6000000,
    status: "active",
  },
  {
    id: "2",
    name: "Savings Circle B",
    members: 10,
    contributionAmount: 200000,
    frequency: "monthly",
    currentRound: 8,
    totalRounds: 10,
    nextPayoutDate: "2024-01-25",
    nextPayoutMember: "John Okello",
    totalCollected: 16000000,
    status: "active",
  },
  {
    id: "3",
    name: "Weekly Savers",
    members: 8,
    contributionAmount: 50000,
    frequency: "weekly",
    currentRound: 3,
    totalRounds: 8,
    nextPayoutDate: "2024-01-20",
    nextPayoutMember: "Mary Nalwanga",
    totalCollected: 1200000,
    status: "active",
  },
  {
    id: "4",
    name: "Youth Group 2023",
    members: 15,
    contributionAmount: 150000,
    frequency: "monthly",
    currentRound: 15,
    totalRounds: 15,
    nextPayoutDate: "-",
    nextPayoutMember: "-",
    totalCollected: 33750000,
    status: "completed",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusStyles = {
  active: "badge-success",
  completed: "bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-medium",
  paused: "badge-warning",
};

export default function MMCycles() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCycles = mockCycles.filter((cycle) =>
    cycle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="MM Cycles"
        description="Manage merry-go-round groups and payouts"
      >
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Cycle
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cycles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Active Cycles</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {mockCycles.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {mockCycles.reduce((sum, c) => sum + c.members, 0)}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Collected</p>
          <p className="text-2xl font-semibold text-success mt-1">
            {formatCurrency(mockCycles.reduce((sum, c) => sum + c.totalCollected, 0))}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Upcoming Payouts</p>
          <p className="text-2xl font-semibold text-info mt-1">
            {mockCycles.filter((c) => c.status === "active").length}
          </p>
        </div>
      </div>

      {/* Cycle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCycles.map((cycle) => (
          <div key={cycle.id} className="card-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{cycle.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{cycle.frequency} contributions</p>
              </div>
              <span className={statusStyles[cycle.status]}>
                {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{cycle.members} members</span>
              </div>
              <div className="flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{formatCurrency(cycle.contributionAmount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Round {cycle.currentRound}/{cycle.totalRounds}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {Math.round((cycle.currentRound / cycle.totalRounds) * 100)}%
                </span>
              </div>
              <Progress value={(cycle.currentRound / cycle.totalRounds) * 100} className="h-2" />
            </div>

            {cycle.status === "active" && (
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Next Payout</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cycle.nextPayoutMember}</span>
                  <span className="text-sm text-muted-foreground">{cycle.nextPayoutDate}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(cycle.totalCollected)}</p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
