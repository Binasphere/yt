import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api, Balances, POLL_INTERVAL, Profile, refreshBridge, Transaction } from '../services';

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

  /**
   * Reads the account.
   *
   * `quiet` is what the poll uses: a failed background read leaves the last
   * good numbers on screen rather than replacing them with an error banner the
   * next tick would clear anyway.
   */
  const load = useCallback(async (quiet: boolean) => {
    if (!quiet) setError(null);
    refreshBridge();

    try {
      const [p, b, t] = await Promise.all([
        api.getProfile(),
        api.getBalances(),
        api.getTransactions(),
      ]);
      setProfile(p);
      setBalances(b);
      setTransactions(t);
      setError(null);
    } catch (e) {
      if (!quiet) setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(false), [load]);

  useEffect(() => {
    void load(false);
  }, [load]);

  /**
   * The balance moves because of something happening on the *other* screen —
   * a deposit taken by the trading terminal — so it has to arrive without
   * anyone touching this one. Polling stops while the app is backgrounded, and
   * a return to the foreground reads immediately rather than waiting out the
   * remainder of a tick.
   */
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') void loadRef.current(true);
    }, POLL_INTERVAL);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void loadRef.current(true);
    });

    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);

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
