import { Target } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';

export default function Goals() {
  return (
    <div>
      <PageHeader title="Goals" subtitle="What you're saving toward." />
      <Empty
        icon={Target}
        title="No goals yet"
        message="Set targets with dates and we'll suggest a monthly contribution and tell you if you're on track."
      />
    </div>
  );
}
