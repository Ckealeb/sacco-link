import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Account {
  id: string;
  member_id: string;
  account_type: "shares" | "savings" | "fixed_deposit" | "loan" | "mm" | "development_fund";
  account_no: string;
  balance: number;
  is_active: boolean;
  opened_date: string;
  closed_date: string | null;
}

export interface Transaction {
  id: string;
  account_id: string;
  member_id: string;
  txn_date: string;
  amount: number;
  direction: "debit" | "credit";
  narration: string | null;
  reference_no: string | null;
  balance_after: number;
  created_at: string;
  account?: Account;
}

export interface Member {
  id: string;
  member_no: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  shares_balance: number;
  savings_balance: number;
  loan_balance: number;
  status: "active" | "inactive" | "suspended";
  joined_date: string;
}

// Banking rules for balance calculation
// Asset accounts (savings, shares, fixed_deposit, mm, development_fund): credits increase, debits decrease
// Liability accounts (loan): debits increase (disbursement), credits decrease (repayment)
export function calculateAccountBalance(transactions: Transaction[], accountType: string): number {
  const isLiabilityAccount = accountType === "loan";
  
  return transactions.reduce((balance, txn) => {
    if (isLiabilityAccount) {
      // For loans: debit = disbursement (increases outstanding), credit = repayment (decreases outstanding)
      return txn.direction === "debit" ? balance + txn.amount : balance - txn.amount;
    } else {
      // For asset accounts: credit = deposit (increases), debit = withdrawal (decreases)
      return txn.direction === "credit" ? balance + txn.amount : balance - txn.amount;
    }
  }, 0);
}

export interface AccountWithCalculatedBalance extends Account {
  calculatedBalance: number;
  transactionCount: number;
}

export function useMemberDetail(memberId: string | undefined) {
  const [member, setMember] = useState<Member | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    if (!memberId) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch member
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("*")
          .eq("id", memberId)
          .maybeSingle();

        if (memberError) throw memberError;
        setMember(memberData);

        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from("accounts")
          .select("*")
          .eq("member_id", memberId)
          .order("account_type");

        if (accountsError) throw accountsError;
        setAccounts((accountsData as Account[]) || []);

        // Fetch transactions with account info
        const { data: txnData, error: txnError } = await supabase
          .from("transactions")
          .select("*, account:accounts(*)")
          .eq("member_id", memberId)
          .order("txn_date", { ascending: false })
          .order("created_at", { ascending: false });

        if (txnError) throw txnError;
        setTransactions((txnData as Transaction[]) || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [memberId, refreshKey]);

  // Calculate balances per account using banking rules
  const accountsWithBalances = useMemo((): AccountWithCalculatedBalance[] => {
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => t.account_id === account.id);
      const calculatedBalance = calculateAccountBalance(accountTransactions, account.account_type);
      return {
        ...account,
        calculatedBalance,
        transactionCount: accountTransactions.length,
      };
    });
  }, [accounts, transactions]);

  // Get transactions for a specific account type
  const getTransactionsByAccountType = (accountType: string): Transaction[] => {
    return transactions.filter(t => t.account?.account_type === accountType);
  };

  // Calculate total portfolio value (assets - liabilities)
  const portfolioSummary = useMemo(() => {
    const totals = {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
    };

    accountsWithBalances.forEach(account => {
      if (account.account_type === "loan") {
        totals.totalLiabilities += Math.abs(account.calculatedBalance);
      } else {
        totals.totalAssets += account.calculatedBalance;
      }
    });

    totals.netWorth = totals.totalAssets - totals.totalLiabilities;
    return totals;
  }, [accountsWithBalances]);

  return { 
    member, 
    accounts: accountsWithBalances, 
    transactions, 
    loading, 
    error, 
    refetch,
    getTransactionsByAccountType,
    portfolioSummary,
  };
}

export async function createAccount(memberId: string, accountType: Account["account_type"]) {
  const { data, error } = await supabase
    .from("accounts")
    .insert([{ member_id: memberId, account_type: accountType, account_no: "" }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTransaction(
  accountId: string,
  memberId: string,
  amount: number,
  direction: "debit" | "credit",
  narration: string,
  currentBalance: number
) {
  const balanceAfter = direction === "credit" 
    ? currentBalance + amount 
    : currentBalance - amount;

  const { data, error } = await supabase
    .from("transactions")
    .insert([{
      account_id: accountId,
      member_id: memberId,
      amount,
      direction,
      narration,
      balance_after: balanceAfter,
    }])
    .select()
    .single();

  if (error) throw error;

  // Update account balance
  const { error: updateError } = await supabase
    .from("accounts")
    .update({ balance: balanceAfter })
    .eq("id", accountId);

  if (updateError) throw updateError;

  return data;
}
