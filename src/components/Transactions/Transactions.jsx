import { ListTree } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';

export default function Transactions() {
  return (
    <div>
      <PageHeader title="Activity" subtitle="Every coin in and out." />
      <Empty
        icon={ListTree}
        title="No transactions yet"
        message="Search, filter, bulk-edit, tag, and recur. CSV import lands in the next phase."
      />
    </div>
  );
}
