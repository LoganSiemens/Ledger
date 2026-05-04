import { Wallet } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';

export default function Accounts() {
  return (
    <div>
      <PageHeader title="Accounts" subtitle="Where your money sits." />
      <Empty
        icon={Wallet}
        title="No accounts yet"
        message="Group cash, investments, and debts. See balance history per account and subtotals by group."
      />
    </div>
  );
}
