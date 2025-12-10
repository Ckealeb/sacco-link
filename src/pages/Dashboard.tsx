import { Users, Wallet, PiggyBank, TrendingUp, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { LoanSummary } from "@/components/dashboard/LoanSummary";
import { TrendCharts } from "@/components/dashboard/TrendCharts";

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your SACCO's financial health"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">January 2024</span>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value="248"
          change="+12 this month"
          changeType="positive"
          icon={Users}
          iconColor="accent"
        />
        <StatCard
          title="Cash in Bank"
          value="UGX 45.2M"
          change="+8.5% from last month"
          changeType="positive"
          icon={PiggyBank}
          iconColor="success"
        />
        <StatCard
          title="Outstanding Loans"
          value="UGX 125M"
          change="45 active loans"
          changeType="neutral"
          icon={Wallet}
          iconColor="warning"
        />
        <StatCard
          title="Weekly Collections"
          value="UGX 3.8M"
          change="+15% vs last week"
          changeType="positive"
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
