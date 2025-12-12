import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, subWeeks, format } from "date-fns";

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalSavings: number;
  totalShares: number;
  totalLoans: number;
  cashInBank: number;
  weeklyCollections: number;
  weeklyCollectionsChange: number;
  activeLoansCount: number;
}

export interface WeeklyTrendData {
  week: string;
  collections: number;
  loans: number;
  cashInBank: number;
}

export interface RecentTransaction {
  id: string;
  memberName: string;
  memberNo: string;
  direction: "credit" | "debit";
  amount: number;
  accountType: string;
  date: string;
  narration: string | null;
}

export interface LoanSummaryData {
  totalOutstanding: number;
  activeLoans: number;
  overdueLoans: number;
  disbursedThisMonth: number;
  repaymentsThisMonth: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Get member counts
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id, status, created_at");

      if (membersError) throw membersError;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalMembers = members?.length || 0;
      const activeMembers = members?.filter(m => m.status === "active").length || 0;
      const newMembersThisMonth = members?.filter(m => 
        new Date(m.created_at) >= startOfMonth
      ).length || 0;

      // Get account balances
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("account_type, balance, is_active");

      if (accountsError) throw accountsError;

      const activeAccounts = accounts?.filter(a => a.is_active) || [];
      
      const totalSavings = activeAccounts
        .filter(a => a.account_type === "savings")
        .reduce((sum, a) => sum + Number(a.balance), 0);
      
      const totalShares = activeAccounts
        .filter(a => a.account_type === "shares")
        .reduce((sum, a) => sum + Number(a.balance), 0);
      
      const totalLoans = activeAccounts
        .filter(a => a.account_type === "loan")
        .reduce((sum, a) => sum + Number(a.balance), 0);

      const activeLoansCount = activeAccounts
        .filter(a => a.account_type === "loan" && Number(a.balance) > 0).length;

      // Cash in bank = total deposits (savings + shares + fixed_deposit + development_fund) - outstanding loans
      const totalDeposits = activeAccounts
        .filter(a => ["savings", "shares", "fixed_deposit", "development_fund"].includes(a.account_type))
        .reduce((sum, a) => sum + Number(a.balance), 0);
      
      const cashInBank = totalDeposits - totalLoans;

      // Get weekly collections (credits this week)
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = subWeeks(thisWeekStart, 1);

      const { data: thisWeekTxns, error: thisWeekError } = await supabase
        .from("transactions")
        .select("amount, direction")
        .gte("txn_date", format(thisWeekStart, "yyyy-MM-dd"))
        .eq("direction", "credit");

      if (thisWeekError) throw thisWeekError;

      const { data: lastWeekTxns, error: lastWeekError } = await supabase
        .from("transactions")
        .select("amount, direction")
        .gte("txn_date", format(lastWeekStart, "yyyy-MM-dd"))
        .lt("txn_date", format(thisWeekStart, "yyyy-MM-dd"))
        .eq("direction", "credit");

      if (lastWeekError) throw lastWeekError;

      const weeklyCollections = thisWeekTxns?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const lastWeekCollections = lastWeekTxns?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const weeklyCollectionsChange = lastWeekCollections > 0 
        ? ((weeklyCollections - lastWeekCollections) / lastWeekCollections) * 100 
        : 0;

      return {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        totalSavings,
        totalShares,
        totalLoans,
        cashInBank,
        weeklyCollections,
        weeklyCollectionsChange,
        activeLoansCount,
      };
    },
  });
}

export function useWeeklyTrends() {
  return useQuery({
    queryKey: ["weekly-trends"],
    queryFn: async (): Promise<WeeklyTrendData[]> => {
      const now = new Date();
      const weeks: WeeklyTrendData[] = [];

      for (let i = 5; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

        // Get collections for this week
        const { data: collections } = await supabase
          .from("transactions")
          .select("amount")
          .gte("txn_date", format(weekStart, "yyyy-MM-dd"))
          .lt("txn_date", format(weekEnd, "yyyy-MM-dd"))
          .eq("direction", "credit");

        // Get loan balances as of week end
        const { data: loanAccounts } = await supabase
          .from("accounts")
          .select("balance")
          .eq("account_type", "loan")
          .eq("is_active", true);

        // Get deposit balances as of week end
        const { data: depositAccounts } = await supabase
          .from("accounts")
          .select("balance, account_type")
          .in("account_type", ["savings", "shares", "fixed_deposit", "development_fund"])
          .eq("is_active", true);

        const weekCollections = collections?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const totalLoans = loanAccounts?.reduce((sum, a) => sum + Number(a.balance), 0) || 0;
        const totalDeposits = depositAccounts?.reduce((sum, a) => sum + Number(a.balance), 0) || 0;

        weeks.push({
          week: `W${6 - i}`,
          collections: weekCollections,
          loans: totalLoans,
          cashInBank: totalDeposits - totalLoans,
        });
      }

      return weeks;
    },
  });
}

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: ["recent-transactions", limit],
    queryFn: async (): Promise<RecentTransaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          direction,
          txn_date,
          narration,
          account_id,
          member_id
        `)
        .order("txn_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get member and account details
      const memberIds = [...new Set(data?.map(t => t.member_id) || [])];
      const accountIds = [...new Set(data?.map(t => t.account_id) || [])];

      const { data: members } = await supabase
        .from("members")
        .select("id, first_name, last_name, member_no")
        .in("id", memberIds);

      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, account_type")
        .in("id", accountIds);

      const memberMap = new Map(members?.map(m => [m.id, m]) || []);
      const accountMap = new Map(accounts?.map(a => [a.id, a]) || []);

      return (data || []).map(txn => {
        const member = memberMap.get(txn.member_id);
        const account = accountMap.get(txn.account_id);
        
        return {
          id: txn.id,
          memberName: member ? `${member.first_name} ${member.last_name}` : "Unknown",
          memberNo: member?.member_no || "",
          direction: txn.direction as "credit" | "debit",
          amount: Number(txn.amount),
          accountType: account?.account_type || "unknown",
          date: txn.txn_date,
          narration: txn.narration,
        };
      });
    },
  });
}

export function useLoanSummary() {
  return useQuery({
    queryKey: ["loan-summary"],
    queryFn: async (): Promise<LoanSummaryData> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get all loan accounts
      const { data: loanAccounts, error: loanError } = await supabase
        .from("accounts")
        .select("id, balance, is_active")
        .eq("account_type", "loan");

      if (loanError) throw loanError;

      const activeLoans = loanAccounts?.filter(a => a.is_active && Number(a.balance) > 0).length || 0;
      const totalOutstanding = loanAccounts
        ?.filter(a => a.is_active)
        .reduce((sum, a) => sum + Number(a.balance), 0) || 0;

      // Get loan disbursements this month (debits on loan accounts)
      const loanAccountIds = loanAccounts?.map(a => a.id) || [];
      
      const { data: disbursements } = await supabase
        .from("transactions")
        .select("amount")
        .in("account_id", loanAccountIds)
        .eq("direction", "debit")
        .gte("txn_date", format(startOfMonth, "yyyy-MM-dd"));

      const { data: repayments } = await supabase
        .from("transactions")
        .select("amount")
        .in("account_id", loanAccountIds)
        .eq("direction", "credit")
        .gte("txn_date", format(startOfMonth, "yyyy-MM-dd"));

      const disbursedThisMonth = disbursements?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const repaymentsThisMonth = repayments?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        totalOutstanding,
        activeLoans,
        overdueLoans: 0, // Would need due date tracking
        disbursedThisMonth,
        repaymentsThisMonth,
      };
    },
  });
}
