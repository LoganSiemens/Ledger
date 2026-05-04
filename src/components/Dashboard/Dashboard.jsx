import { Sparkles } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Good evening"
        subtitle="A quiet read on where your money lives."
      />
      <Empty
        icon={Sparkles}
        title="Nothing to show yet"
        message="Once you add accounts and transactions, your monthly summary, cash flow, and budget progress will live here."
      />
    </div>
  );
}
