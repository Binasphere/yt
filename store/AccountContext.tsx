import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, Balances, Profile, Transaction } from '../services';

type AccountState = {
  profile: Profile | null;
  balances: Balances | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  /** Global "hide my money" toggle, mirroring the eye icon on the balance card. */
  hidden: boolean;
  toggleHidden(): void;
  refresh(): Promise<void>;
};

const AccountContext = createContext<AccountState | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [p, b, t] = await Promise.all([
        api.getProfile(),
        api.getBalances(),
        api.getTransactions(),
      ]);
      setProfile(p);
      setBalances(b);
      setTransactions(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AccountState>(
    () => ({
      profile,
      balances,
      transactions,
      loading,
      error,
      hidden,
      toggleHidden: () => setHidden((h) => !h),
      refresh,
    }),
    [profile, balances, transactions, loading, error, hidden, refresh]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountState {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>');
  return ctx;
}
