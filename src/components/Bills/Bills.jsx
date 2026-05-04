import { Receipt } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';

export default function Bills() {
  return (
    <div>
      <PageHeader title="Bills" subtitle="What's due, and when." />
      <Empty
        icon={Receipt}
        title="No bills yet"
        message="Track recurring bills, mark them paid, and see the next 30 days with a running total."
      />
    </div>
  );
}
