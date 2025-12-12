import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];
type TransactionDirection = Database["public"]["Enums"]["transaction_direction"];

export interface TransactionWithDetails {
  id: string;
  date: string;
  memberName: string;
  memberNo: string;
  accountType: string;
  direction: TransactionDirection;
  amount: number;
  narration: string | null;
  reference: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface TransactionFilters {
  searchQuery?: string;
  accountType?: string;
  direction?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface MemberOption {
  id: string;
  memberNo: string;
  fullName: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async (): Promise<TransactionWithDetails[]> => {
      let query = supabase
        .from("transactions")
        .select(`
          id,
          txn_date,
          amount,
          direction,
          narration,
          reference_no,
          balance_after,
          created_at,
          account_id,
          member_id
        `)
        .order("txn_date", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.direction && filters.direction !== "all") {
        query = query.eq("direction", filters.direction as TransactionDirection);
      }
      if (filters.dateFrom) {
        query = query.gte("txn_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("txn_date", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Get member and account details
      const memberIds = [...new Set(data.map(t => t.member_id))];
      const accountIds = [...new Set(data.map(t => t.account_id))];

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

      let transactions = data.map(txn => {
        const member = memberMap.get(txn.member_id);
        const account = accountMap.get(txn.account_id);
        
        return {
          id: txn.id,
          date: txn.txn_date,
          memberName: member ? `${member.first_name} ${member.last_name}` : "Unknown",
          memberNo: member?.member_no || "",
          accountType: account?.account_type || "unknown",
          direction: txn.direction,
          amount: Number(txn.amount),
          narration: txn.narration,
          reference: txn.reference_no,
          balanceAfter: Number(txn.balance_after),
          createdAt: txn.created_at,
        };
      });

      // Apply client-side filters
      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        transactions = transactions.filter(t =>
          t.memberName.toLowerCase().includes(search) ||
          t.memberNo.toLowerCase().includes(search) ||
          (t.reference && t.reference.toLowerCase().includes(search)) ||
          (t.narration && t.narration.toLowerCase().includes(search))
        );
      }

      if (filters.accountType && filters.accountType !== "all") {
        transactions = transactions.filter(t => t.accountType === filters.accountType);
      }

      if (filters.minAmount) {
        transactions = transactions.filter(t => t.amount >= filters.minAmount!);
      }

      if (filters.maxAmount) {
        transactions = transactions.filter(t => t.amount <= filters.maxAmount!);
      }

      return transactions;
    },
  });
}

export function useMembersForSelect() {
  return useQuery({
    queryKey: ["members-select"],
    queryFn: async (): Promise<MemberOption[]> => {
      const { data, error } = await supabase
        .from("members")
        .select("id, member_no, first_name, last_name")
        .eq("status", "active")
        .order("member_no");

      if (error) throw error;

      return (data || []).map(m => ({
        id: m.id,
        memberNo: m.member_no,
        fullName: `${m.first_name} ${m.last_name}`,
      }));
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      memberId: string;
      accountType: AccountType;
      direction: TransactionDirection;
      amount: number;
      narration?: string;
    }) => {
      const { memberId, accountType, direction, amount, narration } = params;

      // Get or create account
      let { data: account } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("member_id", memberId)
        .eq("account_type", accountType)
        .maybeSingle();

      if (!account) {
        const { data: newAccount, error: createError } = await supabase
          .from("accounts")
          .insert({
            member_id: memberId,
            account_type: accountType,
            account_no: "", // Will be auto-generated by trigger
            balance: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        account = newAccount;
      }

      // Calculate new balance based on account type and direction
      const currentBalance = Number(account.balance);
      let newBalance: number;

      // Asset accounts (loans): debit increases, credit decreases
      // Liability accounts (savings, shares, etc.): credit increases, debit decreases
      const isAssetAccount = accountType === "loan";
      
      if (isAssetAccount) {
        newBalance = direction === "debit" 
          ? currentBalance + amount 
          : currentBalance - amount;
      } else {
        newBalance = direction === "credit" 
          ? currentBalance + amount 
          : currentBalance - amount;
      }

      // Update account balance
      const { error: updateError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      if (updateError) throw updateError;

      // Create transaction
      const { data: transaction, error: txnError } = await supabase
        .from("transactions")
        .insert({
          member_id: memberId,
          account_id: account.id,
          amount,
          direction,
          balance_after: newBalance,
          narration: narration || null,
        })
        .select()
        .single();

      if (txnError) throw txnError;

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-trends"] });
      queryClient.invalidateQueries({ queryKey: ["loan-summary"] });
    },
  });
}

export function useTransactionStats(transactions: TransactionWithDetails[]) {
  const totalCredits = transactions
    .filter(t => t.direction === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = transactions
    .filter(t => t.direction === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalTransactions: transactions.length,
    totalCredits,
    totalDebits,
    netFlow: totalCredits - totalDebits,
  };
}
