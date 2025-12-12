import { Users, Wallet, PiggyBank, TrendingUp, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { LoanSummary } from "@/components/dashboard/LoanSummary";
import { TrendCharts } from "@/components/dashboard/TrendCharts";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { format } from "date-fns";

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `UGX ${(amount / 1000).toFixed(0)}K`;
  return `UGX ${amount.toLocaleString()}`;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const currentMonth = format(new Date(), "MMMM yyyy");

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your SACCO's financial health"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{currentMonth}</span>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={isLoading ? "..." : String(stats?.totalMembers || 0)}
          change={isLoading ? "" : `+${stats?.newMembersThisMonth || 0} this month`}
          changeType="positive"
          icon={Users}
          iconColor="accent"
        />
        <StatCard
          title="Cash in Bank"
          value={isLoading ? "..." : formatCurrency(stats?.cashInBank || 0)}
          change={`${stats?.totalSavings ? formatCurrency(stats.totalSavings) : "UGX 0"} in savings`}
          changeType="positive"
          icon={PiggyBank}
          iconColor="success"
        />
        <StatCard
          title="Outstanding Loans"
          value={isLoading ? "..." : formatCurrency(stats?.totalLoans || 0)}
          change={`${stats?.activeLoansCount || 0} active loans`}
          changeType="neutral"
          icon={Wallet}
          iconColor="warning"
        />
        <StatCard
          title="Weekly Collections"
          value={isLoading ? "..." : formatCurrency(stats?.weeklyCollections || 0)}
          change={
            stats?.weeklyCollectionsChange 
              ? `${stats.weeklyCollectionsChange >= 0 ? "+" : ""}${stats.weeklyCollectionsChange.toFixed(0)}% vs last week`
              : "No data last week"
          }
          changeType={stats?.weeklyCollectionsChange && stats.weeklyCollectionsChange >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
          iconColor="info"
        />
      </div>

      {/* Trend Charts */}
      <TrendCharts />

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <LoanSummary />
        </div>
      </div>
    </div>
  );
}
