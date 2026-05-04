import { useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/common/ErrorBoundary';
import Dashboard from './components/Dashboard/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Accounts from './components/Accounts/Accounts';
import Transactions from './components/Transactions/Transactions';
import Goals from './components/Goals/Goals';
import Bills from './components/Bills/Bills';
import Settings from './components/Settings/Settings';
import Unlock from './components/Unlock/Unlock';
import { useStorage } from './hooks/useStorage';
import { useApiKey } from './hooks/useApiKey';

const TABS = {
  dashboard: Dashboard,
  calendar: Calendar,
  transactions: Transactions,
  accounts: Accounts,
  goals: Goals,
  bills: Bills,
  settings: Settings,
};

export default function App() {
  const [tab, setTab] = useStorage('ui:tab', 'dashboard');
  const [apiKey] = useApiKey();
  const Active = TABS[tab] || Dashboard;

  useEffect(() => {
    document.title = `Ledger · ${tab[0].toUpperCase()}${tab.slice(1)}`;
  }, [tab]);

  if (!apiKey) {
    return (
      <ErrorBoundary>
        <Unlock />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell tab={tab} onChange={setTab}>
        <ErrorBoundary>
          <Active />
        </ErrorBoundary>
      </AppShell>
    </ErrorBoundary>
  );
}
